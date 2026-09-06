/**
 * Content-Security-Policy builder.
 *
 * Extracted from next.config.ts so the policy is a pure, testable function.
 * The development-only 'unsafe-eval' escape hatch below must never reach a
 * production response, and src/__tests__/csp.test.ts pins exactly that —
 * previously nothing did.
 *
 * Directive rationale (the allowlist tracks the real runtime surface):
 * - 'unsafe-inline' script/style: required by Next's inline hydration payloads,
 *   the JSON-LD block, and Framer Motion / KaTeX inline styles (no nonce
 *   middleware in this stack).
 * - 'wasm-unsafe-eval' + blob: workers + jsdelivr + huggingface: the Kokoro
 *   neural-voice runtime (src/film/neural-voice.ts) dynamic-imports
 *   kokoro.web.js from jsDelivr and pulls ONNX weights from Hugging Face.
 * - storage.googleapis.com: @tensorflow-models/posenet checkpoint downloads
 *   (/tf-pose-demo).
 * - avatars.githubusercontent.com: team avatars in src/data/categories/team.ts.
 * - challenges.cloudflare.com (script-src and frame-src): the Turnstile widget.
 *
 * Extend the specific directive when a surface gains a new external origin;
 * never widen to a bare https: wildcard.
 */
export function buildCsp({ dev }: { dev: boolean }): string {
  const scriptSrc = [
    "script-src",
    "'self'",
    "'unsafe-inline'",
    "'wasm-unsafe-eval'",
    "blob:",
    "https://cdn.jsdelivr.net",
    "https://challenges.cloudflare.com",
    // `next dev` evaluates strings (HMR, eval-based source maps), so development
    // needs 'unsafe-eval' or every route logs a CSP violation — which is exactly
    // the noise that drowned the first full `bun run crawl`. Production bundles
    // never eval; the shipped policy stays strict, and csp.test.ts fails the
    // suite if that ever changes. Kept last so the dev and production strings
    // differ by one trailing token and nothing else.
    ...(dev ? ["'unsafe-eval'"] : []),
  ].join(" ");

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://avatars.githubusercontent.com",
    "connect-src 'self' data: blob: https://storage.googleapis.com https://cdn.jsdelivr.net https://huggingface.co https://*.huggingface.co https://*.hf.co https://fonts.gstatic.com https://fonts.googleapis.com",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "frame-src https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    // Violation reporting. This allowlist is hand-curated against a moving
    // surface — a CDN version bump, a new model host, a new avatar origin — and
    // without reporting the first signal that it broke a feature is a user
    // complaint. `report-to` is the current directive; `report-uri` is kept
    // alongside it because Safari and older Firefox still only implement that one.
    "report-to csp-endpoint",
    "report-uri /api/csp-report",
  ].join("; ");
}
