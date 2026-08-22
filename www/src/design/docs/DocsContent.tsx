/* MLAI docs — content primitives + sample pages. */
import { useState } from "react";
import type { ReactNode } from "react";
import { ICheck, ICopy, IInfo, IAlert, IShield } from "./Icons";
import type { IconProps } from "./Icons";

/* ── prose primitives ─────────────────────────────────────────── */
export function H2({ id, children }: { id: string; children: ReactNode }): ReactNode {
  return (
    <h2
      id={id}
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        fontSize: "var(--text-h3)",
        letterSpacing: "-0.01em",
        color: "var(--text)",
        margin: "38px 0 14px",
        scrollMarginTop: 80,
      }}
    >
      {children}
    </h2>
  );
}

export function P({ children }: { children: ReactNode }): ReactNode {
  return (
    <p
      style={{
        fontSize: 15.5,
        lineHeight: 1.7,
        color: "var(--text-dim)",
        margin: "0 0 16px",
        textWrap: "pretty",
      }}
    >
      {children}
    </p>
  );
}

export function IC({ children }: { children: ReactNode }): ReactNode {
  return (
    <code
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.85em",
        color: "var(--spectrum-cyan)",
        background: "var(--surface-1)",
        borderRadius: 6,
        padding: "0.12em 0.42em",
      }}
    >
      {children}
    </code>
  );
}

export function CodeBlock({ code, label }: { code: string; label?: string }): ReactNode {
  const [copied, setCopied] = useState(false);
  const copy = (): void => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1100);
  };
  return (
    <div
      style={{
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        background: "var(--surface-1)",
        border: "1px solid var(--hair)",
        margin: "0 0 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 14px",
          borderBottom: "1px solid var(--hair)",
        }}
      >
        {label ? (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-faint)",
              letterSpacing: "0.06em",
            }}
          >
            {label}
          </span>
        ) : (
          <span />
        )}
        <button
          onClick={copy}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 600,
            padding: "4px 9px",
            borderRadius: 6,
            border: 0,
            cursor: "pointer",
            color: copied ? "var(--proof)" : "var(--text-faint)",
            background: "transparent",
          }}
        >
          {copied ? <ICheck s={12} /> : <ICopy s={12} />}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "16px",
          overflowX: "auto",
          fontFamily: "var(--font-mono)",
          fontSize: 12.5,
          lineHeight: 1.65,
          color: "#cbd5e1",
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

export type CalloutKind = "info" | "warn" | "proof";

export function Callout({
  kind = "info",
  title,
  children,
}: {
  kind?: CalloutKind;
  title?: string;
  children: ReactNode;
}): ReactNode {
  const map: Record<CalloutKind, [string, (p: IconProps) => ReactNode]> = {
    info: ["var(--spectrum-cyan)", IInfo],
    warn: ["var(--signal)", IAlert],
    proof: ["var(--proof)", IShield],
  };
  const [c, Icon] = map[kind];
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: 16,
        borderRadius: "var(--radius-md)",
        margin: "0 0 20px",
        background: `color-mix(in srgb, ${c} 7%, transparent)`,
        border: `1px solid color-mix(in srgb, ${c} 28%, transparent)`,
      }}
    >
      <span style={{ color: c, flexShrink: 0, marginTop: 1 }}>
        <Icon s={18} />
      </span>
      <div>
        {title && (
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 3 }}>
            {title}
          </div>
        )}
        <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-dim)" }}>{children}</div>
      </div>
    </div>
  );
}

/** A parameter row: [parameter, default, description]. */
export type ParamRow = readonly [string, string, string];

export function ParamTable({ rows }: { rows: readonly ParamRow[] }): ReactNode {
  return (
    <div
      style={{
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        border: "1px solid var(--hair)",
        margin: "0 0 20px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "160px 110px 1fr",
          background: "var(--surface-1)",
          borderBottom: "1px solid var(--hair)",
          padding: "10px 16px",
          fontFamily: "var(--font-mono)",
          fontSize: 10.5,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "var(--text-faint)",
        }}
      >
        <span>Parameter</span>
        <span>Default</span>
        <span>Description</span>
      </div>
      {rows.map((r, i) => (
        <div
          key={r[0]}
          style={{
            display: "grid",
            gridTemplateColumns: "160px 110px 1fr",
            padding: "12px 16px",
            borderBottom: i < rows.length - 1 ? "1px solid var(--hair)" : 0,
            background: "var(--surface-2)",
            alignItems: "baseline",
          }}
        >
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--spectrum-cyan)" }}>
            {r[0]}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-faint)" }}>
            {r[1]}
          </span>
          <span style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.5 }}>{r[2]}</span>
        </div>
      ))}
    </div>
  );
}

/* ── pages ────────────────────────────────────────────────────── */
/** A table-of-contents entry: [anchor id, label]. */
export type TocEntry = readonly [string, string];

export interface DocPage {
  eyebrow: string;
  title: string;
  toc: readonly TocEntry[];
  body: () => ReactNode;
}

export const PAGES: Record<string, DocPage> = {
  quickstart: {
    eyebrow: "Getting started",
    title: "Quickstart",
    toc: [
      ["install", "Install"],
      ["first-index", "Your first index"],
      ["next", "Next steps"],
    ],
    body: () => (
      <>
        <P>
          MLAI runs <strong style={{ color: "var(--text)" }}>local-first</strong>: the WDBX runtime, the ABI
          framework and the personas all execute on your own infrastructure. Nothing leaves the device unless
          you opt in.
        </P>
        <Callout kind="proof" title="Private by default">
          Telemetry is off until you enable it in Settings. Every memory write is SHA-256-chained and verified
          on read.
        </Callout>
        <H2 id="install">Install</H2>
        <P>WDBX ships as a single static binary (written in Zig). Pull it and verify the checksum:</P>
        <CodeBlock
          label="shell"
          code={`curl -fsSL https://get.mlai.dev/wdbx | sh\nwdbx verify --self        # checks the signed release\nwdbx version              # → wdbx 2.4.0 · zig 0.13`}
        />
        <H2 id="first-index">Your first index</H2>
        <P>
          Create an HNSW index, upsert a few vectors, then query for nearest neighbors. The history is chained
          automatically.
        </P>
        <CodeBlock
          label="python"
          code={`from wdbx import Client\n\ndb = Client(local=True)              # on-device\nidx = db.create_index("docs", dim=768, metric="cosine")\n\nidx.upsert([(id, vector, meta) for ...])\nhits = idx.query(q, k=10, ef=200)    # HNSW search\n\nassert db.verify_chain()             # SHA-256 integrity`}
        />
        <H2 id="next">Next steps</H2>
        <P>
          Tune recall vs. latency on the <IC>WDBX · HNSW</IC> page, or wire the personas with the{" "}
          <IC>ABI Framework</IC>.
        </P>
      </>
    ),
  },
  wdbx: {
    eyebrow: "WDBX",
    title: "The vector runtime",
    toc: [
      ["model", "Storage model"],
      ["integrity", "Verifiable memory"],
      ["concurrency", "Concurrency"],
    ],
    body: () => (
      <>
        <P>
          WDBX is a purpose-built vector-database runtime — HNSW search, sharded storage, SHA-256-chained
          history and lock-free MVCC concurrency. Memory you can verify.
        </P>
        <H2 id="model">Storage model</H2>
        <P>
          Vectors are sharded across nodes; each shard owns an HNSW graph plus a write-ahead log. Reads are
          served from the graph; writes append to the log and link to the previous block.
        </P>
        <Callout kind="info" title="Sharding">
          Don't shard below ~10M vectors — coordination overhead outweighs parallelism. Re-evaluate at 50M.
        </Callout>
        <H2 id="integrity">Verifiable memory</H2>
        <P>
          Every write is hashed and chained to its predecessor. Tamper with one block and the chain rejects
          everything downstream on the next read.
        </P>
        <CodeBlock
          label="shell"
          code={`wdbx chain verify --index docs\n# 142,887 blocks · 0 mismatches · ok`}
        />
        <H2 id="concurrency">Concurrency</H2>
        <P>
          Readers never block writers. <IC>wdbx</IC> uses lock-free MVCC: each query sees a consistent snapshot
          while upserts proceed.
        </P>
      </>
    ),
  },
  hnsw: {
    eyebrow: "WDBX",
    title: "HNSW parameters",
    toc: [
      ["build", "Build parameters"],
      ["query", "Query parameters"],
      ["guidance", "Guidance"],
    ],
    body: () => (
      <>
        <P>
          Hierarchical Navigable Small World graphs trade memory and build time for recall and latency. These
          are the knobs that matter.
        </P>
        <H2 id="build">Build parameters</H2>
        <ParamTable
          rows={[
            ["M", "16", "Edges per node. Higher = better recall, more memory."],
            ["ef_construction", "200", "Candidate list size at build time. Higher = better graph, slower build."],
            ["metric", "cosine", "cosine for text embeddings; L2 for clustering."],
          ]}
        />
        <H2 id="query">Query parameters</H2>
        <ParamTable
          rows={[
            ["k", "10", "Number of neighbors to return."],
            ["ef", "200", "Search breadth. Higher = better recall, higher latency."],
          ]}
        />
        <H2 id="guidance">Guidance</H2>
        <Callout kind="warn" title="Aviva says">
          Use HNSW. M=16, ef=200. Cosine for text, L2 for clustering. Done.
        </Callout>
        <P>
          Numbers above are defaults, not benchmarks. Publish measured latency/recall only against a
          reproducible suite.
        </P>
      </>
    ),
  },
  personas: {
    eyebrow: "Personas",
    title: "Three minds, one system",
    toc: [
      ["abi", "Abi · moderator"],
      ["abbey", "Abbey · polymath"],
      ["aviva", "Aviva · expert"],
    ],
    body: () => (
      <>
        <P>
          The personas are three registers exposed by the ABI framework. <IC>Abi</IC> is the default — she
          classifies intent and routes to the others.
        </P>
        <H2 id="abi">Abi · Adaptive Moderator</H2>
        <Callout kind="info" title="Cyan · interactive">
          Neutral and balanced; the connective tissue. "Routing this to Abbey — it reads as a learning question
          with some frustration."
        </Callout>
        <H2 id="abbey">Abbey · Empathic Polymath</H2>
        <Callout kind="proof" title="Emerald · proof">
          Warm, scaffolds with metaphor before precision. "Think of a vector database as a library that files
          books by meaning, not title."
        </Callout>
        <H2 id="aviva">Aviva · Unfiltered Expert</H2>
        <Callout kind="warn" title="Violet · vision">
          Direct, dense, zero hedging. "Use HNSW. M=16, ef=200. Cosine for text, L2 for clustering. Done."
        </Callout>
      </>
    ),
  },
};
