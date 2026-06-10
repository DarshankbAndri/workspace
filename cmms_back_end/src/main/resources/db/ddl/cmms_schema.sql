CREATE TABLE IF NOT EXISTS equipment_master (
    id BIGSERIAL PRIMARY KEY,
    equipment_code VARCHAR(50) NOT NULL UNIQUE,
    equipment_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    manufacturer VARCHAR(120),
    model_number VARCHAR(100),
    serial_number VARCHAR(100),
    installation_date DATE,
    warranty_expiry_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    criticality VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendor_master (
    id BIGSERIAL PRIMARY KEY,
    vendor_code VARCHAR(50) NOT NULL UNIQUE,
    vendor_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(120),
    email VARCHAR(150),
    phone VARCHAR(30),
    address VARCHAR(500),
    service_category VARCHAR(120),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance_request (
    id BIGSERIAL PRIMARY KEY,
    request_number VARCHAR(60) NOT NULL UNIQUE,
    equipment_id BIGINT NOT NULL REFERENCES equipment_master(id),
    request_type VARCHAR(40) NOT NULL DEFAULT 'BREAKDOWN',
    priority VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    reported_by VARCHAR(120),
    requested_date DATE NOT NULL,
    target_completion_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance_assignment (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL REFERENCES maintenance_request(id),
    vendor_id BIGINT REFERENCES vendor_master(id),
    assigned_to VARCHAR(120) NOT NULL,
    assigned_date DATE NOT NULL,
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'ASSIGNED',
    estimated_cost NUMERIC(12,2),
    actual_cost NUMERIC(12,2),
    remarks VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS equipment_downtime (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL REFERENCES equipment_master(id),
    request_id BIGINT REFERENCES maintenance_request(id),
    downtime_start TIMESTAMP NOT NULL,
    downtime_end TIMESTAMP,
    downtime_hours NUMERIC(10,2),
    reason VARCHAR(120) NOT NULL,
    planned BOOLEAN NOT NULL DEFAULT FALSE,
    remarks VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_equipment_master_code ON equipment_master(equipment_code);
CREATE INDEX IF NOT EXISTS idx_equipment_master_status ON equipment_master(status);
CREATE INDEX IF NOT EXISTS idx_vendor_master_code ON vendor_master(vendor_code);
CREATE INDEX IF NOT EXISTS idx_vendor_master_active ON vendor_master(active);
CREATE INDEX IF NOT EXISTS idx_request_equipment ON maintenance_request(equipment_id);
CREATE INDEX IF NOT EXISTS idx_request_status ON maintenance_request(status);
CREATE INDEX IF NOT EXISTS idx_assignment_request ON maintenance_assignment(request_id);
CREATE INDEX IF NOT EXISTS idx_downtime_equipment ON equipment_downtime(equipment_id);
CREATE INDEX IF NOT EXISTS idx_downtime_start ON equipment_downtime(downtime_start);
