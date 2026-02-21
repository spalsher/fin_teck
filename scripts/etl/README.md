# ETL: SQL Server (ATS_GL) to PostgreSQL (fin_teck)

This folder contains scripts and guidance for migrating data from the legacy SQL Server database (ATS_GL) to the fin_teck PostgreSQL database.

## Prerequisites

- Node.js 18+
- Access to SQL Server (e.g. 192.168.20.199, database ATS_GL, user alfatech)
- PostgreSQL (iteck_erp) with Prisma schema applied
- Optional: `mssql` npm package for Node-based ETL

## Migration order

1. **Reference data**: Organizations, Branches, Chart of Accounts, Cost Centers, Tax Categories, Units of Measure, Grades, Departments, Designations.
2. **Users and auth**: Users, Roles, Permissions, UserRole, RolePermission (map legacy to fin_teck permission codes).
3. **Master data**: Customers, Vendors, Items, Item Categories, Employees.
4. **Transactional data**: Fiscal Periods, Journal Entries/Lines, Bills, Invoices, Receipts, etc.

## Running ETL

- Use the example script as a template. From repo root: `cd apps/api && node ../../scripts/etl/example-load-reference.js` (so Prisma client resolves). Install `mssql` in apps/api if needed: `pnpm add mssql`.
- Or use SQL Server Integration Services / Azure Data Factory / custom C# for production ETL.
- Preserve or map IDs if external systems reference them; otherwise use new UUIDs from Prisma.

## Environment

Create a `.env.etl` (do not commit) with:

- `SOURCE_MSSQL_CONNECTION` – SQL Server connection string (e.g. `Server=192.168.20.199;Database=ATS_GL;User Id=alfatech;Password=***;TrustServerCertificate=True;`)
- `DATABASE_URL` – PostgreSQL connection string (same as fin_teck API)

Then: `dotenv -e .env.etl node scripts/etl/example-load-reference.js`
