# MLAI — mobile

This app lives at `apps/mobile/` in the MLAI integration repository. Run its
commands here, or use the root `bun run check:mobile` gate. The website and
Quasar are sibling applications with independent validation boundaries.

An Expo + React 19 mobile app for MLAI, powered by Bun and written entirely in
TypeScript / TSX. A modern, reactive companion to the web site: file-based
routing, Reanimated motion, gradient masking, haptic press feedback, and the
same chip-stack identity.

```
Expo SDK 53 · React 19 · React Native 0.79 · Expo Router v5 · New Architecture
Reanimated 3 · react-native-svg · expo-linear-gradient · expo-haptics · expo-blur
Spectral / Geist / JetBrains Mono via @expo-google-fonts
```

## Run it

```bash
bun install
bun start            # Expo dev server → scan the QR with Expo Go
# or target a platform directly:
bun run ios          # iOS simulator (macOS)
bun run android      # Android emulator
bun run web          # react-native-web in the browser
```

Verify at any time:

```bash
bun run typecheck    # tsc --noEmit, strict
bun run test         # jest (jest-expo) — pure-logic unit suites
bun run lint         # eslint (eslint-config-expo)
```

> **Staying current.** The dependency set is pinned to the Expo SDK 53 family —
> the verified React-19 baseline. To move to the newest SDK at any time:
> `bunx expo install expo@latest --fix`.

## Structure

```
app/                      Expo Router (file-based routes)
  _layout.tsx             fonts, splash, themed Stack, gesture root
  (tabs)/
    _layout.tsx           dark tab bar, custom SVG icons, iOS blur
    index.tsx             Home — hero, the stack, why-now, CTA
    products.tsx          The three products
    platform.tsx          Four-layer platform
    company.tsx           Company, principles, investors, contact
  product/[slug].tsx      Dynamic product detail (wdbx | abi | abbey)
  +not-found.tsx          Branded 404
components/
  Logo.tsx                Chip-stack mark (react-native-svg)
  Hero.tsx                Animated hero with count-up metric
  ProductCard.tsx         Tappable card → product detail
  ui/                     Text, Surface, StatBlock, Motion, Layout
lib/
  theme.ts                Color / spacing / radius / type tokens
  brand.ts                Facts with provenance (single source of truth)
assets/                   icon · adaptive-icon · splash (chip mark)
```

## What makes it reactive

- **Reanimated entering animations** — sections fade-and-rise on mount; honors
  the OS reduce-motion setting automatically.
- **Spring press feedback** — every card and button scales on press and fires a
  light haptic (`PressableScale`).
- **Count-up hero metric** — the `2.3ms` figure animates 0 → target via an
  animated `TextInput` driven by a shared value.
- **Gradient masking** — the hero accent is real gradient-filled text on native
  (`MaskedView` + `LinearGradient`).
- **Native feel** — iOS blur tab bar, edge-to-edge, dark system UI.

## iCloud sign-in + CloudKit backend

Sign in with Apple gates the app, and what a user saves is written to **their
own private CloudKit database** — there is no MLAI server in the path.

```
expo-apple-authentication   Sign in with Apple (iCloud identity)
expo-secure-store           keychain persistence of the session + local fallback
modules/mlai-cloudkit/      native Swift module → CKContainer.privateCloudDatabase
plugins/withCloudKit.js     config plugin: iCloud + CloudKit entitlements
lib/auth.tsx                AuthProvider / useAuth, credential-revocation check
lib/cloud.ts                vault repository (CloudKit ⇢ encrypted-local fallback)
app/(auth)/sign-in.tsx      branded sign-in
app/(tabs)/vault.tsx        the CloudKit-backed feature — create, inline-edit,
                            delete, and search notes in your iCloud
app/account.tsx             identity · storage status · sign out
```

### What runs where

| Surface            | Sign in with Apple | CloudKit private DB |
| ------------------ | ------------------ | ------------------- |
| **Dev build / TestFlight (iOS)** | ✅ | ✅ |
| Expo Go (iOS)      | ✅ | ⛔ → encrypted-local fallback |
| Web / Android      | ⛔ → preview session | ⛔ → encrypted-local fallback |

The data layer detects the native module (`requireOptionalNativeModule`) and
falls back to an encrypted on-device store when it's absent, surfacing the
active backend in the Vault banner and Account screen. So the app runs
everywhere; **real iCloud sync requires a dev build** (the Swift module is
compiled, the entitlements are applied).

### One-time native setup

1. **Apple Developer** — in the App ID for `dev.mlai.mobile`, enable
   *Sign in with Apple* and *iCloud (CloudKit)*; create the container
   `iCloud.dev.mlai.mobile`.
2. **CloudKit Dashboard** (Development env) — create record type `VaultItem`:
   - `title` — String
   - `body` — String
   - `createdAt` — Double *(mark **Sortable** + **Queryable** so the newest-first
     query works; also keep `recordName` Queryable, which is the default)*
3. **Build it natively** (not Expo Go):

```bash
bunx expo prebuild --clean      # generates ios/ with entitlements via the plugin
bunx expo run:ios               # local dev build on a device/simulator
# or, cloud build:
bunx eas build --profile development --platform ios
```

> The plugin writes the iCloud container, `com.apple.developer.icloud-services`,
> and the `remote-notification` background mode (reserved for future CloudKit
> subscription pushes). `aps-environment` defaults to `development`.

### Verification status (this feature)

- `tsc --noEmit` — **clean** with the auth + CloudKit code included.
- `expo export --platform web` — **succeeds**; 16 routes bundle, the auth gate
  redirects protected routes, and the optional-native-module fallback resolves.
- The **Swift module was not compiled** and **CloudKit was not exercised** in the
  build environment — that requires an Apple-signed dev build on a device with an
  iCloud account. The Swift, entitlements, and schema are written to spec.



## Integrity rules (same as the web)

- Every metric carries provenance — **● measured · ○ target · ◆ reported** — and
  the three are never conflated. A target is never shown as a result.
- The only Apple framing used anywhere is:
  *"Built on Apple's public frameworks — Metal, Accelerate, Core ML."*
- The open core is **Apache-2.0**.

## Verification status

- `tsc --noEmit` (strict) — **clean**, against real Expo SDK 53 / RN 0.79 types.
- `bun run test` (jest-expo) — **passing**; pure-logic suites cover the vault
  repository (add/update/delete/search helpers, local fallback) and the brand /
  theme / auth helpers.
- `bun run lint` (eslint-config-expo) — **clean**, 0 problems.
- `expo export --platform web` — **succeeds**; all 16 routes bundle and
  statically render (home, the four tab sections, `vault`, `account`, `sign-in`,
  `product/[slug]`, and the 404).
- A native iOS/Android simulator was not run in the build environment, so the
  final visual pass is yours: `bun run ios` / `bun run android`. On native, the
  gradient hero text and iOS blur render fully (react-native-web approximates
  both).
