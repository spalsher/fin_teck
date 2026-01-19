import { Injectable, Logger } from '@nestjs/common';
import { ICrmAdapter, CrmCustomer, CrmContract, CrmUsageData } from './crm-adapter.interface';

@Injectable()
export class MockCrmAdapter implements ICrmAdapter {
  private readonly logger = new Logger(MockCrmAdapter.name);

  // Mock data store
  private mockCustomers: CrmCustomer[] = [
    {
      externalId: 'CRM-CUST-001',
      name: 'ABC Logistics Ltd',
      email: 'billing@abclogistics.com',
      phone: '+92-300-1234567',
      taxId: 'TAX-ABC-001',
      address: {
        street: '123 Main Street',
        city: 'Karachi',
        state: 'Sindh',
        country: 'Pakistan',
        postalCode: '75500',
      },
      billingCycle: 'MONTHLY',
      serviceTypes: ['TRACKING', 'FLEET'],
    },
    {
      externalId: 'CRM-CUST-002',
      name: 'XYZ Transport Co',
      email: 'accounts@xyztransport.com',
      phone: '+92-321-9876543',
      taxId: 'TAX-XYZ-002',
      address: {
        street: '456 Industrial Area',
        city: 'Lahore',
        state: 'Punjab',
        country: 'Pakistan',
        postalCode: '54000',
      },
      billingCycle: 'MONTHLY',
      serviceTypes: ['TRACKING', 'DEVICE_SALES'],
    },
    {
      externalId: 'CRM-CUST-003',
      name: 'Premium Fleet Services',
      email: 'finance@premiumfleet.com',
      phone: '+92-333-5551234',
      taxId: 'TAX-PFS-003',
      address: {
        street: '789 Business District',
        city: 'Islamabad',
        state: 'ICT',
        country: 'Pakistan',
        postalCode: '44000',
      },
      billingCycle: 'QUARTERLY',
      serviceTypes: ['FLEET', 'SOFTWARE_LICENSE'],
    },
  ];

  private mockContracts: CrmContract[] = [
    {
      contractId: 'CONTRACT-001',
      customerId: 'CRM-CUST-001',
      serviceType: 'TRACKING',
      startDate: new Date('2025-01-01'),
      status: 'ACTIVE',
      billingRate: 500,
      billingUnitType: 'DEVICE',
    },
    {
      contractId: 'CONTRACT-002',
      customerId: 'CRM-CUST-001',
      serviceType: 'FLEET',
      startDate: new Date('2025-01-01'),
      status: 'ACTIVE',
      billingRate: 1000,
      billingUnitType: 'VEHICLE',
    },
    {
      contractId: 'CONTRACT-003',
      customerId: 'CRM-CUST-002',
      serviceType: 'TRACKING',
      startDate: new Date('2025-01-01'),
      status: 'ACTIVE',
      billingRate: 500,
      billingUnitType: 'DEVICE',
    },
    {
      contractId: 'CONTRACT-004',
      customerId: 'CRM-CUST-003',
      serviceType: 'FLEET',
      startDate: new Date('2025-01-01'),
      status: 'ACTIVE',
      billingRate: 1200,
      billingUnitType: 'VEHICLE',
    },
  ];

  async getCustomers(filters?: { updatedAfter?: Date; isActive?: boolean }): Promise<CrmCustomer[]> {
    this.logger.log(`Fetching customers from mock CRM with filters: ${JSON.stringify(filters)}`);
    
    // Simulate API delay
    await this.delay(100);
    
    return this.mockCustomers;
  }

  async getCustomer(externalId: string): Promise<CrmCustomer | null> {
    this.logger.log(`Fetching customer ${externalId} from mock CRM`);
    
    await this.delay(50);
    
    return this.mockCustomers.find((c) => c.externalId === externalId) || null;
  }

  async getCustomerContracts(customerId: string): Promise<CrmContract[]> {
    this.logger.log(`Fetching contracts for customer ${customerId}`);
    
    await this.delay(50);
    
    return this.mockContracts.filter((c) => c.customerId === customerId && c.status === 'ACTIVE');
  }

  async getUsageData(
    customerId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<CrmUsageData[]> {
    this.logger.log(
      `Fetching usage data for customer ${customerId} from ${periodStart} to ${periodEnd}`,
    );
    
    await this.delay(100);

    const contracts = await this.getCustomerContracts(customerId);
    
    // Generate mock usage data based on contracts
    return contracts.map((contract) => {
      // Simulate random usage
      const units = Math.floor(Math.random() * 20) + 10; // 10-30 units
      const amount = units * contract.billingRate;

      return {
        customerId,
        contractId: contract.contractId,
        periodStart,
        periodEnd,
        serviceType: contract.serviceType,
        units,
        amount,
      };
    });
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    this.logger.log('Testing CRM connection');
    
    await this.delay(200);
    
    return {
      success: true,
      message: 'Mock CRM connection successful',
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
