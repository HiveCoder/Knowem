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
- Install command: `npm install`
- Environment variable: `VITE_SOCKET_URL`
- Production branch: `main`

If `VITE_SOCKET_URL` is missing in production, the app stays mounted, logs a warning, and shows the existing offline backend UI instead of crashing.

SPA refresh support is handled by [vercel.json](vercel.json).

### Vercel Import Flow

1. In Vercel, import the Git repository for this project.
2. Keep the project root at the repository root.
3. Let Vercel detect the app as a Vite frontend.
4. Confirm the build settings below before the first deploy.

```text
Framework Preset: Vite
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

Add the environment variable in Vercel before promoting to production:

```bash
VITE_SOCKET_URL=https://your-backend-url.example.com
```

Use the same value for `Preview` and `Production` unless you run separate backend environments.

## Backend Deployment

The backend is intended to be hosted separately from Vercel.

### Required Environment Variables

```bash
PORT=3000
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

`CORS_ORIGIN` accepts a comma-separated list of allowed frontend origins.
Entries may include `*` wildcards, which is useful for Vercel preview deployments such as `https://knowem-*.vercel.app`.

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
- `CORS_ORIGIN`: `https://your-vercel-app.vercel.app,https://your-project-*.vercel.app`

After deploy, copy the public backend URL, for example:

```bash
https://knowem-realtime-backend.onrender.com
```

If you are using the existing Render Blueprint shown in the dashboard, make sure the `knowem-realtime-backend` service is selected and finishes provisioning before you continue in Vercel.

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

Use the same deployed origin on both sides:

```bash
VITE_SOCKET_URL=https://your-backend-host.example.com
CORS_ORIGIN=https://your-app.vercel.app,https://your-project-*.vercel.app
```

### Vercel Dashboard Values

- Framework preset: `Vite`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_SOCKET_URL`

### Vercel CLI Option

If you prefer to finish the setup from the terminal instead of the dashboard:

```bash
vercel link
vercel env add VITE_SOCKET_URL production
vercel env add VITE_SOCKET_URL preview
vercel --prod
```

When prompted for the value, paste the HTTPS backend URL from Render or Railway.

## Recommended Deployment Order

1. Deploy the backend to Render or Railway.
2. Set `CORS_ORIGIN` on the backend to your Vercel frontend domain.
3. Copy the backend HTTPS URL.
4. Add `VITE_SOCKET_URL` in Vercel using that backend URL.
5. Deploy the frontend on Vercel.
6. Redeploy the backend if `CORS_ORIGIN` changed after the first frontend deploy.
7. Verify `/health` on the backend and a room create/join flow in the frontend.

For this repository's current naming, the backend can safely allow:

```bash
CORS_ORIGIN=https://knowem.vercel.app,https://knowem-*.vercel.app
```

## Local Development

```bash
npm install
npm run dev
```

For local frontend-to-backend communication, the socket service falls back to `http://localhost:3001` only in development when `VITE_SOCKET_URL` is not set.
The local backend default port is `3000`, so the frontend dev fallback and the server bootstrap now match.

For local production-like verification before pushing to Vercel:

```bash
copy .env.production.example .env.production.local
npm run build
```

Then replace the placeholder value in `.env.production.local` with your real hosted backend URL and run `npm run build` again.

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
- The socket service falls back to `http://localhost:3000` only during development.
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
- For multiple frontend domains, set `CORS_ORIGIN` as a comma-separated list. Wildcard entries such as `https://knowem-*.vercel.app` are supported by the backend.