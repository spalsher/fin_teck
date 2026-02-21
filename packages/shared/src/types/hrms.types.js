"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollStatus = exports.EmployeeStatus = void 0;
var EmployeeStatus;
(function (EmployeeStatus) {
    EmployeeStatus["ACTIVE"] = "ACTIVE";
    EmployeeStatus["ON_LEAVE"] = "ON_LEAVE";
    EmployeeStatus["SUSPENDED"] = "SUSPENDED";
    EmployeeStatus["TERMINATED"] = "TERMINATED";
})(EmployeeStatus || (exports.EmployeeStatus = EmployeeStatus = {}));
var PayrollStatus;
(function (PayrollStatus) {
    PayrollStatus["DRAFT"] = "DRAFT";
    PayrollStatus["CALCULATED"] = "CALCULATED";
    PayrollStatus["APPROVED"] = "APPROVED";
    PayrollStatus["PAID"] = "PAID";
    PayrollStatus["CANCELLED"] = "CANCELLED";
})(PayrollStatus || (exports.PayrollStatus = PayrollStatus = {}));
//# sourceMappingURL=hrms.types.js.map