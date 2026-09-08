import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import { Enhance } from '../components/enhance';
import './globals.css';
const canIndex = process.env.SITE_INDEXABLE === 'true' && !!process.env.SITE_URL;
export const metadata: Metadata = {
  title: {default:'MLAI — Intelligence, with intention.',template:'%s'},
  description: 'Explore MLAI projects, source-backed guides, and clear capability boundaries.',
  robots: { index: canIndex, follow: canIndex },
  ...(process.env.SITE_URL ? {metadataBase:new URL(process.env.SITE_URL)} : {}),
};
export default function RootLayout({children}:{children:ReactNode}) {
  return <html lang="en" suppressHydrationWarning><body><Script src="/theme-init.js" strategy="beforeInteractive"/>{children}<Enhance/></body></html>;
}
