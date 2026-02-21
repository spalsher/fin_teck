# SQL Server Inventory Scripts (Phase 1)

Run these on your SQL Server instance (e.g. `192.168.20.166` with databases `ATS_HRMS`, `ATS_GL_Test`) to extract metadata for the migration report.

## Prerequisites

- Access to SQL Server (read-only sufficient).
- For PowerShell runner: `SqlServer` PowerShell module (`Install-Module SqlServer`) or use SSMS/sqlcmd.

## Manual Run (SSMS / sqlcmd)

1. Connect to the server and database (e.g. `ATS_HRMS` or `ATS_GL_Test`).
2. Execute in order:
   - `01-schemas-and-tables.sql` → save results as `inventory-tables-columns.csv` or similar.
   - `02-keys-and-constraints.sql` → save results (constraints, key columns, FKs, indexes).
   - `03-programmability.sql` → save results (procedures, views, triggers, functions).

Run once per database if migrating multiple databases.

## PowerShell Runner (optional)

From the repo root (fin_teck):

```powershell
# Set your connection string; run per database
$connStr = "Server=192.168.20.166;Database=ATS_HRMS;User Id=tech;Password=tech;TrustServerCertificate=true;"
.\Database\scripts\sqlserver-inventory\Run-Inventory.ps1 -ConnectionString $connStr -OutputDir .\Database\scripts\sqlserver-inventory\output
```

Output will be CSV files in `OutputDir` for each script.

## Output Usage

- Feed the **Compatibility and Data Type Mapping** document (see `Database/docs/COMPATIBILITY_AND_DATA_TYPE_MAPPING.md`) when designing PostgreSQL DDL and ETL.
- Use constraint/index output to create equivalent PKs, FKs, and indexes in PostgreSQL.
- Use programmability output to convert procedures, views, and triggers to PostgreSQL syntax.
