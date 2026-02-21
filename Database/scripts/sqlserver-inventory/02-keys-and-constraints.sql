-- =============================================================================
-- Phase 1.1: SQL Server Inventory - Keys and Constraints
-- Run on SQL Server. Captures PKs, FKs, UNIQUE, CHECK.
-- =============================================================================

-- Table constraints (PK, FK, UNIQUE, CHECK)
SELECT
    tc.TABLE_SCHEMA,
    tc.TABLE_NAME,
    tc.CONSTRAINT_NAME,
    tc.CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
ORDER BY tc.TABLE_SCHEMA, tc.TABLE_NAME, tc.CONSTRAINT_TYPE;

-- Key column usage (which columns are in each constraint)
SELECT
    kcu.TABLE_SCHEMA,
    kcu.TABLE_NAME,
    kcu.CONSTRAINT_NAME,
    kcu.COLUMN_NAME,
    kcu.ORDINAL_POSITION
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
ORDER BY kcu.TABLE_SCHEMA, kcu.TABLE_NAME, kcu.CONSTRAINT_NAME, kcu.ORDINAL_POSITION;

-- Referential constraints (FK references)
SELECT
    rc.CONSTRAINT_NAME,
    rc.UNIQUE_CONSTRAINT_NAME,
    kcu1.TABLE_SCHEMA AS FROM_SCHEMA,
    kcu1.TABLE_NAME AS FROM_TABLE,
    kcu1.COLUMN_NAME AS FROM_COLUMN,
    kcu2.TABLE_SCHEMA AS TO_SCHEMA,
    kcu2.TABLE_NAME AS TO_TABLE,
    kcu2.COLUMN_NAME AS TO_COLUMN
FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu1
    ON rc.CONSTRAINT_NAME = kcu1.CONSTRAINT_NAME AND rc.CONSTRAINT_SCHEMA = kcu1.TABLE_SCHEMA
JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu2
    ON rc.UNIQUE_CONSTRAINT_NAME = kcu2.CONSTRAINT_NAME AND rc.UNIQUE_CONSTRAINT_SCHEMA = kcu2.TABLE_SCHEMA
ORDER BY rc.CONSTRAINT_NAME;

-- Indexes (non-clustered → B-tree in PG)
SELECT
    s.name AS schema_name,
    t.name AS table_name,
    i.name AS index_name,
    i.type_desc,
    i.is_primary_key,
    i.is_unique,
    STRING_AGG(c.name, ', ') WITHIN GROUP (ORDER BY ic.key_ordinal) AS columns
FROM sys.indexes i
JOIN sys.tables t ON i.object_id = t.object_id
JOIN sys.schemas s ON t.schema_id = s.schema_id
JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE i.name IS NOT NULL
GROUP BY s.name, t.name, i.name, i.type_desc, i.is_primary_key, i.is_unique;
