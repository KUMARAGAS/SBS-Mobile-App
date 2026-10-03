/**
 * @sbs/shared — schemas barrel.
 *
 * Zod schemas are the source of record for every shape crossing the API
 * boundary; TS types are inferred (`z.infer`), never hand-duplicated.
 */
export * from './health.js';
export * from './ticket.js';
export * from './visit.js';
export * from './employee.js';
