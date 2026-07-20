# Mood of the Major — Client

React + Vite + Tailwind + Framer Motion frontend for the campus mood corkboard.

## Start

```bash
# from repo root
npm run dev:client

# or from client/
npm install
npm run dev
```

App: http://localhost:5173  
API (expected): http://localhost:4000

## Env

Copy `.env.example` to `.env` if needed:

```bash
VITE_API_URL=http://localhost:4000
```

Omit `VITE_API_URL` to use the default above. Dev server also proxies `/api` → `localhost:4000`.
