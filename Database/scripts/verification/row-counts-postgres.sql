-- Run on PostgreSQL (iteck_erp). Row counts for migration verification.
-- Compare with row-counts-sqlserver.sql output.

SELECT 'employees' AS table_name, count(*) AS row_count FROM employees
UNION ALL
SELECT 'departments', count(*) FROM departments
UNION ALL
SELECT 'designation', count(*) FROM designation
UNION ALL
SELECT 'users', count(*) FROM users
UNION ALL
SELECT 'requisition', count(*) FROM requisition
UNION ALL
SELECT 'requisition_items', count(*) FROM requisition_items
UNION ALL
SELECT 'leave_balance', count(*) FROM leave_balance
ORDER BY table_name;
