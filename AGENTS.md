# AGENTS.md

See `CLAUDE.md` for the full architecture, API conventions, anonymity rule, auth flow, and code conventions. This file adds environment/run notes for agents.

## Cursor Cloud specific instructions

Standard install/run/lint commands live in `CLAUDE.md` ("How to run") and the root/`client`/`server` `package.json` scripts. Notes below cover only non-obvious caveats for this VM.

### Services

- `server/` — Express + Mongoose API on `http://localhost:4000` (Swagger at `/api-docs`). Run with `npm run dev:server` from repo root. Needs MongoDB running first.
- `client/` — React + Vite dev server on `http://localhost:5173`. Run with `npm run dev:client` from repo root. Lint with `npm run lint` (oxlint) in `client/`; a few `only-export-components` warnings are pre-existing and non-blocking.
- MongoDB — required by the server.

### MongoDB is native here, not Docker

Docker is not available in this VM, so `npm run docker:up` / `docker compose` will NOT work. MongoDB 7.0 (`mongodb-org`) is installed natively and persists in the VM snapshot. Start it before the server (it is not auto-started):

```bash
mongod --dbpath /workspace/.mongo-data --port 27017 --bind_ip 127.0.0.1
```

The default `MONGODB_URI=mongodb://127.0.0.1:27017/mood-of-the-major` in `server/.env` points at it. Run once after a fresh DB to create the admin: `cd server && npm run seed:admin` (studentId `99999999`, password `Admin123!`).

### `.env` files

`server/.env` and `client/.env` are gitignored. The update script copies them from the `.env.example` files if missing; the defaults are correct for local dev.

### Registration verification gotcha (format fallback)

With no `KMITL_API_KEY`/SSO configured (the default), registration uses a strict format check in `server/src/services/kmitlVerify.js`. A new student's 8-digit ID must start with a Buddhist-calendar entry-year prefix that matches the chosen year of study, or you get "KMITL student verification failed". The valid prefix shifts every calendar year. Compute a valid year-1 ID prefix with:

```bash
node -e "console.log((new Date().getFullYear()+543)%100)"
```

Then use `<prefix>NNNNNN` with email `<prefix>NNNNNN@kmitl.ac.th` (e.g. prefix `69` → `69012345`). Logging in as the seeded admin avoids this entirely.
