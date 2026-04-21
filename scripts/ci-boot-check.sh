#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${1:?Usage: ci-boot-check.sh <app-dir>}"
BACKEND_LOG="$(mktemp)"
FRONTEND_LOG="$(mktemp)"
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null || true
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT

# Sentry init is a no-op with a well-formed but fake DSN — backend won't crash.
export SENTRY_DSN="${SENTRY_DSN:-https://public@o0.ingest.sentry.io/0}"
export NEXT_PUBLIC_BACKEND_URL="${NEXT_PUBLIC_BACKEND_URL:-http://localhost:3001}"
export NEXT_TELEMETRY_DISABLED=1

echo "Starting backend (pnpm dev)..."
(cd "$APP_DIR/reference-app/backend" && pnpm dev) >"$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

echo "Starting frontend (pnpm dev)..."
(cd "$APP_DIR/reference-app/frontend" && pnpm dev) >"$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!

# Poll url for up to $timeout seconds. Both servers start concurrently so
# frontend gets to warm up while we wait for the (fast) backend.
wait_for() {
  local url="$1"
  local label="$2"
  local timeout="${3:-30}"
  local end=$((SECONDS + timeout))
  printf "Waiting for %s " "$label"
  while [ "$SECONDS" -lt "$end" ]; do
    if curl -sf --max-time 2 "$url" >/dev/null 2>&1; then
      echo "✓"
      return 0
    fi
    printf "."
    sleep 1
  done
  echo "✗ (no response within ${timeout}s)"
  return 1
}

FAILED=0
wait_for "http://localhost:3001/api/health" "backend"  30 || FAILED=1
wait_for "http://localhost:3000/api/health" "frontend" 30 || FAILED=1

if [ "$FAILED" -ne 0 ]; then
  echo ""
  echo "=== backend log ==="
  cat "$BACKEND_LOG"
  echo ""
  echo "=== frontend log ==="
  cat "$FRONTEND_LOG"
  exit 1
fi

echo "Both services healthy."
