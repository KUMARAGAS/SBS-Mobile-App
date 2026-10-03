# finishFeatures — done-done only (PLAN.md §4.1 v1)

> **Rule:** a feature lands in ✅ FINISHED only when it works end-to-end:
> mobile UI + API route + Zod validation + real DB + manual test on device.
> Schemas, folders, or in-memory mocks do NOT count — those live in 🟡 PARTLY.
> Spec: `PLAN.md` §4–§7. Sequencing: `PLAN.md` Part B (F1→F6).

## ✅ FINISHED (0)

_None yet — honest state as of 02 Oct 2026._

| ID | Feature | Proof (commit + test) |
|----|---------|----------------------|
| — | — | — |

## 🟡 PARTLY BUILT — do NOT count as finished

1. **Auth shell** — `apps/mobile/src/app/(auth)/sign-in.tsx`, `ClerkProvider` +
   `tokenCache` in `src/app/_layout.tsx`, `sso-callback.tsx`,
   `hosted-auth-callback.tsx`. API `authentication-middleware.ts` exists.
   Missing: invite-token binding (D7), revocation on deactivation (§9.2),
   public sign-up disabled. Screen even has `Create an account` affordance.
2. **GET /v1/tickets/mine + GET /v1/employees/me** — **F1 core, now DB-backed + verified**
   (see CURRENT). Remaining gaps: technician can't be assigned/created by admin yet,
   no status-change flow (assign → accept → …), `useMeQuery` not yet rendered on a screen.
3. **POST /v1/visits/check-in** — `apps/api/src/api/visits.ts` +
   `application/visits.ts` (in-memory) + `useCheckInMutation`.
   Missing: real DB, travel→on_site→end times, GPS enforcement, selfie,
   approval (D8), `attendance_days` derivation.
4. **Shared contract seeds** — `packages/shared/src/schemas/`
   (`ticket.ts`, `visit.ts`, `employee.ts`, `health.ts`) +
   `enums/ticket.ts`, `enums/visit.ts`. Missing: customer/site/asset/contract
   schemas, OpenAPI gen (D18).
5. **Store wiring** — `apps/mobile/src/store/store.ts` + `store/api.ts`
   (RTK Query, token injection, short `keepUnusedDataFor`, `refetchOnReconnect`).
   Missing: outbox slice, `redux-persist`, idempotency replay (D16).

## ❌ TODO — F1→F6 (PLAN.md Part B)

- [ ] **F1 — Auth + My Jobs read (J1 + J3 step 1).**
  `GET /v1/employees/me` + `GET /v1/tickets/mine` on real DB;
  mobile `home.tsx` from real API. Needs C5 (Drizzle vs Prisma), C6 (Clerk).
- [ ] **F2 — Visit lifecycle (J3).** check-in → complete, GPS, idempotency.
- [ ] **F3 — Customers / Sites / Assets (§7).** CRUD + mobile view.
- [ ] **F4 — History + Entitlement (J5 + J4).** Filterable history, free-visits left.
- [ ] **F5 — Admin dispatch + users/offices (J2 + J6).** Admin login, create/assign.
- [ ] **F6 — Warranty/AMC + Reports/CSV + Offline outbox + Push + Sentry + i18n.**

## 🔄 CURRENT: F1 NEARLY DONE — ONE GATE REMAINS

**F1 — Auth + My Jobs read (J1 + J3 step 1)**

✅ Done + verified (02 Oct 2026):
- `PLAN.md` Part B — finish order added (F1→F6).
- `apps/api/src/infrastructure/schema.ts` — Drizzle `employees` + `tickets` tables.
- `apps/api/drizzle/0000_*.sql` — migration generated; **pushed to Neon** (`db:push`).
- `apps/api/scripts/seed.ts` — seeded Dev Technician + 2 tickets into Neon (verified rows exist).
- `GET /v1/employees/me` — Drizzle query by `clerk_user_id`; dev stub for `SBS_AUTH_DISABLED=1`.
- `GET /v1/tickets/mine` — real DB query (assignee + optional status filter + limit); dev seeds fallback.
- Verified live on port 4010:
  - `/healthz` → `{ok:true}`
  - `/v1/tickets/mine` → 2 seeded tickets
  - `/v1/tickets/mine?status=new` → 1 filtered ticket
  - `/v1/tickets/mine?limit=abc` → `400 BAD_REQUEST` (Zod boundary)
  - `/v1/employees/me` → Dev Technician JSON
  - DB smoke script → 1 employee + 2 ticket rows selected from Neon.
- Mobile: `useMeQuery` endpoint added to `store/api.ts`; `home.tsx` already reads `useMyTicketsQuery`.
- `npm run typecheck` green (api + mobile), `npm run lint` green, exit 0.

⏳ Remaining for F1 done-done:
- Manual test **on device**: dev build → sign in with Clerk → My Jobs shows the 2 seeded rows
  (needs `apps/mobile/.env` `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` + `EXPO_PUBLIC_API_URL` → API on :4000).
- Wire `useMeQuery` into a screen (e.g. home header shows `Dev Technician`) — optional.
- Commit + record hash in ✅ FINISHED table.

**Scope for F1 done-done (original):**
1. `packages/shared` — `employee.ts` + `ticket.ts` final (already close).
2. `apps/api` — `infrastructure/db.ts` (C5), `GET /v1/employees/me`,
   `GET /v1/tickets/mine` off real DB, Zod boundary validation.
3. `apps/mobile` — `home.tsx` + `store/api.ts` against real API
   (`EXPO_PUBLIC_API_URL`), loading/empty/error states.
4. Verify: `npm run typecheck`, `npm run lint`, `expo start` + `npm run dev:api`.
