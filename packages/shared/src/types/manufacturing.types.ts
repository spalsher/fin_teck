import { AuditableEntity } from './common.types';

export interface BOM extends AuditableEntity {
  organizationId: string;
  bomCode: string;
  name: string;
  finishedItemId: string;
  outputQty: number;
  outputUom: string;
  status: BOMStatus;
  version: number;
  isActive: boolean;
}

export enum BOMStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  OBSOLETE = 'OBSOLETE',
}

export interface BOMLine extends AuditableEntity {
  bomId: string;
  componentItemId: string;
  quantity: number;
  uom: string;
  sequence: number;
  isOptional: boolean;
  notes: string | null;
}

export interface ProductionOrder extends AuditableEntity {
  branchId: string;
  orderNo: string;
  bomId: string;
  plannedQty: number;
  producedQty: number;
  plannedStart: Date;
  plannedEnd: Date;
  actualStart: Date | null;
  actualEnd: Date | null;
  status: ProductionStatus;
  warehouseId: string;
}

export enum ProductionStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface QCInspection extends AuditableEntity {
  productionOrderId: string;
  inspectionNo: string;
  inspectionDate: Date;
  inspectedBy: string;
  sampleSize: number;
  passedQty: number;
  failedQty: number;
  result: QCResult;
  checklistResults: any;
  notes: string | null;
}

export enum QCResult {
  PASS = 'PASS',
  FAIL = 'FAIL',
  CONDITIONAL = 'CONDITIONAL',
}
