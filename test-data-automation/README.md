# Solar CMMS test-data automation

For complete installation, configuration, startup, troubleshooting, and run instructions, see [RUN_GUIDE.md](RUN_GUIDE.md).

This Playwright runner creates realistic, connected solar power plant demo data through the running CMMS frontend at `http://localhost:6200`. It does not connect to or write directly to the database. Create operations use the application's actual UI forms; authenticated frontend API requests are limited to dependency discovery, rerun checks, and verification.

## Supported UI creation flows

- Sites, roles, employees with site execution assignments, and vendors with site assignments
- Equipment and site-level spare-part inventory, including intentional low-stock records
- Preventive-maintenance schedules and maintenance requests
- Assignments, technician work logs, assignment spare requests, and equipment downtime
- Reorder requests when the login user has `REORDER_CREATE`

Company is a singleton and is left unchanged when it already exists. Teams, equipment category/type masters, meter readings, and manual notifications have no create UI in the current application and are documented as skipped in the report.

## Setup and run

1. Confirm the frontend is running on port `6200` and the backend is reachable through its `/api` proxy.
2. Copy `.env.example` to `.env` and set `CMMS_PASSWORD`. Do not commit `.env`.
3. Install and run:

```powershell
cd test-data-automation
npm install
npm run generate
```

Set the required record count for each module in `config/generation-counts.json`. A count of `0` disables that module. For example:

```json
{
  "defaultCount": 0,
  "counts": {
    "sites": 2,
    "employees": 10,
    "equipment": 100,
    "maintenanceRequests": 20
  }
}
```

The committed configuration contains every supported module, so each part can be adjusted in one place. Counts must be whole numbers from 0 through 200. Dependencies are still processed in the safe order defined in `config/modules.json`.

For a temporary run, `RECORD_COUNT` overrides every configured module count. `MODULES` can restrict the run to a comma-separated subset:

```powershell
$env:RECORD_COUNT = '1'
$env:MODULES = 'sites,employees,vendors,equipment'
npm run generate
```

`RUN_PREFIX` defaults to `SOLAR-DEMO`. Stable deterministic codes make reruns safe: existing keyed records are skipped. A different prefix creates an independent dataset.

On machines without Playwright's bundled Chromium, set `BROWSER_EXECUTABLE_PATH` to an installed Chrome or Edge executable. Set `HEADLESS=false` to watch the UI.

## Output

- `reports/data-creation-report.json`
- `reports/data-creation-report.csv`
- `screenshots/<module>-<record>.png` for failed UI submissions

Each report row includes requested, created, skipped, and failed counts plus timing and failure reasons. The JSON also records UI-only creation, the frontend URL, documented missing modules, and permission-based skips.
