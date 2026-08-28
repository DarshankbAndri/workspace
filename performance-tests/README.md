# CMMS performance and concurrent-user testing

This directory contains a repeatable k6 test for the CMMS Spring Boot API. It authenticates through the real `/api/auth/login` endpoint and exercises the same dashboard, pagination, maintenance, equipment, spare-parts, approval, employee, vendor, site, and notification APIs used by the React application.

The test does not delete production data and does not perform write workflows. Run it only against an approved staging environment. Use the existing `test-data-automation` project to create connected test data before running performance tests.

## Prerequisites

- The CMMS frontend and backend must be running.
- PostgreSQL must be reachable by the backend.
- Use a dedicated staging database with a current backup.
- Install k6.

### Install k6 on Windows

Open PowerShell as Administrator and use one option:

```powershell
winget install k6.k6
```

or:

```powershell
choco install k6
```

Verify:

```powershell
k6 version
```

### Install k6 on Ubuntu/Debian

Follow the official k6 repository setup, then run:

```bash
sudo apt-get update
sudo apt-get install k6
k6 version
```

## Generate test data first

The repository already contains `test-data-automation`. It creates connected records through the real UI.

```powershell
cd test-data-automation
npm install
npx playwright install chromium
Copy-Item .env.example .env
```

Set `CMMS_BASE_URL`, `CMMS_USERNAME`, and `CMMS_PASSWORD` in `.env`, then configure record counts in `config/generation-counts.json`.

The UI generator deliberately allows at most 200 records per module per prefix. To generate additional batches, change `RUN_PREFIX` for each run. UI generation is intended for realistic connected data, not millions of database rows. For 100,000+ records, use a dedicated bulk-data loader or anonymized production-sized database snapshot.

```powershell
$env:RUN_PREFIX = 'PERF-BATCH-001'
npm run generate
```

## Run on Windows

Start with the smoke test:

```powershell
cd performance-tests
.\run.ps1 -Profile smoke -BaseUrl 'http://localhost:6200/api'
```

The script securely prompts for the password and removes it from the environment after the run.

Run 10-user baseline:

```powershell
.\run.ps1 -Profile baseline -BaseUrl 'http://localhost:6200/api'
```

Run the standard ramp from 25 to 100 concurrent virtual users:

```powershell
.\run.ps1 -Profile load -BaseUrl 'http://localhost:6200/api'
```

Run a custom test, for example 150 concurrent users for 10 minutes:

```powershell
.\run.ps1 -Profile custom -Vus 150 -Duration 10m -BaseUrl 'http://localhost:6200/api'
```

Run the stress profile only after smoke, baseline, and load tests pass:

```powershell
.\run.ps1 -Profile stress -BaseUrl 'http://localhost:6200/api'
```

### Testing the current remote staging server

The supplied staging URL uses plain HTTP. Passwords and JWT tokens can be intercepted on an untrusted network. Prefer HTTPS or a VPN. If you knowingly accept the staging-only risk, the wrapper requires an explicit flag:

```powershell
.\run.ps1 -Profile smoke `
  -BaseUrl 'http://143.161.207.243:6200/api' `
  -Username 'superadmin' `
  -AllowInsecureHttp
```

Do not include the password in the command or commit it to `.env`.

## Run on Linux/macOS

```bash
cd performance-tests
chmod +x run.sh
BASE_URL='http://localhost:6200/api' ./run.sh smoke
BASE_URL='http://localhost:6200/api' ./run.sh load
```

## Profiles

| Profile | Concurrent users | Purpose |
| --- | ---: | --- |
| `smoke` | 1 for 30 seconds | Connectivity, authentication and response-contract check |
| `baseline` | 10 for 2 minutes | Establish normal response time |
| `load` | 25, then 50, then 100 | Measure supported production load |
| `stress` | 100, 200, then 300 | Find the failure and recovery point |
| `custom` | `-Vus` and `-Duration` | Test a specific target |

The workload uses a realistic think time of 0.5–2 seconds. Approximately 30% of iterations load dashboard widgets, 60% execute paginated searches, and 10% load notifications.

## Pass/fail criteria

The test exits with a failure code when any threshold fails:

- HTTP failure rate must be below 1%.
- API-envelope failure rate must be below 1%.
- Overall p95 response time must be below 1 second.
- Overall p99 response time must be below 2.5 seconds.
- Dashboard p95 response time must be below 2 seconds.
- Paginated-search p95 response time must be below 1 second.

Each run writes a timestamped JSON result under `performance-tests/reports/`.

## Monitor the server during the test

Measure all three components separately:

1. Spring Boot CPU, JVM heap, garbage collection, request latency and Hikari active/pending connections.
2. PostgreSQL CPU, RAM, disk latency, active connections, locks and slow queries.
3. Reverse proxy/frontend request rate, upstream errors and network usage.

Useful Spring Boot endpoints, subject to application authorization:

```text
/api/actuator/health
/api/actuator/metrics
/api/actuator/prometheus
```

Stop a test if CPU stays above 90%, available memory is exhausted, PostgreSQL disk latency becomes excessive, Hikari pending connections rise continuously, or the error rate exceeds 5%.

## How to interpret capacity

The supported concurrency is the highest completed stage where all thresholds pass and server resources retain at least 20–25% headroom. Do not size production from the point where the server first crashes.

For example, if 100 users pass but 200 users produce 4% errors and p95 latency of 4 seconds, use 100 as the measured single-instance ceiling. Plan production for approximately 70–80 active concurrent users per identical instance, then validate horizontal scaling through a load balancer.

## Current staging connectivity result

On 2026-08-28, the supplied staging frontend `143.161.207.243:6200` timed out from the external test runner and the backend route returned `502 Bad Gateway` with `connection refused`. No concurrent traffic was applied. Check that both services are running, ports 6200 and 4200 are listening, and the firewall/reverse proxy allows the test runner before repeating the smoke profile.

