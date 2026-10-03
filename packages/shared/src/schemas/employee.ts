import { z } from 'zod';

/**
 * Employee — technician / coordinator / owner record (PLAN.md J1, §7 draft
 * data model). Identity lives in Clerk (D4/D7); `role` lives here in Neon,
 * never in Clerk metadata. Onboarding (invite -> profile -> active) is the
 * only writer of `onboardingComplete` / `status` besides admin deactivation.
 */
export const EMPLOYEE_ROLES = ['technician', 'coordinator', 'owner'] as const;
export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];

export const EMPLOYEE_STATUSES = ['invited', 'active', 'inactive'] as const;
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

/** Technician skill chips offered on the onboarding wizard (step 3). */
export const SKILL_LIST = [
  'copier',
  'printer',
  'pabx',
  'ac',
  'cctv',
  'networking',
  'electrical',
  'other',
] as const;
export type Skill = (typeof SKILL_LIST)[number];

export const EmployeeSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1),
  clerkUserId: z.string().min(1).optional(),
  name: z.string().min(1).max(120),
  email: z.string().email().optional(),
  phone: z.string().min(1).max(30).optional(),
  photoUrl: z.string().url().optional(),
  role: z.enum(EMPLOYEE_ROLES).default('technician'),
  status: z.enum(EMPLOYEE_STATUSES).default('invited'),
  skills: z.array(z.enum(SKILL_LIST)).default([]),
  branch: z.string().min(1).optional(),
  onboardingComplete: z.boolean().default(false),
  /** ISO timestamp of the location-consent checkbox (R19, J1 step 5). */
  locationConsentedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Employee = z.infer<typeof EmployeeSchema>;

/** `GET /v1/employees/me` payload — what the mobile guard reads. */
export const MeResponseSchema = z.object({
  employee: EmployeeSchema,
});

export type MeResponse = z.infer<typeof MeResponseSchema>;

/** `POST /v1/invites/validate` body — one-time token from the invite link. */
export const InviteValidateSchema = z.object({
  token: z.string().min(1).max(200),
});

export type InviteValidate = z.infer<typeof InviteValidateSchema>;

/** `POST /v1/invites/validate` payload — preview shown on wizard step 1. */
export const InvitePreviewSchema = z.object({
  employeeName: z.string().min(1),
  orgName: z.string().min(1),
  branch: z.string().min(1).optional(),
  role: z.enum(EMPLOYEE_ROLES),
  expiresAt: z.string().datetime(),
});

export type InvitePreview = z.infer<typeof InvitePreviewSchema>;

/**
 * `PATCH /v1/employees/me/complete-onboarding` body — wizard submission.
 * Photo is uploaded separately after activation; only the URL lands here.
 */
export const CompleteOnboardingSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(1).max(30),
  photoUrl: z.string().url().optional(),
  skills: z.array(z.enum(SKILL_LIST)).min(1).max(SKILL_LIST.length),
  branch: z.string().min(1).optional(),
  /** Must be an ISO datetime captured at the moment of consent (R19). */
  locationConsentedAt: z.string().datetime(),
});

export type CompleteOnboarding = z.infer<typeof CompleteOnboardingSchema>;
