-- =============================================================================
-- Phase 1.1: SQL Server Inventory - Programmability (Procedures, Views, Triggers)
-- Run on SQL Server. Captures definitions for conversion to PostgreSQL.
-- =============================================================================

-- Stored procedures
SELECT
    s.name AS schema_name,
    p.name AS procedure_name,
    OBJECT_DEFINITION(p.object_id) AS definition
FROM sys.procedures p
JOIN sys.schemas s ON p.schema_id = s.schema_id
ORDER BY s.name, p.name;

-- Views
SELECT
    s.name AS schema_name,
    v.name AS view_name,
    OBJECT_DEFINITION(v.object_id) AS definition
FROM sys.views v
JOIN sys.schemas s ON v.schema_id = s.schema_id
ORDER BY s.name, v.name;

-- Triggers
SELECT
    s.name AS schema_name,
    t.name AS trigger_name,
    OBJECT_NAME(t.parent_id) AS parent_table,
    OBJECT_DEFINITION(t.object_id) AS definition
FROM sys.triggers t
JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE t.parent_class_desc = 'OBJECT_OR_COLUMN'
ORDER BY s.name, t.name;

-- Functions (scalar and table-valued)
SELECT
    s.name AS schema_name,
    o.name AS function_name,
    o.type_desc,
    OBJECT_DEFINITION(o.object_id) AS definition
FROM sys.objects o
JOIN sys.schemas s ON o.schema_id = s.schema_id
WHERE o.type IN ('FN', 'IF', 'TF', 'FS', 'FT')  -- scalar, inline, table-valued, etc.
ORDER BY s.name, o.name;
