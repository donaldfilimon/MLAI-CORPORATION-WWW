import type { Metadata } from "next";
// The design system stylesheet carries the tokens, fonts and component styles.
import "@mlai/ui/styles.css";
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
