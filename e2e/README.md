# CMMS end-to-end automation

This is the production E2E and API regression framework for the implemented CMMS application. It uses Playwright with TypeScript, real JWT authentication, real Spring APIs, and a real PostgreSQL test database. Core CMMS logic is not mocked.

## Prerequisites

- Node.js 22.12+
- Java 21 and Maven
- PostgreSQL client/server
- backend and frontend dependencies installed
- a dedicated database whose name contains `e2e` or `test`
- test accounts matching the application's real roles and site assignments

Never point cleanup at `production_cmms_v1` or `production_cmms_utc_v1`. The guard explicitly rejects both databases.

## Install and configure (Windows PowerShell)

```powershell
Set-Location C:\path\to\workspace\e2e
npm ci
npx playwright install chromium
Copy-Item .env.example .env
```

Edit `.env` locally. Set `CMMS_ADMIN_PASSWORD` and `E2E_TEST_DATABASE_NAME`; do not commit `.env`. Security tests create their own temporary users, roles and site assignments through the normal APIs. No viewer or site-scoped credentials are required. Confirm the configured backend actually uses that dedicated database; the name guard cannot inspect a remote JDBC connection.
If `psql` is not on `PATH`, set `E2E_PSQL_PATH` to its full Windows executable path.

Start the backend against the dedicated test database on port 6100, then start Vite on port 6200. Example:

```powershell
$env:SPRING_DATASOURCE_URL='jdbc:postgresql://127.0.0.1:5432/production_cmms_e2e'
$env:SPRING_DATASOURCE_USERNAME='postgres'
$env:SPRING_DATASOURCE_PASSWORD='<local-secret>'
$env:SERVER_PORT='6100'
Set-Location ..\cmms_back_end
mvn spring-boot:run "-Dspring-boot.run.arguments=--cmms.approval.enabled=true"

Set-Location ..\cmms_front_end
npm ci
npm run dev -- --host 127.0.0.1 --port 6200
```

Run these in a third PowerShell window from `e2e`:

```powershell
npm run test:smoke
npm run typecheck
npm run test:tools
npm run test:e2e
npm run test:regression
npm run test:security
npm run test:api
npx playwright test tests\workflow\complete-maintenance-lifecycle.spec.ts
npm run test:headed
npm run test:debug
npm run test:report
```

`test:e2e` is the complete suite. Regression excludes performance/load testing. Reports are written to `playwright-report/`, `reports/junit.xml`, and `test-results/`; traces, screenshots and videos are retained only according to `playwright.config.ts`.

The `configuration` project runs after `chromium`, with one worker, to change and restore global approval/notification settings without racing normal workflows. To debug only that project, use `npx playwright test --project=configuration --no-deps`. Keep approval support enabled on the backend. See [the audit and implementation plan](docs/AUTOMATION_PLAN.md) for implemented scenarios and the remaining backlog; API references and route smoke tests do not establish full behavioral coverage.

## Deterministic data and cleanup

Factories create unique `E2E-<run>` identifiers. Each test registers dependency-aware API cleanup. A crash-recovery cleanup exists only for a confirmed dedicated database:

```powershell
$env:E2E_ALLOW_DESTRUCTIVE_RESET='true'
$env:E2E_TEST_DATABASE_NAME='production_cmms_e2e'
$env:E2E_CLEANUP_CONFIRM='production_cmms_e2e'
npm run cleanup:e2e
```

Cleanup first verifies the connected database name, rejects known production databases, targets only `E2E-` records, deletes children before parents, and runs in one PostgreSQL transaction. A failure rolls back the cleanup.

## Adding tests

Put each suite in its module folder, use `fixtures/cmms.fixture.ts`, factories, `CmmsApiClient`, and `ResourceTracker`. Assert the persisted API state, not only page visibility. Prefer role/label/test-id selectors, never generated MUI classes or static sleeps. Add the correct tags and regenerate the endpoint report with `npm run docs:coverage`.

## CI

`.github/workflows/e2e-tests.yml` provisions an isolated PostgreSQL service and a writable runner-temporary document directory, generates and masks a fresh administrator password, updates the ephemeral test seed to use it, checks TypeScript and coverage tooling, runs frontend tests, builds both applications, starts them, runs smoke then the full suite, and uploads reports. No administrator, viewer or site-scoped password needs to be stored in GitHub. Audit history remains in that disposable database until the CI job ends.
