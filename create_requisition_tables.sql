-- ============================================================
-- CREATE REQUISITION TABLES ONLY
-- This script ONLY creates requisition-related tables
-- It does NOT modify any existing tables
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================================

-- Step 1: Create Requisition Tables (only if they don't exist)
-- ============================================================

CREATE TABLE IF NOT EXISTS "requisition_categories" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "executionDept" TEXT NOT NULL,
    "requiresQuotation" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    CONSTRAINT "requisition_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "category_approval_steps" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "roleCode" TEXT NOT NULL,
    "approvalType" TEXT NOT NULL,
    "minAmount" DECIMAL(19,4),
    "maxAmount" DECIMAL(19,4),
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "category_approval_steps_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "requisitions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "requisitionNo" TEXT NOT NULL,
    "amount" DECIMAL(19,4),
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'INITIATED',
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "requiresQuotation" BOOLEAN NOT NULL DEFAULT false,
    "executionDept" TEXT NOT NULL,
    "executedBy" TEXT,
    "executedAt" TIMESTAMP(3),
    "executionNotes" TEXT,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    CONSTRAINT "requisitions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "requisition_approval_logs" (
    "id" TEXT NOT NULL,
    "requisitionId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "roleCode" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "comments" TEXT,
    "approvedBy" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    CONSTRAINT "requisition_approval_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "quotations" (
    "id" TEXT NOT NULL,
    "requisitionId" TEXT NOT NULL,
    "vendorName" TEXT NOT NULL,
    "vendorContact" TEXT,
    "amount" DECIMAL(19,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "quotationDate" TIMESTAMP(3) NOT NULL,
    "validityDate" TIMESTAMP(3),
    "filePath" TEXT,
    "notes" TEXT,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create Indexes (only if they don't exist)
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS "requisition_categories_organizationId_code_key" 
    ON "requisition_categories"("organizationId", "code");

CREATE INDEX IF NOT EXISTS "requisition_categories_isActive_idx" 
    ON "requisition_categories"("isActive");

CREATE UNIQUE INDEX IF NOT EXISTS "category_approval_steps_categoryId_sequenceNumber_key" 
    ON "category_approval_steps"("categoryId", "sequenceNumber");

CREATE INDEX IF NOT EXISTS "category_approval_steps_categoryId_idx" 
    ON "category_approval_steps"("categoryId");

CREATE UNIQUE INDEX IF NOT EXISTS "requisitions_requisitionNo_key" 
    ON "requisitions"("requisitionNo");

CREATE INDEX IF NOT EXISTS "requisitions_organizationId_idx" 
    ON "requisitions"("organizationId");

CREATE INDEX IF NOT EXISTS "requisitions_status_idx" 
    ON "requisitions"("status");

CREATE INDEX IF NOT EXISTS "requisitions_categoryId_idx" 
    ON "requisitions"("categoryId");

CREATE INDEX IF NOT EXISTS "requisitions_departmentId_idx" 
    ON "requisitions"("departmentId");

CREATE INDEX IF NOT EXISTS "requisitions_createdBy_idx" 
    ON "requisitions"("createdBy");

CREATE INDEX IF NOT EXISTS "requisitions_createdAt_idx" 
    ON "requisitions"("createdAt");

CREATE INDEX IF NOT EXISTS "requisition_approval_logs_requisitionId_idx" 
    ON "requisition_approval_logs"("requisitionId");

CREATE INDEX IF NOT EXISTS "requisition_approval_logs_approvedBy_idx" 
    ON "requisition_approval_logs"("approvedBy");

CREATE INDEX IF NOT EXISTS "requisition_approval_logs_approvedAt_idx" 
    ON "requisition_approval_logs"("approvedAt");

CREATE INDEX IF NOT EXISTS "quotations_requisitionId_idx" 
    ON "quotations"("requisitionId");

CREATE INDEX IF NOT EXISTS "quotations_isSelected_idx" 
    ON "quotations"("isSelected");

-- Step 3: Add Foreign Key Constraints (only if they don't exist)
-- ============================================================
-- Note: These reference existing tables (organizations, branches, departments, users)
-- They do NOT modify those tables, only create relationships

DO $$
BEGIN
    -- Foreign keys for requisition_categories
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'requisition_categories_organizationId_fkey'
    ) THEN
        ALTER TABLE "requisition_categories" 
        ADD CONSTRAINT "requisition_categories_organizationId_fkey" 
        FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") 
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    -- Foreign keys for category_approval_steps
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'category_approval_steps_categoryId_fkey'
    ) THEN
        ALTER TABLE "category_approval_steps" 
        ADD CONSTRAINT "category_approval_steps_categoryId_fkey" 
        FOREIGN KEY ("categoryId") REFERENCES "requisition_categories"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Foreign keys for requisitions
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'requisitions_organizationId_fkey'
    ) THEN
        ALTER TABLE "requisitions" 
        ADD CONSTRAINT "requisitions_organizationId_fkey" 
        FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") 
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'requisitions_branchId_fkey'
    ) THEN
        ALTER TABLE "requisitions" 
        ADD CONSTRAINT "requisitions_branchId_fkey" 
        FOREIGN KEY ("branchId") REFERENCES "branches"("id") 
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'requisitions_categoryId_fkey'
    ) THEN
        ALTER TABLE "requisitions" 
        ADD CONSTRAINT "requisitions_categoryId_fkey" 
        FOREIGN KEY ("categoryId") REFERENCES "requisition_categories"("id") 
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'requisitions_departmentId_fkey'
    ) THEN
        ALTER TABLE "requisitions" 
        ADD CONSTRAINT "requisitions_departmentId_fkey" 
        FOREIGN KEY ("departmentId") REFERENCES "departments"("id") 
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'requisitions_createdBy_fkey'
    ) THEN
        ALTER TABLE "requisitions" 
        ADD CONSTRAINT "requisitions_createdBy_fkey" 
        FOREIGN KEY ("createdBy") REFERENCES "users"("id") 
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    -- Foreign keys for requisition_approval_logs
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'requisition_approval_logs_requisitionId_fkey'
    ) THEN
        ALTER TABLE "requisition_approval_logs" 
        ADD CONSTRAINT "requisition_approval_logs_requisitionId_fkey" 
        FOREIGN KEY ("requisitionId") REFERENCES "requisitions"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'requisition_approval_logs_approvedBy_fkey'
    ) THEN
        ALTER TABLE "requisition_approval_logs" 
        ADD CONSTRAINT "requisition_approval_logs_approvedBy_fkey" 
        FOREIGN KEY ("approvedBy") REFERENCES "users"("id") 
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    -- Foreign keys for quotations
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'quotations_requisitionId_fkey'
    ) THEN
        ALTER TABLE "quotations" 
        ADD CONSTRAINT "quotations_requisitionId_fkey" 
        FOREIGN KEY ("requisitionId") REFERENCES "requisitions"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================================
-- VERIFICATION: Check what was created
-- ============================================================
-- Uncomment below to verify tables were created:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name LIKE 'requisition%' OR table_name = 'quotations'
-- ORDER BY table_name;
