-- Run this against iteck_erp when you want to wipe all data and start fresh.
-- Usage: psql "postgresql://postgres:12345678@192.168.20.67:5432/iteck_erp" -f wipe-public-schema.sql

SET session_replication_role = 'replica';

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

SET session_replication_role = 'origin';
