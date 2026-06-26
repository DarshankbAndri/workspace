# CMMS Production Improvement Report

Date: 2026-06-25

## Scope

This review covers the current CMMS backend, frontend, database migrations, authentication flow, module structure, build setup, and existing documentation.

Reviewed areas:

- Backend Spring Boot application in `cmms_back_end`.
- React/Vite frontend in `cmms_front_end`.
- Liquibase changelog structure under `cmms_back_end/src/main/resources/db/changelog`.
- Authentication and authorization flow through JWT, `AuthContext`, `SecurityConfig`, and `AccessControlService`.
- Existing docs, feature services, routes, and production configuration.

Verification performed:

- Graphify project graph queries for architecture, auth, database, React routes, and module patterns.
- Backend command: `mvn test`
  - Result: build success.
  - Important note: Maven reported "No sources to compile" for test sources, so the pass does not prove behavior.
- Frontend command: `npm run build`
  - Result: build success.
  - Important note: generated bundle `dist/assets/index-DMSwBc2F.js` is 1,492.43 kB minified and 420.06 kB gzip, triggering a chunk-size warning.

## Current Architecture Snapshot

The application is a CMMS built as a Spring Boot API and React frontend.

Backend modules currently include:

- `admin`
- `approval`
- `assignment`
- `common`
- `company`
- `dashboard`
- `downtime`
- `employee`
- `equipment`
- `maintenancerequest`
- `notification`
- `preventivemaintenance`
- `report`
- `site`
- `spareparts`
- `user`
- `vendor`

Backend pattern:

- Module-based packages under `com.example.cmmsApplication`.
- Common pattern is controller -> service -> DAO/repository -> entity/DTO.
- Shared security lives under `common/security`.
- Shared search lives under `common/search`.
- Liquibase controls schema creation and indexes.
- `AccessControlService` centralizes permissions and site access.

Frontend pattern:

- Feature folders under `src/features`.
- Shared layouts/components/services under `src/shared`.
- `App.jsx` defines protected routes.
- `AuthContext.jsx` stores user, token, roles, permissions, and allowed sites.
- `shared/services/api.js` owns the shared axios client and token interceptor.

Important strengths to preserve:

- Module-based structure is already in place.
- Service layer mostly performs permission and site checks.
- Liquibase has one-file-per-table style for most tables.
- Search/list endpoints have pagination caps and field allowlists.
- Spare-part stock operations use transactional locking through `findByIdForUpdate`.
- Frontend route protection and menu visibility use permission codes.
- `mvn test` and `npm run build` currently complete successfully.

## Release Blockers

These items should be fixed before any real production go-live.

### 1. Secrets and environment config are committed in application properties

Evidence:

- `cmms_back_end/src/main/resources/application.properties` contains a concrete database host, username, password, and JWT secret.
- `spring.datasource.password=postgres`
- `app.jwt.secret=...`
- `logging.level.org.springframework.security=DEBUG`
- `cmms.security.api-permission-restriction-enabled=false`
- The login page displays default password guidance.
- `data.sql` seeds demo users with a known default password.

Production risk:

- Anyone with source access has the database credential and signing secret.
- Token compromise requires source/code redeploy instead of secret rotation.
- Debug security logs can expose sensitive request details.
- Demo credentials create a direct account takeover path if seed data reaches production.

Recommended action:

- Move all secrets to environment variables or a secret manager.
- Add `application-dev.properties`, `application-test.properties`, and `application-prod.properties`.
- Remove production defaults for `spring.datasource.password` and `app.jwt.secret`.
- Fail startup when production secrets are missing or too weak.
- Rotate the current database password and JWT secret.
- Disable `data.sql` and demo login hints in production.
- Set production logging for Spring Security to `WARN` or lower noise with safe audit logs.

Target state:

```properties
spring.datasource.url=${CMMS_DB_URL}
spring.datasource.username=${CMMS_DB_USERNAME}
spring.datasource.password=${CMMS_DB_PASSWORD}
app.jwt.secret=${CMMS_JWT_SECRET}
cmms.security.api-permission-restriction-enabled=true
```

### 2. Backend API permission checks are disabled by configuration

Evidence:

- `application.properties` sets `cmms.security.api-permission-restriction-enabled=false`.
- `AccessControlService.hasPermission` returns `true` when this flag is disabled.
- Services call `validatePermission(...)`, but that protection is bypassed by the flag.

Production risk:

- Authenticated users can access APIs regardless of permission mapping.
- Frontend permission hiding does not protect APIs.
- Operational mistakes in one property can turn RBAC into authentication-only access.

Recommended action:

- Enable permission restriction by default in all environments except local demo.
- Make production fail startup if the flag is false.
- Add integration tests proving each role cannot access forbidden APIs.
- Add a startup log that clearly identifies active security mode.
- Consider method-level annotations or request-level authorization for highly sensitive admin endpoints.


### 4. There is no meaningful automated test coverage

Evidence:

- `mvn test` reports no test sources to compile.
- `cmms_front_end/package.json` has `test: "echo \"No tests specified\" && exit 0"`.
- No standard frontend test/spec files were found.

Production risk:

- RBAC, site filtering, approval workflows, inventory math, notification scheduling, and Liquibase migrations can regress without warning.
- Builds can pass while core behavior is untested.

Recommended action:

- Add backend unit tests for services with permission and validation rules.
- Add backend integration tests with Testcontainers PostgreSQL and Liquibase from scratch.
- Add API security tests for unauthorized, forbidden, and allowed paths.
- Add frontend component/route tests for protected routes and permissions.
- Add Playwright end-to-end smoke tests for login, equipment, request, assignment, PM, spare parts, and approval.
- Replace the frontend placeholder test script with real test execution.

Minimum production gate:

- Backend: `mvn test` must compile and execute real tests.
- Frontend: `npm run build` and `npm test` must run real checks.
- Database: Liquibase migration must be validated against an empty PostgreSQL database.

### 5. Existing documentation is stale and sometimes describes another system

Evidence:

- `cmms_back_end/README.md`, `PROJECT_STRUCTURE.md`, and `API_DOCUMENTATION.md` still describe a travel reimbursement or claims system.
- `cmms_front_end/COMPONENT_DOCS.md` also contains old claim/payment pages.
- `FileStorageConfig` fallback path still points to `travel-reimbursement/documents`.
- `shared/services/api.js` still exposes claim and document helper APIs that do not match the current CMMS module set.

Production risk:

- New developers, support teams, and deployment teams may follow wrong setup and API instructions.
- Dead API clients create confusion and future bugs.
- Audit and handover documents do not match the deployed application.

Recommended action:

- Replace stale docs with CMMS-specific architecture, setup, API, and operations docs.
- Remove or quarantine dead claim/document API helpers.
- Rename legacy paths and comments to CMMS terminology.
- Create an API contract document generated from OpenAPI and keep it in CI.

### 6. Production deployment pipeline is missing

Evidence:

- `.github` contains helper folders but no workflow files were found.
- No CI gate currently runs Maven tests, frontend build, Liquibase checks, dependency scanning, or container build.

Production risk:

- Manual deployments can ship unbuilt code, stale migrations, exposed secrets, or vulnerable dependencies.

Recommended action:

- Add CI workflows for pull requests and main branch.
- Required gates:
  - Backend compile and tests.
  - Frontend install, tests, and build.
  - Liquibase validate and empty-database migration smoke test.
  - Dependency vulnerability scan.
  - Secret scan.
  - Static analysis and linting.
  - Artifact generation with version metadata.

## High Priority Improvements

### 7. Authentication needs production hardening

Current state:

- JWT is issued with a username subject.
- `JwtFilter` sets authentication with an empty authority list.
- Frontend stores JWT and access metadata in `localStorage`.
- Password change only enforces minimum length of 6.
- There is no visible refresh token, token revocation, account lockout, login throttling, or MFA.

Production risk:

- XSS can steal tokens from `localStorage`.
- Users remain authorized until token expiry even after permission revocation unless backend rechecks every time.
- Brute-force login attempts are not throttled.
- Passwords can be weak.

Recommended action:

- Use short-lived access tokens and server-side refresh token rotation.
- Store refresh tokens in secure, HTTP-only, same-site cookies if browser deployment allows it.
- Add token revocation on password change and admin deactivation.
- Add account lockout and rate limiting on `/auth/login`.
- Add password policy and password history.
- Include role/permission version or session id in tokens so revoked sessions can be invalidated.
- Consider SSO/MFA for production users.

### 8. CORS and security headers should be environment-specific

Current state:

- CORS allows localhost and 127.0.0.1 wildcard ports.
- Swagger endpoints are public.
- CSRF is disabled because the API is stateless.

Recommended action:

- Externalize allowed frontend origins.
- Disable or protect Swagger in production.
- Set HSTS, frame options, content security policy, referrer policy, and safe cache headers.
- Document reverse proxy TLS termination and trusted headers.

### 9. Observability is not production-ready

Current state:

- No Spring Boot Actuator dependency was found.
- The global exception handler returns generic 500 errors but does not log the exception.
- There is no request correlation id, structured logging, metric export, or health/readiness endpoint.

Production risk:

- Production incidents will be difficult to diagnose.
- Load balancers cannot reliably check readiness.
- Business owners cannot monitor SLA or workflow health.

Recommended action:

- Add Actuator health, readiness, liveness, metrics, and info endpoints.
- Add structured JSON logs with correlation ids.
- Log unexpected exceptions once with stack trace and correlation id.
- Add metrics for login failures, approval queue length, overdue work orders, PM generation, notification jobs, import failures, stock-outs, and API latency.
- Add dashboards and alerts.

### 10. Scheduler and notification streaming are not multi-instance safe

Current state:

- `@EnableScheduling` is enabled globally.
- Notification scans use dynamic scheduling.
- PM work order generation has a scheduled method.
- SSE emitters are stored in memory with timeout `0`.

Production risk:

- In a multi-instance deployment, scheduled jobs may run on every node.
- In-memory SSE subscriptions do not survive restarts and do not broadcast across nodes.
- Infinite SSE timeout can keep stale resources open.

Recommended action:

- Add a distributed scheduler lock such as ShedLock with PostgreSQL.
- Store job execution history.
- Make scheduled jobs idempotent.
- Add finite SSE timeout and reconnect behavior.
- Use Redis, a message broker, or database polling for cross-node notification delivery.

### 11. File upload and import handling needs stricter controls

Current state:

- Company logo upload validates only content type starts with `image/`.
- SVG is accepted by extension.
- Global multipart limit is 50 MB.
- Spare part import reads CSV or workbook content without strong type, size, row-count, or virus checks.

Production risk:

- Malicious or oversized uploads can impact storage, memory, or browser security.
- SVG can contain scriptable content if served unsafely.
- Import mistakes can update inventory at scale without enough audit trail.

Recommended action:

- Define per-endpoint size limits.
- Validate file signature, extension, and content type.
- Reject or sanitize SVG uploads.
- Add antivirus scanning when files are stored.
- Store files outside the application runtime with backup and retention policy.
- Add import preview, dry-run, row limit, duplicate strategy, and audit trail.

### 12. Frontend build needs code splitting and quality gates

Current state:

- Production build succeeds but emits a 1.49 MB minified main bundle warning.
- Routes are imported eagerly in `App.jsx`.
- No lint, test, type check, or accessibility gate is configured.
- Login and API services contain console debug logging.

Production risk:

- Slow first load on plant networks or mobile devices.
- Debug logs may leak user, URL, or response details.
- UI regressions are likely without tests.

Recommended action:

- Lazy-load route pages with `React.lazy` and suspense.
- Split MUI/data-grid heavy pages into separate chunks.
- Add ESLint and frontend test tooling.
- Remove production console logs.
- Add accessibility checks for forms, dialogs, tables, and keyboard navigation.

### 13. Database migration discipline needs production checks

Current state:

- Liquibase is enabled with `ddl-auto=validate`.
- Most CMMS tables use XML create-table changelogs.
- Some changelogs contain raw SQL for enum creation and seed data.
- `data.sql` contains demo data and old sample records.
- Rollback strategy is not visible.

Production risk:

- Fresh database setup may differ from updated environments if seeds and incremental changes drift.
- Demo data can accidentally load in production.
- Rollback and disaster recovery are not rehearsed.

Recommended action:

- Keep schema changes in XML tags except where PostgreSQL-specific enum/type behavior requires controlled SQL.
- Move seed/demo data to explicit dev/sample scripts, not production startup.
- Add Liquibase validation to CI.
- Test migrations from an empty DB and from the previous production version.
- Document backup, restore, rollback, and migration approval process.



## Medium Priority Improvements

### 15. Replace free-form status strings with enums or constants

Many workflow fields are handled as strings such as `OPEN`, `PENDING_APPROVAL`, `CLOSED`, `ACTIVE`, `INACTIVE`, and spare usage states.

Recommended action:

- Use Java enums or central constants for workflow statuses.
- Add database check constraints where possible.
- Keep frontend constants synchronized through generated API schema or shared documentation.

### 16. Add audit trail and change history

Production CMMS systems need traceability for safety, inventory, and compliance.

Recommended action:

- Add `created_by`, `updated_by`, and `deleted_by` where missing.
- Add audit events for login, permission changes, work order status changes, approval decisions, stock changes, imports, PM generation, and notification setting updates.
- Add immutable inventory transaction history and approval action history retention.

### 17. Improve dashboard and reporting performance

Current risk:

- Dashboard service performs per-site counts in loops.
- Common search can scan all string fields.
- Reporting queries may grow expensive as data volume increases.

Recommended action:

- Replace per-site loops with grouped aggregate queries.
- Add indexes for common filters: site, status, due date, request status, equipment, transaction date.
- Add report pagination/export jobs for heavy reports.
- Consider materialized views for high-volume KPIs.

### 18. Clean shared API service boundaries

Current state:

- `shared/services/api.js` contains auth, admin, old claims, document helpers, and file APIs.
- Feature services exist for many modules.

Recommended action:

- Keep only shared axios client and truly shared helpers in `src/shared/services/api.js`.
- Move module-specific APIs into feature services.
- Remove legacy claim APIs unless the module is reintroduced.
- Generate API clients from OpenAPI once the backend contract stabilizes.

### 19. Improve frontend session restoration

Current state:

- Auth context trusts stored `roles`, `permissions`, and `allowedSites` from `localStorage`.
- `/auth/me` exists but is not used to refresh access data on app load.

Recommended action:

- On app startup, call `/auth/me` to refresh user, roles, permissions, and allowed sites.
- Clear local access state if the token is invalid or the user is inactive.
- Avoid trusting stale permission metadata from the browser.

### 20. Improve production documentation

Recommended docs:

- CMMS architecture overview.
- Deployment runbook.
- Environment variable matrix.
- Database migration and rollback runbook.
- Incident response runbook.
- API contract generated from OpenAPI.
- User and role administration guide.
- Data import guide.
- Backup and restore guide.

## Suggested Delivery Order

### Phase 0: Before go-live

- Externalize secrets and rotate current credentials.
- Enable API permission restriction.
- Remove demo credentials from UI and production data.
- Fix fail-open site access behavior.
- Add basic CI with backend test, frontend build, secret scan, and Liquibase validate.
- Add minimum API security integration tests.
- Remove or rewrite stale travel reimbursement documentation.

### Phase 1: First production hardening sprint

- Add real backend and frontend tests.
- Add Actuator health/readiness and structured logging.
- Add login rate limiting and account lockout.
- Add production CORS/security headers.
- Add frontend route code splitting.
- Add upload/import hardening.

### Phase 2: Operations and scale

- Add distributed scheduler lock.
- Add notification stream scale strategy.
- Add backup/restore and migration rehearsal.
- Add audit trail and reporting metrics.
- Add dependency/security scanning and upgrade policy.

### Phase 3: Product maturity

- Expand CMMS workflows, mobile technician capabilities, document management, analytics, and ERP integrations as described in `docs/PRODUCTION_NEW_REQUIREMENTS.md`.

## Final Production Readiness Assessment

The application has a solid module foundation and the core CMMS workflows are visible in code. It is not production-ready yet because the current configuration can expose secrets, disable API permission checks, grant broad site access on misconfiguration, and ship with no meaningful automated tests.

The fastest route to a safe production pilot is to harden configuration/security first, add CI and minimum workflow tests second, then clean stale docs and dead APIs before expanding new features.
