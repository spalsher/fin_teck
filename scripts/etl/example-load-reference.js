/**
 * Example ETL script: load reference data from SQL Server (ATS_GL) into PostgreSQL (fin_teck).
 * Run from repo root: node scripts/etl/example-load-reference.js
 * Requires: SOURCE_MSSQL_CONNECTION and DATABASE_URL in environment (e.g. .env.etl).
 *
 * This is a template. Adapt table/column names to your actual ATS_GL schema and Prisma models.
 */
const { PrismaClient } = require('@prisma/client');
const sql = require('mssql');

const prisma = new PrismaClient();

async function main() {
  const sourceConn = process.env.SOURCE_MSSQL_CONNECTION;
  if (!sourceConn) {
    console.error('Set SOURCE_MSSQL_CONNECTION (SQL Server connection string)');
    process.exit(1);
  }

  let pool;
  try {
    pool = await sql.connect(sourceConn);

    // Example: load organizations from legacy GroupOfCompanies (adjust table/columns to your schema)
    // const orgs = await pool.request().query('SELECT CoID, CoName, ... FROM GroupOfCompanies');
    // for (const row of orgs.recordset) {
    //   await prisma.organization.upsert({ where: { code: row.Code }, create: { ... }, update: { ... } });
    // }

    console.log('ETL example: connect to SQL Server and Prisma OK. Add your load logic.');
  } finally {
    if (pool) await pool.close();
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
