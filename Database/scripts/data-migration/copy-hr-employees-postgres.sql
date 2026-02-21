-- Load HR_Employees CSV into iteck_erp.employees (run after 01-iteck_erp-employees.sql).
-- Ensure departments and designation exist (or load them first); map DepartmentID/DesignationID to iteck_erp IDs.
--
-- Usage (set csv_path before running):
--   psql -d iteck_erp -v "csv_path='C:/temp/hr_employees.csv'" -f copy-hr-employees-postgres.sql
-- Or in psql: \set csv_path 'C:/temp/hr_employees.csv'
--             \i copy-hr-employees-postgres.sql
--
-- Optional: TRUNCATE employees CASCADE;  -- only for full reload

-- COPY with explicit column mapping (CSV columns → PG columns)
-- Assumes CSV header: EmployeeID,EmpCode,FirstName,LastName,FullName,Email,...
COPY employees (
    ats_hrms_employee_id,
    employee_code,
    first_name,
    last_name,
    full_name,
    email,
    phone,
    mobile,
    department_id,
    designation_id,
    join_date,
    hire_date,
    termination_date,
    date_of_birth,
    gender,
    marital_status,
    cnic,
    nationality,
    blood_group,
    address,
    city,
    manager_id,
    is_active,
    status,
    profile_picture,
    created_at,
    updated_at
) FROM :'csv_path'
WITH (FORMAT csv, HEADER true, DELIMITER ',', ENCODING 'UTF8', NULL '');
-- If psql reports "csv_path" not set, run: -v "csv_path='absolute/path/to/file.csv'"

-- If your CSV uses different order, reorder the column list above to match CSV column order.
SELECT 'Loaded ' || count(*) || ' rows into employees.' FROM employees;
