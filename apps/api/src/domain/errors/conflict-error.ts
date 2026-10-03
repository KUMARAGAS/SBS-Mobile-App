import { AppError } from './app-error.js';

/**
 * 409 — idempotency replay with a *different* payload on the same key, or a
 * genuine write-write conflict. Same key + same payload returns the stored
 * result instead (D16 outbox replays must be safe to retry).
 */
export class ConflictError extends AppError {
  constructor(message = 'Conflict', details?: unknown) {
    super(409, message, details);
  }
}
