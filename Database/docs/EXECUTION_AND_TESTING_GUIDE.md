# Step-by-Step Execution and Testing Guide

Order of running scripts, environment setup, smoke tests, and performance testing for the SQL Server → PostgreSQL migration and .NET multi-tenant upgrade.

---

## 1. Prerequisites

- SQL Server (source) accessible, e.g. `192.168.20.166` with `ATS_HRMS` / `ATS_GL_Test`.
- PostgreSQL 14+ installed; database `iteck_erp` created.
- .NET 8 SDK for the ITechnology backend.

---

## 2. Execution Order

### Phase 1 – Analysis (on SQL Server)

1. Run inventory scripts (see `Database/scripts/sqlserver-inventory/README.md`):
   - `01-schemas-and-tables.sql`
   - `02-keys-and-constraints.sql`
   - `03-programmability.sql`
2. Save outputs; use with `Database/docs/COMPATIBILITY_AND_DATA_TYPE_MAPPING.md` for schema design and T-SQL conversion.

### Phase 2 – PostgreSQL schema and data

1. Create database: `CREATE DATABASE iteck_erp;`
2. Run in order:
   - `Database/00-iteck_erp-init.sql`
   - `Database/01-iteck_erp-employees.sql`
   - `Database/02-iteck_erp-requisition.sql`
3. Data migration: use `Database/scripts/data-migration/` (export from SQL Server to CSV, then COPY into PostgreSQL) or ETL tool. See `scripts/data-migration/README.md`.
4. Verification: run `Database/scripts/verification/row-counts-postgres.sql` and compare with SQL Server row counts; run `verification-queries.sql`.

### Phase 3 – Multi-tenant

1. Run `Database/03-iteck_erp-multitenant.sql`.
2. Insert at least one tenant: `INSERT INTO tenants (id, code, name, is_active) VALUES (gen_random_uuid(), 'DEFAULT', 'Default Tenant', true);`
3. Backfill `tenant_id` on existing rows (set to the default tenant id), then optionally `ALTER TABLE ... ALTER COLUMN tenant_id SET NOT NULL`.

### Phase 4 – Validation and optimization

1. Re-run row counts and verification queries (see `Database/docs/VALIDATION_CHECKLIST.md`).
2. Run `Database/scripts/optimization/index-list-postgres.sql` and `explain-critical-queries.sql`; fill `Database/docs/PERFORMANCE_BENCHMARK_REPORT.md`.

### Phase 5 – .NET application

1. Ensure `appsettings.json` (or environment) has PostgreSQL connection string, e.g.  
   `Host=...;Database=iteck_erp;Username=...;Password=...;Include Error Detail=true`
2. Build and run the ITechnology backend (ATS_GL_260126): `dotnet run --project ITechnology`
3. Send requests with tenant header, e.g. `X-Tenant-Code: DEFAULT` or `X-Tenant-Id: <uuid>`.
4. Run smoke tests (login, key CRUD, reports) and record results.

---

## 3. Smoke Tests

- **Health**: GET a public endpoint (if any) or login endpoint; expect 200 or 401 (not 500).
- **Tenant**: Call an API that uses tenant context with `X-Tenant-Code: DEFAULT`; verify response is tenant-scoped.
- **Data**: List employees (or equivalent) and confirm data matches PostgreSQL.
- **Auth**: Login with JWT; call a protected endpoint; verify success.

---

## 4. Performance Test

- Run the queries in `Database/scripts/optimization/explain-critical-queries.sql` with `EXPLAIN (ANALYZE, BUFFERS)`.
- Record execution times and row counts; compare before/after index or schema changes.
- Document in `Database/docs/PERFORMANCE_BENCHMARK_REPORT.md`.

---

## 5. Deployment and Rollback

- **Deploy**: Apply PostgreSQL scripts in order (00 → 01 → 02 → 03); run data migration; deploy .NET 8 app with PostgreSQL connection string and tenant middleware.
- **Tenant onboarding**: Insert into `tenants`; backfill `tenant_id` for the new tenant’s data (or create schema if using schema-per-tenant).
- **Rollback**: Keep SQL Server and previous .NET build available; revert app config to SQL Server connection string and redeploy previous .NET version; use backup of PostgreSQL if needed to restore state.

---

*Ref: SQL Server to PostgreSQL and .NET Multi-Tenant Migration plan.*
