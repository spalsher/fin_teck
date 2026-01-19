export interface CrmCustomer {
  externalId: string;
  name: string;
  email: string;
  phone?: string;
  taxId?: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  serviceTypes: string[]; // 'TRACKING', 'FLEET', 'DEVICE_SALES', etc.
}

export interface CrmContract {
  contractId: string;
  customerId: string;
  serviceType: string;
  startDate: Date;
  endDate?: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  billingRate: number;
  billingUnitType: 'DEVICE' | 'VEHICLE' | 'USER' | 'FIXED';
}

export interface CrmUsageData {
  customerId: string;
  contractId: string;
  periodStart: Date;
  periodEnd: Date;
  serviceType: string;
  units: number; // Number of devices, vehicles, etc.
  amount: number; // Calculated billing amount
}

export interface ICrmAdapter {
  /**
   * Fetch customers from CRM
   */
  getCustomers(filters?: { updatedAfter?: Date; isActive?: boolean }): Promise<CrmCustomer[]>;

  /**
   * Fetch a specific customer by external ID
   */
  getCustomer(externalId: string): Promise<CrmCustomer | null>;

  /**
   * Fetch active contracts for a customer
   */
  getCustomerContracts(customerId: string): Promise<CrmContract[]>;

  /**
   * Fetch usage data for billing period
   */
  getUsageData(customerId: string, periodStart: Date, periodEnd: Date): Promise<CrmUsageData[]>;

  /**
   * Test connection to CRM
   */
  testConnection(): Promise<{ success: boolean; message: string }>;
}
