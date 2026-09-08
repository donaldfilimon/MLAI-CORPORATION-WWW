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

export const PROVENANCE_ORDER = Object.keys(
  PROVENANCE,
) as readonly Provenance[];

/**
 * Published figures. Keep empty until each row has a real `source`.
 * Do not paste design-handoff StatBlock grids here.
 */
export const figures: readonly ProvenancedFigure[] = [
  {
    id: "hnsw-m",
    value: "16",
    label: "HNSW neighbors per node and layer (M)",
    tag: "measured",
    accent: "wdbx",
    note: "Read from the constant the substrate compiles, not from a tuning guide.",
    source:
      "https://github.com/donaldfilimon/wdbx/blob/6114b95a9a44cba3c76c27908d797a7512c2d088/crates/abi-wdbx/src/hnsw.rs#L13",
  },
  {
    id: "hnsw-ef-construction",
    value: "40",
    label: "HNSW candidate width while inserting (ef_construction)",
    tag: "measured",
    accent: "wdbx",
    note: "Any page still showing 200 is quoting a default this substrate no longer has.",
    source:
      "https://github.com/donaldfilimon/wdbx/blob/6114b95a9a44cba3c76c27908d797a7512c2d088/crates/abi-wdbx/src/hnsw.rs#L15",
  },
  {
    id: "hnsw-ef-search",
    value: "32",
    label: "HNSW minimum candidate width while searching (ef)",
    tag: "measured",
    accent: "wdbx",
    source:
      "https://github.com/donaldfilimon/wdbx/blob/6114b95a9a44cba3c76c27908d797a7512c2d088/crates/abi-wdbx/src/hnsw.rs#L17",
  },
  {
    id: "hnsw-max-layers",
    value: "4",
    label: "HNSW graph layers, including layer zero",
    tag: "measured",
    accent: "wdbx",
    source:
      "https://github.com/donaldfilimon/wdbx/blob/6114b95a9a44cba3c76c27908d797a7512c2d088/crates/abi-wdbx/src/hnsw.rs#L11",
  },
  {
    id: "wal-chain-digest",
    value: "SHA-256",
    label: "Write-ahead log chain digest",
    tag: "measured",
    accent: "wdbx",
    note: "Each record carries prev_hash, so the chain is at the log rather than the index. Tamper-evidence for a local audit trail, not a witnessed transparency log.",
    source:
      "https://github.com/donaldfilimon/wdbx/blob/6114b95a9a44cba3c76c27908d797a7512c2d088/crates/abi-wdbx/src/format.rs#L16",
  },
  {
    id: "persona-routing",
    value: "Deterministic",
    label: "Persona routing",
    tag: "measured",
    accent: "abi",
    note: "Keyword-weighted f32 scores are normalized to a distribution and the highest weight wins. Inspectable and cheap; not a trained model.",
    source:
      "https://github.com/donaldfilimon/abi/blob/6cd758e327085acd18a877e7629142a1dbbafe77/crates/abi-ai/src/router.rs#L146",
  },
  {
    id: "persona-routing-learned",
    value: "Learned policy",
    label: "Persona routing, planned",
    tag: "target",
    accent: "abi",
    note: "No learned router exists in the runtime today. This row stays a target until one ships with an evaluation.",
    source:
      "Not implemented — the shipped router is the deterministic one above.",
  },
  {
    id: "query-latency",
    value: "—",
    label: "Vector query latency",
    tag: "target",
    accent: "wdbx",
    note: "No harness is published, so no number is. A figure appears here only with a named dataset, machine and toolchain spec, commit hash, and raw trials.",
    source: "No published harness. See BANNED_HANDOFF_FIGURES below.",
  },
];

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
