/* MLAI — Docs UI Kit. Self-contained: DocsShell wrapping DocsContent. */
import { useState, useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { PAGES } from "./DocsContent";
import { SearchPalette, TopNav, SideTree, OnThisPage, FLAT } from "./DocsShell";

/* Kit-specific CSS not already in src/index.css: scrollbar styling, the
   responsive hide rules for the tree / on-this-page rails, the docs
   external-link hover, and the `.eyebrow` label. Inlined once here. */
const KIT_CSS = `
.dk-eyebrow {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--spectrum-cyan);
}
.dk-root ::selection { background: rgba(59,130,246,0.3); }
.dk-root ::-webkit-scrollbar { width: 9px; height: 9px; }
.dk-root ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.14); border-radius: 6px; }
.dk-extlink:hover { color: var(--text) !important; }
@media (max-width: 1000px) { .dk-toc { display: none !important; } }
@media (max-width: 760px) { .dk-tree { display: none !important; } }
@media (prefers-reduced-motion: reduce) { .dk-root * { animation: none !important; } }
`;

const navBtn: CSSProperties = {
  background: "var(--surface-2)",
  border: "1px solid var(--hair)",
  borderRadius: "var(--radius-md)",
  padding: "12px 16px",
  color: "var(--text-dim)",
  cursor: "pointer",
  fontFamily: "var(--font-sans)",
  fontSize: 13.5,
  fontWeight: 500,
};

export default function Docs(): ReactNode {
  const [route, setRoute] = useState("quickstart");
  const [search, setSearch] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const page = PAGES[route];

  useEffect(() => {
    const h = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((o) => !o);
      }
    };
    addEventListener("keydown", h);
    return () => removeEventListener("keydown", h);
  }, []);

  // reset scroll + active heading on route change
  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
    const first = page?.toc[0];
    setActive(first ? first[0] : null);
  }, [route, page]);

  // scroll-spy
  useEffect(() => {
    const root = mainRef.current;
    if (!root || !page) return;
    const onScroll = (): void => {
      const first = page.toc[0];
      let cur: string | null = first ? first[0] : null;
      for (const [id] of page.toc) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 140) cur = id;
      }
      setActive(cur);
    };
    root.addEventListener("scroll", onScroll);
    onScroll();
    return () => root.removeEventListener("scroll", onScroll);
  }, [route, page]);

  const jump = (id: string): void => {
    const el = document.getElementById(id);
    const root = mainRef.current;
    if (el && root) root.scrollTo({ top: el.offsetTop - 24, behavior: "smooth" });
  };

  if (!page) return null;

  return (
    <div className="dk-root" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <style>{KIT_CSS}</style>
      <TopNav onSearch={() => setSearch(true)} />
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <SideTree route={route} setRoute={setRoute} />
        <main ref={mainRef} style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
          <article style={{ maxWidth: 740, margin: "0 auto", padding: "40px 40px 120px" }}>
            <div className="dk-eyebrow" style={{ marginBottom: 12 }}>
              {page.eyebrow}
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "var(--text-h1)",
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
                color: "var(--text)",
                margin: "0 0 24px",
              }}
            >
              {page.title}
            </h1>
            {page.body()}
            {/* prev / next */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 48,
                paddingTop: 24,
                borderTop: "1px solid var(--hair)",
              }}
            >
              {(() => {
                const i = FLAT.findIndex((f) => f[0] === route);
                const prev = i > 0 ? FLAT[i - 1] : undefined;
                const next = i >= 0 && i < FLAT.length - 1 ? FLAT[i + 1] : undefined;
                return [
                  prev ? (
                    <button key="p" onClick={() => setRoute(prev[0])} style={navBtn}>
                      ← {prev[1]}
                    </button>
                  ) : (
                    <span key="p" />
                  ),
                  next ? (
                    <button
                      key="n"
                      onClick={() => setRoute(next[0])}
                      style={{ ...navBtn, textAlign: "right" }}
                    >
                      {next[1]} →
                    </button>
                  ) : (
                    <span key="n" />
                  ),
                ];
              })()}
            </div>
          </article>
        </main>
        <OnThisPage toc={page.toc} active={active} onJump={jump} />
      </div>
      <SearchPalette open={search} onClose={() => setSearch(false)} setRoute={setRoute} />
    </div>
  );
}
