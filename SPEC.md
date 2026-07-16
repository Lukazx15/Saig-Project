# SPEC.md — Mood of the Major: Technical Specification

Version 1.0 · Grounded in the implemented codebase at `C:\Users\Admin\Saig-Project` (client + server monorepo).

---

## 1. Introduction

### 1.1 Purpose

Mood of the Major is an anonymous mood-sharing web application for KMITL students. Students pin post-it style notes expressing their current mood on a shared campus corkboard. The system verifies that users are KMITL students at registration, but guarantees that individual mood posts can never be traced back to a student's identity by other users.

### 1.2 Scope

Covered: student registration with KMITL verification, KMITL SSO login via OpenID Connect, session management (JWT access + rotating refresh tokens), mood note CRUD, public board with filtering and pagination, aggregate mood statistics, and role-based admin moderation. Local development only (no deployment target is specified).

### 1.3 Definitions

| Term | Definition |
|------|-----------|
| **Mood** | A single post-it note: a mood type (one of 7), a message (≤ 280 chars), and an anonymous author snapshot. |
| **Mood type** | Enum value: `happy`, `calm`, `tired`, `stressed`, `sad`, `excited`, `angry`. Each maps to a fixed note color and emoji. |
| **Board** | The public, paginated, filterable feed of mood notes rendered as a corkboard (`BoardPage`). |
| **Alias** | A generated anonymous display name assigned to each user at registration (`aliasService`), shown on notes instead of any real identity. |
| **Faculty / Major** | The student's self-reported academic faculty and major, snapshotted onto each mood at post time and used for filtering/statistics. |
| **Viewer** | The (optionally) authenticated user making a read request; determines `isOwner`/`canEdit`/`canDelete` flags on returned moods. |

---

## 2. System Overview

### 2.1 Architecture

Three-tier architecture:

```
┌─────────────────────┐  HTTPS/JSON (axios,        ┌──────────────────────┐   Mongoose    ┌──────────────┐
│  React SPA (Vite)   │  credentials + Bearer JWT) │  Express REST API    │ ────────────► │  MongoDB 7   │
│  localhost:5173     │ ─────────────────────────► │  localhost:4000/api  │               │  saig-mongo  │
│  client/            │ ◄───────────────────────── │  server/             │ ◄──────────── │  :27017      │
└─────────────────────┘  { success, data } envelope└──────────────────────┘               └──────────────┘
```

- The client talks only to the API (base URL from `VITE_API_URL`, default `http://localhost:4000`), path prefix `/api`, with `withCredentials: true` for the refresh cookie.
- The API is documented live via Swagger UI at `http://localhost:4000/api-docs`.
- MongoDB runs in Docker (`docker-compose.yml`, container `saig-mongo`, volume `mongo-data`), database `mood-of-the-major`.

### 2.2 Technology stack (from package.json manifests)

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React / React DOM | ^19.2.7 |
| | TypeScript | ~6.0.2 |
| | Vite | ^8.1.1 |
| | Tailwind CSS (+ `@tailwindcss/vite`) | ^4.1.18 |
| | Framer Motion | ^12.23.26 |
| | react-router-dom | ^7.11.0 |
| | react-hook-form / @hookform/resolvers / zod | ^7.69.0 / ^5.2.2 / ^4.2.1 |
| | axios | ^1.13.2 |
| | oxlint (linter) | ^1.71.0 |
| Backend | Node.js | >= 20 |
| | Express | ^4.19.2 |
| | Mongoose | ^8.5.1 |
| | jsonwebtoken / bcryptjs | ^9.0.2 / ^2.4.3 |
| | express-validator | ^7.1.0 |
| | helmet / cors / cookie-parser / morgan | ^7.1.0 / ^2.8.5 / ^1.4.6 / ^1.10.0 |
| | swagger-jsdoc / swagger-ui-express | ^6.2.8 / ^5.0.1 |
| | nodemon (dev) | ^3.1.4 |
| Database | MongoDB (Docker image `mongo:7`) | 7 |

---

## 3. Functional Requirements

### Registration & verification

- **FR-1** The system shall allow registration with `studentId`, `email`, `faculty`, `major`, `year` (1–8), and `password` (≥ 8 chars) via `POST /api/auth/register`.
- **FR-2** The system shall verify KMITL student status at registration. When the request carries a valid `ssoTicket` (see FR-23–FR-26), the SSO-attested identity is trusted and no format/API check runs (`verificationMethod: 'sso'`). Otherwise `services/kmitlVerify.js` applies: when `KMITL_API_KEY` is unset (default), a strict format fallback — `studentId` must be exactly 8 digits, `email` must equal `<studentId>@kmitl.ac.th`, and the studentId's two-digit entry-year prefix must plausibly match the stated year of study (Buddhist-calendar arithmetic, ±1 year tolerance).
- **FR-3** When `KMITL_API_KEY` is set (and no `ssoTicket` is supplied), verification shall instead call the KMITL Developer API (`GET {KMITL_API_BASE_URL}/students/profile`) with a 5-second timeout, falling back to the format check on any network/API error.
- **FR-4** Duplicate `studentId` or `email` shall be rejected with HTTP 409.
- **FR-5** Each new user shall be assigned a generated anonymous alias (`aliasService.generateAlias()`), stored on the user and reused on all of their mood posts.

### Authentication & session

- **FR-6** The system shall support login with `studentId` + password (`POST /api/auth/login`), comparing against a bcrypt hash (12 rounds). Invalid credentials return 401 with a non-revealing message.
- **FR-7** On register/login/refresh, the server shall issue a JWT access token (default expiry 15m, payload `{ sub, role }`) in the response body, and a JWT refresh token (default expiry 7d, with `jti`) in an httpOnly cookie scoped to path `/api/auth`.
- **FR-8** `POST /api/auth/refresh` shall rotate the refresh token: only the SHA-256 hash of the *current* refresh token is stored per user; any expiry or hash mismatch (possible reuse/theft) revokes the session entirely and forces re-login.
- **FR-9** `POST /api/auth/logout` shall revoke the stored refresh-token hash and clear the cookie.
- **FR-10** The client shall keep the access token in memory only (never localStorage) and shall auto-refresh once on any 401 (single-flight, non-auth routes), logging out on refresh failure (`client/src/api/client.ts`).

### Mood notes (CRUD)

- **FR-11** Authenticated students shall create mood notes (`POST /api/moods`) with a `moodType` from the 7-value enum and a `message` of 1–280 characters.
- **FR-12** Anyone (no login required) shall read the board (`GET /api/moods`) and single notes (`GET /api/moods/:id`); when a viewer is authenticated, responses include viewer-relative `isOwner`/`canEdit`/`canDelete` flags.
- **FR-13** Only the note's author shall update it (`PATCH /api/moods/:id`, partial `moodType`/`message`); others receive 403.
- **FR-14** The note's author or an admin shall delete it (`DELETE /api/moods/:id`); others receive 403.

### Anonymity

- **FR-15** Mood responses shall never expose the author's `studentId`, name, email, or raw user ObjectId. All mood serialization goes through `Mood.toPublicJSON(viewer)`, exposing only `alias`, `faculty`, `major`, `year` plus per-viewer permission flags.
- **FR-16** Each mood shall store a denormalized anonymous snapshot of the author (`authorAlias`, `authorFaculty`, `authorMajor`, `authorYear`) taken at post time, so history remains stable if the profile later changes.

### Filtering, search & pagination

- **FR-17** `GET /api/moods` shall support query filters: `moodType` (enum), `faculty`, `major`, and a date range (`dateFrom`/`dateTo`, ISO 8601, matched against `createdAt`).
- **FR-18** List endpoints shall be paginated via `page` (≥ 1, default 1) and `limit` (1–100, default 20; client uses 12), returning `pagination: { page, limit, total, totalPages }`, sorted newest-first.

### Statistics

- **FR-19** `GET /api/stats` (authenticated) shall return the total mood count, the overall distribution per mood type (`{ count, color }` per type), per-faculty and per-major breakdown maps, and the dominant campus mood (`{ moodType, color, count }` or `null`), computed via MongoDB aggregation.

### RBAC & admin moderation

- **FR-20** The system shall support two roles: `student` (default) and `admin`. Roles are embedded in the access token and enforced by `authenticate` + `authorize(role)` middleware.
- **FR-21** Admins shall access a moderation list at `GET /api/admin/moods` (same filters/pagination as the public feed; admin-only via `authorize('admin')`), and may delete any mood (FR-14). The client exposes this at `/admin` behind an admin-only route guard.
- **FR-22** A development admin account shall be seedable via `npm run seed:admin` in `server/` (defaults from `.env`: studentId `99999999`, password `Admin123!`).

### KMITL SSO login (OpenID Connect)

- **FR-23** The system shall support login via KMITL SSO (`services/kmitlOidc.js`): `GET /api/auth/kmitl` shall 302-redirect to the KMITL Keycloak authorization endpoint (issuer `KMITL_OIDC_ISSUER`, default `https://sso.kmitl.ac.th/realms/kmitl`, endpoints resolved via OIDC discovery with a 1-hour cache), requesting `scope=openid profile email` with a signed-JWT `state` parameter. SSO is enabled only when both `KMITL_OIDC_CLIENT_ID` and `KMITL_OIDC_CLIENT_SECRET` are set; otherwise the start endpoint returns 400 and the client's "Sign in with KMITL" simply fails gracefully.
- **FR-24** `GET /api/auth/kmitl/callback` shall verify the `state` JWT, exchange the authorization code for tokens, fetch userinfo, and derive the KMITL identity — the `studentId` is extracted from the `<8-digit>@kmitl.ac.th` email/username claim. Non-student accounts (no matching email pattern) are rejected.
- **FR-25** On callback, if a user matching the SSO identity (by `studentId` or `email`) exists, the server shall issue a normal session (refresh cookie, per FR-7) and redirect to `${CLIENT_URL}/?sso=success`. If no user exists, it shall redirect to `${CLIENT_URL}/register?ssoTicket=<JWT>` carrying a short-lived signed SSO ticket. All errors redirect to `${CLIENT_URL}/login?ssoError=<message>` (never a JSON error page).
- **FR-26** `POST /api/auth/register` shall accept an optional `ssoTicket`. A valid ticket whose attested `studentId`/`email` match the submitted values completes registration with `verificationMethod: 'sso'` (FR-2); an invalid/expired ticket or mismatched identity returns 400. The register page prefills and locks the `studentId`/`email` fields from the ticket.

---

## 4. API Specification

All endpoints are prefixed with `/api`. **Live reference: Swagger UI at `/api-docs`** (spec JSON at `/api-docs.json`); route-level `@openapi` JSDoc annotations are the source of truth.

**Response envelope.** Success: `{ success: true, data: <payload> }` (optionally `message`). Error (from `errorHandler`): `{ success: false, message: string, details?: [...] }`; validation failures are 400 with `details: [{ field, message }]`.

| Method | Path | Auth | Request body / query | Success response (`data`) |
|--------|------|------|----------------------|---------------------------|
| GET | `/api/health` | none | — | `{ status: "ok" }` |
| POST | `/api/auth/register` | none | `{ studentId, email, faculty, major, year, password, ssoTicket? }` | 201 · `{ user, accessToken }` + refresh cookie |
| POST | `/api/auth/login` | none | `{ studentId, password }` | `{ user, accessToken }` + refresh cookie |
| GET | `/api/auth/kmitl` | none | — | 302 → KMITL Keycloak authorize endpoint (400 if SSO not configured) |
| GET | `/api/auth/kmitl/callback` | none | query: `code, state` (from KMITL) | 302 → `${CLIENT_URL}/?sso=success` (existing user, + refresh cookie) · `${CLIENT_URL}/register?ssoTicket=…` (new user) · `${CLIENT_URL}/login?ssoError=…` (any error) |
| POST | `/api/auth/refresh` | refresh cookie | — | `{ accessToken }` + rotated refresh cookie |
| POST | `/api/auth/logout` | refresh cookie (optional) | — | `data: null`, `message: "Logged out"` |
| GET | `/api/auth/me` | Bearer | — | `{ user }` (public profile) |
| POST | `/api/moods` | Bearer | `{ moodType, message }` | 201 · `{ mood }` |
| GET | `/api/moods` | optional Bearer | query: `moodType, faculty, major, dateFrom, dateTo, page, limit` | `{ moods: [...], pagination }` |
| GET | `/api/moods/:id` | optional Bearer | — | `{ mood }` |
| PATCH | `/api/moods/:id` | Bearer (owner) | `{ moodType?, message? }` | `{ mood }` |
| DELETE | `/api/moods/:id` | Bearer (owner or admin) | — | `data: null`, `message: "Mood deleted"` |
| GET | `/api/stats` | Bearer | — | `{ total, distribution, dominantMood, byFaculty, byMajor }` |
| GET | `/api/admin/moods` | Bearer (admin) | same query as `GET /api/moods` | `{ moods: [...], pagination }` |

Common error statuses: 400 (validation / verification failure), 401 (missing/invalid token or credentials), 403 (not owner / not admin), 404 (not found), 409 (duplicate account), 500 (internal; message masked in production).

**Mood object shape** (from `Mood.toPublicJSON`):

```json
{
  "id": "…", "moodType": "happy", "emoji": "😊", "message": "…",
  "color": "#FFE066", "alias": "…", "faculty": "…", "major": "…", "year": 2,
  "rotation": -2.7, "isOwner": false, "canEdit": false, "canDelete": false,
  "createdAt": "…", "updatedAt": "…"
}
```

`rotation` is a deterministic −5°..+5° tilt derived from the note id for a stable corkboard layout.

---

## 5. Data Models

### 5.1 User (`server/src/models/User.js`)

| Field | Type | Constraints |
|-------|------|-------------|
| `studentId` | String | required, unique, `/^\d{8}$/`, indexed |
| `email` | String | required, unique, lowercased, trimmed, indexed |
| `passwordHash` | String | required, `select: false` (bcrypt, 12 rounds) |
| `faculty` / `major` | String | required, trimmed |
| `year` | Number | required, min 1, max 8 |
| `role` | String | enum `['student','admin']`, default `student` |
| `alias` | String | required (generated anonymous name) |
| `kmitlVerified` | Boolean | default `false` |
| `verificationMethod` | String | enum `['api','format','sso','none']`, default `none` (`sso` = verified via KMITL OIDC login) |
| `refreshTokenHash` | String | default `null`, `select: false` (SHA-256 of current refresh token) |
| `refreshTokenExpiresAt` | Date | default `null`, `select: false` |
| `createdAt` / `updatedAt` | Date | Mongoose `timestamps: true` |

Public profile (`toPublicProfile`) omits `passwordHash` and refresh-token fields.

### 5.2 Mood (`server/src/models/Mood.js`)

| Field | Type | Constraints |
|-------|------|-------------|
| `author` | ObjectId → User | required; **never populated or exposed in responses** |
| `moodType` | String | required, enum (7 types), indexed |
| `message` | String | required, trimmed, 1–280 chars |
| `authorAlias` | String | required (anonymous snapshot) |
| `authorFaculty` | String | required, indexed |
| `authorMajor` | String | required, indexed |
| `authorYear` | Number | required |
| `createdAt` / `updatedAt` | Date | Mongoose `timestamps: true` |

Compound/secondary indexes: `{ createdAt: -1 }` and `{ moodType: 1, authorFaculty: 1, authorMajor: 1 }`.

### 5.3 Mood type enum (shared client/server contract)

Defined in `server/src/config/constants.js` and mirrored in `client/src/lib/moods.ts` (`MOOD_META`, with labels and tint values):

| Mood type | Color | Emoji |
|-----------|-------|-------|
| `happy` | `#FFE066` | 😊 |
| `calm` | `#A8DADC` | 🌿 |
| `tired` | `#CDB4DB` | 😴 |
| `stressed` | `#F4A261` | 😰 |
| `sad` | `#90CAF9` | 😔 |
| `excited` | `#FF9F1C` | ✨ |
| `angry` | `#E63946` | 😤 |

---

## 6. Non-Functional Requirements

### 6.1 Validation (both ends)

- **Server:** every route runs an express-validator chain (`server/src/validators/`) followed by the shared `validate` middleware, which converts failures into a single 400 `ApiError` with `details: [{ field, message }]`. Mongoose schema constraints provide a second layer.
- **Client:** all forms use React Hook Form with Zod resolvers (`client/src/lib/schemas.ts`): login, registration (including `<studentId>@kmitl.ac.th` cross-field check and password confirmation), and mood composition (1–280 chars). API responses are defensively normalized in `client/src/api/normalize.ts` before use.

### 6.2 Security

- Passwords hashed with bcrypt (12 rounds); hash excluded from queries by default (`select: false`).
- Access token: short-lived (15m), held in client memory only — resistant to XSS token theft via storage.
- Refresh token: httpOnly cookie, `path=/api/auth`, `secure` + `SameSite=None` in production (`SameSite=Lax` in dev); rotated on every refresh with hash-based reuse detection that revokes the session.
- `helmet` security headers; CORS restricted to `CLIENT_URL` (plus any localhost origin in development) with `credentials: true`.
- KMITL SSO: the OIDC `state` parameter is a short-lived (10m) signed JWT verified statelessly on callback (CSRF protection, no session store); the SSO register handoff uses a short-lived (15m) signed "SSO ticket" JWT whose attested identity must match the submitted registration exactly. OIDC client credentials (`KMITL_OIDC_CLIENT_ID`/`KMITL_OIDC_CLIENT_SECRET`) live only in `server/.env`; the token exchange is server-side, so the client secret and KMITL tokens never reach the browser.
- 500-level error messages and stack traces are masked in production.
- Secrets configured via `server/.env` (see `.env.example`); no credentials committed.

### 6.3 UI/UX

- Responsive layout (Tailwind CSS 4 utility classes) across board, stats, auth, and admin pages.
- Framer Motion animations for note pinning/board interactions; deterministic per-note rotation keeps the corkboard layout stable across refetches.
- Route guards: `/stats` requires login; `/admin` requires the admin role (`ProtectedRoute`).

### 6.4 Operability

- Single-command local stack: `npm run docker:up`, `npm run dev:server` (nodemon, port 4000), `npm run dev:client` (Vite, port 5173); `npm run install:all` for dependencies.
- Request logging via morgan (`dev` format locally, `combined` in production).
- Live API documentation at `/api-docs`.

---

## 7. Out of Scope / Future Work

- **KMITL Developer API verification** — live KMITL SSO login is now implemented (FR-23–FR-26) and is the primary verified path; only the optional `KMITL_API_KEY`-based profile-lookup API remains unwired for non-SSO registrations, which default to the format-check fallback. Supplying a production `KMITL_API_KEY` is optional future work.
- **Deployment** — no hosting, CI/CD, HTTPS termination, or production database provisioning is defined; the stack is local-development only.
- **GitHub publication** — the repository is local; publishing and repo workflows are out of scope.
- **Automated testing** — no test suite exists; verification is manual via Swagger UI (`/api-docs`) and the client. Adding API/UI tests is future work.
