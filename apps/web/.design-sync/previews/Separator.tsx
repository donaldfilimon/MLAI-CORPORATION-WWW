import { Separator } from "mlai-corporation-www";

/**
 * Lab ink canvas. Separator is `bg-border` (`oklch(1 0 0 / 10%)`) — a hairline
 * that only reads against a dark ground; on the harness's white body it is
 * invisible. Surrounding copy inherits its color, so the ground supplies it.
 */
const ink = {
  background: "#05070d",
  padding: 28,
  borderRadius: 12,
  color: "var(--foreground)",
  fontFamily: "var(--font-sans)",
  maxWidth: 360,
} as const;

const title = { fontSize: 14, fontWeight: 600, color: "var(--foreground)" } as const;
const sub = { fontSize: 13, color: "var(--muted-foreground)", marginTop: 2 } as const;

/** Horizontal (default): a full-width rule dividing stacked content. */
export const Horizontal = () => (
  <div style={ink}>
    <div style={title}>ABI runtime</div>
    <div style={sub}>Query planning and context-pack assembly</div>
    <Separator style={{ margin: "14px 0" }} />
    <div style={title}>WDBX store</div>
    <div style={sub}>Append-only JSONL segments with a hash-chained audit log</div>
    <Separator style={{ margin: "14px 0" }} />
    <div style={title}>Persona routing</div>
    <div style={sub}>Abbey · Aviva · Abi</div>
  </div>
);

/**
 * `orientation="vertical"` — `w-px` + `self-stretch`, so it takes its height
 * from the flex row it sits in. Used to separate inline surface labels.
 */
export const Vertical = () => (
  <div style={ink}>
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        gap: 18,
        height: 44,
        fontSize: 13,
        color: "var(--muted-foreground)",
      }}
    >
      <span style={{ display: "flex", alignItems: "center" }}>abi CLI</span>
      <Separator orientation="vertical" />
      <span style={{ display: "flex", alignItems: "center" }}>MCP tools</span>
      <Separator orientation="vertical" />
      <span style={{ display: "flex", alignItems: "center" }}>WDBX store</span>
    </div>
  </div>
);
