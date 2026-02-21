# Performance Benchmark Report (Phase 4)

Run a representative workload before and after migration (or after index/optimization changes). Record latency and throughput.

## Environment

| Item | Value |
|------|--------|
| PostgreSQL version | |
| Hardware / VM | |
| Dataset size (e.g. rows in employees, requisition) | |

## Queries benchmarked

1. **Employees by tenant (active)** – `SELECT * FROM employees WHERE tenant_id = ? AND is_active = true LIMIT 100`
2. **Requisitions by tenant and date** – last 30 days, limit 50
3. **Employee list with department/designation** – join, limit 100

(Use `scripts/optimization/explain-critical-queries.sql` to capture EXPLAIN ANALYZE.)

## Results

| Query | Execution time (ms) | Notes |
|-------|---------------------|--------|
| Employees by tenant | | |
| Requisitions by tenant/date | | |
| Employee + dept/desg join | | |

## Index list

Run `scripts/optimization/index-list-postgres.sql` and attach output (or summarize):

- Indexes on `tenant_id` and `(tenant_id, ...)` for main access paths are present.
- Redundant indexes removed: ___________

## Execution plans

Attach or paste sample `EXPLAIN (ANALYZE, BUFFERS)` output for the critical queries above. Ensure:

- Index scans (not full table scans) where expected.
- No excessive buffer reads.

## Recommendations

- Index tuning: ___________
- Query changes: ___________

---

*Fill in after running validation and optimization steps.*
