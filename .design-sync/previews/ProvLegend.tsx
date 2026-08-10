import { ProvLegend } from "mlai-corporation-www";

/** The Lab canvas these components are designed for. */
const ink = { background: "#05070d", padding: 28, borderRadius: 12 } as const;

export const Chips = () => (
  <div style={ink}>
    <p
      style={{
        margin: "0 0 14px",
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#94a3b8",
        fontFamily: "var(--font-mono)",
      }}
    >
      How figures on this page are labeled
    </p>
    <ProvLegend />
  </div>
);

export const Inline = () => (
  <div style={ink}>
    <div
      style={{
        border: "1px solid rgba(255,255,255,.08)",
        background: "rgba(255,255,255,.02)",
        borderRadius: 16,
        padding: "14px 20px",
      }}
    >
      <ProvLegend variant="inline" />
    </div>
  </div>
);
