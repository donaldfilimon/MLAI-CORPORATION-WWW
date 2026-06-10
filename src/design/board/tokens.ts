/* ════════════════════════════════════════════════════════════════
   MLAI Design Upgrade v2 — token data (the reconciled MLAI v2 system)
   Pure data, no React. Mirrors the original dsv2-core.jsx token tables
   plus the CSS-export tables from dsv2-tokens.jsx.
   ════════════════════════════════════════════════════════════════ */

/* ── Color reconciliation ──────────────────────────────────────── */
export interface ColorEntry {
  readonly token: string;
  readonly value: string;
  readonly note: string;
}

const c = (token: string, value: string, note: string): ColorEntry => ({ token, value, note });

export const COLOR: Readonly<Record<"action" | "spectrum" | "semantic" | "neutral", readonly ColorEntry[]>> = {
  action: [
    c("--action", "#3B82F6", "Primary action · buttons, links, focus"),
    c("--action-hover", "#2563EB", "Hover / pressed action"),
    c("--action-soft", "rgba(59,130,246,0.14)", "Tinted action surface"),
  ],
  spectrum: [
    c("--spectrum-cyan", "#22D3EE", "Abi · moderation, interactive accents"),
    c("--spectrum-blue", "#60A5FA", "Mid-spectrum · charts, gradients"),
    c("--spectrum-violet", "#A855F7", "Aviva · research, vision"),
  ],
  semantic: [
    c("--proof", "#34D399", "Abbey · success, verified, benchmark-pass"),
    c("--signal", "#FBBF24", "Benchmarks, attention, throughput"),
    c("--danger", "#F87171", "Failure modes, destructive"),
  ],
  neutral: [
    c("--text", "#FAFAFA", "Primary text"),
    c("--text-dim", "#A1A1AA", "Secondary text"),
    c("--text-faint", "#71717A", "Tertiary / captions"),
    c("--hair", "rgba(255,255,255,0.08)", "Hairline borders"),
  ],
};

/* The persona ↔ color binding (resolves brand-board colors into roles) */
export interface PersonaEntry {
  readonly name: string;
  readonly role: string;
  readonly color: string;
  readonly token: string;
}
export const PERSONA: readonly PersonaEntry[] = [
  { name: "Abbey", role: "Empathic Polymath", color: "#34D399", token: "proof" },
  { name: "Aviva", role: "Unfiltered Expert", color: "#A855F7", token: "spectrum-violet" },
  { name: "Abi", role: "Adaptive Moderator", color: "#22D3EE", token: "spectrum-cyan" },
];

/* 4-tier surface elevation ramp */
export interface ElevationEntry {
  readonly n: string;
  readonly name: string;
  readonly token: string;
  readonly bg: string;
  readonly use: string;
  readonly shadow: string;
  readonly border: string;
}
export const ELEVATION: readonly ElevationEntry[] = [
  { n: "L0", name: "Canvas", token: "--surface-0", bg: "#050509", use: "Page background", shadow: "none", border: "transparent" },
  { n: "L1", name: "Sunken", token: "--surface-1", bg: "#08090F", use: "Inset wells, code, inputs", shadow: "inset 0 2px 14px rgba(0,0,0,0.55)", border: "rgba(255,255,255,0.05)" },
  { n: "L2", name: "Surface", token: "--surface-2", bg: "#0E0F18", use: "Default card / panel", shadow: "0 8px 32px rgba(0,0,0,0.35)", border: "rgba(255,255,255,0.08)" },
  { n: "L3", name: "Raised", token: "--surface-3", bg: "#16172132", use: "Hover, nested card, popover", shadow: "0 14px 44px rgba(0,0,0,0.5)", border: "rgba(255,255,255,0.11)" },
  { n: "L4", name: "Overlay", token: "--surface-4", bg: "#1D1E2A", use: "Modal, tooltip, command menu", shadow: "0 28px 80px rgba(0,0,0,0.7)", border: "rgba(255,255,255,0.14)" },
];

/* spacing scale — 4px base. Tuple: [name, rem, px] */
export type SpacingEntry = readonly [name: string, rem: string, px: number];
export const SPACING: readonly SpacingEntry[] = [
  ["1", "0.25rem", 4], ["2", "0.5rem", 8], ["3", "0.75rem", 12], ["4", "1rem", 16],
  ["5", "1.5rem", 24], ["6", "2rem", 32], ["7", "3rem", 48], ["8", "4rem", 64],
  ["9", "6rem", 96], ["10", "8rem", 128],
];

/* rhythm tokens built on the scale. Tuple: [token, value, note] */
export type RhythmEntry = readonly [token: string, value: string, note: string];
export const RHYTHM: readonly RhythmEntry[] = [
  ["--space-section", "clamp(4rem, 9vw, 8rem)", "Vertical padding between page sections"],
  ["--space-block", "3rem", "Gap between blocks within a section"],
  ["--space-card", "2rem", "Internal card padding"],
  ["--space-stack", "1.5rem", "Default vertical stack gap"],
  ["--space-inline", "0.75rem", "Inline gap (chips, icon+label)"],
];

/* refined type scale (Major Third, tuned leading + tracking)
   Tuple: [label, token, size, lineHeight, letterSpacing, font, weight, use] */
export type TypeEntry = readonly [
  label: string,
  token: string,
  size: string,
  lineHeight: number,
  letterSpacing: string,
  font: string,
  weight: number,
  use: string,
];
export const TYPE: readonly TypeEntry[] = [
  ["Display", "--text-h00", "4.768rem", 1.02, "-0.03em", "Outfit", 700, "Hero headline"],
  ["H0", "--text-h0", "3.815rem", 1.05, "-0.025em", "Outfit", 700, "Page title"],
  ["H1", "--text-h1", "3.052rem", 1.08, "-0.02em", "Outfit", 700, "Section title"],
  ["H2", "--text-h2", "2.441rem", 1.1, "-0.015em", "Outfit", 600, "Subsection"],
  ["H3", "--text-h3", "1.953rem", 1.15, "-0.01em", "Outfit", 600, "Card heading"],
  ["H4", "--text-h4", "1.563rem", 1.25, "0", "Inter", 600, "Lead / large body"],
  ["H5", "--text-h5", "1.25rem", 1.4, "0", "Inter", 600, "Emphasis"],
  ["Body", "--text-base", "1rem", 1.6, "0", "Inter", 400, "Paragraph text"],
  ["Mono", "--text-mono", "0.75rem", 1.5, "0.18em", "JetBrains Mono", 500, "Labels, code, eyebrows"],
];

/* ════════════════════════════════════════════════════════════════
   CSS export tables (from dsv2-tokens.jsx) — strings for the
   Tokens / CSS section's CodeBlock.
   ════════════════════════════════════════════════════════════════ */

export const CSS_TABS: Readonly<Record<string, string>> = {
  Color: `/* roles — components consume these, never raw hues */
--action:          #3b82f6;
--action-hover:    #2563eb;
--action-soft:     rgba(59,130,246,0.14);

--spectrum-grad:   linear-gradient(100deg,#67e8f9,#60a5fa,#c084fc);
--persona-abbey:   #34d399;   /* proof / verified  */
--persona-aviva:   #a855f7;   /* research / vision */
--persona-abi:     #22d3ee;   /* interactive       */

--proof:  #34d399;   --signal: #fbbf24;   --danger: #f87171;
--text:   #fafafa;   --text-dim: #a1a1aa; --text-faint: #6b6b76;`,

  Elevation: `/* 4-tier surface ramp — each pairs with a fixed shadow */
--surface-0: #050509;  /* canvas  */  --shadow-1: inset 0 2px 14px rgba(0,0,0,.55);
--surface-1: #08090f;  /* sunken  */  --shadow-2: 0 8px 32px rgba(0,0,0,.35);
--surface-2: #0e0f18;  /* surface */  --shadow-3: 0 14px 44px rgba(0,0,0,.5);
--surface-3: #161721;  /* raised  */  --shadow-4: 0 28px 80px rgba(0,0,0,.7);
--surface-4: #1d1e2a;  /* overlay */

--glass-fill: linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.01));
--glass-blur: blur(14px);`,

  Spacing: `/* 4px base scale */
--space-1:.25rem; --space-2:.5rem; --space-3:.75rem; --space-4:1rem;
--space-5:1.5rem; --space-6:2rem;  --space-7:3rem;   --space-8:4rem;

/* semantic rhythm — built on the scale */
--space-section: clamp(4rem,9vw,8rem);
--space-block:   3rem;     --space-card:  2rem;
--space-stack:   1.5rem;   --space-inline:.75rem;`,

  Type: `--font-display:'Outfit',sans-serif;
--font-sans:'Inter',system-ui,sans-serif;
--font-mono:'JetBrains Mono',ui-monospace,monospace;

/* Major-Third scale (1.25) */
--text-h00:4.768rem; --text-h1:3.052rem; --text-h3:1.953rem;
--text-base:1rem;    --text-mono:.75rem;

--tracking-display:-.03em; --tracking-tight:-.02em; --tracking-mono:.18em;
--leading-display:1.02;    --leading-normal:1.6;`,

  Motion: `--ease-out:    cubic-bezier(.22,1,.36,1);
--ease-in-out: cubic-bezier(.65,0,.35,1);
--dur-fast: 180ms;  --dur-base: 300ms;  --dur-slow: 500ms;

@media (prefers-reduced-motion: reduce) {
  *,*::before,*::after { transition-duration:.01ms!important; }
}`,
};

export const USAGE = `/* before — one-off, unsystematic */
.card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 4px 16px rgba(0,0,0,.3);
  padding: 22px;  border-radius: 18px;
}

/* after — every value is a system decision */
.card {
  background: var(--glass-fill);
  border: 1px solid var(--border-2);
  box-shadow: var(--shadow-2), var(--glass-sheen);
  padding: var(--space-card);
  border-radius: var(--radius-lg);
}`;

/* ════════════════════════════════════════════════════════════════
   Theme / Tweak data (from the html shell)
   ════════════════════════════════════════════════════════════════ */

export interface ThemeTriple {
  readonly a: string;
  readonly b: string;
  readonly c: string;
}
export const THEMES: Readonly<Record<string, ThemeTriple>> = {
  Spectrum: { a: "#22d3ee", b: "#60a5fa", c: "#a855f7" },
  Cyan: { a: "#22d3ee", b: "#38bdf8", c: "#3b82f6" },
  Violet: { a: "#818cf8", b: "#a855f7", c: "#e879f9" },
  Aurora: { a: "#22d3ee", b: "#34d399", c: "#a3e635" },
  Ember: { a: "#fbbf24", b: "#fb923c", c: "#f87171" },
};

export const CANVASES: Readonly<Record<string, string>> = {
  Void: "#050509",
  Ink: "#070a12",
  Slate: "#0b0d14",
  Plum: "#0a0710",
};

export type TweakState = {
  theme: string;
  canvas: string;
  radius: number;
  glass: number;
  grain: boolean;
};
export const TWEAK_DEFAULTS: TweakState = {
  theme: "Violet",
  canvas: "Ink",
  radius: 20,
  glass: 14,
  grain: true,
};

/* nav table — [id, num, label] */
export type NavEntry = readonly [id: string, num: string, label: string];
export const NAV: readonly NavEntry[] = [
  ["review", "00", "Review"],
  ["color", "01", "Color"],
  ["elevation", "02", "Elevation"],
  ["spacing", "03", "Spacing"],
  ["type", "04", "Typography"],
  ["light", "05", "Light"],
  ["components", "06", "Components"],
  ["applied", "07", "Applied page"],
  ["tokens", "08", "Tokens / CSS"],
];
