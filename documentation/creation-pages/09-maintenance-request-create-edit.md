> Extracted from the verified master document. See [CMMS Creation Page Documentation](../CMMS-Creation-Page-Documentation.md).

## 9. Maintenance Request Create/Edit

**Navigation:** Maintenance → Requests → Add Request  
**Routes:** `/maintenance/requests/new`, `/maintenance/requests/{id}/edit`  
**Permissions:** `REQUEST_VIEW`, `REQUEST_CREATE`, `REQUEST_UPDATE`, `REQUEST_DELETE`; transitions use `REQUEST_UPDATE`.

Creates corrective, preventive, inspection, or calibration demand tied to a site/equipment. Requests feed assignment, downtime, AMC vendor handling, equipment history, approvals, and reports.

| Field | Mapping | UI/Required | Purpose/example | Validation/source/edit |
|---|---|---|---|---|
| Site | `siteId` → same → `maintenance_request.site_id` | Dropdown; mandatory | Plant responsible for request. | `GET /api/hr/sites`; filters equipment. |
| Equipment | `equipmentId` → same → `equipment_id` | Dropdown; mandatory | Affected asset. | `GET /api/equipment`; filtered by selected site. Changing it rechecks AMC. |
| AMC information | read-only from active AMC | Information | Shows contract/vendor/SLA/coverage. | `GET /api/equipment/{id}/active-amc`. |
| Assign to AMC Vendor | `externalVendorAssignment` | Yes/No; conditional | Routes request context to covered vendor. | Shown only with active AMC; populates vendor/contract. |
| AMC Vendor | derived `vendorId` | Read-only | Displays selected AMC vendor. | Derived from active contract. |
| Vendor Reference Number | `vendorReferenceNumber` → same column | Text; conditional | Vendor ticket/case reference. | Shown only with AMC. |
| Title | `title` → same → `title` | Text; mandatory | Short issue, e.g. `Inverter communication failure`. | Required. |
| Reported By | `reportedBy` → same → `reported_by` | Text; optional | Person/source reporting issue. | Free text, not current-user dropdown. |
| Type | `requestType` → same → `request_type` | Dropdown | `BREAKDOWN`, `PREVENTIVE`, `INSPECTION`, `CALIBRATION`. | Defaults `BREAKDOWN`. |
| Priority | `priority` → same → `priority` | Dropdown | `LOW`, `MEDIUM`, `HIGH`, `URGENT`. | Defaults medium. |
| Requested Date | `requestedDate` → same → `requested_date` | Date; optional | Business request date. | Defaults today. |
| Target Completion | `targetCompletionDate` → same column | Date; optional | Due date used for overdue logic. | Should not precede request date; backend validation is authoritative. |
| Description | `description` → same → `description` | Text area; mandatory | Full symptoms/impact. | Required. |

Create/update: `POST /api/maintenance/requests`, `PUT /api/maintenance/requests/{id}`. Success returns to request list. Status is excluded from normal edit payload; controlled workflow transitions use `POST /api/maintenance/requests/{id}/transition`. Request number, timestamps, approval metadata, and PM/AMC links are backend-generated/read-only.

**Not implemented:** failure-type dropdown and attachments on the request form.

