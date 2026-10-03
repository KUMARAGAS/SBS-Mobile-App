/** Smoke test — real-DB query path (F1). Not a unit test; used to prove Drizzle select works on Neon. */
import 'dotenv/config';
import { eq } from 'drizzle-orm';

import { getDb } from '../src/infrastructure/db.js';
import { employees, tickets } from '../src/infrastructure/schema.js';

async function main() {
  const db = getDb();
  const emp = await db.select().from(employees).where(eq(employees.name, 'Dev Technician')).limit(1);
  console.log('DB employees rows:', emp.length, emp[0]?.clerkUserId, emp[0]?.role);
  const tks = await db.select().from(tickets).where(eq(tickets.assigneeId, 'dev-user')).limit(5);
  console.log('DB tickets rows:', tks.length, tks.map((t) => t.title));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('FAIL', e);
    process.exit(1);
  });
