import { AppError } from './app-error.js';

/**
 * 403 — authenticated but not allowed.
 *
 * Kept but currently unused (same review as `unauthorized-error.ts`:
 * flag if it should go the same way).
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details?: unknown) {
    super(403, message, details);
  }
}
