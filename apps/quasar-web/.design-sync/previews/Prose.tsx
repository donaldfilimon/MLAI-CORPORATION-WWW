import { Prose } from "mlai-corporation-www";

const ink = { background: "#05070d", padding: 28, borderRadius: 12, maxWidth: 720 };
// Near-card-width, so the `measured={false}` line length visibly differs.
const inkWide = { background: "#05070d", padding: 28, borderRadius: 12, maxWidth: 840 };

export const Architecture = () => (
  <div style={ink}>
    <Prose>
      <p>
        WDBX keeps the vector index, the write-ahead log, and the audit chain as separate
        concerns. The graph answers queries by traversal; the hash-chained log sits alongside
        it, so provenance and retrieval stay independent structures.
      </p>
      <p>
        Everything runs where the data lives. There is no upload step and no managed cluster to
        trust — the store is a single local process, and on-device inference means sensitive
        context never leaves hardware the owner controls.
      </p>
    </Prose>
  </div>
);

export const WithHeadings = () => (
  <div style={ink}>
    <Prose>
      <h2>Persona routing</h2>
      <p>
        Abbey routes each request across three personas rather than overloading one agent.{" "}
        <strong>Abi</strong> is the router, selecting by the register the request calls for.
      </p>
      <h3>The three registers</h3>
      <ul>
        <li>
          <strong>Abbey</strong> — empathetic, open-ended reasoning
        </li>
        <li>
          <strong>Aviva</strong> — direct and token-frugal
        </li>
        <li>
          <strong>Abi</strong> — routing and moderation
        </li>
      </ul>
      <p>
        The active profile is inspectable at any time with <code>abi agent status</code>, and
        the routing decision is written to the audit chain. See the{" "}
        <a href="/docs">runtime documentation</a> for the full tool surface.
      </p>
    </Prose>
  </div>
);

/** `measured={false}` drops the ~68ch cap, so the text fills its container. */
export const Unmeasured = () => (
  <div style={inkWide}>
    <Prose measured={false}>
      <p>
        Set <code>measured={"{false}"}</code> when the prose already sits inside a column that
        controls its own width — a table cell, a sidebar, or a split section whose left rail
        has fixed the measure. The typographic rules still apply; only the ~68ch cap is
        dropped, so the text runs to the edges of whatever container it is given.
      </p>
      <p>
        Left at its default, <strong>Prose</strong> composes the site&rsquo;s{" "}
        <code>.container-prose</code> utility rather than inventing a second measure, so
        long-form reading width stays consistent across every page that uses it.
      </p>
    </Prose>
  </div>
);
