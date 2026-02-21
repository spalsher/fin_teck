# Verification Scripts (Phase 2.4)

After data migration:

1. **Row counts**: Run `row-counts-sqlserver.sql` on SQL Server and `row-counts-postgres.sql` on PostgreSQL. Compare table names and counts; investigate any mismatch.

2. **Sample queries**: Run the queries in `verification-queries.sql` on PostgreSQL (and their SQL Server equivalents, commented in that file) and compare results (e.g. export to CSV and diff).

3. **Checksums** (optional): For critical tables, checksum key columns or full row hashes on both sides and compare.

Document "before vs after" for migration sign-off (Phase 4).
