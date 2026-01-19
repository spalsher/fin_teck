import { Injectable, Logger } from '@nestjs/common';
import {
  IPaymentProvider,
  PaymentProvider,
  PaymentIntent,
  PaymentIntentStatus,
  PaymentWebhookData,
} from './payment-provider.interface';

@Injectable()
export class MockPaymentProviderAdapter implements IPaymentProvider {
  private readonly logger = new Logger(MockPaymentProviderAdapter.name);
  private mockPayments: Map<string, PaymentIntent> = new Map();

  constructor(private readonly provider: PaymentProvider = PaymentProvider.ONE_LINK) {}

  getProviderName(): PaymentProvider {
    return this.provider;
  }

  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    customerId: string;
    invoiceId?: string;
    description: string;
    callbackUrl: string;
    metadata?: Record<string, any>;
  }): Promise<PaymentIntent> {
    this.logger.log(`Creating payment intent for ${this.provider}: ${JSON.stringify(params)}`);

    // Simulate API delay
    await this.delay(200);

    const paymentIntent: PaymentIntent = {
      id: `PI-${this.provider}-${Date.now()}`,
      provider: this.provider,
      amount: params.amount,
      currency: params.currency,
      customerId: params.customerId,
      invoiceId: params.invoiceId,
      description: params.description,
      status: PaymentIntentStatus.PENDING,
      paymentUrl: `https://mock-${this.provider.toLowerCase()}.com/pay?intent=${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      metadata: params.metadata,
      createdAt: new Date(),
    };

    // Store in mock database
    this.mockPayments.set(paymentIntent.id, paymentIntent);

    // Simulate auto-completion for testing (30% success rate)
    setTimeout(() => {
      const stored = this.mockPayments.get(paymentIntent.id);
      if (stored && stored.status === PaymentIntentStatus.PENDING) {
        const random = Math.random();
        if (random < 0.3) {
          // 30% success
          stored.status = PaymentIntentStatus.COMPLETED;
          this.logger.log(`Payment ${paymentIntent.id} auto-completed (mock)`);
        } else if (random < 0.4) {
          // 10% fail
          stored.status = PaymentIntentStatus.FAILED;
          this.logger.log(`Payment ${paymentIntent.id} auto-failed (mock)`);
        }
        // 60% stays pending
      }
    }, 5000); // After 5 seconds

    return paymentIntent;
  }

  async getPaymentStatus(paymentIntentId: string): Promise<PaymentIntent> {
    this.logger.log(`Getting payment status for ${paymentIntentId}`);

    await this.delay(100);

    const payment = this.mockPayments.get(paymentIntentId);
    if (!payment) {
      throw new Error(`Payment intent ${paymentIntentId} not found`);
    }

    return payment;
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    this.logger.log(`Cancelling payment ${paymentIntentId}`);

    await this.delay(100);

    const payment = this.mockPayments.get(paymentIntentId);
    if (!payment) {
      throw new Error(`Payment intent ${paymentIntentId} not found`);
    }

    if (payment.status === PaymentIntentStatus.COMPLETED) {
      throw new Error('Cannot cancel completed payment');
    }

    payment.status = PaymentIntentStatus.CANCELLED;
    return payment;
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    // Mock verification - always return true for testing
    this.logger.log('Verifying webhook signature (mock - always valid)');
    return true;
  }

  parseWebhookData(payload: any): PaymentWebhookData {
    this.logger.log(`Parsing webhook data: ${JSON.stringify(payload)}`);

    // Mock webhook parser
    return {
      provider: this.provider,
      transactionId: payload.transactionId || `TXN-${Date.now()}`,
      paymentIntentId: payload.paymentIntentId,
      status: payload.status || PaymentIntentStatus.COMPLETED,
      amount: payload.amount,
      currency: payload.currency || 'PKR',
      paidAt: payload.paidAt ? new Date(payload.paidAt) : new Date(),
      failureReason: payload.failureReason,
      metadata: payload.metadata,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Helper method for testing - manually complete a payment
  async simulatePaymentCompletion(paymentIntentId: string): Promise<PaymentIntent> {
    const payment = this.mockPayments.get(paymentIntentId);
    if (payment) {
      payment.status = PaymentIntentStatus.COMPLETED;
      this.logger.log(`Payment ${paymentIntentId} manually completed (simulation)`);
    }
    return payment;
  }
}
