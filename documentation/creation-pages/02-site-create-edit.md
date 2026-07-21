> Extracted from the verified master document. See [CMMS Creation Page Documentation](../CMMS-Creation-Page-Documentation.md).

## 2. Site Create/Edit/View

### Purpose, users, and timing

**Navigation:** HR & Sites → Sites → Add Site  
**Routes:** `/hr/sites/new`, `/hr/sites/{id}/edit`, `/hr/sites/{id}/view`  
**Permissions:** `SITE_VIEW`, `SITE_CREATE`, `SITE_UPDATE`, `SITE_DELETE`.  
Creates the plant/site boundary used for equipment, employees, vendors, requests, downtime, inventory, reports, and record-level authorization.

### Fields

| Field | Technical mapping | UI/Required | Purpose and usage | Example | Validation / source / edit behavior |
|---|---|---|---|---|---|
| Site Code | `siteCode` → `siteCode` → `site_master.site_code` | Text; mandatory | Short unique plant identifier used in lists and references. | `RJ-SP-01` | Required; backend uniqueness/length applies. Editable on edit. |
| Site Name | `siteName` → `siteName` → `site_master.site_name` | Text; mandatory | Human-readable plant name. | `Rajasthan Solar Park` | Required. |
| Organization Name | `organizationName` → same → `organization_name` | Text; optional | Operating/legal organization associated with site. | `Sunrise Solar O&M` | Free text. No Company dropdown exists here. |
| Site Type | `siteType` → same → `site_type` | Text; optional | Classifies facility. | `SOLAR_POWER_PLANT` | Free text, not an enum/dropdown. |
| Status | `status` → same → `status` | Dropdown; optional | Controls active use and helper lists. | `ACTIVE` | Static `ACTIVE`/`INACTIVE`; default active. Delete action marks inactive. |
| Address Line 1/2 | `addressLine1`, `addressLine2` → same → corresponding columns | Text; optional | Physical site address. | `Plot 14, Solar Park Road` | Free text. |
| City/State/Country/Pincode | matching properties → matching columns | Text; optional | Geographic and postal reference. | `Jaisalmer`, `Rajasthan`, `India`, `345001` | No dedicated country/state dropdown or pincode regex in UI. |
| Contact Person | `contactPerson` → same → `contact_person` | Text; optional | Primary site contact. | `Anita Sharma` | Free text. |
| Contact Mobile | `contactMobile` → same → `contact_mobile` | Text; optional | Site escalation number. | `+91 99887 77665` | No strict UI phone pattern. |
| Contact Email | `contactEmail` → same → `contact_email` | Email; optional | Site email contact. | `rjplant@sunrise.example` | Browser email control/backend validation. |
| Latitude/Longitude | `latitude`, `longitude` → same → matching columns | Number; optional | Map/geographic coordinates. | `26.9157`, `70.9083` | Numeric UI; current page does not enforce geographic ranges. |

### Workflow and dependencies

1. Enter code/name and optional address/contact/location data.
2. Save with `POST /api/hr/sites` or update with `PUT /api/hr/sites/{id}`.
3. On success, return to `/hr/sites`.
4. The site becomes available through `GET /api/hr/sites` to equipment, employee, vendor, AMC, maintenance, downtime, spare, dashboard, and report pages, filtered by authorization where applicable.

Main table: `site_master`; primary key `site_id`. `DELETE /api/hr/sites/{id}` is exposed as “mark inactive,” preserving references. Cancel returns to the site list and discards unsaved changes without a custom confirmation.

**Not implemented:** Capacity and timezone fields requested in the expected specification are not present on the current site form/entity.

