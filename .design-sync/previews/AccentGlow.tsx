import type { ReactNode } from "react";
import { AccentGlow, Eyebrow } from "mlai-corporation-www";

/** The Lab ink ground the design system is built for. */
const Ground = ({ children }: { children: ReactNode }) => (
  <div style={{ background: "#05070d", padding: 28, borderRadius: 12 }}>{children}</div>
);

const Panel = ({
  accent,
  kicker,
  title,
  body,
}: {
  accent: "wdbx" | "abi" | "abbey";
  kicker: string;
  title: string;
  body: string;
}) => (
  <Ground>
    <div
      style={{
        position: "relative",
        height: 220,
        overflow: "hidden",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,.10)",
        background: "#0b111c",
      }}
    >
      <AccentGlow accent={accent} />
      <div style={{ position: "relative", padding: 28 }}>
        <Eyebrow accent={accent}>{kicker}</Eyebrow>
        <div
          style={{
            marginTop: 10,
            color: "#fff",
            fontSize: 24,
            lineHeight: 1.2,
            fontFamily: "Spectral, Georgia, serif",
          }}
        >
          {title}
        </div>
        <p style={{ margin: "10px 0 0", maxWidth: "44ch", color: "#93a1b8", fontSize: 13, lineHeight: 1.6 }}>
          {body}
        </p>
      </div>
    </div>
  </Ground>
);

export const Wdbx = () => (
  <Panel
    accent="wdbx"
    kicker="Vector store"
    title="Durable vector memory"
    body="Embeddings and blocks land in one append-only store, so a record you wrote last month is still addressable today."
  />
);

export const Abi = () => (
  <Panel
    accent="abi"
    kicker="Runtime"
    title="One CLI across the stack"
    body="The same command surface drives ingest, query, and audit — no separate tool per layer."
  />
);

export const Abbey = () => (
  <Panel
    accent="abbey"
    kicker="Agent layer"
    title="An assistant that remembers"
    body="Personas read from the same durable store the rest of the platform writes to."
  />
);
