import { z } from 'zod';

import { COMPLAINT_TYPES, TICKET_PRIORITIES, TICKET_STATUSES } from '../enums/ticket.js';

/**
 * Ticket — coordinator intake + dispatch record (PLAN.md J2).
 *
 * Mirrors across API layers as `api/tickets.ts ↔ application/tickets.ts ↔
 * domain/dtos/tickets.ts` (§8.5 naming convention). API-only shapes stay in
 * `apps/api/src/domain/dtos`; everything crossing the wire lives here (C7).
 */
export const TicketSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(TICKET_STATUSES).default('new'),
  priority: z.enum(TICKET_PRIORITIES).default('normal'),
  complaintType: z.enum(COMPLAINT_TYPES).default('breakdown'),
  customerId: z.string().min(1),
  siteId: z.string().min(1).optional(),
  assetId: z.string().min(1).optional(),
  assigneeId: z.string().min(1).optional(),
  officeCode: z.string().min(1).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Ticket = z.infer<typeof TicketSchema>;

/** `GET /v1/tickets/mine` query — technician's own queue ("My Jobs", J3). */
export const MyTicketsQuerySchema = z.object({
  status: z.enum(TICKET_STATUSES).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export type MyTicketsQuery = z.infer<typeof MyTicketsQuerySchema>;

/** `GET /v1/tickets/mine` response envelope payload. */
export const MyTicketsResponseSchema = z.object({
  tickets: z.array(TicketSchema),
  nextCursor: z.string().nullable(),
});

export type MyTicketsResponse = z.infer<typeof MyTicketsResponseSchema>;
