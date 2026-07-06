"""Orchestrates the end-to-end migration.

Flow:
  1. Optionally pre-load existing sites/vendors (GET) into the id registry so
     child references resolve on re-runs.
  2. Cross-file dataset validation (references + unique keys).
  3. For each entity in configured order: read CSV, build payload, POST (unless
     dry-run), record the outcome, and register the created id for children.

Every processed row produces a result record used for both the log and the CSV
report. The registry maps a namespace ("site"/"vendor") to {code: id}.
"""

import csv
import os

from api_client import ApiClient, ApiError
from csv_reader import read_rows, check_required_values, validate_datasets, CsvValidationError
from payload_builder import build_payload, ReferenceResolutionError

# Result constants (also the report's "result" column values).
SUCCESS = "SUCCESS"
FAILED = "FAILED"
SKIPPED = "SKIPPED"
DRY_RUN = "DRY_RUN"


class MigrationRunner:
    def __init__(self, api: ApiClient, config: dict, resolve_path, logger):
        self.api = api
        self.config = config
        self.resolve_path = resolve_path
        self.logger = logger
        self.migration_cfg = config.get("migration", {})
        self.files_cfg = config.get("files", {})
        self.dry_run = bool(self.migration_cfg.get("dry_run", False))
        self.stop_on_error = bool(self.migration_cfg.get("stop_on_error", False))
        self.registry = {}          # namespace -> {code: id}
        self.results = []           # list of result dicts
        self._aborted = False

    # -- registry -----------------------------------------------------------
    def _register(self, namespace, code, entity_id):
        if not namespace or not code or entity_id is None:
            return
        self.registry.setdefault(namespace, {})[code] = entity_id

    def _preload_existing(self):
        """GET existing parent records so equipment/employees resolve on re-runs."""
        for name, cfg in self.files_cfg.items():
            namespace = cfg.get("register_as")
            list_api = cfg.get("list_api")
            code_field = cfg.get("code_field")
            if not (namespace and list_api and code_field):
                continue
            try:
                status, body = self.api.get(list_api)
            except ApiError as exc:
                self.logger.warning("Preload GET %s failed: %s", list_api, exc)
                continue
            if status != 200:
                self.logger.warning("Preload GET %s returned HTTP %s (skipping).", list_api, status)
                continue
            data = ApiClient.extract_data(body)
            if not isinstance(data, list):
                continue
            count = 0
            for item in data:
                if isinstance(item, dict):
                    code = item.get(code_field)
                    entity_id = item.get("id")
                    if code and entity_id is not None:
                        self._register(namespace, code, entity_id)
                        count += 1
            if count:
                self.logger.info("Preloaded %d existing %s record(s) from %s.", count, namespace, list_api)

    # -- reporting ----------------------------------------------------------
    def _record(self, file_name, row_number, entity_name, api_path, status_code, result, message):
        self.results.append({
            "file": file_name,
            "rowNumber": row_number,
            "entityName": entity_name,
            "api": api_path,
            "statusCode": status_code if status_code is not None else "",
            "result": result,
            "message": (message or "").replace("\n", " ").strip(),
        })

    # -- per entity ---------------------------------------------------------
    def _process_entity(self, entity_name):
        cfg = self.files_cfg.get(entity_name)
        if not cfg:
            self.logger.warning("No file config for '%s' - skipping.", entity_name)
            return

        path = self.resolve_path(cfg["path"])
        api_path = cfg["api"]
        file_name = os.path.basename(path)
        namespace = cfg.get("register_as")
        code_field = cfg.get("code_field")
        required = cfg.get("required_columns", [])

        self.logger.info("=" * 68)
        self.logger.info("Processing '%s' from %s -> %s", entity_name, file_name, api_path)

        try:
            rows = read_rows(path, required)
        except CsvValidationError as exc:
            self.logger.error("Cannot process '%s': %s", entity_name, exc)
            self._record(file_name, 0, entity_name, api_path, None, FAILED, str(exc))
            if self.stop_on_error:
                self._aborted = True
            return

        for idx, row in enumerate(rows, start=1):
            if self._aborted:
                self._record(file_name, idx, entity_name, api_path, None, SKIPPED, "Run aborted earlier")
                continue

            code_value = row.get(code_field) if code_field else None

            # Row-level required-value check.
            missing = check_required_values(row, required)
            if missing:
                msg = f"missing required value(s): {', '.join(missing)}"
                self.logger.error("[%s row %d] FAILED - %s", file_name, idx, msg)
                self._record(file_name, idx, entity_name, api_path, None, FAILED, msg)
                if self.stop_on_error:
                    self._aborted = True
                continue

            # Build payload (resolves references).
            try:
                payload = build_payload(entity_name, row, self.registry)
            except ReferenceResolutionError as exc:
                self.logger.error("[%s row %d] FAILED - %s", file_name, idx, exc)
                self._record(file_name, idx, entity_name, api_path, None, FAILED, str(exc))
                if self.stop_on_error:
                    self._aborted = True
                continue

            self.logger.debug("[%s row %d] payload: %s", file_name, idx, payload)

            # Dry run: never call the API.
            if self.dry_run:
                self.logger.info("[%s row %d] DRY_RUN %s (%s)", file_name, idx, code_value or "", api_path)
                self._record(file_name, idx, entity_name, api_path, None, DRY_RUN, "dry-run: payload built, not sent")
                continue

            # Real call.
            try:
                status_code, body = self.api.post(api_path, payload)
            except ApiError as exc:
                self.logger.error("[%s row %d] FAILED - %s", file_name, idx, exc)
                self._record(file_name, idx, entity_name, api_path, None, FAILED, str(exc))
                if self.stop_on_error:
                    self._aborted = True
                continue

            if 200 <= status_code < 300:
                data = ApiClient.extract_data(body)
                new_id = data.get("id") if isinstance(data, dict) else None
                if namespace and code_value:
                    self._register(namespace, code_value, new_id)
                msg = f"created id={new_id}" if new_id is not None else "created"
                self.logger.info("[%s row %d] SUCCESS %s -> %s", file_name, idx, code_value or "", msg)
                self._record(file_name, idx, entity_name, api_path, status_code, SUCCESS, msg)
            else:
                msg = ApiClient.extract_message(body)
                self.logger.error("[%s row %d] FAILED HTTP %s - %s", file_name, idx, status_code, msg)
                self._record(file_name, idx, entity_name, api_path, status_code, FAILED, msg)
                if self.stop_on_error:
                    self._aborted = True

    # -- public entry -------------------------------------------------------
    def run(self):
        order = self.migration_cfg.get("order") or list(self.files_cfg.keys())

        if self.dry_run:
            self.logger.info("DRY RUN mode is ON - no data will be written to the backend.")

        if self.migration_cfg.get("preload_existing", True) and not self.dry_run:
            self._preload_existing()
        elif self.dry_run:
            # In dry-run we still want references to resolve; preload if we can.
            self._preload_existing()

        # Cross-file validation (advisory; issues are logged, run continues).
        problems = validate_datasets(self.files_cfg, self.resolve_path, self.logger)
        for p in problems:
            self.logger.warning("VALIDATION: %s", p)

        for entity_name in order:
            if self._aborted:
                self.logger.warning("Run aborted (stop_on_error=true). Remaining entities skipped.")
                break
            self._process_entity(entity_name)

        return self.results

    # -- report file --------------------------------------------------------
    def write_report(self, reports_dir, run_timestamp):
        os.makedirs(reports_dir, exist_ok=True)
        report_path = os.path.join(reports_dir, f"migration-report-{run_timestamp}.csv")
        columns = ["file", "rowNumber", "entityName", "api", "statusCode", "result", "message"]
        with open(report_path, "w", newline="", encoding="utf-8") as fh:
            writer = csv.DictWriter(fh, fieldnames=columns)
            writer.writeheader()
            for r in self.results:
                writer.writerow(r)
        return report_path

    def summary(self):
        counts = {SUCCESS: 0, FAILED: 0, SKIPPED: 0, DRY_RUN: 0}
        for r in self.results:
            counts[r["result"]] = counts.get(r["result"], 0) + 1
        counts["TOTAL"] = len(self.results)
        return counts
