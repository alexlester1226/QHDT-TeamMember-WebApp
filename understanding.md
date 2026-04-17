# Comprehensive System Architecture & Codebase Deep Dive

For Senior Software Engineers and LLMs reviewing, contributing to, or refactoring this project. Assumes familiarity with Django REST Framework and modern React.

---

## 1. System shape

A decoupled monolith: Django REST Framework serves JSON, a CRA-based React SPA consumes it. There is no session cookie, no CSRF, no server-side rendering — the frontend is stateless against the backend except for the DRF `authtoken` string it carries in `Authorization: Token <key>`.

Domain: members of the Queen's Hyperloop Design Team (QHDT) grouped by `Team`, with team-scoped **memos** and **timeline events**, plus global **posts** (announcements). Staff users (`is_staff=True`) have cross-team visibility.

---

## 2. Backend (`backend/`)

### 2.1 `core/` (project root)

- **`settings.py`**
  - `AUTH_USER_MODEL = "users.User"` — the project replaces Django's default User with a custom `AbstractBaseUser` subclass (see §2.2).
  - `INSTALLED_APPS` includes `rest_framework`, `rest_framework.authtoken`, `corsheaders`, and the five domain apps (`users`, `teams`, `memos`, `timeline`, `posts`).
  - `REST_FRAMEWORK`:
    ```python
    DEFAULT_AUTHENTICATION_CLASSES = ['rest_framework.authentication.TokenAuthentication']
    DEFAULT_PERMISSION_CLASSES     = ['rest_framework.permissions.IsAuthenticated']
    ```
    So **every endpoint requires a valid token by default**; public views (`signup`, `login`) override with `@permission_classes([AllowAny])`.
  - `CORS_ALLOWED_ORIGINS = ['http://localhost:3000']`.

- **`core/api/urls.py`** — master URL router.
  - Mounts a DRF `DefaultRouter` at `path('', include(router.urls))` (critical: empty prefix, not `/`, to avoid the double-slash bug documented in `changes.md §6e`).
  - The router wires `MemoViewSet`, `TimelineViewSet`, `PostViewSet` under `/api/memos/`, `/api/timeline/`, `/api/posts/`.
  - Named function views for auth/team helpers: `login/`, `signup/`, `logout/`, `list_teams/`, `search_team/`, `create_team/`, `get_user/`, `get_memo/`.

- **`core/permissions.py`** — `IsSameTeam(BasePermission)`:
  ```python
  def has_permission(self, request, view):
      return bool(request.user and request.user.is_authenticated)

  def has_object_permission(self, request, view, obj):
      if request.user.is_staff:
          return True
      team_id = getattr(obj, "team_id", None)
      return team_id is not None and request.user.teams.filter(id=team_id).exists()
  ```
  Used on Memo + Timeline viewsets. The object-level check is defence-in-depth — the primary scoping comes from `get_queryset()`, which returns `Memo.objects.filter(team__in=request.user.teams.all())` for regular users (staff see all). This means **cross-team GETs return `404`, not `403`**, preventing ID sniffing: an attacker can't distinguish "this memo belongs to another team" from "this memo doesn't exist."

### 2.2 `users/`

- **`users/models.py`** — the User model is a custom `AbstractBaseUser` + `PermissionsMixin`:
  ```python
  class User(AbstractBaseUser, PermissionsMixin):
      email      = models.EmailField(unique=True)
      first_name = models.CharField(max_length=50)
      last_name  = models.CharField(max_length=50)
      type       = models.CharField(max_length=50, blank=True)
      is_active  = models.BooleanField(default=True)
      is_staff   = models.BooleanField(default=False)
      USERNAME_FIELD  = "email"
      REQUIRED_FIELDS = ["first_name", "last_name"]
      objects = UserManager()

      @property
      def team(self):
          return self.teams.first()
  ```
  Key departures from earlier versions of this project:
  - No custom `token` field — DRF's `authtoken.Token` table is the source of truth.
  - No `team` CharField — team membership is expressed purely by the `Team.users` M2M (reverse: `user.teams`).
  - `team` is kept as a read-only property for backwards convenience with the frontend (it expects `userInfo.team` for the "My Team" sidebar link).

- **`users/managers.py`** — `UserManager(BaseUserManager)` with `create_user` / `create_superuser`. Email is normalized; password always goes through `set_password` (so hashes never get written raw).

- **`users/api/views.py`**
  - `signup` (AllowAny): validates `email`+`password`, rejects missing or unknown `team` (bio) with **`400`** and a helpful error string (messages starting with `"Invalid team bio"` or `"Team bio is required"` — the frontend pattern-matches against `"team bio"` to show a field-level Alert). Creates the user via `User.objects.create_user(...)`, adds them to the team, and returns `{user, token}` via `Token.objects.get_or_create`.
  - `login` (AllowAny): `django.contrib.auth.authenticate(username=email, password=...)` → returns serialized user + token.
  - `logout` (IsAuthenticated): deletes the caller's token.

- **`users/api/serializers.py`** — `UserSerializer` exposes `id, first_name, last_name, email, type, team, is_staff`. Password is **never** serialized; `team` is a `SerializerMethodField` returning the first team's `name`. `is_staff` is included so the frontend can gate admin UI.

### 2.3 `teams/`

- **`teams/models.py`**:
  ```python
  class Team(models.Model):
      name  = models.CharField(max_length=50)
      title = models.CharField(max_length=20000)
      bio   = models.CharField(max_length=255)          # doubles as invite code
      users = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='teams', blank=True)
  ```
  The previous `memos` M2M was removed — `Memo` now has a FK to `Team`, so `team.memos` is the reverse manager.

- **`teams/api/views.py`** exposes:
  - `list_teams` (GET) — returns `[{id, name, title, bio}]`. Staff see every team; regular users see only their own. This is what `/admin/teams` calls.
  - `search_team` (POST) — legacy endpoint still used by the frontend to hydrate `AdminTeamView` and `MyTeamRoute`. Returns the `TeamSerializer` output (includes `users` and reverse `memos` id lists, which the client then hydrates in parallel via `get_user/` + `get_memo/`).
  - `get_user`, `get_memo`, `create_team` — straightforward lookup helpers.

### 2.4 `memos/` and `timeline/`

Both follow the same shape:

```python
class Memo(models.Model):
    title      = models.CharField(max_length=200)
    body       = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    team       = models.ForeignKey('teams.Team', related_name='memos', on_delete=CASCADE)

class Timeline(models.Model):
    title       = models.CharField(max_length=200)
    description = models.TextField()
    team        = models.ForeignKey('teams.Team', related_name='timeline_events', on_delete=CASCADE)
    date        = models.DateField()
```

- `team` is a real FK (was a CharField/TextField pre-refactor — see `changes.md §3`).
- `date` on Timeline is now a proper `DateField` (was a `TextField`), enabling SQL-level sorting and ISO parsing on the client.

The serializers add a `team_name = SerializerMethodField()` that returns `obj.team.name`, so the frontend can render a readable label without a second round-trip.

The viewsets are stock `ModelViewSet`s with:
- `permission_classes = [IsAuthenticated, IsSameTeam]`
- `get_queryset()` filtered to `request.user.teams.all()` (or unrestricted for staff)
- `perform_create()` raising `PermissionDenied` if the supplied `team` isn't one of the caller's teams (staff bypass)

The previous `@action(detail=False)` custom `create_memo` / `delete_memo` / `create_timeline_entry` / `delete_timeline_entry` endpoints have been **removed** — stock REST verbs (`POST /memos/`, `DELETE /memos/:id/`) are used now.

---

## 3. Frontend (`frontend/`)

### 3.1 Tooling

- CRA 5 base; no eject.
- **Tailwind CSS 3** wired via `tailwind.config.js` + `postcss.config.js`. `@tailwindcss/forms` is the only plugin.
- **`@fontsource/inter`** loaded in `src/index.js`; `tailwind.config.js` remaps `font-sans` to Inter.
- **No MUI, no Emotion.** Accessible widgets come from `@headlessui/react`; icons from `@heroicons/react`.

### 3.2 Networking — `src/api.js`

Single axios instance with two interceptors:

```js
const api = axios.create({ baseURL: process.env.REACT_APP_API_URL });

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('userInfo');
  const token = raw ? JSON.parse(raw)?.token : null;
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('userInfo');
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    return Promise.reject(err);
  },
);
```

Every component imports `api` and calls `api.get/post/delete` — no per-call token plumbing. `baseURL` comes from `frontend/.env` (`REACT_APP_API_URL=http://127.0.0.1:8000/api/`); `.env.example` is committed as a template.

**Important subtlety**: axios's `combineURLs(baseURL, url)` normalizes slashes. That means `api.post('/memos/', ...)` and `api.post('memos/', ...)` both resolve to `/api/memos/` — the server must accept a single slash. This is why the router's `path('', include(...))` prefix (not `'/'`) matters. The double-slash quirk caused a hard-to-spot regression documented in `changes.md §6e`.

### 3.3 Auth state — `src/UserContext.js`

Minimal provider that reads `localStorage.userInfo` on boot and writes it on every change. `userInfo` shape: `{ id, first_name, last_name, email, type, team, is_staff, token }`. There is no refresh flow — logout deletes the token server-side and clears local state.

### 3.4 Layout shell — `src/AppShell.jsx`

Wraps every authenticated route. On `md+`, a fixed 16-rem left sidebar (`grid grid-cols-[16rem_1fr]`) plus a sticky top bar with the account dropdown. Below `md`, the sidebar disappears and the top bar surfaces a hamburger that opens a Headless UI `Dialog` panel sliding in from the left. Nav entries are computed from `userInfo`:
- Always: Home, Timeline
- If `userInfo.team`: "My Team"
- If `userInfo.type === 'Admin'`: "Admin"
- If `userInfo.is_staff`: "All Teams"

Public routes (`/login`, `/sign-in`, `/register`, `*`) bypass the shell and render their own centered-card layouts.

### 3.5 UI primitives — `src/ui/*`

Each primitive is a small, class-variant component:
- `Button.jsx` — `variant` = primary/secondary/ghost/danger, `size` = sm/md/lg.
- `Input.jsx` — label + helper + error (red ring) composition.
- `Alert.jsx` — error/info/success with a Heroicon.
- `Card.jsx` — `rounded-xl border border-slate-200 bg-white shadow-sm`.
- `Dialog.jsx` — Headless UI Dialog + Transition with fade/scale animation.
- `Menu.jsx` — Headless UI Menu used by the account dropdown.
- `Spinner.jsx` — CSS-animated spinner.

These are the only visual abstractions — pages compose them directly rather than defining per-component classes.

### 3.6 Pages

- `SignIn.js`, `Register.js` — centered `<Card>`. Register's team-bio flow pattern-matches `"team bio"` in the backend error to render a top-of-form Alert and flip the input into error state.
- `Main.js` — announcement cards.
- `Team.js` — two-column (announcements + members). Create/delete memo uses the `<Dialog>` primitive. Delete-by-title looks up the matching id from props (since the custom `delete_memo` action no longer exists).
- `Timeline.js` — Tailwind `<table>` on `sm+`, stacked `<Card>`s below.
- `AdminTeams.js` — responsive card grid linking to `/admin/team/:bio`.
- `AdminTeamView.js` — fetches any team by bio (requires `is_staff`), hydrates users + memos in parallel via `Promise.all`, reuses the same `<Team>` component.
- `AdminPage.js` — cards with create/delete forms for Posts and Timeline.

`App.js` splits routes into public vs `ShellRoute`-wrapped and includes a `MyTeamRoute` helper that loads the current user's team by bio so a hard refresh on `/team/:bio` still works.

---

## 4. Data flow lifecycles

### 4.1 Signup → authenticated request

1. `Register.js` → `POST /api/signup/` with `{email, password, first_name, last_name, type, team}`.
2. Backend validates `team` against `Team.bio`. Missing or unknown bio → `400 {"error": "..."}` (not 404 — `changes.md §6a`).
3. On success: `create_user` hashes the password, user is added to the team, `Token.objects.get_or_create` mints a token, response is `{user, token}`.
4. Frontend merges into `userInfo` in `localStorage`; axios interceptor now attaches `Authorization: Token <key>` on all subsequent requests.
5. `POST /api/memos/` with `{title, body, team: team_id}` → `MemoViewSet.perform_create` confirms the team is one of `request.user.teams`, saves, returns the serialized memo with `team_name`.

### 4.2 Admin cross-team browse

1. `userInfo.is_staff === true` unlocks the "All Teams" sidebar entry.
2. `GET /api/list_teams/` returns every team (staff bypass in the view).
3. Click a card → `/admin/team/:bio` → `POST /api/search_team/` with the bio → hydrate users + memos → render `<Team>`.
4. Because `IsSameTeam.has_object_permission` returns `True` for staff and `get_queryset` returns `Memo.objects.all()` for staff, admins can view and mutate any team's data.

### 4.3 401 recovery

Any request that returns 401 (expired token, server-side revocation, etc.) triggers the response interceptor: `localStorage.userInfo` is cleared and the browser is sent to `/login`. Because the interceptor checks `window.location.pathname !== '/login'`, a 401 on the login POST itself (bad credentials) does not loop — the SignIn component just displays the Alert.

---

## 5. Testing

Backend: 17 `APITestCase` tests in `users/tests.py`, `memos/tests.py`, `timeline/tests.py` covering signup/login, invalid-bio rejection, `IsSameTeam` scoping (including the deliberate 404-instead-of-403 behavior for cross-team GETs), staff bypass, and end-to-end signup → authenticated memo create. `python3 manage.py test users memos timeline` is the canonical command.

Frontend: no automated tests yet. Manual verification is documented in `changes.md` under each follow-up section and in `README.md`'s Setup section.

---

## 6. Known footguns for contributors

- **Never put a leading `/` on the include'd URL prefix** (`core/api/urls.py`). `path('', include(router.urls))` is correct; `path('/', ...)` produces `/api//memos/` and silently breaks axios (`changes.md §6e`).
- **Admin-gated UI must check `is_staff`**, not `type === 'Admin'`. The backend uses `is_staff` for the permission bypass; the `type` field is purely cosmetic. The only exception is the existing `/admin` posts/timeline tools, which still gate on `type`.
- **Don't reintroduce custom action endpoints on the Memo/Timeline viewsets.** Stock REST verbs (`POST /memos/`, `DELETE /memos/:id/`) are what the frontend calls. The old `create_memo` / `delete_memo` actions have been removed.
- **Swapping `AUTH_USER_MODEL` is a one-shot operation.** Django won't accept it on a populated database. If the User model ever needs another invasive change, you're resetting the SQLite dev DB and regenerating migrations, as `script.sh` does.
- **Dates** on `Timeline` are `DateField`; dates on `Memo` are `DateTimeField` (`auto_now_add`). The frontend's `formatDate` handles both via `new Date(value)`.

---

## 7. Bootstrap scripts

- **`script.sh`** — destructive. Wipes `db.sqlite3`, regenerates migrations, seeds `admin@qhdt.test / adminpass123!` plus four teams and eight members, prints credentials, opens backend + frontend in two new Terminal.app windows via `osascript`.
- **`run.sh`** — non-destructive. Applies pending migrations quietly, runs `npm install` only if `node_modules` is missing, then opens the two servers in new Terminal windows.

Both rely on macOS's `osascript` with `tell application "Terminal"` — do not emit `\033]0;...\007` title-escape sequences inside the `do script` string (AppleScript chokes on them; `changes.md §6c` has the details).

---

## 8. Reference

- [`README.md`](README.md) — onboarding + setup
- [`changes.md`](changes.md) — chronological log of every refactor and bugfix with file-level detail
