\set ON_ERROR_STOP on
\pset pager off

-- All values are supplied by the wrapper as validated psql variables.
CREATE TABLE IF NOT EXISTS cmms_performance_test_run (
    run_id VARCHAR(20) PRIMARY KEY,
    marker VARCHAR(30) NOT NULL UNIQUE,
    site_count BIGINT NOT NULL,
    employee_count BIGINT NOT NULL,
    equipment_count BIGINT NOT NULL,
    request_count BIGINT NOT NULL,
    assignment_count BIGINT NOT NULL,
    work_log_count BIGINT NOT NULL,
    downtime_count BIGINT NOT NULL,
    spare_transaction_count BIGINT NOT NULL,
    spare_part_count BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

BEGIN;
SET LOCAL synchronous_commit = off;
SET LOCAL statement_timeout = 0;

CREATE TEMP TABLE perf_cfg ON COMMIT DROP AS
SELECT
    upper(:'run_id')::varchar(20) AS run_id,
    ('PERF-' || upper(:'run_id'))::varchar(30) AS marker,
    :site_count::bigint AS site_count,
    :employee_count::bigint AS employee_count,
    :equipment_count::bigint AS equipment_count,
    :request_count::bigint AS request_count,
    :assignment_count::bigint AS assignment_count,
    :work_log_count::bigint AS work_log_count,
    :downtime_count::bigint AS downtime_count,
    :spare_transaction_count::bigint AS spare_transaction_count,
    :spare_part_count::bigint AS spare_part_count;

DO $$
DECLARE
    cfg perf_cfg%ROWTYPE;
BEGIN
    SELECT * INTO cfg FROM perf_cfg;
    IF cfg.site_count < 1 OR cfg.employee_count < 1 OR cfg.equipment_count < 1
       OR cfg.request_count < 1 OR cfg.assignment_count < 1
       OR cfg.work_log_count < 1 OR cfg.downtime_count < 1
       OR cfg.spare_transaction_count < 1 OR cfg.spare_part_count < 1 THEN
        RAISE EXCEPTION 'Every generation count must be greater than zero';
    END IF;
END $$;

INSERT INTO cmms_performance_test_run (
    run_id, marker, site_count, employee_count, equipment_count,
    request_count, assignment_count, work_log_count, downtime_count,
    spare_transaction_count, spare_part_count, status
)
SELECT run_id, marker, site_count, employee_count, equipment_count,
       request_count, assignment_count, work_log_count, downtime_count,
       spare_transaction_count, spare_part_count, 'GENERATING'
FROM perf_cfg;

\echo 'Creating sites...'
INSERT INTO site_master (
    site_code, site_name, organization_name, site_type, address_line1,
    city, state, country, pincode, contact_person, contact_mobile,
    contact_email, latitude, longitude, status, created_at, updated_at
)
SELECT
    c.marker || '-S' || lpad(g::text, 8, '0'),
    c.marker || ' Manufacturing Site ' || g,
    'CMMS Performance Test Organization',
    CASE g % 4 WHEN 0 THEN 'PLANT' WHEN 1 THEN 'WAREHOUSE' WHEN 2 THEN 'WORKSHOP' ELSE 'UTILITY' END,
    'Performance Test Industrial Area ' || g,
    'Test City ' || ((g - 1) % 20 + 1),
    'Test State ' || ((g - 1) % 10 + 1),
    'India',
    lpad((100000 + g)::text, 6, '0'),
    'Performance Contact ' || g,
    (9000000000::bigint + g)::text,
    lower(c.marker) || '.site' || g || '@example.invalid',
    (8.0 + ((g % 200)::numeric / 100))::numeric(12,8),
    (72.0 + ((g % 200)::numeric / 100))::numeric(12,8),
    'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM perf_cfg c
CROSS JOIN LATERAL generate_series(1, c.site_count) AS gs(g);

CREATE TEMP TABLE perf_sites ON COMMIT DROP AS
SELECT row_number() OVER (ORDER BY site_code)::bigint AS rn, site_id
FROM site_master s, perf_cfg c
WHERE left(s.site_code, length(c.marker) + 2) = c.marker || '-S';
CREATE UNIQUE INDEX ON perf_sites(rn);

\echo 'Creating employees and site assignments...'
INSERT INTO employee_master (
    employee_code, first_name, last_name, mobile_number, email, gender,
    date_of_birth, date_of_joining, designation, department, status,
    created_at, updated_at
)
SELECT
    c.marker || '-E' || lpad(g::text, 8, '0'),
    'PerfEmployee' || g,
    'Run' || c.run_id,
    (7000000000::bigint + g)::text,
    lower(c.marker) || '.employee' || g || '@example.invalid',
    CASE g % 3 WHEN 0 THEN 'FEMALE' WHEN 1 THEN 'MALE' ELSE 'OTHER' END,
    CURRENT_DATE - (9000 + (g % 9000))::integer,
    CURRENT_DATE - (g % 3650)::integer,
    CASE g % 5 WHEN 0 THEN 'Maintenance Manager' WHEN 1 THEN 'Mechanical Technician' WHEN 2 THEN 'Electrical Technician' WHEN 3 THEN 'Store Executive' ELSE 'Operator' END,
    CASE g % 4 WHEN 0 THEN 'MAINTENANCE' WHEN 1 THEN 'PRODUCTION' WHEN 2 THEN 'ELECTRICAL' ELSE 'STORES' END,
    'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM perf_cfg c
CROSS JOIN LATERAL generate_series(1, c.employee_count) AS gs(g);

CREATE TEMP TABLE perf_employees ON COMMIT DROP AS
SELECT row_number() OVER (ORDER BY employee_code)::bigint AS rn, employee_id
FROM employee_master e, perf_cfg c
WHERE left(e.employee_code, length(c.marker) + 2) = c.marker || '-E';
CREATE UNIQUE INDEX ON perf_employees(rn);

INSERT INTO employee_site_assignment (
    employee_id, site_id, role_name, is_primary_site, effective_from,
    status, created_at, updated_at
)
SELECT e.employee_id, s.site_id,
       CASE e.rn % 5 WHEN 0 THEN 'MAINTENANCE_MANAGER' WHEN 1 THEN 'TECHNICIAN' WHEN 2 THEN 'TECHNICIAN' WHEN 3 THEN 'STORE_EXECUTIVE' ELSE 'OPERATOR' END,
       true, CURRENT_DATE - (e.rn % 3650)::integer, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM perf_cfg c
CROSS JOIN perf_employees e
JOIN perf_sites s ON s.rn = ((e.rn - 1) % c.site_count) + 1;

\echo 'Creating equipment...'
INSERT INTO equipment_master (
    equipment_code, equipment_name, site_id, category, location,
    manufacturer, model_number, serial_number, installation_date,
    warranty_expiry_date, status, criticality, commissioning_date,
    lifecycle_status, asset_condition, operating_status, ownership_type,
    asset_number, purchase_date, purchase_cost, capitalization_date,
    depreciation_method, cost_center, department, created_at, updated_at
)
SELECT
    c.marker || '-Q' || lpad(g::text, 8, '0'),
    'Performance Equipment ' || g,
    s.site_id,
    CASE g % 6 WHEN 0 THEN 'PUMP' WHEN 1 THEN 'MOTOR' WHEN 2 THEN 'COMPRESSOR' WHEN 3 THEN 'CONVEYOR' WHEN 4 THEN 'BOILER' ELSE 'GENERATOR' END,
    'Area-' || ((g - 1) % 50 + 1),
    'Performance Manufacturer ' || ((g - 1) % 20 + 1),
    'MODEL-' || ((g - 1) % 100 + 1),
    c.marker || '-SER-' || g,
    CURRENT_DATE - (365 + (g % 3650))::integer,
    CURRENT_DATE + (g % 1825)::integer,
    CASE WHEN g % 50 = 0 THEN 'INACTIVE' ELSE 'ACTIVE' END,
    CASE g % 4 WHEN 0 THEN 'CRITICAL' WHEN 1 THEN 'HIGH' WHEN 2 THEN 'MEDIUM' ELSE 'LOW' END,
    CURRENT_DATE - (300 + (g % 3650))::integer,
    CASE WHEN g % 50 = 0 THEN 'STANDBY' ELSE 'ACTIVE' END,
    CASE g % 4 WHEN 0 THEN 'POOR' WHEN 1 THEN 'FAIR' WHEN 2 THEN 'GOOD' ELSE 'EXCELLENT' END,
    CASE g % 20 WHEN 0 THEN 'BREAKDOWN' WHEN 1 THEN 'UNDER_MAINTENANCE' WHEN 2 THEN 'STANDBY' ELSE 'RUNNING' END,
    'OWNED', c.marker || '-ASSET-' || g,
    CURRENT_DATE - (400 + (g % 3650))::integer,
    (25000 + (g % 5000) * 100)::numeric(14,2),
    CURRENT_DATE - (365 + (g % 3650))::integer,
    'STRAIGHT_LINE', 'CC-' || ((g - 1) % 40 + 1),
    CASE g % 4 WHEN 0 THEN 'MAINTENANCE' WHEN 1 THEN 'PRODUCTION' WHEN 2 THEN 'UTILITIES' ELSE 'PACKAGING' END,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM perf_cfg c
CROSS JOIN LATERAL generate_series(1, c.equipment_count) AS gs(g)
JOIN perf_sites s ON s.rn = ((g - 1) % c.site_count) + 1;

CREATE TEMP TABLE perf_equipment ON COMMIT DROP AS
SELECT row_number() OVER (ORDER BY equipment_code)::bigint AS rn, id, site_id
FROM equipment_master e, perf_cfg c
WHERE left(e.equipment_code, length(c.marker) + 2) = c.marker || '-Q';
CREATE UNIQUE INDEX ON perf_equipment(rn);

\echo 'Creating maintenance requests...'
INSERT INTO maintenance_request (
    request_number, equipment_id, site_id, request_type, priority,
    status, title, description, reported_by, requested_date,
    target_completion_date, amc_covered, external_vendor_assignment,
    created_at, updated_at
)
SELECT
    c.marker || '-R' || lpad(g::text, 8, '0'),
    e.id, e.site_id,
    CASE g % 5 WHEN 0 THEN 'PREVENTIVE' WHEN 1 THEN 'BREAKDOWN' WHEN 2 THEN 'CORRECTIVE' WHEN 3 THEN 'INSPECTION' ELSE 'GENERAL' END,
    CASE g % 4 WHEN 0 THEN 'CRITICAL' WHEN 1 THEN 'HIGH' WHEN 2 THEN 'MEDIUM' ELSE 'LOW' END,
    CASE g % 8 WHEN 0 THEN 'OPEN' WHEN 1 THEN 'ASSIGNED' WHEN 2 THEN 'IN_PROGRESS' WHEN 3 THEN 'ON_HOLD' WHEN 4 THEN 'COMPLETED' WHEN 5 THEN 'CLOSED' WHEN 6 THEN 'PENDING_APPROVAL' ELSE 'CANCELLED' END,
    'Performance maintenance request ' || g,
    c.marker || ' generated fault description for performance and pagination testing. Request ' || g,
    'performance.generator',
    CURRENT_DATE - (g % 730)::integer,
    CURRENT_DATE - (g % 730)::integer + ((g % 14) + 1)::integer,
    false, false,
    CURRENT_TIMESTAMP - make_interval(days => (g % 730)::integer), CURRENT_TIMESTAMP
FROM perf_cfg c
CROSS JOIN LATERAL generate_series(1, c.request_count) AS gs(g)
JOIN perf_equipment e ON e.rn = ((g - 1) % c.equipment_count) + 1;

CREATE TEMP TABLE perf_requests ON COMMIT DROP AS
SELECT row_number() OVER (ORDER BY request_number)::bigint AS rn, id
FROM maintenance_request r, perf_cfg c
WHERE left(r.request_number, length(c.marker) + 2) = c.marker || '-R';
CREATE UNIQUE INDEX ON perf_requests(rn);

\echo 'Creating maintenance assignments...'
INSERT INTO maintenance_assignment (
    request_id, assigned_to, assigned_employee_id, assigned_date,
    planned_start_date, planned_end_date, actual_start_date, actual_end_date,
    status, estimated_cost, actual_cost, remarks, created_at, updated_at
)
SELECT
    r.id, 'Performance Technician ' || e.rn, e.employee_id,
    CURRENT_DATE - (g % 720)::integer,
    CURRENT_DATE - (g % 720)::integer,
    CURRENT_DATE - (g % 720)::integer + ((g % 5) + 1)::integer,
    CASE WHEN g % 4 IN (1, 2, 3) THEN CURRENT_DATE - (g % 720)::integer ELSE NULL END,
    CASE WHEN g % 4 = 2 THEN CURRENT_DATE - (g % 720)::integer + ((g % 3) + 1)::integer ELSE NULL END,
    CASE g % 4 WHEN 0 THEN 'ASSIGNED' WHEN 1 THEN 'IN_PROGRESS' WHEN 2 THEN 'COMPLETED' ELSE 'CANCELLED' END,
    (500 + (g % 5000))::numeric(12,2),
    CASE WHEN g % 4 = 2 THEN (450 + (g % 5200))::numeric(12,2) ELSE NULL END,
    c.marker || ' generated assignment ' || g,
    CURRENT_TIMESTAMP - make_interval(days => (g % 720)::integer), CURRENT_TIMESTAMP
FROM perf_cfg c
CROSS JOIN LATERAL generate_series(1, c.assignment_count) AS gs(g)
JOIN perf_requests r ON r.rn = ((g - 1) % c.request_count) + 1
JOIN perf_employees e ON e.rn = ((g - 1) % c.employee_count) + 1;

CREATE TEMP TABLE perf_assignments ON COMMIT DROP AS
SELECT row_number() OVER (ORDER BY id)::bigint AS rn, id
FROM maintenance_assignment a, perf_cfg c
WHERE left(coalesce(a.remarks, ''), length(c.marker)) = c.marker;
CREATE UNIQUE INDEX ON perf_assignments(rn);

\echo 'Creating work logs...'
INSERT INTO maintenance_assignment_work_log (
    assignment_id, technician_employee_id, start_time, end_time,
    work_notes, issue_found, action_taken, completion_status,
    created_at, updated_at
)
SELECT
    a.id, e.employee_id,
    CURRENT_TIMESTAMP - make_interval(days => (g % 720)::integer, hours => (g % 24)::integer),
    CASE WHEN g % 5 <> 0 THEN CURRENT_TIMESTAMP - make_interval(days => (g % 720)::integer, hours => (g % 24)::integer) + make_interval(mins => (30 + g % 240)::integer) ELSE NULL END,
    c.marker || ' generated work log ' || g,
    'Observed performance-test condition ' || (g % 25),
    'Completed performance-test maintenance action ' || (g % 30),
    CASE g % 5 WHEN 0 THEN 'IN_PROGRESS' WHEN 1 THEN 'COMPLETED' WHEN 2 THEN 'COMPLETED' WHEN 3 THEN 'FOLLOW_UP_REQUIRED' ELSE 'CANCELLED' END,
    CURRENT_TIMESTAMP - make_interval(days => (g % 720)::integer), CURRENT_TIMESTAMP
FROM perf_cfg c
CROSS JOIN LATERAL generate_series(1, c.work_log_count) AS gs(g)
JOIN perf_assignments a ON a.rn = ((g - 1) % c.assignment_count) + 1
JOIN perf_employees e ON e.rn = ((g - 1) % c.employee_count) + 1;

\echo 'Creating downtime records...'
INSERT INTO equipment_downtime (
    equipment_id, site_id, request_id, downtime_start, downtime_end,
    downtime_minutes, reason, planned, remarks, status, reason_category,
    reason_code, root_cause, production_line, shift_name,
    expected_output_per_hour, loss_rate_per_unit, lost_quantity,
    lost_amount, closed_at, closure_remarks, created_at, updated_at
)
SELECT
    e.id, e.site_id, r.id,
    CURRENT_TIMESTAMP - make_interval(days => (g % 720)::integer, hours => (g % 24)::integer),
    CASE WHEN g % 7 <> 0 THEN CURRENT_TIMESTAMP - make_interval(days => (g % 720)::integer, hours => (g % 24)::integer) + make_interval(mins => (15 + g % 720)::integer) ELSE NULL END,
    CASE WHEN g % 7 <> 0 THEN (15 + g % 720)::bigint ELSE NULL END,
    CASE g % 5 WHEN 0 THEN 'Mechanical failure' WHEN 1 THEN 'Electrical fault' WHEN 2 THEN 'Planned servicing' WHEN 3 THEN 'Material blockage' ELSE 'Operator inspection' END,
    (g % 5 = 2), c.marker || ' generated downtime ' || g,
    CASE g % 7 WHEN 0 THEN 'OPEN' WHEN 1 THEN 'CONFIRMED' WHEN 2 THEN 'UNDER_MAINTENANCE' WHEN 3 THEN 'RESTORED' WHEN 4 THEN 'VERIFIED' WHEN 5 THEN 'CLOSED' ELSE 'CANCELLED' END,
    CASE g % 4 WHEN 0 THEN 'MECHANICAL' WHEN 1 THEN 'ELECTRICAL' WHEN 2 THEN 'PLANNED' ELSE 'OPERATIONAL' END,
    'PERF-' || (g % 20), 'Performance-test root cause ' || (g % 30),
    'Line-' || ((g - 1) % 20 + 1), CASE g % 3 WHEN 0 THEN 'A' WHEN 1 THEN 'B' ELSE 'C' END,
    (100 + g % 900)::numeric(14,2), (10 + g % 90)::numeric(14,2),
    CASE WHEN g % 7 <> 0 THEN ((15 + g % 720)::numeric / 60 * (100 + g % 900))::numeric(14,2) ELSE NULL END,
    CASE WHEN g % 7 <> 0 THEN ((15 + g % 720)::numeric / 60 * (100 + g % 900) * (10 + g % 90))::numeric(14,2) ELSE NULL END,
    CASE WHEN g % 7 IN (4, 5) THEN CURRENT_TIMESTAMP - make_interval(days => (g % 720)::integer) ELSE NULL END,
    CASE WHEN g % 7 IN (4, 5) THEN c.marker || ' closure verified' ELSE NULL END,
    CURRENT_TIMESTAMP - make_interval(days => (g % 720)::integer), CURRENT_TIMESTAMP
FROM perf_cfg c
CROSS JOIN LATERAL generate_series(1, c.downtime_count) AS gs(g)
JOIN perf_equipment e ON e.rn = ((g - 1) % c.equipment_count) + 1
JOIN perf_requests r ON r.rn = ((g - 1) % c.request_count) + 1;

\echo 'Creating spare parts and site stock...'
INSERT INTO spare_part_master (
    part_code, part_name, description, category, unit, status, created_at, updated_at
)
SELECT c.marker || '-P' || lpad(g::text, 8, '0'),
       'Performance Spare Part ' || g,
       c.marker || ' generated spare part for volume testing',
       CASE g % 5 WHEN 0 THEN 'BEARING' WHEN 1 THEN 'ELECTRICAL' WHEN 2 THEN 'SEAL' WHEN 3 THEN 'LUBRICANT' ELSE 'FASTENER' END,
       CASE g % 3 WHEN 0 THEN 'NOS' WHEN 1 THEN 'KG' ELSE 'LTR' END,
       'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM perf_cfg c
CROSS JOIN LATERAL generate_series(1, c.spare_part_count) AS gs(g);

CREATE TEMP TABLE perf_spares ON COMMIT DROP AS
SELECT row_number() OVER (ORDER BY part_code)::bigint AS rn, spare_part_id
FROM spare_part_master p, perf_cfg c
WHERE left(p.part_code, length(c.marker) + 2) = c.marker || '-P';
CREATE UNIQUE INDEX ON perf_spares(rn);

INSERT INTO spare_part_site_stock (
    spare_part_id, site_id, current_stock, reserved_stock, minimum_stock,
    unit_cost, storage_location, status, created_at, updated_at
)
SELECT p.spare_part_id, s.site_id,
       (250 + ((p.rn * s.rn) % 750))::numeric(14,3),
       ((p.rn + s.rn) % 25)::numeric(14,3),
       (25 + ((p.rn + s.rn) % 50))::numeric(14,3),
       (10 + ((p.rn * 17 + s.rn) % 990))::numeric(12,2),
       c.marker || '-BIN-' || s.rn || '-' || p.rn,
       'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM perf_cfg c
CROSS JOIN perf_spares p
CROSS JOIN perf_sites s;

CREATE TEMP TABLE perf_stocks ON COMMIT DROP AS
SELECT row_number() OVER (ORDER BY st.stock_id)::bigint AS rn,
       st.stock_id, st.spare_part_id, st.site_id, st.unit_cost
FROM spare_part_site_stock st
JOIN perf_spares p ON p.spare_part_id = st.spare_part_id
JOIN perf_sites s ON s.site_id = st.site_id;
CREATE UNIQUE INDEX ON perf_stocks(rn);

\echo 'Creating spare-part transactions...'
INSERT INTO spare_part_transaction (
    stock_id, spare_part_id, site_id, transaction_type, quantity,
    unit_cost, total_cost, stock_before, stock_after, reference_type,
    reference_id, remarks, transaction_date, created_at
)
SELECT
    st.stock_id, st.spare_part_id, st.site_id,
    CASE g % 3 WHEN 0 THEN 'STOCK_IN' WHEN 1 THEN 'ISSUE' ELSE 'RETURN' END,
    (1 + g % 20)::numeric(14,3), st.unit_cost,
    ((1 + g % 20) * st.unit_cost)::numeric(14,2),
    (500 + g % 250)::numeric(14,3),
    CASE g % 3
        WHEN 0 THEN (500 + g % 250 + 1 + g % 20)::numeric(14,3)
        WHEN 1 THEN (500 + g % 250 - 1 - g % 20)::numeric(14,3)
        ELSE (500 + g % 250 + 1 + g % 20)::numeric(14,3)
    END,
    c.marker || '-BULK-LOAD', g,
    c.marker || ' generated spare transaction ' || g,
    CURRENT_TIMESTAMP - make_interval(days => (g % 720)::integer, mins => (g % 1440)::integer),
    CURRENT_TIMESTAMP
FROM perf_cfg c
CROSS JOIN LATERAL generate_series(1, c.spare_transaction_count) AS gs(g)
JOIN perf_stocks st ON st.rn = ((g - 1) % (c.site_count * c.spare_part_count)) + 1;

\echo 'Verifying exact row counts before commit...'
DO $$
DECLARE
    c perf_cfg%ROWTYPE;
    actual_count BIGINT;
BEGIN
    SELECT * INTO c FROM perf_cfg;

    SELECT count(*) INTO actual_count FROM site_master s WHERE left(s.site_code, length(c.marker) + 2) = c.marker || '-S';
    IF actual_count <> c.site_count THEN RAISE EXCEPTION 'Site count mismatch: expected %, actual %', c.site_count, actual_count; END IF;

    SELECT count(*) INTO actual_count FROM employee_master e WHERE left(e.employee_code, length(c.marker) + 2) = c.marker || '-E';
    IF actual_count <> c.employee_count THEN RAISE EXCEPTION 'Employee count mismatch: expected %, actual %', c.employee_count, actual_count; END IF;

    SELECT count(*) INTO actual_count FROM equipment_master e WHERE left(e.equipment_code, length(c.marker) + 2) = c.marker || '-Q';
    IF actual_count <> c.equipment_count THEN RAISE EXCEPTION 'Equipment count mismatch: expected %, actual %', c.equipment_count, actual_count; END IF;

    SELECT count(*) INTO actual_count FROM maintenance_request r WHERE left(r.request_number, length(c.marker) + 2) = c.marker || '-R';
    IF actual_count <> c.request_count THEN RAISE EXCEPTION 'Request count mismatch: expected %, actual %', c.request_count, actual_count; END IF;

    SELECT count(*) INTO actual_count FROM maintenance_assignment a WHERE left(coalesce(a.remarks, ''), length(c.marker)) = c.marker;
    IF actual_count <> c.assignment_count THEN RAISE EXCEPTION 'Assignment count mismatch: expected %, actual %', c.assignment_count, actual_count; END IF;

    SELECT count(*) INTO actual_count FROM maintenance_assignment_work_log w WHERE left(coalesce(w.work_notes, ''), length(c.marker)) = c.marker;
    IF actual_count <> c.work_log_count THEN RAISE EXCEPTION 'Work-log count mismatch: expected %, actual %', c.work_log_count, actual_count; END IF;

    SELECT count(*) INTO actual_count FROM equipment_downtime d WHERE left(coalesce(d.remarks, ''), length(c.marker)) = c.marker;
    IF actual_count <> c.downtime_count THEN RAISE EXCEPTION 'Downtime count mismatch: expected %, actual %', c.downtime_count, actual_count; END IF;

    SELECT count(*) INTO actual_count FROM spare_part_transaction t WHERE t.reference_type = c.marker || '-BULK-LOAD';
    IF actual_count <> c.spare_transaction_count THEN RAISE EXCEPTION 'Spare-transaction count mismatch: expected %, actual %', c.spare_transaction_count, actual_count; END IF;

    UPDATE cmms_performance_test_run
    SET status = 'COMPLETE', completed_at = CURRENT_TIMESTAMP
    WHERE run_id = c.run_id;
END $$;

ANALYZE site_master;
ANALYZE employee_master;
ANALYZE employee_site_assignment;
ANALYZE equipment_master;
ANALYZE maintenance_request;
ANALYZE maintenance_assignment;
ANALYZE maintenance_assignment_work_log;
ANALYZE equipment_downtime;
ANALYZE spare_part_master;
ANALYZE spare_part_site_stock;
ANALYZE spare_part_transaction;

COMMIT;

\echo 'Large CMMS data generation completed successfully.'
