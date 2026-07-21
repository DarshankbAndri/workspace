> Extracted from the verified master document. See [CMMS Creation Page Documentation](../CMMS-Creation-Page-Documentation.md).

## 15. Preventive Maintenance Schedule and Checklist Create/Edit

**Navigation:** Maintenance → Preventive Maintenance → Add Schedule  
**Routes:** `/maintenance/preventive/new`, `/maintenance/preventive/{id}/edit`  
**Permissions:** currently reused `REQUEST_VIEW`, `REQUEST_CREATE`, `REQUEST_UPDATE`, `REQUEST_DELETE`; calendar has `PM_CALENDAR_VIEW`.

| Field | Mapping | UI/Required | Purpose/example | Validation/source |
|---|---|---|---|---|
| Site | `siteId` → same → PM table `site_id` | Dropdown; mandatory | Plant/site. | Site API; filters equipment/vendors. |
| Equipment | `equipmentId` → same → `equipment_id` | Dropdown; mandatory | Asset maintained. | Equipment filtered by site. |
| AMC Coverage | `amcContractId` → same → `amc_contract_id` | Dropdown; optional | Contract covering PM. | Active AMC API; disabled if none; dates must be covered. |
| Assigned Vendor | `vendorId` → same → `vendor_id` | Dropdown; optional | External PM performer. | Vendors assigned to site. |
| Assigned To | `assignedTo` → same → `assigned_to` | Text; optional | Named internal/external assignee. | Free text. |
| PM Task | `title` → same → `title` | Text; mandatory | `Quarterly inverter cooling inspection`. | Required. |
| Frequency | `frequency` → same → `frequency` | Dropdown; mandatory | Recurrence. | Static supported frequencies; default monthly. |
| Priority | `priority` → same → `priority` | Dropdown | Risk priority. | Default medium. |
| Status | UI `active` → entity `active` | Dropdown | Enables recurrence. | Boolean active/inactive options. |
| Approval Status | `status` → same → `status` | Dropdown | Approval/lifecycle state. | Creation/update can become pending approval according to configuration. |
| Start/End/Next Due Date | matching properties/columns | Dates; start/next mandatory | Recurrence boundaries. | Next due cannot precede start or exceed end; end cannot precede start. |
| Description | `description` → same → `description` | Text area; mandatory | Work scope. | Required. |

Checklist template fields: Step/task title (mandatory), Instructions, Response (`CHECKBOX`, `TEXT`, `NUMBER`, `PHOTO`), Required, Proof Required, Active, and sequence controlled by move-up/down. Template rows are copied to generated assignments.

Create/update: `POST /api/preventive-maintenance/schedules`, `PUT /api/preventive-maintenance/schedules/{id}`. Work-order generation uses POST schedule action APIs and creates a maintenance request, optional assignment, and copied checklist. Schedule code is generated when absent and is not entered on the current UI.

**Not implemented:** runtime threshold/meter-triggered PM.

