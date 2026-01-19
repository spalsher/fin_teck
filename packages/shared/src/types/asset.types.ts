import { AuditableEntity } from './common.types';

export interface Asset extends AuditableEntity {
  organizationId: string;
  branchId: string;
  assetCode: string;
  name: string;
  description: string | null;
  categoryId: string;
  acquisitionDate: Date;
  acquisitionCost: number;
  depreciationMethodId: string;
  usefulLife: number;
  salvageValue: number;
  status: AssetStatus;
}

export enum AssetStatus {
  ACTIVE = 'ACTIVE',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  DISPOSED = 'DISPOSED',
  RETIRED = 'RETIRED',
}

export interface AssetCategory extends AuditableEntity {
  organizationId: string;
  code: string;
  name: string;
  description: string | null;
  defaultDepreciationMethodId: string | null;
  defaultUsefulLife: number;
}

export interface DepreciationMethod extends AuditableEntity {
  organizationId: string;
  name: string;
  code: string;
  formula: DepreciationFormula;
  description: string | null;
}

export enum DepreciationFormula {
  STRAIGHT_LINE = 'STRAIGHT_LINE',
  DECLINING_BALANCE = 'DECLINING_BALANCE',
  DOUBLE_DECLINING = 'DOUBLE_DECLINING',
  UNITS_OF_PRODUCTION = 'UNITS_OF_PRODUCTION',
}
