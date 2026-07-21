> Extracted from the verified master document. See [CMMS Creation Page Documentation](../CMMS-Creation-Page-Documentation.md).

## 6. Vendor Create/Edit and Site Assignment

**Navigation:** Vendors → Add Vendor  
**Routes:** `/vendors/new`, `/vendors/{id}/edit`  
**Permissions:** `VENDOR_VIEW`, `VENDOR_CREATE`, `VENDOR_UPDATE`, `VENDOR_DELETE`.

Used for maintenance partners, equipment/service suppliers, AMC vendors, and reorder sourcing. At least one site assignment is required.

| Field | Mapping | UI/Required | Purpose/example | Validation/source/edit |
|---|---|---|---|---|
| Vendor Code | `vendorCode` → same → `vendor_master.vendor_code` | Text; mandatory | Stable ID, `INV-SVC-01`. | Required and unique. |
| Vendor Name | `vendorName` → same → `vendor_name` | Text; mandatory | `Solar Inverter Services India`. | Required. |
| Contact Person | `contactPerson` → same → `contact_person` | Text; optional | `Amit Patel` | Free text. |
| Email | `email` → same → `email` | Email; optional | `support@vendor.example` | Email format. |
| Phone | `phone` → same → `phone` | Text; optional | `+91 90000 10001` | Backend length/no strict UI pattern. |
| Service Category | `serviceCategory` → same → `service_category` | Text; optional | `INVERTER_MAINTENANCE` | Free text, not a managed services list. |
| Active Vendor | `active` → same → active/status column | Switch; optional | Controls selectable vendor availability. | Boolean default from form/entity. |
| Address | `address` → same → `address` | Text area; optional | Registered/service address. | Free text. |
| Assigned Site | `siteAssignments[].siteId` → vendor-site table | Dropdown; mandatory per row | Site where vendor may be selected. | `GET /api/hr/sites`; duplicate/site-access validation. |
| Assignment Status | row `status` | Dropdown; optional | Activates vendor at that site. | Static active/inactive. |

Save/update APIs are `POST /api/vendors` and `PUT /api/vendors/{id}`. Success returns to vendor list. Site assignment determines site-filtered vendor dropdowns in AMC, PM, and assignments. Main tables: `vendor_master` and vendor-site assignment table.

