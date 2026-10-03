/**
 * @sbs/shared — ticket domain enums.
 *
 * Single source of record for every ticket status / priority / complaint type
 * that crosses the API boundary (PLAN.md D15/D18, §7 draft data model, J2).
 * Import — never copy — into apps/api, apps/mobile, apps/admin.
 */
export const TICKET_STATUSES = [
  'new',
  'assigned',
  'accepted',
  'travelling',
  'on_site',
  'completed',
  'approved',
  'closed',
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;

export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

/** Coordinator intake categories (PLAN.md J2 — complaint type). */
export const COMPLAINT_TYPES = [
  'breakdown',
  'preventive_maintenance',
  'installation',
  'inspection',
  'new_site_survey',
  'other',
] as const;

export type ComplaintType = (typeof COMPLAINT_TYPES)[number];
