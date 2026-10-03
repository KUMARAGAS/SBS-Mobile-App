/**
 * SEED — dev/demo data (F1 slice). NOT for production.
 * Run: `npm run db:seed --workspace @sbs/api`
 *
 * Inserts one employee + two tickets so `GET /v1/employees/me` and
 * `GET /v1/tickets/mine` return real rows for a Clerk-authenticated user.
 * Guarded: refuses to run when `NODE_ENV=production` (risk R27 — seeded
 * credentials/data must never reach a real environment).
 */
import 'dotenv/config';
import { eq } from 'drizzle-orm';

import { getDb } from '../src/infrastructure/db.js';
import { employees, tickets } from '../src/infrastructure/schema.js';

if (process.env.NODE_ENV === 'production') {
  throw new Error('db:seed refuses to run in production.');
}

async function seed(): Promise<void> {
  const db = getDb();

  const existing = await db.select().from(employees).where(eq(employees.name, 'Dev Technician')).limit(1);
  if (existing.length === 0) {
    await db.insert(employees).values({
      orgId: 'dev-org',
      clerkUserId: 'dev-user',
      name: 'Dev Technician',
      email: 'dev.tech@sbs.example',
      phone: '+94 70 000 0000',
      role: 'technician',
      status: 'active',
      branch: 'HO',
      onboardingComplete: 'true',
    });
    console.log('[seed] employees → Dev Technician');
  } else {
    console.log('[seed] Dev Technician already exists — skipping');
  }

  const ticketCount = await db.select().from(tickets).limit(1);
  if (ticketCount.length === 0) {
    await db.insert(tickets).values([
      {
        orgId: 'dev-org',
        title: 'PABX lines down — reception',
        description: 'Front-desk lines silent since morning. Check PBX unit + extensions.',
        status: 'assigned',
        priority: 'high',
        complaintType: 'breakdown',
        customerId: 'demo-customer-1',
        siteId: 'demo-site-hq',
        assigneeId: 'dev-user',
        officeCode: 'HO',
      },
      {
        orgId: 'dev-org',
        title: 'Quarterly CCTV preventive visit',
        description: 'NVR + 6 cameras health check, lens clean, footage verify.',
        status: 'new',
        priority: 'normal',
        complaintType: 'preventive_maintenance',
        customerId: 'demo-customer-2',
        assigneeId: 'dev-user',
        officeCode: 'HO',
      },
    ]);
    console.log('[seed] tickets → 2 rows');
  } else {
    console.log('[seed] tickets already present — skipping');
  }
}

seed()
  .then(() => {
    console.log('[seed] done');
    process.exit(0);
  })
  .catch((cause) => {
    console.error('[seed] failed', cause);
    process.exit(1);
  });