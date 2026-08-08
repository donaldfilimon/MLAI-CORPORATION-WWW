import { ThroughputCard } from "mlai-corporation-www";

/** The Lab canvas these components are designed for. */
const ink = { background: "#05070d", padding: 28, borderRadius: 12, maxWidth: 440 } as const;

/**
 * One provenance class across the whole ladder — the common case, where every
 * row is a countable fact from the content layer.
 */
export const CoverageLadder = () => (
  <div style={ink}>
    <ThroughputCard
      accent="wdbx"
      title="Published content surfaces"
      rows={[
        { label: "Blog entries", value: "15", tag: "measured", fill: 1 },
        { label: "Research publications", value: "12", tag: "measured", fill: 0.8 },
        { label: "WDBX doc sets mirrored", value: "9", tag: "measured", fill: 0.6 },
        { label: "Product deep dives", value: "2", tag: "measured", fill: 0.13 },
      ]}
    />
  </div>
);

/**
 * The reason tags are per-row: a shipped count and an open engineering goal
 * sit in the same ladder without either one borrowing the other's standing.
 */
export const MixedProvenance = () => (
  <div style={ink}>
    <ThroughputCard
      accent="abi"
      title="Documentation coverage"
      rows={[
        { label: "WDBX doc sets mirrored", value: "9", tag: "measured", fill: 0.75 },
        { label: "Product deep dives published", value: "2", tag: "measured", fill: 0.17 },
        { label: "Complete V2 coverage", value: "in progress", tag: "target", fill: 1 },
      ]}
    />
  </div>
);
