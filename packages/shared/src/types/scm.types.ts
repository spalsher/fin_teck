import { AuditableEntity } from './common.types';

export interface Item extends AuditableEntity {
  organizationId: string;
  itemCode: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  itemType: ItemType;
  uom: string;
  unitCost: number;
  reorderLevel: number;
  reorderQty: number;
  isActive: boolean;
  isHarnessComponent: boolean;
}

export enum ItemType {
  FINISHED_GOOD = 'FINISHED_GOOD',
  RAW_MATERIAL = 'RAW_MATERIAL',
  COMPONENT = 'COMPONENT',
  CONSUMABLE = 'CONSUMABLE',
  SERVICE = 'SERVICE',
  DEVICE = 'DEVICE',
}

export interface Warehouse extends AuditableEntity {
  branchId: string;
  warehouseCode: string;
  name: string;
  address: any;
  isActive: boolean;
}

export interface StockLedger extends AuditableEntity {
  itemId: string;
  warehouseId: string;
  transactionDate: Date;
  transactionType: StockTransactionType;
  referenceNo: string;
  referenceType: string;
  qtyIn: number;
  qtyOut: number;
  balanceQty: number;
  unitCost: number;
  totalValue: number;
}

export enum StockTransactionType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  ADJUSTMENT_IN = 'ADJUSTMENT_IN',
  ADJUSTMENT_OUT = 'ADJUSTMENT_OUT',
  PRODUCTION_CONSUME = 'PRODUCTION_CONSUME',
  PRODUCTION_OUTPUT = 'PRODUCTION_OUTPUT',
}

export interface PurchaseOrder extends AuditableEntity {
  branchId: string;
  vendorId: string;
  orderNo: string;
  orderDate: Date;
  expectedDate: Date | null;
  totalAmount: number;
  status: POStatus;
}

export enum POStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

export interface GoodsReceipt extends AuditableEntity {
  purchaseOrderId: string;
  grnNo: string;
  receiptDate: Date;
  warehouseId: string;
  status: GRNStatus;
}

export enum GRNStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  CANCELLED = 'CANCELLED',
}
