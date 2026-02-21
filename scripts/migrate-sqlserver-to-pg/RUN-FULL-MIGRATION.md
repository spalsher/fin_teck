# Run Full ATS_GL → PostgreSQL Migration

Run these commands **from the repo root** `D:\Github\fin_teck` in order.

---

## 1. Discover (if you need to refresh schema from SQL Server)

```powershell
cd D:\Github\fin_teck
pnpm run migrate:discover
```

*(Skip if `scripts/migrate-sqlserver-to-pg/discover-output.json` already exists.)*

---

## 2. Generate PostgreSQL schema files

```powershell
cd D:\Github\fin_teck
pnpm run migrate:schema-convert
```

---

## 3. Create tables on PostgreSQL

```powershell
cd D:\Github\fin_teck
pnpm run migrate:apply-schema
```

---

## 4. Copy all data (native tables) — creates `migration-report.json` when done

```powershell
cd D:\Github\fin_teck
$env:MIGRATION_NATIVE_ONLY = "true"
$env:MIGRATION_NATIVE_ATS_GL = "true"
pnpm run migrate:sqlserver-to-pg
```

**This step can take a long time** (large tables). Let it finish. When it completes, you will see `migration-report.json` in `scripts/migrate-sqlserver-to-pg/`.

**If the connection drops** (e.g. "Connection terminated unexpectedly"): run the same command again. The script **resumes** from the last completed table using `migration-progress.json`. To start over from table 1, delete `scripts/migrate-sqlserver-to-pg/migration-progress.json` then run again.

---

## 5. Verify row counts

```powershell
cd D:\Github\fin_teck
pnpm run migrate:verify
```

---

## One-liner (steps 4 + 5 after 1–3 are done)

After schema is applied, run migration then verify:

```powershell
cd D:\Github\fin_teck; $env:MIGRATION_NATIVE_ONLY="true"; $env:MIGRATION_NATIVE_ATS_GL="true"; pnpm run migrate:sqlserver-to-pg
```

When that finishes:

```powershell
pnpm run migrate:verify
```
