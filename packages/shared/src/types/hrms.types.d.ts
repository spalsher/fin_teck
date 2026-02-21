import { AuditableEntity } from './common.types';
export interface Employee extends AuditableEntity {
    organizationId: string;
    branchId: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    dateOfBirth: Date | null;
    hireDate: Date;
    terminationDate: Date | null;
    departmentId: string | null;
    designationId: string | null;
    status: EmployeeStatus;
}
export declare enum EmployeeStatus {
    ACTIVE = "ACTIVE",
    ON_LEAVE = "ON_LEAVE",
    SUSPENDED = "SUSPENDED",
    TERMINATED = "TERMINATED"
}
export interface PayrollRun extends AuditableEntity {
    organizationId: string;
    branchId: string;
    runNo: string;
    periodStart: Date;
    periodEnd: Date;
    paymentDate: Date;
    totalGross: number;
    totalDeductions: number;
    totalNet: number;
    status: PayrollStatus;
}
export declare enum PayrollStatus {
    DRAFT = "DRAFT",
    CALCULATED = "CALCULATED",
    APPROVED = "APPROVED",
    PAID = "PAID",
    CANCELLED = "CANCELLED"
}
