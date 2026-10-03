import { and, desc, eq } from 'drizzle-orm';

import { tickets } from '../infrastructure/schema.js';
import { getDb } from '../infrastructure/db.js';
import type { MyTicketsQuery, MyTicketsResponse, Ticket } from '../domain/dtos/index.js';

/**
 * LAYER 2 — ticket service (the only layer allowed to reach the DB).
 *
 * F1: real DB via Drizzle/Neon (`infrastructure/db.ts`, C5 resolved).
 * Dev fallback (`SBS_AUTH_DISABLED=1` + `dev-user`): in-memory seeds so the
 * mobile My Jobs screen renders without a DB row on day one.
 */
export interface TicketStore {
  listForTechnician(technicianId: string, query: MyTicketsQuery): Promise<MyTicketsResponse>;
}

const seedTickets: Ticket[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    orgId: 'dev-org',
    title: 'Quarterly CCTV preventive visit',
    description: 'NVR + 6 cameras health check, lens clean, footage verify.',
    status: 'new',
    priority: 'normal',
    complaintType: 'preventive_maintenance',
    customerId: 'demo-customer-2',
    assigneeId: 'dev-user',
    officeCode: 'HO',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class DbTicketStore implements TicketStore {
  async listForTechnician(technicianId: string, query: MyTicketsQuery): Promise<MyTicketsResponse> {
    // Dev identity has no DB row — serve seeds so F1 is testable offline.
    if (technicianId === 'dev-user' && process.env.SBS_AUTH_DISABLED === '1') {
      const mine = seedTickets.filter(
        (ticket) =>
          ticket.assigneeId === technicianId &&
          (query.status === undefined || ticket.status === query.status),
      );
      return { tickets: mine.slice(0, query.limit), nextCursor: null };
    }
    const db = getDb();
    const filters =
      query.status === undefined
        ? eq(tickets.assigneeId, technicianId)
        : and(eq(tickets.assigneeId, technicianId), eq(tickets.status, query.status));
    const rows = await db
      .select()
      .from(tickets)
      .where(filters)
      .orderBy(desc(tickets.updatedAt))
      .limit(query.limit + 1);
    const toIso = (v: unknown): string =>
      v instanceof Date ? v.toISOString() : typeof v === 'string' ? v : new Date().toISOString();
    const page = rows.slice(0, query.limit).map(
      (row): Ticket => ({
        id: String(row.id),
        orgId: String(row.orgId),
        title: String(row.title),
        description: row.description ?? undefined,
        status: row.status as Ticket['status'],
        priority: (row.priority as Ticket['priority']) ?? 'normal',
        complaintType: (row.complaintType as Ticket['complaintType']) ?? 'breakdown',
        customerId: String(row.customerId),
        siteId: row.siteId ?? undefined,
        assetId: row.assetId ?? undefined,
        assigneeId: row.assigneeId ?? undefined,
        officeCode: row.officeCode ?? undefined,
        createdAt: toIso(row.createdAt),
        updatedAt: toIso(row.updatedAt),
      }),
    );
    return { tickets: page, nextCursor: null };
  }
}

/** Swap for the DB-backed implementation once `infrastructure/db.ts` lands. */
export const ticketStore: TicketStore = new DbTicketStore();

export async function listMyTickets(
  technicianId: string,
  query: MyTicketsQuery,
): Promise<MyTicketsResponse> {
  const safeLimit = Math.min(Math.max(query.limit, 1), 100);
  return ticketStore.listForTechnician(technicianId, { ...query, limit: safeLimit });
}

