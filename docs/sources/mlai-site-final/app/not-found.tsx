import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-start px-6 py-32">
      <div className="font-mono text-xs uppercase tracking-[0.25em] text-warn">
        recall@10 = 0.000
      </div>
      <h1 className="mt-4 font-display text-6xl font-bold tracking-tight text-white md:text-7xl">
        404
      </h1>
      <div className="mt-6 w-full max-w-xl border border-line bg-panel p-5 font-mono text-[12px] leading-[1.7]">
        <div className="text-slate-500">
          <span className="text-wdbx">$ </span>wdbx query --route {`"this page"`} --k 10
        </div>
        <div className="text-slate-500">… 0 hits · 0.4ms · index consulted, route not present</div>
        <div className="mt-2 text-slate-400">
          <span className="text-abbey">suggestion:</span> the nav above is fully indexed.
        </div>
      </div>
      <Link
        href="/"
        className="mt-10 border border-wdbx bg-wdbx px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-ink hover:opacity-85"
      >
        Back to /
      </Link>
    </section>
  );
}
