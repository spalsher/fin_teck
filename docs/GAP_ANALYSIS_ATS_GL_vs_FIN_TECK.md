# Gap analysis: ATS_GL_260126 vs fin_teck

Comparison of the .NET app (ATS_GL_260126) and the NestJS/Prisma app (fin_teck) for schema, APIs, and features.

---

## 1. Schema / data model

### 1.1 Tables/entities only in ATS_GL_260126 (from SPs and C# models)

| Entity / table (logical) | Stored procedure(s) | Recommendation |
|---------------------------|---------------------|-----------------|
| HR_W_All_Ded_Department (WDA) | HR_W_All_Ded_Department_sh | Add to Prisma if workload assignment is needed in fin_teck; else legacy. |
| Bank_Stat_UPChqs_DB, Bank_Master_Period_Mstr_DB, BankMaster_DB | Bank_*_sh, BankMaster_DB_sh | Data loaders; treat as report/loader-only or add minimal models. |
| Salary_Update / Salary_Update_Detail | HR_Emp_Salary_Update_sh | Add if salary history is required; else keep in .NET. |
| Report result sets (AR ageing, AP ageing, Trial balance, Audit trial, etc.) | AP_Ageing_Report_sh, AR_Ageing_Report_sh, TrialBalanceReport_sh, AuditTrialReport_sh, etc. | No table; add report APIs in fin_teck that return same shape via Prisma/raw SQL. |
| AR/AP loaders (sp_Load_AP_Invoice_sh, sp_Load_AR_Order_Booking_sh, etc.) | DataLoader SPs | Implement as admin/import APIs in fin_teck or keep in .NET. |
| UserPrivileges, EntryLog, Company (GetCompany, GetUserCompanies) | UserPrivileges_sh, EntryLog_sh, GetCompany, GetUserCompanies | fin_teck has User, Role, Permission, AuditLog; map privileges to roles. EntryLog can map to audit_logs. |
| GroupOfCompanies, FormDescription | GetCompany, GetUserMenuAndForms | Menu/forms: implement in fin_teck as config or separate module. |

### 1.2 Tables/entities only in fin_teck (Prisma)

Prisma has many models with no direct .NET counterpart, e.g.: Survey, SurveyResponse, Recognition, TrainingProgram, TrainingEnrollment, Certification, Goal, Feedback, PerformanceReview, BenefitPlan, BenefitEnrollment, Claim, JobRequisition, Candidate, Interview, Offer, BOM, ProductionOrder, QCInspection, PaymentProvider, PaymentIntent, CRMSyncLog, BillingLog, Quotation (requisition), CategoryApprovalStep, DocumentSequence, FilterPreset, Notification, CustomerContact, CustomerService, InvoiceLine, ReceiptAllocation, etc. No change required unless .NET needs to consume these; fin_teck can remain the source of truth for these domains.

### 1.3 Naming and structure differences

| SQL Server (ATS_GL) | fin_teck Prisma (table) | Notes |
|---------------------|--------------------------|--------|
| Organization (Org_ID, Org_Name, Org_Code) | organizations (id UUID, name, code) | PK: int vs UUID; migration script maps. |
| Branch (Branch_ID, Org_ID) | branches (id, organizationId) | Same. |
| HR_Department (Dept_ID, Dept_Code, Dept_Name) | departments (id, code, name) | Plus organizationId, branchId in Prisma. |
| HR_Designation (Desg_ID, Desg_Name) | designations (id, title, code) | Prisma: title vs desg_name. |
| HR_Employees (HR_Emp_ID, Emp_Code, First_Name, Last_Name, Joining_Dept_ID, Joining_Dsg_ID, Report_To) | employees (id, employeeCode, firstName, lastName, departmentId, designationId, managerId) | Prisma requires organizationId, branchId, createdBy, updatedBy. |
| INV_Item_Mstr, INV_ItemCategory, INV_ItemSubCategory | items, item_categories | Prisma: Item has organizationId; subcategory exists. |
| INV_UnitOfMeasure, INV_Packing, INV_Contain | No direct 1:1 | Prisma has Item; packing/contain may be attributes or separate models if needed. |
| requisition (req_id, req_emp_id, …) | requisitions (id, createdByEmployeeId, …) | fin_teck has full approval workflow; .NET has similar fields. |
| requisition_items | requisition_items | Aligned. |

---

## 2. Stored procedures vs APIs

### 2.1 ATS_GL_260126: features and SPs

| Feature | Stored procedure(s) | fin_teck equivalent |
|---------|----------------------|----------------------|
| Get employees (CRUD) | HR_Employees_sh | HRMS Employee API (NestJS) |
| Get departments (CRUD) | HR_Department_sh | HRMS Department API |
| Get designations (CRUD) | HR_Designation_sh | HRMS Designation API |
| Get cities, regions, grades, fin year | HR_City_sh, HR_Region_sh, HR_Grade_sh, HR_FinYearMstr_sh | Partial (e.g. no City/Region/Grade modules in fin_teck) |
| Leaves, loans, payroll elements | HR_Leaves_sh, HR_Loans_sh, HR_Payroll_Elements_sh | Leave API exists; loans/payroll elements partial or missing |
| WDA (working dept assignment) | HR_W_All_Ded_Department_sh | No equivalent |
| Salary update | HR_Emp_Salary_Update_sh | No equivalent |
| Inventory: item master, category, subcategory, UoM, packing, contain | INV_Item_Mstr_sh, INV_ItemCategory_sh, INV_ItemSubCategory_sh, INV_UnitOfMeasure_sh, INV_Packing_sh, INV_Contain_sh | SCM Item/Category; UoM/packing/contain not exposed |
| Approval request (supply chain) | INV_ApprovalRequest_sh | Can map to requisition approval or separate API |
| Organization, cost center, natural account, sub-account, account combination | Organization_sh, CostCenter_sh, NaturalAccount_sh, SubAccount_sh, AccountCombination_sh | Finance modules (chart of account, cost center) |
| Bank master, tax master/detail | BankMaster_sh, TAX_MASTER_sh, TAX_DETAIL_sh | Bank account, tax in finance |
| Supplier, customer | AP_SUPPLIER_sh, AR_Companies_sh | Vendor, Customer in finance |
| Journal voucher, journal ledger posting | JournalVoucher_sh, JournalLedgerPosting_sh | Journal entry API |
| Purchase invoice, PI invoice, PI issuance | PurchaseInvoice_sh, PI_Invoice_sh, PI_Issuance_sh, PI_Issuance_Diag_sh | Bill / purchase order–related; map as needed |
| AR manual invoice, payment receipt, bills posting, credit note, etc. | AR_ManualInvoice_sh, AR_PaymentReceipt_sh, AR_BillsPosting_sh, ARDebitNote_sh, etc. | Invoice, receipt, bill APIs in finance |
| AP payment receipt, debit note, transfer to GL | AP_PAYMENT_RECEIPT_sh, AP_Debit_Note_sh, AP_Entries_Transfer_To_GL_sh | Finance posting flows |
| Vehicle booking | AR_VehicleBooking_sh | No equivalent |
| Reports (ageing, trial balance, audit trial, voucher reports) | AP_Ageing_Report_sh, AR_Ageing_Report_sh, TrialBalanceReport_sh, AuditTrialReport_sh, AP_Invoice_Voucher_Report_sh, etc. | No direct equivalent; add report endpoints in fin_teck |
| Data loaders (bank statement, AP/AR load, un-presented cheques) | sp_Load_Bank_Statement_DB_sh, sp_Load_AP_Invoice_sh, sp_Load_AR_Order_Booking_sh, sp_Load_Debit_Credit_Note_sh, sp_Load_Un_Presented_Cheques_DB_sh | No equivalent; implement as admin/import APIs or keep in .NET |
| User details, company, user companies, menu/forms | GetUserDetails, GetCompany, GetUserCompanies, GetUserMenuAndForms | Auth/user API; organization/branch; menu can be config |
| User privileges, entry log | UserPrivileges_sh, EntryLog_sh | Roles/permissions; audit_logs |

### 2.2 fin_teck: what has no .NET counterpart

Requisition approval workflow (category steps, approval logs, quotations), workflow roles, document sequences, notifications, filter presets, full HR (attendances, shifts, payroll runs, payslips, advances, performance reviews, goals, feedback, training, surveys, recognitions), manufacturing (BOM, production order, QC), CRM sync, billing logs. These can stay fin_teck-only unless .NET needs to integrate.

---

## 3. Functional gaps

### 3.1 In fin_teck but not in ATS_GL_260126

- Requisition category and step-based approval (CategoryApprovalStep, RequisitionApprovalLog, Quotation).
- Workflow roles and role-based approval.
- Broader HR: attendances, shifts, payroll runs, payslips, advances, performance, goals, training, surveys, recognitions.
- Manufacturing (BOM, production order, QC).
- Document sequences, notifications, filter presets.

### 3.2 In ATS_GL_260126 but not in fin_teck (prioritized)

| Gap | Priority | Action |
|-----|----------|--------|
| Report APIs (AR/AP ageing, trial balance, audit trial) | High | Add read-only report endpoints in fin_teck that return same shape (Prisma/raw SQL). |
| WDA (working department assignment) | Medium | Add Prisma model + API or document as .NET-only. |
| Salary update (history) | Medium | Add model + API or keep in .NET. |
| Data loaders (bank statement, AP/AR load) | Low | Implement as admin/import APIs later or keep in .NET. |
| Vehicle booking | Low | Add model + API or keep in .NET. |
| City, Region, Grade, FinYear (HRMS lookup) | Medium | Add if HRMS in fin_teck must match .NET; else optional. |

---

## 4. Summary

- **Schema**: Migration script maps core tables (Organization, Branch, HR_Department, HR_Designation, HR_Employees) with FK resolution. Extend mapping for more tables as needed; many .NET entities are SP-driven with no direct table name in repo (discover script lists actual SQL Server tables).
- **APIs**: fin_teck already has HRMS (employee, department, designation), finance (journal, invoice, receipt, bill, vendor, customer, bank), and requisition. Gaps: report endpoints, WDA, salary update, data loaders, vehicle booking, and optional HR lookups (city, region, grade, fin year).
- **Implementation**: Add report APIs and (if agreed) WDA/salary update/vehicle booking in fin_teck; document data loaders and menu/forms for a later phase.
