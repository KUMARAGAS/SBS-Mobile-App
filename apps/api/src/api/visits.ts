import { Router } from 'express';

import { VisitCheckInSchema, type VisitCheckIn } from '@sbs/shared';

import { checkIn } from '../application/visits.js';
import { sendSuccess } from '../domain/utils/response.js';
import {
  isAuthenticated,
  isAuthenticatedRequest,
} from './middlewares/authentication-middleware.js';
import { validate } from './middlewares/validate.js';

/**
 * LAYER 1 — visits router (J3 check-in/out). HTTP only.
 */
export const visitsRouter: Router = Router();

visitsRouter.use(isAuthenticated);

/** POST /v1/visits/check-in — Start travel / Arrived. Idempotent (D16). */
visitsRouter.post('/check-in', validate(VisitCheckInSchema, 'body'), async (req, res, next) => {
  try {
    if (!isAuthenticatedRequest(req)) {
      throw new Error('isAuthenticated must run before visits handlers');
    }
    const body = res.locals.validated?.body as VisitCheckIn;
    const data = await checkIn(req.auth.userId, req.auth.orgId ?? 'dev-org', body);
    sendSuccess(res, data, 201);
  } catch (cause) {
    next(cause);
  }
});
