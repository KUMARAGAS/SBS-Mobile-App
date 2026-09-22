# @sbs/api — Express service

Node.js 22 LTS + **Express 5** + TypeScript (strict), REST under `/v1`, Zod-validated (PLAN.md D1/D3/D17).
**Status: folder structure only** — no source files yet, no dependencies installed.

## Layer structure (§8.5 — client-specified 4 layers)

```
src/
├─ index.ts                      # ENTRY POINT (bootstrap only)
├─ api/                          # LAYER 1 — HTTP / routing
│  └─ middlewares/
│     ├─ authentication-middleware.ts        # isAuthenticated + AuthRequest + JwtPayload
│     ├─ global-error-handling-middleware.ts # 4-arg Express error handler
│     └─ validate.ts                         # Zod schema → 400 validation middleware
├─ application/                  # LAYER 2 — business logic (only layer that touches the DB)
├─ domain/                       # LAYER 3 — pure domain
│  ├─ dtos/                      #    Zod DTOs (C7: re-export from @sbs/shared where shared)
│  ├─ errors/                    #    app-error.ts (base + mapStatusToCode) · validation-error.ts (400) ·
│  │                             #    forbidden-error.ts (403, unused) · not-found-error.ts (404) ·
│  │                             #    conflict-error.ts (409, idempotency replays)
│  └─ utils/                     #    response.ts → sendSuccess() / sendError() envelopes
└─ infrastructure/               # LAYER 4 — external systems
   └─ db.ts                      #    DB client + connectDB()   ← blocked by C5
openapi/                         # generated spec (D18) — CI contract check
```

**Naming convention:** file names mirror across layers (`api/visits.ts` ↔ `application/visits.ts` ↔
`domain/dtos/visits.ts`). Domain modules per §8.5: `employees · offices · customers · assets · contracts ·
tickets · visits (attendance) · media · reports · notifications`, plus `entitlements.ts` (server-only warranty
maths) and `attendance.ts` (daily derivation).

### Layer rules (what keeps this honest after month six)

1. `api/` may import `application/` and `domain/` — **never `infrastructure/`** — and holds no business rules.
2. `application/` owns the logic and is the **only** layer allowed to reach the database (via `infrastructure/db.ts`).
3. `domain/` is pure: DTOs, error classes, response helpers. No Express types, no DB imports, no `process.env`.
4. `infrastructure/` knows nothing about HTTP; it exports clients/connections only.
5. `index.ts` is bootstrap only: validate env → connect DB → mount routers → listen → graceful shutdown.
6. Dependency direction (never reversed): `index.ts → api → application → domain`, with `infrastructure` below.

## Run (needs dependencies first)

```bash
npm install                              # repo root
npm install --workspace @sbs/api \
  express zod @clerk/express …           # pin versions at implementation time (§8.2)
npm run dev:api                          # tsx watch src/index.ts
```

No `typecheck` script is defined yet on purpose: `tsc` fails with “no inputs” while `src/` is empty. It gets
added with the first source file. `dev`/`build`/`start`/`test` also fail until the dependencies land.

## Blocked / open before coding (§8.5 gaps + conflicts)

| Item | Home | Blocker |
|---|---|---|
| DB client + migrations | `infrastructure/db.ts`, `prisma/migrations` *or* `drizzle` | **C5** Drizzle 0.45.3 (D2) vs Prisma in the tree |
| `api/auth.ts` semantics | invite acceptance / session bootstrap **or** login | **C6** Clerk (D4/D7) vs self-managed credentials |
| Env validation (fail fast on missing `DATABASE_URL`) | `infrastructure/config.ts`, imported only by `index.ts` | none — just not written |
| Scheduled work (derived attendance, SLA sweeps, media cleanup) | `infrastructure/scheduler.ts` + `application/jobs/*.ts` | none |
| Idempotency keys (must survive restarts) | `idempotency_keys` table via `infrastructure/db.ts` | none |
| Tests (Supertest integration tests, §14.2) | colocated `*.test.ts` **or** `tests/` — pick one now | decision |
| Folder spelling | `domain/` vs `domin/` | **C9** — see root README |
