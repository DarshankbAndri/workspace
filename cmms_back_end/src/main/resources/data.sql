-- Sample Users Data
-- Default password: andritz (BCrypt hashed)
INSERT INTO users (username, email, first_name, last_name, password, role, department, manager_id, active, created_at, updated_at) VALUES
('alice', 'alice@example.com', 'Alice', 'Johnson', '$2a$10$pzm/TDsZuRtX1l3We1sYoelILNwaQC7foIyDn/HzKWAGusVZtaDc.', 'HR', 'Human Resources', NULL, true, NOW(), NOW()),
('bob', 'bob@example.com', 'Bob', 'Smith', '$2a$10$pzm/TDsZuRtX1l3We1sYoelILNwaQC7foIyDn/HzKWAGusVZtaDc.', 'MANAGER', 'Engineering', NULL, true, NOW(), NOW()),
('charlie', 'charlie@example.com', 'Charlie', 'Brown', '$2a$10$pzm/TDsZuRtX1l3We1sYoelILNwaQC7foIyDn/HzKWAGusVZtaDc.', 'EMPLOYEE', 'Engineering', 2, true, NOW(), NOW()),
('david', 'david@example.com', 'David', 'Wilson', '$2a$10$pzm/TDsZuRtX1l3We1sYoelILNwaQC7foIyDn/HzKWAGusVZtaDc.', 'EMPLOYEE', 'Engineering', 2, true, NOW(), NOW()),
('emma', 'emma@example.com', 'Emma', 'Davis', '$2a$10$pzm/TDsZuRtX1l3We1sYoelILNwaQC7foIyDn/HzKWAGusVZtaDc.', 'MANAGER', 'Sales', NULL, true, NOW(), NOW()),
('frank', 'frank@example.com', 'Frank', 'Miller', '$2a$10$pzm/TDsZuRtX1l3We1sYoelILNwaQC7foIyDn/HzKWAGusVZtaDc.', 'EMPLOYEE', 'Sales', 5, true, NOW(), NOW());

-- Sample CMMS master data
INSERT INTO equipment_master (equipment_code, equipment_name, category, location, manufacturer, model_number, serial_number, installation_date, warranty_expiry_date, status, criticality, created_at, updated_at) VALUES
('EQ-1001', 'Boiler Feed Pump', 'Pump', 'Plant 1', 'ANDRITZ', 'BFP-450', 'SN-BFP-001', '2023-01-15', '2028-01-14', 'ACTIVE', 'HIGH', NOW(), NOW()),
('EQ-1002', 'Hydraulic Press', 'Press', 'Workshop', 'ANDRITZ', 'HP-220', 'SN-HP-014', '2022-06-10', '2027-06-09', 'ACTIVE', 'MEDIUM', NOW(), NOW())
ON CONFLICT (equipment_code) DO NOTHING;

INSERT INTO vendor_master (vendor_code, vendor_name, contact_person, email, phone, address, service_category, active, created_at, updated_at) VALUES
('VEN-1001', 'Precision Maintenance Services', 'Ravi Kumar', 'ravi@precision-maintenance.example', '+91-9876543210', 'Pune, Maharashtra', 'Mechanical', true, NOW(), NOW()),
('VEN-1002', 'Industrial Electrical Works', 'Anita Shah', 'anita@iew.example', '+91-9876501234', 'Chennai, Tamil Nadu', 'Electrical', true, NOW(), NOW())
ON CONFLICT (vendor_code) DO NOTHING;
