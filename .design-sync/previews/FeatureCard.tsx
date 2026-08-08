import { FeatureCard } from "mlai-corporation-www";

/**
 * Dark-only DS: every story sits on the ink canvas. The card is a grid child on
 * the site, so the ground is capped near one column's width.
 */
const ink = { background: "#05070d", padding: 28, borderRadius: 12, maxWidth: 436 };

export const Wdbx = () => (
  <div style={ink}>
    <FeatureCard
      accent="wdbx"
      title="Durable vector index"
      desc="Embeddings and blocks persist to an append-only JSONL log, so a restart replays to exactly the state the last write left behind."
    />
  </div>
);

export const Abi = () => (
  <div style={ink}>
    <FeatureCard
      accent="abi"
      title="One CLI, one MCP surface"
      desc="The abi binary drives ingestion, planning, and retrieval, and exposes the same commands to agents over MCP."
    />
  </div>
);

export const Abbey = () => (
  <div style={ink}>
    <FeatureCard
      accent="abbey"
      title="Persona routing"
      desc="Abi selects Abbey, Aviva, or a blend per request, so empathy and precision aren't forced through one voice."
    />
  </div>
);
