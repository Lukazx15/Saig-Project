# Mood of the Major (Saig-Project)

Anonymous mood-sharing corkboard for KMITL students. Students pin post-it notes with their mood; the board stays calm, colorful, and privacy-first.

## Monorepo layout

| Path | Purpose |
|------|---------|
| `client/` | React + Vite + Tailwind frontend (Phase 2+) |
| `server/` | Express + Mongoose API (Phase 2+) |
| `docker-compose.yml` | Local MongoDB 7 on port `27017` |

## Prerequisites

- Node.js 20+
- Docker Desktop (preferred for MongoDB), **or** a local MongoDB / Atlas connection string
- GitHub CLI (`gh`) for repo workflows

## Local MongoDB

```bash
docker compose up -d
```

Connection string (default):

```text
mongodb://127.0.0.1:27017/mood-of-the-major
```

If Docker is unavailable, use a MongoDB MCP local Atlas deployment (or any MongoDB URI) and set `MONGODB_URI` in `server/.env` once the server is scaffolded.

## Development (after Phase 2 scaffolding)

```bash
npm run install:all
npm run docker:up
npm run dev:server
npm run dev:client
```

## Status

Phase 1 bootstrap only: empty `client/` and `server/` directories, Docker Compose for MongoDB, and this README. Application code lands in later phases.
