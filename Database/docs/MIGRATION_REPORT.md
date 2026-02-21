# Migration report (SQL Server to PostgreSQL)

After running the migration script and verification, document results here for sign-off.

## How to run

1. Set `MIGRATION_SQL_SERVER_URL` and `DATABASE_URL` in `apps/api/.env` (see `scripts/migrate-sqlserver-to-pg/README.md`).
2. Apply Prisma migrations to target PostgreSQL: `cd apps/api && pnpm prisma migrate deploy`.
3. Run migration: `pnpm run migrate:sqlserver-to-pg`.
4. Run verification: `pnpm run migrate:verify`.

## Report template

| Table (PG)   | SQL Server rows | PostgreSQL rows | Match |
|--------------|-----------------|-----------------|-------|
| organizations |                 |                 |       |
| branches      |                 |                 |       |
| departments   |                 |                 |       |
| designations  |                 |                 |       |
| employees     |                 |                 |       |

Fill from `scripts/migrate-sqlserver-to-pg/migration-report.json` and `verification-report.json` after each run.

## Spot checks (optional)

- Compare a sample of employees (e.g. first 5 by id) between SQL Server and PostgreSQL: key columns (code, name, email) should match after mapping.
- Verify default organization and branch exist and are referenced by migrated rows.

## Sign-off

- [ ] Row counts documented and any mismatch investigated.
- [ ] Spot checks (if run) passed.
- [ ] Migration report JSON files retained for audit.
