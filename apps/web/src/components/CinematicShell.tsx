import type { ReactNode } from "react";
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
export function CinematicShell({
  children,
  background = "#040406",
}: {
  children: ReactNode;
  background?: string;
}) {
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
