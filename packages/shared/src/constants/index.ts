/**
 * @sbs/shared — shared literals.
 *
 * SLA windows, pagination defaults, sync policy values that all three
 * deployables must agree on (PLAN.md §8.5, R24/R10). No runtime deps.
 */

/** Default page size for ticket / visit lists (mobile + admin agree). */
export const DEFAULT_PAGE_SIZE = 20 as const;

/** Max page size the API will honour (guards cheap Android data budgets). */
export const MAX_PAGE_SIZE = 100 as const;

/** Keep RTK Query cache briefly — stale job data is risk R24. Seconds. */
export const KEEP_UNUSED_DATA_FOR_SECONDS = 60 as const;

/** Photo upload policy (R4/R10 — ImageKit caps, metered mobile data). */
export const MEDIA_CONSTRAINTS = {
  maxPhotosPerVisit: 8,
  maxBytesPerPhoto: 5 * 1024 * 1024,
  preferWifiUpload: true,
} as const;

/** Stuck-job threshold for the J6 owner report (days with no activity). */
export const STUCK_JOB_DAYS = 3 as const;
