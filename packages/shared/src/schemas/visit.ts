import { z } from 'zod';

import { VISIT_STATUSES } from '../enums/visit.js';

/**
 * Visit — one attendance/job session against a ticket (PLAN.md J3, §8.5
 * `visits.ts` — the core). Device timestamp captured at action time (R3);
 * server stamps `receivedAt` and flags skew (R15).
 */
export const VisitSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().min(1),
  ticketId: z.string().uuid(),
  technicianId: z.string().min(1),
  status: z.enum(VISIT_STATUSES),
  /** Device clock at the moment the technician tapped (ISO datetime). */
  deviceAt: z.string().datetime(),
  /** Server clock when the write was received (set by API, R15). */
  receivedAt: z.string().datetime().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  notes: z.string().max(2000).optional(),
  /** Idempotency key — survives outbox replays + restarts (D16). */
  idempotencyKey: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Visit = z.infer<typeof VisitSchema>;

/** `POST /v1/visits/check-in` body — Start travel / Arrived (J3 steps 2-3). */
export const VisitCheckInSchema = z.object({
  ticketId: z.string().uuid(),
  status: z.enum(VISIT_STATUSES),
  deviceAt: z.string().datetime(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  idempotencyKey: z.string().uuid(),
});

export type VisitCheckIn = z.infer<typeof VisitCheckInSchema>;
