# Database setup for seed & API

The seed and API use **PostgreSQL** and read the connection from `DATABASE_URL` in `apps/api/.env`.

## "Authentication failed... credentials for `postgres` are not valid" (P1000)

The app reached the database server but the **username or password** in `DATABASE_URL` are wrong.

- **Fix:** In `apps/api/.env`, set `DATABASE_URL` to a valid connection string:
  - **Local:** `postgresql://postgres:YOUR_PASSWORD@localhost:5432/iteck_erp?schema=public`
  - **Remote (e.g. 192.168.20.67):** Use the correct user and password for that server, e.g.  
    `postgresql://USER:PASSWORD@192.168.20.67:5432/DATABASE_NAME?schema=public`
- Ensure the PostgreSQL user exists and has access to the database. If you use a remote server, get the correct credentials from your DBA or server admin.
- To use **local** PostgreSQL instead, install it, create a database, then point `DATABASE_URL` to `localhost` as in the Local PostgreSQL section below.

## "Can't reach database server at ..."

- **If you see** `Can't reach database server at 192.168.20.67:5432` (or another host), that host is either down or not reachable from your machine.
- **Fix:** Point `DATABASE_URL` to a PostgreSQL instance you can reach (e.g. local).

## Local PostgreSQL

1. Install PostgreSQL (e.g. [postgresql.org](https://www.postgresql.org/download/) or Docker).

2. Create a database (if needed):
   ```bash
   psql -U postgres -c "CREATE DATABASE iteck_erp;"
   ```

3. In `apps/api/.env`, set:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/iteck_erp?schema=public"
   ```
   Replace `USER` and `PASSWORD` with your PostgreSQL user and password.

4. Apply schema and seed:
   ```bash
   cd apps/api
   pnpm run prisma:generate
   pnpm run prisma:migrate
   # or, if you use db push: npx prisma db push
   pnpm run seed
   ```

## Using a remote server

If your PostgreSQL is on another machine (e.g. `192.168.21.31:6632`):

- Ensure the server is running and the port (e.g. **6632**) is open.
- Ensure your machine can reach it (network/firewall).
- **Create the database** on the server if it doesn't exist (connect with psql or pgAdmin, then):
  ```sql
  CREATE DATABASE iteck_erp;
  ```
- **URL-encode the password** if it contains `$`, `#`, `@`, or `:`: `$` → `%24`, `#` → `%23`, `@` → `%40`, `:` → `%3A`.
- In `apps/api/.env` set `DATABASE_URL` with database name and `?schema=public`, e.g.:
  ```env
  DATABASE_URL="postgresql://USER:PASSWORD_ENCODED@192.168.21.31:6632/iteck_erp?schema=public"
  ```
  Encode password: `$` → `%24`, `#` → `%23`. Example: `EmP$D3v#2026` → `EmP%24D3v%232026`.

Then from `apps/api`: `pnpm run prisma:generate`, `pnpm run prisma:migrate`, `pnpm run seed`.
