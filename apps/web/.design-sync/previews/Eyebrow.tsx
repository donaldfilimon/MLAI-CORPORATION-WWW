import type { ReactNode } from "react";
import { Eyebrow } from "mlai-corporation-www";

/** The Lab ink ground the design system is built for. */
const Ground = ({ children }: { children: ReactNode }) => (
  <div style={{ background: "#05070d", padding: 28, borderRadius: 12 }}>{children}</div>
);

export const Accents = () => (
  <Ground>
    <div style={{ display: "grid", gap: 14 }}>
      <Eyebrow accent="wdbx">Vector store</Eyebrow>
      <Eyebrow accent="abi">Runtime</Eyebrow>
      <Eyebrow accent="abbey">Agent layer</Eyebrow>
    </div>
  </Ground>
);

export const AboveATitle = () => (
  <Ground>
    <Eyebrow accent="wdbx">Vector store</Eyebrow>
    <h2
      style={{
        margin: "12px 0 0",
        fontFamily: "Spectral, Georgia, serif",
        fontSize: 32,
        lineHeight: 1.15,
        color: "#fff",
        maxWidth: "18ch",
      }}
    >
      Retrieval that runs where the data lives
    </h2>
    <p style={{ margin: "12px 0 0", maxWidth: "52ch", color: "#93a1b8", fontSize: 14, lineHeight: 1.6 }}>
      Records stay in the durable store; the query walks them in place instead of
      shipping the corpus somewhere else first.
    </p>
  </Ground>
);
