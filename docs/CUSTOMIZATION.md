# Customization guide (rebranding the base project)

When using this repo as a base for a **different product**, update the following so the app name, package scope, and database align with your project.

## 1. Project and package names

| Location | Change |
|----------|--------|
| `package.json` | `"name": "harmoni"` → `"name": "your-project"` |
| `apps/backend/package.json` | `"name": "@harmoni/backend"` → `"name": "@your-scope/backend"` |
| `apps/web/package.json` | `"name": "@harmoni/web"` → `"name": "@your-scope/web"` |
| `apps/desktop/package.json` | `"name": "@harmoni/desktop"` → `"name": "@your-scope/desktop"` |
| `packages/shared/package.json` | `"name": "@harmoni/shared"` → `"name": "@your-scope/shared"` |

Update **workspace dependency names** in each app to match (e.g. `"@harmoni/shared": "workspace:*"` → `"@your-scope/shared": "workspace:*"`).

Update **root scripts** in `package.json` that use `--filter @harmoni/*` to your new scope (e.g. `--filter @your-scope/web`).

## 2. Imports

Search for `@harmoni/` and replace with your scope (e.g. `@your-scope/`):

- `apps/backend/src/**/*.ts`
- `apps/web/src/**/*.ts`
- Any other files that import from `@harmoni/shared`.

## 3. Database and environment

| Location | Change |
|----------|--------|
| `.env` | `DATABASE_URL=.../harmoni` → `.../your_db_name` |
| `.env.example` | Same as above (so new clones use your default DB name). |
| `docker-compose.yml` | `POSTGRES_DB: harmoni` → `POSTGRES_DB: your_db_name` |

Create the DB with the same name:  
`psql -U postgres -h localhost -c "CREATE DATABASE your_db_name;"`

## 4. Backend branding

| Location | Purpose |
|----------|---------|
| `apps/backend/src/logger.ts` | `createLogger("harmoni-backend")` → `createLogger("your-app-backend")` |
| `apps/backend/src/middleware/auth.ts` | `JWT_ISSUER = "harmoni"` → `"your-app"` (optional; keep consistent if you have multiple services). |

## 5. Web app storage keys

LocalStorage/IndexedDB keys are prefixed so multiple apps don’t clash. Update if you care about the prefix:

| File | Keys |
|------|------|
| `apps/web/src/stores/AuthStore.ts` | `harmoni:accessToken`, `harmoni:refreshToken`, `harmoni:user` |
| `apps/web/src/lib/authLink.ts` | `harmoni:accessToken` |
| `apps/web/src/lib/cache.ts` | `PREFIX = "harmoni:"` |

Replace `harmoni` with your app name (e.g. `myapp:accessToken`).

## 6. Desktop app (Electron)

| Location | Change |
|----------|--------|
| `apps/desktop/electron-builder.json` | `appId`, `productName` (e.g. `app.yourcompany.yourapp`, `Your App`) |
| `apps/desktop/src/main.ts` | Console log / window title if you use “harmoni” there. |

## 7. Default DB URL in code

Fallback connection strings (when `DATABASE_URL` is unset) appear in:

- `apps/backend/drizzle.config.ts`
- `apps/backend/src/db/index.ts`

Update the default DB name in the URL to match your project (or rely on `.env` and leave as-is).

## 8. README and docs

- Replace the main project description and “Harmoni” references in `README.md`.
- Adjust `docs/TEMPLATE.md` and this file if you’re publishing your own template.

## Checklist (copy and tick off)

- [ ] Root and all app/package `name` and `@scope` in `package.json`
- [ ] All `--filter @harmoni/*` → `--filter @your-scope/*` in root `package.json`
- [ ] All `@harmoni/` imports → `@your-scope/`
- [ ] `.env` and `.env.example`: `DATABASE_URL` and DB name
- [ ] `docker-compose.yml`: `POSTGRES_DB`
- [ ] Backend: logger name, JWT issuer (if desired)
- [ ] Web: storage key prefixes
- [ ] Desktop: `electron-builder.json` (`appId`, `productName`)
- [ ] README and docs

After renaming, run `pnpm install` and `pnpm build` to confirm the monorepo and builds still work.
