"use client";

import dynamic from "next/dynamic";

const loader = () => (
  <div className="flex h-[60vh] items-center justify-center font-mono text-xs tracking-[0.3em] text-text-dim">
    LOADING
  </div>
);

export const ShowcaseTrailer = dynamic(
  () => import("@/views/ShowcaseTrailer").then((m) => m.ShowcaseTrailer),
  { ssr: false, loading: loader },
);
