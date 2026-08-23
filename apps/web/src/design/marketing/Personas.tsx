/* Personas showcase — an original, interactive section. Pick a mind;
   the panel re-themes to their color and shows a real voice sample. */
import { useState } from "react";
import { IFlow, ISpark, IZap, type IconComponent } from "./Icons.tsx";

interface Mind {
  key: string;
  role: string;
  tint: string;
  hex: string;
  Icon: IconComponent;
  line: string;
  traits: readonly string[];
  quote: string;
}

const MINDS: readonly Mind[] = [
  {
    key: "Abbey",
    role: "Empathic Polymath",
    tint: "var(--persona-abbey)",
    hex: "#34d399",
    Icon: ISpark,
    line: "proof · verified",
    traits: ["Warm", "Metaphor-first", "Scaffolds hard ideas"],
    quote:
      "Think of a vector database as a library that files books by meaning, not title. Here’s exactly how WDBX does it…",
  },
  {
    key: "Aviva",
    role: "Unfiltered Expert",
    tint: "var(--persona-aviva)",
    hex: "#a855f7",
    Icon: IZap,
    line: "research · vision",
    traits: ["Direct", "Maximum density", "Zero hedging"],
    quote: "Use HNSW. M=16, ef=200. Cosine for text, L2 for clustering. Done.",
  },
  {
    key: "Abi",
    role: "Adaptive Moderator",
    tint: "var(--persona-abi)",
    hex: "#22d3ee",
    Icon: IFlow,
    line: "interactive · fast",
    traits: ["Neutral default", "Classifies intent", "Routes & blends"],
    quote:
      "Routing this to Abbey — it reads as a learning question with some frustration.",
  },
];

export default function Personas() {
  const [sel, setSel] = useState(0);
  const m = MINDS[sel] ?? MINDS[0];
  if (!m) return null;

  return (
    <section
      style={{
        position: "relative",
        maxWidth: 1180,
        margin: "0 auto",
        padding: "0 24px var(--space-section)",
      }}
    >
      <div style={{ maxWidth: 640, marginBottom: "var(--space-block)" }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>
          The personas
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
          Three minds, one system
        </h2>
        <p
          style={{
            marginTop: 16,
            fontSize: 16,
            lineHeight: 1.6,
            color: "var(--text-dim)",
          }}
        >
          One model can&apos;t be everything at once. Abi classifies intent and routes —
          to Abbey when you need scaffolding, to Aviva when you need density.
        </p>
      </div>
      <div
        className="mk-personas-grid"
        style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}
      >
        {/* selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MINDS.map((p, i) => {
            const on = i === sel;
            const Icon = p.Icon;
            return (
              <button
                key={p.key}
                onClick={() => setSel(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  textAlign: "left",
                  padding: "16px 18px",
                  borderRadius: "var(--radius-lg)",
                  cursor: "pointer",
                  background: on
                    ? `color-mix(in srgb, ${p.hex} 12%, var(--surface-2))`
                    : "var(--surface-2)",
                  border: `1px solid ${on ? p.hex + "66" : "var(--hair)"}`,
                  boxShadow: on
                    ? `0 0 0 1px ${p.hex}33, var(--shadow-2)`
                    : "var(--shadow-2)",
                  transition: "all var(--dur-base) var(--ease-out)",
                }}
              >
                <span
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "var(--radius-md)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#06121a",
                    background: p.tint,
                    boxShadow: on ? `0 0 18px -2px ${p.hex}` : "none",
                    transition: "box-shadow var(--dur-base)",
                  }}
                >
                  <Icon s={21} />
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: 16,
                      color: "var(--text)",
                    }}
                  >
                    {p.key}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-dim)" }}>{p.role}</div>
                </div>
                <span
                  style={{
                    marginLeft: "auto",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: on ? p.tint : "var(--text-faint)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {p.line}
                </span>
              </button>
            );
          })}
        </div>
        {/* detail panel */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "var(--radius-xl)",
            background: "var(--surface-2)",
            border: `1px solid ${m.hex}40`,
            boxShadow: "var(--shadow-3)",
            padding: 36,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: 280,
            transition: "border-color var(--dur-base) var(--ease-out)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -80,
              right: -60,
              width: 320,
              height: 320,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${m.hex}33, transparent 65%)`,
              filter: "blur(30px)",
              transition: "background var(--dur-base)",
            }}
          />
          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 22,
              }}
            >
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: m.tint,
                  boxShadow: `0 0 12px ${m.hex}`,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: m.tint,
                }}
              >
                {m.key} · {m.line}
              </span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "clamp(20px,2.4vw,28px)",
                lineHeight: 1.35,
                letterSpacing: "-0.01em",
                color: "var(--text)",
                margin: "0 0 24px",
                textWrap: "pretty",
              }}
            >
              &ldquo;{m.quote}&rdquo;
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {m.traits.map((t) => (
                <span
                  key={t}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "6px 13px",
                    borderRadius: "var(--radius-pill)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: m.tint,
                    background: `color-mix(in srgb, ${m.hex} 12%, transparent)`,
                    border: `1px solid ${m.hex}44`,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: m.tint,
                    }}
                  />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
