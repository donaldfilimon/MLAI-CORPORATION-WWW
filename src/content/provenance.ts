/**
 * Brand figure provenance — the gate in front of any StatBlock / ThroughputCard.
 *
 * Every public figure on this site carries exactly one tag:
 *   ● measured — reproduced on our hardware (harness + methodology published)
 *   ○ target   — engineering goal (not a result)
 *   ◆ reported — cited research figure (pinned source)
 *
 * Tags classify evidence; they do not create it. An empty `figures` array is
 * intentional until a reproducible harness lands. Handoff mock numbers
 * (295×, 0.8 ms, $1.5M, TAM tables, unsourced QPS) stay banned.
 *
 * Distinct from claim-ledger status (current / partial / proposed / not-claimed)
 * on `/repositories` — ledger words describe capability honesty; provenance
 * tags describe how a numeric figure was obtained.
 */

export type Provenance = "measured" | "target" | "reported";

export type ProductAccent = "wdbx" | "abi" | "abbey";

export interface ProvenancedFigure {
  /** Stable id for cross-page reference. */
  id: string;
  value: string;
  label: string;
  tag: Provenance;
  /** Optional hedge / scope note shown under the label. */
  note?: string;
  /** Product accent axis — not persona colors. */
  accent?: ProductAccent;
  /**
   * Where the evidence lives: harness path, paper DOI, or brand artifact.
   * Required for `measured` and `reported`; recommended for `target`.
   */
  source: string;
}

/** Glyph + label + short gloss — single table so a fourth class can't drift. */
export const PROVENANCE = {
  measured: {
    glyph: "●",
    label: "Measured",
    description: "reproduced on our hardware",
  },
  target: {
    glyph: "○",
    label: "Target",
    description: "engineering goal",
  },
  reported: {
    glyph: "◆",
    label: "Reported",
    description: "cited research figure",
  },
} as const satisfies Record<
  Provenance,
  { glyph: string; label: string; description: string }
>;

export const PROVENANCE_ORDER = Object.keys(PROVENANCE) as readonly Provenance[];

/**
 * Published figures. Keep empty until each row has a real `source`.
 * Do not paste design-handoff StatBlock grids here.
 */
export const figures: readonly ProvenancedFigure[] = [];

/** Explicit refusals — handoff / deck numbers that must not ship as StatBlocks. */
export const BANNED_HANDOFF_FIGURES = [
  "295× GPU matmul speedup",
  "0.8 ms latency",
  "13× neural-network speedup",
  "$1.5M / TAM tables",
  "unsourced QPS or accuracy grids",
  "energy kWh / efficiency % without a harness",
] as const;

export const provenancePolicy = {
  motto: "Tags classify evidence; they do not create it.",
  rules: [
    "Every StatBlock / ThroughputCard figure requires a Provenance tag.",
    "measured and reported rows must cite `source` (harness path, DOI, or brand artifact).",
    "Never interchange measured / target / reported.",
    "Claim-ledger status (current · partial · proposed · not-claimed) is a different axis — do not reuse those chips on numeric figures.",
    "Quesar never carries Intelligence Without Limits; IWL figures only on Abbey / ABI / Abbey Bot surfaces, still provenance-tagged.",
  ],
} as const;