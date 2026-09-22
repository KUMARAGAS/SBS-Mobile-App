# @sbs/config — shared presets

Shared TypeScript / ESLint / Prettier presets so the three deployables cannot drift (PLAN.md §8.5, D15).
**Status: presets in place, nothing depends on them except the new workspaces** (`@sbs/config` is a workspace
dependency of `apps/api` and `apps/admin`).

## tsconfig presets

| Preset | Extends | Used by |
|---|---|---|
| `@sbs/config/tsconfig/base.json` | — | `packages/shared` |
| `@sbs/config/tsconfig/node.json` | `base` | `apps/api` (NodeNext + emit to `dist/`) |
| `@sbs/config/tsconfig/react-native.json` | `expo/tsconfig.base` | intended for `apps/mobile` (not wired yet — it still extends `expo/tsconfig.base` directly) |
| `@sbs/config/tsconfig/nextjs.json` | `base` | `apps/admin` |

`paths` deliberately stay in each workspace's own tsconfig: aliases must resolve relative to the project that
declares them, not to this package.

## ESLint preset

`@sbs/config/eslint/base` (flat config, `eslint/base.cjs`) — core rules + ignores only, so it loads before any
plugin exists. Each workspace composes it with its framework's config (`eslint-config-expo` for mobile,
`next/core-web-vitals` for admin) inside its own `eslint.config.js`.

**ESLint is not installed anywhere yet.** Installing it is a separate, deliberate step
(`npx expo install -- --dev eslint eslint-config-expo` in `apps/mobile`), otherwise `npx expo lint` prompts
interactively.

## Prettier config

`@sbs/config/prettier` (`prettier/index.json`) — 100 columns, single quotes, semicolons, trailing commas.
Adopt with `"prettier": "@sbs/config/prettier"` in a workspace `package.json` once `prettier` is installed.

## Other monorepo tooling (decided, not installed)

- **A29: no Turborepo/Nx** — plain npm workspaces are enough at this size; adding an orchestrator later is
  config, not a rewrite.
- `.nvmrc` pins Node **22** (the API target per §8.2).
