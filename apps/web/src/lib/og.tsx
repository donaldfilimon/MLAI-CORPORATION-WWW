/**
 * Shared branded Open Graph image renderer (Next.js `next/og` / Satori).
 * Used by each dynamic-slug segment's `opengraph-image.tsx` so individual
 * blog posts, research papers, team profiles, and product pages get a
 * link-preview card carrying their own title instead of the generic
 * site-wide `public/og-image.png` (which social crawlers — Facebook, X,
 * LinkedIn, Slack, iMessage — read for every *other* route via
 * `app/layout.tsx` metadata).
 *
 * Runs on the Node runtime (not edge) so it can be statically generated at
 * build time for every known slug (see each caller's `generateStaticParams`)
 * with zero cold-start cost in production.
 *
 * Font: the Spectral display face is fetched once (module-scoped memo) from
 * the same OFL-licensed source the brand uses elsewhere (matches
 * `scripts/generate-og.py`). If the fetch fails (offline build, registry
 * hiccup) we fall back to Satori's built-in sans — the image still renders
 * correctly, just without the serif signature; this must never fail the
 * build.
 */

import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const SPECTRAL_BOLD_URL =
  "https://github.com/google/fonts/raw/main/ofl/spectral/Spectral-Bold.ttf";

let spectralPromise: Promise<ArrayBuffer | null> | null = null;

async function loadSpectralBold(): Promise<ArrayBuffer | null> {
  spectralPromise ??= fetch(SPECTRAL_BOLD_URL)
    .then((res) => (res.ok ? res.arrayBuffer() : null))
    .catch(() => null);
  return spectralPromise;
}

export interface OgImageProps {
  /** Small uppercase label above the headline, e.g. the content tag. */
  kicker: string;
  /** Main headline — the post/paper/product/person title. */
  title: string;
  /** Optional line under the headline, e.g. "June 9, 2026 · 7 min read". */
  subtitle?: string;
}

export async function renderOgImage({ kicker, title, subtitle }: OgImageProps) {
  const spectral = await loadSpectralBold();
  const headlineFont = spectral ? "Spectral" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "88px 96px",
          background: "linear-gradient(135deg, #05070d 0%, #0b0d1a 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -220,
            right: -160,
            width: 760,
            height: 760,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34,211,238,0.30) 0%, rgba(34,211,238,0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg, #60a5fa 0%, #0ea5e9 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            M
          </div>
          <div style={{ display: "flex", fontSize: 22, fontWeight: 700, color: "#98a2b0" }}>
            MLAI&nbsp;<span style={{ color: "#fff" }}>CORPORATION</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 56,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#22d3ee",
          }}
        >
          {kicker}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontFamily: headlineFont,
            fontSize: title.length > 60 ? 52 : 64,
            fontWeight: 700,
            lineHeight: 1.15,
            color: "#ffffff",
            maxWidth: 980,
          }}
        >
          {title}
        </div>

        {subtitle ? (
          <div style={{ display: "flex", marginTop: 28, fontSize: 26, color: "#98a2b0" }}>
            {subtitle}
          </div>
        ) : null}
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: spectral ? [{ name: "Spectral", data: spectral, weight: 700, style: "normal" }] : [],
    },
  );
}
