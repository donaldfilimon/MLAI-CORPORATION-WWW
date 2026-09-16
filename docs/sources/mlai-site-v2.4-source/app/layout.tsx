import type { Metadata } from "next";
import { Sora, Manrope, JetBrains_Mono } from "next/font/google";
import { Nav, Footer } from "@/components/ui";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const jbm = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jbm", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://mlai.dev"),
  title: { default: "MLAI — Privacy-First AI Infrastructure for Apple Silicon", template: "%s · MLAI" },
  description:
    "WDBX vector database, ABI Framework, and Abbey AI assistant. Zig-built, Metal-accelerated, on-device. Built on Apple's public frameworks.",
  openGraph: {
    siteName: "MLAI",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "MLAI — AI infrastructure that never phones home" }],
  },
  twitter: { card: "summary_large_image", creator: "@donaldfilimonx", images: ["/og.png"] },
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Machine Learning Advanced Innovations, Inc.",
  alternateName: "MLAI",
  url: "https://mlai.dev",
  sameAs: ["https://github.com/donaldfilimon/abi", "https://donaldfilimon.com"],
  founder: { "@type": "Person", name: "Donald Filimon" },
  address: { "@type": "PostalAddress", addressLocality: "Orlando", addressRegion: "FL", addressCountry: "US" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${manrope.variable} ${jbm.variable}`}>
      <body className="bg-ink font-body">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:border focus:border-wdbx focus:bg-ink focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:text-wdbx"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
