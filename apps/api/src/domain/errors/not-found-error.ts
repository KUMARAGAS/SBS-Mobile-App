import { AppError } from './app-error.js';

/** 404 — unknown ticket / visit / employee id. */
export class NotFoundError extends AppError {
  constructor(message = 'Not found', details?: unknown) {
    super(404, message, details);
  }
}
