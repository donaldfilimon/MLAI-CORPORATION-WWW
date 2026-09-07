import type { NextConfig } from "next";

// GitHub Pages project site (user.github.io/<repo>) needs a basePath.
// Custom domain needs none. Set BASE_PATH in CI accordingly.
const basePath = process.env.BASE_PATH ?? "";

const config: NextConfig = {
  output: "export",       // fully static, no server at runtime
  distDir: "docs",        // GitHub Pages serves from /docs on main
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  reactStrictMode: true,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default config;
