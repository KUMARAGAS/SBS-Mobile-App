# @sbs/mobile — technician app

Expo SDK 57 · Expo Router · React Native 0.86.3 · TypeScript 6 (strict).
**Status: blank scaffold** — `src/app/_layout.tsx` (bare `<Stack />`) + `src/app/index.tsx`. The
`create-expo-app` tutorial demo screens were stripped on 22 Sep 2026.

## Run

```bash
npm install          # from the repo root, once
npm run dev:mobile   # or: cd apps/mobile && npx expo start
```

Add packages **only** with `npx expo install <pkg>` so versions stay SDK-compatible.

## Development build (`expo-dev-client`)

`expo-dev-client` (`~57.0.19`) is installed, so `npx expo start` targets a **development build** rather than Expo
Go — Expo Go cannot load native modules added later (reanimated/worklets today; camera, location, secure store,
sqlite as they land). Profiles live in `eas.json` (`development` = dev client + internal distribution); the app
identity is `com.sbs.mobileapp` (`ios.bundleIdentifier` / `android.package` in `app.json` — still `Mobileapp`
for `name`/`slug` and Expo-branded icons until the SBS artwork lands). Until a dev build is installed, the
JS-only screens still open in Expo Go with `npx expo start --go`.

```bash
# EAS cloud — use this path: the dev machines here have no Android SDK and no macOS
npx eas-cli@latest login                                            # once, per machine
npx eas-cli@latest build --profile development --platform android   # or ios
npx expo start                                                      # open the dev client, connect to the bundler

# local toolchain (Android SDK, or macOS for iOS) — prebuild + compile + install + start
npx expo run:android --device
```

Native projects are generated (CNG). Rebuild the binary after installing a native library or changing
`app.config`/`app.json`; JS-only changes just need `npx expo start`. EAS and `expo run:*` run prebuild for you,
so a manual `npx expo prebuild --clean` is only needed to refresh the local `android/`/`ios/` folders.

## Structure (PLAN.md §8.5 — folders exist, files land with implementation)

```
src/
├─ app/                  # expo-router routes — every file here is a screen
│  ├─ (auth)/            # sign-in, invite acceptance, onboarding
│  └─ (app)/             # my-jobs, visit session, history, profile
├─ store/                # REDUX LIVES HERE
│  ├─ index.ts           # configureStore + persistor + setupListeners
│  ├─ baseQuery.ts       # fetchBaseQuery + Clerk token + 401 refresh + offline capture
│  ├─ api.ts             # createApi: tagTypes + endpoints (types from @sbs/shared)
│  ├─ outbox.ts          # persisted mutation queue (replay + idempotency keys)
│  └─ slices/{auth,ui,drafts,sync}
├─ features/{jobs,visits,assets,history,profile}/
├─ components/ui/        # design-system primitives
├─ lib/{i18n,storage,location,compress,permissions}
└─ theme/
```

`app.config.ts` (EAS channels, runtimeVersion, permissions, plugins — §8.5) is **not created yet**; the app
still uses `app.json`. `apps/mobile/tsconfig.json` still extends `expo/tsconfig.base` directly; it can extend
`@sbs/config/tsconfig/react-native.json` once the app adopts the shared preset.

## Not installed yet (planned stack, PLAN.md §8.2)

Redux Toolkit 2.12.0 + RTK Query + `react-redux` + `redux-persist` · `@clerk/expo` + `expo-secure-store`,
`expo-auth-session`, `expo-crypto` · `@sentry/react-native` 8.27.0 · `expo-updates` · Expo notifications ·
image picker/camera · `expo-location` · `expo-sqlite` (offline) · (v1.1) Stream Video SDK.

## Notes

- Native code is generated (CNG): never hand-edit `ios/`/`android/`; configure via `app.json` + config plugins.
- Expo Go cannot run native modules added later — a development build is required
  (`npx expo run:android|ios`, or `eas build --profile development`).
- App identity in `app.json` is still the template placeholder (`Mobileapp`) and the icon/splash art is still
  Expo-branded — needs SBS assets before any build.
