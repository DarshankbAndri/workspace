# RBAC automation matrix

This records executable checks, not inferred guarantees for every seeded role. API permissions come from api-permission-mapping.csv; record/site ownership remains a separate service check.

| Account/condition | Allowed assertion | Denied assertion | Test |
|---|---|---|---|
| Administrator | Effective roles/permissions and business setup | Anonymous sweep covers missing JWT separately | security/rbac.spec.ts, api/unauthenticated-endpoints.spec.ts |
| Temporary viewer with SITE_VIEW/EQUIPMENT_VIEW | Own-site read | Site create/update/delete, equipment/role/config writes, unmapped path | security/rbac.spec.ts |
| Temporary site-A account | Own equipment/list/search | Site-B equipment/employee/vendor reads, delete, hostile site filter | security/cross-site-security.spec.ts |
| Existing session after role mutation | Read after restoring permission | Read after permission or role removal, including fresh login | auth/account-lifecycle.spec.ts |
| Inactive employee login | Previously valid login | Login and token refresh after disabling | auth/account-lifecycle.spec.ts |
| Technician and other employee at same site | Assigned technician sees own job | Caller cannot impersonate technician through My Assignments search | assignment/my-assignments.spec.ts |
| Temporary approver and ordinary account | Approve/reject eligible request | Ordinary actor cannot approve, final decision cannot repeat | configuration/approval-and-notifications.spec.ts |
| Notification recipient and different account | Own read/archive | Other user's read denied | configuration/approval-and-notifications.spec.ts |
| Site-scoped report viewer | Own equipment cost report | Another site's report/dashboard | report/deterministic-reports.spec.ts |
| UI viewer | Read-only site view | Edit button absent; direct edit route denied | ui/site-navigation.spec.ts |

All temporary account passwords are randomly generated. Teardown disables accounts and roles. Full seeded-role-by-endpoint permutations, multiple approval thresholds and all cross-parent file attacks remain explicit backlog items in AUTOMATION_PLAN.md.
