# Syncing Prisma schema to database (without reset)

Your database has **drift**: it was migrated with migration files that are not in this project, so `prisma migrate dev` wants to reset (and that failed).

Use **`prisma db push`** to apply the current schema without using migration history. This will:

- Add new columns (e.g. `User.employeeId`, Requisition flat approval fields)
- Create new tables (e.g. `requisition_items`)
- **Not** drop existing data or tables
- **Not** fix migration history (you can baseline later if needed)

## Steps

1. **From repo root:**
   ```bash
   cd apps/api
   ```

2. **Push the current schema to the database:**
   ```bash
   npx prisma db push
   ```

3. **Regenerate the Prisma client** (if needed):
   ```bash
   npx prisma generate
   ```

4. **Optional – seed if the DB is empty or you want test data:**
   ```bash
   npx prisma db seed
   ```

## If `db push` fails

- **"Schema would overwrite existing data"**  
  Prisma is trying to change or drop something that would lose data. Fix the schema or the DB manually, or accept the change if the DB is disposable.

- **Connection / timeout**  
  Check `DATABASE_URL` in `.env`, network, and that the DB is running. Increase timeouts if the DB is slow.

- **Permission denied**  
  The DB user needs permission to create tables and alter tables.

## After this

- The app can run with the new requisition flow.
- To use **migrations** again later: copy the missing migration files into `prisma/migrations/` (or baseline with `prisma migrate resolve`) and then use `prisma migrate dev` for new changes.
