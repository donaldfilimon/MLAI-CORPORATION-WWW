import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { Providers } from "./providers";
import { DEFAULT_ROUTE_META, SITE_URL } from "@/lib/route-meta";

import "katex/dist/katex.min.css";
import "@fontsource-variable/geist";
import "@/index.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: DEFAULT_ROUTE_META.title,
  description: DEFAULT_ROUTE_META.description,
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  // These openGraph/twitter/alternates blocks look redundant now that
  // toNextMetadata emits the same defaults per route — they are not. Next
  // replaces `openGraph`/`twitter`/`alternates` wholesale for any page that
  // declares them, so the layout's copies reach exactly the pages that DON'T:
  // app/not-found.tsx, the only metadata export under app/ that doesn't go
  // through toNextMetadata (it exports title/description/robots only). Deleting
  // these would strip the 404 page's social card and feed autodiscovery.
  alternates: {
    types: {
      "application/rss+xml": [
        { url: "/feed.xml", title: "Quesar by MLAI — Research & Lab Notes" },
      ],
    },
  },
  openGraph: {
    type: "website",
    siteName: "Quesar by MLAI",
    title: "Quesar by MLAI | Private AI Operations",
    description:
      "Only invited WorkOS members can generate. Traffic crosses a metadata-only Cloudflare AI Gateway—no payload logging, no user email to the provider—and becomes a KMS-wrapped audit you can consent to, export, or delete.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Quesar by MLAI — private generation with an audit trail you control" }],
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Quesar by MLAI | Private AI Operations",
    description:
      "Only invited WorkOS members can generate. Traffic crosses a metadata-only Cloudflare AI Gateway—no payload logging, no user email to the provider—and becomes a KMS-wrapped audit you can consent to, export, or delete.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#05070d",
};

const ORG_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MLAI Corporation",
  legalName: "Machine Learning Advanced Innovations, Inc.",
  url: "https://quesar.cloud",
  logo: "https://quesar.cloud/icon-512.png",
  image: "https://quesar.cloud/og-image.png",
  brand: { "@type": "Brand", name: "Quesar" },
  description:
    "Leading AI and ML research lab providing high-integrity frameworks for neural AI orchestration.",
  founder: { "@type": "Person", name: "Donald Filimon", url: "https://quesar.cloud/team/donald-filimon" },
  sameAs: ["https://github.com/donaldfilimon"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Palo Alto",
    addressRegion: "CA",
    addressCountry: "US",
  },
});

const WEBSITE_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Quesar by MLAI",
  url: "https://quesar.cloud",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth dark" suppressHydrationWarning>
      <head>
        {/* Display (Spectral serif — the Lab signature) + mono (JetBrains Mono)
            load from Google Fonts; body font (Geist) is self-hosted via
            @fontsource (imported above). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Spectral:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Spectral:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          />
        </noscript>
        <link rel="mask-icon" href="/favicon.svg" color="#22d3ee" />
        {/* Safe only because both payloads are module constants built from
            in-repo data — JSON.stringify does NOT escape "</script>", so never
            widen these to user input. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ORG_JSON_LD }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: WEBSITE_JSON_LD }}
        />
      </head>
      <body className="bg-bg text-text antialiased selection:bg-cyan-400/30">
        <Providers>{children}</Providers>
        {/* Signature neural canvases (vanilla) — auto-mount on [data-neural] hosts;
            Hero also calls MLAINeural.mount() after client navigation. */}
        <Script src="/neural.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
