# Mood of the Major

Anonymous mood-sharing corkboard for **KMITL** students. Sign in with KMITL SSO, pin a short post-it with how you feel, and browse the campus board — without exposing anyone’s real name or student ID.

**Live app:** [saig-project.vercel.app](https://saig-project.vercel.app)

Public notes show only an **alias**, **faculty**, **major**, and **year**.

---

## Features

- **Corkboard feed** — color-coded mood notes (happy, calm, tired, stressed, sad, excited, angry) with filter, search, and pagination
- **Anonymous by design** — real identity stays on the server; the API never returns student ID, name, or email on moods
- **KMITL SSO registration** — new accounts must continue with KMITL OIDC first; the register form is prefilled from SSO, then you choose faculty/major and set a local password
- **Password or SSO login** — existing users can sign in with student ID + password or KMITL SSO
- **Campus Vibe** — mood distribution and faculty breakdown (`/stats`)
- **Admin moderation** — remove inappropriate notes (`/admin`)
- **API docs** — Swagger UI at `/api-docs`

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion |
| Backend | Express 4, Mongoose 8 (CommonJS) |
| Database | MongoDB 7 (Docker Compose locally) |
| Production | [Vercel](https://saig-project.vercel.app) (client) + Render (API) + MongoDB Atlas — see [DEPLOY.md](./DEPLOY.md) |

---

## Repository layout

```text
├── client/              # React SPA (Vite)
├── server/              # Express API
├── docker-compose.yml   # Local MongoDB (saig-mongo :27017)
├── render.yaml          # Render blueprint for the API
└── DEPLOY.md            # Production deploy checklist
```

---

## Prerequisites

- **Node.js 20+**
- **Docker** (recommended for MongoDB), or any MongoDB URI (Atlas, local install, etc.)
- **KMITL SSO credentials** (required for registration) — [developer.kmitl.ac.th](https://developer.kmitl.ac.th/console/sso)

---

## Quick start

```bash
# 1. Install dependencies
npm run install:all

# 2. Env files
cp server/.env.example server/.env
cp client/.env.example client/.env

# 3. Start MongoDB
npm run docker:up

# 4. Seed a local admin account (once)
cd server && npm run seed:admin && cd ..

# 5. Run API + client (separate terminals)
npm run dev:server   # http://localhost:4000
npm run dev:client   # http://localhost:5173
```

| Service | URL |
|---------|-----|
| Client | http://localhost:5173 |
| API | http://localhost:4000 |
| Swagger | http://localhost:4000/api-docs |
| Production | https://saig-project.vercel.app |

Default MongoDB URI: `mongodb://127.0.0.1:27017/mood-of-the-major`

---

## Environment

### Server (`server/.env`)

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default `4000`) |
| `MONGODB_URI` | Mongo connection string |
| `CLIENT_URL` | Frontend origin (CORS + cookies), e.g. `http://localhost:5173` |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | JWT signing secrets |
| `ADMIN_*` | Values used by `npm run seed:admin` |
| `KMITL_OIDC_CLIENT_ID` / `SECRET` / `REDIRECT_URI` | Required for registration — KMITL SSO (OIDC) |

### Client (`client/.env`)

```bash
VITE_API_URL=http://localhost:4000
```

---

## Auth & privacy

1. **Register** — Continue with KMITL SSO → identity ticket → complete faculty, major, and password on `/register`
2. **Login** — student ID + password, or Sign in with KMITL
3. **Tokens** — access JWT (~15m) in memory on the client; refresh token (7d) in an httpOnly cookie under `/api/auth`, rotated on refresh
4. **Moods** — responses use `Mood.toPublicJSON()` (alias / faculty / major / year only, plus viewer flags like `isOwner`)

---

## Scripts (repo root)

| Script | What it does |
|--------|----------------|
| `npm run install:all` | Install server + client deps |
| `npm run docker:up` / `docker:down` | Start / stop MongoDB |
| `npm run dev:server` | API with nodemon |
| `npm run dev:client` | Vite dev server |

From `server/`: `npm run seed:admin` creates the local admin user.

**Local admin (dev only):** studentId `99999999` · password `Admin123!`  
(Configurable via `ADMIN_*` in `server/.env`. Do not use real KMITL credentials.)

---

## Deploy

Production target is **MongoDB Atlas + Render (API) + Vercel (client)**.

- Live frontend: [https://saig-project.vercel.app](https://saig-project.vercel.app)
- Full steps, env vars, and cookie/CORS notes: **[DEPLOY.md](./DEPLOY.md)**

---

## License

Private student project (`Saig-Project`).
