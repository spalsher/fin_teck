# Stored Procedures: SQL Server to PostgreSQL

The .NET backend (ATS_GL_260126) calls ~80 stored procedures (see `ITechnology/Enums/StoreProcedures.cs`). PostgreSQL does not have "stored procedures" in the SQL Server sense; the equivalent is **functions** (returning void or table).

## Options

| Option | Description | Effort |
|--------|-------------|--------|
| **A – Convert T-SQL to PL/pgSQL** | For each procedure, rewrite to PostgreSQL function using [COMPATIBILITY_AND_DATA_TYPE_MAPPING.md](COMPATIBILITY_AND_DATA_TYPE_MAPPING.md). | High; test each |
| **B – Replace with parameterized SQL in .NET** | Change repositories to use `DbDapper.Query`/`Execute` with inline SQL instead of `ExecuteSP`/`ExecuteSp`. | Medium; logic in C# |
| **C – Hybrid** | Convert only critical/complex SPs to PG functions; replace the rest with inline SQL. | Medium |

## Recommendation

- **Short term:** Migrate schema + data first. For procedures: (i) convert a small set of "must-have" SPs to PostgreSQL functions so key flows work, or (ii) temporarily keep a read-only connection to SQL Server for SP calls (not ideal).
- **Medium term:** Prefer **Option B or C**: replace SP usage in Repositories with parameterized queries or a smaller set of PG functions.

## Calling PostgreSQL functions from .NET (Npgsql)

Once a T-SQL procedure is converted to a PostgreSQL function:

- **Function returning a result set:** Use `RETURNS TABLE(...)` in PostgreSQL. Call from C# with:
  ```csharp
  var list = connection.Query<MyType>("SELECT * FROM schema.function_name(@p1, @p2)", new { p1 = value1, p2 = value2 });
  ```
  Do **not** use `CommandType.StoredProcedure`; Npgsql expects `SELECT * FROM function_name(...)` for set-returning functions.

- **Procedure (void):** In PostgreSQL 11+, use `CREATE PROCEDURE` and call with `CALL schema.procedure_name(...)`. With Npgsql use `CommandType.StoredProcedure` or raw `CALL ...`.

- **Function returning void:** Use `CREATE FUNCTION ... RETURNS void` and call as `SELECT function_name(...)`.

## Inventory

After running **discover**, procedure names and definitions are in `scripts/migrate-sqlserver-to-pg/discover-output.json` under `procedures`. Use this list to decide which to convert first and to extract T-SQL definitions for conversion.
