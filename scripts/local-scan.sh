#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./scripts/local-scan.sh <github-repo-url> [--branch <branch>] [--output <dir>] [--keep-clone]

Examples:
  ./scripts/local-scan.sh "https://github.com/jfrog/frogbot.git"
  ./scripts/local-scan.sh "https://github.com/jfrog/frogbot.git" --branch main --output ./demo-output

Notes:
  - Runs scan-only commands: `jf audit` and `jf scan .`
  - Does NOT upload artifacts to Artifactory
EOF
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command not found: $1" >&2
    exit 1
  fi
}

REPO_URL=""
BRANCH=""
OUTPUT_ROOT="./scan-output"
KEEP_CLONE="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch)
      if [[ $# -lt 2 ]]; then
        echo "Error: --branch requires a value." >&2
        usage
        exit 1
      fi
      BRANCH="$2"
      shift 2
      ;;
    --output)
      if [[ $# -lt 2 ]]; then
        echo "Error: --output requires a value." >&2
        usage
        exit 1
      fi
      OUTPUT_ROOT="$2"
      shift 2
      ;;
    --keep-clone)
      KEEP_CLONE="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      if [[ -z "$REPO_URL" ]]; then
        REPO_URL="$1"
        shift
      else
        echo "Error: unexpected argument: $1" >&2
        usage
        exit 1
      fi
      ;;
  esac
done

if [[ -z "$REPO_URL" ]]; then
  echo "Error: github-repo-url is required." >&2
  usage
  exit 1
fi

require_command git
require_command jf

mkdir -p "$OUTPUT_ROOT"
OUTPUT_ROOT="$(cd "$OUTPUT_ROOT" && pwd)"

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
REPO_NAME="$(basename "$REPO_URL")"
REPO_NAME="${REPO_NAME%.git}"
RUN_DIR="${OUTPUT_ROOT}/${REPO_NAME}-${TIMESTAMP}"
CLONE_DIR="${RUN_DIR}/repo"

mkdir -p "$RUN_DIR"
LOG_FILE="${RUN_DIR}/run.log"

log() {
  printf '[%s] %s\n' "$(date +%Y-%m-%dT%H:%M:%S%z)" "$*" | tee -a "$LOG_FILE"
}

log "Starting scan-only demo run."
log "Repository URL: ${REPO_URL}"
log "Output directory: ${RUN_DIR}"
log "Commands used: jf audit, jf scan ."

if [[ -n "${BRANCH}" ]]; then
  log "Cloning branch '${BRANCH}'..."
  git clone --depth 1 --branch "${BRANCH}" "${REPO_URL}" "${CLONE_DIR}" >>"$LOG_FILE" 2>&1
else
  log "Cloning repository default branch..."
  git clone --depth 1 "${REPO_URL}" "${CLONE_DIR}" >>"$LOG_FILE" 2>&1
fi

if [[ ! -d "${CLONE_DIR}" ]]; then
  log "Clone failed. See ${LOG_FILE} for details."
  exit 1
fi

pushd "${CLONE_DIR}" >/dev/null

log "Running SCA scan: jf audit --format=json"
set +e
jf audit --format=json >"${RUN_DIR}/audit.json" 2>"${RUN_DIR}/audit.stderr.log"
AUDIT_EXIT=$?
set -e
log "jf audit exit code: ${AUDIT_EXIT}"

log "Running source/filesystem scan: jf scan . --format=json"
set +e
jf scan . --format=json >"${RUN_DIR}/scan.json" 2>"${RUN_DIR}/scan.stderr.log"
SCAN_EXIT=$?
set -e
log "jf scan exit code: ${SCAN_EXIT}"

popd >/dev/null

cat >"${RUN_DIR}/summary.txt" <<EOF
Scan summary
============
Repository: ${REPO_URL}
Branch: ${BRANCH:-default}
Run directory: ${RUN_DIR}

Commands executed:
- jf audit --format=json
- jf scan . --format=json

Exit codes:
- jf audit: ${AUDIT_EXIT}
- jf scan .: ${SCAN_EXIT}

Notes:
- Non-zero exit codes can indicate policy violations or findings.
- This script does not run any artifact upload or build publish commands.
EOF

if [[ "${KEEP_CLONE}" != "true" ]]; then
  rm -rf "${CLONE_DIR}"
  log "Removed cloned repository directory (use --keep-clone to retain it)."
else
  log "Retained cloned repository directory (--keep-clone enabled)."
fi

log "Scan run completed."
log "Artifacts:"
log " - ${RUN_DIR}/audit.json"
log " - ${RUN_DIR}/scan.json"
log " - ${RUN_DIR}/summary.txt"
log " - ${RUN_DIR}/run.log"

# Keep success semantics for demo execution. Findings are captured in output files.
exit 0
