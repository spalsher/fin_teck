"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingCycle = exports.ServiceType = void 0;
var ServiceType;
(function (ServiceType) {
    ServiceType["ASSET_TRACKING"] = "ASSET_TRACKING";
    ServiceType["FLEET_MANAGEMENT"] = "FLEET_MANAGEMENT";
    ServiceType["DEVICE_SALES"] = "DEVICE_SALES";
    ServiceType["INSTALLATION"] = "INSTALLATION";
    ServiceType["MAINTENANCE"] = "MAINTENANCE";
    ServiceType["SOFTWARE_LICENSE"] = "SOFTWARE_LICENSE";
})(ServiceType || (exports.ServiceType = ServiceType = {}));
var BillingCycle;
(function (BillingCycle) {
    BillingCycle["MONTHLY"] = "MONTHLY";
    BillingCycle["QUARTERLY"] = "QUARTERLY";
    BillingCycle["ANNUALLY"] = "ANNUALLY";
    BillingCycle["ONE_TIME"] = "ONE_TIME";
    BillingCycle["USAGE_BASED"] = "USAGE_BASED";
})(BillingCycle || (exports.BillingCycle = BillingCycle = {}));
//# sourceMappingURL=core.types.js.map