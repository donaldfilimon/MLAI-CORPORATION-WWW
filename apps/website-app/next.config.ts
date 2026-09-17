import type { NextConfig } from "next";
import path from "node:path";

// This app is one workspace of the repository-root Bun install, so its
// dependencies are symlinks into <repo>/node_modules/.bun. Tracing and
// Turbopack must both treat the repository root as the project root.
const repoRoot = path.join(import.meta.dirname, "../..");

const config: NextConfig = {
  agentRules: false,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  outputFileTracingRoot: repoRoot,
  turbopack: { root: repoRoot },
  typescript: {
    tsconfigPath: process.env.MLAI_NEXT_TSCONFIG || "tsconfig.json",
  },
  serverExternalPackages: [
    "better-sqlite3",
    "@grpc/grpc-js",
    "@grpc/proto-loader",
  ],
  poweredByHeader: false,
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
export default config;
