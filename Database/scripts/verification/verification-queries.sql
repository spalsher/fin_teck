-- Verification query set: run equivalent on SQL Server and PostgreSQL, compare results.
-- Use for sample-based validation (Phase 2.4).

-- 1) Row count employees
-- SQL Server: SELECT COUNT(*) FROM dbo.HR_Employees;
-- PostgreSQL:
SELECT count(*) AS employees_count FROM employees;

-- 2) Sample of first 5 employees (id, code, name)
-- SQL Server: SELECT TOP 5 EmployeeID, EmpCode, FirstName, LastName FROM dbo.HR_Employees ORDER BY EmployeeID;
-- PostgreSQL:
SELECT employee_id, employee_code, first_name, last_name
FROM employees
ORDER BY employee_id
LIMIT 5;

-- 3) Count by department (if you have departments in both)
-- SQL Server: SELECT DepartmentID, COUNT(*) FROM dbo.HR_Employees GROUP BY DepartmentID;
-- PostgreSQL:
SELECT department_id, count(*)
FROM employees
GROUP BY department_id
ORDER BY department_id;

-- 4) Count active employees
-- SQL Server: SELECT COUNT(*) FROM dbo.HR_Employees WHERE IsActive = 1;
-- PostgreSQL:
SELECT count(*) AS active_count FROM employees WHERE is_active = true;

-- Run these on both sides and diff the outputs (e.g. export to CSV and compare).
