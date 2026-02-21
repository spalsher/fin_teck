/**
 * Post-migration verification: row counts SQL Server vs PostgreSQL.
 * Reads MIGRATION_SQL_SERVER_URL and DATABASE_URL from env.
 * If discover-output.json exists, also verifies native ATS_GL tables (same name on both sides).
 */
/// <reference path="./mssql.d.ts" />

import * as sql from 'mssql';
import { Client } from 'pg';
import * as path from 'path';
import * as fs from 'fs';
import { MIGRATION_ORDER } from './mapping';
import { loadDiscoverOutput, tableOrder } from './discovery-util';
import { quoteId } from './type-map';

function loadEnv(): void {
  const root = path.resolve(__dirname, '../..');
  const apiEnv = path.join(root, 'apps/api/.env');
  if (fs.existsSync(apiEnv)) require('dotenv').config({ path: apiEnv });
  const localEnv = path.join(__dirname, '.env');
  if (fs.existsSync(localEnv)) require('dotenv').config({ path: localEnv });
}

async function compareTable(
  sqlPool: sql.ConnectionPool,
  pg: Client,
  sqlTableName: string,
  pgTableRef: string
): Promise<{ table: string; sqlCount: number; pgCount: number; match: boolean }> {
  const sqlTable = sqlTableName.includes('.') ? sqlTableName : `dbo.${sqlTableName}`;
  let sqlCount = 0;
  let pgCount = 0;
  try {
    const r = await sqlPool.request().query(`SELECT COUNT(*) AS cnt FROM ${sqlTable}`);
    sqlCount = (r.recordset as Array<{ cnt: number }>)[0]?.cnt ?? 0;
  } catch {
    // table may not exist
  }
  try {
    const r = await pg.query(`SELECT COUNT(*) AS cnt FROM ${pgTableRef}`);
    pgCount = parseInt(String(r.rows[0]?.cnt ?? 0), 10);
  } catch {
    // table may not exist
  }
  return { table: pgTableRef, sqlCount, pgCount, match: sqlCount === pgCount };
}

async function main(): Promise<void> {
  loadEnv();
  const sqlUrl = process.env.MIGRATION_SQL_SERVER_URL;
  const pgUrl = process.env.DATABASE_URL;
  if (!sqlUrl || !pgUrl) {
    console.error('Set MIGRATION_SQL_SERVER_URL and DATABASE_URL');
    process.exit(1);
  }

  const sqlPool = await sql.connect(sqlUrl);
  const pg = new Client({ connectionString: pgUrl });
  await pg.connect();

  const comparison: Array<{ table: string; sqlCount: number; pgCount: number; match: boolean }> = [];

  try {
    for (const m of MIGRATION_ORDER) {
      const result = await compareTable(sqlPool, pg, m.sqlTable, m.pgTable);
      comparison.push(result);
      console.log(`${result.table}: SQL Server ${result.sqlCount}, PostgreSQL ${result.pgCount} ${result.match ? 'OK' : 'MISMATCH'}`);
    }

    const discovery = loadDiscoverOutput(__dirname);
    if (discovery) {
      const prismaTables = new Set(MIGRATION_ORDER.map((x) => x.sqlTable));
      const nativeOrder = tableOrder(discovery);
      for (const tableName of nativeOrder) {
        if (prismaTables.has(tableName)) continue;
        const pgTableRef = quoteId(tableName);
        const result = await compareTable(sqlPool, pg, tableName, pgTableRef);
        comparison.push(result);
        console.log(`[native] ${result.table}: SQL Server ${result.sqlCount}, PostgreSQL ${result.pgCount} ${result.match ? 'OK' : 'MISMATCH'}`);
      }
    }

    const reportPath = path.join(__dirname, 'verification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({ comparison }, null, 2));
    console.log('Wrote', reportPath);
  } finally {
    await sqlPool.close();
    await pg.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
