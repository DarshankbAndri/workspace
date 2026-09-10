# CMMS end-to-end automation

This is the production E2E and API regression framework for the implemented CMMS application. It uses Playwright with TypeScript, real JWT authentication, real Spring APIs, and a real PostgreSQL test database. Core CMMS logic is not mocked.

## Prerequisites

- Node.js 20+
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

Edit `.env` locally. Set `CMMS_ADMIN_PASSWORD`; do not commit `.env`. Optional viewer and site-scoped accounts enable the full RBAC and cross-site attack scenarios. The suite clearly skips only those scenarios when the account prerequisites are absent.
If `psql` is not on `PATH`, set `E2E_PSQL_PATH` to its full Windows executable path.

Start the backend against the dedicated test database on port 6100, then start Vite on port 6200. Example:

```powershell
$env:SPRING_DATASOURCE_URL='jdbc:postgresql://127.0.0.1:5432/production_cmms_e2e'
$env:SPRING_DATASOURCE_USERNAME='postgres'
$env:SPRING_DATASOURCE_PASSWORD='<local-secret>'
$env:SERVER_PORT='6100'
Set-Location ..\cmms_back_end
mvn spring-boot:run

Set-Location ..\cmms_front_end
npm ci
npm run dev -- --host 127.0.0.1 --port 6200
```

Run these in a third PowerShell window from `e2e`:

```powershell
npm run test:smoke
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

`.github/workflows/e2e-tests.yml` provisions an isolated PostgreSQL service, builds both applications, starts them, runs smoke then regression, and uploads reports. Configure `CMMS_ADMIN_PASSWORD` as a repository/environment secret matching the test seed. Site-scoped and viewer credentials are optional secrets but required for zero skipped security tests.
