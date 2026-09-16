# Handoff: MLAI mobile app + website

## Overview
Design + reference implementation for two surfaces: the **Expo mobile companion** (new IA with a
Chat tab, onboarding, and a WDBX console screen) and the **Next.js website** (nine marketing pages,
a docs shell with a ⌘K palette, and the private console behind its AuthKit gate).

## About the design files
The `.dc.html` files in this project are **design references created in HTML** — prototypes showing
intended look and behavior, not production code to copy directly. The `src/` folder in this bundle
holds **reference TSX** written against the real conventions of `donaldfilimon/MLAI-CORPORATION-WWW`
(Bun 1.4 workspaces, Expo SDK 53 + React 19 for mobile, Next 15 + Tailwind v4 for web). Treat that TSX
as the starting point to drop into `apps/mobile` / `apps/web` — it imports the repo's own modules
(`@/lib/theme`, `@/lib/brand`, `@/components/ui/*`, `@/components/site`) rather than redefining them.

## Fidelity
**High-fidelity.** Colors, type, spacing, and copy are final and traceable:
- Mobile tokens come verbatim from `apps/mobile/lib/theme.ts`.
- Web tokens/components come from `apps/web/src/index.css` + `src/components/site/*`, consumed here
  through the published `MlaiLab` design-system bundle.
- Every figure comes from `lib/brand.ts` and carries its provenance class. **No new numbers were invented.**

## What is NEW vs. RECREATED

| Surface | Status |
|---|---|
| Mobile Home / Stack / Vault / Company / Product detail / Sign-in | Recreated from `apps/mobile` |
| Mobile **Chat** tab (persona routing, recall chips, trace) | **New** |
| Mobile **tab IA**: Home · Stack · Chat · Vault · Company | **New** (Platform folded into Stack; Chat is the 5th tab) |
| Mobile **onboarding** (3 quiet cards after sign-in) | **New** |
| Mobile **WDBX console** screen | **New** |
| Website marketing pages (Home, WDBX, ABI, Abbey, Platform, Research, Investors, Company, Contact) | Recreated/expanded from `apps/web/src/views` + `data/categories` |
| Website **docs shell** (6 pages + ⌘K palette) | New shell; content grounded in `views/Docs.tsx` |
| Website **console + gate** | Recreated from `views/Console.tsx` + `views/Login.tsx` |

## Screens

### Mobile — Chat (NEW, the main build)
- **Purpose**: talk to Abbey; see which persona answered and why.
- **Layout**: `SafeAreaView` (edges `["top"]`) → header block → `FlatList`/ScrollView of turns →
  composer pinned above the tab bar. Horizontal padding `space.xl` (24). Bottom padding `tabScrollPadding`.
- **Header** (padding `0 24 12`, `borderBottomWidth: 1`, `borderBottomColor: color.line`):
  accent tick (18×1.5, `color.abbey`) + `Eyebrow` "ABBEY" in `color.abbey`; right side mono 11px
  `color.textFaint` "LOCAL · WDBX MEMORY".
- **Persona picker**: row of 4 pills (`AUTO` · `ABBEY` · `AVIVA` · `ABI`), `flex: 1` each, `gap: 6`,
  `borderRadius: radius.pill`, `paddingVertical: 7`. Inactive: `rgba(255,255,255,0.04)` fill +
  `rgba(255,255,255,0.12)` border, label `color.textDim`. Active: persona color fill (AUTO → `color.text`),
  label `color.ink`, no border. Label is `type.mono` at 10px, `letterSpacing: 1`.
- **Turn types** (each a discriminated union member — see `src/mobile/lib/chat.ts`):
  - `user`: right-aligned, `maxWidth: "78%"`, `color.panelRaised` fill, `color.line` border,
    radius `16 16 4 16`, padding `12 14`, body 14/21 `color.text`.
  - `recall`: a wrapped row of cyan chips — `rgba(34,211,238,0.08)` fill, `rgba(34,211,238,0.3)` border,
    radius pill, padding `4 10`; label mono 10px `color.wdbx`, score mono 10px `color.textFaint`.
    Preceded by mono 10px "◆ RECALLED".
  - `trace`: a 5px cyan dot at 0.7 opacity + mono 10.5px `color.textFaint`, e.g.
    `abi → aviva · intent: technical_recall · p=0.91`.
  - `persona`: left-aligned, `maxWidth: "86%"`; a 7px glowing dot in the persona color + persona name
    in mono 10px `letterSpacing: 1.5`; then a `Surface` bubble radius `4 16 16 16`, padding `12 14`.
- **Typing indicator**: three 6px dots, staggered opacity loop (Reanimated `withRepeat`), inside a
  `Surface`-styled bubble.
- **Composer**: `color.panel` fill, `color.line` border, `borderRadius: radius.pill`, padding `6 6 6 16`;
  `TextInput` flex 1 at 14px; send button 34×34 circle `color.wdbx` with a 14px up-arrow in `color.ink`.
  Placeholder reads "Message — Abi routes it" in AUTO, "Direct to Abbey" etc. when pinned.
- **Interactions**: send → optimistic user turn → `typing: true` → recall chips → trace → persona reply.
  Every send fires `Haptics.impactAsync(Light)` via the existing `PressableScale`.

### Mobile — tab bar (NEW IA)
`app/(tabs)/_layout.tsx` gains a `chat` screen and drops `platform` (its four layers move into
`stack.tsx` as a second section). Order: `index` · `stack` · `chat` · `vault` · `company`.
The chat icon is a speech bubble drawn with `react-native-svg` in the existing `Icon` switch —
same `strokeWidth={1.8}`, same active/inactive colors (`color.wdbx` / `color.textMute`).

### Mobile — onboarding (NEW)
Three cards shown once after first sign-in, stored under a `SecureStore` key (`mlai.onboarded`).
Each card is a `Surface` with an accent top edge; accents cycle wdbx → abbey → abi. Dots (7px) at the
bottom-left, primary button bottom-right (`color.wdbx`, radius 10, padding `11 18`, mono label).
Card 2 lists the three personas with their dots; card 3 shows the provenance legend.

### Mobile — console (NEW)
2-up grid of metric tiles (`color.panel`, radius `radius.md`, padding 14; value in `type.mono` at 22px,
label mono 9.5px `letterSpacing: 1` + provenance glyph), then the scale-benchmark table
(4-column grid, zebra rows at `rgba(255,255,255,0.02)`, highlighted `8.2ms` cell in `color.wdbx`),
then the trace list, then the benchmark-runner row. **Every figure comes from `brand.ts`.**

### Website — docs shell
230px sticky sidebar + 52rem content column, 48px gap, 80rem container. Sidebar: a ⌘K search box
(`rgba(255,255,255,0.03)` fill, radius 11), then nav groups (mono 10.5px uppercase headers, items
13.5px with a 2px cyan left edge + `rgba(34,211,238,0.08)` fill when active). Palette: fixed overlay
`rgba(0,0,0,0.6)` + 4px blur, 560px panel at 15vh, `#0a0e16` fill, radius 16, shadow
`0 24px 80px rgba(0,0,0,0.6)`; ⌘K/Ctrl+K toggles, Escape closes, results filter on label+title+group.
Empty state: "recall@10 = 0.000 — nothing matches."

### Website — console + gate
Gate: 64rem two-up grid centered in the viewport with a 700px radial cyan wash behind it. Left panel
is the pitch + three mono trust rows; right panel is the logo mark, heading, and two pill buttons.
Workspace: header with sign-out, then `0.72fr / 1.28fr` grid — left column session/boundary/consent
cards, right column the composer (disabled until consent is accepted) and the audits list.

## Interactions & behavior
- Mobile entrances: `FadeInDown` + `springify().damping(18)`, 500ms, staggered 60–120ms
  (`Reveal` in `components/ui/Motion.tsx`). Reduce-motion is honored automatically by Reanimated.
- Web motion: one curve `cubic-bezier(0.22, 1, 0.36, 1)`; 180ms hover, 280ms card lift, 300ms reveal.
  Cards lift −2px with a cyan hairline on hover. Buttons shift background only, never scale.
- Consent gating (console): the generate button is inert and dimmed until the audit policy is accepted.
- Chat routing is deterministic in the reference implementation: a keyword-weight function
  (`routeTurn` in `src/mobile/lib/chat.ts`) returns the persona plus the weights that produced it,
  so the trace line and the routing bars render from the same source. Swap that function's body for
  the real runtime call; keep its return shape.

## State
Mobile chat: `turns: Turn[]`, `pinned: Persona | "auto"`, `typing: boolean`, `draft: string`.
Onboarding: `step: 0 | 1 | 2` + the SecureStore flag. Console (web): `consent`, `prompt`, `reply`,
`busy`, `audits`. Docs: `page`, `paletteOpen`, `query`.

## Design tokens
Do not redefine these — import them.
- Mobile: `apps/mobile/lib/theme.ts` (`color`, `space`, `radius`, `type`, `font`, `accentColor`, `tint`,
  `tabBarHeight`, `tabScrollPadding`). Ink `#05070D`, panel `#0E1218`, raised `#171B21`,
  line `rgba(255,255,255,0.10)`; wdbx `#22D3EE`, abi `#A855F7`, abbey `#34D399`, warn `#FBBF24`.
  Type: Spectral (display) / Geist (body) / JetBrains Mono.
- Web: `apps/web/src/index.css` `:root`. Canvas `#05070d`, surface `#0a0e16`, primary cyan `#22d3ee`
  (hover `#06b6d4`). Borders are white at 5/8/11/14% — those four values only. Radius knob `0.7rem`.

## Assets
No new assets. The mark is `components/Logo.tsx` (mobile, react-native-svg) and
`components/LogoMark.tsx` (web) — both already in the repo. Icons: Lucide on web; hand-rolled
`react-native-svg` paths in the mobile tab bar, matching the existing set. No emoji anywhere.

## Files in this bundle
> **Folder-name note:** Expo Router group folders use parentheses, but this bundle stores them as
> `-tabs-` (parentheses are not preserved on write). **Rename `src/mobile/app/-tabs-/` to
> `src/mobile/app/(tabs)/`** when you drop these into `apps/mobile`.

```
src/mobile/lib/chat.ts                  Turn types + deterministic routing + the demo thread
src/mobile/app/-tabs-/_layout.tsx       New 5-tab IA with the Chat icon   -> rename to (tabs)/
src/mobile/app/-tabs-/chat.tsx          The Chat screen               -> rename to (tabs)/
src/mobile/app/onboarding.tsx           Three-card onboarding
src/mobile/components/ChatTurn.tsx      Turn renderers (user / recall / trace / persona)
src/mobile/components/PersonaPicker.tsx The 4-pill segmented control
src/web/views/DocsShell.tsx             Docs shell + ⌘K palette
src/web/views/ConsoleGate.tsx           The AuthKit gate panel
design/                                 The HTML design references (.dc.html)
```

## Verification
```bash
bun run check:mobile   # tsc --noEmit, jest, eslint, expo export --platform web
bun run check:web      # lint, test, build
```
New screens must land green on both gates before merge. The `brand.test.ts` suite asserts that every
rendered figure carries a provenance class — keep new figures flowing through `brand.ts`.
