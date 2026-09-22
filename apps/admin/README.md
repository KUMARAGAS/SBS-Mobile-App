# @sbs/admin — ops admin console

**Next.js 16.3.3** (Active LTS), **client-rendered consumer of the Express API** (PLAN.md D13).
**Status: folder structure only** — no pages, no dependencies installed.

## Hard rule (D13)

This app is a **client-only** consumer of `@sbs/api`:

- ❌ no route handlers / server actions,
- ❌ no server-side data fetching,
- ❌ no RSC data layer.

All server state goes through **RTK Query** (D14) against the API — no ad-hoc `useEffect` + `fetch`, no
per-page fetch wrapper, no bespoke cache.

## Structure (§8.5 — mirror of the mobile store shape, **no outbox** because admins are online)

```
src/
├─ app/                     # pages (Next App Router)
├─ store/
│  ├─ api.ts                # createApi — same endpoints/tagTypes vocabulary as mobile
│  └─ slices/{auth,ui,filters}
├─ components/
└─ lib/
public/
```

## Run (needs dependencies first)

```bash
npm install                              # repo root
npm install --workspace @sbs/admin next@16.3.3 react react-dom \
  @reduxjs/toolkit react-redux @clerk/nextjs …
npm run dev:admin                        # next dev
```

No `typecheck` script is defined yet on purpose: `tsc` fails with “no inputs” while `src/` has no `.ts(x)`
files. It gets added with the first page/component. `dev`/`build`/`start` also fail until `next` is installed.

## Notes

- Hosting is **Vercel, Pro tier** — the Hobby plan is non-commercial only (§8.4).
- Next.js ships monthly security releases → budget a patch cadence (§8.2).
- `tsconfig.json` extends `@sbs/config/tsconfig/nextjs.json` (`@sbs/config` is a workspace dependency).
