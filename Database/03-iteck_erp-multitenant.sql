-- =============================================================================
-- iteck_erp - Multi-Tenant Schema (Phase 3)
-- Run after 00, 01, 02. Adds tenants registry and tenant_id to tenant-scoped tables.
-- Strategy: Shared DB with TenantId column (recommended).
-- =============================================================================

-- ========== Tenant registry (master) ==========
CREATE TABLE IF NOT EXISTS tenants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(200) NOT NULL,
    subdomain       VARCHAR(100),
    database_name   VARCHAR(100),
    schema_name     VARCHAR(100),
    is_active       BOOLEAN DEFAULT true,
    settings        JSONB DEFAULT '{}',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_code ON tenants(code);
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain) WHERE subdomain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_active ON tenants(is_active);

-- ========== Add tenant_id to tenant-scoped tables ==========
-- departments
ALTER TABLE departments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_departments_tenant ON departments(tenant_id);
-- Backfill: assign to a default tenant if needed (run once): UPDATE departments SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
-- Then: ALTER TABLE departments ALTER COLUMN tenant_id SET NOT NULL;

-- designation
ALTER TABLE designation ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_designation_tenant ON designation(tenant_id);

-- employees
ALTER TABLE employees ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_employees_tenant ON employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employees_tenant_active ON employees(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_employees_tenant_department ON employees(tenant_id, department_id);

-- users
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);

-- leave_balance (via employees; tenant scoped by employee)
-- Optional: add tenant_id for direct filtering
ALTER TABLE leave_balance ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_leave_balance_tenant ON leave_balance(tenant_id);

-- requisition
ALTER TABLE requisition ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_requisition_tenant ON requisition(tenant_id);
CREATE INDEX IF NOT EXISTS idx_requisition_tenant_created ON requisition(tenant_id, req_created_at);

-- requisition_items (tenant via requisition; optional tenant_id for direct filter)
ALTER TABLE requisition_items ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_requisition_items_tenant ON requisition_items(tenant_id);

-- ========== Optional: Row-Level Security (RLS) ==========
-- Enable RLS on tenant-scoped tables and enforce tenant_id = current_setting('app.current_tenant_id')::uuid

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE designation ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE requisition ENABLE ROW LEVEL SECURITY;
ALTER TABLE requisition_items ENABLE ROW LEVEL SECURITY;

-- Policies: restrict to current tenant (set by app per connection/request).
-- During backfill, tenant_id may be NULL: policy allows NULL or matching current_setting.
-- After backfill, set tenant_id NOT NULL and optionally tighten to: USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'departments' AND policyname = 'tenant_isolation') THEN
    CREATE POLICY tenant_isolation ON departments
      FOR ALL USING (tenant_id IS NULL OR tenant_id = (current_setting('app.current_tenant_id', true)::uuid))
      WITH CHECK (tenant_id = (current_setting('app.current_tenant_id', true)::uuid));
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'designation' AND policyname = 'tenant_isolation') THEN
    CREATE POLICY tenant_isolation ON designation
      FOR ALL USING (tenant_id IS NULL OR tenant_id = (current_setting('app.current_tenant_id', true)::uuid))
      WITH CHECK (tenant_id = (current_setting('app.current_tenant_id', true)::uuid));
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employees' AND policyname = 'tenant_isolation') THEN
    CREATE POLICY tenant_isolation ON employees
      FOR ALL USING (tenant_id IS NULL OR tenant_id = (current_setting('app.current_tenant_id', true)::uuid))
      WITH CHECK (tenant_id = (current_setting('app.current_tenant_id', true)::uuid));
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'tenant_isolation') THEN
    CREATE POLICY tenant_isolation ON users
      FOR ALL USING (tenant_id IS NULL OR tenant_id = (current_setting('app.current_tenant_id', true)::uuid))
      WITH CHECK (tenant_id = (current_setting('app.current_tenant_id', true)::uuid));
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leave_balance' AND policyname = 'tenant_isolation') THEN
    CREATE POLICY tenant_isolation ON leave_balance
      FOR ALL USING (tenant_id IS NULL OR tenant_id = (current_setting('app.current_tenant_id', true)::uuid))
      WITH CHECK (tenant_id = (current_setting('app.current_tenant_id', true)::uuid));
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'requisition' AND policyname = 'tenant_isolation') THEN
    CREATE POLICY tenant_isolation ON requisition
      FOR ALL USING (tenant_id IS NULL OR tenant_id = (current_setting('app.current_tenant_id', true)::uuid))
      WITH CHECK (tenant_id = (current_setting('app.current_tenant_id', true)::uuid));
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'requisition_items' AND policyname = 'tenant_isolation') THEN
    CREATE POLICY tenant_isolation ON requisition_items
      FOR ALL USING (tenant_id IS NULL OR tenant_id = (current_setting('app.current_tenant_id', true)::uuid))
      WITH CHECK (tenant_id = (current_setting('app.current_tenant_id', true)::uuid));
  END IF;
END $$;

SELECT 'iteck_erp multitenant schema applied.' AS message;
