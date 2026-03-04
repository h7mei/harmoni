#!/usr/bin/env node
/**
 * One-time setup for using this repo as a base project.
 * Run: pnpm run setup
 * - Copies .env.example → .env if .env does not exist
 * - Prints next steps (DB, migrate, dev)
 */
import { copyFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envExample = join(root, ".env.example");
const env = join(root, ".env");

if (!existsSync(envExample)) {
  console.error("Missing .env.example in project root.");
  process.exit(1);
}

if (existsSync(env)) {
  console.log(".env already exists. Skipping copy.");
} else {
  copyFileSync(envExample, env);
  console.log("Created .env from .env.example.");
}

console.log(`
Next steps:
  1. Start Postgres (and optionally Redis):
     docker compose up -d

  2. Create the database (if needed):
     psql -U postgres -h localhost -c "CREATE DATABASE harmoni;"
     (Or use the DB name you set in .env DATABASE_URL.)

  3. Run migrations:
     pnpm db:migrate

  4. Start development:
     pnpm dev

  See README.md for full docs. Using as a different project? See docs/CUSTOMIZATION.md.
`);
