# QHDT Auth + Data Integrity Refactor — Changes

A full rundown of what changed, why, and where.

---

## 1. Authentication — custom token → DRF `TokenAuthentication`

**Why:** `users.User` was a plain `models.Model` storing a 15-digit random string in a `token` field. No password hashing lifecycle, no Django auth integration, no way to plug in DRF permissions.

### `backend/users/models.py` — rewritten
- `User` now extends `AbstractBaseUser` + `PermissionsMixin`.
- `email` is the `USERNAME_FIELD` (unique).
- Removed the custom `token` field (replaced by `rest_framework.authtoken.Token`).
- Removed the `team` CharField (team membership already lives on `Team.users` M2M; a `team` property is kept as a shortcut returning `self.teams.first()`).
- Added `is_active`, `is_staff`.

### `backend/users/managers.py` — new
- `UserManager(BaseUserManager)` with `create_user` / `create_superuser` that normalize email and call `set_password`.

### `backend/core/settings.py`
- `AUTH_USER_MODEL = "users.User"`.
- `REST_FRAMEWORK` default auth → `TokenAuthentication`, default permission → `IsAuthenticated`.

### `backend/users/api/views.py` — rewritten
- `signup`: validates email/password, looks up `Team.objects.get(bio=...)`, calls `User.objects.create_user(...)`, adds user to team, returns `{user, token}`.
- `login`: uses `django.contrib.auth.authenticate(username=email, password=...)` + `Token.objects.get_or_create`.
- `logout` (new): deletes the caller's token; `IsAuthenticated` only.
- `test_token` deleted — `TokenAuthentication` validates tokens automatically.

### `backend/users/api/serializers.py`
- Dropped `password` and `token` from exposed fields.
- `team` is now a `SerializerMethodField` returning the team's name (for frontend display only).

### `backend/core/api/urls.py`
- Removed `test_token/`; added `logout/`.

---

## 2. `IsSameTeam` permission

**Why:** prior to this, any authenticated request could read or mutate any team's data.

### `backend/core/permissions.py` — new
```python
class IsSameTeam(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        team_id = getattr(obj, "team_id", None)
        return team_id is not None and request.user.teams.filter(id=team_id).exists()
```

### `backend/memos/api/views.py` and `backend/timeline/api/views.py`
- Applied `permission_classes = [IsAuthenticated, IsSameTeam]`.
- `get_queryset()` filters to `team__in=request.user.teams.all()` so list endpoints never leak other teams' rows.
- `perform_create()` raises `PermissionDenied` if the payload's `team` isn't one of the caller's teams.
- Removed the hand-rolled `create_memo` / `delete_memo` / `create_timeline_entry` / `delete_timeline_entry` custom actions — stock `ModelViewSet` verbs replace them.

---

## 3. Data integrity — Memo & Timeline ForeignKeys

**Why:** `Memo.team` was `CharField` and `Timeline.team` was `TextField`, duplicating information already modeled by `Team`. Team also had an explicit `memos` M2M, which was redundant with a proper reverse FK.

### `backend/memos/models.py`
- `team = models.ForeignKey("teams.Team", related_name="memos", on_delete=CASCADE)` replaces the CharField.

### `backend/timeline/models.py`
- `team = models.ForeignKey("teams.Team", related_name="timeline_events", on_delete=CASCADE)` replaces the TextField.
- `date = models.DateField()` replaces `date = TextField()`.

### `backend/teams/models.py`
- Dropped the redundant `Team.memos` M2M (reverse FK `team.memos_set`, renamed to `team.memos` via `related_name`, replaces it).
- `users` M2M now uses `settings.AUTH_USER_MODEL` instead of a direct import.

### `backend/memos/api/serializers.py` and `backend/timeline/api/serializers.py`
- `team` is now a writable PK field.
- Added `team_name = SerializerMethodField()` returning `obj.team.name` for the frontend.

### `backend/teams/api/serializers.py`
- Added `id` to exposed fields so the frontend can pass team id when creating memos.

---

## 4. Database + migrations

**Why:** `AUTH_USER_MODEL` cannot be swapped on a populated database. The schema changes on Memo/Timeline/Team also needed a clean slate.

- Deleted `backend/db.sqlite3`.
- Deleted every app's old migration (kept `__init__.py`):
  - `users/migrations/0001_initial.py`, `0002_user_token.py`
  - `memos/migrations/0001_initial.py`
  - `timeline/migrations/0001_initial.py`
  - `teams/migrations/0001..0004_*.py`
- Regenerated via `python3 manage.py makemigrations users teams memos timeline posts`.
- Ran `migrate` cleanly. `rest_framework.authtoken` tables are created alongside.

---

## 5. Frontend — shared axios client

**Why:** the React app used native `fetch()` everywhere with no shared config, and nothing was attaching an `Authorization` header. axios was already installed but unused.

### `frontend/src/api.js` — new
- `axios.create({ baseURL: process.env.REACT_APP_API_URL })`.
- Request interceptor: reads `localStorage.userInfo`, pulls `token`, sets `Authorization: Token <key>` on every request.
- Response interceptor: on `401`, clears `localStorage.userInfo` and bounces the user to `/sign-in`.

### Migrated from `fetch()` to the new client
- `frontend/src/SignIn.js` — `POST login/` via `api.post`.
- `frontend/src/App.js` — `search_team/`, `get_user/`, `get_memo/` all go through `api`. `Team` component now also receives `id` so it can post memo creates with a team id.
- `frontend/src/Team.js` — `createMemo` → `POST /memos/` with `{title, body, team: id}`; `deletePost` → looks up memo id from the current list by title and issues `DELETE /memos/:id/`.
- `frontend/src/Timeline.js` — `GET /timeline/` via `api`; the team column now renders `row.team_name` (id is a number now).
- `frontend/src/Main.js` — `GET /posts/` via `api`.
- `frontend/src/AdminPage.js` — posts/timeline creates and deletes all via `api`; the timeline admin form now takes a team id instead of a team name, and deletes look up the id by title.

---

## 6. Tests

**Why:** both a unit harness for the new permission and an end-to-end check of signup → login → authenticated request were in scope.

### `backend/memos/tests.py` — new `IsSameTeamMemoTests` (`APITestCase`)
- Unauthenticated list → 401.
- Same-team list returns only the caller's memos.
- Cross-team detail → 404 (filtered queryset, not 403 — that's deliberate to avoid leaking existence).
- Same-team detail → 200 and `team_name` is populated.
- Cross-team create → 403.
- Cross-team delete → 404.

### `backend/timeline/tests.py` — new `IsSameTeamTimelineTests`
- Same four coverage points for `Timeline`.

### `backend/users/tests.py` — new `AuthFlowTests`
- `signup` → 201, token returned, user is added to team, password actually hashes.
- `signup` with an unknown team bio → 404.
- `login` returns the same token that was issued at signup.
- `login` with a bad password → 401.
- **End-to-end**: signup → unauthenticated `GET /memos/` is 401 → garbage token is 401 → real token successfully `POST /memos/` with 201 and a populated `team_name`.

### Result
```
Ran 16 tests in 3.84s — OK
```

---

## 6a. Follow-up: signup validation + 401 redirect target

**Why:** two tightening changes after the initial refactor landed.

### Signup rejects invalid team bios with `400` (was `404`)
`backend/users/api/views.py`:
- Missing `team` field → `400 {"error": "Team bio is required"}`.
- Unknown bio → `400 {"error": "Invalid team bio '<value>'. No team with that bio exists."}`.
- No orphan `User` row is created on failure (validation happens before `create_user`).

`backend/users/tests.py`:
- `test_signup_with_unknown_team_rejected` now asserts `400` + message content + that no user was persisted.
- New `test_signup_without_team_bio_rejected` covers the missing-field case.

### 401 interceptor now redirects to `/login`
`frontend/src/api.js`:
- Response interceptor's redirect target changed from `/sign-in` → `/login`.
- Pathname guard still prevents redirect loops when the 401 originates on the login page itself.

`frontend/src/App.js`:
- Added `<Route path="/login" element={<SignIn />} />`. Kept `/sign-in` as an alias so `Main.js`'s existing `navigate('/sign-in')` continues to work.

### IsSameTeam on Memos — returns 404 (not 403) for cross-team GETs
No code change needed; confirming behavior:
- `MemoViewSet.get_queryset()` filters to the caller's teams before DRF's `get_object_or_404()` runs, so a memo ID that belongs to another team looks indistinguishable from a deleted one — no ID sniffing.
- The object-level `has_object_permission` check on `IsSameTeam` is still there as a second layer of defense if a future change bypasses the queryset filter.
- `test_cross_team_detail_not_found` in `memos/tests.py` pins this to 404.

---

## 6b. Follow-up: Register UI + env config

**Why:** the frontend had no signup UI (backend `/api/signup/` existed but only SignIn was wired up), and base URL handling needed documenting for new contributors.

### `frontend/src/Register.js` — new
- MUI form mirroring `SignIn.js` (Avatar, TextFields, primary button, same theme).
- Posts to `signup/` via the shared `api` client.
- Error handling mapped to the backend's 400 shapes:
  - If the response's `error` string contains `"team bio"` (matches `"Invalid team bio '<value>'..."` and `"Team bio is required"`), renders `<Alert severity="error">` above the form AND flips the Team Invite Code `TextField` into error state with the message as helper text.
  - Other 400s → generic `<Alert severity="error">`.
  - Network / 5xx → fallback "Something went wrong" alert.
- On success stores `{...user, token}` in `UserContext` and navigates to `/`.
- Includes a `Link` to `/login` for returning users.

### `frontend/src/App.js`
- Added `<Route path="/register" element={<Register />} />`.

### Env config
- `frontend/.env` already held `REACT_APP_API_URL=http://127.0.0.1:8000/api/` and `api.js` already reads `process.env.REACT_APP_API_URL` — CRA picks up `REACT_APP_*` at build time natively, so no webpack/build change was needed.
- Verified no hardcoded `http://` / `localhost` / `127.0.0.1` strings remain in `frontend/src/*.js`.
- **Added `frontend/.env.example`** — committed template documenting the one required variable and calling out that the trailing slash matters (it's the axios `baseURL`).

---

## 6c. Follow-up: Admin cross-team access + bootstrap script

**Why:** admins need to see and manage every team, and local onboarding should be one command.

### Backend — staff bypass
- `backend/core/permissions.py` — `IsSameTeam.has_object_permission` returns `True` for `request.user.is_staff` (short-circuits the team check).
- `backend/memos/api/views.py` + `backend/timeline/api/views.py` — `get_queryset()` returns all rows for staff; `perform_create()` lets staff post to any team and explicitly raises if no team is supplied.
- `backend/users/api/serializers.py` — `is_staff` is now included in the serialized user, so the React client can gate admin UI off the login/signup response.
- `backend/memos/tests.py` — new `test_staff_sees_all_teams` pins the admin list bypass.

### Backend — list_teams endpoint
- `backend/teams/api/views.py` — new `list_teams` api_view returning `[{id, name, title, bio}]`. Staff see every team; regular users see only their own.
- `backend/core/api/urls.py` — registered at `GET /api/list_teams/`.

### Frontend — admin UI
- `frontend/src/AdminTeams.js` (new) — `/admin/teams`. MUI `Grid` of `Card` + `CardActionArea` tiles, one per team, showing name, invite code, and title. Non-admin visits get redirected to `/`.
- `frontend/src/AdminTeamView.js` (new) — `/admin/team/:bio`. Reads `:bio` from the URL, calls `search_team/` + hydrates `users`/`memos` in parallel via `Promise.all`, then renders the existing `<Team>` component so admins get the member-facing layout for any team.
- `frontend/src/Header.js` — added an "All Teams" drawer entry gated on `userInfo.is_staff`.
- `frontend/src/App.js` — wired `/admin/teams` and `/admin/team/:bio` routes.

### `script.sh` (new, project root)
One-command local bootstrap.

What it does:
1. Wipes `backend/db.sqlite3` and regenerable migration files.
2. Pip-installs Django/DRF/corsheaders (idempotent, quiet).
3. `makemigrations` + `migrate`.
4. Seeds via `manage.py shell`:
   - **Admin**: `admin@qhdt.test` / `Quentin Admin` / `adminpass123!` (`is_staff=is_superuser=True`).
   - **4 teams**: Rescue Alpha, Rescue Bravo, Support Charlie, Training Delta — each with a distinct `bio` invite code.
   - **8 member users** distributed across the teams, shared password `memberpass123!`.
   - One starter memo and timeline event per team so the admin view isn't empty.
5. Prints a banner with the admin email/name/password.
6. Spawns **two new Terminal.app windows** via `osascript`:
   - Backend: `python3 manage.py runserver` in `backend/`.
   - Frontend: `npm install --silent && npm start` in `frontend/`.

**Fix applied after first run:** the initial version tried to set the Terminal tab title by emitting `\033]0;<title>\007` inside the `do script` string. AppleScript doesn't interpret those escapes and raised `syntax error: Expected “"” but found unknown token. (-2741)` at the second `osascript` call. The title-setting sequence has been removed — each spawned window simply `echo`s a `[QHDT backend]` / `[QHDT frontend]` banner as its first command.

Run it:
```bash
./script.sh
```

---

## 6d. Frontend redesign — Tailwind + Headless UI

**Why:** the UI leaned on bespoke CSS (12 files, ~400 lines) layered over MUI. Styling was inconsistent across pages and the visual language felt dated. Direction chosen: minimal + corporate, persistent left sidebar on desktop + drawer on mobile, light-only, MUI stripped entirely in favor of `@headlessui/react` (accessible Dialog/Menu/Transition) and `@heroicons/react`.

### Build + dependencies

**Added** (`frontend/package.json`):
- `tailwindcss`, `postcss`, `autoprefixer`, `@tailwindcss/forms` (dev)
- `@headlessui/react`, `@heroicons/react`
- `@fontsource/inter`, `clsx`

**Removed:**
- `@mui/material`, `@mui/icons-material`, `@mui/x-charts`, `@emotion/react`, `@emotion/styled`.

New files:
- `frontend/tailwind.config.js` — `content: ['./src/**/*.{js,jsx}']`, `fontFamily.sans` remapped to Inter, `brand.amber = #FFBF00` kept as optional accent, `@tailwindcss/forms` plugin for form resets.
- `frontend/postcss.config.js` — standard Tailwind + autoprefixer pipeline (CRA 5 auto-runs it).
- `frontend/src/index.css` — replaced with `@tailwind base/components/utilities` plus a `@layer base` that sets slate-50 bg + slate-900 text + antialiasing.
- `frontend/src/index.js` — imports Inter weights 400/500/600/700 from `@fontsource/inter`.

### UI primitives (`frontend/src/ui/*`)

Tiny class-variant components so pages stay readable:
- `Button.jsx` — `variant` = primary/secondary/ghost/danger × `size` = sm/md/lg.
- `Input.jsx` — label + helper + error-ring-on-invalid composition.
- `Alert.jsx` — `severity` = error/info/success with a Heroicon + colored left tint.
- `Card.jsx` — `rounded-xl border border-slate-200 bg-white shadow-sm` baseline.
- `Dialog.jsx` — Headless UI `Dialog` + `Transition` with fade/scale panel animation.
- `Menu.jsx` — Headless UI `Menu` wrapper used by the account dropdown.
- `Spinner.jsx` — border-spin replacement for `CircularProgress`.

### Layout shell

`frontend/src/AppShell.jsx` (new) wraps every authenticated route:
- `md+`: `grid grid-cols-[16rem_1fr]` with a sticky `h-screen` sidebar on the left.
- `< md`: sidebar hidden; hamburger in the top bar opens a Headless UI `Dialog` sliding in from the left (`translate-x-full → translate-x-0`).
- Active route highlight via `NavLink` (`bg-slate-100 text-slate-900` for active, `text-slate-600 hover:bg-slate-50` otherwise).
- Admin-only nav entries gated on `userInfo.is_staff` and `userInfo.type === 'Admin'` (unchanged from the backend contract).
- Top bar contains initials-avatar account menu with Sign out (replaces `AccountMenu.js`).

`Header.js` + `AccountMenu.js` were deleted — their responsibilities moved into `AppShell`.

### Rewritten pages (MUI + `.css` imports removed from each)

- `SignIn.js`, `Register.js`, `NotFound.js` — centered card layout (`grid min-h-screen place-items-center`). Register keeps the invalid-team-bio flow: Alert at the top + red ring on the team invite input.
- `Main.js` — announcement cards with date pill top-right, empty state, spinner while loading.
- `Team.js` — `grid grid-cols-1 lg:grid-cols-[2fr_1fr]`, announcements left / members right. Create + delete memo dialogs use the `<Dialog>` primitive; API calls unchanged.
- `TeamHeader.js` — banner with name, description, optional invite-code chip.
- `Person.js` — flex row with initials bubble, name, role label.
- `Timeline.js` — Tailwind `<table>` on `sm+`, `<Card>` stack below `sm`; `team_name` column preserved.
- `AdminTeams.js` — responsive 3-col card grid, hover lift, invite-code chip, whole card is a router `<Link>`.
- `AdminTeamView.js` — loading/error via `<Spinner>`/`<Alert>`, hands off to `<Team>`.
- `AdminPage.js` — two cards (Announcements, Timeline) each with a create/delete pair, toast-style `<Alert>` feedback that auto-dismisses after 3s.
- `Admin.js` — thin admin gate around `AdminPage`.
- `Copyright.js` — minimal slate footer.

### Routing (`App.js`)
- Public routes (`/login`, `/sign-in`, `/register`, `*`) render without the shell.
- All authenticated routes (`/`, `/timeline`, `/team/:bio`, `/admin`, `/admin/teams`, `/admin/team/:bio`) are wrapped in `<AppShell>`.
- New `MyTeamRoute` helper loads the current user's team by bio so the sidebar "My Team" link works on hard refreshes.

### Deletions
- `frontend/src/Header.js`, `frontend/src/AccountMenu.js`, `frontend/src/Authentication.js`.
- Every per-component CSS file: `App.css`, `Admin.css`, `AdminPage.css`, `Copyright.css`, `Header.css`, `Main.css`, `NotFound.css`, `Person.css`, `Team.css`, `TeamHeader.css`, `Timeline.css`.

### Verification

- `npm run build` → compiled successfully, **110.7 KB** JS + **7.5 KB** CSS gzipped.
- `grep -rn "@mui\\|@emotion\\|from '\\./.*\\.css" frontend/src` → 0 matches.
- `python3 manage.py test users memos timeline` → **17/17** passing (no backend change).

---

## 6e. Bugfix: router URL prefix

**Why:** after the Tailwind rewrite, creating announcements (Admin), timeline events (Admin), and team memos (Team page) all failed silently. Everything else worked.

**Root cause:** `backend/core/api/urls.py:39` mounted the DRF router as `path('/', include(router.urls))`. Combined with the outer `path('api/', include('core.api.urls'))`, the effective prefix became `api/` + `/` → `/api//...` (double slash after `api`). The router's viewsets were registered at `/api//memos/`, `/api//timeline/`, `/api//posts/`.

The old `fetch` strings (`${REACT_APP_API_URL}/memos/create_memo/`) accidentally worked because `REACT_APP_API_URL` ends in `/api/` and the template prepended another `/` — the two slashes collapsed into the `//` the router was looking for. Axios's `combineURLs(baseURL, url)` normalizes slashes (strips trailing `/` from baseURL, leading `/` from url, joins with a single `/`), so every axios call resolved to `/api/memos/` (single slash) and 404'd.

Backend tests didn't catch it because `APITestCase` uses `reverse('memo-list')`, which follows the internal URL graph rather than issuing a literal HTTP path.

**Fix:** `path('/', ...)` → `path('', ...)`. Router now lives at the clean `/api/` prefix. `reverse('memo-list')` returns `/api/memos/`, matching what axios sends.

**Files touched:**
- `backend/core/api/urls.py` — single-character fix.

---

## 7. Files touched

```
backend/core/permissions.py                    (new)
backend/core/settings.py
backend/core/api/urls.py
backend/users/models.py
backend/users/managers.py                      (new)
backend/users/api/views.py
backend/users/api/serializers.py
backend/users/tests.py
backend/memos/models.py
backend/memos/api/views.py
backend/memos/api/serializers.py
backend/memos/tests.py
backend/timeline/models.py
backend/timeline/api/views.py
backend/timeline/api/serializers.py
backend/timeline/tests.py
backend/teams/models.py
backend/teams/api/serializers.py
backend/db.sqlite3                             (deleted and regenerated)
backend/users/migrations/*                     (regenerated)
backend/memos/migrations/*                     (regenerated)
backend/timeline/migrations/*                  (regenerated)
backend/teams/migrations/*                     (regenerated)

frontend/src/api.js                            (new)
frontend/src/Register.js                       (new)
frontend/src/AdminTeams.js                     (new)
frontend/src/AdminTeamView.js                  (new)
frontend/src/AppShell.jsx                      (new)
frontend/src/ui/Button.jsx                     (new)
frontend/src/ui/Input.jsx                      (new)
frontend/src/ui/Alert.jsx                      (new)
frontend/src/ui/Card.jsx                       (new)
frontend/src/ui/Dialog.jsx                     (new)
frontend/src/ui/Menu.jsx                       (new)
frontend/src/ui/Spinner.jsx                    (new)
frontend/tailwind.config.js                    (new)
frontend/postcss.config.js                     (new)
frontend/.env.example                          (new)
frontend/src/SignIn.js
frontend/src/App.js
frontend/src/Team.js
frontend/src/TeamHeader.js
frontend/src/Timeline.js
frontend/src/Main.js
frontend/src/Person.js
frontend/src/Admin.js
frontend/src/AdminPage.js
frontend/src/NotFound.js
frontend/src/Copyright.js
frontend/src/index.js
frontend/src/index.css

frontend/src/Header.js                         (deleted)
frontend/src/AccountMenu.js                    (deleted)
frontend/src/Authentication.js                 (deleted)
frontend/src/*.css (per-component)             (deleted)

script.sh                                      (new)
run.sh                                         (new)
```

---

## 8. How to verify locally

```bash
# Backend
cd backend
python3 manage.py migrate
python3 manage.py createsuperuser           # create admin
python3 manage.py test users memos timeline # 15 tests pass
python3 manage.py runserver

# Then in /admin/, create one or two Team rows with distinct `bio` values.

# Frontend
cd ../frontend
npm install
npm start
# Sign up against one of the team bios → network tab shows
# `Authorization: Token <key>` on every call after login.
# Manually corrupt localStorage.userInfo.token and reload → you're bounced to /sign-in.
```
