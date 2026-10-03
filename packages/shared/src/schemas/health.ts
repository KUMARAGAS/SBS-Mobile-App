import { z } from 'zod';

/** `GET /v1/healthz` payload — deploy + uptime checks (risk R22). */
export const HealthSchema = z.object({
  ok: z.literal(true),
  version: z.string(),
  uptimeSeconds: z.number(),
});

export type Health = z.infer<typeof HealthSchema>;
