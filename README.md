# Knowem

Knowem is a Vue 3 + Vite + TypeScript multiplayer party card game with a static frontend prepared for Vercel and a separately hosted Socket.io backend.

## Architecture

- Frontend: `src/` builds to `dist/` and is safe to deploy as a static SPA on Vercel.
- Backend: `server/` contains the Express + Socket.io realtime server, game engine, and socket handlers for Render, Railway, or another Node host.
- Shared contracts: `shared/` contains TypeScript types used by both sides.

## Frontend Deployment

The frontend expects a public Vite environment variable:

```bash
VITE_SOCKET_URL=https://your-backend-url.example.com
```

For local production validation, copy [.env.production.example](c:/Users/asust/Downloads/Knowem/.env.production.example) to `.env.production.local` and replace the placeholder with your hosted backend URL.

### Vercel Settings

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_SOCKET_URL`

Production builds now fail fast if `VITE_SOCKET_URL` is missing, so Vercel will block a broken frontend deploy instead of shipping a runtime connection error.

SPA refresh support is handled by [vercel.json](vercel.json).

## Backend Deployment

The backend is intended to be hosted separately from Vercel.

### Required Environment Variables

```bash
PORT=3001
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

`CORS_ORIGIN` accepts a comma-separated list of allowed frontend origins.

### Backend Commands

- Development: `npm run dev:server`
- Build: `npm run build:server`
- Start: `npm run start:server`

### Deploy Backend First

You need the backend deployed before configuring Vercel, because the frontend depends on the hosted Socket.io URL.

#### Option A: Render

This repo includes [render.yaml](render.yaml), so you can use Render Blueprint or create a Web Service manually.

Manual settings:

- Runtime: `Node`
- Build command: `npm install && npm run build:server`
- Start command: `npm run start:server`
- Health check path: `/health`

Environment variables:

- `PORT`: leave Render default or set explicitly
- `CORS_ORIGIN`: `https://your-vercel-app.vercel.app`

After deploy, copy the public backend URL, for example:

```bash
https://knowem-realtime-backend.onrender.com
```

#### Option B: Railway

This repo includes [railway.json](railway.json).

Recommended Railway setup:

- Deploy from this repo root
- Build command: automatic via Nixpacks
- Start command: `npm run start:server`
- Health check path: `/health`

Environment variables:

- `PORT`: Railway usually injects this automatically
- `CORS_ORIGIN`: `https://your-vercel-app.vercel.app`

After deploy, copy the generated HTTPS backend URL.

## Vercel Frontend Setup

Once the backend is live, set the frontend environment variable in Vercel:

```bash
VITE_SOCKET_URL=https://your-backend-url.example.com
```

Example:

```bash
VITE_SOCKET_URL=https://knowem-realtime-backend.onrender.com
```

To verify before pushing, set the same value in `.env.production.local` and run `npm run build` locally.

### Vercel Dashboard Values

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_SOCKET_URL`

## Recommended Deployment Order

1. Deploy the backend to Render or Railway.
2. Set `CORS_ORIGIN` on the backend to your Vercel frontend domain.
3. Copy the backend HTTPS URL.
4. Add `VITE_SOCKET_URL` in Vercel using that backend URL.
5. Deploy the frontend on Vercel.
6. Verify `/health` on the backend and a room create/join flow in the frontend.

## Local Development

```bash
npm install
npm run dev
```

For local frontend-to-backend communication, the socket service falls back to `http://localhost:3001` only in development when `VITE_SOCKET_URL` is not set.

## Project Layout

```text
.
├─ server/
│  ├─ gameEngine.ts
│  ├─ index.ts
│  └─ socketHandlers.ts
├─ shared/
├─ src/
│  ├─ components/
│  ├─ services/
│  ├─ stores/
│  └─ views/
├─ vercel.json
└─ .env.example
```

## Realtime Notes

- The frontend socket client uses `import.meta.env.VITE_SOCKET_URL`.
- Reconnect handling and fallback UI are built into the Pinia game store.
- The app surfaces backend-unreachable and reconnect states in the UI before players enter a room and while they are in-game.

## Build Scripts

- `npm run build`: frontend-only Vercel-safe build
- `npm run build:server`: backend TypeScript build
- `npm run build:full`: both frontend and backend builds

## Operational Notes

- Vercel does not host the Socket.io server for this app.
- Use an HTTPS backend URL in `VITE_SOCKET_URL`; Socket.io will upgrade appropriately for secure deployments.
- Keep secrets out of the frontend. Only `VITE_` public variables should be exposed to Vercel.
- For multiple frontend domains, set `CORS_ORIGIN` as a comma-separated list.