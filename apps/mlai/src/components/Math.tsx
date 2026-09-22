"use client";

import { useEffect, useState } from "react";

/** Renders a display-mode (block) LaTeX equation via KaTeX.
 *
 *  KaTeX (~250 kB parsed) is loaded on demand the first time an equation
 *  mounts, instead of riding in every article page's first-load bundle.
 *  While it loads, the raw TeX shows in mono as a stable-height placeholder.
 *  Errors render in-place (throwOnError: false) instead of crashing the page.
 */

type Katex = typeof import("katex");
let katexModule: Katex | null = null;
let katexPromise: Promise<Katex> | null = null;

function loadKatex(): Promise<Katex> {
  if (!katexPromise) {
    katexPromise = import("katex").then((mod) => {
      katexModule = (mod as unknown as { default?: Katex }).default ?? (mod as unknown as Katex);
      return katexModule;
    });
  }
  return katexPromise;
}

export function BlockMath({ tex }: { tex: string }) {
  const [katex, setKatex] = useState<Katex | null>(katexModule);

  useEffect(() => {
    if (!katex) {
      let alive = true;
      loadKatex().then((k) => {
        if (alive) setKatex(() => k);
      });
      return () => {
        alive = false;
      };
    }
  }, [katex]);

  if (!katex) {
    return (
      // tabIndex: a wide equation scrolls inside this box, so keyboard users
      // need to be able to focus it to scroll (WCAG 2.1.1, axe scrollable-region-focusable).
      <div tabIndex={0} className="my-1 overflow-x-auto rounded-lg border border-white/5 bg-white/2 px-5 py-4 font-mono text-xs text-cyan-50/50">
        {tex}
      </div>
    );
  }

  // htmlAndMathml: the visible HTML is aria-hidden and screen readers get the
  // MathML copy, which katex.min.css (imported in app/layout.tsx) hides
  // visually. Plain "html" gave assistive tech nothing but glyph soup. The
  // research export already renders the same way.
  const html = katex.renderToString(tex, {
    displayMode: true,
    throwOnError: false,
    output: "htmlAndMathml",
  });
  return (
    <div
      tabIndex={0}
      className="my-1 overflow-x-auto rounded-lg border border-white/5 bg-white/2 px-5 py-4 text-[0.95em] text-cyan-50/90"
      // KaTeX output generated from trusted in-repo LaTeX strings, rendered
      // with output:"htmlAndMathml" and throwOnError:false — no user input reaches this.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
