import { StepList } from "mlai-corporation-www";

const ink = { background: "#05070d", padding: 28, borderRadius: 12, maxWidth: 680 };

export const RequestLifecycle = () => (
  <div style={ink}>
    <StepList
      accent="wdbx"
      steps={[
        {
          title: "Embed the query",
          body: "The request is encoded into a vector on-device through the ABI runtime, so the embedding never leaves local hardware.",
        },
        {
          title: "Search the index",
          body: "The query vector descends the graph from its sparse upper layers into the full vector set, returning the nearest candidates.",
        },
        {
          title: "Assemble the context pack",
          body: "Candidates are scored across independent criteria, then packed greedily under a token budget and a diversity constraint.",
        },
        {
          title: "Route and generate",
          body: "Abi selects Abbey, Aviva, or a blend, and the chosen persona answers grounded only in the records that entered the pack.",
        },
      ]}
    />
  </div>
);

export const PersonaRouting = () => (
  <div style={ink}>
    <StepList
      accent="abbey"
      steps={[
        { title: "Observe", body: "The router reads the request and the retrieved context together." },
        { title: "Select", body: "A persona is chosen, or blended when the request needs both registers." },
        { title: "Trace", body: "The decision is written to the audit chain as an inspectable event." },
      ]}
    />
  </div>
);

export const RuntimeSetup = () => (
  <div style={ink}>
    <StepList
      accent="abi"
      steps={[
        {
          title: "Open a store",
          body: "The abi CLI creates or attaches a WDBX store on local disk; segments and the manifest live beside each other in one directory.",
        },
        {
          title: "Register the tools",
          body: "abi-mcp exposes the same runtime over MCP, so an editor or agent host calls the store through the tool surface rather than a network API.",
        },
        {
          title: "Attach a persona profile",
          body: "The profile declares which skills and plugins load, which bounds what any persona is able to call.",
        },
      ]}
    />
  </div>
);
