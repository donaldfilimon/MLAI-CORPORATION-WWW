import { SplitSection } from "mlai-corporation-www";

/**
 * Dark-only DS: mounted on the ink canvas. The `maxWidth` keeps the editorial
 * band at a page-like measure — the sticky two-column layout itself only
 * engages at `lg` (1024px) and above.
 */
const ink = { background: "#05070d", padding: 28, borderRadius: 12, maxWidth: 880, margin: "0 auto" };

export const Retrieval = () => (
  <div style={ink}>
    <SplitSection accent="wdbx" kicker="Vector store" title="Retrieval that stays local">
      <p>
        WDBX keeps the vector index, the write-ahead log, and the audit chain as separate
        concerns. The chain sits alongside the index rather than inside it, so tamper-evident
        provenance never taxes a query.
      </p>
      <p>
        Because the store is a single local process, there is no network hop between the model
        and its memory — the privacy-first posture is structural, not a setting.
      </p>
    </SplitSection>
  </div>
);

export const Runtime = () => (
  <div style={ink}>
    <SplitSection accent="abi" kicker="Runtime" title="One binary, one tool surface">
      <p>
        The abi CLI drives ingestion, query planning, and retrieval from a single process, and
        exposes the same commands to agents over its MCP server.
      </p>
      <p>
        Runs are written as hash-chained events, so a session can be re-walked to the exact
        decision point rather than reconstructed from prose logs.
      </p>
    </SplitSection>
  </div>
);

export const Personas = () => (
  <div style={ink}>
    <SplitSection accent="abbey" kicker="Agent layer" title="Three minds, one assistant">
      <p>
        Abbey routes each request across three personas rather than overloading one agent.
        Abbey handles empathetic, open-ended reasoning; Aviva answers with token-frugal
        precision; Abi is the router that picks between them.
      </p>
      <p>
        The router is part of the architecture, not a prompt — the choice it makes is recorded
        alongside the retrieval path that grounded the answer.
      </p>
    </SplitSection>
  </div>
);
