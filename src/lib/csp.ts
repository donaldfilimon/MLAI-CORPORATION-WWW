/**
 * Content-Security-Policy builder.
 *
 * Extracted from next.config.ts so the policy is a pure, testable function:
 * the development-only 'unsafe-eval' escape hatch below must never reach a
 * production response, and csp.test.ts pins exactly that.
 *
 * Directive rationale (the allowlist tracks the real runtime surface):
 * - 'unsafe-inline' script/style: required by Next's inline hydration payloads,
 *   the JSON-LD blocks, and Framer Motion / KaTeX inline styles (no nonce
 *   middleware in this stack).
 * - 'wasm-unsafe-eval' + blob: workers + jsdelivr + huggingface: the Kokoro
 *   neural-voice runtime (src/film/neural-voice.ts) dynamic-imports
 *   kokoro.web.js from jsDelivr and pulls ONNX weights from Hugging Face.
 * - storage.googleapis.com: @tensorflow-models/posenet checkpoint downloads
 *   (/tf-pose-demo).
 * - avatars.githubusercontent.com: team avatars in src/data/categories/team.ts.
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
    // Next's React Refresh runtime evaluates strings as JavaScript, so Fast
    // Refresh is dead without 'unsafe-eval'. Development only — production
    // never carries it, and csp.test.ts fails the build if that ever changes.
    ...(dev ? ["'unsafe-eval'"] : []),
    "blob:",
    "https://cdn.jsdelivr.net",
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
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}
