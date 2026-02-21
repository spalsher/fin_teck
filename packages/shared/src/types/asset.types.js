"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepreciationFormula = exports.AssetStatus = void 0;
var AssetStatus;
(function (AssetStatus) {
    AssetStatus["ACTIVE"] = "ACTIVE";
    AssetStatus["UNDER_MAINTENANCE"] = "UNDER_MAINTENANCE";
    AssetStatus["DISPOSED"] = "DISPOSED";
    AssetStatus["RETIRED"] = "RETIRED";
})(AssetStatus || (exports.AssetStatus = AssetStatus = {}));
var DepreciationFormula;
(function (DepreciationFormula) {
    DepreciationFormula["STRAIGHT_LINE"] = "STRAIGHT_LINE";
    DepreciationFormula["DECLINING_BALANCE"] = "DECLINING_BALANCE";
    DepreciationFormula["DOUBLE_DECLINING"] = "DOUBLE_DECLINING";
    DepreciationFormula["UNITS_OF_PRODUCTION"] = "UNITS_OF_PRODUCTION";
})(DepreciationFormula || (exports.DepreciationFormula = DepreciationFormula = {}));
//# sourceMappingURL=asset.types.js.map