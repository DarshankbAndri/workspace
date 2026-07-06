# CMMS Data Migration Utility

A standalone **Python** utility that migrates master data into the CMMS system by
calling the **existing backend REST APIs**. It never touches the database
directly — it logs in, obtains a JWT, reads CSV files, builds payloads that match
the backend DTOs, and POSTs each row.

It lives **outside** both `cmms_front_end` and `cmms_back_end` and does not modify
either of them.

---

## What it does

1. Logs in via `POST /api/auth/login` and reads the JWT from the response.
2. Reads CSV files from `data/`.
3. Validates required columns, unique keys, and cross-file references.
4. Builds JSON payloads that match the backend DTOs.
5. Calls the configured insert APIs with `Authorization: Bearer <token>`.
6. Logs every row (success/failure) to `logs/`.
7. Writes a summary report to `reports/`.

Entities are processed in dependency order — **sites → vendors → employees →
equipment** — so that code-based references (a vendor's site, an equipment item's
site/vendor) can be resolved to the numeric IDs the backend expects.

---

## APIs used (verified against `cmms_back_end`)

The backend runs on port **4200** with a servlet context-path of `/api`, so every
path already includes `/api`.

| Entity    | Method | Endpoint            | DTO           |
|-----------|--------|---------------------|---------------|
| Login     | POST   | `/api/auth/login`   | `LoginRequest` → `LoginResponse` (token at `data.token`) |
| Sites     | POST   | `/api/hr/sites`     | `SiteDTO`     |
| Vendors   | POST   | `/api/vendors`      | `VendorDTO`   |
| Employees | POST   | `/api/hr/employees` | `EmployeeDTO` |
| Equipment | POST   | `/api/equipment`    | `EquipmentDTO`|

Key DTO facts the payload builder handles automatically:

- **Vendor** uses a boolean `active` (mapped from the CSV `status` column) and
  **requires at least one site assignment** — the CSV `siteCode` is resolved to a
  `siteId` and sent as `siteAssignments`.
- **Equipment** requires a numeric `siteId` (resolved from `siteCode`) and an
  optional `vendorId` (resolved from `vendorCode`). CSV columns use the DTO names
  `modelNumber` / `serialNumber`.
- **Employee** optionally accepts a `siteCode` + `roleName`, which become a
  `siteAssignments` entry.

---

## Folder structure

```text
migration-scripts/
  config/config.yaml        # backend URL, credentials, file/endpoint mapping
  data/                     # source CSV files (10 sample rows each)
    sites.csv  vendors.csv  employees.csv  equipment.csv
  logs/                     # per-run log files (generated)
  reports/                  # per-run CSV summary reports (generated)
  src/
    main.py                 # entry point
    auth_client.py          # login + token extraction
    api_client.py           # HTTP + ApiResponse envelope helpers
    csv_reader.py           # CSV reading + validation
    payload_builder.py      # CSV row -> DTO payload, reference resolution
    migration_runner.py     # orchestration, per-row processing, reporting
    logger_config.py        # logging setup
  requirements.txt
  README.md
```

---

## Setup

Requires Python 3.9+.

```bash
cd migration-scripts

# create and activate a virtual environment (recommended)
python -m venv .venv
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Windows (Git Bash):
source .venv/Scripts/activate
# macOS / Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

---

## Configure

Edit `config/config.yaml`:

```yaml
backend:
  base_url: "http://localhost:4200"
  login_url: "/api/auth/login"
  username: "superadmin"     # seeded admin; default password is "andritz"
  password: "andritz"

migration:
  order: [sites, vendors, employees, equipment]
  stop_on_error: false       # true -> abort on the first failed row
  dry_run: false             # true -> build & print payloads, never call the API
  timeout_seconds: 30
  preload_existing: true     # GET existing sites/vendors so references resolve on re-runs
```

---

## Run

Make sure the CMMS backend is running, then from the `migration-scripts` folder:

```bash
python src/main.py
```

Optional custom config path:

```bash
python src/main.py --config config/config.yaml
```

### Dry run (no data written)

Set in `config/config.yaml`:

```yaml
migration:
  dry_run: true
```

Then run `python src/main.py`. Payloads are built, validated and logged, but no
API calls are made (report rows show `DRY_RUN`).

### Actual migration

```yaml
migration:
  dry_run: false
```

Then run `python src/main.py`.

---

## Output

- **Log:** `logs/migration-YYYYMMDD-HHMMSS.log` — start time, login result, each
  file/row, payload (debug), API URL, response status and message. Passwords and
  bearer tokens are never logged.
- **Report:** `reports/migration-report-YYYYMMDD-HHMMSS.csv` with columns:

  ```text
  file,rowNumber,entityName,api,statusCode,result,message
  ```

  `result` is one of `SUCCESS`, `FAILED`, `SKIPPED`, `DRY_RUN`.

The process exit code is `0` when no row failed, `1` if any row failed, and `2`
for a configuration error.

---

## Sample data

Each CSV in `data/` ships with **10 realistic sample rows** using a `MIG-` prefix
on all unique codes (`MIG-SITE-001`, `MIG-VEN-001`, `MIG-EMP-001`, `MIG-EQ-001`,
…) so the sample data is easy to identify and does not collide with the built-in
demo seed data. Referential integrity across the CSVs is guaranteed:

- every `equipment.siteCode` and `vendor.siteCode` exists in `sites.csv`;
- every `equipment.vendorCode` exists in `vendors.csv`;
- every `employee.siteCode` exists in `sites.csv`.

These references are re-checked at runtime by the cross-file validator before any
API call is made.

---

## Error handling

The utility handles and clearly reports:

- missing / empty CSV file, missing required column;
- blank required or unique values, duplicate unique values within a file;
- unresolved cross-file references (e.g. an unknown `siteCode`);
- login failure (bad credentials / unreachable server / missing token);
- API timeouts and connection errors;
- `400` validation errors, `401/403` token issues, and server errors — the
  standard `message` / `details` / `code` fields are read from the response.

With `stop_on_error: false` (default) a failed row is logged and the run
continues; with `stop_on_error: true` the run aborts and remaining rows are
marked `SKIPPED`.

Re-running is safe: `preload_existing` loads already-created sites/vendors so
child records still resolve their references, and rows whose unique code already
exists simply report a `FAILED` "already exists" result without stopping the run.

---

## Adding more entities

1. Add a CSV under `data/` with a header row.
2. Add an entry under `files:` in `config.yaml` (path, api, method, code_field,
   required_columns, and any `depends_on` references).
3. Add the entity name to `migration.order`.
4. If the payload needs special mapping or reference resolution, add a builder in
   `src/payload_builder.py` and register it in `BUILDERS`; otherwise all non-empty
   columns are sent as-is.
```
