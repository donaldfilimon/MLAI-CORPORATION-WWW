/**
 * Provenance-tagged metrics. Every published number carries exactly one tag.
 *
 *   measured — we ran it, on named hardware, with a reproducible method
 *   target   — a design goal not yet hit; never rendered as achieved
 *   reported — a third party's figure; needs source + date + link
 *
 * A number that cannot carry one of these three does not get published.
 */

export type Provenance = "measured" | "target" | "reported";

export interface Metric {
  label: string;
  value: string;
  prov: Provenance;
  note: string;
}

export const PROV_GLYPH: Record<Provenance, string> = {
  measured: "\u25CF", // ●
  target: "\u25CB",   // ○
  reported: "\u25C6", // ◆
};

export const PROV_LABEL: Record<Provenance, string> = {
  measured: "measured",
  target: "target",
  reported: "reported",
};

export const WDBX_METRICS: Metric[] = [
  {
    label: "p50 search latency",
    value: "2.3ms",
    prov: "measured",
    // TODO(donald): fill hardware + date + HNSW params before this page goes public.
    // The provenance gate requires all three for a `measured` tag.
    note: "Hardware, date and index parameters pending — see TODO in src/lib/metrics.ts",
  },
  {
    label: "p99 search latency",
    value: "3.8ms",
    prov: "measured",
    note: "Hardware, date and index parameters pending — see TODO in src/lib/metrics.ts",
  },
  {
    label: "recall@10",
    value: "98.2%",
    prov: "measured",
    note: "Hardware, date and index parameters pending — see TODO in src/lib/metrics.ts",
  },
  {
    label: "resident set, 1M vectors",
    value: "96MB",
    prov: "measured",
    note: "Product quantization, 8-bit. Hardware and date pending.",
  },
  {
    label: "compression ratio",
    value: "32\u00D7",
    prov: "measured",
    note: "Product quantization, 8-bit, against fp32 baseline. Hardware and date pending.",
  },
  {
    label: "sustained QPS",
    value: "50k",
    prov: "target",
    note: "Design goal. Not yet achieved — do not render as a result.",
  },
  {
    label: "search latency",
    value: "<1ms",
    prov: "target",
    note: "Design goal. Current measured p50 is 2.3ms.",
  },
];

/**
 * Deliberately absent: any comparison row against Qdrant, Milvus or other
 * vector databases. Those claims are recorded as unverified. A table where
 * our number is measured and theirs is unsourced is an assertion, not a
 * comparison, and does not ship.
 */
