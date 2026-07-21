> Extracted from the verified master document. See [CMMS Creation Page Documentation](../CMMS-Creation-Page-Documentation.md).

## 8. Equipment Create/Edit

**Navigation:** Equipment → Add Equipment  
**Routes:** `/equipment/new`, `/equipment/{id}/edit`  
**Permissions:** `EQUIPMENT_VIEW`, `EQUIPMENT_CREATE`, `EQUIPMENT_UPDATE`, `EQUIPMENT_DELETE`.

Registers a maintainable asset used by requests, PM, downtime, AMC, spare BOM, documents, history, cost, and health calculations.

| Field | Mapping | UI/Required | Purpose/example | Validation/source/edit |
|---|---|---|---|---|
| Equipment Code | `equipmentCode` → same → `equipment_master.equipment_code` | Text; mandatory | Unique asset ID, `INV-B01-001`. | Required/unique; service trims/validates. |
| Equipment Name | `equipmentName` → same → `equipment_name` | Text; mandatory | `Central Inverter Block 01`. | Required. |
| Site | `siteId` → same → `site_id` | Dropdown; mandatory | Ownership/security site. | `GET /api/hr/sites`; only active/accessible values. |
| Category | `category` → same → `category` | Text; mandatory | `INVERTER`. | Required free text; no category master page exists. |
| Location | `location` → same → `location` | Text; optional | `Block 01 Inverter Room`. | Free text. |
| Manufacturer | `manufacturer` → same → `manufacturer` | Text; optional | `Sungrow`. | Free text. |
| Model Number | `modelNumber` → same → `model_number` | Text; optional | `SG3125HV`. | Free text. |
| Serial Number | `serialNumber` → same → `serial_number` | Text; optional | Manufacturer serial. | Backend uniqueness if configured; optional UI. |
| Status | `status` → same → `status` | Dropdown | Master status. | `ACTIVE`, `INACTIVE`, `UNDER_MAINTENANCE`, `RETIRED`. |
| Lifecycle Status | `lifecycleStatus` → same → `lifecycle_status` | Dropdown | Asset lifecycle. | `DRAFT`, `COMMISSIONED`, `ACTIVE`, `STANDBY`, `UNDER_MAINTENANCE`, `BREAKDOWN`, `DECOMMISSIONED`, `SCRAPPED`. |
| Operating Status | `operatingStatus` → same → `operating_status` | Dropdown | Current operating state used on dashboard/health. | `RUNNING`, `STANDBY`, `STOPPED`, `UNDER_MAINTENANCE`, `BREAKDOWN`. |
| Asset Condition | `assetCondition` → same → `asset_condition` | Dropdown | Inspection/health condition. | `GOOD`, `FAIR`, `POOR`, `CRITICAL`, `UNKNOWN`. |
| Ownership Type | `ownershipType` → same → `ownership_type` | Dropdown | Commercial ownership. | `OWNED`, `LEASED`, `RENTED`, `CUSTOMER_SUPPLIED`. |
| Installation/Commissioning Date | matching properties/columns | Dates; optional | `2024-02-15`, `2024-03-01`. | Service validates lifecycle chronology. |
| Warranty Expiry | `warrantyExpiryDate` → same → `warranty_expiry_date` | Date; optional | `2029-02-14`. | Date validation relative to installation where implemented. |
| Decommission Date | `decommissionDate` → same → `decommission_date` | Date; optional | Final service date. | Must align with lifecycle dates/status rules. |
| Criticality | `criticality` → same → `criticality` | Dropdown | Risk prioritization. | Static low/medium/high/critical; default medium. |
| Asset Number | `assetNumber` → same → `asset_number` | Text; optional | Finance asset ID. | Free text. |
| Purchase Date/Cost | matching properties → matching columns | Date/number; optional | `2024-01-10`, `8500000`. | Cost non-negative; chronology validated. |
| Capitalization Date | `capitalizationDate` → same column | Date; optional | Finance capitalization date. | Finance-date validation. |
| Depreciation Method | `depreciationMethod` → same column | Dropdown; optional | `STRAIGHT_LINE`. | Static options; clearable. |
| Cost Center | `costCenter` → same column | Text; optional | `RJ-INV-OPEX`. | Used in cost grouping/report. |
| Department | `department` → same column | Text; optional | `Electrical O&M`. | Used in ownership/cost reporting. |

Save calls `POST /api/equipment`; update calls `PUT /api/equipment/{id}`; success returns to equipment list. Equipment documents and spare BOM are separate embedded actions on the view page using `/documents` and `/spare-bom` APIs.

**Not implemented on this form:** equipment type master, parent equipment, vendor field, and meter configuration requested in the expected list.

