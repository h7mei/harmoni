# Harmoni

Linear-inspired real-time collaboration platform. Single codebase for web and desktop, with live sync across clients.

## Tech Stack

| Layer    | Technologies                                          |
| -------- | ----------------------------------------------------- |
| Frontend | TypeScript, React, MobX, Apollo Client, IndexedDB     |
| API      | GraphQL (Apollo Server), WebSocket                    |
| Backend  | Node.js, Express, PostgreSQL (Drizzle), Redis (opt.)  |
| Desktop  | Electron (shared web codebase)                        |
| Shared   | Zod schemas, logger (pino), types                     |

## Project Structure

```
harmoni/
├── apps/
│   ├── backend/    # GraphQL API, WebSocket, Drizzle, Redis
│   ├── web/        # React + MobX + Vite
│   └── desktop/    # Electron wrapper (loads web app)
├── packages/
│   └── shared/     # Types, schemas, logger
├── docker-compose.yml
├── .env             # Copy from .env.example
└── pnpm-workspace.yaml
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Start Postgres & Redis (optional: backend runs without Redis in dev)
docker compose up -d

# Create database if needed
psql -U postgres -h localhost -c "CREATE DATABASE harmoni;"

# Run migrations
pnpm db:migrate

# Run all apps
pnpm dev

# Or run individually:
pnpm dev:web       # Web at http://localhost:3000
pnpm dev:backend   # API at http://localhost:4000/graphql
pnpm dev:desktop   # Electron app (loads web on port 3000)
```

## Database

```bash
pnpm db:generate   # Generate Drizzle migrations
pnpm db:migrate    # Run migrations
```

Migrations live in `apps/backend/drizzle/migrations/`. The backend loads `.env` from the project root.

## Build

```bash
pnpm build   # Build all apps (shared, backend, web, desktop)
```

The desktop app bundles the web build into `apps/desktop/web-dist/` for production.

## Environment

Copy `.env.example` to `.env` at the project root:

| Variable      | Description                    | Default                          |
| ------------- | ------------------------------ | -------------------------------- |
| PORT          | Backend port                   | 4000                             |
| DATABASE_URL  | PostgreSQL connection string   | postgresql://...@localhost:5432/harmoni |
| REDIS_URL     | Redis URL (optional in dev)    | redis://localhost:6379           |
| JWT_SECRET    | JWT signing secret             | Change in production             |
| CORS_ORIGINS  | Allowed origins                | http://localhost:3000            |
| LOG_LEVEL     | Log level (debug, info, etc.)  | info                             |

## Desktop

The Electron app loads the web app via `http://localhost:3000` in development. In production it serves the bundled web build from `web-dist/`.

On Linux when running as root (e.g. Docker/WSL), Electron requires `--no-sandbox`; this is already set in the scripts.
