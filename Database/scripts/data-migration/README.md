# Data Migration Scripts (Phase 2)

Migrate data from SQL Server to PostgreSQL. Use after PostgreSQL schema is created (run `00-iteck_erp-init.sql`, `01-iteck_erp-employees.sql`, `02-iteck_erp-requisition.sql`).

## Option C: CSV Export + COPY

1. **Export from SQL Server** (adjust table/columns if your schema differs):
   ```powershell
   cd Database/scripts/data-migration
   .\export-hr-employees-sqlserver.ps1 -ConnectionString "Server=192.168.20.166;Database=ATS_HRMS;User Id=tech;Password=tech;TrustServerCertificate=true;" -OutputPath ".\hr_employees.csv"
   ```

2. **Load into PostgreSQL**:
   - Ensure `department_id` and `designation_id` in iteck_erp are populated (or map SQL Server IDs to existing rows).
   - Edit `copy-hr-employees-postgres.sql` to set `csv_path` to the full path of `hr_employees.csv`.
   - Run:
     ```bash
     psql -d iteck_erp -v csv_path='C:/path/to/hr_employees.csv' -f copy-hr-employees-postgres.sql
     ```
   - On Windows use forward slashes or escaped backslashes for the path.

## Option A: .NET ETL (SqlBulkCopy + NpgsqlBinaryImporter)

See the `MigrationTool` project in the same plan’s deliverables: a .NET console app that reads from SQL Server with `SqlBulkCopy` and writes to PostgreSQL with `NpgsqlBinaryImporter`, batch by table in FK order. Implement per plan Phase 2.2 Option A if you need maximum performance.

## Referential integrity

- Load parent tables (e.g. `departments`, `designation`) before `employees`; load `employees` before `requisition`, `users`, `leave_balance`.
- Disable triggers during bulk load if needed (e.g. `ALTER TABLE employees DISABLE TRIGGER USER;`), then re-enable and run verification.
