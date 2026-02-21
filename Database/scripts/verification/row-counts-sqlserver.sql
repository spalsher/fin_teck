-- Run on SQL Server. Row counts for migration verification.
-- Save output and compare with row-counts-postgres.sql.

SELECT 'HR_Employees' AS table_name, COUNT(*) AS row_count FROM dbo.HR_Employees
UNION ALL
SELECT 'HR_Department', COUNT(*) FROM dbo.HR_Department
UNION ALL
SELECT 'HR_Designation', COUNT(*) FROM dbo.HR_Designation;
-- Add other tables as needed (e.g. ATS_GL_Test tables).
