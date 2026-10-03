import type { NextFunction, Request, Response } from 'express';

import { AppError, mapStatusToCode } from '../../domain/errors/app-error.js';
import { sendError } from '../../domain/utils/response.js';

/**
 * LAYER 1 — 4-arg Express error handler (must stay last via `app.use`).
 *
 * `AppError` subclasses carry their own status; Clerk / Zod / unknown
 * throwables collapse to 500 with a generic message so internals never
 * leak. Auth failures (401 via `AppError` base) flow through here too.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function globalErrorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (res.headersSent) {
    return;
  }

  if (err instanceof AppError) {
    sendError(res, err.status, err.code, err.message, err.details);
    return;
  }

  if (err instanceof Error) {
    const status = (err as { status?: unknown }).status;
    const code = (err as { code?: unknown }).code;
    // Clerk + body-parser style errors already carry a status — honour it
    // but still hide the message behind the stable code (R23 401/403 tests
    // assert shape, not leaked strings).
    if (typeof status === 'number' && status >= 400 && status < 500) {
      sendError(res, status, mapStatusToCode(status), 'Request failed');
      return;
    }
    if (code === 'ERR_BAD_REQUEST' || code === 'EBADCSRFTOKEN') {
      sendError(res, 400, 'BAD_REQUEST', 'Request failed');
      return;
    }
    console.error('[api] unhandled error', err);
  } else {
    console.error('[api] non-error thrown', err);
  }

  sendError(res, 500, 'INTERNAL_ERROR', 'Something went wrong');
}
