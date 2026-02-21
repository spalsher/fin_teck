-- Sample EXPLAIN (ANALYZE, BUFFERS) for critical queries (Phase 4).
-- Run against PostgreSQL to capture execution time and plans; compare before/after migration or index changes.

-- 1) List employees by tenant (with tenant filter)
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM employees
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
  AND is_active = true
ORDER BY employee_id
LIMIT 100;

-- 2) Requisitions by tenant and date
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM requisition
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
  AND req_created_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY req_created_at DESC
LIMIT 50;

-- 3) Employee with department/designation (join)
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT e.employee_id, e.employee_code, e.full_name, d.name AS department, des.desg_name
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN designation des ON e.designation_id = des.desg_id
WHERE e.tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
LIMIT 100;

-- Replace the UUID with a real tenant id from your tenants table. Save output for benchmark report.
