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
      <div className="my-1 overflow-x-auto rounded-lg border border-white/5 bg-white/[0.02] px-5 py-4 font-mono text-xs text-indigo-50/50">
        {tex}
      </div>
    );
  }

  const html = katex.renderToString(tex, {
    displayMode: true,
    throwOnError: false,
    output: "html",
  });
  return (
    <div
      className="my-1 overflow-x-auto rounded-lg border border-white/5 bg-white/[0.02] px-5 py-4 text-[0.95em] text-indigo-50/90"
      // eslint-disable-next-line react/no-danger -- KaTeX output is generated from trusted in-repo LaTeX strings
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
