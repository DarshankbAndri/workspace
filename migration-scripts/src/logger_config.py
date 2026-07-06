"""Logging setup for the migration utility.

Creates a run-scoped logger that writes to both the console and a timestamped
file under ``logs/``. Passwords and Authorization headers are never logged by
the application code (see auth_client / api_client).
"""

import logging
import os


def setup_logger(logs_dir: str, run_timestamp: str) -> logging.Logger:
    """Configure and return the shared 'migration' logger.

    :param logs_dir: absolute path to the logs directory (created if missing)
    :param run_timestamp: e.g. ``20260706-141530`` used in the log file name
    """
    os.makedirs(logs_dir, exist_ok=True)
    log_path = os.path.join(logs_dir, f"migration-{run_timestamp}.log")

    logger = logging.getLogger("migration")
    logger.setLevel(logging.DEBUG)
    logger.handlers.clear()          # avoid duplicate handlers on re-run
    logger.propagate = False

    file_formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
    )
    console_formatter = logging.Formatter("%(levelname)-7s %(message)s")

    file_handler = logging.FileHandler(log_path, encoding="utf-8")
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(file_formatter)

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(console_formatter)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    logger.info("Log file: %s", log_path)
    return logger
