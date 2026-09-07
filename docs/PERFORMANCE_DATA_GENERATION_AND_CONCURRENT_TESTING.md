# CMMS Performance Data Generation and Concurrent User Testing

This runbook explains how to generate the large PostgreSQL performance dataset and then run concurrent user testing with k6.

Use this only on an approved staging or local performance database. Do not run the generator against production.

## What Gets Generated

The default generator creates one isolated run marked with `PERF-<RUN_ID>`:

| Dataset | Rows |
| --- | ---: |
| Sites | 100 |
| Employees | 5,000 |
| Equipment records | 50,000 |
| Maintenance requests | 100,000 |
| Maintenance assignments | 100,000 |
| Assignment work logs | 500,000 |
| Downtime records | 100,000 |
| Spare-part transactions | 100,000 |
| Spare parts | 100 |
| Site stock rows | 10,000 |

The generator preserves CMMS foreign-key relationships and verifies exact counts before commit. If generation fails before commit, PostgreSQL rolls back the transaction.

## Prerequisites

Before generating data:

- PostgreSQL database must already be migrated with the current Liquibase schema.
- PostgreSQL client tools must be installed, especially `psql`.
- The database user must be allowed to `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE TABLE`, `CREATE TEMP TABLE`, and `ANALYZE`.
- Keep at least 5 GB free database disk space for the default run.
- Stop the backend during generation if scheduled jobs or users may modify generated rows.
- Do not store database passwords in files or commands.

Before concurrent user testing:

- Backend must be running and connected to the generated database.
- k6 must be installed.
- A valid CMMS application user must exist, for example `superadmin`.
- Run the smoke profile before baseline, load, or stress.

## Install Required Clients

Windows:

```powershell
winget install PostgreSQL.PostgreSQL
winget install k6.k6

psql --version
k6 version
```

If `psql` is installed but not on `PATH`, add the PostgreSQL `bin` directory, for example:

```powershell
$env:Path = 'C:\Program Files\PostgreSQL\18\bin;' + $env:Path
psql --version
```

Ubuntu/Debian:

```bash
sudo apt-get update
sudo apt-get install postgresql-client

psql --version
```

Install k6 using the official Grafana k6 package instructions for your Linux distribution, then verify:

```bash
k6 version
```

## Generate Large Data on Windows

From the repository root:

```powershell
cd performance-data-generator

.\generate.ps1 `
  -RunId 'CLIENTLOAD01' `
  -DbHost 'YOUR_POSTGRESQL_HOST' `
  -DbPort 5432 `
  -Database 'YOUR_CMMS_DATABASE' `
  -DbUser 'YOUR_DATABASE_USER'
```

`psql` will prompt for the database password if it is not already configured through a secure PostgreSQL mechanism. Do not commit passwords to the repository.

For local testing with the default local database used in this workspace:

```powershell
cd performance-data-generator

.\generate.ps1 `
  -RunId 'KEEPLOAD0903' `
  -DbHost localhost `
  -DbPort 5432 `
  -Database production_cmms_v1 `
  -DbUser postgres
```

Use a new run ID for each separate load, such as `LOADTEST01`, `LOADTEST02`, or a date-based value. The generated marker will be `PERF-LOADTEST01`.

## Verify Generated Counts

Run verification after generation:

```powershell
.\verify.ps1 `
  -RunId 'CLIENTLOAD01' `
  -DbHost 'YOUR_POSTGRESQL_HOST' `
  -DbPort 5432 `
  -Database 'YOUR_CMMS_DATABASE' `
  -DbUser 'YOUR_DATABASE_USER'
```

Expected result: every dataset row should show `PASS`.

For the local kept run:

```powershell
.\verify.ps1 `
  -RunId 'KEEPLOAD0903' `
  -DbHost localhost `
  -DbPort 5432 `
  -Database production_cmms_v1 `
  -DbUser postgres
```

## Generate and Verify on Linux/macOS

From the repository root:

```bash
cd performance-data-generator
chmod +x run.sh

CMMS_DB_HOST='YOUR_POSTGRESQL_HOST' \
CMMS_DB_PORT='5432' \
CMMS_DB_NAME='YOUR_CMMS_DATABASE' \
CMMS_DB_USER='YOUR_DATABASE_USER' \
./run.sh generate CLIENTLOAD01

CMMS_DB_HOST='YOUR_POSTGRESQL_HOST' \
CMMS_DB_PORT='5432' \
CMMS_DB_NAME='YOUR_CMMS_DATABASE' \
CMMS_DB_USER='YOUR_DATABASE_USER' \
./run.sh verify CLIENTLOAD01
```

Use a secure `.pgpass` file or the interactive `psql` prompt for the database password. Do not store it in this repo.

## Start the Application

After data generation and verification pass, start or restart the CMMS backend so it connects to the database containing the generated rows.

Check health:

```powershell
Invoke-WebRequest -Uri 'http://localhost:6200/api/actuator/health' -UseBasicParsing
```

The exact base URL may differ by environment. The k6 scripts expect the backend API root, for example:

```text
http://localhost:6200/api
```

## Run k6 on Windows

From the repository root:

```powershell
cd performance-tests

.\run.ps1 `
  -Profile smoke `
  -BaseUrl 'http://localhost:6200/api' `
  -Username 'superadmin'
```

The script prompts securely for the CMMS application password.

If the environment uses remote plain HTTP, the runner refuses to send credentials unless explicitly allowed:

```powershell
.\run.ps1 `
  -Profile smoke `
  -BaseUrl 'http://YOUR_SERVER:6200/api' `
  -Username 'superadmin' `
  -AllowInsecureHttp
```

Run profiles in this order:

```powershell
.\run.ps1 -Profile smoke    -BaseUrl 'http://localhost:6200/api' -Username 'superadmin'
.\run.ps1 -Profile baseline -BaseUrl 'http://localhost:6200/api' -Username 'superadmin'
.\run.ps1 -Profile load     -BaseUrl 'http://localhost:6200/api' -Username 'superadmin'
```

Run stress only after smoke, baseline, and load are acceptable:

```powershell
.\run.ps1 -Profile stress -BaseUrl 'http://localhost:6200/api' -Username 'superadmin'
```

Custom example:

```powershell
.\run.ps1 `
  -Profile custom `
  -Vus 150 `
  -Duration 10m `
  -BaseUrl 'http://localhost:6200/api' `
  -Username 'superadmin'
```

## Run k6 on Linux/macOS

```bash
cd performance-tests
chmod +x run.sh

BASE_URL='http://localhost:6200/api' ./run.sh smoke
BASE_URL='http://localhost:6200/api' ./run.sh baseline
BASE_URL='http://localhost:6200/api' ./run.sh load
```

The Bash runner uses `CMMS_USERNAME`, defaulting to `superadmin`, and securely prompts for `CMMS_PASSWORD` when it is not already set. Do not commit secrets.

## k6 Profiles

| Profile | Concurrent users | Purpose |
| --- | ---: | --- |
| `smoke` | 1 for 30 seconds | Confirm connectivity, login, response envelopes, and basic read paths |
| `baseline` | 10 for 2 minutes | Establish normal response time |
| `load` | Ramp to 25, 50, then 100 users | Measure production-sized concurrency |
| `stress` | Ramp to 100, 200, then 300 users | Find failure and recovery limits |
| `custom` | User supplied | Test a specific VU and duration target |

Each k6 run writes a JSON report under:

```text
performance-tests/reports/
```

## Pass or Fail Rules

k6 fails the run when any threshold is crossed:

- HTTP failure rate must be below 1%.
- API envelope failure rate must be below 1%.
- Overall p95 response time must be below 1 second.
- Overall p99 response time must be below 2.5 seconds.
- Dashboard p95 response time must be below 2 seconds.
- Paginated search p95 response time must be below 1 second.

If smoke fails on latency but has zero HTTP and envelope failures, the application is functionally responding but too slow for the configured performance target.

## Monitor During Testing

Watch these while k6 runs:

- Spring Boot CPU, heap, garbage collection, request latency, and Hikari active/pending connections.
- PostgreSQL CPU, RAM, disk latency, locks, active connections, and slow queries.
- Reverse proxy or frontend gateway upstream errors and network throughput.

Stop the test if CPU stays above 90%, memory is exhausted, PostgreSQL disk latency spikes, Hikari pending connections keep rising, or the error rate exceeds 5%.

## Clean Up One Run

Cleanup is guarded. The run ID must be supplied twice and must match exactly.

Windows:

```powershell
cd performance-data-generator

.\cleanup.ps1 `
  -RunId 'CLIENTLOAD01' `
  -ConfirmRunId 'CLIENTLOAD01' `
  -DbHost 'YOUR_POSTGRESQL_HOST' `
  -DbPort 5432 `
  -Database 'YOUR_CMMS_DATABASE' `
  -DbUser 'YOUR_DATABASE_USER'
```

Linux/macOS:

```bash
cd performance-data-generator

CMMS_DB_HOST='YOUR_POSTGRESQL_HOST' \
CMMS_DB_PORT='5432' \
CMMS_DB_NAME='YOUR_CMMS_DATABASE' \
CMMS_DB_USER='YOUR_DATABASE_USER' \
CONFIRM_RUN_ID='CLIENTLOAD01' \
./run.sh cleanup CLIENTLOAD01
```

Cleanup deletes child records first and then master records. It removes only rows connected to the selected `PERF-<RUN_ID>` marker. It does not reset identity sequences.

## Local Run Already Generated

This workspace currently has the full large dataset generated with:

```text
Run ID: KEEPLOAD0903
Marker: PERF-KEEPLOAD0903
Database: production_cmms_v1
```

Use `KEEPLOAD0903` for verification or k6 testing until the dataset is cleaned up.
