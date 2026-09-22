# @sbs/shared — the contract

The **single definition** of every shape that crosses the API boundary: Zod schemas, inferred TS types,
enums and constants. Consumed by `apps/mobile`, `apps/admin` **and** `apps/api` (PLAN.md D15, D18).

**Status: folder structure only** — `src/index.ts` (the barrel) lands with the first schema, together with the
`zod` dependency, pinned at implementation time.

## Structure

```
src/
├─ index.ts        # barrel — the only entry point other workspaces import
├─ schemas/        # Zod schemas (the source of record shapes + the generated OpenAPI spec)
├─ types/          # types inferred from schemas (z.infer) — never hand-written duplicates
├─ enums/          # ticket status, visit states, roles, complaint types …
└─ constants/      # shared literals: office codes, limits, SLA windows …
```

## Rules

- **Define once, here.** A shape that both clients and the API need is defined in `schemas/` and imported —
  never copied into a client.
- `apps/api/src/domain/dtos` **re-exports** from this package; API-only shapes live there alone (C7).
- Prefer `z.infer<typeof Schema>` over hand-written interfaces so validation and types cannot drift.
- Changing a schema is a contract change: it must keep the CI check against the generated OpenAPI spec green
  (§14.2 — “contract drift” is the failure this exists to prevent).
- Keep it dependency-light (`zod` only). Anything that needs a runtime (Expo, Next, Express types) does not
  belong here.
