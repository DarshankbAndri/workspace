-- CMMS sample data seed script
-- Path: src/main/resources/db/sample/cmms_sample_data.sql
--
-- How to run:
--   psql -h <host> -p <port> -U <user> -d <database> -f src/main/resources/db/sample/cmms_sample_data.sql
--
-- Expected order:
--   Run after Liquibase has created the current CMMS schema.
--
-- Sample login users inserted:
--   username: cmms.superadmin, cmms.hr, cmms.manager, cmms.maint.manager,
--             cmms.tech01, cmms.tech02, cmms.tech03, cmms.viewer01,
--             cmms.tech04, cmms.viewer02
--   password: andritz
--
-- Notes:
--   This script is idempotent for unique master records. Transactional tables without
--   natural unique keys use NOT EXISTS checks against sample codes/request numbers.

BEGIN;

-- 1. Sites
INSERT INTO site_master (
    site_code, site_name, organization_name, site_type, address_line1, address_line2,
    city, state, country, pincode, contact_person, contact_mobile, contact_email,
    latitude, longitude, status, created_at, updated_at
) VALUES
('SITE-001', 'Pune Manufacturing Plant', 'ANDRITZ CMMS Demo', 'Manufacturing', 'Plot 11, Industrial Area', 'Phase 1', 'Pune', 'Maharashtra', 'India', '411057', 'Amit Patil', '+91-9000000001', 'pune.site@example.com', 18.52043000, 73.85674000, 'ACTIVE', NOW(), NOW()),
('SITE-002', 'Chennai Assembly Unit', 'ANDRITZ CMMS Demo', 'Assembly', '12 SIPCOT Road', 'Block B', 'Chennai', 'Tamil Nadu', 'India', '600119', 'Priya Raman', '+91-9000000002', 'chennai.site@example.com', 13.08268000, 80.27072000, 'ACTIVE', NOW(), NOW()),
('SITE-003', 'Vadodara Service Center', 'ANDRITZ CMMS Demo', 'Service', 'GIDC Estate', 'Makarpura', 'Vadodara', 'Gujarat', 'India', '390010', 'Nilesh Shah', '+91-9000000003', 'vadodara.site@example.com', 22.30716000, 73.18122000, 'ACTIVE', NOW(), NOW()),
('SITE-004', 'Hyderabad Utilities Plant', 'ANDRITZ CMMS Demo', 'Utilities', 'Hitech City Road', 'Sector 4', 'Hyderabad', 'Telangana', 'India', '500081', 'Meera Reddy', '+91-9000000004', 'hyderabad.site@example.com', 17.38504000, 78.48667000, 'ACTIVE', NOW(), NOW()),
('SITE-005', 'Bengaluru R&D Workshop', 'ANDRITZ CMMS Demo', 'Workshop', 'Peenya Industrial Area', 'Stage 2', 'Bengaluru', 'Karnataka', 'India', '560058', 'Kiran Rao', '+91-9000000005', 'bengaluru.site@example.com', 12.97160000, 77.59456000, 'ACTIVE', NOW(), NOW()),
('SITE-006', 'Mumbai Warehouse', 'ANDRITZ CMMS Demo', 'Warehouse', 'MIDC Road', 'Andheri East', 'Mumbai', 'Maharashtra', 'India', '400093', 'Rohit Mehta', '+91-9000000006', 'mumbai.site@example.com', 19.07600000, 72.87770000, 'ACTIVE', NOW(), NOW()),
('SITE-007', 'Delhi Operations Yard', 'ANDRITZ CMMS Demo', 'Operations', 'Okhla Industrial Estate', 'Phase 3', 'New Delhi', 'Delhi', 'India', '110020', 'Sneha Kapoor', '+91-9000000007', 'delhi.site@example.com', 28.61390000, 77.20900000, 'ACTIVE', NOW(), NOW()),
('SITE-008', 'Kolkata Pump Station', 'ANDRITZ CMMS Demo', 'Pump Station', 'Salt Lake Sector V', 'Unit 8', 'Kolkata', 'West Bengal', 'India', '700091', 'Arindam Sen', '+91-9000000008', 'kolkata.site@example.com', 22.57260000, 88.36390000, 'ACTIVE', NOW(), NOW()),
('SITE-009', 'Coimbatore Fabrication Shop', 'ANDRITZ CMMS Demo', 'Fabrication', 'Avinashi Road', 'Industrial Block', 'Coimbatore', 'Tamil Nadu', 'India', '641014', 'Lakshmi Nair', '+91-9000000009', 'coimbatore.site@example.com', 11.01680000, 76.95580000, 'ACTIVE', NOW(), NOW()),
('SITE-010', 'Nagpur Maintenance Depot', 'ANDRITZ CMMS Demo', 'Depot', 'Hingna MIDC', 'Sector A', 'Nagpur', 'Maharashtra', 'India', '440016', 'Vikram Deshmukh', '+91-9000000010', 'nagpur.site@example.com', 21.14580000, 79.08820000, 'ACTIVE', NOW(), NOW())
ON CONFLICT (site_code) DO NOTHING;

-- 2. Employees
INSERT INTO employee_master (
    employee_code, first_name, last_name, mobile_number, email, gender, date_of_birth,
    date_of_joining, designation, department, status, created_at, updated_at
) VALUES
('EMP-001', 'Suresh', 'Iyer', '+91-9100000001', 'suresh.iyer@example.com', 'MALE', '1982-04-11', '2015-01-05', 'Super Admin', 'Administration', 'ACTIVE', NOW(), NOW()),
('EMP-002', 'Ananya', 'Sharma', '+91-9100000002', 'ananya.sharma@example.com', 'FEMALE', '1988-09-23', '2017-03-15', 'HR Manager', 'Human Resources', 'ACTIVE', NOW(), NOW()),
('EMP-003', 'Raghav', 'Menon', '+91-9100000003', 'raghav.menon@example.com', 'MALE', '1985-12-05', '2016-07-20', 'Site Manager', 'Operations', 'ACTIVE', NOW(), NOW()),
('EMP-004', 'Neha', 'Kulkarni', '+91-9100000004', 'neha.kulkarni@example.com', 'FEMALE', '1990-02-17', '2018-11-12', 'Maintenance Manager', 'Maintenance', 'ACTIVE', NOW(), NOW()),
('EMP-005', 'Imran', 'Khan', '+91-9100000005', 'imran.khan@example.com', 'MALE', '1992-06-30', '2019-06-01', 'Technician', 'Maintenance', 'ACTIVE', NOW(), NOW()),
('EMP-006', 'Pooja', 'Nair', '+91-9100000006', 'pooja.nair@example.com', 'FEMALE', '1993-01-14', '2020-01-10', 'Technician', 'Maintenance', 'ACTIVE', NOW(), NOW()),
('EMP-007', 'Manoj', 'Pillai', '+91-9100000007', 'manoj.pillai@example.com', 'MALE', '1989-08-22', '2018-05-25', 'Electrical Engineer', 'Maintenance', 'ACTIVE', NOW(), NOW()),
('EMP-008', 'Divya', 'Rao', '+91-9100000008', 'divya.rao@example.com', 'FEMALE', '1991-10-19', '2019-09-09', 'Planner', 'Operations', 'ACTIVE', NOW(), NOW()),
('EMP-009', 'Karthik', 'S', '+91-9100000009', 'karthik.s@example.com', 'MALE', '1994-03-27', '2021-02-18', 'Technician', 'Utilities', 'ACTIVE', NOW(), NOW()),
('EMP-010', 'Farah', 'Ali', '+91-9100000010', 'farah.ali@example.com', 'FEMALE', '1995-11-03', '2022-04-04', 'Safety Officer', 'EHS', 'ACTIVE', NOW(), NOW())
ON CONFLICT (employee_code) DO NOTHING;

-- 3. Employee site assignments
INSERT INTO employee_site_assignment (employee_id, site_id, role_name, is_primary_site, effective_from, effective_to, status, created_at, updated_at)
SELECT e.employee_id, s.site_id, v.role_name, v.is_primary_site, DATE '2024-01-01', NULL, 'ACTIVE', NOW(), NOW()
FROM (VALUES
    ('EMP-001', 'SITE-001', 'SUPER_ADMIN', true),
    ('EMP-002', 'SITE-002', 'HR_ADMIN', true),
    ('EMP-003', 'SITE-003', 'SITE_MANAGER', true),
    ('EMP-004', 'SITE-004', 'MAINTENANCE_MANAGER', true),
    ('EMP-005', 'SITE-005', 'TECHNICIAN', true),
    ('EMP-006', 'SITE-006', 'TECHNICIAN', true),
    ('EMP-007', 'SITE-007', 'TECHNICIAN', true),
    ('EMP-008', 'SITE-008', 'VIEWER', true),
    ('EMP-009', 'SITE-009', 'TECHNICIAN', true),
    ('EMP-010', 'SITE-010', 'VIEWER', true)
) AS v(employee_code, site_code, role_name, is_primary_site)
JOIN employee_master e ON e.employee_code = v.employee_code
JOIN site_master s ON s.site_code = v.site_code
WHERE NOT EXISTS (
    SELECT 1 FROM employee_site_assignment esa
    WHERE esa.employee_id = e.employee_id AND esa.site_id = s.site_id AND esa.role_name = v.role_name
);

-- 4. Roles
INSERT INTO role_master (role_code, role_name, description, status, created_at, updated_at) VALUES
('SUPER_ADMIN', 'Super Admin', 'Full system access across all sites', 'ACTIVE', NOW(), NOW()),
('ADMIN', 'Admin', 'Administrative access across all operation sites', 'ACTIVE', NOW(), NOW()),
('HR_ADMIN', 'HR Admin', 'HR site and employee administration access', 'ACTIVE', NOW(), NOW()),
('SITE_MANAGER', 'Site Manager', 'Operation management access for assigned sites', 'ACTIVE', NOW(), NOW()),
('MAINTENANCE_MANAGER', 'Maintenance Manager', 'Maintenance access for assigned sites', 'ACTIVE', NOW(), NOW()),
('TECHNICIAN', 'Technician', 'Technician access for assigned sites', 'ACTIVE', NOW(), NOW()),
('VIEWER', 'Viewer', 'Read-only access for assigned sites', 'ACTIVE', NOW(), NOW())
ON CONFLICT (role_code) DO NOTHING;

-- 5. Permissions
INSERT INTO permission_master (permission_code, permission_name, module_name, action_name, status, created_at, updated_at) VALUES
('DASHBOARD_VIEW', 'View Dashboard', 'Dashboard', 'VIEW', 'ACTIVE', NOW(), NOW()),
('SITE_VIEW', 'View Sites', 'Site', 'VIEW', 'ACTIVE', NOW(), NOW()),
('SITE_CREATE', 'Create Sites', 'Site', 'CREATE', 'ACTIVE', NOW(), NOW()),
('SITE_UPDATE', 'Update Sites', 'Site', 'UPDATE', 'ACTIVE', NOW(), NOW()),
('SITE_DELETE', 'Delete Sites', 'Site', 'DELETE', 'ACTIVE', NOW(), NOW()),
('EMPLOYEE_VIEW', 'View Employees', 'Employee', 'VIEW', 'ACTIVE', NOW(), NOW()),
('EMPLOYEE_CREATE', 'Create Employees', 'Employee', 'CREATE', 'ACTIVE', NOW(), NOW()),
('EMPLOYEE_UPDATE', 'Update Employees', 'Employee', 'UPDATE', 'ACTIVE', NOW(), NOW()),
('EMPLOYEE_DELETE', 'Delete Employees', 'Employee', 'DELETE', 'ACTIVE', NOW(), NOW()),
('EQUIPMENT_VIEW', 'View Equipment', 'Equipment', 'VIEW', 'ACTIVE', NOW(), NOW()),
('EQUIPMENT_CREATE', 'Create Equipment', 'Equipment', 'CREATE', 'ACTIVE', NOW(), NOW()),
('EQUIPMENT_UPDATE', 'Update Equipment', 'Equipment', 'UPDATE', 'ACTIVE', NOW(), NOW()),
('EQUIPMENT_DELETE', 'Delete Equipment', 'Equipment', 'DELETE', 'ACTIVE', NOW(), NOW()),
('VENDOR_VIEW', 'View Vendors', 'Vendor', 'VIEW', 'ACTIVE', NOW(), NOW()),
('VENDOR_CREATE', 'Create Vendors', 'Vendor', 'CREATE', 'ACTIVE', NOW(), NOW()),
('VENDOR_UPDATE', 'Update Vendors', 'Vendor', 'UPDATE', 'ACTIVE', NOW(), NOW()),
('VENDOR_DELETE', 'Delete Vendors', 'Vendor', 'DELETE', 'ACTIVE', NOW(), NOW()),
('REQUEST_VIEW', 'View Requests', 'Request', 'VIEW', 'ACTIVE', NOW(), NOW()),
('REQUEST_CREATE', 'Create Requests', 'Request', 'CREATE', 'ACTIVE', NOW(), NOW()),
('REQUEST_UPDATE', 'Update Requests', 'Request', 'UPDATE', 'ACTIVE', NOW(), NOW()),
('REQUEST_DELETE', 'Delete Requests', 'Request', 'DELETE', 'ACTIVE', NOW(), NOW()),
('ASSIGNMENT_VIEW', 'View Assignments', 'Assignment', 'VIEW', 'ACTIVE', NOW(), NOW()),
('ASSIGNMENT_CREATE', 'Create Assignments', 'Assignment', 'CREATE', 'ACTIVE', NOW(), NOW()),
('ASSIGNMENT_UPDATE', 'Update Assignments', 'Assignment', 'UPDATE', 'ACTIVE', NOW(), NOW()),
('ASSIGNMENT_DELETE', 'Delete Assignments', 'Assignment', 'DELETE', 'ACTIVE', NOW(), NOW()),
('ASSIGNMENT_WORK_LOG_VIEW', 'View Assignment Work Logs', 'Assignment Work Log', 'VIEW', 'ACTIVE', NOW(), NOW()),
('ASSIGNMENT_WORK_LOG_CREATE', 'Create Assignment Work Logs', 'Assignment Work Log', 'CREATE', 'ACTIVE', NOW(), NOW()),
('ASSIGNMENT_WORK_LOG_UPDATE', 'Update Assignment Work Logs', 'Assignment Work Log', 'UPDATE', 'ACTIVE', NOW(), NOW()),
('ASSIGNMENT_WORK_LOG_DELETE', 'Delete Assignment Work Logs', 'Assignment Work Log', 'DELETE', 'ACTIVE', NOW(), NOW()),
('ASSIGNMENT_WORK_LOG_ATTACHMENT_UPLOAD', 'Upload Assignment Work Log Attachments', 'Assignment Work Log', 'ATTACHMENT_UPLOAD', 'ACTIVE', NOW(), NOW()),
('ASSIGNMENT_WORK_LOG_ATTACHMENT_DELETE', 'Delete Assignment Work Log Attachments', 'Assignment Work Log', 'ATTACHMENT_DELETE', 'ACTIVE', NOW(), NOW()),
('DOWNTIME_VIEW', 'View Downtime', 'Downtime', 'VIEW', 'ACTIVE', NOW(), NOW()),
('DOWNTIME_CREATE', 'Create Downtime', 'Downtime', 'CREATE', 'ACTIVE', NOW(), NOW()),
('DOWNTIME_UPDATE', 'Update Downtime', 'Downtime', 'UPDATE', 'ACTIVE', NOW(), NOW()),
('DOWNTIME_DELETE', 'Delete Downtime', 'Downtime', 'DELETE', 'ACTIVE', NOW(), NOW()),
('REPORT_VIEW', 'View Reports', 'Report', 'VIEW', 'ACTIVE', NOW(), NOW()),
('ROLE_VIEW', 'View Roles', 'Admin', 'VIEW', 'ACTIVE', NOW(), NOW()),
('ROLE_CREATE', 'Create Roles', 'Admin', 'CREATE', 'ACTIVE', NOW(), NOW()),
('ROLE_UPDATE', 'Update Roles', 'Admin', 'UPDATE', 'ACTIVE', NOW(), NOW()),
('ROLE_DELETE', 'Delete Roles', 'Admin', 'DELETE', 'ACTIVE', NOW(), NOW()),
('PERMISSION_VIEW', 'View Permissions', 'Admin', 'VIEW', 'ACTIVE', NOW(), NOW()),
('USER_ROLE_VIEW', 'View User Roles', 'Admin', 'VIEW', 'ACTIVE', NOW(), NOW()),
('USER_ROLE_UPDATE', 'Update User Roles', 'Admin', 'UPDATE', 'ACTIVE', NOW(), NOW()),
('USER_ROLE_ASSIGN', 'Assign User Roles', 'Admin', 'ASSIGN', 'ACTIVE', NOW(), NOW())
ON CONFLICT (permission_code) DO NOTHING;

-- 6. Role permissions
INSERT INTO role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM role_master r
CROSS JOIN permission_master p
WHERE r.role_code IN ('SUPER_ADMIN', 'ADMIN')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM role_master r
JOIN permission_master p ON p.permission_code IN (
    'DASHBOARD_VIEW', 'SITE_VIEW', 'SITE_CREATE', 'SITE_UPDATE', 'SITE_DELETE',
    'EMPLOYEE_VIEW', 'EMPLOYEE_CREATE', 'EMPLOYEE_UPDATE', 'EMPLOYEE_DELETE',
    'ROLE_VIEW', 'PERMISSION_VIEW', 'USER_ROLE_VIEW', 'USER_ROLE_ASSIGN'
)
WHERE r.role_code = 'HR_ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM role_master r
JOIN permission_master p ON p.permission_code IN (
    'DASHBOARD_VIEW', 'EQUIPMENT_VIEW', 'EQUIPMENT_CREATE', 'EQUIPMENT_UPDATE',
    'VENDOR_VIEW', 'REQUEST_VIEW', 'REQUEST_CREATE', 'REQUEST_UPDATE',
    'ASSIGNMENT_VIEW', 'ASSIGNMENT_CREATE', 'ASSIGNMENT_UPDATE',
    'ASSIGNMENT_WORK_LOG_VIEW', 'ASSIGNMENT_WORK_LOG_CREATE', 'ASSIGNMENT_WORK_LOG_UPDATE',
    'ASSIGNMENT_WORK_LOG_DELETE', 'ASSIGNMENT_WORK_LOG_ATTACHMENT_UPLOAD', 'ASSIGNMENT_WORK_LOG_ATTACHMENT_DELETE',
    'DOWNTIME_VIEW', 'DOWNTIME_CREATE', 'DOWNTIME_UPDATE', 'REPORT_VIEW'
)
WHERE r.role_code IN ('SITE_MANAGER', 'MAINTENANCE_MANAGER')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM role_master r
JOIN permission_master p ON p.permission_code IN ('DASHBOARD_VIEW', 'EQUIPMENT_VIEW', 'REQUEST_VIEW', 'REQUEST_UPDATE', 'DOWNTIME_VIEW', 'DOWNTIME_CREATE')
WHERE r.role_code = 'TECHNICIAN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM role_master r
JOIN permission_master p ON p.permission_code IN (
    'ASSIGNMENT_WORK_LOG_VIEW', 'ASSIGNMENT_WORK_LOG_CREATE', 'ASSIGNMENT_WORK_LOG_UPDATE', 'ASSIGNMENT_WORK_LOG_ATTACHMENT_UPLOAD'
)
WHERE r.role_code = 'TECHNICIAN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM role_master r
JOIN permission_master p ON p.permission_code IN ('DASHBOARD_VIEW', 'SITE_VIEW', 'EMPLOYEE_VIEW', 'EQUIPMENT_VIEW', 'VENDOR_VIEW', 'REQUEST_VIEW', 'ASSIGNMENT_VIEW', 'DOWNTIME_VIEW', 'REPORT_VIEW')
WHERE r.role_code = 'VIEWER'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 7. Login users
INSERT INTO users (
    username, email, first_name, last_name, password, role, department,
    manager_id, employee_id, active, created_at, updated_at
)
SELECT v.username, v.email, e.first_name, e.last_name,
       '$2a$10$pzm/TDsZuRtX1l3We1sYoelILNwaQC7foIyDn/HzKWAGusVZtaDc.',
       v.auth_role, e.department, NULL, e.employee_id, true, NOW(), NOW()
FROM (VALUES
    ('cmms.superadmin', 'cmms.superadmin@example.com', 'EMP-001', 'ADMIN'),
    ('cmms.hr', 'cmms.hr@example.com', 'EMP-002', 'HR'),
    ('cmms.manager', 'cmms.manager@example.com', 'EMP-003', 'MANAGER'),
    ('cmms.maint.manager', 'cmms.maint.manager@example.com', 'EMP-004', 'MANAGER'),
    ('cmms.tech01', 'cmms.tech01@example.com', 'EMP-005', 'EMPLOYEE'),
    ('cmms.tech02', 'cmms.tech02@example.com', 'EMP-006', 'EMPLOYEE'),
    ('cmms.tech03', 'cmms.tech03@example.com', 'EMP-007', 'EMPLOYEE'),
    ('cmms.viewer01', 'cmms.viewer01@example.com', 'EMP-008', 'EMPLOYEE'),
    ('cmms.tech04', 'cmms.tech04@example.com', 'EMP-009', 'EMPLOYEE'),
    ('cmms.viewer02', 'cmms.viewer02@example.com', 'EMP-010', 'EMPLOYEE')
) AS v(username, email, employee_code, auth_role)
JOIN employee_master e ON e.employee_code = v.employee_code
ON CONFLICT (username) DO NOTHING;

-- 8. User roles
INSERT INTO user_role (user_id, role_id, site_id, status, created_at, updated_at)
SELECT u.id, r.role_id, s.site_id, 'ACTIVE', NOW(), NOW()
FROM (VALUES
    ('cmms.superadmin', 'SUPER_ADMIN', 'SITE-001'),
    ('cmms.hr', 'HR_ADMIN', 'SITE-002'),
    ('cmms.manager', 'SITE_MANAGER', 'SITE-003'),
    ('cmms.maint.manager', 'MAINTENANCE_MANAGER', 'SITE-004'),
    ('cmms.tech01', 'TECHNICIAN', 'SITE-005'),
    ('cmms.tech02', 'TECHNICIAN', 'SITE-006'),
    ('cmms.tech03', 'TECHNICIAN', 'SITE-007'),
    ('cmms.viewer01', 'VIEWER', 'SITE-008'),
    ('cmms.tech04', 'TECHNICIAN', 'SITE-009'),
    ('cmms.viewer02', 'VIEWER', 'SITE-010')
) AS v(username, role_code, site_code)
JOIN users u ON u.username = v.username
JOIN role_master r ON r.role_code = v.role_code
JOIN site_master s ON s.site_code = v.site_code
WHERE NOT EXISTS (
    SELECT 1 FROM user_role ur
    WHERE ur.user_id = u.id AND ur.role_id = r.role_id AND COALESCE(ur.site_id, -1) = s.site_id
);

-- 9. Vendors
INSERT INTO vendor_master (
    vendor_code, vendor_name, contact_person, email, phone, address,
    service_category, active, created_at, updated_at
) VALUES
('VEN-001', 'Apex Mechanical Services', 'Ravi Kumar', 'ravi.kumar@apexmech.example', '+91-9200000001', 'Pune, Maharashtra', 'Mechanical', true, NOW(), NOW()),
('VEN-002', 'Bright Electrical Works', 'Anita Shah', 'anita.shah@brightelectrical.example', '+91-9200000002', 'Chennai, Tamil Nadu', 'Electrical', true, NOW(), NOW()),
('VEN-003', 'HydroCare Pumps', 'Vijay Nair', 'vijay.nair@hydrocare.example', '+91-9200000003', 'Vadodara, Gujarat', 'Pumps', true, NOW(), NOW()),
('VEN-004', 'ThermalTech Services', 'Mohan Reddy', 'mohan.reddy@thermaltech.example', '+91-9200000004', 'Hyderabad, Telangana', 'Boiler', true, NOW(), NOW()),
('VEN-005', 'Precision Drives India', 'Leena Rao', 'leena.rao@precisiondrives.example', '+91-9200000005', 'Bengaluru, Karnataka', 'Drives', true, NOW(), NOW()),
('VEN-006', 'Metro Instrumentation', 'Sanjay Mehta', 'sanjay.mehta@metroinst.example', '+91-9200000006', 'Mumbai, Maharashtra', 'Instrumentation', true, NOW(), NOW()),
('VEN-007', 'NorthStar Fabricators', 'Ritu Kapoor', 'ritu.kapoor@northstarfab.example', '+91-9200000007', 'Delhi, India', 'Fabrication', true, NOW(), NOW()),
('VEN-008', 'Eastern Utilities Support', 'Subho Sen', 'subho.sen@easternutilities.example', '+91-9200000008', 'Kolkata, West Bengal', 'Utilities', true, NOW(), NOW()),
('VEN-009', 'Coimbatore Machine Care', 'Arun Prakash', 'arun.prakash@cmcare.example', '+91-9200000009', 'Coimbatore, Tamil Nadu', 'Machine Maintenance', true, NOW(), NOW()),
('VEN-010', 'Central Safety Systems', 'Geeta Deshmukh', 'geeta.deshmukh@centralsafety.example', '+91-9200000010', 'Nagpur, Maharashtra', 'Safety Systems', true, NOW(), NOW())
ON CONFLICT (vendor_code) DO NOTHING;

-- 10. Vendor site assignments
INSERT INTO vendor_site_assignment (vendor_id, site_id, is_primary_site, status, created_at, updated_at)
SELECT vnd.id, s.site_id, true, 'ACTIVE', NOW(), NOW()
FROM (VALUES
    ('VEN-001', 'SITE-001'), ('VEN-002', 'SITE-002'), ('VEN-003', 'SITE-003'), ('VEN-004', 'SITE-004'), ('VEN-005', 'SITE-005'),
    ('VEN-006', 'SITE-006'), ('VEN-007', 'SITE-007'), ('VEN-008', 'SITE-008'), ('VEN-009', 'SITE-009'), ('VEN-010', 'SITE-010')
) AS v(vendor_code, site_code)
JOIN vendor_master vnd ON vnd.vendor_code = v.vendor_code
JOIN site_master s ON s.site_code = v.site_code
WHERE NOT EXISTS (
    SELECT 1 FROM vendor_site_assignment vsa
    WHERE vsa.vendor_id = vnd.id AND vsa.site_id = s.site_id
);

-- 11. Equipment
INSERT INTO equipment_master (
    equipment_code, equipment_name, site_id, category, location, manufacturer,
    model_number, serial_number, installation_date, warranty_expiry_date,
    status, criticality, created_at, updated_at
)
SELECT v.equipment_code, v.equipment_name, s.site_id, v.category, v.location, v.manufacturer,
       v.model_number, v.serial_number, v.installation_date::date, v.warranty_expiry_date::date,
       'ACTIVE', v.criticality, NOW(), NOW()
FROM (VALUES
    ('EQ-001', 'Boiler Feed Pump', 'SITE-001', 'Pump', 'Utility Bay 1', 'ANDRITZ', 'BFP-450', 'SN-EQ-001', '2023-01-15', '2028-01-14', 'HIGH'),
    ('EQ-002', 'Hydraulic Press', 'SITE-002', 'Press', 'Assembly Line 2', 'ANDRITZ', 'HP-220', 'SN-EQ-002', '2022-06-10', '2027-06-09', 'MEDIUM'),
    ('EQ-003', 'Cooling Tower Fan', 'SITE-003', 'Fan', 'Cooling Area', 'CT Systems', 'CTF-90', 'SN-EQ-003', '2021-09-01', '2026-08-31', 'HIGH'),
    ('EQ-004', 'Air Compressor', 'SITE-004', 'Compressor', 'Compressor Room', 'Atlas Demo', 'AC-75', 'SN-EQ-004', '2020-03-12', '2025-03-11', 'HIGH'),
    ('EQ-005', 'CNC Milling Machine', 'SITE-005', 'CNC', 'Machine Shop', 'Mazak Demo', 'CNC-M5', 'SN-EQ-005', '2023-05-20', '2028-05-19', 'MEDIUM'),
    ('EQ-006', 'Forklift', 'SITE-006', 'Material Handling', 'Warehouse A', 'Toyota Demo', 'FL-30', 'SN-EQ-006', '2022-10-08', '2027-10-07', 'LOW'),
    ('EQ-007', 'EOT Crane', 'SITE-007', 'Crane', 'Operations Yard', 'Kone Demo', 'EOT-15T', 'SN-EQ-007', '2021-12-11', '2026-12-10', 'HIGH'),
    ('EQ-008', 'Raw Water Pump', 'SITE-008', 'Pump', 'Pump House', 'Kirloskar Demo', 'RWP-120', 'SN-EQ-008', '2020-07-17', '2025-07-16', 'HIGH'),
    ('EQ-009', 'Welding Station', 'SITE-009', 'Welding', 'Fabrication Bay', 'Lincoln Demo', 'WS-400', 'SN-EQ-009', '2023-02-22', '2028-02-21', 'MEDIUM'),
    ('EQ-010', 'Fire Pump Controller', 'SITE-010', 'Safety', 'Fire Pump Room', 'SafeTech Demo', 'FPC-12', 'SN-EQ-010', '2021-04-04', '2026-04-03', 'CRITICAL')
) AS v(equipment_code, equipment_name, site_code, category, location, manufacturer, model_number, serial_number, installation_date, warranty_expiry_date, criticality)
JOIN site_master s ON s.site_code = v.site_code
ON CONFLICT (equipment_code) DO NOTHING;

-- 12. Maintenance requests
INSERT INTO maintenance_request (
    request_number, equipment_id, site_id, request_type, priority, status, title,
    description, reported_by, requested_date, target_completion_date, created_at, updated_at
)
SELECT v.request_number, e.id, s.site_id, v.request_type, v.priority, v.status, v.title,
       v.description, v.reported_by, v.requested_date::date, v.target_completion_date::date, NOW(), NOW()
FROM (VALUES
    ('MR-001', 'EQ-001', 'BREAKDOWN', 'HIGH', 'OPEN', 'Pump vibration observed', 'High vibration on boiler feed pump during shift inspection.', 'Imran Khan', '2026-06-01', '2026-06-05'),
    ('MR-002', 'EQ-002', 'INSPECTION', 'MEDIUM', 'IN_PROGRESS', 'Press hydraulic oil leak', 'Oil seepage near actuator block.', 'Pooja Nair', '2026-06-02', '2026-06-06'),
    ('MR-003', 'EQ-003', 'BREAKDOWN', 'HIGH', 'OPEN', 'Cooling fan trip', 'Fan tripped twice during morning operation.', 'Manoj Pillai', '2026-06-03', '2026-06-07'),
    ('MR-004', 'EQ-004', 'INSPECTION', 'MEDIUM', 'ASSIGNED', 'Compressor pressure drop', 'Pressure drops after 20 minutes of operation.', 'Neha Kulkarni', '2026-06-04', '2026-06-08'),
    ('MR-005', 'EQ-005', 'CALIBRATION', 'LOW', 'OPEN', 'CNC axis calibration', 'Scheduled calibration requested for X axis.', 'Divya Rao', '2026-06-05', '2026-06-10'),
    ('MR-006', 'EQ-006', 'BREAKDOWN', 'MEDIUM', 'IN_PROGRESS', 'Forklift brake check', 'Brake response is delayed under load.', 'Karthik S', '2026-06-06', '2026-06-11'),
    ('MR-007', 'EQ-007', 'INSPECTION', 'HIGH', 'OPEN', 'Crane hoist inspection', 'Noise from hoist gearbox during movement.', 'Raghav Menon', '2026-06-07', '2026-06-12'),
    ('MR-008', 'EQ-008', 'BREAKDOWN', 'HIGH', 'ASSIGNED', 'Raw water pump seal leak', 'Seal leakage observed near coupling end.', 'Farah Ali', '2026-06-08', '2026-06-13'),
    ('MR-009', 'EQ-009', 'INSPECTION', 'MEDIUM', 'OPEN', 'Welding station cable wear', 'Power cable insulation worn near connector.', 'Imran Khan', '2026-06-09', '2026-06-14'),
    ('MR-010', 'EQ-010', 'INSPECTION', 'CRITICAL', 'OPEN', 'Fire pump controller alarm', 'Intermittent alarm on controller panel.', 'Pooja Nair', '2026-06-10', '2026-06-15')
) AS v(request_number, equipment_code, request_type, priority, status, title, description, reported_by, requested_date, target_completion_date)
JOIN equipment_master e ON e.equipment_code = v.equipment_code
JOIN site_master s ON s.site_id = e.site_id
ON CONFLICT (request_number) DO NOTHING;

-- 13. Maintenance assignments
INSERT INTO maintenance_assignment (
    request_id, vendor_id, assigned_employee_id, assigned_to, assigned_date, planned_start_date, planned_end_date,
    actual_start_date, actual_end_date, status, estimated_cost, actual_cost, remarks, created_at, updated_at
)
SELECT mr.id, vnd.id, emp.employee_id, v.assigned_to, v.assigned_date::date, v.planned_start_date::date, v.planned_end_date::date,
       NULL, NULL, v.status, v.estimated_cost::numeric, NULL, v.remarks, NOW(), NOW()
FROM (VALUES
    ('MR-001', 'VEN-001', 'EMP-005', 'Imran Khan', '2026-06-01', '2026-06-02', '2026-06-04', 'ASSIGNED', '12000.00', 'Pump vibration diagnosis assigned.'),
    ('MR-002', 'VEN-002', 'EMP-006', 'Pooja Nair', '2026-06-02', '2026-06-03', '2026-06-05', 'IN_PROGRESS', '8500.00', 'Hydraulic leak inspection in progress.'),
    ('MR-003', 'VEN-003', 'EMP-007', 'Manoj Pillai', '2026-06-03', '2026-06-04', '2026-06-06', 'ASSIGNED', '9000.00', 'Cooling fan trip investigation.'),
    ('MR-004', 'VEN-004', 'EMP-004', 'Neha Kulkarni', '2026-06-04', '2026-06-05', '2026-06-07', 'ASSIGNED', '11000.00', 'Compressor pressure audit.'),
    ('MR-005', 'VEN-005', 'EMP-008', 'Divya Rao', '2026-06-05', '2026-06-06', '2026-06-08', 'ASSIGNED', '7000.00', 'CNC calibration assigned.'),
    ('MR-006', 'VEN-006', 'EMP-009', 'Karthik S', '2026-06-06', '2026-06-07', '2026-06-09', 'IN_PROGRESS', '6500.00', 'Forklift brake inspection.'),
    ('MR-007', 'VEN-007', 'EMP-003', 'Raghav Menon', '2026-06-07', '2026-06-08', '2026-06-10', 'ASSIGNED', '13500.00', 'Crane gearbox inspection.'),
    ('MR-008', 'VEN-008', 'EMP-010', 'Farah Ali', '2026-06-08', '2026-06-09', '2026-06-11', 'ASSIGNED', '10500.00', 'Pump seal replacement planning.'),
    ('MR-009', 'VEN-009', 'EMP-005', 'Imran Khan', '2026-06-09', '2026-06-10', '2026-06-12', 'ASSIGNED', '4000.00', 'Cable replacement work assigned.'),
    ('MR-010', 'VEN-010', 'EMP-006', 'Pooja Nair', '2026-06-10', '2026-06-11', '2026-06-13', 'ASSIGNED', '15000.00', 'Fire controller alarm inspection.')
) AS v(request_number, vendor_code, employee_code, assigned_to, assigned_date, planned_start_date, planned_end_date, status, estimated_cost, remarks)
JOIN maintenance_request mr ON mr.request_number = v.request_number
JOIN vendor_master vnd ON vnd.vendor_code = v.vendor_code
LEFT JOIN employee_master emp ON emp.employee_code = v.employee_code
WHERE EXISTS (
    SELECT 1 FROM vendor_site_assignment vsa
    WHERE vsa.vendor_id = vnd.id AND vsa.site_id = mr.site_id AND vsa.status = 'ACTIVE'
)
AND NOT EXISTS (
    SELECT 1 FROM maintenance_assignment ma
    WHERE ma.request_id = mr.id AND ma.vendor_id = vnd.id
);

-- 14. Equipment downtime
INSERT INTO equipment_downtime (
    equipment_id, site_id, request_id, downtime_start, downtime_end, downtime_hours,
    downtime_minutes, reason, planned, remarks, created_at, updated_at
)
SELECT e.id, e.site_id, mr.id, v.downtime_start::timestamp, v.downtime_end::timestamp,
       ROUND(EXTRACT(EPOCH FROM (v.downtime_end::timestamp - v.downtime_start::timestamp)) / 3600.0, 2),
       ROUND(EXTRACT(EPOCH FROM (v.downtime_end::timestamp - v.downtime_start::timestamp)) / 60.0)::bigint,
       v.reason, false, v.remarks, NOW(), NOW()
FROM (VALUES
    ('EQ-001', 'MR-001', '2026-06-01 09:00:00', '2026-06-01 12:30:00', 'Pump vibration shutdown', 'Stopped pump for vibration inspection.'),
    ('EQ-002', 'MR-002', '2026-06-02 10:00:00', '2026-06-02 12:00:00', 'Hydraulic leak', 'Press stopped for leak isolation.'),
    ('EQ-003', 'MR-003', '2026-06-03 08:15:00', '2026-06-03 10:45:00', 'Fan trip', 'Cooling tower fan downtime.'),
    ('EQ-004', 'MR-004', '2026-06-04 11:00:00', '2026-06-04 14:00:00', 'Pressure drop', 'Compressor isolated for inspection.'),
    ('EQ-005', 'MR-005', '2026-06-05 13:00:00', '2026-06-05 15:15:00', 'Calibration', 'CNC machine calibration downtime.'),
    ('EQ-006', 'MR-006', '2026-06-06 09:30:00', '2026-06-06 11:00:00', 'Brake inspection', 'Forklift removed from service.'),
    ('EQ-007', 'MR-007', '2026-06-07 07:45:00', '2026-06-07 12:15:00', 'Hoist gearbox noise', 'Crane downtime for gearbox check.'),
    ('EQ-008', 'MR-008', '2026-06-08 10:20:00', '2026-06-08 13:50:00', 'Seal leak', 'Pump stopped for seal inspection.'),
    ('EQ-009', 'MR-009', '2026-06-09 14:00:00', '2026-06-09 16:00:00', 'Cable wear', 'Welding station powered down.'),
    ('EQ-010', 'MR-010', '2026-06-10 09:10:00', '2026-06-10 10:40:00', 'Controller alarm', 'Fire controller diagnostic downtime.')
) AS v(equipment_code, request_number, downtime_start, downtime_end, reason, remarks)
JOIN equipment_master e ON e.equipment_code = v.equipment_code
JOIN maintenance_request mr ON mr.request_number = v.request_number AND mr.equipment_id = e.id AND mr.site_id = e.site_id
WHERE NOT EXISTS (
    SELECT 1 FROM equipment_downtime ed
    WHERE ed.request_id = mr.id AND ed.equipment_id = e.id AND ed.reason = v.reason
);

COMMIT;

-- Rollback/delete helper, intentionally commented:
-- DELETE FROM equipment_downtime WHERE request_id IN (SELECT id FROM maintenance_request WHERE request_number BETWEEN 'MR-001' AND 'MR-010');
-- DELETE FROM maintenance_assignment WHERE request_id IN (SELECT id FROM maintenance_request WHERE request_number BETWEEN 'MR-001' AND 'MR-010');
-- DELETE FROM maintenance_request WHERE request_number BETWEEN 'MR-001' AND 'MR-010';
-- DELETE FROM equipment_master WHERE equipment_code BETWEEN 'EQ-001' AND 'EQ-010';
-- DELETE FROM vendor_site_assignment WHERE vendor_id IN (SELECT id FROM vendor_master WHERE vendor_code BETWEEN 'VEN-001' AND 'VEN-010');
-- DELETE FROM vendor_master WHERE vendor_code BETWEEN 'VEN-001' AND 'VEN-010';
-- DELETE FROM user_role WHERE user_id IN (SELECT id FROM users WHERE username LIKE 'cmms.%');
-- DELETE FROM users WHERE username LIKE 'cmms.%';
-- DELETE FROM employee_site_assignment WHERE employee_id IN (SELECT employee_id FROM employee_master WHERE employee_code BETWEEN 'EMP-001' AND 'EMP-010');
-- DELETE FROM employee_master WHERE employee_code BETWEEN 'EMP-001' AND 'EMP-010';
-- DELETE FROM site_master WHERE site_code BETWEEN 'SITE-001' AND 'SITE-010';
