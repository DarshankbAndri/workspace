#!/usr/bin/env bash
set -euo pipefail

mode="${1:-}"
run_id="${2:-}"

if [[ ! "$mode" =~ ^(generate|verify|cleanup)$ ]]; then
  echo "Usage: $0 <generate|verify|cleanup> <run-id>" >&2
  exit 2
fi
if [[ ! "$run_id" =~ ^[A-Za-z0-9_-]{1,20}$ ]]; then
  echo 'Run ID must contain 1-20 letters, numbers, underscores, or hyphens.' >&2
  exit 2
fi
if ! command -v psql >/dev/null 2>&1; then
  echo 'psql was not found. Install the PostgreSQL client tools first.' >&2
  exit 127
fi

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
db_host="${CMMS_DB_HOST:-localhost}"
db_port="${CMMS_DB_PORT:-5432}"
db_name="${CMMS_DB_NAME:-cmms_db}"
db_user="${CMMS_DB_USER:-postgres}"
connection=(--host "$db_host" --port "$db_port" --dbname "$db_name" --username "$db_user")

case "$mode" in
  generate)
    psql "${connection[@]}" --file "$script_dir/sql/generate-large-data.sql" \
      --set "run_id=$run_id" \
      --set "site_count=${CMMS_SITE_COUNT:-100}" \
      --set "employee_count=${CMMS_EMPLOYEE_COUNT:-5000}" \
      --set "equipment_count=${CMMS_EQUIPMENT_COUNT:-50000}" \
      --set "request_count=${CMMS_REQUEST_COUNT:-100000}" \
      --set "assignment_count=${CMMS_ASSIGNMENT_COUNT:-100000}" \
      --set "work_log_count=${CMMS_WORK_LOG_COUNT:-500000}" \
      --set "downtime_count=${CMMS_DOWNTIME_COUNT:-100000}" \
      --set "spare_transaction_count=${CMMS_SPARE_TRANSACTION_COUNT:-100000}" \
      --set "spare_part_count=${CMMS_SPARE_PART_COUNT:-100}"
    ;;
  verify)
    psql "${connection[@]}" --file "$script_dir/sql/verify-large-data.sql" --set "run_id=$run_id"
    ;;
  cleanup)
    confirm_run_id="${CONFIRM_RUN_ID:-}"
    if [[ "$confirm_run_id" != "$run_id" ]]; then
      echo 'Set CONFIRM_RUN_ID to the exact run ID before cleanup. No data was deleted.' >&2
      exit 2
    fi
    psql "${connection[@]}" --file "$script_dir/sql/cleanup-large-data.sql" --set "run_id=$run_id"
    ;;
esac
