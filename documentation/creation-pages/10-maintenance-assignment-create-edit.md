> Extracted from the verified master document. See [CMMS Creation Page Documentation](../CMMS-Creation-Page-Documentation.md).

## 10. Maintenance Assignment Create/Edit

**Navigation:** Maintenance → Assignments → Add Assignment  
**Routes:** `/maintenance/assignments/new`, `/maintenance/assignments/{id}/edit`  
**Permissions:** `ASSIGNMENT_VIEW`, `ASSIGNMENT_CREATE`, `ASSIGNMENT_UPDATE`, `ASSIGNMENT_DELETE`.

| Field | Mapping | UI/Required | Purpose/example | Validation/source/edit |
|---|---|---|---|---|
| Site | `siteId` (derived through request) | Dropdown; mandatory | Filters requests, vendors, employees, and spares. | `GET /api/hr/sites`; site access enforced. |
| Request | `requestId` → same → `maintenance_assignment.request_id` | Dropdown; mandatory | Work demand being assigned. | Maintenance request API, filtered by site. |
| Vendor | `vendorId` → same → `vendor_id` | Dropdown; optional | External assignee. | Vendors filtered by site. |
| Assigned Technician | `assignedEmployeeId` → same → `assigned_employee_id` | Dropdown; optional | Internal technician. | Employee search filtered to selected site/active records. |
| Assigned To | `assignedTo` → same → `assigned_to` | Text; mandatory | Display assignee; auto-filled/locked when technician selected. | Required. |
| Assigned Date | `assignedDate` → same → `assigned_date` | Date; optional | Assignment date; defaults today. | Backend fills today if omitted. |
| Planned Start/End | matching properties/columns | Dates; optional | Scheduled work window. | End must not precede start. |
| Status | `status` → same → `status` | Dropdown | Assignment lifecycle, default `ASSIGNED`. | Actual allowed statuses come from page/service rules. |
| Actual Start/End | matching properties/columns | Dates; optional | Actual execution dates. | End must not precede start. |
| Estimated Cost | `estimatedCost` → same → `estimated_cost` | Number; optional | Planned service cost. | Non-negative. |
| Service/Vendor Cost | `actualCost` → same → `actual_cost` | Number; optional | Actual non-material cost. | Non-negative. |
| Material Cost | calculated from spare usage | Read-only | Sum of qualifying consumed material. | Not editable. |
| Total Actual Cost | service + material | Read-only | Total assignment cost. | Calculated UI value. |
| Remarks | `remarks` → same → `remarks` | Text area; optional | Instructions/context. | Free text. |

Save/update uses `POST /api/maintenance/assignments` and `PUT /api/maintenance/assignments/{id}`. After an ID exists, Checklist, Work Logs, and Spare Parts tabs become available.

