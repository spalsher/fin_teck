-- =============================================================================
-- iteck_erp Database - Initialization
-- Target: PostgreSQL (iteck_erp database)
-- Run this first, then 01-iteck_erp-employees.sql, then 02-iteck_erp-requisition.sql
-- =============================================================================

-- Create database (run as superuser; skip if database already exists)
-- CREATE DATABASE iteck_erp
--   WITH ENCODING = 'UTF8'
--        LC_COLLATE = 'en_US.UTF-8'
--        LC_CTYPE = 'en_US.UTF-8'
--        TEMPLATE = template0;

-- Connect to the database before running other scripts:
-- \c iteck_erp;

-- Enable UUID extension if needed (optional, for uuid columns)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

SELECT 'iteck_erp init complete. Run 01-iteck_erp-employees.sql next.' AS message;
