import type { Ticket } from '../schemas/ticket.js';
import type { Visit } from '../schemas/visit.js';

/**
 * @sbs/shared — inferred-type barrel.
 *
 * Re-export only: keeps `import type { Ticket } from '@sbs/shared'`
 * working without a second import path for types.
 */
export type { Ticket } from '../schemas/ticket.js';
export type { Visit } from '../schemas/visit.js';

/** Shared API envelope — every `apps/api` success body matches this. */
export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

/** Shared API error envelope — matches `sendError()` (§8.5 `domin/utils`). */
export interface ApiError {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
