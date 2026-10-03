/**
 * @sbs/shared — the contract (PLAN.md D15/D18, §8.5).
 *
 * The single definition of every shape crossing the API boundary. Consumed
 * by `apps/mobile`, `apps/admin` and `apps/api`. This barrel is the only
 * entry point other workspaces import — never a deep `src/*` path.
 *
 * Changing a schema is a contract change: it must keep the CI check against
 * the generated OpenAPI spec green (§14.2).
 */
export * from './enums/index.js';
export * from './constants/index.js';
export * from './schemas/index.js';
export type { ApiError, ApiSuccess } from './types/index.js';
