import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { SiteNav } from '@/components/SiteNav';
import { SiteFooter } from '@/components/SiteFooter';
import { SITE_ORIGIN } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: 'MLAI — Infrastructure for Private AI',
    template: '%s · MLAI',
  },
  description:
    "WDBX vector database, ABI Framework, and Abbey AI assistant. Zig-built, Metal-accelerated, on-device. Built on Apple's public frameworks.",
  icons: { icon: '/assets/mlai-logo-icon.svg' },
  openGraph: {
    siteName: 'MLAI',
    type: 'website',
    title: 'MLAI — Infrastructure for Private AI',
    description: 'The infrastructure layer for private, high-performance AI. From the vector engine up — WDBX, the ABI framework, and three minds in one system.',
    images: [{ url: '/og/og-home.png', width: 1200, height: 630, alt: 'MLAI — the infrastructure layer for private, high-performance AI' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MLAI — Infrastructure for Private AI',
    description: 'Fast by design, private by default, verifiable by architecture.',
    images: ['/og/og-home.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-accent="violet" data-font="grotesk" data-texture="on">
      <body>
        <a href="#content" className="skip-link">Skip to content</a>
        <div className="grain"></div>
        <SiteNav />
        <div id="content">{children}</div>
        <SiteFooter />
        {/* signature canvases: galaxy + constellation mounts on [data-neural] hosts */}
        <Script src="/neural.js" strategy="afterInteractive" />
        <Script src="/canvases.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
