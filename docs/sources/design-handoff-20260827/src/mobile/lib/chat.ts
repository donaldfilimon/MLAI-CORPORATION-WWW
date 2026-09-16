import type { Accent } from "@/lib/theme";

/* Chat turn vocabulary for the Abbey screen. Four turn kinds render four ways,
   so a routing decision and the memory it used are visible in the transcript
   itself rather than hidden behind the answer. */

export type Persona = "abbey" | "aviva" | "abi";

/** Persona colors are the FIXED persona axis, not the product accent axis:
   Abbey emerald, Aviva violet, Abi cyan. `accentColor` in theme.ts is keyed by
   product ("abi" -> violet), so map through this table for persona UI. */
export const personaAccent: Record<Persona, Accent> = {
  abbey: "abbey",
  aviva: "abi",
  abi: "wdbx",
};

export const personaLabel: Record<Persona, string> = {
  abbey: "ABBEY",
  aviva: "AVIVA",
  abi: "ABI",
};

export type RecallChip = { label: string; score: string };

export type Turn =
  | { kind: "user"; id: string; text: string }
  | { kind: "recall"; id: string; chips: RecallChip[] }
  | { kind: "trace"; id: string; text: string }
  | { kind: "persona"; id: string; persona: Persona; text: string };

/** The weights behind one routing decision — the same numbers the trace line
   prints, so the UI can never disagree with the explanation. */
export type Routing = {
  primary: Persona;
  weights: Record<Persona, number>;
  intent: string;
};

const TECHNICAL = ["debug", "fix", "error", "build", "compile", "code", "test", "param", "index", "hnsw"];
const DIRECT = ["urgent", "quick", "concise", "direct", "fast"];
const REFLECTIVE = ["why", "felt", "think", "explain", "understand", "right call"];

/**
 * Deterministic, inspectable routing — a baseline weight per profile adjusted by
 * input signals, then normalized. Replace the body with the real runtime call
 * when it lands; keep the return shape so the trace line and any routing bars
 * keep rendering from one source.
 */
export function routeTurn(input: string, pinned?: Persona): Routing {
  const text = input.toLowerCase();
  const hits = (words: string[]) => words.filter((w) => text.includes(w)).length;

  const raw: Record<Persona, number> = {
    aviva: 0.34 + hits(TECHNICAL) * 0.22 + hits(DIRECT) * 0.14,
    abbey: 0.33 + hits(REFLECTIVE) * 0.24,
    abi: 0.33,
  };
  if (pinned) raw[pinned] += 2;

  const total = raw.aviva + raw.abbey + raw.abi;
  const weights = {
    aviva: raw.aviva / total,
    abbey: raw.abbey / total,
    abi: raw.abi / total,
  };
  const primary = (Object.keys(weights) as Persona[]).reduce((a, b) =>
    weights[a] >= weights[b] ? a : b,
  );
  const intent = hits(REFLECTIVE) > 0 ? "reflective" : hits(TECHNICAL) > 0 ? "technical_recall" : "general";

  return { primary, weights, intent };
}

export function traceLine(r: Routing): string {
  return `abi → ${r.primary} · intent: ${r.intent} · p=${r.weights[r.primary].toFixed(2)}`;
}

/** The thread the design shows on first open. Content only — no figures, so it
   carries no provenance obligation. */
export const demoThread: Turn[] = [
  { kind: "user", id: "u1", text: "What did we settle on for the index parameters?" },
  {
    kind: "recall",
    id: "r1",
    chips: [
      { label: "◆ HNSW tuning — Jul 12", score: "0.89" },
      { label: "◆ Corpus metric choice", score: "0.84" },
    ],
  },
  { kind: "trace", id: "t1", text: "abi → aviva · intent: technical_recall · p=0.91" },
  {
    kind: "persona",
    id: "p1",
    persona: "aviva",
    text: "M=16, efConstruction=200. Cosine for the text corpus — you picked it for explainable recall. Done.",
  },
];
