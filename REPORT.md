# Mood of the Major — Project Report

**Project:** Mood of the Major (repo folder: `Saig-Project`)
**Type:** Full-stack web application (React frontend + Express/MongoDB backend)
**Status:** Feature-complete and verified locally; not yet published to GitHub or deployed to the cloud.

---

## 1. Overview / Concept

"Mood of the Major" is an anonymous mood-sharing platform for KMITL students, designed around the metaphor of a **digital corkboard**. Students log in with a verified KMITL student identity, then pin virtual "post-it notes" describing how they're feeling — each note is colored and emoji-tagged by mood (happy, calm, tired, stressed, sad, excited, angry) and displayed with a slight random rotation, like a real note pinned to a board.

Although every note requires a logged-in author, the platform is built to be **anonymous by design**: nobody's real name or student ID is ever shown or transmitted to the browser. Instead, each user is assigned a randomly generated alias (e.g. "Sleepy Capybara #42") the first time they register, and that alias — along with their faculty, major, and year — is what appears publicly on their notes. Only the server ever knows which account created which note, and only for the purpose of enforcing "edit/delete your own notes" permissions.

Beyond the board itself, the app includes a **Campus Vibe stats page** (live mood distribution charts, dominant mood indicator, per-faculty breakdown) and an **Admin moderation panel** for removing inappropriate notes.

---

## 2. Tech Stack Actually Used

The project is a monorepo with two independently runnable applications plus a Docker Compose file for the database.

### Backend (`server/`)

| Package | Version | Purpose |
|---|---|---|
| Node.js | 20+ (engine requirement) | Runtime |
| Express | ^4.19.2 | HTTP server / routing |
| Mongoose | ^8.5.1 | MongoDB object modeling |
| jsonwebtoken | ^9.0.2 | JWT access/refresh tokens |
| bcryptjs | ^2.4.3 | Password hashing |
| express-validator | ^7.1.0 | Request validation |
| helmet | ^7.1.0 | Security HTTP headers |
| cors | ^2.8.5 | Cross-origin access control |
| cookie-parser | ^1.4.6 | Reading the httpOnly refresh-token cookie |
| morgan | ^1.10.0 | Request logging |
| swagger-jsdoc / swagger-ui-express | ^6.2.8 / ^5.0.1 | Auto-generated interactive API docs |
| nodemon (dev) | ^3.1.4 | Auto-restart during development |

### Frontend (`client/`)

| Package | Version | Purpose |
|---|---|---|
| React | ^19.2.7 | UI library |
| Vite | ^8.1.1 | Dev server / build tool |
| TypeScript | ~6.0.2 | Type safety |
| Tailwind CSS (`@tailwindcss/vite`) | ^4.1.18 | Styling (corkboard/postit theme) |
| Framer Motion | ^12.23.26 | Animations (note pin-in, layout transitions, stat bars) |
| React Router DOM | ^7.11.0 | Client-side routing |
| React Hook Form | ^7.69.0 | Form state |
| Zod (+ `@hookform/resolvers`) | ^4.2.1 | Form schema validation, mirroring backend rules |
| Axios | ^1.13.2 | HTTP client with token-refresh interceptor |
| oxlint (dev) | ^1.71.0 | Linting |

### Infrastructure

- **MongoDB 7** via `docker-compose.yml` (container `saig-mongo`, port `27017`, persisted to a named volume).
- Root `package.json` provides convenience scripts (`dev:server`, `dev:client`, `install:all`, `docker:up`, `docker:down`) to run everything from one place.

---

## 3. Feature-by-Feature Mapping to Requirements

| Requirement | Status | What was built |
|---|---|---|
| **Auth & Identity** | ✅ Done | Register/login with student ID + KMITL email + password (bcrypt, 12 rounds). JWT access tokens (15 min) plus rotating refresh tokens stored as an httpOnly, `SameSite` cookie scoped to `/api/auth`. `POST /api/auth/refresh` rotates the token and detects reuse/theft (if the cookie doesn't match the stored hash, the session is fully revoked). `POST /api/auth/logout` and `GET /api/auth/me` are also implemented. A successful KMITL SSO login (below) issues the exact same session (refresh cookie + access token). |
| **KMITL Student Verification / SSO** | ✅ Done | **Real KMITL SSO login is implemented** via OpenID Connect against KMITL's Keycloak (`https://sso.kmitl.ac.th/realms/kmitl`), using a self-service OIDC client created at `developer.kmitl.ac.th/console/sso` (no admin approval needed). The "Sign in with KMITL" button redirects through `GET /api/auth/kmitl`; the callback logs existing students straight in, and hands new students a short-lived signed "SSO ticket" that prefills and pre-verifies the register form (`verificationMethod: 'sso'`). For plain (non-SSO) registration, the `kmitlVerify` service still applies its strict format check (8-digit ID, `<studentId>@kmitl.ac.th` email, plausible year-prefix), and the optional KMITL Developer API call (`verifyByApi`) remains wired in behind `KMITL_API_KEY`. |
| **Mood Board CRUD** | ✅ Done | Create (`POST /api/moods`), read one/list (`GET /api/moods`, `GET /api/moods/:id`), update (`PATCH /api/moods/:id`, owner-only), delete (`DELETE /api/moods/:id`, owner **or** admin). Every mood record stores a denormalized snapshot of the author's alias/faculty/major/year at post time, so history stays stable even if a profile changes later. |
| **Anonymous Sharing** | ✅ Done | The `Mood` model's `toPublicJSON()` method never serializes the internal `author` reference — API responses only ever contain the alias, faculty, major, year, mood color/emoji, and a deterministic pseudo-random rotation value used for the corkboard visual effect. |
| **Discovery / Search / Filter / Pagination** | ✅ Done | `GET /api/moods` accepts `moodType`, `faculty`, `major`, `dateFrom`, `dateTo`, `page`, and `limit` query params, with server-side `skip`/`limit` pagination and a total count for page calculation. The frontend `FilterBar` exposes mood chips, a faculty dropdown, a free-text major field, and a date range, all wired through a shared `MoodContext`. |
| **RBAC (Role-Based Access Control)** | ✅ Done | Two roles, `student` and `admin`. `authenticate` middleware verifies the JWT; `authorize('admin')` middleware protects admin-only routes. Ownership is enforced in the controllers (403 if a non-owner tries to edit; 403 if a non-owner/non-admin tries to delete). The admin moderation list (`GET /api/admin/moods`) reuses the same filter/pagination logic but is gated behind `authenticate + authorize('admin')`. |
| **Form Validation** | ✅ Done | Backend: `express-validator` chains on every mutating route (registration, login, mood create/update) with clear per-field error messages. Frontend: matching Zod schemas + React Hook Form give the user instant feedback before a request is even sent (student ID digit count, KMITL email pattern, password length, 280-character note limit, password-confirmation match). |
| **Swagger / API Docs** | ✅ Done | `swagger-jsdoc` reads `@openapi` annotations directly from the route files and serves interactive documentation at `/api-docs` (raw spec at `/api-docs.json`), including a bearer-token auth scheme so requests can be tested directly from the browser. |
| **State Management** | ✅ Done | Frontend uses two React Contexts: `AuthContext` (current user, login/register/logout, session bootstrap, and a hook that clears the user on any 401 from the API client) and `MoodContext` (board data, active filters, pagination, and the create/edit/delete actions used by the board and admin pages). |
| **Animation** | ✅ Done | Framer Motion is used throughout: notes spring into place on the board with `layout`/`AnimatePresence` transitions, the compose modal pops in with a spring + slight rotation (like slapping a note onto the board), and the stats page animates its bar-chart widths in on load. |
| **Architecture** | ✅ Done | Backend follows a clean layered structure: `config/`, `models/`, `controllers/`, `services/`, `routes/`, `middleware/`, `validators/`, `docs/`. Frontend mirrors this with `pages/`, `components/`, `context/`, `api/`, `lib/`, `types/`. |
| **Creativity / Visualization** | ✅ Done | The "Campus Vibe" stats page (`/stats`) shows overall mood distribution as animated bars, a "dominant mood" hero indicator, and per-faculty mood-mix bars, plus a background radial gradient that tints itself to the dominant mood color — a direct implementation of the plan's "board background subtly shifts with campus mood" bonus idea. |
| **Deployment (bonus)** | ❌ Not done | No Vercel/Render deployment has been attempted yet. See §6. |

---

## 4. API Summary

All endpoints are prefixed with `/api`. Full request/response schemas, parameters, and example payloads are available live in Swagger UI at **`http://localhost:4000/api-docs`** once the server is running — the summary below is intentionally brief.

**Auth**
- `POST /api/auth/register` — create an account (runs KMITL verification first, or trusts an SSO ticket when one is supplied)
- `POST /api/auth/login` — log in with student ID + password
- `GET /api/auth/kmitl` — start KMITL SSO login (302 redirect to the KMITL Keycloak login page)
- `GET /api/auth/kmitl/callback` — OIDC redirect target; logs in / hands off to register / reports errors, always via redirect back to the client
- `POST /api/auth/refresh` — rotate the refresh-token cookie, issue a new access token
- `POST /api/auth/logout` — revoke the current session
- `GET /api/auth/me` — current user's profile (requires auth)

**Moods**
- `POST /api/moods` — pin a new mood note (requires auth)
- `GET /api/moods` — list/filter/paginate the public board (auth optional — determines `canEdit`/`canDelete` flags)
- `GET /api/moods/:id` — view a single note
- `PATCH /api/moods/:id` — edit a note (owner only)
- `DELETE /api/moods/:id` — delete a note (owner or admin)

**Stats**
- `GET /api/stats` — mood distribution overall / by faculty / by major, plus the dominant campus mood (requires auth)

**Admin**
- `GET /api/admin/moods` — moderation list with the same filters as the public feed (admin only)

**Misc**
- `GET /api/health` — health check
- `GET /api-docs`, `GET /api-docs.json` — Swagger UI and raw OpenAPI spec

---

## 5. How to Run Locally

The project has **not** been deployed anywhere — running it requires three local pieces: MongoDB, the API server, and the frontend dev server. At the time of writing, none of these were left running (no Docker container or Node process was active), so start them fresh with the steps below.

1. **Start MongoDB** (from the repo root, requires Docker Desktop):

   ```bash
   docker compose up -d
   ```

   This starts `mongo:7` on `localhost:27017`. If Docker isn't available, point `MONGODB_URI` in `server/.env` at any reachable MongoDB instance instead.

2. **Install dependencies** (first time only, from the repo root):

   ```bash
   npm run install:all
   ```

3. **Configure environment files** — `server/.env` and `client/.env` already exist locally (copied from their committed `.env.example` templates) with working defaults: server on port `4000`, client dev server on Vite's default port `5173`, and `VITE_API_URL=http://localhost:4000`. The local `server/.env` also contains real `KMITL_OIDC_CLIENT_ID`/`KMITL_OIDC_CLIENT_SECRET` values (gitignored, never committed) that enable "Sign in with KMITL"; without them SSO is simply disabled and local login still works.

4. **Seed the admin account** (first time only, from `server/`):

   ```bash
   npm run seed:admin
   ```

5. **Start the backend** (from the repo root or `server/`):

   ```bash
   npm run dev:server
   ```
   API available at `http://localhost:4000`, Swagger UI at `http://localhost:4000/api-docs`.

6. **Start the frontend** (in a second terminal, from the repo root or `client/`):

   ```bash
   npm run dev:client
   ```
   App available at `http://localhost:5173`.

---

## 6. Known Limitations & Suggested Next Steps

- **Full interactive KMITL SSO login has not been exercised end-to-end.** Live KMITL SSO *is* implemented (OIDC client credentials were self-service created at `developer.kmitl.ac.th/console/sso`, so the earlier "requires admin approval" blocker no longer applies), and the redirect to the real KMITL Keycloak login page plus the callback's error handling were verified working. But completing the flow requires a human to type real KMITL credentials into the KMITL login page, which hasn't been done yet — the token-exchange/login-success path is untested against a real account.
- **The KMITL Developer *profile API* remains unused (optional).** Non-SSO registration is still gated by the strict format check (8-digit student ID, `<studentId>@kmitl.ac.th` email, plausible entry-year-vs-study-year match). `server/src/services/kmitlVerify.js` will call the real KMITL Lookup API automatically the moment a `KMITL_API_KEY` is set, but with SSO now available this path is a nice-to-have rather than a gap.
- **No public GitHub repository yet.** Publishing was blocked on `gh auth login`, which requires an interactive browser sign-in that only the project owner can complete. Recommended next step: run `gh auth login` once, then `gh repo create Saig-Project --public --source=. --push`.
- **No cloud deployment yet.** Vercel (frontend) / Render or similar (backend + MongoDB Atlas) deployment was scoped as a bonus/follow-up and hasn't been started.
- **Nothing is committed to git beyond the initial empty-skeleton commit.** All application code (every file under `server/src/` and `client/src/`, plus configs) currently exists only in the working tree, uncommitted. It's ready to be committed and pushed once the owner wants to do so.

---

## 7. Verification History

The application was fully exercised end-to-end during development:

- Registration and login flows, including KMITL format verification rejecting bad emails/IDs.
- KMITL SSO plumbing: `GET /api/auth/kmitl` confirmed to return a 302 to the real KMITL Keycloak authorize endpoint (with the correct client id, redirect URI, and signed `state`), and the callback's error path confirmed to redirect to `/login?ssoError=...` with the message shown in the UI. The full interactive login (entering real KMITL credentials on the KMITL page) is still pending a human tester — see §6.
- Mood CRUD: creating, editing, and deleting notes, with ownership enforced (a user cannot edit someone else's note; only the author or an admin can delete a note — verified that non-owners and non-admins correctly receive `403 Forbidden`).
- Filtering by mood type, faculty, and date range, and pagination across multiple pages of results.
- `GET /api/stats` returning correct aggregated distributions.
- Swagger UI at `/api-docs` confirmed to render and correctly document every route.
- A full manual pass through the browser UI (board, compose modal, filters, stats page, admin panel).

**One bug was found and fixed during this pass:** the Admin Moderation table clipped its "Delete" button off-screen below roughly 950px viewport width, because the table's wrapper used `overflow-hidden`. This was fixed by switching the wrapper to `overflow-x-auto` with a `min-w-[640px]` on the table itself, allowing horizontal scrolling instead of clipping on narrow viewports. The fix was reverified live in the browser after the change.

---

## 8. Admin Credentials (Development/Testing Only)

For grading or local testing, a seeded admin account is available after running `npm run seed:admin` (from `server/`):

| Field | Value |
|---|---|
| Student ID | `99999999` |
| Password | `Admin123!` |
| Email | `99999999@kmitl.ac.th` |

> **Note:** These are development-only seed credentials defined in `server/.env` (`ADMIN_*` variables) and exist solely to exercise the admin/moderation features locally. They should be changed or removed before any real deployment.
