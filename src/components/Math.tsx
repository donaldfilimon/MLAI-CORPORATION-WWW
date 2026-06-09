import katex from "katex";

/** Renders a display-mode (block) LaTeX equation via KaTeX.
 *  Errors render in-place (throwOnError: false) instead of crashing the page. */
export function BlockMath({ tex }: { tex: string }) {
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
