# Creation Page Database Reference

This matrix uses current entity and Liquibase names. Exact columns and constraints remain authoritative in `cmms_back_end/src/main/resources/db/changelog/`.

| Page/workflow | Main table(s) | Primary/foreign keys and important behavior |
|---|---|---|
| Company | `company_master` | Company PK; unique code; logo/contact/status/audit fields |
| Site | `site_master` | `site_id`; unique site code; status and audit fields; referenced throughout CMMS |
| Employee | employee master and employee-site assignment tables | Employee PK; site FK; linked user; effective dates/primary site/status |
| User/role | `users`, role, permission, role-permission, user-role tables | Username/email uniqueness; role/permission FKs and scoped assignments |
| Vendor | `vendor_master`, vendor-site assignment | Vendor PK; unique code; site/vendor uniqueness and status |
| AMC | `vendor_amc_contract`, `equipment_amc_mapping` | Vendor/site FKs; unique contract number; equipment coverage dates; renewal FK |
| Equipment | `equipment_master` | Equipment PK; site FK; unique code; lifecycle, condition, operating/financial fields |
| Equipment documents/BOM | equipment document table, `equipment_spare_bom` | Equipment/stock/part FKs; attachment metadata; BOM quantity/criticality |
| Request | `maintenance_request` | Request PK; site/equipment/PM/AMC/vendor FKs; request number; target/status/audit |
| Assignment | `maintenance_assignment` | Request/vendor/employee FKs; dates, costs, status |
| Checklist | assignment checklist item and proof tables | Assignment FK; PM source item FK; sequence/status/response/proof metadata |
| Work log | assignment work-log and attachment tables | Assignment/technician FKs; time/status/notes; file metadata |
| Downtime | `equipment_downtime` | Site/equipment/request FKs; interval, minutes, cause, loss, verification/closure |
| Downtime RCA/history | downtime RCA action and status history tables | Downtime/user FKs; action targets/status; immutable transition timeline |
| PM schedule | `preventive_maintenance_schedule`, PM checklist item table | Site/equipment/vendor/AMC FKs; unique schedule code; recurrence dates/status |
| Spare master/site stock | `spare_part_master`, `spare_part_site_stock` | Unique part code; unique `(spare_part_id, site_id)`; current/reserved/minimum/cost |
| Stock ledger | `spare_part_transaction` | Stock/part/site/user FKs; type, quantity, cost, before/after, reference, timestamp |
| Spare usage | `maintenance_spare_usage` | Unique `(assignment_id, stock_id)`; requested/approved/issued/consumed/returned quantities and actors |
| Reorder | `spare_part_reorder_request` | Stock/part/site/vendor/assignment/usage FKs; quantity/cost/status/expected date |
| Approval | approval config/request/history tables | Module/action/role/status configuration and decision audit |
| Notification config | notification settings table | Boolean channels/events, reminder timing, recipient roles, audit |

## Integrity expectations

- Codes and business identifiers declared unique by Liquibase/entity must not be recycled.
- Referenced master records should normally be inactivated rather than physically deleted.
- Inventory writes must always produce ledger transactions.
- Site FKs establish business scope; API permission alone does not replace site validation.
- All mutable business tables should retain created/updated audit fields as implemented.

