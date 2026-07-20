# PM Spare-Parts Planning

## Document Status

- Status: Pending implementation
- Feature module: Preventive Maintenance
- Related modules: Equipment, Spare Parts, Maintenance Requests, Assignments, Approvals, Notifications
- Primary objective: Ensure that required spare parts are available before preventive maintenance is due.

## 1. Problem Statement

Preventive maintenance schedules can generate work orders, and equipment can have spare-parts BOM entries. However, the application does not currently forecast whether the required material will be available on the PM due date.

This can cause:

- PM work orders to become overdue while waiting for parts.
- Multiple future PMs to assume that the same available stock can be used.
- Emergency purchases at higher prices.
- Unnecessary purchases when another site has surplus stock.
- Poor visibility of the expected material cost of upcoming PM work.

## 2. Feature Goals

For every upcoming PM occurrence, the system must calculate:

- Required spare quantities.
- Current stock at the PM site.
- Existing physical reservations.
- Existing PM planning allocations.
- Net available quantity.
- Shortage quantity.
- Transferable surplus at other sites.
- Suggested inter-site transfer quantity.
- Suggested purchase quantity.
- Estimated material cost.
- Overall PM material-readiness status.

The system must allow authorized users to:

- Configure the material required by a PM schedule.
- Forecast requirements for a selected date range.
- Allocate available stock to an upcoming PM.
- Create an inter-site transfer from a recommendation.
- Create a purchase/reorder request from a recommendation.
- Convert approved planning allocations into normal spare requests/reservations when a PM work order and assignment are generated.

## 3. Out of Scope for the First Release

The first release will not:

- Automatically purchase material without user approval.
- Automatically transfer material without user approval.
- Replace the existing spare request, transfer, or reorder services.
- Implement supplier quotations or purchase orders.
- Implement FIFO, batch, lot, serial, or expiry tracking.
- Optimize routes or calculate transport cost between sites.
- Use predictive/AI demand forecasting.

## 4. Existing Components to Reuse

The implementation must reuse the existing project patterns and services.

### Preventive Maintenance

- `PreventiveMaintenanceSchedule`
- `PreventiveMaintenanceScheduleService`
- Existing upcoming schedule and PM calendar queries
- Existing PM work-order generation flow

### Equipment BOM

- `EquipmentSpareBom`
- `EquipmentSpareBomService`
- `EquipmentSpareBomRepository`
- BOM recommended quantity
- BOM criticality and replacement frequency

### Spare-Parts Inventory

- `SparePart`
- `SparePartSiteStock`
- `SparePartTransaction`
- `SparePartService`
- Existing pessimistic stock locking
- Existing available-stock calculation

### Spare Usage

- `MaintenanceSpareUsage`
- `MaintenanceSpareUsageService`
- Existing request, approval, reservation, issue, consumption, return, rejection, and cancellation workflow

### Reorder and Transfer

- `SparePartReorderRequest`
- `SparePartReorderService`
- Existing stock transfer behavior in `SparePartService`

Do not create duplicate inventory movement, reservation, transfer, or reorder logic inside the PM module.

## 5. Important Design Decision

### Equipment BOM is not the PM material requirement

The equipment BOM contains all spare parts compatible with or recommended for an equipment item. It does not mean that every BOM part is consumed during every PM.

Example:

- A pump BOM may contain a bearing, seal, lubricant, motor, and coupling.
- Monthly inspection may require only lubricant.
- Annual overhaul may require bearings and a seal.

Therefore, add a PM-specific material requirement template.

The equipment BOM will be used to suggest parts while configuring a PM schedule. The PM material template will be the source of planned material demand.

## 6. Proposed Business Flow

```text
Active approved PM schedules
        |
        v
Generate PM occurrences in the selected forecast period
        |
        v
Load PM-specific material requirements
        |
        v
Calculate site stock and existing commitments
        |
        v
Calculate net availability and shortage
        |
        v
Search other sites for transferable surplus
        |
        v
Calculate remaining purchase requirement
        |
        v
Show recommendations to an authorized user
        |
        +--> Allocate local stock
        +--> Create transfer
        +--> Create reorder request
        |
        v
Convert allocation when PM work order/assignment is generated
```

## 7. Data Model

Follow the existing Liquibase rules:

- One XML file per table.
- Use Liquibase XML tags, not raw SQL.
- Keep indexes, unique constraints, and foreign keys in the table's XML file.
- Append files to `db.changelog-master.xml` in dependency order.

### 7.1 `pm_material_requirement`

Stores the standard material template for a PM schedule.

| Column | Type | Required | Description |
|---|---|---:|---|
| `requirement_id` | BIGINT | Yes | Primary key |
| `pm_schedule_id` | BIGINT | Yes | PM schedule |
| `spare_part_id` | BIGINT | Yes | Global spare-part master |
| `planned_quantity` | DECIMAL(14,3) | Yes | Quantity required per PM occurrence |
| `mandatory` | BOOLEAN | Yes | Whether shortage blocks material readiness |
| `issue_timing` | VARCHAR(30) | Yes | BEFORE_START, DURING_WORK, AS_NEEDED |
| `remarks` | VARCHAR(1000) | No | Planning instructions |
| `status` | VARCHAR(30) | Yes | ACTIVE or INACTIVE |
| `created_at` | TIMESTAMP | Yes | Audit timestamp |
| `updated_at` | TIMESTAMP | Yes | Audit timestamp |

Constraints:

- Unique active requirement per PM schedule and spare part.
- `planned_quantity > 0`.
- Foreign key to `preventive_maintenance_schedule`.
- Foreign key to `spare_part_master`.

Recommended indexes:

- `(pm_schedule_id, status)`
- `(spare_part_id, status)`

### 7.2 `pm_material_allocation`

Stores planning commitments for a specific PM occurrence.

| Column | Type | Required | Description |
|---|---|---:|---|
| `allocation_id` | BIGINT | Yes | Primary key |
| `pm_schedule_id` | BIGINT | Yes | Source schedule |
| `occurrence_date` | DATE | Yes | Forecast PM occurrence |
| `site_id` | BIGINT | Yes | PM site |
| `equipment_id` | BIGINT | Yes | PM equipment |
| `spare_part_id` | BIGINT | Yes | Required part |
| `required_quantity` | DECIMAL(14,3) | Yes | Requirement snapshot |
| `allocated_quantity` | DECIMAL(14,3) | Yes | Soft allocated local quantity |
| `shortage_quantity` | DECIMAL(14,3) | Yes | Uncovered quantity |
| `unit_cost` | DECIMAL(12,2) | Yes | Planning cost snapshot |
| `estimated_cost` | DECIMAL(14,2) | Yes | Requirement estimated cost |
| `status` | VARCHAR(30) | Yes | Allocation lifecycle |
| `maintenance_request_id` | BIGINT | No | Generated PM request |
| `maintenance_assignment_id` | BIGINT | No | Generated assignment |
| `maintenance_spare_usage_id` | BIGINT | No | Converted spare usage |
| `transfer_reference_id` | BIGINT | No | Transfer reference when available |
| `purchase_request_id` | BIGINT | No | Reorder request |
| `calculated_at` | TIMESTAMP | Yes | Last calculation time |
| `created_by` | BIGINT | No | User who approved allocation |
| `created_at` | TIMESTAMP | Yes | Audit timestamp |
| `updated_at` | TIMESTAMP | Yes | Audit timestamp |

Recommended statuses:

- `DRAFT`
- `ALLOCATED`
- `TRANSFER_PENDING`
- `PURCHASE_PENDING`
- `PARTIALLY_COVERED`
- `READY`
- `CONVERTED`
- `RELEASED`
- `CANCELLED`

Constraints:

- Unique `(pm_schedule_id, occurrence_date, spare_part_id)`.
- All quantity and cost values must be non-negative.

The allocation stores quantity and cost snapshots so historical plans do not change when the BOM or stock cost changes.

## 8. Module Structure

All new backend code must remain inside the existing preventive-maintenance module.

```text
cmms_back_end/src/main/java/com/example/cmmsApplication/preventivemaintenance/
    controller/
        PmMaterialPlanningController.java
    service/
        PmMaterialPlanningService.java
    repository/
        PmMaterialRequirementRepository.java
        PmMaterialAllocationRepository.java
    dao/
        PmMaterialRequirementDAO.java
        PmMaterialAllocationDAO.java
    entity/
        PmMaterialRequirement.java
        PmMaterialAllocation.java
    dto/
        PmMaterialRequirementDTO.java
        PmMaterialForecastDTO.java
        PmMaterialPlanRowDTO.java
        PmMaterialAllocationRequestDTO.java
        PmMaterialTransferRequestDTO.java
        PmMaterialPurchaseRequestDTO.java
    mapper/
        PmMaterialPlanningMapper.java
    enums/
        PmMaterialAllocationStatus.java
        PmMaterialReadinessStatus.java
```

Use:

- `@Getter` and `@Setter` for JPA entities.
- `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`, and `@Builder` for DTOs where appropriate.
- `@RequiredArgsConstructor` and `private final` dependencies for services and controllers.

## 9. Forecast Calculation

### 9.1 Generate PM Occurrences

Input:

- Start date
- End date
- Optional site
- Optional equipment
- Optional PM priority
- Optional readiness state

For each active and approved PM schedule:

1. Start from `nextDueDate`.
2. Include the date if it falls inside the requested period.
3. Calculate subsequent occurrence dates using the existing PM frequency rules.
4. Stop after the forecast end date or schedule end date.

The forecast must include every occurrence in the date range, not only `nextDueDate`.

### 9.2 Required Quantity

For the current one-schedule-to-one-equipment model:

```text
requiredQuantity = pmMaterialRequirement.plannedQuantity
```

Consolidated site/part requirement:

```text
totalRequiredQuantity =
    sum(requiredQuantity for all included PM occurrences)
```

### 9.3 Physical Available Stock

```text
physicalAvailable =
    currentStock - reservedStock
```

### 9.4 Net Available for Planning

```text
netAvailable =
    currentStock
    - reservedStock
    - earlierActivePmAllocations
```

Earlier allocations must be applied in occurrence-date order. This prevents later PMs from consuming quantities required by earlier PMs.

Never allow `netAvailable` to be presented as less than zero.

### 9.5 Local Allocation and Shortage

```text
localAllocation = min(requiredQuantity, netAvailable)
```

```text
shortage =
    max(0, requiredQuantity - localAllocation)
```

### 9.6 Transferable Surplus

For every other authorized site holding the same spare part:

```text
transferableSurplus =
    max(
        0,
        availableStock
        - sourceSafetyStock
        - sourcePlannedDemand
    )
```

Until safety stock is added as a dedicated field, use `minimumStock` as the protected source-site quantity.

Suggested source ranking:

1. Stock can arrive before the PM due date.
2. Highest transferable surplus.
3. Lowest unit cost.
4. Lowest site ID as a deterministic final tie-breaker.

The first release can treat transfer lead time as configurable default days. Do not claim that a transfer will arrive on time unless the calculation has a defined lead time.

### 9.7 Suggested Purchase

```text
remainingShortage =
    max(0, shortage - suggestedTransferQuantity)
```

First-release purchase recommendation:

```text
suggestedPurchaseQuantity = remainingShortage
```

Before recommending a new purchase, subtract quantities from open reorder requests for the same part and site that are expected before the PM due date.

Do not create duplicate reorder requests for a quantity already covered by an open reorder.

### 9.8 Estimated Material Cost

```text
localCost = localAllocation * localUnitCost
transferCost = transferQuantity * sourceUnitCost
purchaseCost = purchaseQuantity * estimatedPurchaseUnitCost
estimatedMaterialCost = localCost + transferCost + purchaseCost
```

The result is a planning estimate. Actual maintenance material cost continues to come from issued/consumed spare usage.

## 10. Readiness Status

Calculate readiness for each PM occurrence:

| Status | Rule |
|---|---|
| `NOT_PLANNED` | No active PM material requirements |
| `READY` | All mandatory material is covered |
| `AT_RISK` | Mandatory shortage exists, but a transfer or purchase can arrive before due date |
| `BLOCKED` | Mandatory shortage exists and no on-time supply action covers it |
| `OPTIONAL_SHORTAGE` | Mandatory material is covered; only optional material is short |

PM occurrence readiness must be the worst status among its material rows.

## 11. API Contract

All normal JSON endpoints must:

- Return `ApiResponse<T>`.
- Use `ResponseFactory`.
- Use `GlobalExceptionHandler` for errors.
- Use standard `ApiErrorCode` values.
- Include the correlation ID.
- Apply site access in the service layer.

### Material Template APIs

```http
GET /preventive-maintenance/schedules/{scheduleId}/materials
POST /preventive-maintenance/schedules/{scheduleId}/materials
PUT /preventive-maintenance/schedules/{scheduleId}/materials/{requirementId}
DELETE /preventive-maintenance/schedules/{scheduleId}/materials/{requirementId}
```

### Forecast API

```http
GET /preventive-maintenance/material-planning/forecast
    ?startDate=2026-08-01
    &endDate=2026-08-31
    &siteId=10
    &equipmentId=25
    &priority=HIGH
    &readiness=AT_RISK
```

The forecast response should contain:

- Applied filters.
- `generatedAt`.
- Summary totals.
- PM occurrence rows.
- Material requirement rows.
- Local allocation.
- Transfer recommendations.
- Purchase recommendations.
- Estimated cost.
- Readiness status and reasons.

### Allocation API

```http
POST /preventive-maintenance/material-planning/allocations
```

This creates or updates soft planning allocations. It must not change physical `reservedStock`.

### Release API

```http
POST /preventive-maintenance/material-planning/allocations/{allocationId}/release
```

### Transfer Recommendation Action

```http
POST /preventive-maintenance/material-planning/allocations/{allocationId}/create-transfer
```

This endpoint orchestrates the existing transfer service. It must not implement duplicate stock movement logic.

### Purchase Recommendation Action

```http
POST /preventive-maintenance/material-planning/allocations/{allocationId}/create-purchase-request
```

This endpoint calls the existing reorder service and stores the returned reorder reference.

### Recalculation

```http
POST /preventive-maintenance/material-planning/recalculate
```

Recalculate only affected site/part/date combinations whenever possible.

## 12. Proposed Permissions

Add every protected API to `api-permission-mapping.csv`.

Suggested permissions:

- `PM_MATERIAL_PLAN_VIEW`
- `PM_MATERIAL_REQUIREMENT_CREATE`
- `PM_MATERIAL_REQUIREMENT_UPDATE`
- `PM_MATERIAL_REQUIREMENT_DELETE`
- `PM_MATERIAL_ALLOCATE`
- `PM_MATERIAL_TRANSFER_CREATE`
- `PM_MATERIAL_PURCHASE_CREATE`

Rules:

- View access must still be limited to allowed sites.
- Transfer creation requires access to both source and destination sites.
- Purchase actions must reuse existing reorder authorization where practical.
- Do not add controller/service calls to `accessControlService.validatePermission(...)`.
- API authorization remains centralized in `JwtFilter` through `ApiPermissionService`.

## 13. Frontend Structure

```text
cmms_front_end/src/features/preventiveMaintenance/
    pages/
        PmMaterialPlanningPage.jsx
    components/
        PmMaterialSummaryCards.jsx
        PmMaterialForecastTable.jsx
        PmMaterialRequirementDialog.jsx
        PmMaterialActionDialog.jsx
    services/
        pmMaterialPlanningService.js
    hooks/
        usePmMaterialPlanning.js
    constants/
        pmMaterialPlanningConstants.js
```

Use existing shared components:

- `CommonPageHeader`
- `CommonList`
- `CommonDropdown`
- `CommonInput`
- `CommonDatePicker`
- `CommonFormCard`
- `CommonFormActions`
- `ConfirmDialog`
- `CommonEmptyState`

Do not use MUI form inputs directly inside feature pages.

## 14. Frontend Page Requirements

### Filters

- Site
- Start date
- End date
- Equipment
- PM priority
- Material readiness
- Part criticality

Provide presets:

- Next 7 days
- Next 30 days
- Next 60 days
- Next 90 days

### Summary Cards

- Upcoming PM occurrences
- PMs ready
- PMs at risk
- PMs blocked
- Total estimated material cost
- Suggested transfer quantity
- Suggested purchase quantity/value

### Forecast Table

| Due Date | PM | Equipment | Part | Required | Available | Reserved | PM Allocated | Shortage | Recommendation | Readiness |
|---|---|---|---|---:|---:|---:|---:|---:|---|---|

### Row Actions

- Allocate local stock
- Create transfer
- Create purchase request
- Release allocation
- View PM schedule
- View equipment BOM
- View site stock
- View stock transactions

Actions must be hidden or disabled when the user lacks the necessary permission.

## 15. PM Work-Order Integration

Extend the existing PM work-order generation flow:

1. Generate the maintenance request as it works today.
2. Find allocations using schedule ID and the occurrence date that generated the request.
3. Link the generated maintenance request to each allocation.
4. If an assignment exists, create `MaintenanceSpareUsage` records.
5. Use existing reservation behavior to reserve covered quantities.
6. Link each allocation to its spare usage record.
7. Set allocation status to `CONVERTED` when conversion succeeds.
8. Notify maintenance and store users if mandatory shortages remain.

If no assignment exists:

- Keep the allocation linked to the maintenance request.
- Convert it only after the assignment is created.
- Do not create a fake assignment.

The operation must be idempotent. Re-running work-order generation or conversion must not create duplicate usage records.

## 16. Recalculation Triggers

Recalculate affected forecasts when:

- PM due date changes.
- PM frequency changes.
- PM becomes inactive, completed, rejected, or cancelled.
- PM material requirements change.
- Stock is received or adjusted.
- Stock is transferred.
- Stock is reserved or released.
- A purchase request is created, updated, received, or cancelled.
- A PM work order is generated or cancelled.
- A PM allocation is released.

Use incremental recalculation based on site and spare-part ID. Do not recalculate every schedule after every stock transaction.

Add a scheduled reconciliation job as a safety net, for example nightly.

## 17. Scheduled Job and Metrics

Add Micrometer metrics:

- Forecast calculation duration.
- Number of PM occurrences processed.
- Number of material rows processed.
- Ready PM count.
- At-risk PM count.
- Blocked PM count.
- Recalculation failures.
- Allocation conversion failures.

Avoid high-cardinality metric tags such as PM ID, equipment ID, part ID, or raw site ID.

Scheduled job errors must include correlation ID and must not log sensitive payloads.

## 18. Example

PM details:

- PM: Annual Pump Overhaul
- Equipment: Pump-101
- Site: Chennai
- Due date: August 20
- Required bearings: 6

Inventory:

- Chennai current stock: 5
- Existing physical reservations: 2
- Earlier PM allocation: 1

Calculation:

```text
netAvailable = 5 - 2 - 1 = 2
localAllocation = min(6, 2) = 2
shortage = 6 - 2 = 4
```

Other site:

- Bengaluru transferable surplus: 3

Recommendation:

```text
Allocate locally: 2
Transfer from Bengaluru: 3
Purchase: 1
```

Cost:

```text
Chennai:   2 x 500 = 1,000
Bengaluru: 3 x 480 = 1,440
Purchase:  1 x 550 =   550
Estimated total    = 2,990
```

The PM is `AT_RISK` until the transfer and purchase are expected to arrive before August 20. It becomes `READY` after all mandatory quantity is covered.

## 19. Production Safeguards

- Never allocate the same physical availability twice.
- Process forecast demand in due-date order.
- Lock affected stock rows while converting allocation to physical reservation.
- Never reduce stock during soft planning allocation.
- Do not transfer below protected source stock.
- Do not create duplicate open purchases for covered quantities.
- Release allocations when a PM is cancelled or materially rescheduled.
- Preserve quantity and price snapshots.
- Make conversion and action endpoints idempotent.
- Validate access to every affected site.
- Maintain a full audit trail.
- Return clear conflict errors when stock changed after the forecast was calculated.
- Show forecast freshness and `generatedAt` on the UI.

## 20. Acceptance Criteria

### Material Template

- An authorized user can add active spare parts to a PM material template.
- The same spare part cannot be duplicated for one PM schedule.
- Quantity must be greater than zero.
- Equipment BOM parts are suggested but are not automatically treated as required.

### Forecast

- The forecast includes all PM occurrences inside the requested period.
- Inactive, rejected, completed, and out-of-range schedules are excluded.
- Required quantity is calculated from the PM material template.
- Existing physical reservations are deducted.
- Earlier active PM allocations are deducted.
- Shortage is never negative.
- Site access is enforced.

### Transfer Recommendation

- Only stock above the source site's protected minimum is recommended.
- Source planned demand is deducted.
- The same source quantity cannot be recommended to multiple PMs.
- User confirmation and permission are required.

### Purchase Recommendation

- Existing open reorder quantities expected before the PM date are considered.
- Duplicate purchase coverage is not created.
- User confirmation and permission are required.

### Work-Order Conversion

- Generated PM work orders reuse approved planning allocations.
- Spare usage is created only once.
- Existing spare reservation logic is reused.
- Mandatory shortages produce notifications.
- Cancelled/rescheduled PM occurrences release or recalculate allocations.

## 21. Test Plan

### Unit Tests

- Frequency-to-occurrence generation.
- Required quantity calculation.
- Net availability calculation.
- Due-date ordering of allocations.
- Shortage calculation.
- Transferable-surplus calculation.
- Open reorder coverage.
- Cost calculation.
- Readiness calculation.

### Service Tests

- Forecast for one site.
- Forecast for multiple allowed sites.
- User cannot forecast or act on unauthorized sites.
- Multiple PMs competing for the same part.
- Existing corrective reservation reduces PM availability.
- Existing PM allocation prevents double allocation.
- Transfer recommendation respects minimum stock.
- Purchase recommendation excludes an existing open reorder.
- Work-order conversion is idempotent.
- PM cancellation releases allocation.

### Concurrency Tests

- Two users allocate the same last available quantity.
- Allocation conversion and corrective reservation occur together.
- Stock receipt and forecast recalculation occur together.
- Transfer and reservation occur together.

### Integration Tests

- Liquibase migration from a clean database.
- PM schedule to forecast.
- Forecast to transfer.
- Forecast to reorder.
- Reorder receipt to recalculated readiness.
- PM generation to spare usage and reservation.
- API permission mapping coverage.
- Standard `ApiResponse` and error response contract.

### Frontend Tests

- Filters and date presets.
- Summary totals.
- Loading, empty, and error states.
- Permission-based action visibility.
- Recommendation confirmation.
- Drill-down navigation.
- Stale forecast conflict handling.

## 22. Implementation Phases

### Phase 1: Material Template

- Add `pm_material_requirement`.
- Add CRUD APIs.
- Add material section to the PM schedule create/edit/view experience.
- Suggest parts from the equipment BOM.

### Phase 2: Read-Only Forecast

- Generate recurring PM occurrences.
- Calculate requirement, availability, reservations, shortage, cost, and readiness.
- Add PM Material Planning page.
- Add filters, summary cards, and drill-downs.

### Phase 3: Planning Allocations

- Add `pm_material_allocation`.
- Add soft allocation and release behavior.
- Prevent double allocation.
- Add audit trail and stale-data conflict handling.

### Phase 4: Transfer and Purchase Actions

- Create transfers through the existing transfer service.
- Create reorders through the existing reorder service.
- Track action references.
- Recalculate readiness after actions and receipts.

### Phase 5: PM Work-Order Conversion

- Link allocations to generated PM requests.
- Convert allocations after assignment creation.
- Create spare usage and physical reservations.
- Add notifications for unresolved shortages.

### Phase 6: Production Hardening

- Add incremental recalculation events.
- Add nightly reconciliation.
- Add Micrometer metrics.
- Add concurrency and performance tests.
- Validate the full permission mapping.

## 23. Definition of Done

- Backend compiles and tests pass.
- Frontend build and tests pass.
- Liquibase succeeds from a clean database.
- Every new JSON API uses the standard response contract.
- Every protected API exists in `api-permission-mapping.csv`.
- Site-level access is tested.
- No duplicate reservation, transfer, purchase, or spare usage is possible.
- Forecast calculations are covered by unit and integration tests.
- Scheduled-job metrics and error logging are present.
- Graphify is updated using `graphify update .`.
- Changed files and implementation decisions are documented.

