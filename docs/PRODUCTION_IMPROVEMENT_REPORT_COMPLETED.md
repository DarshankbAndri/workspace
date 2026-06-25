### 3. Site access can fail open when no site assignment exists

Evidence:

- `AccessControlService.getAllowedSiteIds()` returns all site ids when no role/site or employee/site assignments are found.
- `getAllowedSitesFor(user)` has the same fallback behavior.

Production risk:

- A misconfigured non-admin user may see every site.
- This is dangerous in a multi-site deployment because missing configuration becomes full visibility.

Recommended action:

- Fail closed: if a non-admin user has no active assignments, return an empty list.
- Add an explicit role such as `GLOBAL_VIEW` if cross-site access is required.
- Add tests for users with no assignments, inactive assignments, one site, and multiple sites.

Implementation status:

- Implemented fail-closed site access in `AccessControlService`.
- Added explicit `SITE_GLOBAL_ACCESS` permission for non-admin all-site access.
- Updated shared list/search filtering so an empty allowed-site list returns no results instead of skipping the site filter.
- Added focused backend tests for unassigned users, assigned users, admins, and explicit global access.
