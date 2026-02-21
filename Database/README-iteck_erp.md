# iteck_erp Database Schemas

PostgreSQL schemas for **iteck_erp** database. Employees table is aligned with SQL Server **ATS_HRMS.HR_Employees** for sync/link; requisition workflow tables are included.

---

## SQL Server Source (ATS_HRMS)

| Setting    | Value           |
|-----------|-----------------|
| Host      | 192.168.20.166   |
| Username  | tech            |
| Password  | tech            |
| Database  | ATS_HRMS        |
| Table     | HR_Employees    |

**Connection string (SQL Server):**
```
Server=192.168.20.166;Database=ATS_HRMS;User Id=tech;Password=tech;
```

To list columns on the source table (run on SQL Server):
```sql
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM ATS_HRMS.INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'HR_Employees'
ORDER BY ORDINAL_POSITION;
```

---

## Column Mapping: HR_Employees (SQL Server) → employees (PostgreSQL)

| SQL Server HR_Employees (typical) | iteck_erp.employees      |
|-----------------------------------|--------------------------|
| EmployeeID                         | ats_hrms_employee_id     |
| EmpCode / EmployeeCode             | employee_code            |
| FirstName                          | first_name               |
| LastName                           | last_name                |
| FullName                           | full_name                |
| Email                              | email                    |
| Phone                              | phone                    |
| Mobile                             | mobile                   |
| DepartmentID                       | department_id            |
| DesignationID / Designation        | designation_id           |
| JoinDate / HireDate                | join_date / hire_date    |
| TerminationDate                    | termination_date         |
| DOB / DateOfBirth                  | date_of_birth            |
| Gender                             | gender                   |
| MaritalStatus                      | marital_status           |
| CNIC                               | cnic                     |
| Address                            | address                  |
| City                               | city                     |
| ManagerID                          | manager_id               |
| IsActive / Status                  | is_active / status       |
| Photo / ProfilePicture             | profile_picture          |
| CreatedAt / ModifiedDate          | created_at / updated_at  |

**Note:** If your HR_Employees has different column names, adjust the sync/ETL mapping accordingly. `ats_hrms_employee_id` in `employees` stores the source EmployeeID for linking.

---

## Run Order (PostgreSQL)

1. Create database (once):  
   `CREATE DATABASE iteck_erp;`  
   Then connect: `\c iteck_erp`

2. **00-iteck_erp-init.sql** – extensions

3. **01-iteck_erp-employees.sql** – departments, designation, employee_type, employees, leave_balance, users

4. **02-iteck_erp-requisition.sql** – requisition, requisition_items, triggers

5. **03-iteck_erp-multitenant.sql** – tenants table, tenant_id on tables, indexes, optional RLS (multi-tenant)

Example (psql):
```bash
psql -U postgres -d iteck_erp -f Database/00-iteck_erp-init.sql
psql -U postgres -d iteck_erp -f Database/01-iteck_erp-employees.sql
psql -U postgres -d iteck_erp -f Database/02-iteck_erp-requisition.sql
psql -U postgres -d iteck_erp -f Database/03-iteck_erp-multitenant.sql
```

---

## Tables Created

| Schema / File | Tables |
|---------------|--------|
| 01-iteck_erp-employees | departments, designation, employee_type, employees, leave_balance, users |
| 02-iteck_erp-requisition | requisition, requisition_items |

---

## Syncing from ATS_HRMS.HR_Employees

- Use **ats_hrms_employee_id** in `employees` to store SQL Server `EmployeeID`.
- ETL/sync job: SELECT from `ATS_HRMS.dbo.HR_Employees` and INSERT/UPDATE into `iteck_erp.employees` with the column mapping above.
- Ensure `departments` and `designation` (or `desg_name`) exist in iteck_erp before mapping DepartmentID/DesignationID, or insert missing values during sync.

---

## Data migration from SQL Server (Prisma target)

For one-time ETL from SQL Server to the **Prisma-managed** schema on PostgreSQL (e.g. 192.168.21.31, database `iteck_erp`):

1. **Set credentials** (do not commit passwords). In **apps/api/.env** set:
   - `MIGRATION_SQL_SERVER_URL` – SQL Server connection string (e.g. `Server=192.168.20.199;Database=ATS_GL_Test;User Id=alfatech;Password=...;TrustServerCertificate=true;`)
   - `DATABASE_URL` – PostgreSQL connection string (e.g. `postgresql://employee_dev:PASSWORD@192.168.21.31:5432/iteck_erp?schema=public`)

2. **Apply Prisma migrations** on the target PostgreSQL instance:
   ```bash
   cd apps/api && pnpm prisma migrate deploy
   ```
   (Or `prisma db push` if not using migrations.)

3. **Run the migration script** from the repo root:
   ```bash
   pnpm run migrate:sqlserver-to-pg
   ```
   This discovers and migrates mapped tables in FK-safe order; output is in `scripts/migrate-sqlserver-to-pg/migration-report.json`.

4. **Verify** row counts (SQL Server vs PostgreSQL):
   ```bash
   pnpm run migrate:verify
   ```
   Output: `scripts/migrate-sqlserver-to-pg/verification-report.json` and console summary.

Full details (discover, mapping, extending): **[scripts/migrate-sqlserver-to-pg/README.md](../scripts/migrate-sqlserver-to-pg/README.md)**.

**When to use what:** Use **Prisma migrations** for the NestJS API (fin_teck). Use the standalone SQL scripts (00–03 above) for standalone .NET or other sync targets that use the smaller schema.

---

## Full ATS_GL migration (schema + data for .NET backend)

To migrate the **whole** ATS_GL database (SQL Server) to PostgreSQL **iteck_erp** (same table names for the .NET backend):

| Endpoint | Value |
|----------|--------|
| PostgreSQL host | 192.168.21.31 |
| PostgreSQL port | 6632 |
| Database | iteck_erp |
| Username | employee_dev |

(Set password in `.env` only; do not commit.)

**Run order:**

1. Create database and run init: `00-iteck_erp-init.sql`
2. Generate and apply full ATS_GL schema: run **discover** (see scripts README), then **schema-convert**; apply `scripts/ats_gl_schema/10-ats_gl-schema-tables.sql` and `11-ats_gl-schema-keys-indexes.sql` on iteck_erp
3. Run data migration (native mode): `MIGRATION_NATIVE_ATS_GL=true pnpm run migrate:sqlserver-to-pg` (or `MIGRATION_NATIVE_ONLY=true` for native-only)
4. Verify: `pnpm run migrate:verify`

Stored procedures must be converted to PostgreSQL functions or replaced with inline SQL; see **[docs/STORED_PROCEDURES_MIGRATION.md](docs/STORED_PROCEDURES_MIGRATION.md)**.
