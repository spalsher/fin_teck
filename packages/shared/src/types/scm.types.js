"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GRNStatus = exports.POStatus = exports.StockTransactionType = exports.ItemType = void 0;
var ItemType;
(function (ItemType) {
    ItemType["FINISHED_GOOD"] = "FINISHED_GOOD";
    ItemType["RAW_MATERIAL"] = "RAW_MATERIAL";
    ItemType["COMPONENT"] = "COMPONENT";
    ItemType["CONSUMABLE"] = "CONSUMABLE";
    ItemType["SERVICE"] = "SERVICE";
    ItemType["DEVICE"] = "DEVICE";
})(ItemType || (exports.ItemType = ItemType = {}));
var StockTransactionType;
(function (StockTransactionType) {
    StockTransactionType["PURCHASE"] = "PURCHASE";
    StockTransactionType["SALE"] = "SALE";
    StockTransactionType["TRANSFER_IN"] = "TRANSFER_IN";
    StockTransactionType["TRANSFER_OUT"] = "TRANSFER_OUT";
    StockTransactionType["ADJUSTMENT_IN"] = "ADJUSTMENT_IN";
    StockTransactionType["ADJUSTMENT_OUT"] = "ADJUSTMENT_OUT";
    StockTransactionType["PRODUCTION_CONSUME"] = "PRODUCTION_CONSUME";
    StockTransactionType["PRODUCTION_OUTPUT"] = "PRODUCTION_OUTPUT";
})(StockTransactionType || (exports.StockTransactionType = StockTransactionType = {}));
var POStatus;
(function (POStatus) {
    POStatus["DRAFT"] = "DRAFT";
    POStatus["SUBMITTED"] = "SUBMITTED";
    POStatus["APPROVED"] = "APPROVED";
    POStatus["PARTIALLY_RECEIVED"] = "PARTIALLY_RECEIVED";
    POStatus["RECEIVED"] = "RECEIVED";
    POStatus["CANCELLED"] = "CANCELLED";
})(POStatus || (exports.POStatus = POStatus = {}));
var GRNStatus;
(function (GRNStatus) {
    GRNStatus["DRAFT"] = "DRAFT";
    GRNStatus["POSTED"] = "POSTED";
    GRNStatus["CANCELLED"] = "CANCELLED";
})(GRNStatus || (exports.GRNStatus = GRNStatus = {}));
//# sourceMappingURL=scm.types.js.map