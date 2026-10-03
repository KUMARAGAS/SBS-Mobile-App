import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit config (C5 resolved: Drizzle + Neon, PLAN.md D2).
 * `DATABASE_URL` must be set — loaded from `apps/api/.env` via dotenv
 * when running `drizzle-kit` with `--config`. Tables: `employees`, `tickets`
 * (F1 slice; visits/customers/assets arrive in F2–F3).
 */
export default defineConfig({
  schema: './src/infrastructure/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // drizzle-kit reads env at CLI time; `dotenv -e .env --` prefix recommended.
    url: process.env.DATABASE_URL ?? '',
  },
});
