---
name: run-mlai-mobile
description: Build, launch, drive, and screenshot the MLAI mobile app (Expo / React Native). Use to run mlai-mobile, start the web build, take screenshots, or smoke-test the UI headlessly. Drives the react-native-web target with a headless-Chrome (playwright-core) driver.
---

# run-mlai-mobile

`mlai-mobile` is an Expo SDK 53 / React 19 / React Native 0.79 app. Its native
iOS/Android targets need a simulator/device (not available headlessly), but the
**react-native-web** build runs in a normal browser — that is the surface this
skill drives. The driver, [`driver.mjs`](driver.mjs), serves the static web
export and pilots it with the system Chrome via `playwright-core`
(`channel:"chrome"` — no chromium download).

All paths below are relative to the repo root (`<unit>/`). The driver lives at
`.claude/skills/run-mlai-mobile/driver.mjs`.

## Prerequisites

- **Google Chrome** installed (the driver launches it via `channel:"chrome"`).
  Verified present at `/Applications/Google Chrome.app`.
- **Driver deps** (one-time) — installs `playwright-core` into the skill dir:

```bash
cd .claude/skills/run-mlai-mobile && npm i
```

## Build

Produce the static web bundle (16 routes) from the repo root:

```bash
bunx expo export --platform web
```

This writes `dist/`. Re-run it after any source change.

## Run (agent path — primary)

From the skill directory, point the driver at `dist/`; screenshots land in
`screenshots/`:

```bash
cd .claude/skills/run-mlai-mobile && node driver.mjs ../../../dist screenshots
```

On the **stock** build this captures exactly one screenshot,
`screenshots/01-sign-in.png`, and prints `GATE NOT PASSED` — see Gotchas. The
app boots, the client-side auth gate redirects to the sign-in screen, and the
driver renders it. That screenshot is your proof the web build runs.

To drive the **gated** app (home, products, vault, company) on web, apply the
unlock below first; the same command then captures `02-home.png` …
`05-company.png` (5 distinct screenshots).

## Unlock the gated app on web (optional — verified this session)

The auth gate cannot be passed on the stock web build (Gotcha #1). To drive the
real app on web, alias `expo-secure-store` to the localStorage shim shipped in
this skill (`patches/expo-secure-store.web.js`) — **web only**. Create
`metro.config.js` at the repo root:

```bash
cat > metro.config.js <<'JS'
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const config = getDefaultConfig(__dirname);
const shim = path.resolve(__dirname, ".claude/skills/run-mlai-mobile/patches/expo-secure-store.web.js");
const prev = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && moduleName === "expo-secure-store") {
    return { type: "sourceFile", filePath: shim };
  }
  return (prev || context.resolveRequest)(context, moduleName, platform);
};
module.exports = config;
JS
```

Then rebuild and re-run the driver:

```bash
bunx expo export --platform web
cd .claude/skills/run-mlai-mobile && node driver.mjs ../../../dist screenshots
```

The shim is **plaintext localStorage — dev only, never ship it.** Remove
`metro.config.js` and rebuild to return to the stock (gate-closed) web build.

## Gotchas

- **The web auth gate is impassable on the stock build.** `expo-secure-store`
  ships an *empty* web implementation — `node_modules/expo-secure-store/build/ExpoSecureStore.web.js`
  is literally `export default {}`. So `AuthProvider.continueAsGuest` →
  `setItemAsync` throws, the session never persists, and you stay on `/sign-in`.
  No console error surfaces (the rejection is swallowed). This is why the driver
  detects the gate and the unlock shim exists.
- **Click the button, not the hint.** The sign-in screen has a paragraph
  containing "continue in preview" *above* the "CONTINUE IN PREVIEW →" button,
  so `getByText("continue in preview").first()` clicks dead text. The driver
  uses `getByRole("button", { name: /continue in preview/i })`. Tabs are
  `role="tab"` (`getByRole("tab", { name: "Vault" })`).
- **Driver deps are isolated.** `playwright-core` is installed in the skill dir,
  not the app's `package.json`. `node driver.mjs` resolves it because Node looks
  up `node_modules` from the script's own directory.
- **`channel:"chrome"`** reuses the installed Chrome — no `playwright install`
  / chromium download needed.
- **iOS/Android are not runnable here.** Sign in with Apple + the real CloudKit
  Vault need a signed iOS build on a device/simulator. On web the Vault status
  banner correctly reads "Local only" (the encrypted-local fallback).

## Troubleshooting

- `No build at .../dist` → run `bunx expo export --platform web` first.
- `GATE NOT PASSED ... sign-in only` → expected on the stock build; apply the
  unlock above to reach the gated screens.
- `Cannot find package 'playwright-core'` → you ran the driver from the wrong
  dir, or skipped `npm i`. Run it from `.claude/skills/run-mlai-mobile/`.
- Build error `failed to read file ... patches/expo-secure-store.web.js` after
  adding `metro.config.js` → the shim file is missing; it must exist at
  `.claude/skills/run-mlai-mobile/patches/expo-secure-store.web.js`.
