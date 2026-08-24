import { FAQList } from "mlai-corporation-www";

// The converter's preview template hardcodes a white body; this DS is dark-only,
// so every card renders on the Lab ink ground it was designed for.
const ink = { background: "#05070d", padding: 28, borderRadius: 12, maxWidth: 720 };

/**
 * FAQList has no `open`/`defaultOpen` prop, so the expanded answer state can only
 * be shown by setting the native `<details>` attribute after mount.
 */
const openFirst = (el: HTMLDivElement | null) => {
  if (!el) return;
  const first = el.querySelector("details");
  if (first) first.open = true;
};

export const Platform = () => (
  <div style={ink}>
    <FAQList
      accent="wdbx"
      items={[
        {
          q: "How does the Abbey–Aviva–Abi framework differ from a single agent?",
          a: "Instead of giving one agent every responsibility, the framework separates empathetic planning, token-frugal execution, and routing. That makes permissions easier to reason about and gives operators clearer intervention points.",
        },
        {
          q: "Where does my data live?",
          a: "WDBX runs as a single local process where the data already is. There is no upload step and no managed cluster — sensitive context never leaves hardware you control unless you explicitly send it.",
        },
        {
          q: "How is retrieval kept traceable?",
          a: "Each interaction block is hash-chained in the write-ahead log, which is a structure separate from the vector index — provenance and retrieval stay independent concerns.",
        },
        {
          q: "Are the figures on this site measured or targets?",
          a: "Every published figure carries a provenance class: measured, target, or reported. Engineering goals are labeled as targets and are never presented as achievements.",
        },
      ]}
    />
  </div>
);

export const AgentLayerExpanded = () => (
  <div style={ink} ref={openFirst}>
    <FAQList
      accent="abbey"
      items={[
        {
          q: "Which persona answers a given request?",
          a: "Abi routes. Abbey takes open-ended, empathetic work; Aviva takes direct, token-frugal work; a request that calls for both registers is answered as a blend.",
        },
        {
          q: "Can Abbey run without a network?",
          a: "Yes. The CLI talks to a local WDBX process and on-device inference by default; remote model providers are opt-in per profile.",
        },
        {
          q: "How are skills and plugins discovered?",
          a: "Abbey inventories skills and plugins at startup and hands that inventory to the router, so a persona can only call what the active profile has loaded.",
        },
      ]}
    />
  </div>
);
