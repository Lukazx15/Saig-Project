# CLAUDE.md — Mood of the Major (Saig-Project)

Guidance for AI coding assistants working in this repository.

## Project overview

Anonymous mood-sharing corkboard for KMITL students. Students register with their KMITL identity, then pin post-it notes with a mood + short message. The board is public; identity is never exposed — notes show only an anonymous alias, faculty, major, and year.

## Architecture

Monorepo, two apps plus Docker Compose for MongoDB:

- `client/` — React 19 + TypeScript + Vite + Tailwind CSS 4 + Framer Motion. Lint with `oxlint` (`npm run lint` in `client/`).
- `server/` — Express 4 + Mongoose 8, plain JavaScript (CommonJS). Swagger UI via `swagger-jsdoc`.
- `docker-compose.yml` — MongoDB 7, container `saig-mongo`, port `27017`.

```
server/src/
  app.js              # Express app: helmet, CORS (credentials), swagger, routes, error handling
  server.js           # entry point (connects DB, listens)
  config/             # env.js (dotenv), db.js, constants.js (MOOD_COLORS/EMOJIS/TYPES, ROLES)
  routes/             # index.js mounts /auth /moods /stats /admin; swagger jsdoc lives on routes
  controllers/        # authController, moodController, statsController
  models/             # User.js, Mood.js (Mood.toPublicJSON is the anonymity gate)
  services/           # kmitlVerify.js, kmitlOidc.js (KMITL SSO), tokenService.js, aliasService.js, durationMs.js
  middleware/         # authenticate, optionalAuthenticate, authorize, errorHandler, notFound
  validators/         # express-validator chains + validate.js collector
  seed/seedAdmin.js   # npm run seed:admin
  docs/swagger.js     # swagger-jsdoc spec, served at /api-docs

client/src/
  App.tsx             # routes: / (board), /login, /register, /stats (auth), /admin (admin)
  api/                # client.ts (axios + token/refresh interceptors), auth.ts, moods.ts, normalize.ts
  context/            # AuthContext.tsx, MoodContext.tsx
  pages/              # BoardPage, LoginPage, RegisterPage, StatsPage, AdminPage, NotFoundPage
  components/         # PostIt, ComposeModal, FilterBar, Navbar, Layout, ProtectedRoute, ...
  lib/                # moods.ts (MOOD_META, faculties, helpers), schemas.ts (Zod form schemas)
  types/index.ts      # shared TS types incl. MOOD_TYPES
```

## How to run

```bash
npm run install:all      # install server + client deps
npm run docker:up        # start MongoDB (saig-mongo, :27017)
cd server && npm run seed:admin   # create the dev admin account (once)
npm run dev:server       # Express on http://localhost:4000 (nodemon)
npm run dev:client       # Vite on http://localhost:5173
```

- Copy `server/.env.example` → `server/.env` and `client/.env.example` → `client/.env` first.
- Swagger UI: http://localhost:4000/api-docs (spec JSON at `/api-docs.json`).
- Client expects `VITE_API_URL=http://localhost:4000`.

## API contract conventions

- Success envelope: `{ success: true, data: { ... } }`.
- Error envelope (from `errorHandler.js`): `{ success: false, message, details? }`. Validation failures are 400 with `details: [{ field, message }]`.
- List responses include `data.pagination = { page, limit, total, totalPages }`.
- Throw `ApiError` (`utils/ApiError.js` — `.badRequest/.unauthorized/.forbidden/.notFound/.conflict`) from controllers; never hand-roll error responses.
- Every route: express-validator chain + `validate` middleware before the controller.
- All controllers wrap handlers in `asyncHandler` (`utils/asyncHandler.js`).
- Document every route with `@openapi` JSDoc comments in the route file.

## Anonymity rule (critical)

Mood responses must NEVER expose `studentId`, `name`, `email`, or the raw `author` ObjectId. All mood serialization goes through `Mood.toPublicJSON(viewer)`, which exposes only: `alias`, `faculty`, `major`, `year`, plus viewer-relative `isOwner` / `canEdit` / `canDelete` flags computed server-side. The Mood document stores a denormalized anonymous snapshot (`authorAlias`, `authorFaculty`, etc.) at post time. Preserve this pattern in any new endpoint touching moods.

## Auth flow

- JWT access token (15m) returned in the response body; the client keeps it **in memory only** (`client/src/api/client.ts`), never in localStorage.
- Rotating refresh token (7d) in an httpOnly cookie scoped to path `/api/auth`; `POST /api/auth/refresh` rotates it and issues a new access token. Hashed refresh tokens are stored server-side for revocation.
- Axios response interceptor auto-refreshes on 401 (single-flight) and retries once; on refresh failure it triggers the AuthContext logout handler.
- Registration runs KMITL verification (`services/kmitlVerify.js`): uses the KMITL Developer API only if `KMITL_API_KEY` is set; otherwise a strict format fallback (8-digit studentId, email must be `<studentId>@kmitl.ac.th`, entry-year prefix plausibility vs. year of study). If the request carries a valid `ssoTicket` (below), both checks are skipped and `verificationMethod` is set to `'sso'`.
- KMITL SSO (OpenID Connect, `services/kmitlOidc.js`): `GET /api/auth/kmitl` 302-redirects to KMITL's Keycloak (`https://sso.kmitl.ac.th/realms/kmitl`, endpoints via OIDC discovery); `GET /api/auth/kmitl/callback` verifies a signed-JWT `state` (10m, CSRF protection), exchanges the code, fetches userinfo, and derives `studentId` from the `<8-digit>@kmitl.ac.th` email claim. Existing user → normal session + redirect to `${CLIENT_URL}/?sso=success`; new user → redirect to `${CLIENT_URL}/register?ssoTicket=<15m signed JWT>`; errors → `${CLIENT_URL}/login?ssoError=…` (always redirect, never JSON). Config via `KMITL_OIDC_ISSUER` / `KMITL_OIDC_CLIENT_ID` / `KMITL_OIDC_CLIENT_SECRET` / `KMITL_OIDC_REDIRECT_URI` (see `server/.env.example`); SSO is disabled unless client id + secret are set. Never log or commit the real credentials in `server/.env`.
- Client SSO conventions: `loginWithKmitl()` in `client/src/api/auth.ts` does a full-page redirect to `/api/auth/kmitl` (not an axios call); `RegisterPage` reads the `ssoTicket` query param, uses `decodeSsoTicket()` for display-only prefill (server re-verifies the signature), locks studentId/email, and passes the ticket through `AuthContext.register(values, ssoTicket?)`; `LoginPage` surfaces the `ssoError` query param.
- RBAC: roles `student` | `admin`. Middleware: `authenticate` (required), `optionalAuthenticate` (public reads that personalize `isOwner`), `authorize('admin')` (e.g. `/api/admin/moods`).

## Code conventions

Server (CommonJS JS):
- Flow per endpoint: validator (`validators/`) → route with middleware chain (`routes/`) → controller (`controllers/`) → model/service. Business helpers live in `services/`.
- Mood/role constants come from `config/constants.js`; don't duplicate literals.

Client (TypeScript):
- All HTTP goes through `src/api/*` functions using the shared axios instance; raw responses are normalized in `src/api/normalize.ts` (defensive envelope/shape handling) before reaching contexts or components. Surface errors via `getErrorMessage`.
- State: `AuthContext` (session, tokens) and `MoodContext` (board data, filters). Pages consume contexts, not the api layer directly, where a context exists.
- Forms use React Hook Form + Zod resolvers; schemas in `src/lib/schemas.ts`.
- Mood display metadata (label/emoji/color/tint) in `src/lib/moods.ts` (`MOOD_META`) — mirror of server `MOOD_COLORS`/`MOOD_EMOJIS`. Keep both sides in sync when changing mood types.
- Path alias `@/` → `client/src/`.

Mood types and colors (shared contract):
`happy #FFE066 · calm #A8DADC · tired #CDB4DB · stressed #F4A261 · sad #90CAF9 · excited #FF9F1C · angry #E63946`

## Dev/test credentials (local only)

Admin seed via `cd server && npm run seed:admin`: studentId `99999999`, password `Admin123!` (configurable in `server/.env`). Never use or log real KMITL credentials.

## Known limitations

- Live KMITL Developer API (profile lookup) verification is not wired up by default (`KMITL_API_KEY` unset → format-check fallback; API errors also fall back to format check). Live identity verification is instead covered by KMITL SSO, which requires `KMITL_OIDC_CLIENT_ID`/`KMITL_OIDC_CLIENT_SECRET` in `server/.env` (self-service from https://developer.kmitl.ac.th/console/sso); the full interactive SSO login has not yet been exercised with real credentials.
- No deployment setup — local development only (Docker Mongo + two dev servers).
- No automated test suite; verify manually via Swagger UI and the client.
