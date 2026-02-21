-- =============================================================================
-- Phase 1.1: SQL Server Inventory - Schemas and Tables
-- Run on SQL Server (e.g. ATS_HRMS, ATS_GL_Test) with read-only or analysis user.
-- Output: Document schema name, table name, and column metadata.
-- =============================================================================

-- Tables and columns (with data types for migration mapping)
SELECT
    t.TABLE_SCHEMA,
    t.TABLE_NAME,
    c.COLUMN_NAME,
    c.ORDINAL_POSITION,
    c.DATA_TYPE,
    c.CHARACTER_MAXIMUM_LENGTH,
    c.NUMERIC_PRECISION,
    c.NUMERIC_SCALE,
    c.DATETIME_PRECISION,
    c.IS_NULLABLE,
    c.COLUMN_DEFAULT,
    c.COLLATION_NAME
FROM INFORMATION_SCHEMA.TABLES t
JOIN INFORMATION_SCHEMA.COLUMNS c
    ON t.TABLE_SCHEMA = c.TABLE_SCHEMA AND t.TABLE_NAME = c.TABLE_NAME
WHERE t.TABLE_TYPE = 'BASE TABLE'
ORDER BY t.TABLE_SCHEMA, t.TABLE_NAME, c.ORDINAL_POSITION;
