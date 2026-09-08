import type { NextConfig } from "next";

/**
 * Security headers. Applied to every route.
 *
 * NOTE(CSP): `unsafe-inline` on style-src is required by Next's inlined
 * critical CSS and next/font. Removing it needs a nonce-based CSP wired
 * through middleware — deliberately not done here, flagged rather than
 * silently left out of the policy.
 */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Do not advertise the framework in response headers.
  poweredByHeader: false,

  compress: true,

  // Fail the production build on type errors rather than shipping them.
  typescript: { ignoreBuildErrors: false },
  // NOTE(SDK): Next 16 removed the `eslint` config key — lint is no longer
  // wired into `next build`. Run `npm run lint` in CI as a separate gate.

  images: {
    formats: ["image/avif", "image/webp"],
    // Add remote hosts here before referencing off-origin images.
    remotePatterns: [],
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
