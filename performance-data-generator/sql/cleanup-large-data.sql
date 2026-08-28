\set ON_ERROR_STOP on
\pset pager off

DO $$
BEGIN
    IF to_regclass('public.cmms_performance_test_run') IS NULL THEN
        RAISE EXCEPTION 'No performance-test registry exists. Nothing can be cleaned safely.';
    END IF;
END $$;

BEGIN;
SET LOCAL statement_timeout = 0;

CREATE TEMP TABLE perf_cfg ON COMMIT DROP AS
SELECT * FROM cmms_performance_test_run WHERE run_id = upper(:'run_id');

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM perf_cfg) THEN
        RAISE EXCEPTION 'Performance data run % was not found', upper(:'run_id');
    END IF;
END $$;

CREATE TEMP TABLE perf_sites ON COMMIT DROP AS
SELECT s.site_id FROM site_master s, perf_cfg c
WHERE left(s.site_code, length(c.marker) + 2) = c.marker || '-S';
CREATE UNIQUE INDEX ON perf_sites(site_id);

CREATE TEMP TABLE perf_employees ON COMMIT DROP AS
SELECT e.employee_id FROM employee_master e, perf_cfg c
WHERE left(e.employee_code, length(c.marker) + 2) = c.marker || '-E';
CREATE UNIQUE INDEX ON perf_employees(employee_id);

CREATE TEMP TABLE perf_equipment ON COMMIT DROP AS
SELECT e.id FROM equipment_master e, perf_cfg c
WHERE left(e.equipment_code, length(c.marker) + 2) = c.marker || '-Q';
CREATE UNIQUE INDEX ON perf_equipment(id);

CREATE TEMP TABLE perf_requests ON COMMIT DROP AS
SELECT r.id FROM maintenance_request r, perf_cfg c
WHERE left(r.request_number, length(c.marker) + 2) = c.marker || '-R';
CREATE UNIQUE INDEX ON perf_requests(id);

CREATE TEMP TABLE perf_assignments ON COMMIT DROP AS
SELECT a.id FROM maintenance_assignment a JOIN perf_requests r ON r.id = a.request_id;
CREATE UNIQUE INDEX ON perf_assignments(id);

CREATE TEMP TABLE perf_work_logs ON COMMIT DROP AS
SELECT w.id FROM maintenance_assignment_work_log w JOIN perf_assignments a ON a.id = w.assignment_id;
CREATE UNIQUE INDEX ON perf_work_logs(id);

CREATE TEMP TABLE perf_downtimes ON COMMIT DROP AS
SELECT d.id FROM equipment_downtime d
WHERE d.equipment_id IN (SELECT id FROM perf_equipment)
   OR d.request_id IN (SELECT id FROM perf_requests)
   OR d.site_id IN (SELECT site_id FROM perf_sites);
CREATE UNIQUE INDEX ON perf_downtimes(id);

CREATE TEMP TABLE perf_spares ON COMMIT DROP AS
SELECT p.spare_part_id FROM spare_part_master p, perf_cfg c
WHERE left(p.part_code, length(c.marker) + 2) = c.marker || '-P';
CREATE UNIQUE INDEX ON perf_spares(spare_part_id);

CREATE TEMP TABLE perf_stocks ON COMMIT DROP AS
SELECT st.stock_id FROM spare_part_site_stock st
WHERE st.spare_part_id IN (SELECT spare_part_id FROM perf_spares)
   OR st.site_id IN (SELECT site_id FROM perf_sites);
CREATE UNIQUE INDEX ON perf_stocks(stock_id);

-- The bulk loader never creates application users. Refuse cleanup if someone
-- manually created users for generated employees, avoiding an unsafe cascade.
DO $$
DECLARE
    dependent_users BIGINT;
BEGIN
    SELECT count(*) INTO dependent_users
    FROM users u JOIN perf_employees e ON e.employee_id = u.employee_id;
    IF dependent_users > 0 THEN
        RAISE EXCEPTION '% application users reference generated employees. Remove those test users first, then rerun cleanup.', dependent_users;
    END IF;
END $$;

\echo 'Deleting child workflow records...'
DELETE FROM approval_action aa
USING approval_request ar
WHERE aa.approval_request_id = ar.approval_request_id
  AND ar.site_id IN (SELECT site_id FROM perf_sites);
DELETE FROM approval_request WHERE site_id IN (SELECT site_id FROM perf_sites);
DELETE FROM notification WHERE site_id IN (SELECT site_id FROM perf_sites);

DELETE FROM maintenance_assignment_checklist_proof p
USING maintenance_assignment_checklist_item i
WHERE p.checklist_item_id = i.id
  AND i.assignment_id IN (SELECT id FROM perf_assignments);
DELETE FROM maintenance_assignment_checklist_item WHERE assignment_id IN (SELECT id FROM perf_assignments);

DELETE FROM maintenance_assignment_work_log_attachment WHERE work_log_id IN (SELECT id FROM perf_work_logs);
DELETE FROM downtime_status_history WHERE downtime_id IN (SELECT id FROM perf_downtimes);
DELETE FROM downtime_rca_action WHERE downtime_id IN (SELECT id FROM perf_downtimes);

CREATE TEMP TABLE perf_spare_usage ON COMMIT DROP AS
SELECT u.usage_id FROM maintenance_spare_usage u
WHERE u.assignment_id IN (SELECT id FROM perf_assignments)
   OR u.stock_id IN (SELECT stock_id FROM perf_stocks)
   OR u.spare_part_id IN (SELECT spare_part_id FROM perf_spares);
CREATE UNIQUE INDEX ON perf_spare_usage(usage_id);

CREATE TEMP TABLE perf_reorders ON COMMIT DROP AS
SELECT r.reorder_id FROM spare_part_reorder_request r
WHERE r.assignment_id IN (SELECT id FROM perf_assignments)
   OR r.stock_id IN (SELECT stock_id FROM perf_stocks)
   OR r.spare_part_id IN (SELECT spare_part_id FROM perf_spares)
   OR r.site_id IN (SELECT site_id FROM perf_sites)
   OR r.spare_request_id IN (SELECT usage_id FROM perf_spare_usage);
CREATE UNIQUE INDEX ON perf_reorders(reorder_id);

UPDATE maintenance_spare_usage SET purchase_request_id = NULL
WHERE usage_id IN (SELECT usage_id FROM perf_spare_usage);
UPDATE spare_part_reorder_request SET spare_request_id = NULL
WHERE reorder_id IN (SELECT reorder_id FROM perf_reorders);
DELETE FROM spare_part_reorder_request WHERE reorder_id IN (SELECT reorder_id FROM perf_reorders);
DELETE FROM maintenance_spare_usage WHERE usage_id IN (SELECT usage_id FROM perf_spare_usage);

DELETE FROM equipment_spare_bom
WHERE equipment_id IN (SELECT id FROM perf_equipment)
   OR stock_id IN (SELECT stock_id FROM perf_stocks)
   OR spare_part_id IN (SELECT spare_part_id FROM perf_spares);

DELETE FROM spare_part_transaction
WHERE stock_id IN (SELECT stock_id FROM perf_stocks)
   OR spare_part_id IN (SELECT spare_part_id FROM perf_spares)
   OR site_id IN (SELECT site_id FROM perf_sites);

DELETE FROM maintenance_assignment_work_log WHERE id IN (SELECT id FROM perf_work_logs);
DELETE FROM equipment_downtime WHERE id IN (SELECT id FROM perf_downtimes);
DELETE FROM maintenance_assignment WHERE id IN (SELECT id FROM perf_assignments);
DELETE FROM maintenance_request WHERE id IN (SELECT id FROM perf_requests);

\echo 'Deleting generated master data...'
DELETE FROM pm_schedule_checklist_item
WHERE pm_schedule_id IN (
    SELECT id FROM preventive_maintenance_schedule
    WHERE equipment_id IN (SELECT id FROM perf_equipment)
       OR site_id IN (SELECT site_id FROM perf_sites)
);
DELETE FROM preventive_maintenance_schedule
WHERE equipment_id IN (SELECT id FROM perf_equipment)
   OR site_id IN (SELECT site_id FROM perf_sites);
DELETE FROM equipment_document WHERE equipment_id IN (SELECT id FROM perf_equipment);
DELETE FROM equipment_amc_mapping WHERE equipment_id IN (SELECT id FROM perf_equipment);

DELETE FROM employee_site_assignment
WHERE employee_id IN (SELECT employee_id FROM perf_employees)
   OR site_id IN (SELECT site_id FROM perf_sites);
DELETE FROM user_role WHERE site_id IN (SELECT site_id FROM perf_sites);
DELETE FROM vendor_site_assignment WHERE site_id IN (SELECT site_id FROM perf_sites);

DELETE FROM spare_part_site_stock WHERE stock_id IN (SELECT stock_id FROM perf_stocks);
DELETE FROM spare_part_master WHERE spare_part_id IN (SELECT spare_part_id FROM perf_spares);
DELETE FROM equipment_master WHERE id IN (SELECT id FROM perf_equipment);
DELETE FROM employee_master WHERE employee_id IN (SELECT employee_id FROM perf_employees);
DELETE FROM site_master WHERE site_id IN (SELECT site_id FROM perf_sites);

DELETE FROM cmms_performance_test_run WHERE run_id = upper(:'run_id');

ANALYZE site_master;
ANALYZE employee_master;
ANALYZE equipment_master;
ANALYZE maintenance_request;
ANALYZE maintenance_assignment;
ANALYZE maintenance_assignment_work_log;
ANALYZE equipment_downtime;
ANALYZE spare_part_site_stock;
ANALYZE spare_part_transaction;

COMMIT;

\echo 'Performance data cleanup completed successfully.'
