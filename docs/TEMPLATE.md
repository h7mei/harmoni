# Using Harmoni as a Base Project / Template

This repo is a **monorepo framework** you can use as the starting point for new apps: web + desktop from one codebase, with GraphQL API, auth, and real-time support.

## Quick start from template

1. **Get the code**
   - **One command (recommended):** `npx @hanafichoi/create-harmoni my-project` — downloads template, installs deps, runs setup. No clone needed.
   - Clone: `git clone <this-repo-url> my-project && cd my-project`
   - Or [Use this template](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template) on GitHub.

2. **Run one-time setup** (only if you cloned manually)
   ```bash
   pnpm install
   pnpm run setup
   ```
   This creates `.env` from `.env.example` if missing and prints next steps.

3. **Start services and app**
   ```bash
   docker compose up -d
   psql -U postgres -h localhost -c "CREATE DATABASE harmoni;"   # or your DB name
   pnpm db:migrate
   pnpm dev
   ```

4. **Optional: rebrand**  
   If you are building a different product, see [CUSTOMIZATION.md](./CUSTOMIZATION.md) for what to rename (project name, package scope, database, env, desktop app id, etc.).

## What you get

| Area | Stack |
|------|--------|
| **Web** | React, Vite, MobX, Apollo Client, Tailwind, shadcn-style UI |
| **Desktop** | Electron (loads web app) |
| **API** | Express, Apollo Server (GraphQL), WebSocket |
| **Data** | PostgreSQL (Drizzle ORM), Redis (optional) |
| **Shared** | Zod schemas, pino logger, TypeScript types |

## When to use this as a base

- You want **web + Electron desktop** from one codebase.
- You want **GraphQL + optional real-time** (WebSocket) from day one.
- You want **auth (JWT, refresh)** and a **shared package** for types/schemas.
- You prefer a **pnpm monorepo** with clear app/package boundaries.

## After cloning

- Replace this section in README with your own project description.
- Set `JWT_SECRET` and other secrets in `.env` for production.
- See [CUSTOMIZATION.md](./CUSTOMIZATION.md) for a full rebrand checklist.
