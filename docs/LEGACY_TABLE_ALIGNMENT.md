# Legacy Table Alignment (SQL Scripts -> Prisma)

This document records table-level alignment between legacy SQL scripts in `Database/` and Prisma models in `apps/api/prisma/schema.prisma`.

## Source files used

- `Database/01-iteck_erp-employees.sql`
- `Database/02-iteck_erp-requisition.sql`
- `Database/03-iteck_erp-multitenant.sql`
- `Database/postgresql-schema.sql`

## Added for legacy parity

- `tenants` -> `Tenant` model (`@@map("tenants")`)
- `employee_type` -> `EmployeeType` model (`@@map("employee_type")`)
- `employees.employee_type_id` compatibility -> `Employee.employeeTypeId` + relation to `EmployeeType`

## Table mapping

- `departments` -> `Department` (`@@map("departments")`)
- `designation` / `designations` -> `Designation` (`@@map("designations")`) [legacy singular handled as naming delta]
- `employee_type` -> `EmployeeType` (`@@map("employee_type")`)
- `employees` -> `Employee` (`@@map("employees")`)
- `users` -> `User` (`@@map("users")`)
- `leave_balance` -> `LeaveBalance` (`@@map("leave_balances")`) [naming delta]
- `requisition` / `requisitions` -> `Requisition` (`@@map("requisitions")`) [naming delta]
- `requisition_items` -> `RequisitionItem` (`@@map("requisition_items")`)
- `tenants` -> `Tenant` (`@@map("tenants")`)
- `salary_slips` -> `Payslip` (`@@map("payslips")`) [concept mapped to modern payroll]
- `leave_requests` -> `LeaveRequest` (`@@map("leave_requests")`)
- `feedback` -> `Feedback` (`@@map("feedbacks")`) [naming delta]

## Intentional differences

- Multi-tenant strategy in modern stack is centered on `Organization`/`Branch`; `Tenant` is added for compatibility and migration mapping.
- Some legacy singular table names are mapped to modern pluralized tables (`designation`, `requisition`, `feedback`, `leave_balance`) to avoid invasive renames in a live schema.
- Stored procedures/views are not recreated as PostgreSQL SPs by default; logic remains in NestJS services.

## Reconcile with Excel workbook

`Database.xlsx` was not readable in this environment. Once the workbook is provided in CSV/text form, run a second-pass comparison and update this mapping if new tables appear.
