> Extracted from the verified master document. See [CMMS Creation Page Documentation](../CMMS-Creation-Page-Documentation.md).

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

