import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';

import { employeesRouter } from './api/employees.js';
import { ticketsRouter } from './api/tickets.js';
import { visitsRouter } from './api/visits.js';
import { globalErrorHandler } from './api/middlewares/global-error-handling-middleware.js';
import { sendSuccess } from './domain/utils/response.js';

const BOOT_TIME = Date.now();

/**
 * ENTRY POINT — bootstrap only (§8.5 layer rule 5): middleware → routers →
 * listen → graceful shutdown. No business rules here. DB is lazy (`getDb()`
 * connects on first query, C5 Drizzle/Neon) so boot never blocks on Neon.
 */
export function createApp(): express.Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      // Per-environment allowlists (R23): exact origins, never `*` with creds.
      origin: (process.env.SBS_CORS_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  // R22 — host restart policy + uptime alerting target.
  app.get('/healthz', (_req, res) => {
    sendSuccess(res, {
      ok: true as const,
      version: process.env.npm_package_version ?? '0.1.0',
      uptimeSeconds: Math.floor((Date.now() - BOOT_TIME) / 1000),
    });
  });

  app.use('/v1/employees', employeesRouter);
  app.use('/v1/tickets', ticketsRouter);
  app.use('/v1/visits', visitsRouter);

  app.use((_req, res) => {
    sendSuccess(res, null, 404);
  });

  // 4-arg handler — must stay after every route.
  app.use(globalErrorHandler);

  return app;
}

const PORT = Number(process.env.PORT ?? 4000);

function isMainModule(): boolean {
  const entry = process.argv[1] ?? '';
  return entry.endsWith('apps/api/src/index.ts') || entry.endsWith('apps/api/dist/index.js');
}

if (isMainModule()) {
  const app = createApp();
  const server = app.listen(PORT, () => {
    console.log(`[api] listening on :${PORT} (auth ${process.env.SBS_AUTH_DISABLED === '1' ? 'DISABLED — dev only' : 'clerk'})`);
  });

  const shutdown = (signal: string): void => {
    console.log(`[api] ${signal} — draining`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
