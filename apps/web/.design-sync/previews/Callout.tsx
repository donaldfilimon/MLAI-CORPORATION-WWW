import { Callout } from "mlai-corporation-www";

/**
 * Dark-only DS: the accent edge and low-alpha fill only read on the ink canvas.
 * Width is held near the prose measure the aside is set beside.
 */
const ink = { background: "#05070d", padding: 28, borderRadius: 12, maxWidth: 700 };

export const Integrity = () => (
  <div style={ink}>
    <Callout accent="wdbx" label="Integrity note">
      Every figure on this site carries a provenance tag. Targets are labeled as targets —
      engineering goals are never rounded into achievements.
    </Callout>
  </div>
);

export const Runtime = () => (
  <div style={ink}>
    <Callout accent="abi" label="Runtime note">
      The abi CLI and its MCP server share one command surface, so anything an operator can run
      at the terminal an agent can call as a tool.
    </Callout>
  </div>
);

export const Privacy = () => (
  <div style={ink}>
    <Callout accent="abbey" label="Privacy-first">
      Data never leaves the device unless the owner sends it. That is an architecture decision in
      WDBX — local-first storage and on-device inference — not a marketing position.
    </Callout>
  </div>
);

export const Plain = () => (
  <div style={ink}>
    <Callout>
      Abi routes each request across Abbey, Aviva, and Abi, blending when a request needs both
      empathy and precision.
    </Callout>
  </div>
);
