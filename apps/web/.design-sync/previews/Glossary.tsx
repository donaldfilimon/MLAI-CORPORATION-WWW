import { Glossary } from "mlai-corporation-www";

const ink = { background: "#05070d", padding: 28, borderRadius: 12, maxWidth: 720 };

export const Vocabulary = () => (
  <div style={ink}>
    <Glossary
      items={[
        {
          term: "WDBX",
          def: "Durable vector and block memory store with JSONL persistence — the retrieval substrate underneath every MLAI surface.",
        },
        {
          term: "ABI",
          def: "Query planning, context-pack orchestration, and the runtime around WDBX, exposed through the abi CLI and abi-mcp tools.",
        },
        {
          term: "Abbey",
          def: "The CLI-facing agent and persona layer — Abbey, Aviva, and Abi — built on the WDBX/ABI core.",
        },
        {
          term: "SEA",
          def: "Sparse Evidence Attention: scores durable records across independent criteria, then packs greedily under a token budget.",
        },
      ]}
    />
  </div>
);

/** Longer terms wrap the fixed 10rem term column; definitions run to two lines. */
export const Concepts = () => (
  <div style={ink}>
    <Glossary
      items={[
        {
          term: "Context pack",
          def: "The bounded set of records handed to a model for one request. Assembled under a token budget and a diversity constraint, so the answer is grounded only in what the pack contains.",
        },
        {
          term: "Write-ahead log",
          def: "The append-only record of every write, hash-chained block by block. It lives beside the vector index rather than inside it, which keeps provenance and retrieval independent concerns.",
        },
        {
          term: "Provenance class",
          def: "The label every published figure carries — measured, target, or reported. The three are never conflated, and a target is never presented as an achievement.",
        },
        {
          term: "Persona register",
          def: "The conversational mode a persona answers in. Abbey is empathetic and open-ended, Aviva direct and token-frugal; Abi routes between them or blends both.",
        },
      ]}
    />
  </div>
);
