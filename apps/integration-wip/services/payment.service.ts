import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { MockPaymentProviderAdapter } from '../adapters/mock-payment-provider.adapter';
import {
  PaymentProvider,
  PaymentIntentStatus,
  PaymentWebhookData,
} from '../adapters/payment-provider.interface';
import { ReceiptService } from '../../finance/services/receipt.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private providers: Map<PaymentProvider, MockPaymentProviderAdapter> = new Map();

  constructor(
    private prisma: PrismaService,
    private receiptService: ReceiptService,
  ) {
    // Initialize mock providers
    this.providers.set(PaymentProvider.ONE_LINK, new MockPaymentProviderAdapter(PaymentProvider.ONE_LINK));
    this.providers.set(PaymentProvider.JAZZCASH, new MockPaymentProviderAdapter(PaymentProvider.JAZZCASH));
    this.providers.set(PaymentProvider.EASYPAISA, new MockPaymentProviderAdapter(PaymentProvider.EASYPAISA));
    this.providers.set(PaymentProvider.HBL, new MockPaymentProviderAdapter(PaymentProvider.HBL));
  }

  async createPaymentIntent(
    branchId: string,
    invoiceId: string,
    provider: PaymentProvider,
    userId: string,
  ) {
    // Validate invoice
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        branchId,
        deletedAt: null,
      },
      include: {
        customer: true,
        branch: {
          select: { organizationId: true },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.balanceAmount.toNumber() <= 0) {
      throw new BadRequestException('Invoice is fully paid');
    }

    // Get or create payment provider record
    let providerRecord = await this.prisma.paymentProvider.findFirst({
      where: {
        organizationId: invoice.branch.organizationId,
        providerCode: provider,
      },
    });

    if (!providerRecord) {
      // Create payment provider record (simplified)
      providerRecord = await this.prisma.paymentProvider.create({
        data: {
          organizationId: invoice.branch.organizationId,
          providerCode: provider,
          providerType: 'GATEWAY',
          displayName: provider,
          credentials: {},
          isActive: true,
        },
      });
    }

    // Get provider adapter
    const providerAdapter = this.providers.get(provider);
    if (!providerAdapter) {
      throw new BadRequestException(`Provider ${provider} not supported`);
    }

    // Create payment intent with provider
    const callbackUrl = `${process.env.APP_URL || 'http://localhost:3001'}/api/integration/payment/callback`;
    
    const paymentIntent = await providerAdapter.createPaymentIntent({
      amount: invoice.balanceAmount.toNumber(),
      currency: 'PKR',
      customerId: invoice.customerId,
      invoiceId: invoice.id,
      description: `Payment for Invoice ${invoice.invoiceNo}`,
      callbackUrl,
      metadata: {
        invoiceNo: invoice.invoiceNo,
        customerName: invoice.customer.name,
      },
    });

    // Store payment intent in database
    await this.prisma.paymentIntent.create({
      data: {
        intentRef: paymentIntent.id,
        providerId: providerRecord.id,
        invoiceId: invoice.id,
        customerId: invoice.customerId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        paymentLink: paymentIntent.paymentUrl || '',
        expiresAt: paymentIntent.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000),
        metadata: paymentIntent.metadata || {},
      },
    });

    return paymentIntent;
  }

  async getPaymentIntent(paymentIntentId: string) {
    const intent = await this.prisma.paymentIntent.findFirst({
      where: { intentRef: paymentIntentId },
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNo: true,
            totalAmount: true,
            balanceAmount: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        provider: true,
      },
    });

    if (!intent) {
      throw new NotFoundException('Payment intent not found');
    }

    return intent;
  }

  async getInvoicePaymentIntents(invoiceId: string) {
    return this.prisma.paymentIntent.findMany({
      where: { invoiceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancelPaymentIntent(paymentIntentId: string, userId: string) {
    const intent = await this.getPaymentIntent(paymentIntentId);

    if (intent.status !== 'PENDING' && intent.status !== 'CREATED') {
      throw new BadRequestException('Can only cancel pending payment intents');
    }

    // Cancel with provider
    const provider = this.providers.get(intent.provider.providerCode as PaymentProvider);
    if (provider) {
      await provider.cancelPaymentIntent(intent.intentRef);
    }

    // Update in database
    await this.prisma.paymentIntent.update({
      where: { id: intent.id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    });

    return { message: 'Payment intent cancelled' };
  }

  async processWebhook(
    provider: PaymentProvider,
    payload: any,
    signature?: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Processing webhook from ${provider}`);

    try {
      // Get provider adapter
      const providerAdapter = this.providers.get(provider);
      if (!providerAdapter) {
        throw new BadRequestException(`Provider ${provider} not supported`);
      }

      // Verify signature
      if (signature && !providerAdapter.verifyWebhookSignature(JSON.stringify(payload), signature)) {
        throw new BadRequestException('Invalid webhook signature');
      }

      // Parse webhook data
      const webhookData: PaymentWebhookData = providerAdapter.parseWebhookData(payload);

      // Get payment intent
      const intent = await this.prisma.paymentIntent.findFirst({
        where: { intentRef: webhookData.paymentIntentId },
        include: {
          invoice: {
            include: {
              branch: true,
            },
          },
        },
      });

      if (!intent) {
        throw new NotFoundException(`Payment intent ${webhookData.paymentIntentId} not found`);
      }

      // Check for duplicate processing (idempotency)
      const existingTransaction = await this.prisma.paymentTransaction.findFirst({
        where: { transactionRef: webhookData.transactionId },
      });

      if (existingTransaction) {
        this.logger.log(`Transaction ${webhookData.transactionId} already processed`);
        return { success: true, message: 'Transaction already processed' };
      }

      // Update payment intent status
      await this.prisma.paymentIntent.update({
        where: { id: intent.id },
        data: {
          status: webhookData.status,
          updatedAt: new Date(),
        },
      });

      // Create payment transaction record
      await this.prisma.paymentTransaction.create({
        data: {
          intentId: intent.id,
          transactionRef: webhookData.transactionId,
          providerRef: webhookData.transactionId,
          amount: webhookData.amount,
          status: webhookData.status,
          processedAt: webhookData.paidAt || new Date(),
          rawResponse: webhookData.metadata,
          failureReason: webhookData.failureReason,
        },
      });

      // If payment successful, auto-create receipt
      if (webhookData.status === PaymentIntentStatus.COMPLETED) {
        await this.createAutoReceipt(intent, webhookData);
      }

      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async createAutoReceipt(intent: any, webhookData: PaymentWebhookData) {
    try {
      // Check if receipt already exists for this payment
      const existingReceipt = await this.prisma.receipt.findFirst({
        where: {
          externalRef: webhookData.transactionId,
        },
      });

      if (existingReceipt) {
        this.logger.log(`Receipt already exists for transaction ${webhookData.transactionId}`);
        return;
      }

      // Create receipt through ReceiptService
      const receipt = await this.receiptService.create(
        intent.invoice.branchId,
        {
          customerId: intent.customerId,
          receiptDate: webhookData.paidAt || new Date(),
          paymentMethod: 'ONLINE',
          externalRef: webhookData.transactionId,
          notes: `Auto-generated from online payment`,
          lines: [
            {
              invoiceId: intent.invoiceId,
              amountApplied: webhookData.amount,
            },
          ],
        },
        'SYSTEM', // System user for auto-receipts
      );

      this.logger.log(
        `Auto-created receipt ${receipt.receiptNo} for payment ${webhookData.transactionId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to auto-create receipt: ${error.message}`, error.stack);
      // Don't throw - webhook processing succeeded even if receipt creation failed
    }
  }

  async getPaymentHistory(filters?: {
    skip?: number;
    take?: number;
    status?: string;
    provider?: string;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.provider) {
      where.provider = filters.provider;
    }

    const [intents, total] = await Promise.all([
      this.prisma.paymentIntent.findMany({
        where,
        skip: filters?.skip,
        take: filters?.take,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true },
          },
          invoice: {
            select: { id: true, invoiceNo: true, totalAmount: true },
          },
        },
      }),
      this.prisma.paymentIntent.count({ where }),
    ]);

    return {
      data: intents,
      total,
      page: filters?.skip ? Math.floor(filters.skip / (filters?.take || 10)) + 1 : 1,
      pageSize: filters?.take || 10,
    };
  }
}
