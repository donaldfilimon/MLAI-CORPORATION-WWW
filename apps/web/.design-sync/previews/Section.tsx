import { Section, FeatureCard } from "mlai-corporation-www";

/**
 * The Lab DS is dark-only — every story is mounted on the ink canvas
 * (`--background` ≈ `#05070d`) the components were designed for.
 */
const ink = { background: "#05070d", padding: 28, borderRadius: 12 };

export const VectorStore = () => (
  <div style={ink}>
    <Section
      accent="wdbx"
      eyebrow="Vector store"
      title="Retrieval where the data lives"
      lead="WDBX keeps vectors on-device behind a local index and an append-only log."
    >
      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr" }}>
        <FeatureCard
          accent="wdbx"
          title="Durable index"
          desc="Vectors and blocks append to a JSONL log, so a restart replays to the state the last write left."
        />
        <FeatureCard
          accent="wdbx"
          title="Snapshot reads"
          desc="MVCC holds each query on a stable snapshot while ingestion commits behind it."
        />
      </div>
    </Section>
  </div>
);

export const Runtime = () => (
  <div style={ink}>
    <Section
      accent="abi"
      eyebrow="Runtime"
      title="One CLI across the stack"
      lead="The abi binary drives ingestion, planning, and retrieval from a single process."
    >
      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr" }}>
        <FeatureCard
          accent="abi"
          title="MCP tool surface"
          desc="The same commands are exposed to agents over the Model Context Protocol server."
        />
        <FeatureCard
          accent="abi"
          title="Inspectable runs"
          desc="Each run is written as hash-chained events, so a session can be re-walked step by step."
        />
      </div>
    </Section>
  </div>
);

export const AgentLayer = () => (
  <div style={ink}>
    <Section
      accent="abbey"
      eyebrow="Agent layer"
      title="Three minds, one assistant"
      lead="Abbey routes each request across three personas instead of overloading one voice."
    >
      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr" }}>
        <FeatureCard
          accent="abbey"
          title="Persona routing"
          desc="Abi picks Abbey, Aviva, or a blend per request, so empathy and precision stay distinct."
        />
        <FeatureCard
          accent="abbey"
          title="Grounded answers"
          desc="Every persona answers from the retrieved pack, not from an unbounded context window."
        />
      </div>
    </Section>
  </div>
);
