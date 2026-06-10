import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
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
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/logo.svg",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "MLAI Corporation",
    title: "MLAI Corporation | Private AI Infrastructure",
    description:
      "Private, traceable AI infrastructure for teams moving agents, retrieval, and evaluation from demos to governed production systems.",
    images: ["https://mlai-corp.com/og-image.svg"],
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "MLAI Corporation | Private AI Infrastructure",
    description:
      "Private, traceable AI infrastructure: WDBX retrieval, Abbey · Aviva · Abi orchestration, and operator-ready controls.",
    images: ["https://mlai-corp.com/og-image.svg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0b12",
};

const ORG_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MLAI Corporation",
  url: "https://mlai-corp.com",
  logo: "https://mlai-corp.com/logo.svg",
  description:
    "Leading AI and ML research lab providing high-integrity frameworks for neural AI orchestration.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Palo Alto",
    addressRegion: "CA",
    addressCountry: "US",
  },
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth dark" suppressHydrationWarning>
      <head>
        {/* Display (Outfit) + mono (JetBrains Mono) load from Google Fonts;
            body font (Geist) is self-hosted via @fontsource (imported above). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          />
        </noscript>
        <link rel="mask-icon" href="/favicon.svg" color="#6366f1" />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: ORG_JSON_LD }}
        />
      </head>
      <body className="bg-[#0a0b12] text-[#fafafa] antialiased selection:bg-indigo-500/30">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
