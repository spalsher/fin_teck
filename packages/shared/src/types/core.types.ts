import { BaseEntity } from './common.types';

export interface Organization extends BaseEntity {
  name: string;
  code: string;
  taxId: string | null;
  address: Address;
  settings: OrganizationSettings;
  currency: string;
}

export interface Branch extends BaseEntity {
  organizationId: string;
  name: string;
  code: string;
  address: Address;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  isHeadOffice: boolean;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

export interface OrganizationSettings {
  fiscalYearStart: string; // MM-DD format
  defaultLanguage: string;
  timezone: string;
  dateFormat: string;
  numberFormat: {
    decimalSeparator: string;
    thousandsSeparator: string;
    decimals: number;
  };
}

export interface ServiceOffering extends BaseEntity {
  organizationId: string;
  code: string;
  name: string;
  serviceType: ServiceType;
  billingConfig: ServiceBillingConfig;
  isActive: boolean;
}

export enum ServiceType {
  ASSET_TRACKING = 'ASSET_TRACKING',
  FLEET_MANAGEMENT = 'FLEET_MANAGEMENT',
  DEVICE_SALES = 'DEVICE_SALES',
  INSTALLATION = 'INSTALLATION',
  MAINTENANCE = 'MAINTENANCE',
  SOFTWARE_LICENSE = 'SOFTWARE_LICENSE',
}

export interface ServiceBillingConfig {
  defaultRate: number;
  billingCycle: BillingCycle;
  usageBased: boolean;
  unitOfMeasure?: string;
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
  ONE_TIME = 'ONE_TIME',
  USAGE_BASED = 'USAGE_BASED',
}

export interface DocumentSequence extends BaseEntity {
  branchId: string;
  module: string;
  documentType: string;
  prefix: string;
  nextNumber: number;
  padding: number;
  suffix: string | null;
}
