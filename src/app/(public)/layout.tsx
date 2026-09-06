import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { Brand } from "@/components/brand";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNav />
      <main id="main">{children}</main>
      <footer className="public-footer">
        <Brand />
        <nav aria-label="Footer navigation">
          {[
            ["Products", "/platform"],
            ["Docs", "/docs"],
            ["Research", "/research"],
            ["Services", "/services"],
            ["Company", "/company"],
            ["Contact", "/contact"],
            ["Privacy", "/privacy"],
            ["Terms", "/terms"],
          ].map(([label, href]) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
        <p>Machine Learning Advanced Innovations</p>
      </footer>
    </>
  );
}
