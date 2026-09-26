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

## Run on a physical Android phone

Prerequisites on this machine (verified): Node 22 (`.nvmrc`), Android SDK at `~/Android/Sdk`, `adb` on
`PATH`, JDK 21, Expo SDK 57 (min Node 22.13). On the phone: Android 7+, and **USB debugging** enabled
(Settings → About phone → tap *Build number* 7×, then Developer options → USB debugging) for the USB paths.

### A. Fastest — reuse the dev-client APK that is already built (`android/app/build/outputs/apk/debug/app-debug.apk`, `com.sbs.mobileapp`)

```bash
cd apps/mobile
adb devices -l                       # phone must show as "device" (authorise the RSA prompt on screen)
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# 1. USB: forward the bundler port, no Wi-Fi needed
adb reverse tcp:8081 tcp:8081
npm run dev:mobile                   # from the repo root, or: npx expo start
# then open "Mobileapp" on the phone — it connects to the bundler itself

# 2. Same Wi-Fi (LAN): skip adb reverse, scan the terminal QR code with the phone
npx expo start                       # phone and laptop must be on the same network (this box: 10.71.30.5)
npx expo start --tunnel              # fallback when the network blocks device↔laptop traffic (slower reloads)
```

`npx expo start --android` launches the installed app over USB in one step. Rebuilding the binary is only
needed after a **native** change (`npx expo install <pkg>`, `app.json`/config plugin edit) — JS-only edits are
picked up by fast refresh.

### B. Rebuild the dev client locally over USB

```bash
cd apps/mobile
npx expo run:android --device        # prebuild + Gradle + install + start, then pick the phone from the list
```

Gradle 9.3.1 / AGP run on JDK 21 and download `compileSdk 36`; the first build takes several minutes.

### C. No native build at all — Expo Go (JS-only screens)

```bash
npx expo start --go                  # QR → Expo Go app; `npx expo login` if the phone asks for an account
```

Works today because `src/` only imports modules bundled in Expo Go **except for auth**: `@clerk/expo` and
its peers are now in the tree, so the supported path is A/B (development build). Everything the auth screens
use is JS-level — `ClerkProvider`, `useHostedAuth`, `useSSO`, `tokenCache` — but the `@clerk/expo` config
plugin is what registers the intent filter that lets the browser sheet redirect back into the app on Android,
and a config plugin is a native change by definition. Expo Go support for these exact calls is untested here;
do not assume it. Other native dependencies (Redux/RTK's `expo-secure-store` usage beyond auth, camera,
location, sqlite, Sentry) likewise require A/B.

### D. No local toolchain — cloud dev build via EAS

```bash
cd apps/mobile
npx eas-cli@latest login
npx eas-cli@latest build --profile development --platform android   # APK link/QR; install on the phone
npx expo start                                                      # dev client connects to the bundler
```

### Known snags on this box

- `ERROR An unknown error occurred while installing React Native DevTools` (chromium "No usable sandbox")
  on `expo start` is cosmetic — Metro still serves (`curl localhost:8081/status` → `packager-status:running`)
  and the phone connects normally.
- The repo lives on an `ntfs3` external volume (`/run/media/amila/New Volume2/…`); if fast refresh or
  resolution looks stale, restart with `npx expo start --clear`, or keep a clone on the ext4 home partition.
- **Moved the repo (or rebuilt it at another path/volume)? Gradle config fails** with
  `Configuring project ':react-native-worklets' without an existing directory is not allowed. The configured
  projectDirectory '/…/New Volume1/…/node_modules/react-native-worklets/android' does not exist`. The
  generated native state caches **absolute paths**, so a stale checkout location breaks configuration and the
  CMake caches break the C++ build. Drop the generated state and rebuild (nothing tracked is lost —
  `android/` is CNG output):
  ```bash
  cd apps/mobile/android && rm -rf .gradle build app/build app/.cxx
  ```
  (`npx expo prebuild --clean --platform android` also works and additionally regenerates the project files.)
  Configuration is the **only** place stale absolute paths actually break things. Gradle's build cache
  (`~/.gradle/caches/build-cache-1`) replays outputs that still contain old paths inside metadata/blame
  reports (`merger.xml`, `manifest-merger-blame-debug-report.txt`) — verified harmless: config, resource
  merge and the APK stay green even when the merge re-reads them, so don't chase those strings. To drop them
  anyway, run one build with `--no-build-cache`
  (`./gradlew app:assembleDebug --no-build-cache …`, verified: `merger.xml` then contains only the real path).
- Same-volume caveat: the Gradle cache lives on ext4 (`~/.gradle`) while the project is on NTFS, so Gradle
  logs `Hard link … failed. Doing a slower copy instead` — harmless, just slower.
- Port 8081 must be free (`pgrep -af 'expo start'`); `adb reverse` has to be re-run after every replug.
- Phone on "device" not "unauthorized" in `adb devices`; if not, accept the USB-debugging prompt (or
  `adb kill-server && adb start-server`).

## Development build (`expo-dev-client`)

`expo-dev-client` (`~57.0.19`) is installed, so `npx expo start` targets a **development build** rather than Expo
Go — Expo Go cannot load native modules added later (reanimated/worklets today; camera, location, secure store,
sqlite as they land). Profiles live in `eas.json` (`development` = dev client + internal distribution); the app
identity is `com.sbs.mobileapp` (`ios.bundleIdentifier` / `android.package` in `app.json` — still `Mobileapp`
for `name`/`slug`; the launcher, splash and adaptive art is the SBS lockup — see *Brand assets*). Until a dev
build is installed, the JS-only screens still open in Expo Go with `npx expo start --go`.

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

## Brand assets

Every brand image the app ships — launcher icon, Android adaptive foreground/background/monochrome, splash icon,
web favicon and the in-app mark (`src/components/brand/SbsLogoMark.tsx`) — comes from the single master
`design/logo.png`:

```bash
npm run brand:assets          # from the repo root — needs ImageMagick 7 on PATH
```

The master is a flat navy plate with the blue SBS orbit lockup and **no alpha**, so
`apps/mobile/scripts/brand/generate-logo-assets.sh` keys the plate out with a 20 → 31/255 luma ramp (only 0.24%
of the plate's pixels sit inside that band) and re-composites the cut-out onto every surface. Compositing the
cut-out back onto the plate colour reproduces `design/logo.png` at RMSE 1.3%, so the artwork itself is untouched
— only the plate is removed, and the lockup drops onto a dark surface with no seam.

Transparent surfaces (splash icon, in-app mark, adaptive foreground/monochrome) let the app background show
through; opaque ones (launcher icon, favicon, adaptive background) use `#001117` = `canvas-1`, which is within
6/255 of the plate's own navy on every channel. iOS goes through the Icon Composer project in
`assets/expo.icon`: the script writes only its layer image, while `icon.json` (one navy `fill`, one `sbs-logo`
layer) is hand-authored.

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

## Authentication (Clerk)

Identity is Clerk's, per `PLAN.md` §9.1 — the app holds no password field and no credential store of its own.
The wiring is four files:

| File | Role |
|---|---|
| `src/app/_layout.tsx` | `ClerkProvider` + `tokenCache`, wrapping the router stack. Reads `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` and throws if it is missing. |
| `src/app/(auth)/_layout.tsx` | Guard: signed-in users are redirected to `/home`; also owns post-auth navigation. |
| `src/app/(app)/_layout.tsx` | Guard: signed-out users are redirected to `/sign-in`. |
| `src/app/(auth)/sign-in.tsx` | `Sign In` / `Create an account` → hosted Account Portal (`useHostedAuth`); `Continue with Google` / `Continue with Apple` → `useSSO`. |

`src/app/(app)/home.tsx` is the signed-in landing screen and the app's user control (avatar, identity,
sign out) — it stands where my-jobs will go.

**Environment.** `apps/mobile/.env` (git-ignored) needs the publishable key — this is a public value, the
secret key belongs to `apps/api` only:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

Pull it with `clerk env pull` from `apps/mobile`, or copy it from the Clerk Dashboard → **API keys**.

**Rebuild after plugin or identifier changes.** `app.json` lists `@clerk/expo`, `expo-secure-store` and
`expo-web-browser` under `plugins`. The `@clerk/expo` plugin registers the Android intent filter for the
`clerk://<package>.hosted-callback` redirect, so a rebuild is required after adding it or after changing
`android.package` / `ios.bundleIdentifier` — otherwise the hosted browser sheet completes on Clerk's side and
then hangs, because the browser cannot hand control back to the app. `npx expo run:android --device`, or
`eas build --profile development`.

**Dashboard prerequisites.** Two are not in the repo and will fail at runtime if missed:

1. **Native API enabled** — Clerk Dashboard → **Native applications** (required for a native app to talk to
   Clerk at all).
2. **Social connections enabled** — Google and Apple must be switched on under **User & authentication →
   Social connections** for the two provider pills to work; without them the pills surface Clerk's own
   message in the inline error line. Production Apple additionally needs an Apple Services ID and key.

Sign-up is invite-only by policy (`PLAN.md` §9.1): the `Create an account` control opens Account Portal's
sign-up page so a first account can exist, and provisioning is expected to come from invitations.

## Not installed yet (planned stack, PLAN.md §8.2)

Redux Toolkit 2.12.0 + RTK Query + `react-redux` + `redux-persist` · `@sentry/react-native` 8.27.0 ·
`expo-updates` · Expo notifications · image picker/camera · `expo-location` · `expo-sqlite` (offline) ·
(v1.1) Stream Video SDK.

Auth came off this list when Clerk landed: `@clerk/expo` 4.7.1, `expo-secure-store` 57.0.4,
`expo-auth-session` 57.0.13, `expo-crypto` 57.0.3, `expo-web-browser` 57.0.3.

## Notes

- Native code is generated (CNG): never hand-edit `ios/`/`android/`; configure via `app.json` + config plugins.
- Expo Go cannot run native modules added later — a development build is required
  (`npx expo run:android|ios`, or `eas build --profile development`).
- App identity in `app.json` is still the template placeholder (`Mobileapp`) for `name`/`slug`. Every brand
  image — launcher icon, Android adaptive layers, splash icon, favicon, in-app mark — is generated from
  `design/logo.png` with `npm run brand:assets`, so no Expo-branded art ships any more.
