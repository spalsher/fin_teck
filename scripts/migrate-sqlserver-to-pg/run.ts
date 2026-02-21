/**
 * Migration runner: SQL Server -> PostgreSQL.
 * Reads MIGRATION_SQL_SERVER_URL and DATABASE_URL from env (apps/api/.env or .env).
 * Ensures default org/branch exist in PG, then migrates tables in FK order.
 */
/// <reference path="./mssql.d.ts" />

import * as sql from 'mssql';
import { Client } from 'pg';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import {
  MIGRATION_ORDER,
  TableMapping,
  getIdMap,
  setMappedId,
  getMappedId,
} from './mapping';
import {
  loadDiscoverOutput,
  tableOrder,
  getTableColumns,
  getTransformForSqlType,
} from './discovery-util';
import { quoteId } from './type-map';

const BATCH_SIZE = 500;

function loadEnv(): void {
  const root = path.resolve(__dirname, '../..');
  const apiEnv = path.join(root, 'apps/api/.env');
  if (require('fs').existsSync(apiEnv)) {
    require('dotenv').config({ path: apiEnv });
  }
  const localEnv = path.join(__dirname, '.env');
  if (require('fs').existsSync(localEnv)) {
    require('dotenv').config({ path: localEnv });
  }
}

function toPgValue(val: unknown, transform?: string): unknown {
  if (val == null || val === undefined) return null;
  if (transform === 'uuid') {
    if (typeof val === 'string' && /^[0-9a-f-]{36}$/i.test(val)) return val;
    return val;
  }
  if (transform === 'date') {
    if (val instanceof Date) return val;
    if (typeof val === 'string') return new Date(val);
    return val;
  }
  if (transform === 'bool') {
    if (typeof val === 'boolean') return val;
    if (val === 1 || val === '1' || val === 'true' || val === 'True') return true;
    if (val === 0 || val === '0' || val === 'false' || val === 'False') return false;
    return Boolean(val);
  }
  if (transform === 'json') {
    if (typeof val === 'object') return JSON.stringify(val);
    if (typeof val === 'string') return val;
    return JSON.stringify({ value: val });
  }
  return val;
}

async function ensureDefaultOrgAndBranch(pg: Client): Promise<{ orgId: string; branchId: string }> {
  let orgId: string | null = null;
  let branchId: string | null = null;
  const orgRes = await pg.query(`SELECT id FROM organizations LIMIT 1`);
  if (orgRes.rows.length > 0) {
    orgId = orgRes.rows[0].id;
    const branchRes = await pg.query(`SELECT id FROM branches WHERE "organizationId" = $1 LIMIT 1`, [orgId]);
    if (branchRes.rows.length > 0) branchId = branchRes.rows[0].id;
  }
  if (!orgId) {
    orgId = uuidv4();
    await pg.query(
      `INSERT INTO organizations (id, name, code, address, settings, currency, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [orgId, 'Migrated Organization', 'MIG', '{}', '{}', 'PKR']
    );
    console.log('Created default organization:', orgId);
  }
  if (!branchId) {
    branchId = uuidv4();
    await pg.query(
      `INSERT INTO branches (id, "organizationId", name, code, address, "isActive", "isHeadOffice", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, true, true, NOW(), NOW())`,
      [branchId, orgId, 'Head Office', 'HO', '{}']
    );
    console.log('Created default branch:', branchId);
  }
  return { orgId, branchId };
}

const ID_COL: Record<string, string> = {
  Organization: 'Org_ID',
  Branch: 'Branch_ID',
  HR_Department: 'Dept_ID',
  HR_Designation: 'Desg_ID',
  HR_Employees: 'HR_Emp_ID',
  ACCOUNT_COMBINATION: 'COMBINATION_ID',
  AR_Companies: 'CO_ID',
  AP_SUPPLIER: 'AS_ID',
  AR_INVOICE: 'AI_NO',
  AP_INVOICE: 'AI_NO',
  AR_PAYMENT_RECEIPT: 'APR_NO',
  GL_JE_HEADER_ALL: 'JE_HEADER_ID',
  GL_JE_LINES_ALL: 'JE_LINE_ID',
};

async function ensureDefaultFiscalPeriod(pg: Client, orgId: string): Promise<string> {
  const res = await pg.query(`SELECT id FROM fiscal_periods WHERE "organizationId" = $1 LIMIT 1`, [orgId]);
  if (res.rows.length > 0) return res.rows[0].id;
  const id = uuidv4();
  const start = new Date();
  start.setMonth(0, 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);
  end.setDate(0);
  await pg.query(
    `INSERT INTO fiscal_periods (id, "organizationId", "periodName", "fiscalYear", "periodNumber", "startDate", "endDate", status, "isClosed", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, 1, $5, $6, 'OPEN', false, NOW(), NOW())`,
    [id, orgId, 'FY ' + start.getFullYear(), start.getFullYear(), start, end]
  );
  console.log('Created default fiscal period:', id);
  return id;
}

async function ensureAuditUserId(pg: Client, orgId: string, branchId: string): Promise<string> {
  const res = await pg.query(`SELECT id FROM users WHERE "organizationId" = $1 LIMIT 1`, [orgId]);
  if (res.rows.length > 0) return res.rows[0].id;
  const id = uuidv4();
  await pg.query(
    `INSERT INTO users (id, "organizationId", "branchId", email, "passwordHash", "firstName", "lastName", "isActive", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())`,
    [id, orgId, branchId, 'migration@local', 'CHANGE_ME_RUN_SEED_OR_SET_PASSWORD', 'Migration', 'User']
  );
  console.log('Created placeholder audit user (change password or run seed):', id);
  return id;
}

async function migrateTable(
  sqlPool: sql.ConnectionPool,
  pg: Client,
  mapping: TableMapping,
  ctx: { orgId: string; branchId: string; fiscalPeriodId: string; auditUserId: string },
  report: Array<{ table: string; read: number; written: number; errors: string[] }>
): Promise<void> {
  const { orgId, branchId, fiscalPeriodId, auditUserId } = ctx;
  const sqlTable = mapping.sqlTable.includes('.') ? mapping.sqlTable : `dbo.${mapping.sqlTable}`;
  const pgTable = mapping.pgTable;
  const errors: string[] = [];
  let read = 0;
  let written = 0;

  try {
    const req = sqlPool.request();
    let result: sql.IResult<Record<string, unknown>>;
    try {
      result = (await req.query(`SELECT * FROM ${sqlTable}`)) as sql.IResult<Record<string, unknown>>;
    } catch (e) {
      console.log(`Skipping ${sqlTable}: table not found or not accessible`);
      report.push({ table: pgTable, read: 0, written: 0, errors: [String(e)] });
      return;
    }
    const rows = result.recordset as Record<string, unknown>[];
    read = rows.length;
    if (read === 0) {
      report.push({ table: pgTable, read: 0, written: 0, errors: [] });
      return;
    }

    const colMap = new Map<string, { pg: string; transform?: string; fkTable?: string }>();
    if (mapping.columns) {
      for (const c of mapping.columns) {
        colMap.set(c.sql, { pg: c.pg, transform: c.transform, fkTable: c.fkTable });
      }
    }
    const sqlCols = Object.keys(rows[0] || {});
    const getPgVal = (row: Record<string, unknown>, sqlCol: string): { pgCol: string; val: unknown } => {
      const mapped = colMap.get(sqlCol);
      const pgCol = mapped?.pg ?? sqlCol.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
      let val = row[sqlCol];
      if (mapping.defaultOrgId === '{{orgId}}' && pgCol === 'organizationId') return { pgCol, val: orgId };
      if (mapping.defaultBranchId === '{{branchId}}' && pgCol === 'branchId') return { pgCol, val: branchId };
      if (mapping.defaultFiscalPeriodId === '{{fiscalPeriodId}}' && pgCol === 'fiscalPeriodId') return { pgCol, val: fiscalPeriodId };
      const auditVal = mapping.defaultAudit === '{{auditUserId}}' ? auditUserId : mapping.defaultAudit;
      if (auditVal && (pgCol === 'createdBy' || pgCol === 'updatedBy') && val == null) return { pgCol, val: auditVal };
      if (mapped?.fkTable) {
        const resolved = getMappedId(mapped.fkTable, val as string | number);
        return { pgCol, val: resolved };
      }
      if (mapping.generateId && pgCol === 'id' && val != null) {
        const newId = uuidv4();
        setMappedId(mapping.sqlTable, val as string | number, newId);
        return { pgCol, val: newId };
      }
      return { pgCol, val: toPgValue(val, mapped?.transform) };
    };

    const lineNoPerJournal: Record<string, number> = {};
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      for (let rowIndex = 0; rowIndex < batch.length; rowIndex++) {
        const row = batch[rowIndex];
        try {
          let colToVal: Record<string, unknown> = {};
          if (mapping.sqlTable === 'ACCOUNT_COMBINATION' && pgTable === 'chart_of_accounts') {
            const oldId = row['COMBINATION_ID'] as string | number;
            const newId = uuidv4();
            if (oldId != null) setMappedId('ACCOUNT_COMBINATION', oldId, newId);
            const seg1 = (row['SEGMENT1'] != null ? String(row['SEGMENT1']).trim() : '') || '';
            const seg2 = (row['SEGMENT2'] != null ? String(row['SEGMENT2']).trim() : '') || '';
            const seg3 = (row['SEGMENT3'] != null ? String(row['SEGMENT3']).trim() : '') || '';
            const seg4 = (row['SEGMENT4'] != null ? String(row['SEGMENT4']).trim() : '') || '';
            const accountCode = [seg1, seg2, seg3, seg4].filter(Boolean).join('-') || String(oldId);
            colToVal = {
              id: newId,
              organizationId: orgId,
              accountCode,
              accountName: accountCode,
              accountType: 'ASSET',
              accountCategory: 'GENERAL',
              level: 1,
              isControlAccount: false,
              isActive: toPgValue(row['ACTIVE'], 'bool') ?? true,
              allowDirectPosting: true,
              createdBy: auditUserId,
              updatedBy: auditUserId,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          } else {
            for (const sqlCol of sqlCols) {
              const { pgCol, val } = getPgVal(row, sqlCol);
              if (colToVal[pgCol] === undefined) colToVal[pgCol] = val;
            }
            const idCol = ID_COL[mapping.sqlTable] ?? 'id';
            if (mapping.generateId && colToVal['id'] == null) {
              const oldId = row[idCol] ?? row['id'];
              const newId = uuidv4();
              if (oldId != null) setMappedId(mapping.sqlTable, oldId as string | number, newId);
              colToVal['id'] = newId;
            }
            if (mapping.defaultOrgId === '{{orgId}}' && colToVal['organizationId'] == null) colToVal['organizationId'] = orgId;
            if (mapping.defaultBranchId === '{{branchId}}' && colToVal['branchId'] == null) colToVal['branchId'] = branchId;
            if (mapping.defaultFiscalPeriodId === '{{fiscalPeriodId}}' && colToVal['fiscalPeriodId'] == null) colToVal['fiscalPeriodId'] = fiscalPeriodId;
            const auditVal = mapping.defaultAudit === '{{auditUserId}}' ? auditUserId : mapping.defaultAudit;
            if (auditVal) {
              if (colToVal['createdBy'] == null) colToVal['createdBy'] = auditVal;
              if (colToVal['updatedBy'] == null) colToVal['updatedBy'] = auditVal;
            }
            if (colToVal['createdAt'] == null) colToVal['createdAt'] = new Date();
            if (colToVal['updatedAt'] == null) colToVal['updatedAt'] = new Date();
            if (pgTable === 'customers') {
              if (colToVal['customerCode'] != null) colToVal['customerCode'] = String(colToVal['customerCode']);
              if (colToVal['customerType'] == null) colToVal['customerType'] = 'CUSTOMER';
              if (colToVal['creditLimit'] == null) colToVal['creditLimit'] = 0;
              if (colToVal['billingPreference'] == null) colToVal['billingPreference'] = 'UNIFIED';
              if (colToVal['paymentTermDays'] == null) colToVal['paymentTermDays'] = 0;
            }
            if (pgTable === 'invoices') {
              const invDate = colToVal['invoiceDate'];
              if (colToVal['dueDate'] == null && invDate) colToVal['dueDate'] = invDate;
              if (colToVal['paidAmount'] == null) colToVal['paidAmount'] = 0;
              const total = colToVal['totalAmount'] ?? 0;
              if (colToVal['balanceDue'] == null) colToVal['balanceDue'] = total;
              if (colToVal['subtotal'] == null) colToVal['subtotal'] = total;
              if (colToVal['taxAmount'] == null) colToVal['taxAmount'] = 0;
              if (colToVal['status'] == null) colToVal['status'] = row['AI_POST'] ? 'POSTED' : 'DRAFT';
              if (colToVal['invoiceNo'] != null) colToVal['invoiceNo'] = String(colToVal['invoiceNo']);
            }
            if (pgTable === 'bills') {
              const billDate = colToVal['billDate'];
              if (colToVal['dueDate'] == null && billDate) colToVal['dueDate'] = billDate;
              if (colToVal['paidAmount'] == null) colToVal['paidAmount'] = 0;
              const total = colToVal['totalAmount'] ?? 0;
              if (colToVal['balanceDue'] == null) colToVal['balanceDue'] = total;
              if (colToVal['status'] == null) colToVal['status'] = 'DRAFT';
              if (colToVal['billNo'] != null) colToVal['billNo'] = String(colToVal['billNo']);
            }
            if (pgTable === 'receipts') {
              if (colToVal['paymentMethod'] == null) colToVal['paymentMethod'] = row['APR_CHQ_NO'] ? 'CHEQUE' : 'CASH';
              if (colToVal['status'] == null) colToVal['status'] = 'DRAFT';
              if (colToVal['receiptNo'] != null) colToVal['receiptNo'] = String(colToVal['receiptNo']);
            }
            if (pgTable === 'journal_entries') {
              if (colToVal['totalDebit'] == null) colToVal['totalDebit'] = 0;
              if (colToVal['totalCredit'] == null) colToVal['totalCredit'] = 0;
              if (colToVal['source'] == null) colToVal['source'] = 'MIGRATION';
              if (colToVal['status'] == null) colToVal['status'] = 'DRAFT';
              if (colToVal['journalNo'] != null) colToVal['journalNo'] = String(colToVal['journalNo']);
            }
            if (pgTable === 'journal_entry_lines') {
              const jid = colToVal['journalId'] as string;
              if (jid != null) {
                lineNoPerJournal[jid] = (lineNoPerJournal[jid] ?? 0) + 1;
                if (colToVal['lineNo'] == null) colToVal['lineNo'] = lineNoPerJournal[jid];
              } else if (colToVal['lineNo'] == null) colToVal['lineNo'] = rowIndex + 1;
              if (colToVal['description'] == null) colToVal['description'] = '';
            }
          }
          const cols = Object.keys(colToVal).filter((k) => colToVal[k] !== undefined);
          const values = cols.map((c) => colToVal[c]);
          const placeholders = cols.map((_, j) => `$${j + 1}`).join(', ');
          const quotedCols = cols.map((c) => `"${c}"`).join(', ');
          await pg.query(
            `INSERT INTO ${pgTable} (${quotedCols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
            values
          );
          written++;
        } catch (e) {
          errors.push(String(e));
        }
      }
    }
  } catch (e) {
    errors.push(String(e));
  }
  report.push({ table: pgTable, read, written, errors });
  console.log(`${pgTable}: read ${read}, written ${written}${errors.length ? `, ${errors.length} errors` : ''}`);
}

/** Native ATS_GL: 1:1 copy to same table name on PG with type transforms. */
async function migrateTableNative(
  sqlPool: sql.ConnectionPool,
  pg: Client,
  tableName: string,
  columns: Array<Record<string, unknown>>,
  report: Array<{ table: string; read: number; written: number; errors: string[] }>
): Promise<void> {
  const sqlTable = `dbo.${tableName}`;
  const pgTable = quoteId(tableName);
  const errors: string[] = [];
  let read = 0;
  let written = 0;

  try {
    const result = (await sqlPool.request().query(`SELECT * FROM ${sqlTable}`)) as sql.IResult<Record<string, unknown>>;
    const rows = (result.recordset || []) as Record<string, unknown>[];
    read = rows.length;
    if (read === 0) {
      report.push({ table: tableName, read: 0, written: 0, errors: [] });
      return;
    }

    const colNames = columns.map((c) => String(c.COLUMN_NAME ?? ''));
    const transforms = new Map<string, 'bool' | 'date' | 'uuid' | 'json' | undefined>();
    for (const c of columns) {
      const name = String(c.COLUMN_NAME ?? '');
      const dataType = String(c.DATA_TYPE ?? '');
      transforms.set(name, getTransformForSqlType(dataType));
    }

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      for (const row of batch) {
        try {
          const values: unknown[] = [];
          const cols: string[] = [];
          let idx = 0;
          for (const colName of colNames) {
            const val = row[colName];
            const transform = transforms.get(colName);
            values.push(toPgValue(val, transform));
            cols.push(quoteId(colName));
            idx++;
          }
          const placeholders = values.map((_, j) => `$${j + 1}`).join(', ');
          await pg.query(
            `INSERT INTO ${pgTable} (${cols.join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
            values
          );
          written++;
        } catch (e) {
          errors.push(String(e));
        }
      }
    }
  } catch (e) {
    errors.push(String(e));
  }
  report.push({ table: tableName, read, written, errors });
  console.log(`[native] ${tableName}: read ${read}, written ${written}${errors.length ? `, ${errors.length} errors` : ''}`);
}

async function main(): Promise<void> {
  loadEnv();
  const sqlUrl = process.env.MIGRATION_SQL_SERVER_URL;
  const pgUrl = process.env.DATABASE_URL;
  if (!sqlUrl || !pgUrl) {
    console.error('Set MIGRATION_SQL_SERVER_URL and DATABASE_URL (e.g. in apps/api/.env)');
    process.exit(1);
  }

  console.log('Connecting to SQL Server...');
  const sqlPool = await sql.connect(sqlUrl);
  console.log('Connecting to PostgreSQL...');
  const pg = new Client({
    connectionString: pgUrl,
    connectionTimeoutMillis: 120000,
    keepAlive: true,
  });
  await pg.connect();
  await pg.query('SET statement_timeout = 0');
  await pg.query('SET idle_in_transaction_session_timeout = 0').catch(() => {});

  const report: Array<{ table: string; read: number; written: number; errors: string[] }> = [];
  const nativeOnly = process.env.MIGRATION_NATIVE_ONLY === 'true' || process.env.MIGRATION_NATIVE_ONLY === '1';
  const runNative = process.env.MIGRATION_NATIVE_ATS_GL === 'true' || process.env.MIGRATION_NATIVE_ATS_GL === '1';
  let orgId = '';
  let branchId = '';
  let fiscalPeriodId = '';
  let auditUserId = '';

  try {
    if (!nativeOnly) {
      const defaults = await ensureDefaultOrgAndBranch(pg);
      orgId = defaults.orgId;
      branchId = defaults.branchId;
      fiscalPeriodId = await ensureDefaultFiscalPeriod(pg, orgId);
      auditUserId = await ensureAuditUserId(pg, orgId, branchId);
      const ctx = { orgId, branchId, fiscalPeriodId, auditUserId };
      for (const mapping of MIGRATION_ORDER) {
        await migrateTable(sqlPool, pg, mapping, ctx, report);
      }
    }

    if (runNative || nativeOnly) {
      const prismaTables = new Set(MIGRATION_ORDER.map((m) => m.sqlTable));
      const discovery = loadDiscoverOutput(__dirname);
      const progressPath = path.join(__dirname, 'migration-progress.json');
      let completedTables: string[] = [];
      if (fs.existsSync(progressPath)) {
        try {
          completedTables = JSON.parse(fs.readFileSync(progressPath, 'utf8')).completedTables || [];
          console.log(`[native] Resuming: ${completedTables.length} tables already done, skipping those.`);
        } catch {
          completedTables = [];
        }
      }
      if (discovery) {
        const order = tableOrder(discovery);
        console.log(`[native] Migrating ${order.length} tables (1:1)...`);
        for (const tableName of order) {
          if (!nativeOnly && prismaTables.has(tableName)) continue;
          if (completedTables.includes(tableName)) continue;
          const cols = getTableColumns(discovery, tableName);
          if (cols.length === 0) continue;
          try {
            await migrateTableNative(sqlPool, pg, tableName, cols, report);
            completedTables.push(tableName);
            fs.writeFileSync(progressPath, JSON.stringify({ completedTables }, null, 2));
          } catch (err) {
            console.error(`[native] Failed at table ${tableName}:`, err);
            fs.writeFileSync(progressPath, JSON.stringify({ completedTables }, null, 2));
            throw err;
          }
        }
        if (fs.existsSync(progressPath)) fs.unlinkSync(progressPath);
      } else {
        console.warn('MIGRATION_NATIVE_ATS_GL set but discover-output.json not found; run discover first.');
      }
    }

    const reportPath = path.join(__dirname, 'migration-report.json');
    require('fs').writeFileSync(reportPath, JSON.stringify({ report, orgId, branchId, fiscalPeriodId, auditUserId }, null, 2));
    console.log('Report written to', reportPath);
  } finally {
    await sqlPool.close();
    await pg.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
