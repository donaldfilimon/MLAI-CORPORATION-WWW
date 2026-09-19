import { ProvTag } from "mlai-corporation-www";

/** The Lab canvas these components are designed for. */
const ink = { background: "#05070d", padding: 28, borderRadius: 12 } as const;

export const AllThree = () => (
  <div style={ink}>
    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      <ProvTag tag="measured" />
      <ProvTag tag="target" />
      <ProvTag tag="reported" />
    </div>
  </div>
);

export const BesideAFigure = () => (
  <div style={ink}>
    <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
      <span
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: "#67e8f9",
          fontFamily: "var(--font-display)",
          lineHeight: 1,
        }}
      >
        12
      </span>
      <span style={{ fontSize: 13, color: "#cbd5e1" }}>crates in the abi workspace</span>
      <ProvTag tag="measured" />
    </div>
  </div>
);

export const InProse = () => (
  <div style={ink}>
    <p style={{ maxWidth: 460, margin: 0, fontSize: 14, lineHeight: 1.7, color: "#cbd5e1" }}>
      The pilot programme runs on a 90-day audit-to-production window{" "}
      <ProvTag tag="target" /> — a planning objective for the rollout, not a
      result we have already reproduced.
    </p>
  </div>
);
