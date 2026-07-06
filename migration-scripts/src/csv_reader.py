"""CSV reading and validation helpers.

Uses pandas to read files, then normalises every cell to a trimmed string (empty
cells -> None) so downstream payload building is predictable. Also provides
cross-file validation so dependency columns (equipment.siteCode, etc.) are
checked against their parent CSV before any API call is made.
"""

import os

import pandas as pd


class CsvValidationError(Exception):
    """Raised for structural problems: missing file, empty file, missing columns."""


def read_rows(path: str, required_columns=None):
    """Read a CSV into a list of dict rows (all values str or None).

    Raises CsvValidationError for a missing/empty file or missing required columns.
    """
    if not os.path.isfile(path):
        raise CsvValidationError(f"CSV file not found: {path}")

    try:
        df = pd.read_csv(path, dtype=str, keep_default_na=False, na_values=[""])
    except pd.errors.EmptyDataError as exc:
        raise CsvValidationError(f"CSV file is empty (no header): {path}") from exc
    except Exception as exc:  # malformed CSV, encoding issues, ...
        raise CsvValidationError(f"Failed to parse CSV {path}: {exc}") from exc

    # Normalise column names and check required columns.
    df.columns = [str(c).strip() for c in df.columns]
    if required_columns:
        missing = [c for c in required_columns if c not in df.columns]
        if missing:
            raise CsvValidationError(
                f"{os.path.basename(path)} is missing required column(s): {', '.join(missing)}"
            )

    if df.empty:
        raise CsvValidationError(f"CSV file has a header but no data rows: {path}")

    rows = []
    for _, record in df.iterrows():
        row = {}
        for key, value in record.items():
            if value is None or (isinstance(value, float) and pd.isna(value)) or pd.isna(value):
                row[key] = None
            else:
                text = str(value).strip()
                row[key] = text if text != "" else None
        rows.append(row)
    return rows


def check_required_values(row: dict, required_columns) -> list:
    """Return a list of column names that are required but blank in this row."""
    return [c for c in (required_columns or []) if not row.get(c)]


def validate_datasets(files_config, resolve_path, logger) -> list:
    """Cross-file validation before migration.

    Verifies, for every file that declares ``depends_on``, that each referenced
    code exists in the parent file, and that ``unique_fields`` have no blanks or
    duplicates. Returns a list of human-readable problem strings (empty == clean).
    Missing/unparseable files are reported but do not abort validation.
    """
    problems = []
    # First pass: collect the set of code values available in each namespace.
    code_sets = {}          # namespace -> set(codes) e.g. "site" -> {MIG-SITE-001, ...}
    rows_by_file = {}

    for name, cfg in files_config.items():
        path = resolve_path(cfg["path"])
        try:
            rows = read_rows(path, cfg.get("required_columns"))
        except CsvValidationError as exc:
            problems.append(f"[{name}] {exc}")
            continue
        rows_by_file[name] = rows

        register_as = cfg.get("register_as")
        code_field = cfg.get("code_field")
        if register_as and code_field:
            code_sets[register_as] = {r.get(code_field) for r in rows if r.get(code_field)}

    # Second pass: unique fields + dependency references.
    for name, cfg in files_config.items():
        rows = rows_by_file.get(name)
        if rows is None:
            continue

        # Unique / non-empty business keys within the file.
        for field in cfg.get("unique_fields", []):
            seen = {}
            for idx, row in enumerate(rows, start=1):
                val = row.get(field)
                if not val:
                    # Only flag a blank unique field if the column is also required.
                    if field in cfg.get("required_columns", []):
                        problems.append(f"[{name}] row {idx}: required unique field '{field}' is empty")
                    continue
                if val in seen:
                    problems.append(
                        f"[{name}] duplicate value '{val}' for unique field '{field}' "
                        f"(rows {seen[val]} and {idx})"
                    )
                else:
                    seen[val] = idx

        # Dependency references must exist in the parent namespace.
        for dep_field, namespace in cfg.get("depends_on", {}).items():
            available = code_sets.get(namespace, set())
            required = dep_field in cfg.get("required_columns", [])
            for idx, row in enumerate(rows, start=1):
                val = row.get(dep_field)
                if not val:
                    if required:
                        problems.append(f"[{name}] row {idx}: required reference '{dep_field}' is empty")
                    continue
                if val not in available:
                    problems.append(
                        f"[{name}] row {idx}: {dep_field}='{val}' not found among "
                        f"{namespace} records in the source CSVs"
                    )

    if problems:
        logger.warning("Dataset validation found %d issue(s).", len(problems))
    else:
        logger.info("Dataset validation passed: all references and unique keys look good.")
    return problems
