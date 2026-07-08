Highest Priority Improvements
Fix duplicate/double execution risks
receiveStock() can be called repeatedly and will add stock each time because backend does not block RECEIVED requests.
issueById() / reserveById() load the spare usage row without locking it, so two users can double-issue or double-reserve the same request under concurrency.
Add usage-row locking or @Version, strict idempotency checks, and backend guards for terminal statuses.

Create a formal spare request state machine
Current statuses are strings in MaintenanceSpareUsageService.java.
Move statuses/actions to enums and validate allowed transitions centrally.
Add status history: from status, to status, actor, timestamp, remarks, correlationId.

Strengthen reorder/procurement flow
SparePartReorderService.receiveStock() needs status validation, partial receiving, received quantity tracking, GRN/PO/invoice/vendor reference fields.
Prevent duplicate open reorder requests for the same part/site unless explicitly allowed.
Add REQUESTED -> APPROVED/ORDERED -> PARTIAL_RECEIVED -> RECEIVED/CANCELLED.

Add database safety constraints
Add DB checks for current_stock >= 0, reserved_stock >= 0, reserved_stock <= current_stock.
Add constraints for nonnegative issued/consumed/returned quantities.
Service validation exists, but production inventory should not rely only on Java code.

Improve store issue UX
Store page actions like check, reserve, issue, purchase are one-click style.
For production, issue/receive/adjust/transfer should show confirmation with part, site, quantity, available stock, and reason.
Disable buttons while action is running to avoid double-click duplicate calls.

Make inventory valuation production-ready
Current costing uses current unitCost.
Add costing policy: moving average, FIFO, or standard cost.
Preserve issue cost at transaction time and support stock valuation reports.

Add stock audit and reconciliation
Add cycle count / physical stock verification flow.
Stock adjustments should require reason code, attachment/photo optional, approval for high-value variance.
Deactivation should be blocked if stock has reserved quantity or open spare/reorder requests.

Expose reorder page properly
SparePartReorderPage.jsx exists, but I did not see it routed/sidebar-linked like spare parts, approval, and store request pages.
Add route/navigation for reorder management if this page is intended for users.

Improve import reliability
CSV parsing uses simple split(","), which breaks quoted commas.
Existing-part/new-site import creates stock without opening transaction history.
Add import template, dry-run validation, robust CSV parser, row-level error export, and transaction creation for new stock rows.

Add tests
I did not find spare-parts tests.
Add service integration tests for create, reserve, issue, consume, return, reorder receive, transfer, duplicate receive, and concurrent issue.

Production Feature Gaps
Equipment BOM / recommended spares per equipment.
Alternate/interchangeable spare parts.
Criticality classification: critical, insurance, consumable.
Lead time, reorder point, max stock, EOQ.
Multi-bin storage instead of plain storageLocation.
Barcode/QR scan flow for issue, receive, transfer, and stock count.
Low-stock dashboard and ageing/dead-stock report.
Vendor performance: lead time, fill rate, price history.
Attachments for purchase receipt, adjustment approval, and issue acknowledgement.
Files I Focused On
Backend: SparePartService.java, MaintenanceSpareUsageService.java, SparePartReorderService.java
Backend schema/entities: SparePartSiteStock, MaintenanceSpareUsage, SparePartReorderRequest, SparePartTransaction
Frontend: SparePartListPage.jsx, SpareRequestApprovalPage.jsx, SpareRequestStorePage.jsx, SparePartReorderPage.jsx
API permissions: api-permission-mapping.csv
My suggested build order: first fix idempotency/concurrency and reorder receive validation, then formalize the state machine/history, then add cycle count and production procurement fields.


# Equipment Production-Level Improvement Implementation Plan

This section describes the recommended implementation order for improving the Equipment module from a basic equipment master into a production-grade CMMS/ERP asset management module.

Current equipment flow already supports:
- Equipment master create, update, delete, search, and view.
- Site-level access validation.
- Equipment linkage with maintenance requests.
- Equipment linkage with preventive maintenance.
- Equipment linkage with downtime.
- Equipment history report.

Current important files:
- Backend controller: `cmms_back_end/src/main/java/com/example/cmmsApplication/equipment/controller/EquipmentController.java`
- Backend service: `cmms_back_end/src/main/java/com/example/cmmsApplication/equipment/service/EquipmentService.java`
- Backend entity: `cmms_back_end/src/main/java/com/example/cmmsApplication/equipment/entity/Equipment.java`
- Backend DTO: `cmms_back_end/src/main/java/com/example/cmmsApplication/equipment/dto/EquipmentDTO.java`
- Frontend list: `cmms_front_end/src/features/equipment/pages/EquipmentListPage.jsx`
- Frontend form: `cmms_front_end/src/features/equipment/pages/EquipmentFormPage.jsx`
- Frontend view: `cmms_front_end/src/features/equipment/pages/EquipmentViewPage.jsx`
- Frontend service: `cmms_front_end/src/features/equipment/services/equipmentService.js`
- Permissions: `cmms_back_end/src/main/resources/api-permission-mapping.csv`


## Phase 1: Equipment Lifecycle and Soft Delete

Goal:
Do not physically delete equipment in production. Equipment should move through lifecycle statuses.

Implementation:
1. Add lifecycle fields to `equipment_master`:
   - `lifecycle_status`
   - `commissioning_date`
   - `decommission_date`
   - `asset_condition`
   - `operating_status`
   - `ownership_type`
2. Use statuses such as:
   - `DRAFT`
   - `COMMISSIONED`
   - `ACTIVE`
   - `STANDBY`
   - `UNDER_MAINTENANCE`
   - `BREAKDOWN`
   - `DECOMMISSIONED`
   - `SCRAPPED`
3. Change delete behavior:
   - Replace hard delete with retire/deactivate.
   - Block retire/delete if open maintenance requests, active PM schedules, active assignments, or open downtime records exist.
4. Add service validation in `EquipmentService`.
5. Update equipment list and view page to show lifecycle and operating status.

Backend files likely changed:
- `equipment/entity/Equipment.java`
- `equipment/dto/EquipmentDTO.java`
- `equipment/service/EquipmentService.java`
- `equipment/controller/EquipmentController.java`
- Liquibase XML under `db/changelog/cmms/`

Frontend files likely changed:
- `EquipmentListPage.jsx`
- `EquipmentFormPage.jsx`
- `EquipmentViewPage.jsx`

Testing:
- Create equipment with lifecycle status.
- Retire equipment with no active dependencies.
- Try to retire equipment with open request/PM/downtime and verify error.
- Verify site access still works.


## Phase 2: Equipment QR Label

Goal:
Technicians should scan equipment in the plant and open the equipment view page directly.

Implementation:
1. Add QR icon/action in equipment list.
2. QR should encode:
   - `/equipment/{id}/view`
3. Printed label should show:
   - Equipment code
   - Equipment name
   - Site
   - Location
   - Criticality
   - Status
4. Add print-specific styling so only the equipment QR label prints.
5. Add an `Open` button in QR dialog.

Frontend files likely changed:
- `EquipmentListPage.jsx`
- Possibly a small reusable QR label component under `src/shared/components` if spare-part and equipment QR labels are standardized later.

Testing:
- QR opens correct equipment view.
- Printed label does not print the whole page.
- Label is readable even without scanning.


## Phase 3: Equipment Detail Dashboard

Goal:
Equipment view should become an asset dashboard, not just read-only master fields.

Implementation:
1. Update `EquipmentViewPage.jsx` with sections/tabs:
   - Overview
   - Open Requests
   - PM Schedule
   - Downtime History
   - Spare BOM
   - Documents
   - Meter Readings
   - Cost Summary
2. Add backend summary endpoint:
   - `GET /equipment/{id}/summary`
3. Summary should include:
   - Open request count
   - Active PM count
   - Last downtime
   - Total downtime this month
   - Last maintenance date
   - Next PM date
   - Health score

Backend files likely changed:
- Add `equipment/dto/EquipmentSummaryDTO.java`
- Add service method in `EquipmentService`
- Add controller endpoint in `EquipmentController`
- May read from maintenance request, PM, downtime, and report repositories/services.

Frontend files likely changed:
- `EquipmentViewPage.jsx`
- `equipmentService.js`

Testing:
- Equipment view loads summary for allowed site.
- Summary rejects unauthorized site access.
- Counts match request/PM/downtime data.


## Phase 4: Equipment Documents

Goal:
Store manuals, drawings, certificates, inspection reports, SOPs, warranty documents, and safety documents against equipment.

Implementation:
1. Create new module folder:
   - `cmms_back_end/src/main/java/com/example/cmmsApplication/equipment/document/`
   - Or use existing equipment module structure:
     - `equipment/controller`
     - `equipment/service`
     - `equipment/repository`
     - `equipment/entity`
     - `equipment/dto`
2. Add table `equipment_document`.
3. Suggested fields:
   - `document_id`
   - `equipment_id`
   - `document_type`
   - `file_name`
   - `file_url`
   - `content_type`
   - `file_size`
   - `expiry_date`
   - `uploaded_by`
   - `uploaded_at`
   - `remarks`
4. Add endpoints:
   - `GET /equipment/{id}/documents`
   - `POST /equipment/{id}/documents`
   - `DELETE /equipment/{id}/documents/{documentId}`
5. Add permission mapping rows.
6. Add Documents tab in equipment view.

Testing:
- Upload document.
- List documents by equipment.
- Delete document.
- Verify site access.
- Verify normal JSON APIs return `ApiResponse<T>`.


## Phase 5: Equipment Spare BOM

Goal:
Define recommended spare parts for each equipment so technicians and planners know what parts belong to a machine.

Implementation:
1. Add table `equipment_spare_bom`.
2. Suggested fields:
   - `bom_id`
   - `equipment_id`
   - `spare_part_id`
   - `recommended_qty`
   - `criticality`
   - `replacement_frequency`
   - `remarks`
   - `status`
3. Add endpoints:
   - `GET /equipment/{id}/spare-bom`
   - `POST /equipment/{id}/spare-bom`
   - `PUT /equipment/{id}/spare-bom/{bomId}`
   - `DELETE /equipment/{id}/spare-bom/{bomId}`
4. Add Spare BOM tab in equipment view.
5. In maintenance assignment spare request flow, show recommended spares for the selected equipment first.

Backend files likely changed:
- New entity/DTO/repository/service/controller in equipment module.
- Integration with `spareparts` module.

Frontend files likely changed:
- `EquipmentViewPage.jsx`
- New equipment components/services for spare BOM.
- Assignment spare request UI can use recommended spares.

Testing:
- Add spare BOM line.
- Prevent duplicate equipment/spare combination unless explicitly allowed.
- Verify spare belongs to accessible site or shared part rules.


## Phase 6: Meter / Runtime Readings

Goal:
Track running hours, cycles, kilometer readings, production counts, or other usage-based values.

Implementation:
1. Add table `equipment_meter_reading`.
2. Suggested fields:
   - `reading_id`
   - `equipment_id`
   - `meter_type`
   - `reading_value`
   - `reading_date`
   - `source`
   - `recorded_by`
   - `remarks`
3. Add endpoints:
   - `GET /equipment/{id}/meter-readings`
   - `POST /equipment/{id}/meter-readings`
4. Add Meter Readings tab in equipment view.
5. Add validation:
   - New reading cannot be lower than previous reading unless correction workflow is used.
   - Correction requires reason.

Testing:
- Add increasing readings.
- Reject invalid lower readings.
- Verify latest reading is visible on equipment view.


## Phase 7: Meter-Based Preventive Maintenance

Goal:
Support PM schedules like every 500 running hours, every 10,000 cycles, or whichever comes first.

Implementation:
1. Extend preventive maintenance schedule with:
   - `trigger_type`: `DATE`, `METER`, `DATE_OR_METER`
   - `meter_type`
   - `meter_interval`
   - `last_done_reading`
   - `next_due_reading`
2. Update PM generation logic:
   - Generate work when reading crosses `next_due_reading`.
3. Add due warnings in PM calendar/list.
4. Add meter due status to equipment view summary.

Backend files likely changed:
- Preventive maintenance schedule entity/DTO/service.
- Equipment meter reading service.
- PM scheduler/job if present.

Testing:
- PM becomes due when meter reading crosses threshold.
- Calendar-based PM still works.
- Date-or-meter PM triggers correctly.


## Phase 8: Equipment Health Score, MTBF, and MTTR

Goal:
Give maintenance managers a quick health indicator for each asset.

Implementation:
1. Calculate health score using:
   - Downtime frequency
   - Downtime duration
   - Critical open requests
   - Overdue PM
   - Asset age
   - Repeated failures
2. Add backend endpoint:
   - `GET /equipment/{id}/health`
3. Add fields to equipment view:
   - Health score
   - MTBF
   - MTTR
   - Last failure date
   - Repeated failure count
4. Add filters in equipment list:
   - Health status
   - Criticality
   - Overdue PM
   - Breakdown assets

Testing:
- Health score changes after downtime and overdue PM.
- MTBF/MTTR calculations match report data.


## Phase 9: Warranty and AMC Tracking

Goal:
Manage warranty, AMC, contract, and vendor responsibility.

Implementation:
1. Extend equipment fields:
   - `warranty_provider`
   - `warranty_terms`
   - `amc_vendor_id`
   - `amc_start_date`
   - `amc_end_date`
   - `contract_number`
2. Add warranty/AMC expiry alerts.
3. Add Warranty/AMC section in equipment view.
4. Link vendor if available.

Testing:
- Expiry alert generated before due date.
- AMC vendor obeys site/vendor assignment rules.
- Equipment view shows warranty/AMC status.


## Phase 10: ERP Asset Finance Fields

Goal:
Support ERP-style fixed asset tracking and cost reporting.

Implementation:
1. Add fields:
   - `asset_number`
   - `purchase_date`
   - `purchase_cost`
   - `capitalization_date`
   - `depreciation_method`
   - `cost_center`
   - `department`
2. Add cost summary on equipment view:
   - Purchase cost
   - Maintenance cost
   - Spare/material cost
   - Downtime cost
   - Total cost of ownership
3. Add reports:
   - Equipment maintenance cost report
   - Cost by site
   - Cost by category
   - Cost by criticality

Testing:
- Finance fields save and display.
- Cost rollups match maintenance assignments, spare usage, and downtime data.


## Recommended Build Order

1. Equipment lifecycle and soft delete.
2. Equipment QR label.
3. Equipment detail dashboard.
4. Equipment documents.
5. Equipment spare BOM.
6. Meter/runtime readings.
7. Meter-based preventive maintenance.
8. Equipment health score, MTBF, and MTTR.
9. Warranty and AMC tracking.
10. ERP asset finance fields.


## Best First Sprint

Implement these first because they give immediate production value:
1. Soft delete / retire equipment.
2. Equipment QR label.
3. Equipment view dashboard summary.
4. Equipment documents.
5. Equipment spare BOM.

After this, the shop-floor flow becomes:
Technician scans equipment QR -> opens equipment view -> sees open jobs, PM, downtime, documents, and recommended spares.
