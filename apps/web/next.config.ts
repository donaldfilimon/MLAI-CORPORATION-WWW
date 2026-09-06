import type { NextConfig } from "next";
import path from "node:path";
import { buildCsp } from "./src/lib/csp";

/**
 * Next.js 15 App Router config (the Vite + Hono stack is retired).
 * - "react-router-dom" is aliased to the compat shim so the 25 SPA files
 *   keep their imports unchanged (tsconfig paths covers type-checking; this
 *   alias covers the bundler).
 * - node:sqlite / iron-session / WorkOS run inside route handlers; node:*
 *   builtins are externalized by Next automatically.
 */
// The policy itself lives in src/lib/csp.ts as a pure function so that
// src/__tests__/csp.test.ts can pin its invariants — above all that the
// development-only 'unsafe-eval' escape hatch never reaches a production
// response. The directive rationale and the allowlist are documented there.
const CSP = buildCsp({ dev: process.env.NODE_ENV === "development" });

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
