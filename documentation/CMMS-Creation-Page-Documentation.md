# CMMS Creation, Configuration, and Transaction Page Documentation

**Application:** Solar Power Plant Computerized Maintenance Management System (CMMS)  
**Document version:** 1.0  
**Verified against source:** 21 July 2026  
**Audience:** Business users, plant operators, maintenance and store managers, administrators, developers, testers, and client/demo users

---

## Document Control and Scope

This document describes every currently implemented route or embedded UI workflow that creates, edits, configures, approves, assigns, uploads, issues, consumes, returns, transfers, or submits application data. Field names, APIs, permissions, and database mappings are based on the current frontend, backend, Liquibase, and `api-permission-mapping.csv`.

The application uses a standard JSON response envelope (`ApiResponse<T>`). API paths below include the configured `/api` servlet context. Site-filtered operations additionally apply record-level site access in backend services.

### How to read field tables

- **UI/Required** identifies the visible control and whether the current UI requires it.
- **Technical mapping** lists frontend property → DTO property → database column.
- **Source/Edit** explains dropdown origin, defaults, dependencies, and edit restrictions.
- “Backend generated” means users do not enter the value.

## Application Creation Order

```text
Company profile
  → Sites
  → Roles and permissions
  → Employees/login accounts
  → Vendors and AMC contracts
  → Equipment
  → PM schedules and maintenance requests
  → Assignments
  → Checklists, work logs, downtime, and spare requests
  → Stock fulfilment, transfers, reorders, consumption, and reports
```

## Actual Role and Permission Model

Routes and buttons use permission codes rather than hard-coded business-role names. Roles are configurable; therefore “who uses this page” means users whose assigned role contains the stated permission. Common seeded/business-facing role codes referenced by current configuration include `SUPER_ADMIN`, `ADMIN`, `MAINTENANCE_MANAGER`, and `EMPLOYEE`, but clients can create additional roles.

---

<!-- PAGE:01-company-create-edit -->
## 1. Company Profile Create/Edit

### Purpose, users, and timing

**Navigation:** Administration → Company  
**Route:** `/admin/company`  
**Users:** Company administrators with `COMPANY_VIEW`; saving requires `COMPANY_CREATE` for the first record or `COMPANY_UPDATE` afterward.  
**Use when:** initially configuring the tenant/company or changing its business identity and branding. Company name and logo are returned by the company APIs and used by application branding; report-specific use depends on each report implementation.

**Prerequisites:** Authenticated administrator. No company dropdown or multi-company selector exists on this page.

### Fields

| Field | Technical mapping | UI/Required | Purpose and usage | Solar example | Validation / source / edit behavior |
|---|---|---|---|---|---|
| Company Code | `companyCode` → `companyCode` → `company_master.company_code` | Text; mandatory | Stable business code used to identify the company record. | `SUNOPS` | UI rejects blank; backend DTO is not blank; persisted code is unique. Editable when user can persist. |
| Company Name | `companyName` → `companyName` → `company_master.company_name` | Text; mandatory | Display/legal name used in company profile and branding. | `Sunrise Solar Operations Pvt Ltd` | UI rejects blank; backend not blank. |
| Email | `email` → `email` → `company_master.email` | Email; optional | General company contact. | `operations@sunrise.example` | Browser email control plus backend email validation where configured. |
| Phone Number | `phoneNumber` → `phoneNumber` → `company_master.phone_number` | Text; optional | Company contact number. | `+91 98765 43210` | No strict UI pattern; backend length applies. |
| Status | `status` → `status` → `company_master.status` | Dropdown; optional | Enables/inactivates the company profile. | `ACTIVE` | Static options `ACTIVE`, `INACTIVE`; defaults to `ACTIVE`. |
| Address | `address` → `address` → `company_master.address` | Text area; optional | Registered/operational address used as company reference data. | `Solar Park Road, Jaisalmer, Rajasthan` | Free text. |
| Upload Logo | multipart `file` → stored logo metadata/path | File; optional | Replaces branding image. | `sunrise-logo.png` | Sent after company save to `/api/company/upload-logo`; file rules come from backend multipart/allowed-content implementation. Existing preview remains until replaced. |

### Save, edit, cancel, APIs, and database

- Save calls `POST /api/company/create`; update calls `PUT /api/company/update/{id}`; logo upload follows with `POST /api/company/upload-logo`.
- The page remains on the company profile and reloads the saved response. Users without create/update permission see disabled fields.
- There is no destructive company delete action in the current UI/mapping.
- Main table: `company_master`; audit/status columns are defined in its Liquibase/entity mapping.

**Tips:** Use a stable short code and a landscape/transparent logo.  
**Common errors:** blank code/name, invalid image, or `COMPANY_VIEW` without the appropriate save permission.

---

<!-- PAGE:02-site-create-edit -->
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

---

<!-- PAGE:03-employee-create-edit -->
## 3. Employee, Login, Site, and Role Assignment Create/Edit

### Purpose and prerequisites

**Navigation:** HR & Sites → Employees → Add Employee  
**Routes:** `/hr/employees/new`, `/hr/employees/{id}/edit`, `/hr/employees/{id}/view`  
**Permissions:** `EMPLOYEE_VIEW`, `EMPLOYEE_CREATE`, `EMPLOYEE_UPDATE`, `EMPLOYEE_DELETE`. Helper APIs for sites are mapped to the respective page permissions. Role loading also requires an allowed role API mapping; see inconsistencies.

Creates the employee master, optional login account, site responsibilities, and security-role assignments. At least one site assignment is mandatory. When login is enabled, username/password and at least one role assignment are required.

### Identity and employment fields

| Field | Technical mapping | UI/Required | Purpose / example | Validation and behavior |
|---|---|---|---|---|
| Employee Code | `employeeCode` → same → `employee_master.employee_code` | Text; mandatory | Stable workforce ID, e.g. `EMP-RJ-0042`. | UI required; backend unique/length rules. |
| First Name | `firstName` → same → `first_name` | Text; UI mandatory | `Ravi` | Required in UI/backend. |
| Last Name | `lastName` → same → `last_name` | Text; optional | `Kumar` | Optional. |
| Mobile Number | `mobileNumber` → same → `mobile_number` | Text; mandatory | Technician/contact number. | UI rejects blank; backend rules apply. |
| Email | `email` → same → `email` | Email; optional | `ravi.kumar@sunrise.example` | Email format where present; uniqueness may be enforced for linked users. |
| Gender | `gender` → same → `gender` | Dropdown; optional | `MALE`, `FEMALE`, `OTHER` | Static options. |
| Date of Birth | `dateOfBirth` → same → `date_of_birth` | Date; optional | `1992-08-14` | Date input; no age rule visible in UI. |
| Date of Joining | `dateOfJoining` → same → `date_of_joining` | Date; optional | `2026-04-01` | Date input. |
| Designation | `designation` → same → `designation` | Text; optional | `Electrical Technician` | Free text. |
| Department | `department` → same → `department` | Text; optional | `Operations & Maintenance` | Free text; no Team master exists. |
| Status | `status` → same → `status` | Dropdown; optional | `ACTIVE` | Static active/inactive; default active. |

### Login fields

| Field | Technical mapping | UI/Required | Purpose / example | Validation and behavior |
|---|---|---|---|---|
| Enable Login | `loginEnabled` | Switch; optional | Creates/maintains a linked application user. | When false, login fields are disabled. |
| Username | `username` → linked user username | Text; conditional | `ravi.kumar` | Required when login enabled; uniqueness enforced by user service/database. |
| Auth Role | `authRole` → linked user base role | Dropdown; conditional | `EMPLOYEE` | Static authentication role option; not a substitute for permission-role assignments. |
| Account Status | `accountStatus` → linked user status | Dropdown; conditional | `ACTIVE` | Active/inactive options. |
| Reset Password | local UI flag | Checkbox; edit only | Reveals password controls for an existing linked account. | Not persisted as a database field. |
| Password / Confirm Password | `password`, `confirmPassword` | Password; conditional | Temporary secret supplied securely | Required for new login; values must match; never documented/screenshot with real secrets and never returned. |

### Site assignment rows

| Field | Mapping | Required | Source / use |
|---|---|---:|---|
| Site | `siteAssignments[].siteId` → `employee_site_assignment.site_id` | Yes | `GET /api/hr/sites`; only accessible/non-inactive sites should be offered. |
| Role Name | `siteAssignments[].roleName` → `role_name` | Yes | Free text describing operational responsibility at that site. |
| Primary Site | `primarySite` → `primary_site` | One primary expected | Checkbox; selecting one clears other primary flags. |
| Effective From/To | matching properties → matching columns | Optional | Validity period for the site assignment. |
| Status | assignment `status` | Optional | Active/inactive static dropdown. |

### Permission-role assignment rows

| Field | Mapping | Required | Source / use |
|---|---|---:|---|
| Scope | `scopeType`/`siteId` | Conditional | Global or site-specific authorization scope. |
| Role | `roleId` | Required when login enabled | Loaded from role service; selects permissions applied to the account. |
| Status | `status` | Optional | Active/inactive role assignment. |

Save uses `POST /api/hr/employees`; update uses `PUT /api/hr/employees/{id}`; success returns to employee list. Main tables include `employee_master`, `employee_site_assignment`, linked `users`, and user-role assignment tables. The service validates duplicate sites, date ranges, roles, password rules, and site access.

**Common mistakes:** enabling login without a password/role, duplicate site rows, no primary site, password mismatch, or assigning an inaccessible site.

---

<!-- PAGE:04-role-create-edit -->
## 4. Role Create/Edit and Permission Assignment

**Navigation:** Administration → Roles → Add Role  
**Routes:** `/admin/roles/new`, `/admin/roles/{id}/edit`; view has a separate read-only page.  
**Permissions:** `ROLE_VIEW`, `ROLE_CREATE`, `ROLE_UPDATE`, `ROLE_DELETE`; permission catalogue uses `PERMISSION_VIEW` APIs where mapped.

Roles group permissions that control frontend routes/buttons and backend API authorization.

| Field | Mapping | UI/Required | Purpose / example | Validation/source/edit |
|---|---|---|---|---|
| Role Code | `roleCode` → same → role table `role_code` | Text; mandatory | Stable machine code, e.g. `SOLAR_TECHNICIAN`. | Required; normalized/unique by backend. Changing a used code can affect configuration references. |
| Role Name | `roleName` → same → `role_name` | Text; mandatory | Display name, e.g. `Solar Technician`. | Required. |
| Description | `description` → same → `description` | Text; optional | Explains intended responsibility. | Free text. |
| Status | `status` → same → `status` | Dropdown; mandatory | Activates/inactivates role. | Static `ACTIVE`/`INACTIVE`. |
| Permissions | `permissionIds[]` → role-permission join table | Grouped checkboxes; optional | Grants page/action/API abilities. | Loaded from `GET /api/admin/permissions`; searchable and grouped. Existing selections load from role detail. |

Save: `POST /api/admin/roles`; update: `PUT /api/admin/roles/{id}`; cancel/success returns to `/admin/roles`. Role changes affect users assigned that role and cached API-permission evaluation; backend change flows should clear relevant cache as implemented.

**Tip:** Grant the smallest permission set and include helper API permissions required by a page. **Mistake:** granting only a route permission while omitting dropdown/helper API access.

---

<!-- PAGE:05-user-account-create -->
## 5. Standalone User Account Creation

**Navigation/Route:** `/create-user` (protected by `USER_ROLE_ASSIGN`)  
**Purpose:** Creates an application user through the HR-oriented user service. This is separate from the richer employee form and can produce identity duplication if governance is unclear.

| Field | Frontend/API property | UI/Required | Purpose/example | Validation/source |
|---|---|---|---|---|
| Username | `username` | Text; mandatory | Login ID, `plant.admin2`. | UI rejects blank; backend uniqueness. |
| Email | `email` | Email; mandatory | Account contact/login recovery identity. | UI required/email control; backend email/uniqueness. |
| First Name | `firstName` | Text; mandatory | `Meera` | UI required. |
| Last Name | `lastName` | Text; mandatory | `Singh` | UI required. |
| Department | `department` | Text; mandatory | `Plant Administration` | UI required. |
| Role | `role` | Dropdown; mandatory | Base role assigned to account. | Static page options; default must be reviewed against backend accepted values. |
| Manager ID | `managerId` | Number; optional | Links a manager by numeric user/employee identifier. | No dropdown; incorrect IDs may fail backend validation. |

The page first resolves the current HR user context and calls the user creation service, ultimately using the mapped user API (`POST /api/users`). Success shows a temporary-password message returned by the server and redirects to the first permitted route. Never expose that temporary password in documentation or screenshots.

**Implementation issue:** This page uses direct MUI fields rather than project common form components and overlaps employee login creation.

---

<!-- PAGE:06-vendor-create-edit -->
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

---

<!-- PAGE:07-vendor-amc-create-edit -->
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

---

<!-- PAGE:08-equipment-create-edit -->
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

---

<!-- PAGE:09-maintenance-request-create-edit -->
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

---

<!-- PAGE:10-maintenance-assignment-create-edit -->
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

---

<!-- PAGE:11-assignment-checklist -->
## 11. Assignment Checklist Add/Edit/Proof Upload

**Location:** Assignment edit/view → Checklist tab  
**Permissions:** `ASSIGNMENT_CHECKLIST_VIEW`, `ASSIGNMENT_CHECKLIST_UPDATE`; the UI refers to proof-specific permission names, while CSV maps proof upload/delete under `ASSIGNMENT_CHECKLIST_UPDATE`—see inconsistencies.

| Field | Mapping | Required | Purpose/validation |
|---|---|---:|---|
| Task | `taskTitle` → checklist entity `task_title` | Required for meaningful row | Work step, e.g. `Inspect DC terminal torque`. |
| Instructions | `instructions` → `instructions` | No | Execution guidance. |
| Response Type | `responseType` → `response_type` | Default checkbox | `CHECKBOX`, `TEXT`, `NUMBER`, `PHOTO`. |
| Required | `required` → `required` | Boolean | Required steps can block assignment completion. |
| Proof Required | `proofRequired` → `proof_required` | Boolean | Requires file before completion when configuration enables it. |
| Status | row `status` | Yes during execution | `PENDING`, `COMPLETED`, `NOT_APPLICABLE`. |
| Reading/Response | `responseValue` → `response_value` | Conditional | Numeric/text/check response. |
| Remarks | `remarks` → `remarks` | No | Technician evidence/context. |
| Proof File | multipart file → checklist proof table | Conditional | Photo/PDF evidence; content type and 10 MB configured maximum. |

APIs: GET/POST `/api/maintenance/assignments/{assignmentId}/checklist`; PUT/DELETE row path; POST/DELETE proof paths. PM-generated assignments copy checklist template items, which cannot be deleted like manually added rows. Required/proof rules are enforced before completion.

---

<!-- PAGE:12-technician-work-log -->
## 12. Technician Work Log Create/Edit and Attachment Upload

**Location:** Assignment edit/view → Work Logs tab  
**Permissions:** `ASSIGNMENT_WORK_LOG_VIEW`, `ASSIGNMENT_WORK_LOG_CREATE`, `ASSIGNMENT_WORK_LOG_UPDATE`, `ASSIGNMENT_WORK_LOG_DELETE`.

| Field | Mapping | UI/Required | Purpose/example | Validation/source |
|---|---|---|---|---|
| Technician | `technicianEmployeeId` → `technician_employee_id` | Dropdown; mandatory | Person performing work. | Active employees from assignment site. |
| Start Time | `startTime` → `start_time` | Date-time; mandatory | Work start. | Required. |
| End Time | `endTime` → `end_time` | Date-time; optional | Work finish. | Must not precede start. |
| Status | `completionStatus` → `completion_status` | Dropdown | `IN_PROGRESS`, `COMPLETED`, `FOLLOW_UP_REQUIRED`, `CANCELLED`. | Defaults in progress. |
| Work Notes | `workNotes` → `work_notes` | Text; optional | Activity summary. | Free text. |
| Issue Found | `issueFound` → `issue_found` | Text; optional | Diagnosis, e.g. `Cooling fan bearing seized`. | Free text. |
| Action Taken | `actionTaken` → `action_taken` | Text; optional | Repair performed. | Free text. |
| Attachment | multipart file → work-log attachment table | Optional | Photo/report evidence. | Backend file limits/content validation. |

APIs: POST `/api/maintenance/assignments/{id}/work-logs`; PUT/DELETE row paths; POST/DELETE attachment paths; GET/download operations require view authorization. Completion progress appears on the assignment.

---

<!-- PAGE:13-downtime-create-edit -->
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

---

<!-- PAGE:14-downtime-rca -->
## 14. Downtime RCA Action Add/Edit

**Location:** Downtime view → RCA Actions  
**Permission:** `DOWNTIME_RCA_MANAGE`; unavailable after closed/cancelled.

| Field | Mapping | Required | Purpose/validation |
|---|---|---:|---|
| Action Type | `actionType` → RCA action column | No/default | Corrective/preventive action classification from static options. |
| Target Date | `targetDate` → target date column | Optional | Due date for RCA action. |
| Status | `status` → status column | Default | RCA action progress from static options. |
| Action Description | `description` → description column | Mandatory | Specific corrective/preventive action. |

POST `/api/maintenance/downtime/{id}/rca-actions`; PUT row path. Major downtime cannot close without a root cause and at least one RCA action. Timeline/history records transitions and action changes.

---

<!-- PAGE:15-preventive-maintenance-create-edit -->
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

---

<!-- PAGE:16-spare-part-create-edit -->
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

---

<!-- PAGE:17-stock-operations -->
## 17. Stock In, Adjustment, Transfer, and Import

**Location:** Inventory → Spare Parts list action dialogs  
**Permissions:** `STOCK_TRANSACTION_CREATE`; import uses `SPARE_PART_CREATE`; history uses `STOCK_TRANSACTION_VIEW`.

### Stock In / Adjustment fields

| Field | API property | Required | Rules/use |
|---|---|---:|---|
| Quantity to Add / New Stock Quantity | `quantity` | Yes | Stock-in must be positive; adjustment is a non-negative target balance and cannot be below reserved stock. |
| Unit Cost | `unitCost` | Optional | Defaults to current cost; non-negative. Stock-in currently replaces current site cost. |
| Remarks | `remarks` | Optional | Audit explanation. Strongly recommended for adjustment. |

APIs: POST `/api/spare-parts/{stockId}/stock-in` or `/adjust`. Both lock stock, update balance, write before/after transaction, and may trigger low-stock notification.

### Site-to-site transfer fields

| Field | API property | Required | Rules/use |
|---|---|---:|---|
| Target Site | `targetSiteId` | Yes | Site API; excludes source; user needs access to both sites. |
| Quantity | `quantity` | Yes | Positive and cannot exceed available (`current-reserved`). |
| Target Storage Location | `targetStorageLocation` | Optional | Creates/updates destination location. |
| Remarks | `remarks` | Optional | Transfer audit note. |

POST `/api/spare-parts/{sourceStockId}/transfer` immediately writes `TRANSFER_OUT` and `TRANSFER_IN`; there is no dispatch/receipt in-transit workflow.

### Import

Accepts `.xlsx`, `.xls`, or `.csv` at POST `/api/spare-parts/import`; returns created/updated/failed counts and row errors. Import can create opening/adjustment transactions. Use sanitized templates and review site IDs/codes before upload.

---

<!-- PAGE:18-spare-request-and-fulfilment -->
## 18. Spare Request, Approval, Store Fulfilment, Consumption, and Return

### Request

**Location:** Assignment edit → Spare Parts tab  
**Permissions:** `SPARE_USAGE_VIEW`, `SPARE_USAGE_CREATE`, `SPARE_USAGE_UPDATE`, `SPARE_USAGE_DELETE`.

| Field | Mapping | Required | Source/use |
|---|---|---:|---|
| Spare Part | `stockId` → site stock FK | Yes by backend | Site stock API, filtered to assignment site; equipment BOM recommendations may be loaded. |
| Quantity / Requested Quantity | `quantityUsed` | Positive | Requested amount. One part/site-stock row per assignment due to unique constraint. |
| Remarks | `remarks` | Optional | Need/reason/instructions. |

POST `/api/maintenance/assignments/{id}/spares` (or `/api/assignments/{id}/spare-requests` in the store-oriented flow). Initial status `REQUESTED`.

### Manager approval

**Route:** `/inventory/spare-approvals`; permission `SPARE_USAGE_MANAGER_APPROVE`. Fields: Approved Qty (positive, cannot exceed business limits enforced by service) and Remarks. POST manager approve/reject endpoints.

### Store processing

**Route:** `/inventory/spare-requests`. Actions and permissions:

- Check stock: `SPARE_USAGE_STORE_PROCESS`.
- Reserve: `SPARE_USAGE_RESERVE`.
- Issue: `SPARE_USAGE_ISSUE`.
- Create purchase request when unavailable: `REORDER_CREATE`.
- Consume/return: `SPARE_USAGE_CONSUME`.

Consume/return fields are Issued Qty (read-only), Consumed Qty, Returned Qty, and Remarks. Consumed plus returned cannot exceed issued; returns restore stock and consumption sets material cost.

```text
REQUESTED → MANAGER_APPROVED → STORE_REVIEW
  → STOCK_AVAILABLE → RESERVED → ISSUED → CONSUMED/RETURNED
  → STOCK_NOT_AVAILABLE → PURCHASE_REQUESTED → PURCHASE_RECEIVED → reserve/issue
```

Main table: `maintenance_spare_usage`; links assignment, stock, part, users performing each action, timestamps, quantities, costs, and reorder reference.

---

<!-- PAGE:19-reorder-and-receipt -->
## 19. Reorder/Purchase Request Create, Edit, and Receipt

**Navigation:** Inventory → Reorders; creation is also available from the spare list or stock-shortage flow.  
**Permissions:** `REORDER_VIEW`, `REORDER_CREATE`, `REORDER_UPDATE`.

| Field | Mapping | Required | Purpose/validation |
|---|---|---:|---|
| Stock/Part/Site | derived from selected stock | System | Links purchase need to exact site inventory. |
| Requested Quantity | `requestedQuantity` → reorder table column | Positive mandatory | Quantity to source. |
| Estimated Unit Cost | `estimatedUnitCost` → matching column | Non-negative | Defaults to stock unit cost. |
| Estimated Total Cost | calculated | Read-only | Quantity × estimated unit cost. |
| Vendor | `vendorId` → vendor FK | Optional | Preferred/selected vendor must be assigned to site. Creation dialog currently defaults through service and does not expose vendor selection. |
| Expected Date | `expectedDate` → matching column | Optional | Planned arrival. |
| Status | `status` → status column | Default/request edit | Current reorder lifecycle; edit dialog exposes service-supported statuses. |
| Remarks | `remarks` | Optional | Purchase justification/context. |

Create: `POST /api/spare-part-reorders`; edit: `PUT /api/spare-part-reorders/{id}`. Receipt dialog captures Received Quantity, Unit Cost, and Remarks and calls `POST /api/spare-part-reorders/{id}/receive-stock`, which posts stock-in and marks the request received.

**Current limitation:** any positive receipt marks the entire reorder `RECEIVED`; partial/multiple receiving is not modeled.

---

<!-- PAGE:20-approval-config-and-decision -->
## 20. Approval Configuration and Approval Decisions

### Approval configuration

**Route:** `/admin/approval-config`  
**Permissions:** `APPROVAL_CONFIG_VIEW`, `APPROVAL_CONFIG_UPDATE`.

| Field | Mapping | Required | Source/use |
|---|---|---:|---|
| Module | `moduleCode` | Read-only in edit | Business module/action owner. Existing rows provide value. |
| Action | `actionCode` | Read-only in edit | Operation requiring approval. |
| Approval Required | `approvalRequired` | Switch | Enables workflow interception. |
| Approver Role | `approverRoleCode` | Conditional | Roles API; recipients must hold role/scope. |
| Minimum Approval Count | `minApprovalCount` | Minimum 1 | Number of approvals needed. |
| Status | `status` | Default active | Active/inactive config. |

GET/POST `/api/admin/approval-config`; PUT row path. The current dialog primarily edits seeded rows; create support exists in service but UI entry begins from a selected row.

### Approve/reject

**Route:** `/approvals/pending`; permissions `APPROVAL_VIEW`, `APPROVAL_APPROVE`, `APPROVAL_REJECT`. Decision form contains Comments; submit uses POST `/api/approvals/{id}/approve` or `/reject`. Approval result invokes the registered business transition. History is read-only/searchable.

---

<!-- PAGE:21-notification-settings -->
## 21. Notification Configuration

**Route:** `/admin/notification-settings`  
**Permissions:** `NOTIFICATION_CONFIG_VIEW`, `NOTIFICATION_CONFIG_UPDATE`.

| Field | Mapping | Required/default | Purpose/validation |
|---|---|---|---|
| Notifications Enabled | `enabled` | Boolean | Global notification switch. |
| In-App Notifications | `inAppEnabled` | Boolean | Enables notification-center messages. |
| Email Notifications | `emailEnabled` | Boolean | Enables email channel; SMTP must be configured. |
| PM Due Reminders | `pmDueReminderEnabled` | Boolean | Sends upcoming-PM alerts. |
| Overdue Request Alerts | `overdueRequestEnabled` | Boolean | Sends overdue request alerts. |
| Approval Pending Alerts | `approvalPendingEnabled` | Boolean | Sends pending approval alerts. |
| PM Reminder Days | `pmReminderDays` | Number | Lead days; non-negative/service validated. |
| Daily Scan Time | `dailyScanTime` | Time | UI configuration value for scan time; deployment cron behavior must be verified when changed. |
| PM Recipient Roles | `pmRecipientRoleCodes[]` | Multi-select | Roles receiving PM reminders. |
| Overdue Recipient Roles | `overdueRecipientRoleCodes[]` | Multi-select | Roles receiving overdue alerts. |
| Approval Fallback Roles | `approvalFallbackRoleCodes[]` | Multi-select | Recipients when configured approver cannot be resolved. |

GET/PUT `/api/admin/notification-settings`. Role options come from role service. Save remains on page and refreshes returned settings. Settings table/entity stores configuration; application properties provide defaults.

---

## 22. Permission Matrix

| Page/workflow | View | Create | Update | Delete | Special actions |
|---|---|---|---|---|---|
| Company | `COMPANY_VIEW` | `COMPANY_CREATE` | `COMPANY_UPDATE` | — | Logo: `COMPANY_UPDATE` |
| Site | `SITE_VIEW` | `SITE_CREATE` | `SITE_UPDATE` | `SITE_DELETE` | Delete marks inactive |
| Employee | `EMPLOYEE_VIEW` | `EMPLOYEE_CREATE` | `EMPLOYEE_UPDATE` | `EMPLOYEE_DELETE` | Login/roles included in save |
| Role | `ROLE_VIEW` | `ROLE_CREATE` | `ROLE_UPDATE` | `ROLE_DELETE` | Catalogue: `PERMISSION_VIEW` |
| User account | `USER_ROLE_VIEW` | `USER_ROLE_ASSIGN` | `USER_ROLE_UPDATE` | — | Role assignment API |
| Vendor | `VENDOR_VIEW` | `VENDOR_CREATE` | `VENDOR_UPDATE` | `VENDOR_DELETE` | Site assignment included |
| AMC | `VENDOR_AMC_VIEW` | `VENDOR_AMC_CREATE` | `VENDOR_AMC_UPDATE` | `VENDOR_AMC_DELETE` | Assign equipment, renew |
| Equipment | `EQUIPMENT_VIEW` | `EQUIPMENT_CREATE` | `EQUIPMENT_UPDATE` | `EQUIPMENT_DELETE` | Documents/BOM mapped to update/delete |
| Request/PM | `REQUEST_VIEW` | `REQUEST_CREATE` | `REQUEST_UPDATE` | `REQUEST_DELETE` | PM calendar `PM_CALENDAR_VIEW` |
| Assignment | `ASSIGNMENT_VIEW` | `ASSIGNMENT_CREATE` | `ASSIGNMENT_UPDATE` | `ASSIGNMENT_DELETE` | Checklist/work-log permissions |
| Downtime | `DOWNTIME_VIEW` | `DOWNTIME_CREATE` | `DOWNTIME_UPDATE` | `DOWNTIME_DELETE` | Confirm, verify, close, reopen, RCA |
| Spare master | `SPARE_PART_VIEW` | `SPARE_PART_CREATE` | `SPARE_PART_UPDATE` | `SPARE_PART_DELETE` | Stock transaction permissions |
| Spare usage | `SPARE_USAGE_VIEW` | `SPARE_USAGE_CREATE` | `SPARE_USAGE_UPDATE` | `SPARE_USAGE_DELETE` | Approve, reserve, issue, consume, return, reject, cancel |
| Reorder | `REORDER_VIEW` | `REORDER_CREATE` | `REORDER_UPDATE` | — | Receipt uses update |
| Approval config | `APPROVAL_CONFIG_VIEW` | `APPROVAL_CONFIG_UPDATE` | `APPROVAL_CONFIG_UPDATE` | — | Decisions use approve/reject |
| Notification config | `NOTIFICATION_CONFIG_VIEW` | — | `NOTIFICATION_CONFIG_UPDATE` | — | — |

## 23. API Dependency Summary

The authoritative row-level matrix is [API Dependency Matrix](api-reference/API-Dependency-Matrix.md). Important patterns:

- Create/edit pages require their write API plus all site/equipment/vendor/employee/role helper GET APIs.
- Backend paths in the permission CSV include `/api`, matching the configured servlet context.
- `JwtFilter`/`ApiPermissionService` owns API permission authorization; services own record/site validation.
- Normal JSON endpoints return `ApiResponse<T>`; binary downloads are protocol exceptions.

## 24. Database Reference Summary

The authoritative page/table matrix is [Database Reference](database-reference/Database-Reference.md). Core tables include:

- `company_master`, `site_master`
- employee, employee-site, user, role, permission, and role-assignment tables
- `vendor_master`, vendor-site assignment, `vendor_amc_contract`, `equipment_amc_mapping`
- `equipment_master`, equipment documents, `equipment_spare_bom`
- `maintenance_request`, `maintenance_assignment`, checklist/work-log and attachment tables
- `equipment_downtime`, downtime history, and RCA action tables
- `preventive_maintenance_schedule` and PM checklist items
- `spare_part_master`, `spare_part_site_stock`, `spare_part_transaction`
- `maintenance_spare_usage`, `spare_part_reorder_request`
- approval configuration/request/history and notification settings tables

## 25. Workflow Linkages

### Equipment maintenance

```text
Site → Equipment → PM Schedule / Maintenance Request
→ Assignment → Checklist + Work Log + Spare Request
→ Downtime / Cost / Equipment History / Reports
```

### Authorization

```text
Employee/Login → Role Assignment → Permission
→ Frontend Route/Button → API Permission Mapping
→ JwtFilter/API Permission Service → Site/record access
```

### Inventory

```text
Spare Master + Site Stock → Assignment Spare Request
→ Manager Approval → Store Check → Reserve → Issue
→ Consume or Return
                └→ shortage → Reorder → Receipt → Reserve/Issue
```

### AMC

```text
Vendor + Site → AMC Contract → Equipment Mapping
→ Active AMC lookup in Request/PM → Vendor context and SLA
→ Renewal preserves expired contract history
```

## 26. Expected Pages Not Currently Implemented

| Expected page | Current finding |
|---|---|
| Team Create/Edit | No team route, form, controller, entity, or Liquibase table found. Department/site-role text is used instead. |
| Equipment Category/Type masters | Category is free text on equipment; no standalone category/type pages. |
| Meter Reading Create/Correction | No route/module/entity/API found. |
| User Profile Update | Navbar displays identity but has no profile edit route. |
| Change Password | Navbar links to `/change-password`, but `App.jsx` has no matching route/page; link falls through wildcard navigation. |
| User Role Assignment editor | `/admin/user-roles` exists but renders only an informational placeholder. APIs exist. |
| Report Configuration | Reports have runtime filters only; no saved report configuration form. |
| Store/Warehouse master | Storage location is free text; no store/bin master. |
| Purchase Order/quotation | Reorder request exists; full procurement workflow does not. |
| Request attachments | Not present on request creation; attachments exist for work logs/checklist/equipment documents. |
| PM runtime/meter trigger | Calendar/date frequency exists; runtime threshold/meter type does not. |

## 27. Inconsistencies and Implementation Issues Found

1. Navbar change-password link has no route/page.
2. User Role Assignment page is a placeholder despite available APIs.
3. Employee role dropdown API access is not clearly mapped under `EMPLOYEE_CREATE/UPDATE` in the CSV; test runtime with restriction enabled.
4. Role form loads the permission catalogue, but `ROLE_CREATE/UPDATE` do not have explicit `GET /api/admin/permissions` helper rows; users may also need `PERMISSION_VIEW`.
5. Notification settings load roles, but notification configuration permissions do not explicitly map role helper APIs.
6. Assignment UI checks proof/attachment-specific permission names (`ASSIGNMENT_CHECKLIST_PROOF_UPLOAD`, etc.) while the CSV maps those APIs under broader checklist/work-log permissions. Button visibility and API authorization can diverge.
7. PM routes reuse maintenance-request permission codes instead of dedicated PM create/update/view permissions.
8. User Management and several dialog pages directly use MUI form fields rather than required common components.
9. Site expected capacity/timezone fields are absent.
10. Equipment expected type/vendor/parent/meter configuration fields are absent.
11. Maintenance request expected failure type and attachments are absent.
12. Reorder receipt marks the full request received after any positive receipt; partial receipts are not modeled.
13. Spare part master and site stock fields share one edit form; editing one site's record can update shared master details.
14. Transfer posts source-out/destination-in immediately; no in-transit/receipt confirmation.
15. API restriction is currently configured `cmms.security.api-permission-restriction-enabled=false`; production should deliberately review this setting.

## 28. Common Validation and Troubleshooting

- A 401 means authentication expired/missing; sign in again.
- A 403 usually means missing permission or site scope; compare route permission and helper API mapping.
- A 400 validation response should show `code`, `message`, `details[]`, and `correlationId`; correct the named field.
- “Unable to load form data” often indicates a blocked helper API, not a save failure.
- Date end values must not precede corresponding start values.
- Quantity/cost fields must be positive or non-negative as described.
- Unique business codes should be stable and should not be recycled.
- Do not enter real passwords in demos, screenshots, tickets, or documents.

## 29. Screenshot Register

Screenshots are stored under `documentation/screenshots/`. Capture status is recorded in [Screenshot Register](screenshots/README.md). Figures must contain sanitized demo data and no tokens/passwords.

## 30. Glossary

| Term | Meaning |
|---|---|
| AMC | Annual Maintenance Contract |
| BOM | Bill of Materials/compatible spare list |
| CMMS | Computerized Maintenance Management System |
| PM | Preventive Maintenance |
| RCA | Root Cause Analysis |
| SLA | Service Level Agreement |
| Site scope | Set of plant sites a user is authorized to access |
| Reservation | Stock quantity committed but not yet issued |

## 31. Verification Checklist

- [x] All routes in `App.jsx` reviewed.
- [x] All standalone create/edit/configuration forms reviewed.
- [x] Embedded checklist, work-log, downtime-RCA, stock, transfer, reorder, approval, issue, consume, return, import, and upload workflows reviewed.
- [x] Frontend fields checked against DTO/entity/service behavior.
- [x] Permission CSV reviewed.
- [x] Missing expected pages identified without inventing them.
- [ ] Authenticated screenshots: dependent on runnable local services/demo authentication; see screenshot register.
- [x] Markdown, Word, and PDF deliverables generated and validated during documentation build.

