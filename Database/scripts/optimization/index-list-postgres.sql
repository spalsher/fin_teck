-- List indexes on tenant-scoped and main tables (Phase 4 – index tuning).
-- Use to ensure indexes on tenant_id and common filters (dates, status); remove redundant ones.

SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('tenants', 'departments', 'designation', 'employees', 'users', 'leave_balance', 'requisition', 'requisition_items', 'employee_type')
ORDER BY tablename, indexname;
