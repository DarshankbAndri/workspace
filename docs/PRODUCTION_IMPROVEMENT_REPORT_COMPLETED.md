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


### 14. API response contracts are inconsistent

Current state:

- `GlobalExceptionHandler` returns `ErrorResponse` for most errors.
- Validation returns a custom map.
- `AuthController` defines nested error/success response classes.

Production risk:

- Frontend and integration clients must handle multiple error shapes.
- Support teams cannot reliably trace failures.

Recommended action:

- Define one standard API envelope for success and error responses.
- Include `timestamp`, `status`, `code`, `message`, `details`, `path`, and `correlationId`.
- Use stable machine-readable error codes.
- Update OpenAPI documentation and frontend error handling.

Implementation status:

- Implemented common response classes: `ApiResponse<T>`, `ApiErrorResponse`, `ApiValidationError`, `ApiErrorCode`, and `ResponseFactory`.
- Updated JSON controllers, authentication responses, security 401/403 responses, validation errors, OpenAPI schemas, and frontend Axios error normalization.
- Added correlation ID support through `X-Correlation-Id`, request attributes, MDC, and standard response payloads.
