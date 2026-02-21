/**
 * Table/column mapping: SQL Server -> PostgreSQL (Prisma table names).
 * Order respects FK dependencies so parents are migrated before children.
 */

export interface ColumnMap {
  /** SQL Server column name */
  sql: string;
  /** PostgreSQL column name (camelCase as in Prisma) */
  pg: string;
  /** Optional transform: 'uuid' | 'date' | 'bool' | 'json' */
  transform?: 'uuid' | 'date' | 'bool' | 'json';
  /** If set, value is FK: resolve old ID from this SQL table's id map */
  fkTable?: string;
}

export interface TableMapping {
  /** SQL Server table name (schema.table or dbo.TableName) */
  sqlTable: string;
  /** PostgreSQL table name (Prisma @@map value) */
  pgTable: string;
  /** Column mapping; if not set, same names are used */
  columns?: ColumnMap[];
  /** If true, generate new UUIDs for id and do not copy SQL Server id */
  generateId?: boolean;
  /** Default organizationId to set for all rows (required by Prisma) */
  defaultOrgId?: string;
  /** Default branchId to set for all rows */
  defaultBranchId?: string;
  /** Default fiscalPeriodId (e.g. for journal_entries) */
  defaultFiscalPeriodId?: string;
  /** Default createdBy/updatedBy (use real user UUID from runner) */
  defaultAudit?: string;
}

/** FK-safe order: reference (org/branch) -> chart of accounts -> masters (customers, vendors) -> transactional (invoices, bills, receipts, journals). */
export const MIGRATION_ORDER: TableMapping[] = [
  // Optional legacy org/branch (skipped if not in ATS_GL)
  {
    sqlTable: 'Organization',
    pgTable: 'organizations',
    generateId: true,
    columns: [
      { sql: 'Org_ID', pg: 'id', transform: 'uuid' },
      { sql: 'Org_Name', pg: 'name' },
      { sql: 'Org_Code', pg: 'code' },
      { sql: 'Tax_ID', pg: 'taxId' },
      { sql: 'Address', pg: 'address', transform: 'json' },
      { sql: 'Settings', pg: 'settings', transform: 'json' },
      { sql: 'Currency', pg: 'currency' },
    ],
  },
  {
    sqlTable: 'Branch',
    pgTable: 'branches',
    generateId: true,
    defaultOrgId: '{{orgId}}',
    columns: [
      { sql: 'Branch_ID', pg: 'id', transform: 'uuid' },
      { sql: 'Org_ID', pg: 'organizationId', fkTable: 'Organization' },
      { sql: 'Branch_Name', pg: 'name' },
      { sql: 'Branch_Code', pg: 'code' },
      { sql: 'Address', pg: 'address', transform: 'json' },
      { sql: 'Phone', pg: 'phone' },
      { sql: 'Email', pg: 'email' },
      { sql: 'IsActive', pg: 'isActive', transform: 'bool' },
    ],
  },
  // ATS_GL: Chart of accounts (GL_JE_LINES_ALL.JE_AC_ID = COMBINATION_ID). Runner builds accountCode from SEGMENT1-4.
  {
    sqlTable: 'ACCOUNT_COMBINATION',
    pgTable: 'chart_of_accounts',
    generateId: true,
    defaultOrgId: '{{orgId}}',
    defaultAudit: '{{auditUserId}}',
    columns: [
      { sql: 'ACTIVE', pg: 'isActive', transform: 'bool' },
    ],
  },
  // ATS_GL: Customers (AR) -> customers
  {
    sqlTable: 'AR_Companies',
    pgTable: 'customers',
    generateId: true,
    defaultBranchId: '{{branchId}}',
    defaultAudit: '{{auditUserId}}',
    columns: [
      { sql: 'CO_ID', pg: 'id' },
      { sql: 'CO_Company_Name', pg: 'name' },
      { sql: 'CO_Company_Id', pg: 'customerCode' },
      { sql: 'co_ntnno', pg: 'taxId' },
      { sql: 'co_address', pg: 'billingAddress', transform: 'json' },
      { sql: 'CRDays', pg: 'paymentTermDays' },
    ],
  },
  // ATS_GL: Vendors (AP) -> vendors
  {
    sqlTable: 'AP_SUPPLIER',
    pgTable: 'vendors',
    generateId: true,
    defaultBranchId: '{{branchId}}',
    defaultAudit: '{{auditUserId}}',
    columns: [
      { sql: 'AS_ID', pg: 'id' },
      { sql: 'AS_Supplier_Name', pg: 'name' },
      { sql: 'AS_strno', pg: 'vendorCode' },
      { sql: 'AS_ntnno', pg: 'taxId' },
      { sql: 'AS_address', pg: 'address', transform: 'json' },
      { sql: 'CRDays', pg: 'paymentTermDays' },
    ],
  },
  // ATS_GL: AR Invoices -> invoices (runner sets dueDate=invoiceDate, paidAmount=0, balanceDue=totalAmount, subtotal/taxAmount/status)
  {
    sqlTable: 'AR_INVOICE',
    pgTable: 'invoices',
    generateId: true,
    defaultBranchId: '{{branchId}}',
    defaultAudit: '{{auditUserId}}',
    columns: [
      { sql: 'AI_NO', pg: 'id' },
      { sql: 'AI_CO_ID', pg: 'customerId', fkTable: 'AR_Companies' },
      { sql: 'AI_NO', pg: 'invoiceNo' },
      { sql: 'AI_DATE', pg: 'invoiceDate', transform: 'date' },
      { sql: 'AI_AMOUNT', pg: 'totalAmount' },
      { sql: 'AI_TYPE', pg: 'invoiceType' },
    ],
  },
  // ATS_GL: AP Invoices -> bills (runner sets dueDate=billDate, paidAmount=0, balanceDue=totalAmount)
  {
    sqlTable: 'AP_INVOICE',
    pgTable: 'bills',
    generateId: true,
    defaultBranchId: '{{branchId}}',
    defaultAudit: '{{auditUserId}}',
    columns: [
      { sql: 'AI_NO', pg: 'id' },
      { sql: 'AI_AS_ID', pg: 'vendorId', fkTable: 'AP_SUPPLIER' },
      { sql: 'AI_NO', pg: 'billNo' },
      { sql: 'AI_DATE', pg: 'billDate', transform: 'date' },
      { sql: 'AI_AMOUNT', pg: 'totalAmount' },
    ],
  },
  // ATS_GL: AR Payment receipts -> receipts (runner sets paymentMethod, status, receiptNo string)
  {
    sqlTable: 'AR_PAYMENT_RECEIPT',
    pgTable: 'receipts',
    generateId: true,
    defaultBranchId: '{{branchId}}',
    defaultAudit: '{{auditUserId}}',
    columns: [
      { sql: 'APR_NO', pg: 'id' },
      { sql: 'APR_CO_ID', pg: 'customerId', fkTable: 'AR_Companies' },
      { sql: 'APR_NO', pg: 'receiptNo' },
      { sql: 'APR_DATE', pg: 'receiptDate', transform: 'date' },
      { sql: 'APR_RECEIPT_AMOUNT', pg: 'amount' },
      { sql: 'APR_CHQ_NO', pg: 'referenceNo' },
    ],
  },
  // ATS_GL: GL Journal headers -> journal_entries (runner sets totalDebit/totalCredit, source, fiscalPeriodId)
  {
    sqlTable: 'GL_JE_HEADER_ALL',
    pgTable: 'journal_entries',
    generateId: true,
    defaultBranchId: '{{branchId}}',
    defaultFiscalPeriodId: '{{fiscalPeriodId}}',
    defaultAudit: '{{auditUserId}}',
    columns: [
      { sql: 'JE_HEADER_ID', pg: 'id' },
      { sql: 'JE_VOUCHER_NO', pg: 'journalNo' },
      { sql: 'JE_DATE', pg: 'entryDate', transform: 'date' },
      { sql: 'JE_DESCRIPTION', pg: 'description' },
      { sql: 'JE_TYPE', pg: 'journalType' },
      { sql: 'JE_NAME', pg: 'source' },
    ],
  },
  // ATS_GL: GL Journal lines -> journal_entry_lines (runner sets lineNo)
  {
    sqlTable: 'GL_JE_LINES_ALL',
    pgTable: 'journal_entry_lines',
    generateId: true,
    columns: [
      { sql: 'JE_LINE_ID', pg: 'id' },
      { sql: 'JE_HEADER_ID', pg: 'journalId', fkTable: 'GL_JE_HEADER_ALL' },
      { sql: 'JE_AC_ID', pg: 'accountId', fkTable: 'ACCOUNT_COMBINATION' },
      { sql: 'JE_ENTERED_DR', pg: 'debit' },
      { sql: 'JE_ENTERED_CR', pg: 'credit' },
      { sql: 'JE_DESCRIPTION_LINE', pg: 'description' },
    ],
  },
  // Legacy HR (skipped if not in ATS_GL)
  {
    sqlTable: 'HR_Department',
    pgTable: 'departments',
    generateId: true,
    defaultOrgId: '{{orgId}}',
    defaultAudit: '{{auditUserId}}',
    columns: [
      { sql: 'Dept_ID', pg: 'id', transform: 'uuid' },
      { sql: 'Dept_Code', pg: 'code' },
      { sql: 'Dept_Name', pg: 'name' },
      { sql: 'Description', pg: 'description' },
      { sql: 'IsActive', pg: 'isActive', transform: 'bool' },
    ],
  },
  {
    sqlTable: 'HR_Designation',
    pgTable: 'designations',
    generateId: true,
    defaultOrgId: '{{orgId}}',
    columns: [
      { sql: 'Desg_ID', pg: 'id', transform: 'uuid' },
      { sql: 'Desg_Code', pg: 'code' },
      { sql: 'Desg_Name', pg: 'title' },
      { sql: 'Level', pg: 'level' },
      { sql: 'IsActive', pg: 'isActive', transform: 'bool' },
    ],
  },
  {
    sqlTable: 'HR_Employees',
    pgTable: 'employees',
    generateId: true,
    defaultOrgId: '{{orgId}}',
    defaultBranchId: '{{branchId}}',
    defaultAudit: '{{auditUserId}}',
    columns: [
      { sql: 'HR_Emp_ID', pg: 'id', transform: 'uuid' },
      { sql: 'Emp_Code', pg: 'employeeCode' },
      { sql: 'First_Name', pg: 'firstName' },
      { sql: 'Last_Name', pg: 'lastName' },
      { sql: 'Email', pg: 'email' },
      { sql: 'Personal_Cell_No', pg: 'phone' },
      { sql: 'DateOfBirth', pg: 'dateOfBirth', transform: 'date' },
      { sql: 'Joining_Date', pg: 'hireDate', transform: 'date' },
      { sql: 'Last_Working_Date', pg: 'terminationDate', transform: 'date' },
      { sql: 'Joining_Dept_ID', pg: 'departmentId', fkTable: 'HR_Department' },
      { sql: 'Joining_Dsg_ID', pg: 'designationId', fkTable: 'HR_Designation' },
      { sql: 'Emp_Status', pg: 'status' },
      { sql: 'Gender', pg: 'gender' },
      { sql: 'Marital_Status', pg: 'maritalStatus' },
      { sql: 'Address', pg: 'address', transform: 'json' },
      { sql: 'Report_To', pg: 'managerId', fkTable: 'HR_Employees' },
      { sql: 'Blood_Group', pg: 'bloodGroup' },
      { sql: 'Nationality', pg: 'nationality' },
      { sql: 'Confirmation_Date', pg: 'confirmationDate', transform: 'date' },
      { sql: 'Profile_Picture', pg: 'profilePicture' },
    ],
  },
];

/** Id mapping: SQL Server table + old id -> new UUID (for FK resolution) */
export const idMaps: Record<string, Record<string | number, string>> = {};

export function getIdMap(sqlTable: string): Record<string | number, string> {
  if (!idMaps[sqlTable]) idMaps[sqlTable] = {};
  return idMaps[sqlTable];
}

export function setMappedId(sqlTable: string, oldId: string | number, newId: string): void {
  getIdMap(sqlTable)[oldId] = newId;
}

export function getMappedId(sqlTable: string, oldId: string | number | null | undefined): string | null {
  if (oldId == null) return null;
  return getIdMap(sqlTable)[oldId] ?? null;
}
