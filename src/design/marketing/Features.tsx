/* Features — product cards, a stat band, and the footer. */
import { IDb, ILayers, ISpark, type IconComponent } from "./Icons.tsx";

interface Feature {
  icon: IconComponent;
  name: string;
  tint: string;
  tag: string;
  desc: string;
}

const FEATURES: readonly Feature[] = [
  {
    icon: IDb,
    name: "WDBX",
    tint: "var(--spectrum-cyan)",
    tag: "Runtime",
    desc: "A vector-database runtime in Zig — HNSW search, SHA-256-chained history and lock-free MVCC. Memory you can verify.",
  },
  {
    icon: ILayers,
    name: "ABI Framework",
    tint: "var(--spectrum-blue)",
    tag: "Orchestration",
    desc: "A six-layer runtime that routes, traces and governs. Every retrieval path and policy check is an inspectable event.",
  },
  {
    icon: ISpark,
    name: "The Personas",
    tint: "var(--persona-abbey)",
    tag: "Interface",
    desc: "Abbey, Aviva and Abi — three minds in one system. Abi routes by intent; Abbey scaffolds; Aviva goes dense.",
  },
];

const STATS: ReadonlyArray<readonly [value: string, label: string, color: string]> = [
  ["295×", "GPU speedup", "var(--spectrum-cyan)"],
  ["0.8ms", "search latency", "var(--spectrum-blue)"],
  ["16.5k", "throughput", "var(--persona-aviva)"],
  ["6", "governance principles", "var(--proof)"],
];

function FeatureCard({ icon: Icon, name, tint, tag, desc }: Feature) {
  return (
    <div
      className="mk-card"
      style={{
        background: "var(--glass-fill)",
        border: "1px solid var(--hair)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-card)",
        boxShadow: "var(--shadow-2), var(--glass-sheen)",
        backdropFilter: "blur(12px)",
        transition:
          "border-color var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            background: `linear-gradient(135deg, ${tint}, var(--action))`,
          }}
        >
          <Icon s={22} />
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: "var(--text-faint)",
          }}
        >
          {tag}
        </span>
      </div>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "var(--text-h3)",
          color: "var(--text)",
          margin: "0 0 8px",
          letterSpacing: "-0.01em",
        }}
      >
        {name}
      </h3>
      <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--text-dim)", margin: 0 }}>
        {desc}
      </p>
    </div>
  );
}

export default function Features() {
  return (
    <section
      style={{
        position: "relative",
        maxWidth: 1180,
        margin: "0 auto",
        padding: "var(--space-section) 24px",
      }}
    >
      <div style={{ maxWidth: 640, marginBottom: "var(--space-block)" }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>
          The stack
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(30px,4vw,46px)",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            color: "var(--text)",
            margin: 0,
          }}
        >
          Three layers, one private substrate
        </h2>
        <p
          style={{
            marginTop: 16,
            fontSize: 16,
            lineHeight: 1.6,
            color: "var(--text-dim)",
          }}
        >
          Each layer earns its place — the runtime that remembers, the framework that
          orchestrates, and the minds you talk to.
        </p>
      </div>
      <div
        className="mk-feature-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}
      >
        {FEATURES.map((f) => (
          <FeatureCard key={f.name} {...f} />
        ))}
      </div>

      {/* stat band */}
      <div
        style={{
          marginTop: "var(--space-block)",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          padding: 28,
          borderRadius: "var(--radius-xl)",
          background: "var(--surface-1)",
          border: "1px solid var(--hair)",
          boxShadow: "var(--shadow-1)",
        }}
        className="mk-stat-band"
      >
        {STATS.map(([v, l, c]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 34,
                lineHeight: 1,
                backgroundImage: `linear-gradient(135deg,#fff,${c})`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {v}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text-faint)",
                marginTop: 8,
              }}
            >
              {l}
            </div>
          </div>
        ))}
        <div
          style={{
            gridColumn: "1 / -1",
            textAlign: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-faint)",
            marginTop: 4,
          }}
        >
          Figures illustrative — published only against reproducible benchmarks
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--hair)",
        padding: "40px 24px",
        maxWidth: 1180,
        margin: "0 auto",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}
      >
        <img src="/mlai-mark.svg" width="26" height="26" alt="MLAI" />
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: "var(--text)",
            fontSize: 13,
          }}
        >
          MLAI
        </span>
      </div>
      <p
        style={{
          fontSize: 12,
          color: "var(--text-faint)",
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        Machine Learning Advanced Innovations, Inc. · Disciplined Secrecy · Mission
        Stewardship · Operational Velocity
      </p>
    </footer>
  );
}
