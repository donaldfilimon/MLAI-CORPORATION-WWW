import { DataTable } from "mlai-corporation-www";

const ink = { background: "#05070d", padding: 28, borderRadius: 12, maxWidth: 760 };

export const IndexLayers = () => (
  <div style={ink}>
    <DataTable
      accent="wdbx"
      caption="Layer structure of a navigable small-world graph."
      cols={["Layer", "Nodes", "Role"]}
      rows={[
        ["L2", "sparse", "entry points"],
        ["L1", "routing", "coarse traversal"],
        ["L0", "all vectors", "full vector set"],
      ]}
    />
  </div>
);

export const PersonaRegisters = () => (
  <div style={ink}>
    <DataTable
      accent="abbey"
      highlightCol={1}
      caption="How the three routing personas differ in register."
      cols={["Persona", "Accent", "Register"]}
      rows={[
        ["Abbey", "emerald", "empathetic, open-ended"],
        ["Aviva", "violet", "direct, token-frugal"],
        ["Abi", "cyan", "router / moderator"],
      ]}
    />
  </div>
);

export const ToolSurface = () => (
  <div style={ink}>
    <DataTable
      accent="abi"
      highlightCol={2}
      caption="Where each entry point runs and what it exposes."
      cols={["Entry point", "Runs as", "Exposes"]}
      rows={[
        ["abi", "local CLI process", "store, query, agent"],
        ["abi-mcp", "MCP stdio server", "the same runtime as tools"],
        ["wdbx", "embedded library", "vector + block store APIs"],
      ]}
    />
  </div>
);
