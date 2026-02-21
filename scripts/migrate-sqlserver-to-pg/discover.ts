/**
 * Full schema discovery: SQL Server tables, columns, keys, constraints, procedures, views, triggers.
 * Writes discover-output.json for schema conversion and native data migration.
 */
/// <reference path="./mssql.d.ts" />

import * as sql from 'mssql';
import * as fs from 'fs';
import * as path from 'path';

const QUERY_TABLES_COLUMNS = `
SELECT
  t.TABLE_SCHEMA,
  t.TABLE_NAME,
  c.COLUMN_NAME,
  c.ORDINAL_POSITION,
  c.DATA_TYPE,
  c.CHARACTER_MAXIMUM_LENGTH,
  c.NUMERIC_PRECISION,
  c.NUMERIC_SCALE,
  c.DATETIME_PRECISION,
  c.IS_NULLABLE,
  c.COLUMN_DEFAULT,
  c.COLLATION_NAME
FROM INFORMATION_SCHEMA.TABLES t
JOIN INFORMATION_SCHEMA.COLUMNS c
  ON t.TABLE_SCHEMA = c.TABLE_SCHEMA AND t.TABLE_NAME = c.TABLE_NAME
WHERE t.TABLE_TYPE = 'BASE TABLE'
ORDER BY t.TABLE_SCHEMA, t.TABLE_NAME, c.ORDINAL_POSITION
`;

const QUERY_TABLE_CONSTRAINTS = `
SELECT
  tc.TABLE_SCHEMA,
  tc.TABLE_NAME,
  tc.CONSTRAINT_NAME,
  tc.CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
ORDER BY tc.TABLE_SCHEMA, tc.TABLE_NAME, tc.CONSTRAINT_TYPE
`;

const QUERY_KEY_COLUMN_USAGE = `
SELECT
  kcu.TABLE_SCHEMA,
  kcu.TABLE_NAME,
  kcu.CONSTRAINT_NAME,
  kcu.COLUMN_NAME,
  kcu.ORDINAL_POSITION
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
ORDER BY kcu.TABLE_SCHEMA, kcu.TABLE_NAME, kcu.CONSTRAINT_NAME, kcu.ORDINAL_POSITION
`;

const QUERY_REFERENTIAL = `
SELECT
  rc.CONSTRAINT_NAME,
  rc.UNIQUE_CONSTRAINT_NAME,
  kcu1.TABLE_SCHEMA AS FROM_SCHEMA,
  kcu1.TABLE_NAME AS FROM_TABLE,
  kcu1.COLUMN_NAME AS FROM_COLUMN,
  kcu2.TABLE_SCHEMA AS TO_SCHEMA,
  kcu2.TABLE_NAME AS TO_TABLE,
  kcu2.COLUMN_NAME AS TO_COLUMN
FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu1
  ON rc.CONSTRAINT_NAME = kcu1.CONSTRAINT_NAME AND rc.CONSTRAINT_SCHEMA = kcu1.TABLE_SCHEMA
JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu2
  ON rc.UNIQUE_CONSTRAINT_NAME = kcu2.CONSTRAINT_NAME AND rc.UNIQUE_CONSTRAINT_SCHEMA = kcu2.TABLE_SCHEMA
ORDER BY rc.CONSTRAINT_NAME
`;

const QUERY_PROCEDURES = `
SELECT
  s.name AS schema_name,
  p.name AS procedure_name,
  CAST(OBJECT_DEFINITION(p.object_id) AS NVARCHAR(MAX)) AS definition
FROM sys.procedures p
JOIN sys.schemas s ON p.schema_id = s.schema_id
ORDER BY s.name, p.name
`;

const QUERY_VIEWS = `
SELECT
  s.name AS schema_name,
  v.name AS view_name,
  CAST(OBJECT_DEFINITION(v.object_id) AS NVARCHAR(MAX)) AS definition
FROM sys.views v
JOIN sys.schemas s ON v.schema_id = s.schema_id
ORDER BY s.name, v.name
`;

const QUERY_TRIGGERS = `
SELECT
  s.name AS schema_name,
  t.name AS trigger_name,
  OBJECT_NAME(t.parent_id) AS parent_table,
  CAST(OBJECT_DEFINITION(t.object_id) AS NVARCHAR(MAX)) AS definition
FROM sys.triggers t
JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE t.parent_class_desc = 'OBJECT_OR_COLUMN'
ORDER BY s.name, t.name
`;

const QUERY_FUNCTIONS = `
SELECT
  s.name AS schema_name,
  o.name AS function_name,
  o.type_desc,
  CAST(OBJECT_DEFINITION(o.object_id) AS NVARCHAR(MAX)) AS definition
FROM sys.objects o
JOIN sys.schemas s ON o.schema_id = s.schema_id
WHERE o.type IN ('FN', 'IF', 'TF', 'FS', 'FT')
ORDER BY s.name, o.name
`;

export interface DiscoverOutput {
  tables: Record<string, Array<Record<string, unknown>>>;
  tableConstraints: Array<Record<string, unknown>>;
  keyColumnUsage: Array<Record<string, unknown>>;
  referentialConstraints: Array<Record<string, unknown>>;
  procedures: Array<Record<string, unknown>>;
  views: Array<Record<string, unknown>>;
  triggers: Array<Record<string, unknown>>;
  functions: Array<Record<string, unknown>>;
  tableList: string[];
  rowCount: number;
}

function loadEnv(): void {
  const root = path.resolve(__dirname, '../..');
  const apiEnv = path.join(root, 'apps/api/.env');
  if (fs.existsSync(apiEnv)) {
    require('dotenv').config({ path: apiEnv });
  }
  const localEnv = path.join(__dirname, '.env');
  if (fs.existsSync(localEnv)) {
    require('dotenv').config({ path: localEnv });
  }
}

async function main(): Promise<void> {
  loadEnv();
  const connStr = process.env.MIGRATION_SQL_SERVER_URL;
  if (!connStr) {
    console.error('Set MIGRATION_SQL_SERVER_URL in apps/api/.env or scripts/migrate-sqlserver-to-pg/.env');
    process.exit(1);
  }

  console.log('Connecting to SQL Server...');
  const pool = await sql.connect(connStr);

  try {
    const tablesResult = await pool.request().query(QUERY_TABLES_COLUMNS);
    const tableRows = (tablesResult.recordset as Array<Record<string, unknown>>) || [];
    const byTable: Record<string, Array<Record<string, unknown>>> = {};
    const tableList: string[] = [];
    const seenTables = new Set<string>();
    for (const r of tableRows) {
      const key = `${r.TABLE_SCHEMA}.${r.TABLE_NAME}`;
      if (!byTable[key]) {
        byTable[key] = [];
        const tableOnly = String(r.TABLE_NAME);
        if (!seenTables.has(tableOnly)) {
          seenTables.add(tableOnly);
          tableList.push(tableOnly);
        }
      }
      byTable[key].push(r);
    }
    tableList.sort();

    console.log('Fetching constraints...');
    const tcResult = await pool.request().query(QUERY_TABLE_CONSTRAINTS);
    const kcuResult = await pool.request().query(QUERY_KEY_COLUMN_USAGE);
    const refResult = await pool.request().query(QUERY_REFERENTIAL);

    console.log('Fetching programmability (procedures, views, triggers, functions)...');
    let procedures: Array<Record<string, unknown>> = [];
    let views: Array<Record<string, unknown>> = [];
    let triggers: Array<Record<string, unknown>> = [];
    let functions: Array<Record<string, unknown>> = [];
    try {
      procedures = (await pool.request().query(QUERY_PROCEDURES)).recordset as Array<Record<string, unknown>>;
    } catch (e) {
      console.warn('Procedures query failed:', (e as Error).message);
    }
    try {
      views = (await pool.request().query(QUERY_VIEWS)).recordset as Array<Record<string, unknown>>;
    } catch (e) {
      console.warn('Views query failed:', (e as Error).message);
    }
    try {
      triggers = (await pool.request().query(QUERY_TRIGGERS)).recordset as Array<Record<string, unknown>>;
    } catch (e) {
      console.warn('Triggers query failed:', (e as Error).message);
    }
    try {
      functions = (await pool.request().query(QUERY_FUNCTIONS)).recordset as Array<Record<string, unknown>>;
    } catch (e) {
      console.warn('Functions query failed:', (e as Error).message);
    }

    const output: DiscoverOutput = {
      tables: byTable,
      tableConstraints: (tcResult.recordset as Array<Record<string, unknown>>) || [],
      keyColumnUsage: (kcuResult.recordset as Array<Record<string, unknown>>) || [],
      referentialConstraints: (refResult.recordset as Array<Record<string, unknown>>) || [],
      procedures,
      views,
      triggers,
      functions,
      tableList,
      rowCount: tableRows.length,
    };

    const outPath = path.join(__dirname, 'discover-output.json');
    fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`Wrote ${tableRows.length} column definitions for ${Object.keys(byTable).length} tables to ${outPath}`);
    console.log(`Constraints: ${output.tableConstraints.length} table constraints, ${output.keyColumnUsage.length} key columns, ${output.referentialConstraints.length} FKs`);
    console.log(`Programmability: ${output.procedures.length} procedures, ${output.views.length} views, ${output.triggers.length} triggers, ${output.functions.length} functions`);
  } finally {
    await pool.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
