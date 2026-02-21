# Table and column mapping: SQL Server to PostgreSQL (Prisma)

Used by the migration script in `scripts/migrate-sqlserver-to-pg/`. FK-safe order ensures parents are migrated before children.

## Migration order

| Order | SQL Server table | PostgreSQL table (Prisma) |
|-------|------------------|---------------------------|
| 1 | Organization (dbo) | organizations |
| 2 | Branch (dbo) | branches |
| 3 | HR_Department | departments |
| 4 | HR_Designation | designations |
| 5 | HR_Employees | employees |

## Column mapping (summary)

- **Organization**: Org_ID → id (new UUID), Org_Name → name, Org_Code → code, Tax_ID → taxId, Address → address (JSON), Settings → settings (JSON), Currency → currency.
- **Branch**: Branch_ID → id (new UUID), Org_ID → organizationId (from Organization id map), Branch_Name → name, Branch_Code → code, Address → address (JSON), Phone, Email, IsActive.
- **HR_Department**: Dept_ID → id (new UUID), Dept_Code → code, Dept_Name → name, Description, IsActive. Defaults: organizationId, createdBy, updatedBy.
- **HR_Designation**: Desg_ID → id (new UUID), Desg_Code → code, Desg_Name → title, Level, IsActive. Default: organizationId.
- **HR_Employees**: HR_Emp_ID → id (new UUID), Emp_Code → employeeCode, First_Name → firstName, Last_Name → lastName, Email, Personal_Cell_No → phone, DateOfBirth → dateOfBirth, Joining_Date → hireDate, Last_Working_Date → terminationDate, Joining_Dept_ID → departmentId (FK map HR_Department), Joining_Dsg_ID → designationId (FK map HR_Designation), Report_To → managerId (FK map HR_Employees), plus status, gender, maritalStatus, address, etc. Defaults: organizationId, branchId, createdBy, updatedBy.

## ID resolution

The script maintains in-memory maps: `sqlTable -> oldId -> newUUID` for Organization, Branch, HR_Department, HR_Designation, HR_Employees. Foreign keys (e.g. departmentId, designationId, managerId) are resolved from these maps before insert.

## Extending

Edit `scripts/migrate-sqlserver-to-pg/mapping.ts`: add entries to `MIGRATION_ORDER` with `sqlTable`, `pgTable`, `columns`, and optional `defaultOrgId`/`defaultBranchId`/`defaultAudit`/`generateId`. Use `fkTable` on column maps for FK resolution.
