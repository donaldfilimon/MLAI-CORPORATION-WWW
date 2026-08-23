import { DeepDive } from "mlai-corporation-www";

/** Dark-only DS: mounted on the ink canvas the cards were designed for. */
const ink = { background: "#05070d", padding: 28, borderRadius: 12 };

export const StorageInternals = () => (
  <div style={ink}>
    <DeepDive
      accent="wdbx"
      cols={2}
      items={[
        {
          title: "Navigable graph index",
          body: "A hierarchical small-world graph answers nearest-neighbor queries by descending from sparse upper layers into the full vector set.",
          meta: "cosine distance · layered traversal",
        },
        {
          title: "Hash-chained audit log",
          body: "Each block is chained at the write-ahead-log level, not inside the index — a tamper-evident timeline that never touches the search path.",
          meta: "WAL-level chain · index untouched",
        },
        {
          title: "MVCC transactions",
          body: "Reads run against a stable snapshot while writes commit in the background, so searches never block on ingestion.",
          meta: "snapshot reads · non-blocking ingest",
        },
        {
          title: "Local-first runtime",
          body: "The store is a single process that runs where the data lives — no managed cluster, no upload step.",
          meta: "single process · zero network hop",
        },
      ]}
    />
  </div>
);

export const RetrievalPipeline = () => (
  <div style={ink}>
    <DeepDive
      accent="abi"
      cols={3}
      items={[
        { title: "Embed", body: "The request is encoded on-device through the ABI runtime.", meta: "local" },
        { title: "Search", body: "The query descends the graph into the full vector set.", meta: "top-k" },
        { title: "Assemble", body: "Candidates are packed under a hard token budget.", meta: "bounded" },
        { title: "Route", body: "Abi selects the persona best matched to the request.", meta: "Abbey · Aviva · Abi" },
        { title: "Generate", body: "The persona answers, grounded in the assembled pack.", meta: "grounded" },
        { title: "Trace", body: "The retrieval path is written as inspectable events.", meta: "auditable" },
      ]}
    />
  </div>
);
