# QHDT Team Member Web Application

## 📌 Overview

The QHDT (Queen's Hyperloop Design Team) Team Member Web Application is a full-stack platform for team management, communication, and project tracking. A React SPA (Tailwind + Headless UI) talks to a Django REST Framework backend over token-authenticated JSON endpoints, with team-scoped permissions for memos and timeline events.

## 🗂️ Project Architecture

```
QHDT-TeamMember-WebApp/
├── backend/            # Django 5 + DRF API
│   ├── core/           # project settings, URL root, shared permissions
│   ├── users/          # custom AUTH_USER_MODEL (email-as-username)
│   ├── teams/          # Team model + team endpoints
│   ├── memos/          # Memo model (FK → Team) + viewset
│   ├── timeline/       # Timeline events (FK → Team) + viewset
│   └── posts/          # global announcements
├── frontend/           # React 18 SPA (CRA) + Tailwind + Headless UI
│   ├── src/ui/         # shared primitives (Button, Input, Alert, Card, Dialog, Menu, Spinner)
│   ├── src/AppShell.jsx
│   ├── src/api.js      # axios instance + auth/401 interceptors
│   └── ...             # page components (SignIn, Register, Main, Team, Timeline, AdminTeams, …)
├── script.sh           # one-shot bootstrap: migrate, seed admin+teams, launch servers
├── run.sh              # day-to-day: launch backend + frontend in two Terminal windows
├── changes.md          # running log of refactors
└── understanding.md    # deep architectural notes for engineers / LLMs
```

## ⚙️ Technology Stack

### Frontend
- **React 18** via Create React App
- **Tailwind CSS 3** + `@tailwindcss/forms` for styling
- **Headless UI** (`@headlessui/react`) for accessible Dialog/Menu/Transition primitives
- **Heroicons** (`@heroicons/react`) for iconography
- **Inter** via `@fontsource/inter`
- **Axios** for HTTP, with a request interceptor that attaches `Authorization: Token <key>` and a response interceptor that clears auth state and redirects to `/login` on 401
- **React Router v6** for client-side routing
- No MUI, no Emotion, no Redux — local React state only

### Backend
- **Python 3**, **Django 5**, **Django REST Framework**
- **`rest_framework.authtoken`** for token-based auth
- **Custom `AUTH_USER_MODEL`** (`users.User`) using email as the username field
- **SQLite** (dev); drop-in replaceable with PostgreSQL via `DATABASES`
- **CORS** enabled for `http://localhost:3000` via `django-cors-headers`

## 🚀 Setup

### Option A — one-shot (recommended for first run)
Wipes the SQLite DB, regenerates migrations, seeds an admin + four teams + eight members with starter data, prints the admin credentials, and opens the backend + frontend in two new Terminal windows:

```bash
./script.sh
```

### Option B — day-to-day
Assumes setup is done. Applies any pending migrations, installs frontend deps only if `node_modules` is missing, then launches both servers:

```bash
./run.sh
```

### Option C — manual
```bash
# 1. Backend
cd backend
pip3 install django djangorestframework django-cors-headers
python3 manage.py migrate
python3 manage.py createsuperuser  # or use ./script.sh to seed
python3 manage.py runserver         # http://127.0.0.1:8000

# 2. Frontend (separate terminal)
cd frontend
cp .env.example .env                # sets REACT_APP_API_URL
npm install
npm start                           # http://localhost:3000
```

## 🔐 Authentication flow

1. User posts `email` + `password` to `POST /api/signup/` (with a `team` invite code matching a Team's `bio`) or `POST /api/login/`.
2. Backend returns `{ ...user, token }` where `token` is DRF's `authtoken.Token` key.
3. Frontend stores the result in `localStorage.userInfo` via `UserContext`.
4. The shared `axios` client (`frontend/src/api.js`) injects `Authorization: Token <key>` on every subsequent request via a request interceptor.
5. Any 401 response triggers the response interceptor — `localStorage` is cleared and the user is redirected to `/login`.

Admins (`is_staff=True`) bypass the `IsSameTeam` permission and see all teams via `/admin/teams`.

## 🧪 Tests

```bash
cd backend
python3 manage.py test users memos timeline
```

17 tests cover:
- Signup/login/logout round-trip + token issuance
- Invalid team bio → `400` (not `404`) with helpful message
- `IsSameTeam` permission across Memo + Timeline (list scoping, cross-team 404 to prevent ID sniffing, forbidden cross-team creates)
- End-to-end signup → authenticated memo create
- Staff bypass

No frontend tests yet; verification is manual.

## 🌐 API surface (selected)

| Method | Path                           | Purpose                          |
| ------ | ------------------------------ | -------------------------------- |
| POST   | `/api/signup/`                 | Create user + issue token        |
| POST   | `/api/login/`                  | Authenticate + return token      |
| POST   | `/api/logout/`                 | Delete the caller's token        |
| GET    | `/api/list_teams/`             | List teams (all for staff)       |
| POST   | `/api/search_team/`            | Fetch a team by `bio`            |
| GET    | `/api/memos/`                  | List memos (scoped to caller)    |
| POST   | `/api/memos/`                  | Create memo for own team         |
| GET    | `/api/timeline/`               | List events (scoped)             |
| POST   | `/api/timeline/`               | Create event for own team        |
| GET    | `/api/posts/`                  | Global announcements             |

`REACT_APP_API_URL` controls the frontend base URL (see `frontend/.env.example`). CORS is open to `http://localhost:3000`.

## 🧑‍💻 Further reading

- [`understanding.md`](understanding.md) — architectural deep-dive (auth model, permission strategy, data relationships, frontend composition)
- [`changes.md`](changes.md) — running log of refactors and bugfixes

## 📝 To-Do

- Real CSRF / token-rotation story for production
- Frontend tests (React Testing Library) for SignIn, Register, Team flows
- Dockerize for CI/CD
- WebSocket-based live memo updates

## 👤 Author

**Alex Lester** — Queen's University, Computer Engineering
