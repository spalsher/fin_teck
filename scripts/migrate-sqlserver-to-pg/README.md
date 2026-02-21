# SQL Server to PostgreSQL migration

One-time migration from SQL Server (192.168.20.199) to PostgreSQL (192.168.21.31, database `iteck_erp`). Uses table/column mapping and FK-safe order; writes to Prisma-managed tables.

## Credentials

Do **not** commit passwords. Set connection strings in **apps/api/.env** (or in this folder as `.env`):

```env
# SQL Server (source). Use Database=ATS_GL or ATS_GL_Test as appropriate.
MIGRATION_SQL_SERVER_URL=Server=192.168.20.199;Database=ATS_GL;User Id=alfatech;Password=YOUR_PASSWORD;TrustServerCertificate=true;

# PostgreSQL (target)
DATABASE_URL=postgresql://employee_dev:YOUR_PASSWORD@192.168.21.31:6632/iteck_erp?schema=public
```

If you get an SSL/TLS error connecting to SQL Server, ensure the machine running the script can reach the SQL Server host. You can set `Encrypt=false` in the connection string only if the server allows it (e.g. dev).

The script loads `apps/api/.env` first, then `scripts/migrate-sqlserver-to-pg/.env` if present.

## Prerequisites

1. **PostgreSQL**: Prisma schema must be applied (`cd apps/api && pnpm prisma migrate deploy` or `prisma db push`) so target tables exist.
2. **Node**: From repo root, install this script’s deps: `cd scripts/migrate-sqlserver-to-pg && pnpm install`.

## Commands

- **Schema discovery** (optional; lists SQL Server tables/columns to `discover-output.json`):
  ```bash
  cd scripts/migrate-sqlserver-to-pg && pnpm run discover
  ```

- **Run migration** (ETL in FK order, skips missing tables):
  ```bash
  cd scripts/migrate-sqlserver-to-pg && pnpm run migrate
  ```
  Output: `migration-report.json` with read/written counts and errors per table.

- **Verify** (row count comparison):
  ```bash
  cd scripts/migrate-sqlserver-to-pg && pnpm run verify
  ```
  Output: `verification-report.json` and console summary.

## Mapping and order

Table and column mapping plus FK order are in `mapping.ts`. Default org, branch, fiscal period, and audit user are created in PostgreSQL if missing.

**ATS_GL (Finance) tables migrated:**

- `ACCOUNT_COMBINATION` → `chart_of_accounts` (accountCode from SEGMENT1–4)
- `AR_Companies` → `customers`
- `AP_SUPPLIER` → `vendors`
- `AR_INVOICE` → `invoices`
- `AP_INVOICE` → `bills`
- `AR_PAYMENT_RECEIPT` → `receipts`
- `GL_JE_HEADER_ALL` → `journal_entries`
- `GL_JE_LINES_ALL` → `journal_entry_lines`

Legacy tables `Organization`, `Branch`, `HR_Department`, `HR_Designation`, `HR_Employees` are included; they are skipped if not present in the source database. Use `Database=ATS_GL` or `ATS_GL_Test` in `MIGRATION_SQL_SERVER_URL` as appropriate.

---

## Full ATS_GL schema + data (native mode)

To migrate the **whole** ATS_GL database (same table names on PostgreSQL for the .NET backend):

1. **Discover** schema and programmability from SQL Server:
   ```bash
   pnpm run migrate:discover
   ```
   Writes `discover-output.json` (tables, columns, keys, FKs, procedures, views, triggers).

2. **Generate PostgreSQL DDL** (Option A naming: keep SQL Server names, quoted):
   ```bash
   pnpm run migrate:schema-convert
   ```
   Creates `Database/scripts/ats_gl_schema/10-ats_gl-schema-tables.sql` and `11-ats_gl-schema-keys-indexes.sql`. Run these on iteck_erp after `00-iteck_erp-init.sql` (e.g. `psql -f 10-... -f 11-...`).

3. **Run data migration** in native mode:
   ```bash
   # Prisma tables + native tables (both)
   MIGRATION_NATIVE_ATS_GL=true pnpm run migrate:sqlserver-to-pg

   # Native tables only (no Prisma defaults or Prisma-mapped tables)
   MIGRATION_NATIVE_ONLY=true MIGRATION_NATIVE_ATS_GL=true pnpm run migrate:sqlserver-to-pg
   ```

4. **Verify** row counts (Prisma and native tables when discover-output.json exists):
   ```bash
   pnpm run migrate:verify
   ```

**Stored procedures:** The .NET app calls ~80 stored procedures. PostgreSQL uses **functions** instead. See [Database/docs/STORED_PROCEDURES_MIGRATION.md](../../Database/docs/STORED_PROCEDURES_MIGRATION.md) for options (convert T-SQL to PL/pgSQL vs. replace with inline SQL in .NET).
