> Extracted from the verified master document. See [CMMS Creation Page Documentation](../CMMS-Creation-Page-Documentation.md).

## 13. Equipment Downtime Create/Edit

**Navigation:** Maintenance → Downtime → Add Downtime  
**Routes:** `/maintenance/downtime/new`, `/maintenance/downtime/{id}/edit`  
**Permissions:** `DOWNTIME_VIEW`, `DOWNTIME_CREATE`, `DOWNTIME_UPDATE`, `DOWNTIME_DELETE` plus special workflow permissions.

| Field | Mapping | UI/Required | Purpose/example | Validation/source |
|---|---|---|---|---|
| Site | `siteId` → same → `equipment_downtime.site_id` | Dropdown; mandatory | Downtime site. | Site API; filters equipment. |
| Equipment | `equipmentId` → same → `equipment_id` | Dropdown; mandatory | Failed/affected asset. | Equipment filtered by site. |
| Maintenance Request | `requestId` → same → `request_id` | Dropdown; optional | Links corrective request. | Requests filtered by site/equipment. |
| Downtime Type | `planned` → same → `planned` | Dropdown | Planned/unplanned flag. | Boolean options. |
| Reason Category | `reasonCategory` → same → `reason_category` | Dropdown; optional | Standard cause group. | Static service-approved categories. |
| Reason Code | `reasonCode` → same → `reason_code` | Text; optional | Local code. | Free text. |
| Reason | `reason` → same → `reason` | Text; mandatory | Immediate reason, e.g. `Transformer oil leakage`. | Required. |
| Start/End Time | `downtimeStart`, `downtimeEnd` → matching columns | Date-time; start mandatory | Downtime interval. | End must be after start; overlapping records are rejected. |
| Production Line/Shift/Operator | matching properties/columns | Text; optional | Operational context. | Free text. |
| Expected Output / Hour | `expectedOutputPerHour` → same column | Number; optional | Expected production rate. | Non-negative. |
| Loss Rate / Unit | `lossRatePerUnit` → same column | Number; optional | Monetary value per lost unit. | Non-negative. |
| Lost Quantity/Minutes/Hours/Lost Amount | calculated entity/UI values | Read-only | Production and duration impact. | Derived from interval/rates. |
| Root Cause | `rootCause` → same → `root_cause` | Text area; optional initially | Confirmed cause. | Required before closing major downtime. |
| Remarks | `remarks` → same → `remarks` | Text area; optional | Operational notes. | Free text. |

Create/update APIs: `POST /api/maintenance/downtime`, `PUT /api/maintenance/downtime/{id}`. Status starts `OPEN` unless valid initial state. Workflow actions: confirm, start maintenance, restore, verify, close, and reopen use their specific POST APIs/permissions. Main table `equipment_downtime` stores loss, verification, closure, and audit fields.

