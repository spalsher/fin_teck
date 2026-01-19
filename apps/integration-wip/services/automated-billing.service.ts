import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { ICrmAdapter } from '../adapters/crm-adapter.interface';
import { InvoiceService } from '../../finance/services/invoice.service';
import { CustomerService } from '../../finance/services/customer.service';
import { MockCrmAdapter } from '../adapters/mock-crm.adapter';

export interface BillingRunResult {
  success: boolean;
  customersProcessed: number;
  invoicesCreated: number;
  errors: Array<{ customerId: string; error: string }>;
  totalAmount: number;
}

@Injectable()
export class AutomatedBillingService {
  private readonly logger = new Logger(AutomatedBillingService.name);

  constructor(
    private prisma: PrismaService,
    private crmAdapter: MockCrmAdapter,
    private invoiceService: InvoiceService,
    private customerService: CustomerService,
  ) {}

  async runBillingCycle(
    branchId: string,
    organizationId: string,
    periodStart: Date,
    periodEnd: Date,
    userId: string,
  ): Promise<BillingRunResult> {
    this.logger.log(
      `Starting automated billing cycle for period ${periodStart.toISOString()} to ${periodEnd.toISOString()}`,
    );

    const result: BillingRunResult = {
      success: true,
      customersProcessed: 0,
      invoicesCreated: 0,
      errors: [],
      totalAmount: 0,
    };

    try {
      // Step 1: Fetch customers from CRM
      const crmCustomers = await this.crmAdapter.getCustomers({ isActive: true });
      this.logger.log(`Fetched ${crmCustomers.length} customers from CRM`);

      // Step 2: Process each customer
      for (const crmCustomer of crmCustomers) {
        try {
          // Check if billing already ran for this period (idempotency)
          const existingBillingLog = await this.prisma.billingLog.findFirst({
            where: {
              externalCustomerId: crmCustomer.externalId,
              periodStart,
              periodEnd,
              status: 'SUCCESS',
            },
          });

          if (existingBillingLog) {
            this.logger.log(
              `Skipping customer ${crmCustomer.externalId} - already billed for this period`,
            );
            continue;
          }

          // Sync customer to ERP
          const erpCustomer = await this.syncCustomerToErp(
            crmCustomer,
            branchId,
            organizationId,
            userId,
          );

          // Fetch usage data
          const usageData = await this.crmAdapter.getUsageData(
            crmCustomer.externalId,
            periodStart,
            periodEnd,
          );

          if (usageData.length === 0) {
            this.logger.log(`No usage data for customer ${crmCustomer.externalId}`);
            continue;
          }

          // Create invoice
          const invoice = await this.createInvoiceFromUsage(
            erpCustomer.id,
            branchId,
            usageData,
            periodStart,
            periodEnd,
            userId,
          );

          // Log successful billing
          await this.prisma.billingLog.create({
            data: {
              externalCustomerId: crmCustomer.externalId,
              erpCustomerId: erpCustomer.id,
              invoiceId: invoice.id,
              periodStart,
              periodEnd,
              status: 'SUCCESS',
              amount: invoice.totalAmount,
              processedAt: new Date(),
              processedBy: userId,
            },
          });

          result.customersProcessed++;
          result.invoicesCreated++;
          result.totalAmount += Number(invoice.totalAmount);

          this.logger.log(
            `Successfully billed customer ${crmCustomer.name} - Invoice ${invoice.invoiceNo}`,
          );
        } catch (error) {
          this.logger.error(
            `Error processing customer ${crmCustomer.externalId}: ${error.message}`,
            error.stack,
          );

          result.errors.push({
            customerId: crmCustomer.externalId,
            error: error.message,
          });

          // Log failed billing attempt
          await this.prisma.billingLog
            .create({
              data: {
                externalCustomerId: crmCustomer.externalId,
                erpCustomerId: null,
                invoiceId: null,
                periodStart,
                periodEnd,
                status: 'FAILED',
                errorMessage: error.message,
                processedAt: new Date(),
                processedBy: userId,
              },
            })
            .catch((logError) => {
              this.logger.error(`Failed to log billing error: ${logError.message}`);
            });
        }
      }

      result.success = result.errors.length === 0;

      this.logger.log(
        `Billing cycle completed: ${result.customersProcessed} processed, ${result.invoicesCreated} invoices created, ${result.errors.length} errors`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Fatal error in billing cycle: ${error.message}`, error.stack);
      result.success = false;
      throw error;
    }
  }

  private async syncCustomerToErp(
    crmCustomer: any,
    branchId: string,
    organizationId: string,
    userId: string,
  ): Promise<any> {
    // Check if customer already exists in ERP
    const existingCustomer = await this.prisma.customer.findFirst({
      where: {
        branchId,
        externalId: crmCustomer.externalId,
        deletedAt: null,
      },
    });

    if (existingCustomer) {
      // Update existing customer
      return this.prisma.customer.update({
        where: { id: existingCustomer.id },
        data: {
          name: crmCustomer.name,
          taxId: crmCustomer.taxId,
          billingAddress: crmCustomer.address,
          updatedBy: userId,
        },
      });
    }

    // Create new customer
    // Generate customer code (simplified)
    const customerCode = `CRM-${crmCustomer.externalId}`;

    return this.prisma.customer.create({
      data: {
        branchId,
        customerCode,
        name: crmCustomer.name,
        taxId: crmCustomer.taxId,
        customerType: 'BUSINESS',
        billingAddress: crmCustomer.address,
        creditLimit: 0,
        paymentTermDays: 30,
        externalId: crmCustomer.externalId,
        externalSource: 'CRM',
        isActive: true,
        createdBy: userId,
        updatedBy: userId,
        customerContacts: {
          create: [
            {
              name: crmCustomer.name,
              email: crmCustomer.email,
              phone: crmCustomer.phone,
              isPrimary: true,
            },
          ],
        },
      },
    });
  }

  private async createInvoiceFromUsage(
    customerId: string,
    branchId: string,
    usageData: any[],
    periodStart: Date,
    periodEnd: Date,
    userId: string,
  ): Promise<any> {
    // Get or create service items for each service type
    const lines: Array<{
      itemId: string;
      description: string;
      quantity: number;
      unitPrice: number;
      uom: string;
      discount: number;
      taxRate: number;
    }> = [];

    for (const usage of usageData) {
      // Find or create item for this service type
      const item = await this.getOrCreateServiceItem(usage.serviceType, branchId, userId);

      lines.push({
        itemId: item.id,
        description: `${usage.serviceType} - ${periodStart.toLocaleDateString()} to ${periodEnd.toLocaleDateString()}`,
        quantity: usage.units,
        unitPrice: usage.amount / usage.units,
        uom: item.uom,
        discount: 0,
        taxRate: 0,
      });
    }

    // Create invoice through InvoiceService
    return this.invoiceService.create(
      branchId,
      {
        customerId,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        invoiceType: 'STANDARD',
        lines,
      },
      userId,
    );
  }

  private async getOrCreateServiceItem(serviceType: string, branchId: string, userId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { organizationId: true },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const itemCode = `SVC-${serviceType}`;

    let item = await this.prisma.item.findFirst({
      where: {
        organizationId: branch.organizationId,
        itemCode,
        deletedAt: null,
      },
    });

    if (!item) {
      // Create service item
      item = await this.prisma.item.create({
        data: {
          organizationId: branch.organizationId,
          itemCode,
          name: `${serviceType} Service`,
          description: `Automated billing for ${serviceType}`,
          itemType: 'SERVICE',
          uom: 'Unit',
          unitCost: 0,
          isActive: true,
          createdBy: userId,
          updatedBy: userId,
        },
      });
    }

    return item;
  }

  async getBillingHistory(
    filters?: {
      skip?: number;
      take?: number;
      periodStart?: Date;
      periodEnd?: Date;
      status?: string;
    },
  ) {
    const where: any = {};

    if (filters?.periodStart) {
      where.periodStart = { gte: filters.periodStart };
    }

    if (filters?.periodEnd) {
      where.periodEnd = { lte: filters.periodEnd };
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    const [logs, total] = await Promise.all([
      this.prisma.billingLog.findMany({
        where,
        skip: filters?.skip,
        take: filters?.take,
        orderBy: { processedAt: 'desc' },
      }),
      this.prisma.billingLog.count({ where }),
    ]);

    return {
      data: logs,
      total,
      page: filters?.skip ? Math.floor(filters.skip / (filters?.take || 10)) + 1 : 1,
      pageSize: filters?.take || 10,
    };
  }
}
