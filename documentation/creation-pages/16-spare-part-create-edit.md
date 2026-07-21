> Extracted from the verified master document. See [CMMS Creation Page Documentation](../CMMS-Creation-Page-Documentation.md).

## 16. Spare Part/Site Stock Create/Edit and Equipment BOM Link

**Navigation:** Inventory → Spare Parts → Add Spare Part  
**Routes:** `/inventory/spare-parts/new`, `/inventory/spare-parts/{id}/edit`  
**Permissions:** `SPARE_PART_VIEW`, `SPARE_PART_CREATE`, `SPARE_PART_UPDATE`, `SPARE_PART_DELETE`.

| Field | Mapping | UI/Required | Purpose/example | Validation/source/edit |
|---|---|---|---|---|
| Part Code | `partCode` → same → `spare_part_master.part_code` | Text; mandatory | Unique code, `IGBT-1700V-01`. | Required/unique; locked on edit. |
| Part Name | `partName` → same → `part_name` | Text; mandatory | `1700V IGBT Module`. | Required; shared master value across sites. |
| Unit | `unit` → same → `unit` | Text; mandatory | `EA`, `L`, `M`. | Required free text. |
| Category | `category` → same → `category` | Text; optional | `INVERTER_ELECTRONICS`. | No category master. |
| Site | `siteId` → same → `spare_part_site_stock.site_id` | Dropdown; mandatory | Stock-owning site. | Site API; locked on edit. |
| Preferred Vendor | `preferredVendorId` → same → master vendor FK | Dropdown; optional | Suggested reorder supplier. | Vendors filtered to selected site. |
| Opening Stock | `currentStock` → same → `current_stock` | Number; create only | Initial physical balance. | Non-negative; creates `OPENING_BALANCE` transaction; locked on edit. |
| Minimum Stock | `minimumStock` → same → `minimum_stock` | Number; optional | Low-stock threshold. | Non-negative. |
| Unit Cost | `unitCost` → same → `unit_cost` | Number; optional | Inventory/usage valuation. | Non-negative. |
| Status | `status` → stock status | Dropdown | Site-stock availability. | Active/inactive. |
| Storage Location | `storageLocation` → same column | Text; optional | `Main Store/Rack A/Bin 03`. | Free text. |
| Description | `description` → master description | Text area; optional | Part specification. | Free text. |

Equipment BOM link fields: Equipment (mandatory, filtered by site), Recommended Qty (positive mandatory), Criticality, Replacement Frequency, Status, Remarks. Create/update/delete uses `/api/spare-parts/{stockId}/equipment-bom` APIs. The link associates the global part and site stock with compatible equipment.

Save uses `POST /api/spare-parts`; edit `PUT /api/spare-parts/{stockId}`. Main tables: `spare_part_master`, `spare_part_site_stock`, `equipment_spare_bom`, and `spare_part_transaction` for opening balance.

