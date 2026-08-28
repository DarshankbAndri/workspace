#!/usr/bin/env bash
set -euo pipefail

PROFILE="${1:-smoke}"
BASE_URL="${BASE_URL:-http://localhost:6200/api}"
CMMS_USERNAME="${CMMS_USERNAME:-superadmin}"

if ! command -v k6 >/dev/null 2>&1; then
  echo "k6 is not installed. See README.md for installation instructions." >&2
  exit 2
fi

if [[ -z "${CMMS_PASSWORD:-}" ]]; then
  read -r -s -p "CMMS password: " CMMS_PASSWORD
  echo
fi

mkdir -p "$(dirname "$0")/reports"
timestamp="$(date +%Y%m%d-%H%M%S)"

export PROFILE BASE_URL CMMS_USERNAME CMMS_PASSWORD
export ALLOW_INSECURE_HTTP="${ALLOW_INSECURE_HTTP:-false}"
export REPORT_PATH="reports/${PROFILE}-${timestamp}-summary.json"

cd "$(dirname "$0")"
k6 run cmms-load-test.js
unset CMMS_PASSWORD

