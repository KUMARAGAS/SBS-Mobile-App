import type { Response } from 'express';

/**
 * LAYER 3 — response envelopes (§8.5 `domin/utils/response.ts`).
 *
 * Every success body is `{ ok: true, data }`; every error is
 * `{ ok: false, error: { code, message, details? } }` — matching
 * `@sbs/shared` `ApiSuccess` / `ApiError` so clients decode once.
 */
export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ ok: true, data });
}

export function sendError(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown,
): void {
  res.status(status).json({ ok: false, error: { code, message, ...(details === undefined ? {} : { details }) } });
}
