import { AuditableEntity } from './common.types';
export interface PaymentProvider extends AuditableEntity {
    organizationId: string;
    providerCode: PaymentProviderCode;
    providerType: PaymentProviderType;
    displayName: string;
    credentials: any;
    settings: any;
    isActive: boolean;
    isDefault: boolean;
}
export declare enum PaymentProviderCode {
    ONELINK_IBFT = "1LINK",
    JAZZCASH = "JAZZCASH",
    EASYPAISA = "EASYPAISA",
    HBL_CONNECT = "HBL"
}
export declare enum PaymentProviderType {
    BANK_TRANSFER = "BANK_TRANSFER",
    MOBILE_WALLET = "MOBILE_WALLET",
    CARD_GATEWAY = "CARD_GATEWAY"
}
export interface PaymentIntent extends AuditableEntity {
    invoiceId: string;
    providerId: string;
    intentRef: string;
    amount: number;
    currency: string;
    paymentLink: string;
    expiresAt: Date;
    status: PaymentIntentStatus;
    metadata: any;
}
export declare enum PaymentIntentStatus {
    CREATED = "CREATED",
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED"
}
export interface PaymentTransaction extends AuditableEntity {
    intentId: string;
    transactionRef: string;
    providerRef: string;
    amount: number;
    status: PaymentTransactionStatus;
    processedAt: Date | null;
    rawResponse: any;
    failureReason: string | null;
}
export declare enum PaymentTransactionStatus {
    INITIATED = "INITIATED",
    PROCESSING = "PROCESSING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export interface CRMSyncLog extends AuditableEntity {
    syncType: CRMSyncType;
    startedAt: Date;
    completedAt: Date | null;
    status: SyncStatus;
    recordsProcessed: number;
    recordsSuccess: number;
    recordsFailed: number;
    errorLog: any;
}
export declare enum CRMSyncType {
    CUSTOMERS = "CUSTOMERS",
    CONTRACTS = "CONTRACTS",
    USAGE_EVENTS = "USAGE_EVENTS"
}
export declare enum SyncStatus {
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    PARTIAL = "PARTIAL"
}
