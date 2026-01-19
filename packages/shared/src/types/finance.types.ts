import { AuditableEntity } from './common.types';
import { BillingCycle } from './core.types';

// Customer Types
export interface Customer extends AuditableEntity {
  branchId: string;
  customerCode: string;
  name: string;
  taxId: string | null;
  customerType: CustomerType;
  billingAddress: any;
  shippingAddress: any;
  creditLimit: number;
  paymentTermDays: number;
  billingPreference: BillingPreference;
  externalCrmId: string | null;
  isActive: boolean;
}

export enum CustomerType {
  CORPORATE = 'CORPORATE',
  INDIVIDUAL = 'INDIVIDUAL',
  GOVERNMENT = 'GOVERNMENT',
}

export enum BillingPreference {
  UNIFIED = 'UNIFIED',
  PER_SERVICE = 'PER_SERVICE',
  PER_CONTRACT = 'PER_CONTRACT',
}

export interface CustomerService extends AuditableEntity {
  customerId: string;
  serviceOfferingId: string;
  contractNo: string;
  startDate: Date;
  endDate: Date | null;
  billingCycle: BillingCycle;
  monthlyRate: number;
  usageConfig: any;
  status: ServiceStatus;
}

export enum ServiceStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

// Invoice Types
export interface Invoice extends AuditableEntity {
  branchId: string;
  customerId: string;
  customerServiceId: string | null;
  invoiceNo: string;
  invoiceDate: Date;
  dueDate: Date;
  invoiceType: InvoiceType;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  externalRef: string | null;
}

export enum InvoiceType {
  STANDARD = 'STANDARD',
  RECURRING = 'RECURRING',
  USAGE_BASED = 'USAGE_BASED',
  PROFORMA = 'PROFORMA',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  SENT = 'SENT',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export interface InvoiceLine extends AuditableEntity {
  invoiceId: string;
  lineNo: number;
  description: string;
  itemId: string | null;
  quantity: number;
  uom: string;
  unitPrice: number;
  discount: number;
  taxRate: number;
  lineTotal: number;
}

// GL Types
export interface ChartOfAccount extends AuditableEntity {
  organizationId: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  accountCategory: AccountCategory;
  parentId: string | null;
  level: number;
  isControlAccount: boolean;
  isActive: boolean;
  allowDirectPosting: boolean;
}

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export enum AccountCategory {
  CURRENT_ASSET = 'CURRENT_ASSET',
  FIXED_ASSET = 'FIXED_ASSET',
  CURRENT_LIABILITY = 'CURRENT_LIABILITY',
  LONG_TERM_LIABILITY = 'LONG_TERM_LIABILITY',
  SHARE_CAPITAL = 'SHARE_CAPITAL',
  RETAINED_EARNINGS = 'RETAINED_EARNINGS',
  SALES = 'SALES',
  COST_OF_SALES = 'COST_OF_SALES',
  OPERATING_EXPENSE = 'OPERATING_EXPENSE',
  OTHER_INCOME = 'OTHER_INCOME',
  OTHER_EXPENSE = 'OTHER_EXPENSE',
}

export interface JournalEntry extends AuditableEntity {
  branchId: string;
  fiscalPeriodId: string;
  journalNo: string;
  entryDate: Date;
  description: string;
  journalType: JournalType;
  source: JournalSource;
  sourceRef: string | null;
  totalDebit: number;
  totalCredit: number;
  status: JournalStatus;
  postedBy: string | null;
  postedAt: Date | null;
}

export enum JournalType {
  GENERAL = 'GENERAL',
  SALES = 'SALES',
  PURCHASE = 'PURCHASE',
  PAYMENT = 'PAYMENT',
  RECEIPT = 'RECEIPT',
  ADJUSTMENT = 'ADJUSTMENT',
}

export enum JournalSource {
  MANUAL = 'MANUAL',
  INVOICE = 'INVOICE',
  PAYMENT = 'PAYMENT',
  INVENTORY = 'INVENTORY',
  PAYROLL = 'PAYROLL',
  DEPRECIATION = 'DEPRECIATION',
}

export enum JournalStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  REVERSED = 'REVERSED',
}

export interface Receipt extends AuditableEntity {
  branchId: string;
  customerId: string;
  receiptNo: string;
  receiptDate: Date;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNo: string | null;
  bankAccountId: string | null;
  status: ReceiptStatus;
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHEQUE = 'CHEQUE',
  ONLINE = 'ONLINE',
  MOBILE_WALLET = 'MOBILE_WALLET',
}

export enum ReceiptStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  RECONCILED = 'RECONCILED',
  CANCELLED = 'CANCELLED',
}
