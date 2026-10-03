import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import { eq } from 'drizzle-orm';

import { employees } from '../infrastructure/schema.js';
import { getDb } from '../infrastructure/db.js';
import { AppError } from '../domain/errors/app-error.js';
import type { Employee } from '../domain/dtos/index.js';
import {
  isAuthenticated,
  isAuthenticatedRequest,
} from './middlewares/authentication-middleware.js';
import { sendSuccess } from '../domain/utils/response.js';

/**
 * LAYER 1 — employees router (F1: Auth read side).
 *
 * `GET /v1/employees/me` — resolves the caller's employment record from
 * `employees.clerk_user_id` (PLAN.md §7.3: Clerk holds identity, Neon holds
 * employment; the row is authoritative for role/office, never Clerk metadata).
 * Dev stub (`SBS_AUTH_DISABLED=1`) maps `dev-user` → the seeded dev employee.
 */
export const employeesRouter: Router = Router();

employeesRouter.use(isAuthenticated);

employeesRouter.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isAuthenticatedRequest(req)) {
      throw new Error('isAuthenticated must run before employees handlers');
    }
    const employee = await findEmployeeByClerkId(req.auth.userId);
    if (!employee) {
      throw new AppError(404, 'No employee record for this sign-in. Ask your admin for an invite.');
    }
    sendSuccess(res, { employee });
  } catch (cause) {
    next(cause);
  }
});

async function findEmployeeByClerkId(clerkUserId: string): Promise<Employee | null> {
  // Dev path: no DB needed for the demo loop — the stub identity always
  // resolves to an active technician so `home.tsx` renders on day one.
  if (process.env.SBS_AUTH_DISABLED === '1' && clerkUserId === 'dev-user') {
    const now = new Date().toISOString();
    return {
      id: 'dev-employee-1',
      orgId: 'dev-org',
      clerkUserId: 'dev-user',
      name: 'Dev Technician',
      role: 'technician',
      status: 'active',
      skills: [],
      onboardingComplete: true,
      createdAt: now,
      updatedAt: now,
    };
  }
  const db = getDb();
  const rows = await db.select().from(employees).where(eq(employees.clerkUserId, clerkUserId)).limit(1);
  const row = rows[0];
  if (!row) {
    return null;
  }
  const toIso = (v: unknown): string =>
    v instanceof Date ? v.toISOString() : typeof v === 'string' ? v : new Date().toISOString();
  return {
    id: String(row.id),
    orgId: String(row.orgId),
    clerkUserId: row.clerkUserId ?? undefined,
    name: String(row.name),
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    photoUrl: row.photoUrl ?? undefined,
    role: (row.role as Employee['role']) ?? 'technician',
    status: (row.status as Employee['status']) ?? 'invited',
    skills: [],
    branch: row.branch ?? undefined,
    onboardingComplete: true,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}
