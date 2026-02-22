# Harmoni

real-time collaboration platform. Single codebase for web and desktop, with live sync across clients.

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | TypeScript, React, MobX, IndexedDB (idb-keyval) |
| **API** | GraphQL (Apollo), WebSocket |
| **Backend** | Node.js, PostgreSQL (Drizzle), Redis |
| **Desktop** | Electron (shared web codebase) |
| **Infra** | Docker, GCP-ready (Kubernetes, CDN) |

## Project Structure

```
harmoni/
├── apps/
│   ├── backend/    # GraphQL API, WebSocket, PostgreSQL, Redis
│   ├── web/        # React + MobX + Vite
│   └── desktop/    # Electron wrapper
├── packages/
│   └── shared/     # Shared types and utilities
├── docker-compose.yml
└── pnpm-workspace.yaml
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Start Postgres & Redis
docker compose up -d

# Run backend + web
pnpm dev

# Or run individually:
pnpm dev:web       # http://localhost:3000
pnpm dev:backend   # http://localhost:4000/graphql
pnpm dev:desktop   # Electron app (loads web)
```

## Database

```bash
pnpm db:generate   # Generate migrations
pnpm db:migrate    # Run migrations
```

## Environment

Copy `.env.example` to `.env` and adjust.
