import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../../domain/errors/app-error.js';

/**
 * LAYER 1 — authentication middleware (§8.5 `authentication-middleware.ts`).
 *
 * C6 resolved as Clerk (D4/D7): production verifies the Clerk session
 * token via `@clerk/express` (`requireAuth()`). `AuthRequest` carries the
 * verified `userId` (+ `orgId` claim when tenancy lands, L5) for
 * `application/` to scope queries — handlers never re-parse tokens.
 *
 * Local dev without Clerk keys: set `SBS_AUTH_DISABLED=1` to install the
 * dev stub (constant `dev-user` identity, `Authorization` header ignored).
 * The stub refuses to install when `NODE_ENV=production` — seeded/bypassed
 * credentials must never reach a real environment (risk R27).
 */
export interface AuthRequest extends Request {
  auth: {
    userId: string;
    orgId?: string;
  };
}

export function isAuthenticatedRequest(req: Request): req is AuthRequest {
  return (req as Partial<AuthRequest>).auth?.userId !== undefined;
}

function installDevStub() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    (req as AuthRequest).auth = { userId: 'dev-user', orgId: 'dev-org' };
    next();
  };
}

/**
 * Guard factory — call per protected router (`router.use(isAuthenticated)`).
 * Lazy-requires `@clerk/express` so unit tests and `SBS_AUTH_DISABLED=1`
 * dev never touch the Clerk SDK. Uses `clerkMiddleware()` + `getAuth()`
 * (`requireAuth()` is deprecated and will be removed in the next major).
 */
export function isAuthenticated(req: Request, _res: Response, next: NextFunction): void {
  if (process.env.SBS_AUTH_DISABLED === '1') {
    if (process.env.NODE_ENV === 'production') {
      next(new AppError(500, 'SBS_AUTH_DISABLED must never be set in production'));
      return;
    }
    installDevStub()(req, _res, next);
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { clerkMiddleware, getAuth } = require('@clerk/express') as {
      clerkMiddleware: () => (req: Request, res: Response, next: NextFunction) => void;
      getAuth: (req: Request) => { userId?: string | null; orgId?: string | null };
    };
    clerkMiddleware()(req, _res, (err?: unknown) => {
      if (err) {
        next(new AppError(401, 'Not signed in'));
        return;
      }
      const { userId, orgId } = getAuth(req);
      if (!userId) {
        next(new AppError(401, 'Not signed in'));
        return;
      }
      (req as AuthRequest).auth = {
        userId,
        ...(orgId ? { orgId } : {}),
      };
      next();
    });
  } catch {
    next(
      new AppError(
        500,
        'Auth is not configured. Set Clerk keys or SBS_AUTH_DISABLED=1 for local dev.',
      ),
    );
  }
}
