import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodType } from 'zod';

import { AppError } from '../../domain/errors/app-error.js';
import { ValidationError } from '../../domain/errors/validation-error.js';

/**
 * LAYER 1 — Zod schema → 400 validation middleware (§8.5 `api/middlewares`).
 *
 * Validates one request part (`body` by default) and stashes the parsed
 * value as `res.locals.validated[part]` so downstream handlers get coerced
 * types (e.g. `limit` arrives as a number, not a query string). Express 5
 * defines `req.query` as a getter-only accessor — assigning the parsed
 * value back onto `req.query` throws (`Cannot set property query ... which
 * has only a getter`) — so nothing is written back onto `req`.
 */
export function validate<T>(schema: ZodType<T>, part: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[part]);
      res.locals.validated = { ...(res.locals.validated ?? {}), [part]: parsed };
      next();
    } catch (cause) {
      if (cause instanceof ZodError) {
        next(
          new ValidationError('Invalid request', {
            part,
            issues: cause.issues.map((issue) => ({
              path: issue.path.join('.'),
              message: issue.message,
              code: issue.code,
            })),
          }),
        );
        return;
      }
      next(cause instanceof Error ? cause : new AppError(500, 'Validation failed'));
    }
  };
}
