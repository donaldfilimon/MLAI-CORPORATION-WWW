import { IndexCard } from "mlai-corporation-www";

/** The Lab canvas these components are designed for. */
const ink = { background: "#05070d", padding: 28, borderRadius: 12, maxWidth: 440 } as const;

export const Layers = () => (
  <div style={ink}>
    <IndexCard
      accent="wdbx"
      title="Graph layer structure"
      layers={[
        { name: "L2", nodes: "sparse", role: "entry points" },
        { name: "L1", nodes: "routing", role: "coarse traversal" },
        { name: "L0", nodes: "all vectors", role: "full vector set" },
      ]}
    />
  </div>
);

export const DeepIndex = () => (
  <div style={ink}>
    <IndexCard
      accent="abbey"
      title="Deep graph index"
      layers={[
        { name: "L3", nodes: "seed set", role: "single entry point" },
        { name: "L2", nodes: "sparse", role: "long-range hops" },
        { name: "L1", nodes: "routing", role: "coarse traversal" },
        { name: "L0", nodes: "all vectors", role: "exact neighborhood" },
      ]}
    />
  </div>
);

export const FlatStore = () => (
  <div style={ink}>
    <IndexCard
      accent="abi"
      title="Flat store (no graph)"
      layers={[{ name: "L0", nodes: "all vectors", role: "linear scan" }]}
    />
  </div>
);
