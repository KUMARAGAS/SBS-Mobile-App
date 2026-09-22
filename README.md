# SBS Field Service — platform monorepo

Platform for **SBS.COM OFFICE SOLUTIONS (PVT) LTD**: the technician mobile app, the ops admin console, and
the API they share. **npm workspaces** (PLAN.md D15) — one repo, three deployables, one shared contract.

The full product plan (scope, data model, architecture, decisions, risks) lives in [`PLAN.md`](./PLAN.md);
**§8.5 is the authoritative layout** this skeleton follows.

## Layout

| Path | What it is | Status |
|---|---|---|
| `apps/mobile` | Expo SDK 57 + Expo Router technician app → EAS Build/Update | blank Expo app (tutorial demo screens stripped) — **runs today** |
| `apps/api` | Node 22 + Express 5 + TypeScript, 4 layers (`api → application → domain → infrastructure`) → Railway/Render | **folders only** |
| `apps/admin` | Next.js 16.3 client-rendered ops console (D13) → Vercel | **folders only** |
| `packages/shared` | Zod schemas + inferred TS types + enums + constants — the cross-client contract (D15/D18) | **folders only** |
| `packages/config` | shared tsconfig / eslint / prettier presets | presets in place |
| `.github/workflows` | CI: typecheck, test, migrate, deploy | empty |

## Get started

```bash
npm install          # from the repo root — installs every workspace into one hoisted tree
npm run dev:mobile   # Expo dev server for apps/mobile
npm run dev:api      # apps/api dev server — install its dependencies first (see apps/api/README.md)
npm run dev:admin    # apps/admin dev server — install its dependencies first (see apps/admin/README.md)
npm run typecheck    # tsc --noEmit across every workspace that defines the script
```

## Conventions

- Run **`npm install` at the repo root** — not inside a workspace — so npm hoists a single dependency tree.
- Inside `apps/mobile`, add packages with **`npx expo install <pkg>`** (never `npm install <pkg>`) so versions
  stay SDK-compatible.
- Native code is generated (CNG): never hand-edit `ios/`/`android/`; configure native behaviour in
  `app.json`/`app.config.ts` and config plugins.
- Mobile routes live in `apps/mobile/src/app/`; every file there is a screen. Non-route code (components,
  store, hooks, lib) stays outside that folder.
- API layer rules are non-negotiable — see `apps/api/README.md` and PLAN.md §8.5.
- Before calling any change done: `npm run typecheck` and `npm run lint`.

## Pending (decisions and setup — deliberately not taken silently)

1. **C5 — ORM:** Drizzle 0.45.3 (D2) vs the Prisma tree written into §8.5. Blocks `apps/api/src/infrastructure/db.ts`.
2. **C6 — identity:** Clerk (D4/D7) vs the self-managed login in the §8.5 tree. Blocks `apps/api/src/api/auth.ts`.
3. **C9 — folder spelling:** this skeleton uses `domain/` (the spelling PLAN.md recommends). To match the
   original spec literally: `git mv apps/api/src/domain apps/api/src/domin`.
4. **No dependencies installed** for `apps/api`, `apps/admin` or `packages/shared` yet — versions get pinned at
   implementation time (PLAN.md §8.2); the unresolved C5/C6 choices are exactly what those pins depend on.
5. `apps/mobile/app.json` has not been converted to `app.config.ts` yet (§8.5 expects `app.config.ts` for EAS
   channels, runtimeVersion, permissions, plugins).
6. App identity in `apps/mobile/app.json` is still the template placeholder (`Mobileapp`) and the icon/splash
   art is still Expo-branded; `LICENSE` is still the Expo template's MIT licence.
7. **ESLint is not configured yet** — `packages/config/eslint` holds the shared preset, but no `eslint`
   dependency is installed, so `npx expo lint` would prompt to install it.

# SBS-Mobile-App
