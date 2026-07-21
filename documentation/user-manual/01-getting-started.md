> Extracted from [CMMS End-User Manual](../CMMS-End-User-Manual.md). The consolidated manual is the controlled copy.

## 1. Getting Started

The CMMS keeps solar-plant equipment, maintenance work, downtime, vendor coverage, and spares in one controlled system. It helps teams answer: What failed? Who owns the work? Which parts were used? How long was production affected? What PM is due? Is the asset covered by AMC?

### Sign in and navigate

1. Open `http://localhost:6200/login`.
2. Enter the username and password issued by an administrator and select **Login**.
3. The application opens the first page allowed by your permissions, normally **Dashboard**.
4. Expand a sidebar group and select a page. On a phone, use the menu button.
5. Use the site selector where available; it limits data to a permitted solar plant.
6. Use the bell to open notifications. Use the profile menu to change theme or log out.

The standard journey is `Login → module list → record view → permitted action`. A hidden menu or button normally means the role lacks its permission. Records can also be limited by the user's site assignments.

### Main navigation

| Group | Current pages | Typical users |
|---|---|---|
| Dashboard | Role-configured metrics and widgets | All operational users with access |
| Masters | Equipment, Vendors, Vendor AMC | Engineering, managers, vendor coordinator |
| Maintenance | Requests, Assignments, Downtime, Preventive Maintenance, PM Calendar | Maintenance and plant teams |
| Inventory | Spare Parts, Spare Approval, Approved Spare Requests, Reorder Requests | Technician, manager, store |
| Approvals | Pending Approvals, Approval History | Configured approvers |
| Reports | Equipment History, Downtime Analysis, Equipment Cost | Managers and analysts |
| Creation | Sites, Employees | HR and administrators |
| Administration | Roles, Permissions, User Roles, Approval Configuration, Notification Settings, Company | Admin/Super Admin |

### Security and logout

Security follows `User → assigned role → permissions → permitted API`. Page access, action-button access, backend API access, and site access are separate checks. Seeing a page does not guarantee that every action or helper dropdown is permitted. A 403 response means the server denied the requested operation; contact an administrator with the correlation ID shown by the application.

Select the profile menu and **Logout** when finished, especially on a shared workstation. Sessions return to login when authentication expires. **Change Password is Partially Available:** the navbar link exists, but the current router has no functional change-password page. First-login forced password change is not implemented in the inspected UI.

