/**
 * @sbs/shared — visit domain enums.
 *
 * Visit = one attendance/job session against a ticket (PLAN.md §8.5
 * `visits.ts` — the core, J3). Technician lifecycle only moves forward;
 * server re-validates every transition (risk R2/R3).
 */
export const VISIT_STATUSES = [
  'travelling',
  'on_site',
  'completed',
] as const;

export type VisitStatus = (typeof VISIT_STATUSES)[number];
