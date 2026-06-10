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
const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
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
