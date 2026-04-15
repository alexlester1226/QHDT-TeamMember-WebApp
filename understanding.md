# Comprehensive System Architecture & Codebase Deep Dive

This document is designed for Senior Software Engineers and Large Language Models (LLMs) analyzing, contributing to, or refactoring this project. It outlines the architectural design patterns, database schemas, edge-cases, and integration logic for the `QHDT-TeamMember-WebApp`.

## 1. System Overview
The application is a monolith-API decoupled system. The backend works purely as a RESTful API server (Django + DRF) and the frontend is an interactive Single Page Application (SPA).
The primary domain of the application is managing members of the Queen's Hyperloop Design Team (QHDT), providing features such as team-based context grouping, memos dispatching, announcements, and a historical timeline.

## 2. Directory & Module Breakdown

### 2.1 Backend (`/backend/`)
The Django backend represents the data persistence and business logic layer. It adheres to Django's app-centric architecture, heavily relying on Django REST Framework for serialization and views.

#### `core` (Project Root)
- **`settings.py`**: Configures installed apps (`posts`, `timeline`, `users`, `teams`, `memos`) and registers the `corsheaders` middleware. It explicitly permits Cross-Origin Requests from `http://localhost:3000` through `CORS_ALLOWED_ORIGINS`.
- **`api/urls.py`**: Serves as the master routing hub. It leverages DRF's `DefaultRouter` to automatically map model viewsets (for Posts, Timeline, and Memos). Additionally, it mounts functional custom endpoint handlers manually for authentication/team logic (`login/`, `signup/`, `create_team/`, `search_team/`).

#### `users` (App)
Dictates internal identity access and registration constraints.
- **Model (`User`)**: Departs from Django's built-in `AbstractUser`. Instead, it provides a purely standalone structure including fields `first_name`, `last_name`, `email` (unique), `password`, `type`, `team`. It uniquely features a `token` (CharField) field used to manually persist API sessions.
- **Views**:
  - `login`: Looks up a user strictly via the `email` field. Verifies the password using `check_password(password, user.password)`. Returns profile context and the authorization `token`.
  - `signup`: Employs Django's `make_password` utility for manual user hashing. Crucially, the signup payload accepts a `team` variable mapped internally to look up an existing `Team` via its `bio` field (treating the `bio` conceptually like an invite/join code). Upon matching the bio, it executes `team.users.add(user)` and mints a random 15-digit authentication token string.

#### `teams` (App)
Aggregates resources mapped directly to internal squads.
- **Model (`Team`)**: Features `name`, `title`, and `bio`. It maintains a `ManyToManyField` mapping for `users` (`User`) and `memos` (`Memo`).

#### `memos` (App)
Used for intra-team communications, alerts, and task declarations.
- **Model (`Memo`)**: Retains standard textual fields: `title`, `body`, and `created_at`. It also retains a string-based `team` field directly, which acts as a denormalized tag besides being grouped by the `Team` ManyToMany relation.

#### `posts` & `timeline` (Apps)
- **`Post` Model**: Holds unstructured standard announcements logic (`title`, `body`, `created_at`).
- **`Timeline` Model**: Logs events with `title`, `description`, `team`, and `date`. Note: `date` natively defaults to `TextField()`, pushing format validations strictly to the frontend interface.

### 2.2 Frontend (`/frontend/`)
The frontend is built natively over `create-react-app`.
- Focuses purely on interface generation combining **React DOM** mapping over internal components.
- Heavily delegates visual complexity to **MUI (`@mui/material`)** relying on structured UI grids, typography variants, and component encapsulation.
- Extensively uses **Axios** to interface with Django asynchronously without wrapping the network requests in state-managers (Redux/Zustand), thereby delegating immediate local data holding to standard React `useState`.

## 3. Data Flow Lifecycle & Core Workflows

### Authentication & Token Handshake
1. **Bootstrap**: A new team member mounts the SPA and is directed to the registration or login component.
2. **Registration Injection**: Filling the form dispatches an `axios.post` to `/api/signup/`. The backend receives the DTO. If the team discriminator string (passed into the form) matches a live Team's `bio`, the User is hydrated in SQLite, assigned to that `<Team>`, and bound to a randomly generated 15-digit hash token string.
3. **Session Preservation**: This pseudo-token isn't a JWT—it serves as a literal DB key verification string. Components requiring user verification pass this string via standard request bodies or fetch state validations by checking the viability against the `/api/test_token/` endpoint.

## 4. Architectural Considerations & Potential Technical Debt
For agents or engineers iterating on this codebase, track the following architectural variances:

- **Custom Cryptographic Flow**: Standard DRF usually relies on `TokenAuthentication` or `JWTAuthentication` parsing headers (e.g., `Authorization: Bearer <token>`). The current implementation rolls a literal 15-digit RNG as the `User.token` mapped dynamically. API security relies largely on standard Django CORS policy wrapping the endpoints, but doesn't natively enforce `@permission_classes([IsAuthenticated])` across viewsets natively.
- **Denormalized Foreign Identifiers**: The `User`, `Memo`, and `Timeline` objects feature flat string columns called `team` tracking affiliation name alongside their formal relational structure (via the `Team` model's `ManyToManyField`). If you perform a cascading data migration or rename a team, ensure both the flat string field tags and relational graphs are updated identically.
- **Time String Parsing**: Because models implement date logic locally via `TextField` definitions, when extending date sorting logic globally, queries may require native Python/JavaScript casting (`strptime`/`Date.parse()`) rather than executing indexed SQL-level aggregations (`.order_by('date')`).
