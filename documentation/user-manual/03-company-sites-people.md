> Extracted from [CMMS End-User Manual](../CMMS-End-User-Manual.md). The consolidated manual is the controlled copy.

## 3. Company, Sites, Employees, Roles, and Users

### Company profile

**Where:** Administration → Company · **Permissions:** `COMPANY_VIEW`, save with `COMPANY_CREATE` or `COMPANY_UPDATE`.

Use this page to maintain company code, name, contact details, address, status, and logo. Enter required code/name, optionally upload a safe image, and select **Save**. The record is refreshed after save; the logo is uploaded after the company record exists. There is no company delete action. Users without save permission see a read-only form.

### Sites

**Where:** Creation → Sites · **Permissions:** `SITE_VIEW`, `SITE_CREATE`, `SITE_UPDATE`, `SITE_DELETE`.

1. Select **Add Site**, enter Site Code and Site Name, then optional organization, type, address, contact, and coordinates.
2. Select **Save**. The site becomes available to equipment, employees, vendors, maintenance, downtime, stock, dashboards, and reports.
3. Open a row to view/edit it. Delete marks a site inactive rather than erasing referenced history.

Capacity and timezone fields are not implemented. Assign users only to the sites they operate; site access controls both dropdowns and records.

### Employees and login access

**Where:** Creation → Employees · **Permissions:** `EMPLOYEE_VIEW`, `EMPLOYEE_CREATE`, `EMPLOYEE_UPDATE`, `EMPLOYEE_DELETE`.

Create identity/contact/employment details, add at least one site assignment, and identify the primary site. To create application access, enable login, provide a unique username and temporary password, and add at least one permission-role assignment. Never send a password through screenshots or tickets. Save returns to the employee list. Common failures are duplicate sites, no primary assignment, password mismatch, or an inaccessible role/site.

**Teams are Not Available:** department/designation and free-text site role exist, but there is no Team master or team-assignment page.

### Roles, permissions, and user roles

**Where:** Administration → Roles / Permissions / User Roles.

- `ROLE_VIEW/CREATE/UPDATE/DELETE` controls role records. Create a code/name, status, and select permission checkboxes. Changes affect users assigned that role; a fresh login may be needed to refresh the UI session.
- `PERMISSION_VIEW` opens the read-only permission catalogue.
- **User Roles is Partially Available:** `USER_ROLE_VIEW` opens an informational placeholder. Backend role-assignment APIs exist, but the editor is not functional.
- **Create User** exists at `/create-user` with `USER_ROLE_ASSIGN`; employee creation is the more complete site/role-aware onboarding path.

Avoid granting create/update/delete simply because view is needed. Example: a technician can receive `EQUIPMENT_VIEW`, `REQUEST_VIEW`, and assignment/work-log permissions, while a store user receives spare and stock-processing permissions.

