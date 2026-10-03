import { Router } from 'express';

import { MyTicketsQuerySchema, type MyTicketsQuery } from '@sbs/shared';

import { listMyTickets } from '../application/tickets.js';
import { sendSuccess } from '../domain/utils/response.js';
import {
  isAuthenticated,
  isAuthenticatedRequest,
} from './middlewares/authentication-middleware.js';
import { validate } from './middlewares/validate.js';

/**
 * LAYER 1 — tickets router. HTTP only: auth → validate → service → envelope.
 * Never touches `infrastructure/` directly (§8.5 layer rule 1).
 */
export const ticketsRouter: Router = Router();

ticketsRouter.use(isAuthenticated);

/** GET /v1/tickets/mine — technician's own queue ("My Jobs", J3). */
ticketsRouter.get('/mine', validate(MyTicketsQuerySchema, 'query'), async (req, res, next) => {
  try {
    if (!isAuthenticatedRequest(req)) {
      throw new Error('isAuthenticated must run before tickets handlers');
    }
    const query = res.locals.validated?.query as MyTicketsQuery;
    const data = await listMyTickets(req.auth.userId, query);
    sendSuccess(res, data);
  } catch (cause) {
    next(cause);
  }
});
