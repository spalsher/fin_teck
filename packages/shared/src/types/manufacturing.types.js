"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QCResult = exports.ProductionStatus = exports.BOMStatus = void 0;
var BOMStatus;
(function (BOMStatus) {
    BOMStatus["DRAFT"] = "DRAFT";
    BOMStatus["ACTIVE"] = "ACTIVE";
    BOMStatus["OBSOLETE"] = "OBSOLETE";
})(BOMStatus || (exports.BOMStatus = BOMStatus = {}));
var ProductionStatus;
(function (ProductionStatus) {
    ProductionStatus["PLANNED"] = "PLANNED";
    ProductionStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ProductionStatus["COMPLETED"] = "COMPLETED";
    ProductionStatus["CANCELLED"] = "CANCELLED";
})(ProductionStatus || (exports.ProductionStatus = ProductionStatus = {}));
var QCResult;
(function (QCResult) {
    QCResult["PASS"] = "PASS";
    QCResult["FAIL"] = "FAIL";
    QCResult["CONDITIONAL"] = "CONDITIONAL";
})(QCResult || (exports.QCResult = QCResult = {}));
//# sourceMappingURL=manufacturing.types.js.map