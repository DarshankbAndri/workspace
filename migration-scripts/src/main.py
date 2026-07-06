"""Entry point for the CMMS CSV -> API migration utility.

Usage:
    python src/main.py [--config config/config.yaml]

Reads config, logs in to the backend, and migrates every configured CSV by
calling the existing backend REST APIs. Writes a run log under logs/ and a CSV
summary report under reports/. Exit code is 0 when nothing failed, else 1.
"""

import argparse
import os
import sys
from datetime import datetime

import yaml

# Allow running as "python src/main.py" from the project root.
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from logger_config import setup_logger          # noqa: E402
from api_client import ApiClient                 # noqa: E402
from auth_client import login, AuthError         # noqa: E402
from migration_runner import MigrationRunner     # noqa: E402


def load_config(config_path):
    if not os.path.isfile(config_path):
        raise FileNotFoundError(f"Config file not found: {config_path}")
    with open(config_path, "r", encoding="utf-8") as fh:
        try:
            config = yaml.safe_load(fh)
        except yaml.YAMLError as exc:
            raise ValueError(f"Invalid YAML in {config_path}: {exc}") from exc
    if not isinstance(config, dict):
        raise ValueError(f"Config root must be a mapping: {config_path}")
    for section in ("backend", "migration", "files"):
        if section not in config:
            raise ValueError(f"Config is missing required section: '{section}'")
    return config


def resolve_path_factory(root):
    """Return a function that resolves config-relative paths against the project root."""
    def resolve(path):
        return path if os.path.isabs(path) else os.path.join(root, path)
    return resolve


def main():
    parser = argparse.ArgumentParser(description="CMMS CSV-to-API migration utility")
    parser.add_argument(
        "--config",
        default=os.path.join(PROJECT_ROOT, "config", "config.yaml"),
        help="Path to config.yaml (default: config/config.yaml)",
    )
    args = parser.parse_args()

    run_timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    logs_dir = os.path.join(PROJECT_ROOT, "logs")
    reports_dir = os.path.join(PROJECT_ROOT, "reports")
    logger = setup_logger(logs_dir, run_timestamp)

    logger.info("CMMS migration started at %s", datetime.now().isoformat(timespec="seconds"))

    # --- config -----------------------------------------------------------
    try:
        config = load_config(args.config)
    except (FileNotFoundError, ValueError) as exc:
        logger.error("Configuration error: %s", exc)
        return 2

    backend = config["backend"]
    migration = config["migration"]
    base_url = backend.get("base_url", "http://localhost:4200")
    login_url = backend.get("login_url", "/api/auth/login")
    username = backend.get("username")
    password = backend.get("password")
    timeout = int(migration.get("timeout_seconds", 30))
    dry_run = bool(migration.get("dry_run", False))

    resolve_path = resolve_path_factory(PROJECT_ROOT)
    api = ApiClient(base_url=base_url, timeout_seconds=timeout, logger=logger)

    # --- login ------------------------------------------------------------
    if not username or not password:
        logger.error("Configuration error: backend.username and backend.password are required.")
        return 2
    try:
        token = login(api, login_url, username, password, logger)
        api.set_token(token)
    except AuthError as exc:
        logger.error("Authentication failed: %s", exc)
        logger.error("Aborting migration - cannot proceed without a valid token.")
        return 1

    # --- run --------------------------------------------------------------
    runner = MigrationRunner(api, config, resolve_path, logger)
    try:
        runner.run()
    except KeyboardInterrupt:
        logger.warning("Interrupted by user - writing partial report ...")

    # --- report -----------------------------------------------------------
    report_path = runner.write_report(reports_dir, run_timestamp)
    counts = runner.summary()

    logger.info("=" * 68)
    logger.info("MIGRATION SUMMARY  (mode: %s)", "DRY RUN" if dry_run else "LIVE")
    logger.info("  Total rows processed : %d", counts.get("TOTAL", 0))
    logger.info("  SUCCESS              : %d", counts.get("SUCCESS", 0))
    logger.info("  FAILED               : %d", counts.get("FAILED", 0))
    logger.info("  SKIPPED              : %d", counts.get("SKIPPED", 0))
    logger.info("  DRY_RUN              : %d", counts.get("DRY_RUN", 0))
    logger.info("Report written to: %s", report_path)
    logger.info("CMMS migration finished at %s", datetime.now().isoformat(timespec="seconds"))

    return 1 if counts.get("FAILED", 0) > 0 else 0


if __name__ == "__main__":
    sys.exit(main())
