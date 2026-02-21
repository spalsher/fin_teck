# Validation Checklist (Phase 4)

Use after schema changes and data migration. Document "before vs after" for sign-off.

## 1. Row counts

- [ ] Run `scripts/verification/row-counts-sqlserver.sql` on source and save output.
- [ ] Run `scripts/verification/row-counts-postgres.sql` on target and save output.
- [ ] Compare table-by-table; investigate and fix any mismatch.

## 2. Sample verification queries

- [ ] Run `scripts/verification/verification-queries.sql` on PostgreSQL.
- [ ] Run equivalent queries on SQL Server (see comments in that file).
- [ ] Compare results (e.g. export to CSV and diff).

## 3. Checksums (critical tables)

- [ ] Optionally compute checksum or hash of key columns (or full row) for critical tables on both sides.
- [ ] Record checksum values and date.

## 4. Referential integrity

- [ ] No orphan rows: every FK references an existing parent row.
- [ ] Run any FK validation query (e.g. find employees with invalid department_id).

## 5. Multi-tenant (if applied)

- [ ] Every tenant-scoped row has a non-null `tenant_id` (after backfill).
- [ ] All `tenant_id` values exist in `tenants.id`.
- [ ] RLS (if enabled): verify that setting `app.current_tenant_id` restricts rows to that tenant only.

## 6. Before/after sign-off

| Item | Before (SQL Server) | After (PostgreSQL) | OK |
|------|--------------------|--------------------|-----|
| employees count | | | |
| departments count | | | |
| requisition count | | | |
| Checksum sample | | | |

---

*Re-run after any schema or data change before cutover.*
