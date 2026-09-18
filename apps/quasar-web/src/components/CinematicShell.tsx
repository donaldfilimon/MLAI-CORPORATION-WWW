import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "@/design/mlai-ds-tokens.css";

/**
 * Full-screen host for the ported cinematic surfaces (film/trailer/mega/
 * explainer) and the design lab. Covers the Layout chrome (navbar/footer)
 * with a fixed overlay; the back pill returns to the showcase hub.
 *
 * The .mlai-ds wrapper provides the ported design-system CSS variables to
 * the boards without leaking them into the site's :root.
 */
/**
 * While the shell covers the page, the site chrome behind it (skip link,
 * navbar, footer) is still in the DOM, so keyboard and screen-reader users
 * would tab through links they cannot see. Mark every sibling of <main> inert
 * for the shell's lifetime and restore exactly what was there before.
 * React never sets `inert` on those elements, so it does not fight this.
 */
function useInertPageChrome() {
  useEffect(() => {
    const main = document.getElementById("main-content");
    const parent = main?.parentElement;
    if (!main || !parent) return;
    const touched: Element[] = [];
    for (const el of Array.from(parent.children)) {
      if (el === main || el.hasAttribute("inert")) continue;
      el.setAttribute("inert", "");
      touched.push(el);
    }
    return () => {
      for (const el of touched) el.removeAttribute("inert");
    };
  }, []);
}

export function CinematicShell({
  children,
  background = "#040406",
}: {
  children: ReactNode;
  background?: string;
}) {
  useInertPageChrome();
  return (
    <div className="mlai-ds fixed inset-0 z-80" style={{ background }}>
      {children}
      <Link
        to="/showcase"
        className="fixed top-3.5 left-3.5 z-100 flex items-center gap-2 rounded-full border border-white/15 bg-[#14141c]/80 px-4 py-2 font-mono text-[13px] tracking-[0.12em] text-text-dim backdrop-blur-md transition-colors hover:text-white"
        title="Back to the showcase"
      >
        <ArrowLeft size={15} /> SHOWCASE
      </Link>
    </div>
  );
}
