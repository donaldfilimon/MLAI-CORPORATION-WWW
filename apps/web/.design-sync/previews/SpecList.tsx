import { SpecList } from "mlai-corporation-www";

/** The Lab canvas these components are designed for. */
const ink = { background: "#05070d", padding: 28, borderRadius: 12, maxWidth: 460 } as const;

export const StoreConfig = () => (
  <div style={ink}>
    <SpecList
      rows={[
        { k: "Distance", v: "cosine" },
        { k: "Records", v: "vectors + block memory" },
        { k: "Segments", v: "wdbx.seg.N.jsonl" },
        { k: "Snapshots", v: "--save-db / --load-db" },
        { k: "Audit", v: "hash-chained blocks" },
      ]}
    />
  </div>
);

export const RuntimeConfig = () => (
  <div style={ink}>
    <SpecList
      rows={[
        { k: "Language", v: "Rust (edition 2024)" },
        { k: "Toolchain", v: "nightly" },
        { k: "Workspace crates", v: "12" },
        { k: "Protocol surfaces", v: "MCP · LSP · ACP" },
        { k: "Personas", v: "Abbey · Aviva · Abi" },
      ]}
    />
  </div>
);

export const TwoRows = () => (
  <div style={ink}>
    <SpecList
      rows={[
        { k: "Interface", v: "abi CLI" },
        { k: "Transport", v: "JSON-RPC over stdio" },
      ]}
    />
  </div>
);
