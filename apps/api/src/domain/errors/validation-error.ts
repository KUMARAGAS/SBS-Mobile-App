import { AppError } from './app-error.js';

/** 400 — Zod / input validation failure. Raised by `validate()`. */
export class ValidationError extends AppError {
  constructor(message = 'Invalid request', details?: unknown) {
    super(400, message, details);
  }
}
