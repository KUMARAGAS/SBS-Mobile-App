import type { Visit, VisitCheckIn } from '../domain/dtos/index.js';
import { ConflictError } from '../domain/errors/conflict-error.js';

/**
 * LAYER 2 — visit service. Same C5 deferral as `tickets.ts`: in-memory
 * behind a narrow interface; idempotency map survives within the process
 * (persistent `idempotency_keys` table arrives with the real DB).
 */
export interface VisitStore {
  checkIn(technicianId: string, orgId: string, input: VisitCheckIn): Promise<Visit>;
}

function samePayload(a: VisitCheckIn, b: VisitCheckIn): boolean {
  return (
    a.ticketId === b.ticketId &&
    a.status === b.status &&
    a.deviceAt === b.deviceAt &&
    a.lat === b.lat &&
    a.lng === b.lng
  );
}

class InMemoryVisitStore implements VisitStore {
  private readonly byKey = new Map<string, { input: VisitCheckIn; visit: Visit }>();

  async checkIn(technicianId: string, orgId: string, input: VisitCheckIn): Promise<Visit> {
    const existing = this.byKey.get(input.idempotencyKey);
    if (existing) {
      // Same key + same payload → replay the stored result (D16 safe retry).
      if (samePayload(existing.input, input)) {
        return existing.visit;
      }
      // Same key + different payload → genuine conflict, never silently swap.
      throw new ConflictError('Idempotency key already used with different payload');
    }

    const now = new Date().toISOString();
    const visit: Visit = {
      id: crypto.randomUUID(),
      orgId,
      ticketId: input.ticketId,
      technicianId,
      status: input.status,
      deviceAt: input.deviceAt,
      receivedAt: now,
      ...(input.lat === undefined ? {} : { lat: input.lat }),
      ...(input.lng === undefined ? {} : { lng: input.lng }),
      idempotencyKey: input.idempotencyKey,
      createdAt: now,
      updatedAt: now,
    };
    this.byKey.set(input.idempotencyKey, { input, visit });
    return visit;
  }
}

export const visitStore: VisitStore = new InMemoryVisitStore();

export async function checkIn(
  technicianId: string,
  orgId: string,
  input: VisitCheckIn,
): Promise<Visit> {
  return visitStore.checkIn(technicianId, orgId, input);
}
