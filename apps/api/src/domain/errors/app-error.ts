/**
 * LAYER 3 — error base (§8.5 `domin/errors/app-error.ts`).
 *
 * Pure domain: no Express types, no DB imports, no `process.env`. Every
 * status maps to a stable wire `code` so clients switch on `code`, not on
 * message text. 401s are raised through this base by the auth middleware —
 * no dedicated `unauthorized-error.ts` (client request, 21 Sep 2026).
 */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = mapStatusToCode(status);
    this.details = details;
  }
}

/** Status → stable wire code. Keep in sync with `sendError()` consumers. */
export function mapStatusToCode(status: number): string {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'UNPROCESSABLE';
    case 429:
      return 'RATE_LIMITED';
    default:
      return status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_FAILED';
  }
}
