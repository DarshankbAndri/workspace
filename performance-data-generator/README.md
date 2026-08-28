# CMMS large-volume performance data generator

This PostgreSQL bulk loader creates a connected CMMS staging dataset suitable for large-table and concurrent-user testing. The default run creates exactly:

| Dataset | Rows |
| --- | ---: |
| Sites | 100 |
| Employees | 5,000 |
| Equipment | 50,000 |
| Maintenance requests | 100,000 |
| Maintenance assignments | 100,000 |
| Assignment work logs | 500,000 |
| Equipment downtime records | 100,000 |
| Spare-part transactions | 100,000 |

It also creates 100 spare parts, 10,000 site-stock rows, and one site assignment per employee so the requested records have valid foreign-key relationships.

Every run is isolated by a unique marker such as `PERF-CLIENTLOAD01`. The generator verifies all requested row counts before committing. If generation fails, PostgreSQL rolls back the data transaction.

## Safety requirements

- Use only an approved staging/performance database. Never run this against production.
- Take and test a PostgreSQL backup before generation.
- Stop the Spring Boot application during generation if scheduled jobs could modify the new rows.
- Allow at least 5 GB of free database disk space for this default dataset, indexes, temporary work, and WAL. Keep 30% free space after loading.
- Use a database account that can `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE TABLE`, `CREATE TEMP TABLE`, and `ANALYZE` in the CMMS schema.
- The machine running the script needs network access to PostgreSQL. Frontend credentials such as `superadmin` are not database credentials.

The loader writes directly to PostgreSQL for speed, so it intentionally bypasses REST/UI validation and notification workflows. It is for performance-volume preparation, not functional testing.

## Dependencies

1. A CMMS database updated with the repository's current Liquibase migrations.
2. PostgreSQL command-line tools (`psql` 13 or newer recommended).
3. PowerShell 5.1+ on Windows, or Bash on Linux/macOS.

### Install `psql` on Windows

Install the PostgreSQL command-line tools using one of these methods:

```powershell
winget install PostgreSQL.PostgreSQL
```

Or use the official PostgreSQL Windows installer and select **Command Line Tools**. Reopen PowerShell, then verify:

```powershell
psql --version
```

If Windows cannot find `psql`, add the PostgreSQL `bin` directory, for example `C:\Program Files\PostgreSQL\17\bin`, to `PATH`.

### Install `psql` on Ubuntu/Debian

```bash
sudo apt-get update
sudo apt-get install postgresql-client
psql --version
```

## Generate the default dataset on Windows

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

`psql` prompts for the database password. Do not put the password in the script or commit it to GitHub.

To use different counts, pass parameters such as `-Equipment 75000` or `-WorkLogs 750000`. The defaults already match the requested targets.

## Verify exact counts

```powershell
.\verify.ps1 `
  -RunId 'CLIENTLOAD01' `
  -DbHost 'YOUR_POSTGRESQL_HOST' `
  -Database 'YOUR_CMMS_DATABASE' `
  -DbUser 'YOUR_DATABASE_USER'
```

The command prints expected and actual counts with `PASS` or `FAIL` and returns a non-zero exit code if any count is wrong.

## Run the concurrent-user test

After verification passes, restart the application and run the k6 suite:

```powershell
cd ..\performance-tests
.\run.ps1 -Profile smoke -BaseUrl 'http://YOUR_SERVER:6200/api' -Username 'superadmin' -AllowInsecureHttp
.\run.ps1 -Profile load  -BaseUrl 'http://YOUR_SERVER:6200/api' -Username 'superadmin' -AllowInsecureHttp
```

Run `smoke` before `load`. Do not start the 100-user test while PostgreSQL is still running `ANALYZE` or while generation is in progress.

## Delete one generated run

Cleanup requires the same run ID twice to reduce accidental deletion risk:

```powershell
cd ..\performance-data-generator
.\cleanup.ps1 `
  -RunId 'CLIENTLOAD01' `
  -ConfirmRunId 'CLIENTLOAD01' `
  -DbHost 'YOUR_POSTGRESQL_HOST' `
  -Database 'YOUR_CMMS_DATABASE' `
  -DbUser 'YOUR_DATABASE_USER'
```

The cleanup transaction selects rows through the run's marker and foreign-key relationships. It does not reset identity sequences. It refuses to proceed if application users were manually attached to generated employees. If cleanup finds other manually created relationships, the foreign-key error rolls back the whole cleanup; remove those test relationships and rerun.

Uploaded files are not created by this loader. If users later upload documents against generated equipment or work logs, remove the corresponding physical staging files separately after database cleanup.

## Linux/macOS commands

```bash
cd performance-data-generator
chmod +x run.sh
CMMS_DB_HOST='YOUR_POSTGRESQL_HOST' \
CMMS_DB_NAME='YOUR_CMMS_DATABASE' \
CMMS_DB_USER='YOUR_DATABASE_USER' \
./run.sh generate CLIENTLOAD01

./run.sh verify CLIENTLOAD01

CONFIRM_RUN_ID='CLIENTLOAD01' ./run.sh cleanup CLIENTLOAD01
```

The optional count environment variables are listed in `run.sh`. The PostgreSQL password can be supplied by a secure `.pgpass` file or entered when `psql` prompts; do not store it in the repository.

## Recommended execution resources

For the default roughly one-million-row load, start with 4 CPU cores and 8 GB RAM for PostgreSQL, SSD/NVMe storage, and at least 5 GB free disk space. A larger database host (8 cores and 16 GB RAM) will complete the bulk load and index maintenance faster. These are loader prerequisites, not proof of application concurrency; production sizing must use the k6 results plus server CPU, memory, connection-pool, and disk measurements.
