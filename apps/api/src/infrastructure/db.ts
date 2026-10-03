import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';

import * as schema from './schema.js';

/** Typed Drizzle client for the F1 tables. */
export type Db = NeonHttpDatabase<typeof schema>;

/**
 * LAYER 4 — DB client (C5 resolved: Drizzle ORM + Neon Postgres, PLAN.md D2).
 *
 * Lazy singleton: `getDb()` throws a clear error if `DATABASE_URL` is
 * missing instead of crashing at import time (tests without a DB can still
 * import the module). HTTP driver (not pooled WebSocket) — matches the
 * serverless/container host model (Railway/Render, D17).
 */
let cachedDb: Db | null = null;

export function getDb(): Db {
  if (cachedDb) {
    return cachedDb;
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set. Add it to apps/api/.env (Neon dashboard → connection string).');
  }
  const sql = neon(url);
  cachedDb = drizzle(sql, { schema });
  return cachedDb;
}

/** Test seam — resets the cached client between tests. */
export function resetDbCache(): void {
  cachedDb = null;
}
