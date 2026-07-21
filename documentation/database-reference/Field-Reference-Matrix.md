# CMMS Field Reference Matrix

| Module/Page | Field | Required/UI | Validation and source | Technical mapping |
|---|---|---|---|---|
| Company Profile Create/Edit | Company Code | Text; mandatory | UI rejects blank; backend DTO is not blank; persisted code is unique. Editable when user can persist. | `companyCode` → `companyCode` → `company_master.company_code` |
| Company Profile Create/Edit | Company Name | Text; mandatory | UI rejects blank; backend not blank. | `companyName` → `companyName` → `company_master.company_name` |
| Company Profile Create/Edit | Email | Email; optional | Browser email control plus backend email validation where configured. | `email` → `email` → `company_master.email` |
| Company Profile Create/Edit | Phone Number | Text; optional | No strict UI pattern; backend length applies. | `phoneNumber` → `phoneNumber` → `company_master.phone_number` |
| Company Profile Create/Edit | Status | Dropdown; optional | Static options `ACTIVE`, `INACTIVE`; defaults to `ACTIVE`. | `status` → `status` → `company_master.status` |
| Company Profile Create/Edit | Address | Text area; optional | Free text. | `address` → `address` → `company_master.address` |
| Company Profile Create/Edit | Upload Logo | File; optional | Sent after company save to `/api/company/upload-logo`; file rules come from backend multipart/allowed-content implementation. Existing preview remains until replaced. | multipart `file` → stored logo metadata/path |
| Site Create/Edit/View | Site Code | Text; mandatory | Required; backend uniqueness/length applies. Editable on edit. | `siteCode` → `siteCode` → `site_master.site_code` |
| Site Create/Edit/View | Site Name | Text; mandatory | Required. | `siteName` → `siteName` → `site_master.site_name` |
| Site Create/Edit/View | Organization Name | Text; optional | Free text. No Company dropdown exists here. | `organizationName` → same → `organization_name` |
| Site Create/Edit/View | Site Type | Text; optional | Free text, not an enum/dropdown. | `siteType` → same → `site_type` |
| Site Create/Edit/View | Status | Dropdown; optional | Static `ACTIVE`/`INACTIVE`; default active. Delete action marks inactive. | `status` → same → `status` |
| Site Create/Edit/View | Address Line 1/2 | Text; optional | Free text. | `addressLine1`, `addressLine2` → same → corresponding columns |
| Site Create/Edit/View | City/State/Country/Pincode | Text; optional | No dedicated country/state dropdown or pincode regex in UI. | matching properties → matching columns |
| Site Create/Edit/View | Contact Person | Text; optional | Free text. | `contactPerson` → same → `contact_person` |
| Site Create/Edit/View | Contact Mobile | Text; optional | No strict UI phone pattern. | `contactMobile` → same → `contact_mobile` |
| Site Create/Edit/View | Contact Email | Email; optional | Browser email control/backend validation. | `contactEmail` → same → `contact_email` |
| Site Create/Edit/View | Latitude/Longitude | Number; optional | Numeric UI; current page does not enforce geographic ranges. | `latitude`, `longitude` → same → matching columns |
| Employee, Login, Site, and Role Assignment Create/Edit | Employee Code | Text; mandatory | UI required; backend unique/length rules. | `employeeCode` → same → `employee_master.employee_code` |
| Employee, Login, Site, and Role Assignment Create/Edit | First Name | Text; UI mandatory | Required in UI/backend. | `firstName` → same → `first_name` |
| Employee, Login, Site, and Role Assignment Create/Edit | Last Name | Text; optional | Optional. | `lastName` → same → `last_name` |
| Employee, Login, Site, and Role Assignment Create/Edit | Mobile Number | Text; mandatory | UI rejects blank; backend rules apply. | `mobileNumber` → same → `mobile_number` |
| Employee, Login, Site, and Role Assignment Create/Edit | Email | Email; optional | Email format where present; uniqueness may be enforced for linked users. | `email` → same → `email` |
| Employee, Login, Site, and Role Assignment Create/Edit | Gender | Dropdown; optional | Static options. | `gender` → same → `gender` |
| Employee, Login, Site, and Role Assignment Create/Edit | Date of Birth | Date; optional | Date input; no age rule visible in UI. | `dateOfBirth` → same → `date_of_birth` |
| Employee, Login, Site, and Role Assignment Create/Edit | Date of Joining | Date; optional | Date input. | `dateOfJoining` → same → `date_of_joining` |
| Employee, Login, Site, and Role Assignment Create/Edit | Designation | Text; optional | Free text. | `designation` → same → `designation` |
| Employee, Login, Site, and Role Assignment Create/Edit | Department | Text; optional | Free text; no Team master exists. | `department` → same → `department` |
| Employee, Login, Site, and Role Assignment Create/Edit | Status | Dropdown; optional | Static active/inactive; default active. | `status` → same → `status` |
| Employee, Login, Site, and Role Assignment Create/Edit | Enable Login | Switch; optional | When false, login fields are disabled. | `loginEnabled` |
| Employee, Login, Site, and Role Assignment Create/Edit | Username | Text; conditional | Required when login enabled; uniqueness enforced by user service/database. | `username` → linked user username |
| Employee, Login, Site, and Role Assignment Create/Edit | Auth Role | Dropdown; conditional | Static authentication role option; not a substitute for permission-role assignments. | `authRole` → linked user base role |
| Employee, Login, Site, and Role Assignment Create/Edit | Account Status | Dropdown; conditional | Active/inactive options. | `accountStatus` → linked user status |
| Employee, Login, Site, and Role Assignment Create/Edit | Reset Password | Checkbox; edit only | Not persisted as a database field. | local UI flag |
| Employee, Login, Site, and Role Assignment Create/Edit | Password / Confirm Password | Password; conditional | Required for new login; values must match; never documented/screenshot with real secrets and never returned. | `password`, `confirmPassword` |
| Employee, Login, Site, and Role Assignment Create/Edit | Site | Yes | `GET /api/hr/sites`; only accessible/non-inactive sites should be offered. | `siteAssignments[].siteId` → `employee_site_assignment.site_id` |
| Employee, Login, Site, and Role Assignment Create/Edit | Role Name | Yes | Free text describing operational responsibility at that site. | `siteAssignments[].roleName` → `role_name` |
| Employee, Login, Site, and Role Assignment Create/Edit | Primary Site | One primary expected | Checkbox; selecting one clears other primary flags. | `primarySite` → `primary_site` |
| Employee, Login, Site, and Role Assignment Create/Edit | Effective From/To | Optional | Validity period for the site assignment. | matching properties → matching columns |
| Employee, Login, Site, and Role Assignment Create/Edit | Status | Optional | Active/inactive static dropdown. | assignment `status` |
| Employee, Login, Site, and Role Assignment Create/Edit | Scope | Conditional | Global or site-specific authorization scope. | `scopeType`/`siteId` |
| Employee, Login, Site, and Role Assignment Create/Edit | Role | Required when login enabled | Loaded from role service; selects permissions applied to the account. | `roleId` |
| Employee, Login, Site, and Role Assignment Create/Edit | Status | Optional | Active/inactive role assignment. | `status` |
| Role Create/Edit and Permission Assignment | Role Code | Text; mandatory | Required; normalized/unique by backend. Changing a used code can affect configuration references. | `roleCode` → same → role table `role_code` |
| Role Create/Edit and Permission Assignment | Role Name | Text; mandatory | Required. | `roleName` → same → `role_name` |
| Role Create/Edit and Permission Assignment | Description | Text; optional | Free text. | `description` → same → `description` |
| Role Create/Edit and Permission Assignment | Status | Dropdown; mandatory | Static `ACTIVE`/`INACTIVE`. | `status` → same → `status` |
| Role Create/Edit and Permission Assignment | Permissions | Grouped checkboxes; optional | Loaded from `GET /api/admin/permissions`; searchable and grouped. Existing selections load from role detail. | `permissionIds[]` → role-permission join table |
| Standalone User Account Creation | Username | Text; mandatory | UI rejects blank; backend uniqueness. | `username` |
| Standalone User Account Creation | Email | Email; mandatory | UI required/email control; backend email/uniqueness. | `email` |
| Standalone User Account Creation | First Name | Text; mandatory | UI required. | `firstName` |
| Standalone User Account Creation | Last Name | Text; mandatory | UI required. | `lastName` |
| Standalone User Account Creation | Department | Text; mandatory | UI required. | `department` |
| Standalone User Account Creation | Role | Dropdown; mandatory | Static page options; default must be reviewed against backend accepted values. | `role` |
| Standalone User Account Creation | Manager ID | Number; optional | No dropdown; incorrect IDs may fail backend validation. | `managerId` |
| Vendor Create/Edit and Site Assignment | Vendor Code | Text; mandatory | Required and unique. | `vendorCode` → same → `vendor_master.vendor_code` |
| Vendor Create/Edit and Site Assignment | Vendor Name | Text; mandatory | Required. | `vendorName` → same → `vendor_name` |
| Vendor Create/Edit and Site Assignment | Contact Person | Text; optional | Free text. | `contactPerson` → same → `contact_person` |
| Vendor Create/Edit and Site Assignment | Email | Email; optional | Email format. | `email` → same → `email` |
| Vendor Create/Edit and Site Assignment | Phone | Text; optional | Backend length/no strict UI pattern. | `phone` → same → `phone` |
| Vendor Create/Edit and Site Assignment | Service Category | Text; optional | Free text, not a managed services list. | `serviceCategory` → same → `service_category` |
| Vendor Create/Edit and Site Assignment | Active Vendor | Switch; optional | Boolean default from form/entity. | `active` → same → active/status column |
| Vendor Create/Edit and Site Assignment | Address | Text area; optional | Free text. | `address` → same → `address` |
| Vendor Create/Edit and Site Assignment | Assigned Site | Dropdown; mandatory per row | `GET /api/hr/sites`; duplicate/site-access validation. | `siteAssignments[].siteId` → vendor-site table |
| Vendor Create/Edit and Site Assignment | Assignment Status | Dropdown; optional | Static active/inactive. | row `status` |
| Vendor AMC Contract Create/Edit and Equipment Mapping | Site | Dropdown; mandatory | `GET /api/hr/sites`; locked on edit; filters vendors/equipment. | `siteId` → same → `vendor_amc_contract.site_id` |
| Vendor AMC Contract Create/Edit and Equipment Mapping | Vendor | Dropdown; mandatory | `GET /api/vendors`, filtered to selected site assignments. | `vendorId` → same → `vendor_id` |
| Vendor AMC Contract Create/Edit and Equipment Mapping | Contract Number | Text; mandatory | Required, unique. | `contractNumber` → same → `contract_number` |
| Vendor AMC Contract Create/Edit and Equipment Mapping | Contract Name | Text; mandatory | Required. | `contractName` → same → `contract_name` |
| Vendor AMC Contract Create/Edit and Equipment Mapping | Contract Type | Dropdown; optional | Static options from page constants. | `contractType` → same → `contract_type` |
| Vendor AMC Contract Create/Edit and Equipment Mapping | Start/End Date | Dates; mandatory | End must not precede start; coverage mappings must fit contract dates. | matching properties → matching columns |
| Vendor AMC Contract Create/Edit and Equipment Mapping | Status | Dropdown; optional | Enum/static options; lifecycle rules enforced by service. | `status` → same → `status` |
| Vendor AMC Contract Create/Edit and Equipment Mapping | Contract Value | Number; optional | Non-negative money. | `contractValue` → same → `contract_value` |
| Vendor AMC Contract Create/Edit and Equipment Mapping | Response Time | Number; optional | Non-negative. | `responseTimeHours` → same → `response_time_hours` |
| Vendor AMC Contract Create/Edit and Equipment Mapping | Resolution Time | Number; optional | Non-negative. | `resolutionTimeHours` → same → `resolution_time_hours` |
| Vendor AMC Contract Create/Edit and Equipment Mapping | Labor/Spares Included | Yes/No dropdowns | Boolean. | `includesLabor`, `includesSpares` → matching columns |
| Vendor AMC Contract Create/Edit and Equipment Mapping | Contact Person/Phone/Email | Inputs; optional | Email control for email. | matching properties/columns |
| Vendor AMC Contract Create/Edit and Equipment Mapping | Covered Equipment | Multi-select; optional | Equipment loaded by API and filtered to selected site; overlapping active coverage is blocked. | `equipmentIds[]` → `equipment_amc_mapping` |
| Vendor AMC Contract Create/Edit and Equipment Mapping | Coverage Description | Text area; optional | Free text. | `coverageDescription` → same column |
| Vendor AMC Contract Create/Edit and Equipment Mapping | Remarks | Text area; optional | Free text. | `remarks` → same column |
| Equipment Create/Edit | Equipment Code | Text; mandatory | Required/unique; service trims/validates. | `equipmentCode` → same → `equipment_master.equipment_code` |
| Equipment Create/Edit | Equipment Name | Text; mandatory | Required. | `equipmentName` → same → `equipment_name` |
| Equipment Create/Edit | Site | Dropdown; mandatory | `GET /api/hr/sites`; only active/accessible values. | `siteId` → same → `site_id` |
| Equipment Create/Edit | Category | Text; mandatory | Required free text; no category master page exists. | `category` → same → `category` |
| Equipment Create/Edit | Location | Text; optional | Free text. | `location` → same → `location` |
| Equipment Create/Edit | Manufacturer | Text; optional | Free text. | `manufacturer` → same → `manufacturer` |
| Equipment Create/Edit | Model Number | Text; optional | Free text. | `modelNumber` → same → `model_number` |
| Equipment Create/Edit | Serial Number | Text; optional | Backend uniqueness if configured; optional UI. | `serialNumber` → same → `serial_number` |
| Equipment Create/Edit | Status | Dropdown | `ACTIVE`, `INACTIVE`, `UNDER_MAINTENANCE`, `RETIRED`. | `status` → same → `status` |
| Equipment Create/Edit | Lifecycle Status | Dropdown | `DRAFT`, `COMMISSIONED`, `ACTIVE`, `STANDBY`, `UNDER_MAINTENANCE`, `BREAKDOWN`, `DECOMMISSIONED`, `SCRAPPED`. | `lifecycleStatus` → same → `lifecycle_status` |
| Equipment Create/Edit | Operating Status | Dropdown | `RUNNING`, `STANDBY`, `STOPPED`, `UNDER_MAINTENANCE`, `BREAKDOWN`. | `operatingStatus` → same → `operating_status` |
| Equipment Create/Edit | Asset Condition | Dropdown | `GOOD`, `FAIR`, `POOR`, `CRITICAL`, `UNKNOWN`. | `assetCondition` → same → `asset_condition` |
| Equipment Create/Edit | Ownership Type | Dropdown | `OWNED`, `LEASED`, `RENTED`, `CUSTOMER_SUPPLIED`. | `ownershipType` → same → `ownership_type` |
| Equipment Create/Edit | Installation/Commissioning Date | Dates; optional | Service validates lifecycle chronology. | matching properties/columns |
| Equipment Create/Edit | Warranty Expiry | Date; optional | Date validation relative to installation where implemented. | `warrantyExpiryDate` → same → `warranty_expiry_date` |
| Equipment Create/Edit | Decommission Date | Date; optional | Must align with lifecycle dates/status rules. | `decommissionDate` → same → `decommission_date` |
| Equipment Create/Edit | Criticality | Dropdown | Static low/medium/high/critical; default medium. | `criticality` → same → `criticality` |
| Equipment Create/Edit | Asset Number | Text; optional | Free text. | `assetNumber` → same → `asset_number` |
| Equipment Create/Edit | Purchase Date/Cost | Date/number; optional | Cost non-negative; chronology validated. | matching properties → matching columns |
| Equipment Create/Edit | Capitalization Date | Date; optional | Finance-date validation. | `capitalizationDate` → same column |
| Equipment Create/Edit | Depreciation Method | Dropdown; optional | Static options; clearable. | `depreciationMethod` → same column |
| Equipment Create/Edit | Cost Center | Text; optional | Used in cost grouping/report. | `costCenter` → same column |
| Equipment Create/Edit | Department | Text; optional | Used in ownership/cost reporting. | `department` → same column |
| Maintenance Request Create/Edit | Site | Dropdown; mandatory | `GET /api/hr/sites`; filters equipment. | `siteId` → same → `maintenance_request.site_id` |
| Maintenance Request Create/Edit | Equipment | Dropdown; mandatory | `GET /api/equipment`; filtered by selected site. Changing it rechecks AMC. | `equipmentId` → same → `equipment_id` |
| Maintenance Request Create/Edit | AMC information | Information | `GET /api/equipment/{id}/active-amc`. | read-only from active AMC |
| Maintenance Request Create/Edit | Assign to AMC Vendor | Yes/No; conditional | Shown only with active AMC; populates vendor/contract. | `externalVendorAssignment` |
| Maintenance Request Create/Edit | AMC Vendor | Read-only | Derived from active contract. | derived `vendorId` |
| Maintenance Request Create/Edit | Vendor Reference Number | Text; conditional | Shown only with AMC. | `vendorReferenceNumber` → same column |
| Maintenance Request Create/Edit | Title | Text; mandatory | Required. | `title` → same → `title` |
| Maintenance Request Create/Edit | Reported By | Text; optional | Free text, not current-user dropdown. | `reportedBy` → same → `reported_by` |
| Maintenance Request Create/Edit | Type | Dropdown | Defaults `BREAKDOWN`. | `requestType` → same → `request_type` |
| Maintenance Request Create/Edit | Priority | Dropdown | Defaults medium. | `priority` → same → `priority` |
| Maintenance Request Create/Edit | Requested Date | Date; optional | Defaults today. | `requestedDate` → same → `requested_date` |
| Maintenance Request Create/Edit | Target Completion | Date; optional | Should not precede request date; backend validation is authoritative. | `targetCompletionDate` → same column |
| Maintenance Request Create/Edit | Description | Text area; mandatory | Required. | `description` → same → `description` |
| Maintenance Assignment Create/Edit | Site | Dropdown; mandatory | `GET /api/hr/sites`; site access enforced. | `siteId` (derived through request) |
| Maintenance Assignment Create/Edit | Request | Dropdown; mandatory | Maintenance request API, filtered by site. | `requestId` → same → `maintenance_assignment.request_id` |
| Maintenance Assignment Create/Edit | Vendor | Dropdown; optional | Vendors filtered by site. | `vendorId` → same → `vendor_id` |
| Maintenance Assignment Create/Edit | Assigned Technician | Dropdown; optional | Employee search filtered to selected site/active records. | `assignedEmployeeId` → same → `assigned_employee_id` |
| Maintenance Assignment Create/Edit | Assigned To | Text; mandatory | Required. | `assignedTo` → same → `assigned_to` |
| Maintenance Assignment Create/Edit | Assigned Date | Date; optional | Backend fills today if omitted. | `assignedDate` → same → `assigned_date` |
| Maintenance Assignment Create/Edit | Planned Start/End | Dates; optional | End must not precede start. | matching properties/columns |
| Maintenance Assignment Create/Edit | Status | Dropdown | Actual allowed statuses come from page/service rules. | `status` → same → `status` |
| Maintenance Assignment Create/Edit | Actual Start/End | Dates; optional | End must not precede start. | matching properties/columns |
| Maintenance Assignment Create/Edit | Estimated Cost | Number; optional | Non-negative. | `estimatedCost` → same → `estimated_cost` |
| Maintenance Assignment Create/Edit | Service/Vendor Cost | Number; optional | Non-negative. | `actualCost` → same → `actual_cost` |
| Maintenance Assignment Create/Edit | Material Cost | Read-only | Not editable. | calculated from spare usage |
| Maintenance Assignment Create/Edit | Total Actual Cost | Read-only | Calculated UI value. | service + material |
| Maintenance Assignment Create/Edit | Remarks | Text area; optional | Free text. | `remarks` → same → `remarks` |
| Assignment Checklist Add/Edit/Proof Upload | Task | Required for meaningful row | Work step, e.g. `Inspect DC terminal torque`. | `taskTitle` → checklist entity `task_title` |
| Assignment Checklist Add/Edit/Proof Upload | Instructions | No | Execution guidance. | `instructions` → `instructions` |
| Assignment Checklist Add/Edit/Proof Upload | Response Type | Default checkbox | `CHECKBOX`, `TEXT`, `NUMBER`, `PHOTO`. | `responseType` → `response_type` |
| Assignment Checklist Add/Edit/Proof Upload | Required | Boolean | Required steps can block assignment completion. | `required` → `required` |
| Assignment Checklist Add/Edit/Proof Upload | Proof Required | Boolean | Requires file before completion when configuration enables it. | `proofRequired` → `proof_required` |
| Assignment Checklist Add/Edit/Proof Upload | Status | Yes during execution | `PENDING`, `COMPLETED`, `NOT_APPLICABLE`. | row `status` |
| Assignment Checklist Add/Edit/Proof Upload | Reading/Response | Conditional | Numeric/text/check response. | `responseValue` → `response_value` |
| Assignment Checklist Add/Edit/Proof Upload | Remarks | No | Technician evidence/context. | `remarks` → `remarks` |
| Assignment Checklist Add/Edit/Proof Upload | Proof File | Conditional | Photo/PDF evidence; content type and 10 MB configured maximum. | multipart file → checklist proof table |
| Technician Work Log Create/Edit and Attachment Upload | Technician | Dropdown; mandatory | Active employees from assignment site. | `technicianEmployeeId` → `technician_employee_id` |
| Technician Work Log Create/Edit and Attachment Upload | Start Time | Date-time; mandatory | Required. | `startTime` → `start_time` |
| Technician Work Log Create/Edit and Attachment Upload | End Time | Date-time; optional | Must not precede start. | `endTime` → `end_time` |
| Technician Work Log Create/Edit and Attachment Upload | Status | Dropdown | Defaults in progress. | `completionStatus` → `completion_status` |
| Technician Work Log Create/Edit and Attachment Upload | Work Notes | Text; optional | Free text. | `workNotes` → `work_notes` |
| Technician Work Log Create/Edit and Attachment Upload | Issue Found | Text; optional | Free text. | `issueFound` → `issue_found` |
| Technician Work Log Create/Edit and Attachment Upload | Action Taken | Text; optional | Free text. | `actionTaken` → `action_taken` |
| Technician Work Log Create/Edit and Attachment Upload | Attachment | Optional | Backend file limits/content validation. | multipart file → work-log attachment table |
| Equipment Downtime Create/Edit | Site | Dropdown; mandatory | Site API; filters equipment. | `siteId` → same → `equipment_downtime.site_id` |
| Equipment Downtime Create/Edit | Equipment | Dropdown; mandatory | Equipment filtered by site. | `equipmentId` → same → `equipment_id` |
| Equipment Downtime Create/Edit | Maintenance Request | Dropdown; optional | Requests filtered by site/equipment. | `requestId` → same → `request_id` |
| Equipment Downtime Create/Edit | Downtime Type | Dropdown | Boolean options. | `planned` → same → `planned` |
| Equipment Downtime Create/Edit | Reason Category | Dropdown; optional | Static service-approved categories. | `reasonCategory` → same → `reason_category` |
| Equipment Downtime Create/Edit | Reason Code | Text; optional | Free text. | `reasonCode` → same → `reason_code` |
| Equipment Downtime Create/Edit | Reason | Text; mandatory | Required. | `reason` → same → `reason` |
| Equipment Downtime Create/Edit | Start/End Time | Date-time; start mandatory | End must be after start; overlapping records are rejected. | `downtimeStart`, `downtimeEnd` → matching columns |
| Equipment Downtime Create/Edit | Production Line/Shift/Operator | Text; optional | Free text. | matching properties/columns |
| Equipment Downtime Create/Edit | Expected Output / Hour | Number; optional | Non-negative. | `expectedOutputPerHour` → same column |
| Equipment Downtime Create/Edit | Loss Rate / Unit | Number; optional | Non-negative. | `lossRatePerUnit` → same column |
| Equipment Downtime Create/Edit | Lost Quantity/Minutes/Hours/Lost Amount | Read-only | Derived from interval/rates. | calculated entity/UI values |
| Equipment Downtime Create/Edit | Root Cause | Text area; optional initially | Required before closing major downtime. | `rootCause` → same → `root_cause` |
| Equipment Downtime Create/Edit | Remarks | Text area; optional | Free text. | `remarks` → same → `remarks` |
| Downtime RCA Action Add/Edit | Action Type | No/default | Corrective/preventive action classification from static options. | `actionType` → RCA action column |
| Downtime RCA Action Add/Edit | Target Date | Optional | Due date for RCA action. | `targetDate` → target date column |
| Downtime RCA Action Add/Edit | Status | Default | RCA action progress from static options. | `status` → status column |
| Downtime RCA Action Add/Edit | Action Description | Mandatory | Specific corrective/preventive action. | `description` → description column |
| Preventive Maintenance Schedule and Checklist Create/Edit | Site | Dropdown; mandatory | Site API; filters equipment/vendors. | `siteId` → same → PM table `site_id` |
| Preventive Maintenance Schedule and Checklist Create/Edit | Equipment | Dropdown; mandatory | Equipment filtered by site. | `equipmentId` → same → `equipment_id` |
| Preventive Maintenance Schedule and Checklist Create/Edit | AMC Coverage | Dropdown; optional | Active AMC API; disabled if none; dates must be covered. | `amcContractId` → same → `amc_contract_id` |
| Preventive Maintenance Schedule and Checklist Create/Edit | Assigned Vendor | Dropdown; optional | Vendors assigned to site. | `vendorId` → same → `vendor_id` |
| Preventive Maintenance Schedule and Checklist Create/Edit | Assigned To | Text; optional | Free text. | `assignedTo` → same → `assigned_to` |
| Preventive Maintenance Schedule and Checklist Create/Edit | PM Task | Text; mandatory | Required. | `title` → same → `title` |
| Preventive Maintenance Schedule and Checklist Create/Edit | Frequency | Dropdown; mandatory | Static supported frequencies; default monthly. | `frequency` → same → `frequency` |
| Preventive Maintenance Schedule and Checklist Create/Edit | Priority | Dropdown | Default medium. | `priority` → same → `priority` |
| Preventive Maintenance Schedule and Checklist Create/Edit | Status | Dropdown | Boolean active/inactive options. | UI `active` → entity `active` |
| Preventive Maintenance Schedule and Checklist Create/Edit | Approval Status | Dropdown | Creation/update can become pending approval according to configuration. | `status` → same → `status` |
| Preventive Maintenance Schedule and Checklist Create/Edit | Start/End/Next Due Date | Dates; start/next mandatory | Next due cannot precede start or exceed end; end cannot precede start. | matching properties/columns |
| Preventive Maintenance Schedule and Checklist Create/Edit | Description | Text area; mandatory | Required. | `description` → same → `description` |
| Spare Part/Site Stock Create/Edit and Equipment BOM Link | Part Code | Text; mandatory | Required/unique; locked on edit. | `partCode` → same → `spare_part_master.part_code` |
| Spare Part/Site Stock Create/Edit and Equipment BOM Link | Part Name | Text; mandatory | Required; shared master value across sites. | `partName` → same → `part_name` |
| Spare Part/Site Stock Create/Edit and Equipment BOM Link | Unit | Text; mandatory | Required free text. | `unit` → same → `unit` |
| Spare Part/Site Stock Create/Edit and Equipment BOM Link | Category | Text; optional | No category master. | `category` → same → `category` |
| Spare Part/Site Stock Create/Edit and Equipment BOM Link | Site | Dropdown; mandatory | Site API; locked on edit. | `siteId` → same → `spare_part_site_stock.site_id` |
| Spare Part/Site Stock Create/Edit and Equipment BOM Link | Preferred Vendor | Dropdown; optional | Vendors filtered to selected site. | `preferredVendorId` → same → master vendor FK |
| Spare Part/Site Stock Create/Edit and Equipment BOM Link | Opening Stock | Number; create only | Non-negative; creates `OPENING_BALANCE` transaction; locked on edit. | `currentStock` → same → `current_stock` |
| Spare Part/Site Stock Create/Edit and Equipment BOM Link | Minimum Stock | Number; optional | Non-negative. | `minimumStock` → same → `minimum_stock` |
| Spare Part/Site Stock Create/Edit and Equipment BOM Link | Unit Cost | Number; optional | Non-negative. | `unitCost` → same → `unit_cost` |
| Spare Part/Site Stock Create/Edit and Equipment BOM Link | Status | Dropdown | Active/inactive. | `status` → stock status |
| Spare Part/Site Stock Create/Edit and Equipment BOM Link | Storage Location | Text; optional | Free text. | `storageLocation` → same column |
| Spare Part/Site Stock Create/Edit and Equipment BOM Link | Description | Text area; optional | Free text. | `description` → master description |
| Stock In, Adjustment, Transfer, and Import | Quantity to Add / New Stock Quantity | Yes | Stock-in must be positive; adjustment is a non-negative target balance and cannot be below reserved stock. | `quantity` |
| Stock In, Adjustment, Transfer, and Import | Unit Cost | Optional | Defaults to current cost; non-negative. Stock-in currently replaces current site cost. | `unitCost` |
| Stock In, Adjustment, Transfer, and Import | Remarks | Optional | Audit explanation. Strongly recommended for adjustment. | `remarks` |
| Stock In, Adjustment, Transfer, and Import | Target Site | Yes | Site API; excludes source; user needs access to both sites. | `targetSiteId` |
| Stock In, Adjustment, Transfer, and Import | Quantity | Yes | Positive and cannot exceed available (`current-reserved`). | `quantity` |
| Stock In, Adjustment, Transfer, and Import | Target Storage Location | Optional | Creates/updates destination location. | `targetStorageLocation` |
| Stock In, Adjustment, Transfer, and Import | Remarks | Optional | Transfer audit note. | `remarks` |
| Spare Request, Approval, Store Fulfilment, Consumption, and Return | Spare Part | Yes by backend | Site stock API, filtered to assignment site; equipment BOM recommendations may be loaded. | `stockId` → site stock FK |
| Spare Request, Approval, Store Fulfilment, Consumption, and Return | Quantity / Requested Quantity | Positive | Requested amount. One part/site-stock row per assignment due to unique constraint. | `quantityUsed` |
| Spare Request, Approval, Store Fulfilment, Consumption, and Return | Remarks | Optional | Need/reason/instructions. | `remarks` |
| Reorder/Purchase Request Create, Edit, and Receipt | Stock/Part/Site | System | Links purchase need to exact site inventory. | derived from selected stock |
| Reorder/Purchase Request Create, Edit, and Receipt | Requested Quantity | Positive mandatory | Quantity to source. | `requestedQuantity` → reorder table column |
| Reorder/Purchase Request Create, Edit, and Receipt | Estimated Unit Cost | Non-negative | Defaults to stock unit cost. | `estimatedUnitCost` → matching column |
| Reorder/Purchase Request Create, Edit, and Receipt | Estimated Total Cost | Read-only | Quantity × estimated unit cost. | calculated |
| Reorder/Purchase Request Create, Edit, and Receipt | Vendor | Optional | Preferred/selected vendor must be assigned to site. Creation dialog currently defaults through service and does not expose vendor selection. | `vendorId` → vendor FK |
| Reorder/Purchase Request Create, Edit, and Receipt | Expected Date | Optional | Planned arrival. | `expectedDate` → matching column |
| Reorder/Purchase Request Create, Edit, and Receipt | Status | Default/request edit | Current reorder lifecycle; edit dialog exposes service-supported statuses. | `status` → status column |
| Reorder/Purchase Request Create, Edit, and Receipt | Remarks | Optional | Purchase justification/context. | `remarks` |
| Approval Configuration and Approval Decisions | Module | Read-only in edit | Business module/action owner. Existing rows provide value. | `moduleCode` |
| Approval Configuration and Approval Decisions | Action | Read-only in edit | Operation requiring approval. | `actionCode` |
| Approval Configuration and Approval Decisions | Approval Required | Switch | Enables workflow interception. | `approvalRequired` |
| Approval Configuration and Approval Decisions | Approver Role | Conditional | Roles API; recipients must hold role/scope. | `approverRoleCode` |
| Approval Configuration and Approval Decisions | Minimum Approval Count | Minimum 1 | Number of approvals needed. | `minApprovalCount` |
| Approval Configuration and Approval Decisions | Status | Default active | Active/inactive config. | `status` |
| Notification Configuration | Notifications Enabled | Boolean | Global notification switch. | `enabled` |
| Notification Configuration | In-App Notifications | Boolean | Enables notification-center messages. | `inAppEnabled` |
| Notification Configuration | Email Notifications | Boolean | Enables email channel; SMTP must be configured. | `emailEnabled` |
| Notification Configuration | PM Due Reminders | Boolean | Sends upcoming-PM alerts. | `pmDueReminderEnabled` |
| Notification Configuration | Overdue Request Alerts | Boolean | Sends overdue request alerts. | `overdueRequestEnabled` |
| Notification Configuration | Approval Pending Alerts | Boolean | Sends pending approval alerts. | `approvalPendingEnabled` |
| Notification Configuration | PM Reminder Days | Number | Lead days; non-negative/service validated. | `pmReminderDays` |
| Notification Configuration | Daily Scan Time | Time | UI configuration value for scan time; deployment cron behavior must be verified when changed. | `dailyScanTime` |
| Notification Configuration | PM Recipient Roles | Multi-select | Roles receiving PM reminders. | `pmRecipientRoleCodes[]` |
| Notification Configuration | Overdue Recipient Roles | Multi-select | Roles receiving overdue alerts. | `overdueRecipientRoleCodes[]` |
| Notification Configuration | Approval Fallback Roles | Multi-select | Recipients when configured approver cannot be resolved. | `approvalFallbackRoleCodes[]` |
