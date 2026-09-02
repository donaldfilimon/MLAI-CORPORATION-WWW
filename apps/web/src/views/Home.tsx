import { ArrowRight, CheckCircle2, LockKeyhole, Network, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { AccentGlow, Eyebrow, FeatureCard, Section, SpecList } from "@/components/site";
import { research } from "@/data/categories/research";
import { useUI } from "@/lib/ui-context";

const controls = [
  {
    title: "Identity before inference",
    desc: "Production is designed to check WorkOS organization membership at sign-in and before each protected generation. Revocation fails closed once provider configuration is live.",
    accent: "abi" as const,
  },
  {
    title: "A minimized provider boundary",
    desc: "Quesar's production boundary excludes user email from Gemini requests and is configured for operational metadata without request/response payload logging.",
    accent: "abbey" as const,
  },
  {
    title: "A record the user controls",
    desc: "The production contract returns a response only after a KMS-wrapped per-record audit is durable, with explicit consent, export, live deletion, and one-year expiry.",
    accent: "wdbx" as const,
  },
];

const requestPath = [
  ["01", "Authenticate", "WorkOS establishes the session and active MLAI beta membership."],
  ["02", "Consent", "The current audit policy must be accepted before content leaves the application."],
  ["03", "Generate", "Gemini 3.7 Flash runs through an authenticated, no-payload-log Cloudflare gateway."],
  ["04", "Encrypt", "The response and its prompt history are sealed with a fresh AES-256-GCM data key."],
  ["05", "Commit", "Cloud KMS wraps the data key and Postgres commits the audit before the response returns."],
] as const;

const wdbxFacts = [
  { k: "Active implementation", v: "Rust · abi-wdbx" },
  { k: "Index", v: "Layered HNSW" },
  { k: "Graph degree", v: "M = 16" },
  { k: "Construction breadth", v: "EF_CONSTRUCTION = 40" },
  { k: "Search breadth", v: "EF_SEARCH = 32" },
  { k: "Transactions", v: "MVCC" },
] as const;

const featuredResearch = research.publications.slice(0, 3);

export function Home() {
  const { openInquiry } = useUI();

  return (
    <div className="home-page flex flex-col items-center overflow-hidden">
      <Hero />

      <Reveal width="100%">
        <Section
          id="control-plane"
          className="relative w-full"
          eyebrow="TRUST BOUNDARY"
          title="The useful unit is not a chat. It is a governed event."
          lead="Quesar treats identity, consent, inference, encryption, and retention as one request contract—not five dashboard settings operators must remember to align."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {controls.map((control) => <FeatureCard key={control.title} {...control} />)}
          </div>
        </Section>
      </Reveal>

      <section className="relative w-full border-y border-white/6 bg-surface/20 section-y noise-overlay" id="request-path" aria-labelledby="request-path-heading">
        <Reveal width="100%">
          <div className="container-custom relative z-10 grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div className="lg:sticky lg:top-32">
              <Eyebrow className="mb-5">ONE REQUEST</Eyebrow>
              <h2 id="request-path-heading" className="section-title">Five control points. One return condition.</h2>
              <p className="mt-5 text-base leading-relaxed text-text-dim">If organization access, consent, provider routing, encryption, or durable storage fails, Quesar does not return an unaudited model response.</p>
              <Button asChild variant="outline" className="mt-7 rounded-full"><Link to="/security">Inspect the security model <ArrowRight className="h-4 w-4" /></Link></Button>
            </div>
            <ol className="grid gap-3">
              {requestPath.map(([number, title, body]) => <li key={number} className="grid gap-4 rounded-3xl border border-white/8 bg-bg/70 p-5 sm:grid-cols-[3rem_1fr]"><span className="font-mono text-sm font-semibold text-cyan-300">{number}</span><div><h3 className="font-display text-xl font-semibold text-white">{title}</h3><p className="mt-2 text-sm leading-relaxed text-text-dim">{body}</p></div></li>)}
            </ol>
          </div>
        </Reveal>
      </section>

      <Reveal width="100%">
        <Section
          id="wdbx-substrate"
          className="w-full"
          eyebrow="ACTIVE RUST SUBSTRATE"
          title="Retrieval facts, sourced from the implementation."
          lead="Quesar is backed by MLAI's WDBX work. The active Rust crate—not the frozen Zig-era documentation mirror—is authoritative for architecture. These are configuration facts, not benchmark claims."
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_0.82fr]">
            <div className="relative overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.13),transparent_55%),rgba(4,8,18,0.82)] p-7 md:p-9">
              <Network className="mb-7 h-8 w-8 text-cyan-300" />
              <h3 className="font-display text-2xl font-semibold text-white">Inspectable nearest-neighbor retrieval.</h3>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-dim">The substrate implements a real layered HNSW graph, validates graph structure, rebuilds against real vectors in tests, and pairs retrieval with MVCC. It does not claim production multi-host sharding.</p>
              <div className="mt-7 flex flex-wrap gap-3"><Button asChild><Link to="/benchmarks">Review evidence</Link></Button><Button asChild variant="outline"><Link to="/docs">Read architecture</Link></Button></div>
            </div>
            <SpecList rows={wdbxFacts} />
          </div>
        </Section>
      </Reveal>

      <Reveal width="100%">
        <Section
          id="product-boundary"
          className="w-full"
          eyebrow="PRODUCT BOUNDARY"
          title="An invite-only operations console. Not a public chatbot."
          lead="Quesar is for teams that need organization access, explicit consent, and encrypted conversation records on one request path. It is not a free-for-all chat UI and it does not invent compliance certifications."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/8 bg-bg/70 p-6">
              <h3 className="font-display text-xl font-semibold text-white">What it is</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-dim">A governed generation path with WorkOS membership, consent gates, a metadata-only provider gateway, and user-controlled KMS-wrapped audits.</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-bg/70 p-6">
              <h3 className="font-display text-xl font-semibold text-white">What it is not</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-dim">A consumer chatbot, a benchmark scoreboard, or a place for unaudited model output. Lab demos and evidence stay linked—not in the primary marketing nav.</p>
            </div>
          </div>
        </Section>
      </Reveal>

      <Reveal width="100%">
        <Section
          id="docs-strip"
          className="w-full bg-surface/20"
          eyebrow="DOCS"
          title="Start with the trust boundary."
          lead="Deep docs live on the app host. These three doors cover getting in, how audits work, and the runtime underneath."
        >
          <div className="grid gap-5 lg:grid-cols-3">
            {[
              { to: "/docs", title: "Getting started", body: "Invite path, console entry, and what a scoped evaluation requires." },
              { to: "/security", title: "Security & trust", body: "Org gate, gateway boundary, consent, encryption, retention." },
              { to: "/docs", title: "Architecture", body: "Control plane framing and the inspectable WDBX substrate—facts, not scoreboard." },
            ].map((card) => (
              <Link key={card.title} to={card.to} className="glass-card group flex min-h-48 flex-col">
                <h3 className="font-display text-xl font-semibold text-white transition-colors group-hover:text-cyan-200">{card.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-text-dim">{card.body}</p>
                <span className="mt-auto pt-6 text-sm font-semibold text-cyan-300">Open →</span>
              </Link>
            ))}
          </div>
        </Section>
      </Reveal>

      <Reveal width="100%">
        <Section id="research-preview" className="w-full bg-surface/20" eyebrow="RESEARCH NOTES" title="Architecture before adjectives." lead="Selected work on traceable retrieval, governed agents, and operational AI safety.">
          <div className="grid gap-5 lg:grid-cols-3">
            {featuredResearch.map((item) => <Link key={item.slug} to={`/research/${item.slug}`} className="glass-card group flex min-h-64 flex-col"><div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">{item.tag} · {item.date}</div><h3 className="mt-5 font-display text-xl font-semibold leading-tight text-white transition-colors group-hover:text-cyan-200">{item.title}</h3><p className="mt-4 line-clamp-4 text-sm leading-relaxed text-text-dim">{item.abstract}</p><span className="mt-auto pt-6 text-sm font-semibold text-cyan-300">Read note →</span></Link>)}
          </div>
          <Button asChild variant="outline" className="mt-8 rounded-full"><Link to="/research">Open the research archive</Link></Button>
        </Section>
      </Reveal>

      <section className="w-full px-5 section-y" aria-labelledby="quesar-cta-heading">
        <Reveal width="100%">
          <div className="container-custom">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-linear-to-br from-cyan-600/20 via-bg to-violet-500/10 p-8 md:p-14">
              <AccentGlow accent="wdbx" />
              <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="max-w-3xl"><Eyebrow className="mb-6">INVITE-ONLY BETA</Eyebrow><h2 id="quesar-cta-heading" className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">Put one governed workflow through Quesar.</h2><p className="mt-5 text-lg leading-relaxed text-text-dim">Invited teams can enter the console. New teams can request a scoped evaluation with the workflow, failure modes, and data boundary made explicit.</p><div className="mt-6 flex flex-wrap gap-3 text-xs text-text-dim"><span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Org-gated</span><span className="inline-flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-cyan-300" /> Encrypted audits</span><span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-violet-300" /> Explicit consent</span></div></div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><Button asChild size="lg" className="rounded-full bg-white px-7 text-black hover:bg-cyan-50"><Link to="/login">Enter Quesar <ArrowRight className="h-4 w-4" /></Link></Button><Button onClick={openInquiry} size="lg" variant="outline" className="rounded-full">Request access</Button></div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
