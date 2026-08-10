import { PullQuote } from "mlai-corporation-www";

/**
 * Dark-only DS: the quote is set in white Spectral, so it only reads on the ink
 * canvas. Width is held near the article measure it interrupts.
 */
const ink = { background: "#05070d", padding: 28, borderRadius: 12, maxWidth: 700 };

export const Privacy = () => (
  <div style={ink}>
    <PullQuote accent="wdbx">
      Privacy-first is an architecture decision, not a marketing position — data never leaves the
      device unless the owner sends it.
    </PullQuote>
  </div>
);

export const Runtime = () => (
  <div style={ink}>
    <PullQuote accent="abi" cite="ABI framework — design notes">
      One binary, one tool surface: whatever an operator can run, an agent can call.
    </PullQuote>
  </div>
);

export const Personas = () => (
  <div style={ink}>
    <PullQuote accent="abbey" cite="The Abbey persona brief">
      Care first. Clarity always. Competence throughout.
    </PullQuote>
  </div>
);
