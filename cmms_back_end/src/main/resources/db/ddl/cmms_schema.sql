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
    pm_schedule_id BIGINT,
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

CREATE TABLE IF NOT EXISTS preventive_maintenance_schedule (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL REFERENCES equipment_master(id),
    vendor_id BIGINT REFERENCES vendor_master(id),
    schedule_code VARCHAR(60) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    priority VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',
    assigned_to VARCHAR(120),
    start_date DATE NOT NULL,
    next_due_date DATE NOT NULL,
    last_generated_date DATE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    last_notification_status VARCHAR(120),
    last_notification_at TIMESTAMP,
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
    downtime_minutes BIGINT,
    reason VARCHAR(120) NOT NULL,
    planned BOOLEAN NOT NULL DEFAULT FALSE,
    remarks VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_master (
    site_id BIGSERIAL PRIMARY KEY,
    site_code VARCHAR(50) UNIQUE NOT NULL,
    site_name VARCHAR(200) NOT NULL,
    organization_name VARCHAR(200),
    site_type VARCHAR(100),
    address_line1 VARCHAR(300),
    address_line2 VARCHAR(300),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    pincode VARCHAR(20),
    contact_person VARCHAR(100),
    contact_mobile VARCHAR(20),
    contact_email VARCHAR(150),
    latitude NUMERIC(12,8),
    longitude NUMERIC(12,8),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_master (
    employee_id BIGSERIAL PRIMARY KEY,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    mobile_number VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    gender VARCHAR(20),
    date_of_birth DATE,
    date_of_joining DATE,
    designation VARCHAR(100),
    department VARCHAR(100),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_site_assignment (
    assignment_id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee_master(employee_id),
    site_id BIGINT NOT NULL REFERENCES site_master(site_id),
    role_name VARCHAR(100) NOT NULL,
    is_primary_site BOOLEAN DEFAULT FALSE,
    effective_from DATE,
    effective_to DATE,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendor_site_assignment (
    assignment_id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL REFERENCES vendor_master(id),
    site_id BIGINT NOT NULL REFERENCES site_master(site_id),
    is_primary_site BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id BIGINT;
ALTER TABLE users ADD CONSTRAINT fk_users_employee_id FOREIGN KEY (employee_id) REFERENCES employee_master(employee_id);
ALTER TABLE users ADD CONSTRAINT uk_users_employee_id UNIQUE (employee_id);
ALTER TABLE equipment_master ADD COLUMN IF NOT EXISTS site_id BIGINT;
ALTER TABLE maintenance_request ADD COLUMN IF NOT EXISTS site_id BIGINT;
ALTER TABLE equipment_downtime ADD COLUMN IF NOT EXISTS site_id BIGINT;
ALTER TABLE preventive_maintenance_schedule ADD COLUMN IF NOT EXISTS site_id BIGINT;
ALTER TABLE equipment_master ADD CONSTRAINT fk_equipment_site FOREIGN KEY (site_id) REFERENCES site_master(site_id);
ALTER TABLE maintenance_request ADD CONSTRAINT fk_request_site FOREIGN KEY (site_id) REFERENCES site_master(site_id);
ALTER TABLE equipment_downtime ADD CONSTRAINT fk_downtime_site FOREIGN KEY (site_id) REFERENCES site_master(site_id);
ALTER TABLE preventive_maintenance_schedule ADD CONSTRAINT fk_pm_schedule_site FOREIGN KEY (site_id) REFERENCES site_master(site_id);

CREATE INDEX IF NOT EXISTS idx_equipment_master_code ON equipment_master(equipment_code);
CREATE INDEX IF NOT EXISTS idx_equipment_master_status ON equipment_master(status);
CREATE INDEX IF NOT EXISTS idx_vendor_master_code ON vendor_master(vendor_code);
CREATE INDEX IF NOT EXISTS idx_vendor_master_active ON vendor_master(active);
CREATE INDEX IF NOT EXISTS idx_request_equipment ON maintenance_request(equipment_id);
CREATE INDEX IF NOT EXISTS idx_request_status ON maintenance_request(status);
CREATE INDEX IF NOT EXISTS idx_request_pm_schedule ON maintenance_request(pm_schedule_id);
CREATE INDEX IF NOT EXISTS idx_pm_schedule_due ON preventive_maintenance_schedule(next_due_date);
CREATE INDEX IF NOT EXISTS idx_pm_schedule_active ON preventive_maintenance_schedule(active);
CREATE INDEX IF NOT EXISTS idx_assignment_request ON maintenance_assignment(request_id);
CREATE INDEX IF NOT EXISTS idx_downtime_equipment ON equipment_downtime(equipment_id);
CREATE INDEX IF NOT EXISTS idx_downtime_start ON equipment_downtime(downtime_start);
CREATE INDEX IF NOT EXISTS idx_site_master_code ON site_master(site_code);
CREATE INDEX IF NOT EXISTS idx_site_master_status ON site_master(status);
CREATE INDEX IF NOT EXISTS idx_employee_master_code ON employee_master(employee_code);
CREATE INDEX IF NOT EXISTS idx_employee_master_status ON employee_master(status);
CREATE INDEX IF NOT EXISTS idx_employee_assignment_employee ON employee_site_assignment(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_assignment_site ON employee_site_assignment(site_id);
CREATE INDEX IF NOT EXISTS idx_employee_assignment_status ON employee_site_assignment(status);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_equipment_site_id ON equipment_master(site_id);
CREATE INDEX IF NOT EXISTS idx_request_site_id ON maintenance_request(site_id);
CREATE INDEX IF NOT EXISTS idx_downtime_site_id ON equipment_downtime(site_id);
CREATE INDEX IF NOT EXISTS idx_vendor_site_vendor_id ON vendor_site_assignment(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_site_site_id ON vendor_site_assignment(site_id);
CREATE INDEX IF NOT EXISTS idx_vendor_site_status ON vendor_site_assignment(status);
CREATE INDEX IF NOT EXISTS idx_pm_schedule_site ON preventive_maintenance_schedule(site_id);
