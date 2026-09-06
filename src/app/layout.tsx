import type { Metadata } from "next";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/sora/500.css";
import "@fontsource/sora/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "MLAI · Intelligence you can inspect",
    template: "%s · MLAI",
  },
  description:
    "Runtime, memory, and an assistant workspace with explicit model choices and traceable sources.",
  robots: { index: true, follow: true },
  icons: { icon: "/brand/mlai-mark.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
