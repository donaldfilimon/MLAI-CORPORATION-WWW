import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { WdbxLiveDemo } from "@/components/demos/WdbxLiveDemo";

export const Demo = () => {
  return (
    <section
      id="demo"
      className="min-h-screen section-y bg-bg relative font-sans"
      aria-labelledby="demo-heading"
    >
      <div className="container-custom pt-10">
        <PageHeader
          id="demo-heading"
          tag="LIVE DEMO"
          title="Run the miniature."
          subtitle="An illustrative in-browser query model — real cosine similarity over deterministic embeddings, local partition labels, an MVCC-style snapshot counter, and a block-chained query log. Everything runs in this tab: no network, no keys. It is not the active Rust engine, and the partition display is not a WDBX sharding claim."
        />

        <WdbxLiveDemo />

        <div className="mt-10 flex flex-wrap gap-6">
          <Link
            to="/research/wdbx-weighted-backtrace-memory-store"
            className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white hover:text-cyan-400 transition-colors"
          >
            Read the WDBX paper
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="https://github.com/donaldfilimon/abi"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-text-dim hover:text-cyan-400 transition-colors"
          >
            The source is the truth — open the repo
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
};
