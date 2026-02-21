-- =============================================================================
-- iteck_erp - Employees Schema
-- Matches SQL Server ATS_HRMS.HR_Employees columns + ERP columns
-- SQL Server source: Host 192.168.20.166, DB: ATS_HRMS, Table: HR_Employees
-- Credentials: tech / tech
-- =============================================================================

-- ========== Departments (ERP) ==========
CREATE TABLE IF NOT EXISTS departments (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(50) NOT NULL,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_departments_code ON departments(code);

-- ========== Designations (ERP) ==========
CREATE TABLE IF NOT EXISTS designation (
    desg_id         SERIAL PRIMARY KEY,
    desg_name       VARCHAR(100) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_designation_name ON designation(desg_name);

-- ========== Employee Type (for requisition approval workflow) ==========
CREATE TABLE IF NOT EXISTS employee_type (
    emp_type_id     SERIAL PRIMARY KEY,
    emp_type_name   VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO employee_type (emp_type_name) VALUES
    ('Employee'), ('HOD'), ('Committee'), ('CEO'), ('Procurement'), ('Finance')
ON CONFLICT (emp_type_name) DO NOTHING;

-- ========== Employees ==========
-- Columns aligned with SQL Server HR_Employees (ATS_HRMS) + remaining ERP columns
-- Mapping: HR_Employees.EmployeeID -> ats_hrms_employee_id (source sync key)
CREATE TABLE IF NOT EXISTS employees (
    -- Primary key (PostgreSQL)
    employee_id         SERIAL PRIMARY KEY,
    -- Sync key: SQL Server ATS_HRMS.HR_Employees.EmployeeID (use for sync/link)
    ats_hrms_employee_id INTEGER UNIQUE,
    -- Core (match HR_Employees)
    employee_code       VARCHAR(50) UNIQUE NOT NULL,
    first_name         VARCHAR(100) NOT NULL,
    last_name          VARCHAR(100) NOT NULL,
    full_name          VARCHAR(255),
    email              VARCHAR(255),
    phone              VARCHAR(50),
    mobile             VARCHAR(50),
    -- Department / Designation (match HR_Employees)
    department_id      INTEGER REFERENCES departments(id),
    designation_id     INTEGER REFERENCES designation(desg_id),
    employee_type_id   INTEGER REFERENCES employee_type(emp_type_id),
    -- Dates (match HR_Employees)
    join_date          DATE,
    hire_date          DATE,
    termination_date   DATE,
    date_of_birth      DATE,
    confirmation_date  DATE,
    probation_end_date DATE,
    -- Personal (match HR_Employees)
    gender             VARCHAR(10),
    marital_status    VARCHAR(20),
    cnic               VARCHAR(20),
    nationality        VARCHAR(50),
    blood_group        VARCHAR(10),
    -- Address
    address            TEXT,
    city               VARCHAR(100),
    -- Employment
    manager_id         INTEGER REFERENCES employees(employee_id),
    status             VARCHAR(30) DEFAULT 'ACTIVE',
    is_active          BOOLEAN DEFAULT true,
    -- Auth / ERP (remaining columns)
    password_hash      VARCHAR(255),
    profile_picture    VARCHAR(500),
    notes              TEXT,
    -- ERP multi-tenant (optional; add if using org/branch)
    -- organization_id    UUID,
    -- branch_id          UUID,
    -- Audit
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by         VARCHAR(100),
    updated_by         VARCHAR(100)
);

-- Maintain full_name from first_name + last_name if not provided
CREATE OR REPLACE FUNCTION employees_full_name_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.full_name IS NULL OR NEW.full_name = '' THEN
        NEW.full_name := TRIM(NEW.first_name || ' ' || NEW.last_name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_employees_full_name ON employees;
CREATE TRIGGER trg_employees_full_name
    BEFORE INSERT OR UPDATE ON employees
    FOR EACH ROW EXECUTE PROCEDURE employees_full_name_trigger();

CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_designation ON employees(designation_id);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_ats_hrms_id ON employees(ats_hrms_employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_employee_code ON employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_join_date ON employees(join_date);

-- Update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ========== Optional: Leave balance (if needed) ==========
CREATE TABLE IF NOT EXISTS leave_balance (
    employee_id     INTEGER PRIMARY KEY REFERENCES employees(employee_id) ON DELETE CASCADE,
    annual_leave    INTEGER DEFAULT 15,
    sick_leave      INTEGER DEFAULT 10,
    personal_leave  INTEGER DEFAULT 5,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== Optional: Users (portal login linked to employee) ==========
CREATE TABLE IF NOT EXISTS users (
    user_id         SERIAL PRIMARY KEY,
    username        VARCHAR(100) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    user_type       VARCHAR(30) DEFAULT 'Staff' CHECK (user_type IN ('Admin', 'SuperAdmin', 'Staff', 'User')),
    employee_id     INTEGER NOT NULL UNIQUE REFERENCES employees(employee_id) ON DELETE CASCADE,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);

SELECT 'iteck_erp employees schema created. Run 02-iteck_erp-requisition.sql next.' AS message;
