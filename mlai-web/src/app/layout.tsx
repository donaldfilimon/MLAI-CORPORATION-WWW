import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Palette } from "@/components/Palette";
import { org } from "@/lib/brand";
// Self-hosted, so the page makes no third-party font request. Imported before
// globals.css so the @font-face rules land ahead of the theme that uses them.
import "@fontsource-variable/sora";
import "@fontsource-variable/manrope";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

const bp = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(org.url),
  title: { default: `${org.name} — ${org.tagline}`, template: `%s — ${org.name}` },
  description: org.thesis,
  icons: { icon: `${bp}/icon.svg` },
  openGraph: {
    type: "website", siteName: org.name, url: org.url,
    title: `${org.name} — ${org.tagline}`, description: org.thesis,
  },
  twitter: { card: "summary_large_image", title: org.name, description: org.thesis },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: org.name,
  url: org.url,
  description: `${org.tagline} ${org.thesis}`,
  founder: { "@type": "Person", name: org.builder },
  sameAs: [org.repo],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <a href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-signal focus:px-4 focus:py-2 focus:text-black">
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <Palette />
      </body>
    </html>
  );
}
