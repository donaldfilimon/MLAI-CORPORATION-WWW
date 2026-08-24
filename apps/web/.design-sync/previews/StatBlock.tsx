import { StatBlock } from "mlai-corporation-www";

/** The Lab canvas these components are designed for. */
const ink = { background: "#05070d", padding: 28, borderRadius: 12, maxWidth: 340 } as const;

/**
 * `abbey` accent = the agent/persona layer, and the figure is a persona count —
 * the product accent should always match the layer the figure describes.
 */
export const Measured = () => (
  <div style={ink}>
    <StatBlock
      accent="abbey"
      stat={{
        value: "3",
        label: "Personas in the routing layer",
        tag: "measured",
        note: "Abbey · Aviva · Abi",
      }}
    />
  </div>
);

/** `abi` accent = the runtime/GPU layer; WebGPU dispatch is an open goal there. */
export const Target = () => (
  <div style={ink}>
    <StatBlock
      accent="abi"
      stat={{
        value: "WebGPU",
        label: "Production GPU dispatch",
        tag: "target",
        note: "CPU vector backend is authoritative today",
      }}
    />
  </div>
);

/** `wdbx` accent = the retrieval layer, and the figure is a cited search property. */
export const Reported = () => (
  <div style={ink}>
    <StatBlock
      accent="wdbx"
      stat={{
        value: "O(log n)",
        label: "Graph search complexity",
        tag: "reported",
        note: "HNSW — Malkov & Yashunin (2018)",
      }}
    />
  </div>
);
