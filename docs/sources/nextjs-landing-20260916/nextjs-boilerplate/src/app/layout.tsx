import type { Metadata, Viewport } from "next";
import { Sora, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mlai.example";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MLAI Corporation — privacy-first AI infrastructure for Apple Silicon",
    template: "%s · MLAI Corporation",
  },
  description:
    "MLAI builds WDBX, a vector database written in Zig, and the ABI Framework for multi-persona routing. Local-first, Apple Silicon-native, Apache-2.0.",
  applicationName: "MLAI Corporation",
  authors: [{ name: "MLAI Corporation" }],
  creator: "MLAI Corporation",
  keywords: [
    "vector database",
    "Apple Silicon",
    "Zig",
    "HNSW",
    "privacy-first AI",
    "local inference",
  ],
  openGraph: {
    type: "website",
    siteName: "MLAI Corporation",
    title: "MLAI Corporation — privacy-first AI infrastructure for Apple Silicon",
    description:
      "WDBX vector database and the ABI Framework. Local-first, Apple Silicon-native, Apache-2.0.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "MLAI Corporation",
    description:
      "WDBX vector database and the ABI Framework. Local-first, Apple Silicon-native, Apache-2.0.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${sora.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
