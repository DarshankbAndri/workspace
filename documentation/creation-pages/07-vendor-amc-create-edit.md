> Extracted from the verified master document. See [CMMS Creation Page Documentation](../CMMS-Creation-Page-Documentation.md).

## 7. Vendor AMC Contract Create/Edit and Equipment Mapping

**Navigation:** Vendors → AMC Contracts → Create  
**Routes:** `/vendor-amc/create`, `/vendor-amc/edit/{id}`  
**Permissions:** `VENDOR_AMC_VIEW`, `VENDOR_AMC_CREATE`, `VENDOR_AMC_UPDATE`, `VENDOR_AMC_DELETE`, `VENDOR_AMC_ASSIGN_EQUIPMENT`, `VENDOR_AMC_RENEW`.

Creates a time-bound service contract, SLA, coverage, and equipment mappings used by maintenance requests and PM schedules.

| Field | Mapping | UI/Required | Purpose/example | Validation/source/edit |
|---|---|---|---|---|
| Site | `siteId` → same → `vendor_amc_contract.site_id` | Dropdown; mandatory | Contract operating site. | `GET /api/hr/sites`; locked on edit; filters vendors/equipment. |
| Vendor | `vendorId` → same → `vendor_id` | Dropdown; mandatory | Contracting service vendor. | `GET /api/vendors`, filtered to selected site assignments. |
| Contract Number | `contractNumber` → same → `contract_number` | Text; mandatory | `AMC-INV-2026-001`. | Required, unique. |
| Contract Name | `contractName` → same → `contract_name` | Text; mandatory | `Inverter Comprehensive AMC FY26`. | Required. |
| Contract Type | `contractType` → same → `contract_type` | Dropdown; optional | `COMPREHENSIVE`. | Static options from page constants. |
| Start/End Date | matching properties → matching columns | Dates; mandatory | `2026-04-01` to `2027-03-31`. | End must not precede start; coverage mappings must fit contract dates. |
| Status | `status` → same → `status` | Dropdown; optional | `ACTIVE`, `DRAFT`, etc. | Enum/static options; lifecycle rules enforced by service. |
| Contract Value | `contractValue` → same → `contract_value` | Number; optional | `1250000.00`. | Non-negative money. |
| Response Time | `responseTimeHours` → same → `response_time_hours` | Number; optional | Vendor acknowledgement SLA, e.g. `2`. | Non-negative. |
| Resolution Time | `resolutionTimeHours` → same → `resolution_time_hours` | Number; optional | Restoration SLA, e.g. `8`. | Non-negative. |
| Labor/Spares Included | `includesLabor`, `includesSpares` → matching columns | Yes/No dropdowns | Defines commercial coverage shown on request/AMC views. | Boolean. |
| Contact Person/Phone/Email | matching properties/columns | Inputs; optional | Contract-specific escalation contact. | Email control for email. |
| Covered Equipment | `equipmentIds[]` → `equipment_amc_mapping` | Multi-select; optional | Assets covered by contract. | Equipment loaded by API and filtered to selected site; overlapping active coverage is blocked. |
| Coverage Description | `coverageDescription` → same column | Text area; optional | Included services/components. | Free text. |
| Remarks | `remarks` → same column | Text area; optional | Administrative notes. | Free text. |

Create calls `POST /api/vendor-amc` with equipment mappings. Edit calls `PUT /api/vendor-amc/{id}`, then synchronizes additions/removals using `POST /api/vendor-amc/{id}/equipment` and `DELETE /api/vendor-amc/{id}/equipment/{equipmentId}`. Success opens the AMC view page. Renewal uses a separate `POST /api/vendor-amc/{id}/renew` action and preserves historical contracts via `renewed_from_contract_id`.

