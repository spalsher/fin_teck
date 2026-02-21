"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptStatus = exports.PaymentMethod = exports.JournalStatus = exports.JournalSource = exports.JournalType = exports.AccountCategory = exports.AccountType = exports.InvoiceStatus = exports.InvoiceType = exports.ServiceStatus = exports.BillingPreference = exports.CustomerType = void 0;
var CustomerType;
(function (CustomerType) {
    CustomerType["CORPORATE"] = "CORPORATE";
    CustomerType["INDIVIDUAL"] = "INDIVIDUAL";
    CustomerType["GOVERNMENT"] = "GOVERNMENT";
})(CustomerType || (exports.CustomerType = CustomerType = {}));
var BillingPreference;
(function (BillingPreference) {
    BillingPreference["UNIFIED"] = "UNIFIED";
    BillingPreference["PER_SERVICE"] = "PER_SERVICE";
    BillingPreference["PER_CONTRACT"] = "PER_CONTRACT";
})(BillingPreference || (exports.BillingPreference = BillingPreference = {}));
var ServiceStatus;
(function (ServiceStatus) {
    ServiceStatus["ACTIVE"] = "ACTIVE";
    ServiceStatus["SUSPENDED"] = "SUSPENDED";
    ServiceStatus["EXPIRED"] = "EXPIRED";
    ServiceStatus["CANCELLED"] = "CANCELLED";
})(ServiceStatus || (exports.ServiceStatus = ServiceStatus = {}));
var InvoiceType;
(function (InvoiceType) {
    InvoiceType["STANDARD"] = "STANDARD";
    InvoiceType["RECURRING"] = "RECURRING";
    InvoiceType["USAGE_BASED"] = "USAGE_BASED";
    InvoiceType["PROFORMA"] = "PROFORMA";
})(InvoiceType || (exports.InvoiceType = InvoiceType = {}));
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "DRAFT";
    InvoiceStatus["PENDING"] = "PENDING";
    InvoiceStatus["SENT"] = "SENT";
    InvoiceStatus["PARTIALLY_PAID"] = "PARTIALLY_PAID";
    InvoiceStatus["PAID"] = "PAID";
    InvoiceStatus["OVERDUE"] = "OVERDUE";
    InvoiceStatus["CANCELLED"] = "CANCELLED";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
var AccountType;
(function (AccountType) {
    AccountType["ASSET"] = "ASSET";
    AccountType["LIABILITY"] = "LIABILITY";
    AccountType["EQUITY"] = "EQUITY";
    AccountType["REVENUE"] = "REVENUE";
    AccountType["EXPENSE"] = "EXPENSE";
})(AccountType || (exports.AccountType = AccountType = {}));
var AccountCategory;
(function (AccountCategory) {
    AccountCategory["CURRENT_ASSET"] = "CURRENT_ASSET";
    AccountCategory["FIXED_ASSET"] = "FIXED_ASSET";
    AccountCategory["CURRENT_LIABILITY"] = "CURRENT_LIABILITY";
    AccountCategory["LONG_TERM_LIABILITY"] = "LONG_TERM_LIABILITY";
    AccountCategory["SHARE_CAPITAL"] = "SHARE_CAPITAL";
    AccountCategory["RETAINED_EARNINGS"] = "RETAINED_EARNINGS";
    AccountCategory["SALES"] = "SALES";
    AccountCategory["COST_OF_SALES"] = "COST_OF_SALES";
    AccountCategory["OPERATING_EXPENSE"] = "OPERATING_EXPENSE";
    AccountCategory["OTHER_INCOME"] = "OTHER_INCOME";
    AccountCategory["OTHER_EXPENSE"] = "OTHER_EXPENSE";
})(AccountCategory || (exports.AccountCategory = AccountCategory = {}));
var JournalType;
(function (JournalType) {
    JournalType["GENERAL"] = "GENERAL";
    JournalType["SALES"] = "SALES";
    JournalType["PURCHASE"] = "PURCHASE";
    JournalType["PAYMENT"] = "PAYMENT";
    JournalType["RECEIPT"] = "RECEIPT";
    JournalType["ADJUSTMENT"] = "ADJUSTMENT";
})(JournalType || (exports.JournalType = JournalType = {}));
var JournalSource;
(function (JournalSource) {
    JournalSource["MANUAL"] = "MANUAL";
    JournalSource["INVOICE"] = "INVOICE";
    JournalSource["PAYMENT"] = "PAYMENT";
    JournalSource["INVENTORY"] = "INVENTORY";
    JournalSource["PAYROLL"] = "PAYROLL";
    JournalSource["DEPRECIATION"] = "DEPRECIATION";
})(JournalSource || (exports.JournalSource = JournalSource = {}));
var JournalStatus;
(function (JournalStatus) {
    JournalStatus["DRAFT"] = "DRAFT";
    JournalStatus["POSTED"] = "POSTED";
    JournalStatus["REVERSED"] = "REVERSED";
})(JournalStatus || (exports.JournalStatus = JournalStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["CHEQUE"] = "CHEQUE";
    PaymentMethod["ONLINE"] = "ONLINE";
    PaymentMethod["MOBILE_WALLET"] = "MOBILE_WALLET";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var ReceiptStatus;
(function (ReceiptStatus) {
    ReceiptStatus["DRAFT"] = "DRAFT";
    ReceiptStatus["POSTED"] = "POSTED";
    ReceiptStatus["RECONCILED"] = "RECONCILED";
    ReceiptStatus["CANCELLED"] = "CANCELLED";
})(ReceiptStatus || (exports.ReceiptStatus = ReceiptStatus = {}));
//# sourceMappingURL=finance.types.js.map