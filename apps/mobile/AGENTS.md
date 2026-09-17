# AGENTS.md

This file provides guidance to coding agents working in this repository.

## What this is

`mlai-mobile` — an Expo SDK 53 / React 19 / React Native 0.79 mobile companion to the MLAI web site. Pure TypeScript/TSX, Bun-managed, New Architecture enabled. It presents the product story (WDBX, ABI, Abbey) and ships one real feature: an iCloud-backed Vault gated by Sign in with Apple.

## Commands

Use **Bun**, not npm/yarn/pnpm.

```bash
bun install               # from the repository root (one root workspace and bun.lock)
bun start                 # Expo dev server (QR → Expo Go)
bun run ios               # iOS simulator
bun run android           # Android emulator
bun run web               # react-native-web
bun run typecheck         # tsc --noEmit -p tsconfig.typecheck.json, strict
bun run test              # jest (jest-expo) — pure-logic and component-render suites
bun run lint              # expo lint (eslint-config-expo)

bun run test __tests__/cloud.test.ts     # single test file
bun run test -- -t "adds a note"         # single test by name
```

**Verification gates** (all should pass after a change): `bun run typecheck`, `bun run test` (jest-expo), `bun run lint`, and `bunx expo export --platform web` (confirms all routes bundle). The test suite has both pure-logic suites (mocking `expo-secure-store` to exercise the local-fallback repository) and component-render suites via `@testing-library/react-native` (v13 — v14 no-ops under jest-expo). Render tests cover `ErrorScreen`, `NoteForm`, and the Vault add/edit/delete/search flows (router + auth mocked).

To see a change running in the real app (launch, drive, screenshot), use the project's `run-mlai-mobile` skill (`.agents/skills/run-mlai-mobile/`, a symlink to the
canonical `.claude/skills/run-mlai-mobile/` — one tool, two discovery paths; do not copy it back) — it drives the react-native-web target with headless Chrome.

### Native CloudKit build (Vault feature)

The Swift CloudKit module and entitlements only exist in a native build — Expo Go cannot exercise real iCloud sync.

```bash
bunx expo prebuild --clean     # generates ios/ with entitlements via plugins/withCloudKit.js
bunx expo run:ios              # local native dev build
bunx eas build --profile development --platform ios   # cloud build
```

`ios/` is generated, not committed — never hand-edit it; change `app.json` / `plugins/withCloudKit.js` and re-prebuild.

## Sibling applications in the integration repository

This app now lives at `apps/mobile/` in the MLAI integration repository. The
other surfaces are siblings, not children of the Expo project:

| Path | What it is | Its own gates |
|---|---|---|
| `../quasar/` | Local AI website-builder: service, shared package and Expo app (root workspace members) plus a separately locked Next 15 template | from the repository root: `bun run check:quasar` |
| `../web/` | Canonical Next 15 App Router marketing/console site on Bun | from the repository root: `bun run check:web` |
| `../website-app/` | Independent local Next.js application (Node runtime, SQLite, Python worker) | from the repository root: `bun run check:website-app` |
| `../research-sites/` | Generated static research export (zero dependencies, not a root workspace member) | from the repository root: `bun run check:research-sites` |

The app's TypeScript, ESLint, and Jest roots are `apps/mobile`, so sibling
sources are naturally fenced out.

### Root workspace install

The app installs through the repository's root Bun workspace (root `bun.lock`,
`linker = "isolated"` in the root `bunfig.toml`); there is no app lockfile.
Three files depend on that layout:

- `metro.config.js` watches the repository root and enables symlink and
  package-exports resolution, because dependencies are symlinks into
  `<repo>/node_modules/.bun` and `@mlai/contracts` and `@mlai/design-tokens`
  are workspace symlinks.
- `jest.config.js` restates jest-expo's `transformIgnorePatterns` with a
  `(?!\.bun/)` guard; without it Jest skips transforming React Native and Expo
  sources that live under the `.bun` store.
- `tsconfig.typecheck.json` (used by `bun run typecheck`) maps `react` to this
  app's SDK 53 `@types/react`. Many React Native packages import `react` in
  their declarations without depending on `@types/react`, and would otherwise
  resolve the repository root's Next-side 19.2 types. Keep that mapping out
  of `tsconfig.json`: Metro reads its `paths` when bundling.

Declare every package the app imports. The isolated linker hides undeclared
ones; `@babel/runtime`, `@expo/config-plugins`, `@expo/metro-runtime`,
`babel-preset-expo`, `expo-linking`, `expo-modules-core` and `query-string`
(an undeclared `expo-router` 5.0 dependency) are declared for that reason.
Never switch the root linker to `hoisted` without re-running this app's gate. The historical `www/` subtree is retained in
Git history only; never recreate it. Read each sibling's own guidance before
working there.

## Architecture

### Routing + auth gate (`app/`)

Expo Router file-based routing with `experiments.typedRoutes`. Route groups:
- `(auth)/` — `sign-in.tsx` (Sign in with Apple + explicit guest/preview fallback)
- `(tabs)/` — the five tabs: `index` (Home), `products` (Stack), `vault`, `platform`, `company`
- `product/[slug].tsx` — dynamic detail, `slug ∈ {wdbx, abi, abbey}`
- `account.tsx` — modal; `+not-found.tsx` — branded 404

`app/_layout.tsx` is the spine: it loads fonts, hides the splash, wraps everything in `AuthProvider`, and runs **`useProtectedRoute`** — a segment-watching effect that `router.replace`s signed-out users into `(auth)` and signed-in users out of it. Auth state has three values: `loading | signedOut | signedIn`; never redirect while `loading`.

### The optional-native-module fallback (the core pattern)

This is the most important thing to understand. **Two layers detect whether native capabilities are present and degrade gracefully:**

1. **Auth** (`lib/auth.tsx`) — Sign in with Apple is the only identity; there is no MLAI auth server. The Apple ID is persisted in the keychain (`expo-secure-store`), re-hydrated on launch, and its credential state re-validated on every launch (sign out if revoked in Settings). Where Apple auth is unavailable (web/Android/simulator), `continueAsGuest()` issues an explicit "preview" session so the app stays reachable.

2. **Data** (`lib/cloud.ts` + `modules/mlai-cloudkit/`) — `requireOptionalNativeModule<MlaiCloudKitNative>("MlaiCloudKit")` returns `null` in Expo Go / web / Android. `cloud.ts` exposes a `backend: "cloudkit" | "local"` flag and a repository (`listItems` / `addItem` / `removeItem`) that hits the user's **private** CloudKit DB when the module exists, and an encrypted `SecureStore` store otherwise. The active backend is surfaced to the UI via `getStatus()` / `describeStatus()`. Every repository function branches on `getCloudKit()` — keep that branch intact when extending it.

There is no shared MLAI backend in either path; data lives on the user's hardware (their private CloudKit DB or on-device keychain).

Adding a CloudKit field touches four places: the Swift module (`modules/mlai-cloudkit/ios/MlaiCloudKitModule.swift`), the `CloudFields`/`CloudRecord` types (`modules/mlai-cloudkit/src/MlaiCloudKit.types.ts`), the `VaultItem` mapping in `cloud.ts`, and the `VaultItem` record type in CloudKit Dashboard (see README for schema: `title`, `body`, `createdAt` — `createdAt` must be Sortable + Queryable).

### Facts + theme (single sources of truth)

- **`lib/brand.ts`** — all copy, product data, and metrics, mirroring the web `lib/brand.ts`. Every `Stat` carries `provenance: "measured" | "target" | "reported"`. **Integrity rule: never render a target as a result.** `provenanceMeta` maps each to a glyph (● ○ ◆). Edit copy here, not in screens.
- **`lib/theme.ts`** — design tokens: `color`, `space`, `radius`, `font`, `type`, and the three product accents (`wdbx` cyan, `abi` violet, `abbey` green) keyed by the `Accent` type. The raw Lab hex values (`ink` and the four accents) are imported at runtime from `@mlai/design-tokens` (`labColor`), so a change there reaches this app. Use `tint(hex, alpha)` for soft accent fills. Screens compose tokens; they don't hardcode colors/sizes.

### Reactive UI primitives (`components/ui/`)

- `Motion.tsx` — `Reveal` (FadeInDown entering animation, honors OS reduce-motion) and `PressableScale` (spring-down + light haptic; the app-wide tactile feel).
- `Text.tsx` — `Txt` (variant-typed text), `Eyebrow`, and `GradientText` (MaskedView + LinearGradient; native renders the gradient, web approximates).
- `Surface`, `StatBlock`, `Layout` — panels, provenance-tagged stat rows, screen scaffolding.

Reanimated requires `react-native-reanimated/plugin` in `babel.config.js` — it must stay last in the plugins list.

## Conventions

- Path alias `@/*` → this app's root, `apps/mobile` (`tsconfig.json`). Import as `@/lib/theme`, `@/components/ui/Text`.
- TypeScript `strict` is on; keep `bun run typecheck` clean.
- Dark UI only (`userInterfaceStyle: "dark"`, near-black `color.ink` `#05070D` (Lab `--ink`)).
- Dependency set is pinned to the Expo SDK 53 family (the verified React 19 baseline). To bump: `bunx expo install expo@latest --fix`.

## Integrity rules (shared with the web)

- Metric provenance is never conflated; a target is never presented as a result.
- The only permitted Apple framing: *"Built on Apple's public frameworks — Metal, Accelerate, Core ML."*
- Open core is Apache-2.0; the company is founder-led (Donald Filimon).
