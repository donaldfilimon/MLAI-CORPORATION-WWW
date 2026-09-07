import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { Brand } from "@/components/brand";

const productLinks: [string, string][] = [
  ["WDBX", "/wdbx"],
  ["ABI Framework", "/abi"],
  ["Abbey", "/abbey"],
  ["Platform", "/platform"],
];

const companyLinks: [string, string][] = [
  ["About", "/company"],
  ["Research", "/research"],
  ["Investors", "/investors"],
  ["Services", "/services"],
  ["Contact", "/contact"],
];

const externalLinks: [string, string][] = [
  ["Docs", "/docs"],
  ["Architecture", "/architecture"],
  ["GitHub ↗", "https://github.com/donaldfilimon/abi"],
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNav />
      <main id="main">{children}</main>
      <footer className="public-footer">
        <div className="public-footer-accent" aria-hidden="true" />
        <div className="public-footer-inner">
          <div className="public-footer-brand">
            <Brand />
            <p>
              Privacy-first AI infrastructure for Apple Silicon. Runtime,
              memory, and an assistant workspace you can inspect.
            </p>
          </div>
          <div className="public-footer-columns">
            <nav aria-label="Products">
              <span className="public-footer-label">Products</span>
              {productLinks.map(([label, href]) => (
                <Link href={href} key={href}>
                  {label}
                </Link>
              ))}
            </nav>
            <nav aria-label="Company">
              <span className="public-footer-label">Company</span>
              {companyLinks.map(([label, href]) => (
                <Link href={href} key={href}>
                  {label}
                </Link>
              ))}
            </nav>
            <nav aria-label="Resources">
              <span className="public-footer-label">Resources</span>
              {externalLinks.map(([label, href]) => (
                <Link
                  href={href}
                  key={href}
                  {...(href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="public-footer-meta">
          <p>© 2026 Machine Learning Advanced Innovations, Inc.</p>
          <p>Care first. Clarity always. Competence throughout.</p>
        </div>
      </footer>
    </>
  );
}
