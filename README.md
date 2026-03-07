# Harmoni

Linear-inspired real-time collaboration platform. Single codebase for web and desktop, with live sync across clients.

**This repo is also a base project / template** for new apps. See [Use as base project](#use-as-base-project) and [docs/TEMPLATE.md](docs/TEMPLATE.md).

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
│   ├── shared/     # Types, schemas, logger
│   └── create-harmoni/  # Scaffold CLI (pnpm create harmoni)
├── docs/           # TEMPLATE.md, CUSTOMIZATION.md
├── scripts/        # setup.mjs (pnpm run setup)
├── docker-compose.yml
├── .env            # Copy from .env.example (or run pnpm run setup)
└── pnpm-workspace.yaml
```

## Quick Start

**First time (e.g. fresh clone)?** Run one-time setup, then start services:

```bash
pnpm install
pnpm run setup          # Creates .env from .env.example if missing
docker compose up -d
psql -U postgres -h localhost -c "CREATE DATABASE harmoni;"
pnpm db:migrate
pnpm dev
```

**Already configured?**

```bash
pnpm dev
# Or run individually:
pnpm dev:web       # Web at http://localhost:3000
pnpm dev:backend   # API at http://localhost:4000/graphql
pnpm dev:desktop   # Electron app (loads web on port 3000)
```

## Use as base project

This repo can be used as a **template** for new projects (web + desktop monorepo with GraphQL, auth, shared packages).

**One-command install (no clone):**

```bash
pnpm create harmoni my-project
cd my-project
docker compose up -d
psql -U postgres -h localhost -c "CREATE DATABASE harmoni;"
pnpm db:migrate
pnpm dev
```

- **Quick start from template:** [docs/TEMPLATE.md](docs/TEMPLATE.md)
- **Rebranding / renaming:** [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md)
- **One-time setup:** `pnpm run setup` (creates `.env` from `.env.example`)

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

- **Development** (`pnpm dev:desktop`): Desktop opens a window onto the live Vite dev server. Changes in `apps/web` sync automatically (hot reload); no build needed.
- **Production** (`pnpm start` or packaged app): Desktop serves the static files in `web-dist/`. Run `pnpm build` (or `pnpm --filter @harmoni/desktop build`) first so the latest web app is bundled into `web-dist/`.

On Linux when running as root (e.g. Docker/WSL), Electron requires `--no-sandbox`; this is already set in the scripts.

### Desktop builds (Windows / macOS)

Package the desktop app into installers/portable builds using [electron-builder](https://www.electron.build/). Build on the **target OS** (no cross-compilation: Mac builds → macOS; Windows builds → Windows).

From the repo root:

```bash
# Install dependencies (includes electron-builder)
pnpm install

# Build for current OS only
pnpm --filter @harmoni/desktop pack:mac    # macOS: .dmg + .zip in apps/desktop/release/
pnpm --filter @harmoni/desktop pack:win    # Windows: .exe installer (NSIS) + portable in apps/desktop/release/

# Or build both (run on each OS, or use CI with two runners)
pnpm --filter @harmoni/desktop pack:all
```

Output goes to `apps/desktop/release/`:

| OS       | Artifacts |
| -------- | --------- |
| **macOS**  | `Harmoni-<version>.dmg`, `Harmoni-<version>-mac.zip` |
| **Windows** | `Harmoni Setup <version>.exe` (NSIS installer), `Harmoni <version> Portable.exe` |
