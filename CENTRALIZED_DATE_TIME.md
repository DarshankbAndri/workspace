# Centralized date and time

The backend is the CMMS time authority. Database timestamps and JSON datetime values are UTC instants; the configured IANA timezone is used only for business dates, report boundaries, schedules, and display.

## Configuration

Defaults:

```properties
cmms.time.business-zone=${CMMS_TIME_ZONE:Asia/­Riyadh}
cmms.time.locale=${CMMS_TIME_LOCALE:en-IN}
```

Set a different timezone and restart only the backend. No frontend rebuild or data migration is needed.

Windows PowerShell:

```powershell
$env:CMMS_TIME_ZONE = 'America/New_York'
$env:CMMS_TIME_LOCALE = 'en-US'
mvn spring-boot:run
```

Linux/macOS:

```bash
CMMS_TIME_ZONE='America/New_York' \
CMMS_TIME_LOCALE='en-US' \
mvn spring-boot:run
```

An invalid IANA timezone stops backend startup with a configuration error.

## API and UI behavior

`GET /api/system/time` is public, uses the standard `ApiResponse` envelope, and returns `Cache-Control: no-store`. The frontend synchronizes from this endpoint at startup, every five minutes, and after the browser tab resumes. It retains the last successful timezone and locale in browser storage if synchronization temporarily fails.

Datetime API inputs must be ISO-8601 UTC values ending in `Z`, for example `2026-09-07T06:38:32.984Z`. Date-only values remain `YYYY-MM-DD`. The UI converts `datetime-local` fields between the configured business timezone and UTC, including daylight-saving transitions.

Default `en-IN` display formats are:

- Date: `07 Sep 2026`
- Datetime: `07 Sep 2026, 12:08 PM`

## Database and performance data

All application timestamp columns use PostgreSQL `timestamp with time zone`. `spring.jpa.properties.hibernate.jdbc.time_zone=UTC` keeps JDBC persistence in UTC.

The retained legacy database `production_cmms_v1` and marker `PERF-KEEPLOAD0903` must not be removed. The UTC validation database is `production_cmms_utc_v1`. The large-data generator accepts `-BusinessTimeZone` on PowerShell or `CMMS_TIME_ZONE` on Bash and sets the PostgreSQL session timezone for date-sensitive generated values.

See [performance-data-generator/README.md](performance-data-generator/README.md) for generation, exact-count verification, concurrent k6 execution, and guarded cleanup commands. Do not run cleanup for a retained `KEEPLOADUTC...` dataset.

## Validation

```powershell
cd cmms_back_end
mvn clean install

cd ..\cmms_front_end
npm test
npm run build
```

The test suites cover fixed clocks, strict UTC parsing, multiple zones, DST day boundaries, frontend datetime-local round trips, server drift, and source guards against page-level clock/formatter usage.
