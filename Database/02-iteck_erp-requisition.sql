-- =============================================================================
-- iteck_erp - Requisition Schema
-- Run after 01-iteck_erp-employees.sql (employees, departments, designation exist)
-- =============================================================================

-- ========== Requisition main table ==========
CREATE TABLE IF NOT EXISTS requisition (
    req_id                      SERIAL PRIMARY KEY,
    req_reference_no            VARCHAR(50) UNIQUE,
    req_emp_id                  INTEGER NOT NULL REFERENCES employees(employee_id) ON DELETE RESTRICT,
    req_location                VARCHAR(100),
    req_material                TEXT,
    req_priority                VARCHAR(20) DEFAULT 'Medium',
    req_business                VARCHAR(200) DEFAULT 'iTecknologi Tracking Pvt. Ltd',
    -- HOD
    req_hod_approval            SMALLINT DEFAULT 0 CHECK (req_hod_approval IN (0, 1)),
    req_hod_approval_date       TIMESTAMP,
    req_hod_approved_by         INTEGER REFERENCES employees(employee_id),
    -- Committee
    req_committee_approval      SMALLINT DEFAULT 0 CHECK (req_committee_approval IN (0, 1)),
    req_committee_approval_date TIMESTAMP,
    req_committee_approved_by  INTEGER REFERENCES employees(employee_id),
    -- CEO
    req_ceo_approval            SMALLINT DEFAULT 0 CHECK (req_ceo_approval IN (0, 1)),
    req_ceo_approval_date       TIMESTAMP,
    req_ceo_approved_by        INTEGER REFERENCES employees(employee_id),
    -- Procurement
    req_procurement_ack          SMALLINT DEFAULT 0 CHECK (req_procurement_ack IN (0, 1)),
    req_procurement_ack_date     TIMESTAMP,
    req_procurement_ack_by       INTEGER REFERENCES employees(employee_id),
    req_quotation_1_url         VARCHAR(500),
    req_quotation_2_url         VARCHAR(500),
    req_quotation_3_url         VARCHAR(500),
    req_handed_to_finance       SMALLINT DEFAULT 0 CHECK (req_handed_to_finance IN (0, 1)),
    req_handed_to_finance_date  TIMESTAMP,
    -- Finance
    req_finance_approval        SMALLINT DEFAULT 0 CHECK (req_finance_approval IN (0, 1)),
    req_finance_approval_date   TIMESTAMP,
    req_finance_approved_by     INTEGER REFERENCES employees(employee_id),
    req_approved_quotation_index SMALLINT CHECK (req_approved_quotation_index IN (1, 2, 3)),
    -- Common
    req_created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    req_is_rejected             SMALLINT DEFAULT 0 CHECK (req_is_rejected IN (0, 1)),
    req_rejected_by             INTEGER REFERENCES employees(employee_id),
    req_rejected_at             TIMESTAMP,
    req_rejection_reason        TEXT,
    req_expected_handover_date  DATE
);

CREATE INDEX IF NOT EXISTS idx_requisition_emp ON requisition(req_emp_id);
CREATE INDEX IF NOT EXISTS idx_requisition_created ON requisition(req_created_at);
CREATE INDEX IF NOT EXISTS idx_requisition_ref ON requisition(req_reference_no);
CREATE INDEX IF NOT EXISTS idx_requisition_status ON requisition(req_is_rejected);

-- ========== Requisition items (line items) ==========
CREATE TABLE IF NOT EXISTS requisition_items (
    item_id         SERIAL PRIMARY KEY,
    req_id          INTEGER NOT NULL REFERENCES requisition(req_id) ON DELETE CASCADE,
    item_desc       VARCHAR(200),
    item_size       VARCHAR(50),
    item_brand      VARCHAR(50),
    item_qty        INTEGER DEFAULT 1,
    item_est_cost   VARCHAR(50),
    item_remarks    VARCHAR(200)
);

CREATE INDEX IF NOT EXISTS idx_requisition_items_req ON requisition_items(req_id);

-- ========== Generate req_reference_no ==========
CREATE SEQUENCE IF NOT EXISTS req_ref_seq;

CREATE OR REPLACE FUNCTION generate_req_reference_no()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.req_reference_no IS NULL OR NEW.req_reference_no = '' THEN
        NEW.req_reference_no := 'REQ-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('req_ref_seq')::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_requisition_reference ON requisition;
CREATE TRIGGER trg_requisition_reference
    BEFORE INSERT ON requisition
    FOR EACH ROW
    EXECUTE PROCEDURE generate_req_reference_no();

SELECT 'iteck_erp requisition schema created successfully.' AS message;
