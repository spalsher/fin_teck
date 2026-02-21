"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncStatus = exports.CRMSyncType = exports.PaymentTransactionStatus = exports.PaymentIntentStatus = exports.PaymentProviderType = exports.PaymentProviderCode = void 0;
var PaymentProviderCode;
(function (PaymentProviderCode) {
    PaymentProviderCode["ONELINK_IBFT"] = "1LINK";
    PaymentProviderCode["JAZZCASH"] = "JAZZCASH";
    PaymentProviderCode["EASYPAISA"] = "EASYPAISA";
    PaymentProviderCode["HBL_CONNECT"] = "HBL";
})(PaymentProviderCode || (exports.PaymentProviderCode = PaymentProviderCode = {}));
var PaymentProviderType;
(function (PaymentProviderType) {
    PaymentProviderType["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentProviderType["MOBILE_WALLET"] = "MOBILE_WALLET";
    PaymentProviderType["CARD_GATEWAY"] = "CARD_GATEWAY";
})(PaymentProviderType || (exports.PaymentProviderType = PaymentProviderType = {}));
var PaymentIntentStatus;
(function (PaymentIntentStatus) {
    PaymentIntentStatus["CREATED"] = "CREATED";
    PaymentIntentStatus["PENDING"] = "PENDING";
    PaymentIntentStatus["PROCESSING"] = "PROCESSING";
    PaymentIntentStatus["COMPLETED"] = "COMPLETED";
    PaymentIntentStatus["FAILED"] = "FAILED";
    PaymentIntentStatus["EXPIRED"] = "EXPIRED";
    PaymentIntentStatus["CANCELLED"] = "CANCELLED";
})(PaymentIntentStatus || (exports.PaymentIntentStatus = PaymentIntentStatus = {}));
var PaymentTransactionStatus;
(function (PaymentTransactionStatus) {
    PaymentTransactionStatus["INITIATED"] = "INITIATED";
    PaymentTransactionStatus["PROCESSING"] = "PROCESSING";
    PaymentTransactionStatus["SUCCESS"] = "SUCCESS";
    PaymentTransactionStatus["FAILED"] = "FAILED";
    PaymentTransactionStatus["REFUNDED"] = "REFUNDED";
})(PaymentTransactionStatus || (exports.PaymentTransactionStatus = PaymentTransactionStatus = {}));
var CRMSyncType;
(function (CRMSyncType) {
    CRMSyncType["CUSTOMERS"] = "CUSTOMERS";
    CRMSyncType["CONTRACTS"] = "CONTRACTS";
    CRMSyncType["USAGE_EVENTS"] = "USAGE_EVENTS";
})(CRMSyncType || (exports.CRMSyncType = CRMSyncType = {}));
var SyncStatus;
(function (SyncStatus) {
    SyncStatus["IN_PROGRESS"] = "IN_PROGRESS";
    SyncStatus["COMPLETED"] = "COMPLETED";
    SyncStatus["FAILED"] = "FAILED";
    SyncStatus["PARTIAL"] = "PARTIAL";
})(SyncStatus || (exports.SyncStatus = SyncStatus = {}));
//# sourceMappingURL=integration.types.js.map