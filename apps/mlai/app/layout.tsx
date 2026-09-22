import type { ReactNode } from "react";

export const metadata = {
  title: "MLAI",
  description: "The Next.js application that will hold MLAI and Quesar.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
