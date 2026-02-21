# Wipe iteck_erp and apply current schema (no data to keep)

Since there is no data, you can wipe the database and apply the current Prisma schema from scratch.

## Option 1: Drop schema + db push (recommended)

### Step 1 – Wipe the `public` schema in PostgreSQL

Run this SQL against the **iteck_erp** database (psql, pgAdmin, or any client):

```sql
-- Disable triggers so CASCADE works cleanly
SET session_replication_role = 'replica';

-- Drop and recreate public schema (removes all tables, including _prisma_migrations)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Re-enable triggers
SET session_replication_role = 'origin';
```

Or, if you prefer to drop and recreate the **database** (requires connection to a different DB like `postgres`):

```sql
-- Connect to postgres (or template1), then:
DROP DATABASE IF EXISTS iteck_erp;
CREATE DATABASE iteck_erp;
```

Then point `DATABASE_URL` to `iteck_erp` again.

### Step 2 – Apply current schema and generate client

From the repo root:

```bash
cd apps/api
npx prisma db push
npx prisma generate
```

### Step 3 – Seed (optional)

```bash
npx prisma db seed
```

---

## Option 2: Try migrate reset again

If nothing else is using the DB and you want to use migrations:

```bash
cd apps/api
npx prisma migrate reset --force
```

If you still get “Server has closed the connection”, use Option 1 (manual wipe + `db push`).
