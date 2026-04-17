#!/usr/bin/env bash
# Bootstrap the QHDT Member Management app:
#   - wipe + re-migrate the SQLite dev DB
#   - seed an admin + several teams, each with a handful of general members
#   - print the admin credentials
#   - open two new Terminal windows running the backend and frontend dev servers
#
# Usage: ./script.sh
# Requires: python3, pip3, npm, macOS Terminal.app (for the `osascript` tab spawn).

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

ADMIN_EMAIL="admin@qhdt.test"
ADMIN_PASSWORD="adminpass123!"
ADMIN_FIRST="Quentin"
ADMIN_LAST="Admin"

MEMBER_PASSWORD="memberpass123!"

echo "==> Wiping dev database and regenerating migrations"
cd "$BACKEND_DIR"
rm -f db.sqlite3
find users memos timeline teams posts -path "*/migrations/*.py" \
  ! -name "__init__.py" -delete 2>/dev/null || true
find users memos timeline teams posts -path "*/migrations/__pycache__" \
  -type d -exec rm -rf {} + 2>/dev/null || true

echo "==> Installing backend deps (idempotent)"
pip3 install --break-system-packages --quiet django djangorestframework django-cors-headers >/dev/null

echo "==> makemigrations + migrate"
python3 manage.py makemigrations users teams memos timeline posts >/dev/null
python3 manage.py migrate >/dev/null

echo "==> Seeding admin, teams, and members"
python3 manage.py shell <<PYEOF
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from teams.models import Team
from memos.models import Memo
from timeline.models import Timeline
from datetime import date

User = get_user_model()

# --- Admin ---
admin, _ = User.objects.update_or_create(
    email="${ADMIN_EMAIL}",
    defaults={
        "first_name": "${ADMIN_FIRST}",
        "last_name": "${ADMIN_LAST}",
        "type": "Admin",
        "is_staff": True,
        "is_superuser": True,
    },
)
admin.set_password("${ADMIN_PASSWORD}")
admin.save()
Token.objects.get_or_create(user=admin)

# --- Teams ---
team_specs = [
    ("Rescue Alpha",    "First-response search & rescue squad.",  "alpha-invite"),
    ("Rescue Bravo",    "Coastal patrol and marine assistance.",   "bravo-invite"),
    ("Support Charlie", "Logistics, comms, and field support.",    "charlie-invite"),
    ("Training Delta",  "Cadet training and readiness drills.",    "delta-invite"),
]
teams = {}
for name, title, bio in team_specs:
    t, _ = Team.objects.update_or_create(
        bio=bio, defaults={"name": name, "title": title},
    )
    teams[bio] = t

# --- Members ---
member_specs = [
    ("alice.smith@qhdt.test",   "Alice",   "Smith",   "Member",  "alpha-invite"),
    ("ben.jones@qhdt.test",     "Ben",     "Jones",   "Member",  "alpha-invite"),
    ("carla.nguyen@qhdt.test",  "Carla",   "Nguyen",  "Member",  "bravo-invite"),
    ("derek.ofori@qhdt.test",   "Derek",   "Ofori",   "Member",  "bravo-invite"),
    ("elena.park@qhdt.test",    "Elena",   "Park",    "Member",  "charlie-invite"),
    ("farhan.ali@qhdt.test",    "Farhan",  "Ali",     "Member",  "charlie-invite"),
    ("gina.rossi@qhdt.test",    "Gina",    "Rossi",   "Member",  "delta-invite"),
    ("hector.lee@qhdt.test",    "Hector",  "Lee",     "Cadet",   "delta-invite"),
]
for email, fn, ln, typ, bio in member_specs:
    u, _ = User.objects.update_or_create(
        email=email,
        defaults={"first_name": fn, "last_name": ln, "type": typ},
    )
    u.set_password("${MEMBER_PASSWORD}")
    u.save()
    teams[bio].users.add(u)
    Token.objects.get_or_create(user=u)

# --- A starter memo and timeline event per team ---
for bio, t in teams.items():
    Memo.objects.get_or_create(
        title=f"Welcome to {t.name}",
        defaults={"body": "Kickoff memo for the team.", "team": t},
    )
    Timeline.objects.get_or_create(
        title=f"{t.name} — first muster",
        defaults={"description": "Initial muster and gear check.",
                  "team": t, "date": date.today()},
    )

print(f"Seeded {Team.objects.count()} teams, {User.objects.count()} users.")
PYEOF

cat <<BANNER

=====================================================================
  Admin credentials
  ---------------------------------------------------------------
  Email    : ${ADMIN_EMAIL}
  Name     : ${ADMIN_FIRST} ${ADMIN_LAST}
  Password : ${ADMIN_PASSWORD}

  Member password (any seeded member, e.g. alice.smith@qhdt.test):
             ${MEMBER_PASSWORD}
=====================================================================

BANNER

launch_terminal_tab() {
  local cmd="$1"
  osascript <<OSA >/dev/null
tell application "Terminal"
  activate
  do script "${cmd}"
end tell
OSA
}

echo "==> Launching backend (http://127.0.0.1:8000) in a new Terminal window"
launch_terminal_tab "cd '$BACKEND_DIR' && echo '[QHDT backend]' && python3 manage.py runserver"

echo "==> Launching frontend (http://localhost:3000) in a new Terminal window"
launch_terminal_tab "cd '$FRONTEND_DIR' && echo '[QHDT frontend]' && npm install --silent && npm start"

echo "==> Done. Two Terminal windows should now be running the servers."
