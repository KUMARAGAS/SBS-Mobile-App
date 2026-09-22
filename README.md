# SBS Field Service — Mobile App

Expo SDK 57 + React Native technician app for **SBS.COM OFFICE SOLUTIONS (PVT) LTD**.

**Status: blank Expo project.** The `create-expo-app` tutorial screens were stripped on 21 Sep 2026 —
the template's own `reset-project` script was run in *delete* mode, so `src/` now contains only a blank
`src/app`. No application code has been written yet.

Removed with them: `src/app/explore.tsx` (the Explore tab), every demo component (`hint-row`, `web-badge`,
`animated-icon*`, `app-tabs*`, `themed-text`/`themed-view`, `ui/collapsible`, `external-link`),
`src/constants/theme.ts`, `src/hooks/*`, `src/global.css`, the Expo/React logo and tutorial images
(`assets/images/expo-badge*.png`, `react-logo*`, `logo-glow.png`, `tutorial-web.png`, `tabIcons/*`), and
`scripts/reset-project.js` together with its `reset-project` npm script.

The full product plan (scope, data model, architecture, decisions, risks) lives in [`PLAN.md`](./PLAN.md).

## Decided stack (not yet installed)
Expo SDK 57 · Expo Router · Redux Toolkit + RTK Query · Clerk (`@clerk/expo`) ·
Node + Express + TypeScript API · Neon Postgres · ImageKit · Sentry · EAS Build / Update.

## Get started

```bash
npm install
npx expo start
```

- Use **`npx expo install <package>`** — never `npm install <package>` — so versions stay SDK-compatible.
- Before finishing any change, run `npx tsc --noEmit` and `npx expo lint`.
- Native code is generated (CNG): never hand-edit `ios/` or `android/`; configure via `app.json` and config plugins.
- Routes live in `src/app/`; every file there is a screen. Non-route code belongs outside `src/app/`.

## Pending

1. This app is planned to sit at `apps/mobile` in the monorepo described in `PLAN.md` §8.5 — it is still at the repo root.
2. App identity in `app.json` is still the template placeholder (`Mobileapp`) and needs SBS naming + bundle IDs.
   `assets/images/*` (icon, splash, favicon, Android adaptive icons) and `assets/expo.icon/` are still
   Expo-branded template art and need to be replaced with SBS assets before any build.
3. `LICENSE` is the Expo template's MIT licence and should be replaced or removed for a commercial client project.
