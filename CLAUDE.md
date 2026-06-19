# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`mlai-mobile` — an Expo SDK 53 / React 19 / React Native 0.79 mobile companion to the MLAI web site. Pure TypeScript/TSX, Bun-managed, New Architecture enabled. It presents the product story (WDBX, ABI, Abbey) and ships one real feature: an iCloud-backed Vault gated by Sign in with Apple.

## Commands

Use **Bun**, not npm/yarn/pnpm.

```bash
bun install
bun start                 # Expo dev server (QR → Expo Go)
bun run ios               # iOS simulator
bun run android           # Android emulator
bun run web               # react-native-web
bun run typecheck         # tsc --noEmit, strict
bun run test              # jest (jest-expo) — pure-logic unit suites
bun run lint              # expo lint (eslint-config-expo)
```

**Verification gates** (all should pass after a change): `bun run typecheck`, `bun run test` (jest-expo), `bun run lint`, and `bunx expo export --platform web` (confirms all routes bundle). The test suite has both pure-logic suites (mocking `expo-secure-store` to exercise the local-fallback repository) and component-render suites via `@testing-library/react-native` (v13 — v14 no-ops under jest-expo). Render tests cover `ErrorScreen`, `NoteForm`, and the Vault add/edit/delete/search flows (router + auth mocked).

### Native CloudKit build (Vault feature)

The Swift CloudKit module and entitlements only exist in a native build — Expo Go cannot exercise real iCloud sync.

```bash
bunx expo prebuild --clean     # generates ios/ with entitlements via plugins/withCloudKit.js
bunx expo run:ios              # local native dev build
bunx eas build --profile development --platform ios   # cloud build
```

`ios/` is generated, not committed — never hand-edit it; change `app.json` / `plugins/withCloudKit.js` and re-prebuild.

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

Adding a CloudKit field touches four places: the Swift module (`ios/MlaiCloudKitModule.swift`), the `CloudFields`/`CloudRecord` types (`modules/mlai-cloudkit/src/MlaiCloudKit.types.ts`), the `VaultItem` mapping in `cloud.ts`, and the `VaultItem` record type in CloudKit Dashboard (see README for schema: `title`, `body`, `createdAt` — `createdAt` must be Sortable + Queryable).

### Facts + theme (single sources of truth)

- **`lib/brand.ts`** — all copy, product data, and metrics, mirroring the web `lib/brand.ts`. Every `Stat` carries `provenance: "measured" | "target" | "reported"`. **Integrity rule: never render a target as a result.** `provenanceMeta` maps each to a glyph (● ○ ◆). Edit copy here, not in screens.
- **`lib/theme.ts`** — design tokens: `color`, `space`, `radius`, `font`, `type`, and the three product accents (`wdbx` cyan, `abi` violet, `abbey` green) keyed by the `Accent` type. Use `tint(hex, alpha)` for soft accent fills. Screens compose tokens; they don't hardcode colors/sizes.

### Reactive UI primitives (`components/ui/`)

- `Motion.tsx` — `Reveal` (FadeInDown entering animation, honors OS reduce-motion) and `PressableScale` (spring-down + light haptic; the app-wide tactile feel).
- `Text.tsx` — `Txt` (variant-typed text), `Eyebrow`, and `GradientText` (MaskedView + LinearGradient; native renders the gradient, web approximates).
- `Surface`, `StatBlock`, `Layout` — panels, provenance-tagged stat rows, screen scaffolding.

Reanimated requires `react-native-reanimated/plugin` in `babel.config.js` — it must stay last in the plugins list.

## Conventions

- Path alias `@/*` → repo root (`tsconfig.json`). Import as `@/lib/theme`, `@/components/ui/Text`.
- TypeScript `strict` is on; keep `bun run typecheck` clean.
- Dark UI only (`userInterfaceStyle: "dark"`, near-black `color.ink` `#05070B`).
- Dependency set is pinned to the Expo SDK 53 family (the verified React 19 baseline). To bump: `bunx expo install expo@latest --fix`.

## Integrity rules (shared with the web)

- Metric provenance is never conflated; a target is never presented as a result.
- The only permitted Apple framing: *"Built on Apple's public frameworks — Metal, Accelerate, Core ML."*
- Open core is Apache-2.0; the company is founder-led (Donald Filimon).
