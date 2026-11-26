\set ON_ERROR_STOP on
BEGIN;

CREATE TEMP TABLE e2e_sites AS SELECT site_id FROM site_master WHERE site_code LIKE 'E2E-%';
CREATE TEMP TABLE e2e_equipment AS SELECT id FROM equipment_master WHERE equipment_code LIKE 'E2E-%' OR site_id IN (SELECT site_id FROM e2e_sites);
CREATE TEMP TABLE e2e_employees AS SELECT employee_id FROM employee_master WHERE employee_code LIKE 'E2E-%';
CREATE TEMP TABLE e2e_vendors AS SELECT id FROM vendor_master WHERE vendor_code LIKE 'E2E-%';
CREATE TEMP TABLE e2e_requests AS SELECT id FROM maintenance_request WHERE site_id IN (SELECT site_id FROM e2e_sites);
CREATE TEMP TABLE e2e_assignments AS SELECT id FROM maintenance_assignment WHERE request_id IN (SELECT id FROM e2e_requests);
CREATE TEMP TABLE e2e_downtimes AS SELECT id FROM equipment_downtime WHERE site_id IN (SELECT site_id FROM e2e_sites);
CREATE TEMP TABLE e2e_stocks AS SELECT stock_id, spare_part_id FROM spare_part_site_stock WHERE site_id IN (SELECT site_id FROM e2e_sites);
CREATE TEMP TABLE e2e_parts AS SELECT spare_part_id FROM spare_part_master WHERE part_code LIKE 'E2E-%';
CREATE TEMP TABLE e2e_pm AS SELECT id FROM preventive_maintenance_schedule WHERE site_id IN (SELECT site_id FROM e2e_sites);
CREATE TEMP TABLE e2e_amc AS SELECT id FROM vendor_amc_contract WHERE site_id IN (SELECT site_id FROM e2e_sites) OR contract_number LIKE 'E2E-%';

DELETE FROM notification WHERE site_id IN (SELECT site_id FROM e2e_sites) OR reference_code LIKE 'E2E-%';
DELETE FROM approval_action WHERE approval_request_id IN (SELECT approval_request_id FROM approval_request WHERE site_id IN (SELECT site_id FROM e2e_sites));
DELETE FROM approval_request WHERE site_id IN (SELECT site_id FROM e2e_sites);
DELETE FROM approval_config WHERE module_code LIKE 'E2E-%' OR action_code LIKE 'E2E-%';
DELETE FROM spare_part_reorder_request WHERE stock_id IN (SELECT stock_id FROM e2e_stocks) OR assignment_id IN (SELECT id FROM e2e_assignments);
DELETE FROM spare_part_transaction WHERE stock_id IN (SELECT stock_id FROM e2e_stocks) OR site_id IN (SELECT site_id FROM e2e_sites);
DELETE FROM maintenance_spare_usage WHERE assignment_id IN (SELECT id FROM e2e_assignments) OR stock_id IN (SELECT stock_id FROM e2e_stocks);
DELETE FROM maintenance_assignment_work_log_attachment WHERE work_log_id IN (SELECT id FROM maintenance_assignment_work_log WHERE assignment_id IN (SELECT id FROM e2e_assignments));
DELETE FROM maintenance_assignment_work_log WHERE assignment_id IN (SELECT id FROM e2e_assignments);
DELETE FROM maintenance_assignment_checklist_proof WHERE checklist_item_id IN (SELECT id FROM maintenance_assignment_checklist_item WHERE assignment_id IN (SELECT id FROM e2e_assignments));
DELETE FROM maintenance_assignment_checklist_item WHERE assignment_id IN (SELECT id FROM e2e_assignments);
DELETE FROM downtime_rca_action WHERE downtime_id IN (SELECT id FROM e2e_downtimes);
DELETE FROM downtime_status_history WHERE downtime_id IN (SELECT id FROM e2e_downtimes);
DELETE FROM equipment_downtime WHERE id IN (SELECT id FROM e2e_downtimes);
DELETE FROM equipment_document WHERE equipment_id IN (SELECT id FROM e2e_equipment);
DELETE FROM equipment_spare_bom WHERE equipment_id IN (SELECT id FROM e2e_equipment) OR stock_id IN (SELECT stock_id FROM e2e_stocks);
DELETE FROM equipment_amc_mapping WHERE amc_contract_id IN (SELECT id FROM e2e_amc) OR equipment_id IN (SELECT id FROM e2e_equipment);
DELETE FROM maintenance_assignment WHERE id IN (SELECT id FROM e2e_assignments);
DELETE FROM maintenance_request WHERE id IN (SELECT id FROM e2e_requests);
DELETE FROM pm_schedule_checklist_item WHERE pm_schedule_id IN (SELECT id FROM e2e_pm);
DELETE FROM preventive_maintenance_schedule WHERE id IN (SELECT id FROM e2e_pm);
DELETE FROM vendor_amc_contract WHERE id IN (SELECT id FROM e2e_amc);
DELETE FROM spare_part_site_stock WHERE stock_id IN (SELECT stock_id FROM e2e_stocks);
DELETE FROM spare_part_master WHERE spare_part_id IN (SELECT spare_part_id FROM e2e_parts);
DELETE FROM equipment_master WHERE id IN (SELECT id FROM e2e_equipment);
DELETE FROM employee_site_assignment WHERE employee_id IN (SELECT employee_id FROM e2e_employees) OR site_id IN (SELECT site_id FROM e2e_sites);
DELETE FROM vendor_site_assignment WHERE vendor_id IN (SELECT id FROM e2e_vendors) OR site_id IN (SELECT site_id FROM e2e_sites);
DELETE FROM employee_master WHERE employee_id IN (SELECT employee_id FROM e2e_employees);
DELETE FROM vendor_master WHERE id IN (SELECT id FROM e2e_vendors);
DELETE FROM site_master WHERE site_id IN (SELECT site_id FROM e2e_sites);

COMMIT;
