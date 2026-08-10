import type { NextConfig } from "next";
import path from "node:path";

/**
 * Next.js 15 App Router config (the Vite + Hono stack is retired).
 * - "react-router-dom" is aliased to the compat shim so the 25 SPA files
 *   keep their imports unchanged (tsconfig paths covers type-checking; this
 *   alias covers the bundler).
 * - node:sqlite / iron-session / WorkOS run inside route handlers; node:*
 *   builtins are externalized by Next automatically.
 */
/**
 * Content-Security-Policy — pragmatic baseline for the real runtime surface:
 * - 'unsafe-inline' script/style: required by Next's inline hydration payloads,
 *   the JSON-LD block, and Framer Motion / KaTeX inline styles (no nonce
 *   middleware in this stack).
 * - 'wasm-unsafe-eval' + blob: workers + jsdelivr + huggingface: the Kokoro
 *   neural-voice runtime (src/film/neural-voice.ts) dynamic-imports
 *   kokoro.web.js from jsDelivr and pulls ONNX weights from Hugging Face.
 * - storage.googleapis.com: @tensorflow-models/posenet checkpoint downloads
 *   (/tf-pose-demo).
 * - avatars.githubusercontent.com: team avatars in src/data/categories/team.ts.
 * Extend the allowlist when a surface gains a new external origin; never widen
 * to a bare https: wildcard.
 */
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  "'wasm-unsafe-eval'",
  "blob:",
  "https://cdn.jsdelivr.net",
];

// `next dev` evaluates strings (HMR, eval-based source maps), so development
// needs 'unsafe-eval' or every route logs a CSP violation — which is exactly
// the noise that drowned the first full `bun run crawl`. Production bundles
// never eval; the shipped policy stays strict.
if (process.env.NODE_ENV === "development") scriptSrc.push("'unsafe-eval'");

const CSP = [
  "default-src 'self'",
  `script-src ${scriptSrc.join(" ")}`,
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
  // Violation reporting. This allowlist is hand-curated against a moving
  // surface — a CDN version bump, a new model host, a new avatar origin — and
  // without reporting the first signal that it broke a feature is a user
  // complaint. `report-to` is the current directive; `report-uri` is kept
  // alongside it because Safari and older Firefox still only implement that one.
  "report-to csp-endpoint",
  "report-uri /api/csp-report",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  // Names the group that `report-to csp-endpoint` refers to. Same-origin, so
  // reports land in the app's own logs rather than a third party.
  {
    key: "Reporting-Endpoints",
    value: 'csp-endpoint="/api/csp-report"',
  },
  // 2 years, ready for preload-list submission.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Camera stays self-allowed for the /tf-pose-demo webcam surface.
  {
    key: "Permissions-Policy",
    value:
      "camera=(self), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  async headers() {
    return [{ source: "/(.*)", headers: SECURITY_HEADERS }];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-router-dom": path.resolve(__dirname, "src/lib/router-compat.tsx"),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      "react-router-dom": "./src/lib/router-compat.tsx",
    },
  },
};

export default nextConfig;
