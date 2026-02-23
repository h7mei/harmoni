import { config } from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "drizzle-kit";

// Load .env from project root (apps/backend/ -> harmoni/)
config({ path: join(dirname(fileURLToPath(import.meta.url)), "../../.env") });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/harmoni",
  },
});
