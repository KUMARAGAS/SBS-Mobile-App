/**
 * LAYER 3 — DTO barrel (C7 resolved: re-export the shared contract).
 *
 * `apps/api/src/domain/dtos` re-exports `@sbs/shared` for every shape
 * crossing the wire; API-only shapes (none yet) live here alone.
 */
export {
  MyTicketsQuerySchema,
  MyTicketsResponseSchema,
  TicketSchema,
  type MyTicketsQuery,
  type MyTicketsResponse,
  type Ticket,
} from '@sbs/shared';
export {
  VisitCheckInSchema,
  VisitSchema,
  type Visit,
  type VisitCheckIn,
} from '@sbs/shared';
export { HealthSchema, type Health } from '@sbs/shared';
export {
  CompleteOnboardingSchema,
  EmployeeSchema,
  InvitePreviewSchema,
  InviteValidateSchema,
  MeResponseSchema,
  type CompleteOnboarding,
  type Employee,
  type EmployeeRole,
  type EmployeeStatus,
  type InvitePreview,
  type InviteValidate,
  type MeResponse,
  type Skill,
} from '@sbs/shared';
