#!/usr/bin/env bash
# Start the QHDT Member Management app for local development.
#
# Assumes setup is already done (db.sqlite3 exists, npm deps installed).
# For a fresh setup + seed data, use ./script.sh instead.
#
# Opens two new macOS Terminal windows:
#   - backend: http://127.0.0.1:8000
#   - frontend: http://localhost:3000
#
# Usage: ./run.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

if [[ ! -d "$BACKEND_DIR" || ! -d "$FRONTEND_DIR" ]]; then
  echo "error: expected backend/ and frontend/ next to run.sh" >&2
  exit 1
fi

# Apply any pending migrations quietly (safe on an already-migrated DB).
echo "==> Applying pending migrations (if any)"
(cd "$BACKEND_DIR" && python3 manage.py migrate --noinput >/dev/null)

# Install frontend deps only if node_modules is missing.
if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  echo "==> Installing frontend dependencies (first run)"
  (cd "$FRONTEND_DIR" && npm install --silent)
fi

launch_terminal_window() {
  local cmd="$1"
  osascript <<OSA >/dev/null
tell application "Terminal"
  activate
  do script "${cmd}"
end tell
OSA
}

echo "==> Launching backend  (http://127.0.0.1:8000) in a new Terminal window"
launch_terminal_window "cd '$BACKEND_DIR' && echo '[QHDT backend]' && python3 manage.py runserver"

echo "==> Launching frontend (http://localhost:3000)  in a new Terminal window"
launch_terminal_window "cd '$FRONTEND_DIR' && echo '[QHDT frontend]' && npm start"

echo "==> Both servers starting. Close their Terminal windows to stop."
