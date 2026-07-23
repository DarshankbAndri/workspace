# CMMS Test Data Generator: Installation and Run Guide

This guide explains how to install and run the existing Playwright data generator on Windows. The generator uses the real CMMS web forms and APIs; it does not insert records directly into PostgreSQL.

## 1. What must be installed

Install these tools before running the generator:

| Software | Required version | Purpose |
| --- | --- | --- |
| Java JDK | 17 | Runs the Spring Boot backend |
| Maven | 3.8 or newer | Builds and starts the backend |
| PostgreSQL | 14 or newer | CMMS database |
| Node.js | 18 or newer | Runs the frontend and generator |
| npm | Included with Node.js | Installs JavaScript packages |
| Chrome, Edge, or Playwright Chromium | Current version | Browser automation |

Verify the main tools in PowerShell:

```powershell
java -version
mvn -version
node --version
npm --version
psql --version
```

## 2. Prepare PostgreSQL

The current development backend configuration expects:

- Host: `localhost`
- Port: `5432`
- Database: `production_cmms`
- Username: `postgres`
- Password: `postgres`

Create the database if it does not already exist:

```powershell
psql -U postgres -c "CREATE DATABASE production_cmms;"
```

If your PostgreSQL username or password is different, update `cmms_back_end/src/main/resources/application.properties` or supply the corresponding Spring datasource environment variables before starting the backend.

Liquibase creates and updates the tables automatically when the backend starts.

## 3. Start the backend

Open PowerShell window 1:

```powershell
cd C:\Users\production\Documents\Sof_projects\workspace\cmms_back_end
mvn clean install
mvn spring-boot:run
```

Wait until Spring Boot reports that the application has started. The backend should be available at:

```text
http://localhost:6100/api
```

Keep this PowerShell window open.

## 4. Start the frontend

Open PowerShell window 2:

```powershell
cd C:\Users\production\Documents\Sof_projects\workspace\cmms_front_end
npm install
npm run dev
```

The development environment starts the frontend at:

```text
http://localhost:6200
```

Open that address in a browser and confirm that you can log in before running the generator. Keep this PowerShell window open.

## 5. Prepare a generator login

The generator needs an existing active CMMS login. `SUPER_ADMIN` is recommended because the generator creates data in several protected modules.

The login must have permission to create every enabled module. For example, generating sites, employees, equipment, and requests requires the corresponding create and helper/list permissions.

Do not place a real password in a committed file.

## 6. Configure the number of records

Edit:

```text
test-data-automation/config/generation-counts.json
```

The current example is configured for:

```json
{
  "defaultCount": 0,
  "counts": {
    "sites": 2,
    "roles": 0,
    "employees": 10,
    "vendors": 0,
    "equipment": 100,
    "spareParts": 0,
    "preventiveMaintenance": 0,
    "maintenanceRequests": 20,
    "assignments": 0,
    "workLogs": 0,
    "spareRequests": 0,
    "downtime": 0,
    "purchaseRequests": 0
  }
}
```

Rules:

- Use `0` to disable a module.
- Use a whole number from `1` through `200` to generate that many records.
- Keep prerequisite data enabled or already present. For example, employees and equipment require sites; maintenance requests require equipment.
- Records are created in dependency order automatically.

## 7. Install the generator

Open PowerShell window 3:

```powershell
cd C:\Users\production\Documents\Sof_projects\workspace\test-data-automation
npm install
npx playwright install chromium
```

The browser installation is normally required only once. On Windows, the generator also detects installed Chrome or Edge automatically.

If downloading Playwright Chromium is not possible, use installed Chrome or Edge by setting `BROWSER_EXECUTABLE_PATH` in `.env`.

## 8. Create the generator environment file

From the `test-data-automation` directory:

```powershell
Copy-Item .env.example .env
notepad .env
```

Set at least these values:

```dotenv
CMMS_BASE_URL=http://localhost:6200
CMMS_USERNAME=superadmin
CMMS_PASSWORD=your-real-login-password
RUN_PREFIX=SOLAR-DEMO
HEADLESS=true
```

`HEADLESS=true` hides the automated browser. Change it to `false` if you want to watch the forms being completed.

`RUN_PREFIX` identifies one generated dataset. Rerunning with the same prefix skips records that already exist. Use a new prefix, such as `SOLAR-DEMO-2`, to create another dataset.

## 9. Run the generator

Confirm that PostgreSQL, the backend, and the frontend are still running. Then run:

```powershell
cd C:\Users\production\Documents\Sof_projects\workspace\test-data-automation
npm run generate
```

The generator runs sequentially through the enabled modules. Creating 100 records through real UI forms can take time; keep all three PowerShell windows open until it finishes.

## 10. Test with a small run first

To temporarily create one record per selected module without changing the JSON configuration:

```powershell
$env:RECORD_COUNT = '1'
$env:MODULES = 'sites,employees,equipment,maintenanceRequests'
npm run generate
Remove-Item Env:RECORD_COUNT
Remove-Item Env:MODULES
```

Use a different `RUN_PREFIX` for the full run if you do not want the smoke-test records included in the same dataset.

## 11. Check the result

The generator writes:

- `reports/data-creation-report.json`: detailed machine-readable report
- `reports/data-creation-report.csv`: summary that can be opened in Excel
- `screenshots/<module>-<number>.png`: screenshot for each failed record

Run the separate audit after generation:

```powershell
npm run audit
```

Also check the CMMS list pages to confirm the generated sites, employees, equipment, and requests.

## 12. Common errors

### `CMMS_PASSWORD is required`

Create `.env` from `.env.example` and set the real CMMS login password.

### Login failed

Confirm the username/password by logging in manually at `http://localhost:6200`. The user must be active.

### `ERR_CONNECTION_REFUSED`

Confirm:

- Backend is running on port `6100`.
- Frontend is running on port `6200`.
- PostgreSQL is running on port `5432`.

Check ports in PowerShell:

```powershell
Test-NetConnection localhost -Port 5432
Test-NetConnection localhost -Port 6100
Test-NetConnection localhost -Port 6200
```

### Permission denied or HTTP 403

Use a `SUPER_ADMIN` login or grant the create/view/helper permissions required by every enabled module.

### No site or equipment is available

Enable the required prerequisite module in `generation-counts.json`, or confirm suitable records already exist. Keep the same `RUN_PREFIX` when later modules must use records created by an earlier run.

### Browser executable is missing

Install Playwright Chromium:

```powershell
npx playwright install chromium
```

Or set an installed browser in `.env`, for example:

```dotenv
BROWSER_EXECUTABLE_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
```

### Some records are skipped

This is expected on reruns. Generated codes are deterministic, and existing records with the same prefix are skipped to avoid duplicates.

## Safety

Use this generator for development, testing, or demo environments. It creates real application records through the normal authenticated workflow. Do not point `CMMS_BASE_URL` at production unless creating this volume of data has been explicitly approved.
