import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { Reveal } from '../components/Reveal';
import { Stats } from '../components/Stats';
import { FAQ } from '../components/FAQ';
import { PersonaLegend } from '../components/PersonaLegend';
import { PersonaVoices } from '../components/PersonaVoices';
import { Button } from '@/components/ui/button';
import {
  AccentGlow,
  Callout,
  DeepDive,
  Eyebrow,
  FeatureCard,
  NextUp,
  Section,
  type Accent,
  type NextUpItem,
} from '@/components/site';
import { industries } from '@/data/categories/industries';
import { platform } from '@/data/categories/platform';
import { products } from '@/data/categories/products';
import { research } from '@/data/categories/research';
import { services } from '@/data/categories/services';
import { useUI } from '@/lib/ui-context';

const Technology = React.lazy(() => import('../components/Technology').then(module => ({ default: module.Technology })));

/**
 * Accents here are the PRODUCT axis (`site/accent.ts`), assigned from what each
 * capability is about — persona orchestration → abbey, retrieval → wdbx,
 * runtime policy enforcement → abi. Not the persona color axis.
 */
const capabilities: { title: string; description: string; accent: Accent }[] = [
  {
    title: 'Agentic orchestration',
    description: 'Coordinate Abbey, Aviva, and Abi personas with auditable task handoffs, bounded autonomy, and clear operator control.',
    accent: 'abbey',
  },
  {
    title: 'WDBX retrieval core',
    description: 'Weighted backtrace graphs preserve context, reduce hallucination surfaces, and keep high-throughput retrieval explainable.',
    accent: 'wdbx',
  },
  {
    title: 'Policy-locked execution',
    description: 'Constraint enforcement, audit trails, and human approval gates are designed into the runtime instead of bolted on later.',
    accent: 'abi',
  },
];

const workflow = [
  'Map high-risk workflows, latency budgets, data residency, and approval boundaries.',
  'Prototype retrieval, orchestration, and safety layers against production-like traffic.',
  'Deploy with monitoring, benchmark baselines, and continuous reliability reviews.',
];

const operatingContract = [
  'Trace every retrieval path back to durable context.',
  'Route requests through the persona best suited to the job.',
  'Keep operator approval close to actions that can change state.',
];

const featuredResearch = research.publications.slice(0, 3);
const featuredServices = services.slice(0, 4);

/** The four platform layers, mapped onto the DeepDive card shape. */
const platformLayers = platform.map((item) => ({
  title: item.title,
  body: item.description,
  meta: item.detail,
}));

/**
 * Closing wayfinding. Descriptions are trimmed from the destinations' own
 * `route-meta.ts` copy so nothing new is claimed here, and every href is a real
 * route directory under `app/`.
 */
const nextUp: NextUpItem[] = [
  {
    label: 'Live demo',
    href: '/demo',
    desc: 'Run a faithful in-browser miniature of the WDBX query path — real cosine search over deterministic embeddings, shard routing, MVCC snapshots, and a hash-chained query log.',
    accent: 'wdbx',
  },
  {
    label: 'Docs',
    href: '/docs',
    desc: 'Platform concepts, deployment modes, protected API surfaces, retrieval workflows, and safety evaluation guidance.',
    accent: 'abi',
  },
  {
    label: 'Research',
    href: '/research',
    desc: 'Notes on WDBX retrieval, graph provenance, policy-gated agents, offline workflows, and production AI safety.',
    accent: 'abbey',
  },
  {
    label: 'Link hub',
    href: '/links',
    desc: "One screen for MLAI's important doors — source repositories, reference docs, product pages, research, and the founder's profile.",
    accent: 'wdbx',
  },
];

export function Home() {
  const { openInquiry } = useUI();

  return (
    <div className="home-page flex flex-col items-center overflow-hidden">
      <Hero />

      <Reveal width="100%">
        <Section
          id="home-capabilities-heading"
          className="relative w-full"
          eyebrow="PRODUCTION AI FOUNDATIONS"
          title="One architecture from memory to action."
          lead="WDBX keeps context traceable, Abbey · Aviva · Abi choose the right operating voice, and policy gates keep agent work inside reviewable boundaries."
        >
          {/* `.container-custom` is not positioned, so this still resolves
              against the <section> and stays full-bleed. */}
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-400/30 to-transparent" aria-hidden="true" />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {capabilities.map((item) => (
              <FeatureCard key={item.title} title={item.title} desc={item.description} accent={item.accent} />
            ))}
          </div>

          <Callout label="Operating contract" className="mt-10">
            <ol role="list" className="grid gap-3">
              {operatingContract.map((item, index) => (
                <li key={item} className="flex gap-3">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 font-mono text-[10px] text-cyan-200"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </Callout>

          {/* Persona legend — keyed to the hero galaxy's three clusters. */}
          <div className="mt-12 flex flex-col items-center">
            <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-text-dim/60">
              Three minds, one router
            </p>
            <PersonaLegend />
            {/* Hear each mind — neural TTS, opt-in + lazy (client-only). */}
            <PersonaVoices className="mt-6" />
          </div>
        </Section>
      </Reveal>

      <section className="relative w-full section-y bg-surface/20 noise-overlay" aria-labelledby="home-workflow-heading">
        <Reveal width="100%">
          <div className="container-custom relative z-10 grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <Eyebrow className="mb-6">DELIVERY MODEL</Eyebrow>
              <h2 id="home-workflow-heading" className="section-title">A practical path to reliable autonomy.</h2>
              <p className="text-lg leading-relaxed text-text-dim">
                We start with the operational risk profile, then build only the layers needed to make your system observable, governable, and fast enough for real users.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="rounded-full bg-white px-5 font-bold text-black hover:bg-cyan-50">
                  <Link to="/services">See Services <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
                </Button>
                <Button variant="outline" onClick={openInquiry} className="rounded-full border-white/10 bg-white/3 px-5 text-white hover:bg-white/10 hover:text-white">
                  Start Inquiry
                </Button>
              </div>
            </div>

            <div className="relative rounded-[2rem] border border-white/10 bg-bg/70 p-4 shadow-2xl shadow-cyan-950/20 backdrop-blur">
              <div className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-sky-200/40 to-transparent" aria-hidden="true" />
              <ol className="grid gap-3" aria-label="MLAI delivery workflow">
                {workflow.map((step, index) => (
                  <li key={step} className="flex gap-4 rounded-3xl border border-white/8 bg-white/3 p-5 transition-colors hover:border-cyan-300/20 hover:bg-white/[0.045]">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 font-mono text-sm font-bold text-cyan-300 ring-1 ring-cyan-400/20">
                      0{index + 1}
                    </span>
                    <p className="pt-1 text-sm leading-relaxed text-text-dim">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>
      </section>

      <React.Suspense fallback={<div className="h-96 w-full bg-surface/20" aria-hidden="true" />}>
        <Technology />
      </React.Suspense>

      <Reveal width="100%">
        <Section
          id="home-platform-heading"
          className="w-full bg-surface/20"
          eyebrow="PLATFORM LAYERS"
          title="The stack behind reliable AI workflows."
          lead="MLAI separates traceability, control, evaluation, and deployment so teams can improve one layer without breaking the rest of the system."
        >
          <DeepDive items={platformLayers} cols={2} />

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <span className="text-sm text-text-dim">Deep dives:</span>
            {products.map((p) => (
              <Link
                key={p.slug}
                to={`/products/${p.slug}`}
                className="glass-card group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white"
              >
                {p.name}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            ))}
            <Link
              to="/showcase"
              className="glass-card group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white"
            >
              Films &amp; Design Lab
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </Section>
      </Reveal>

      <section className="w-full section-y" aria-labelledby="home-industries-heading">
        <Reveal width="100%">
          <div className="container-custom grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <Eyebrow className="mb-6">WHERE IT FITS</Eyebrow>
              <h2 id="home-industries-heading" className="section-title">Built for teams with real constraints.</h2>
              <p className="text-lg leading-relaxed text-text-dim">The site, console, and API are organized around private deployments, measurable controls, and AI features that can survive production review.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {industries.map((industry) => (
                <div key={industry} className="rounded-3xl border border-white/10 bg-white/3 p-5 text-sm leading-relaxed text-text-dim">
                  <CheckCircle2 className="mb-4 h-5 w-5 text-cyan-300" aria-hidden="true" />
                  {industry}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <Reveal width="100%">
        <Section
          id="home-research-heading"
          className="w-full"
          eyebrow="RESEARCH TO RUNTIME"
          title="Selected architecture notes."
          lead="A focused preview of the research themes behind MLAI systems."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {featuredResearch.map((item) => (
              <Link
                key={item.title}
                to={`/research/${item.slug}`}
                className="glass-card group flex h-full flex-col transition-colors hover:border-cyan-500/20"
              >
                <div className="mb-5 flex flex-wrap items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-cyan-300">
                  <span>{item.tag}</span>
                  <span className="h-1 w-1 rounded-full bg-white/30" aria-hidden="true" />
                  <span className="text-text-dim/70">{item.date}</span>
                </div>
                <h3 className="text-xl font-display font-bold leading-tight text-white mb-3 group-hover:text-cyan-300 transition-colors">{item.title}</h3>
                <p className="text-sm leading-relaxed text-text-dim mb-4">{item.abstract}</p>
                <span className="mt-auto inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-300">
                  Read paper <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-10">
            <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/3 px-5 text-white hover:bg-white/10 hover:text-white">
              <Link to="/research">View research archive <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
            </Button>
          </div>
        </Section>
      </Reveal>

      <Reveal width="100%">
        <Section
          id="home-services-heading"
          className="w-full bg-surface/20"
          eyebrow="ENGINEERING SERVICES"
          title="Focused help where reliability matters most."
          lead="Architecture, integration, auditing, and deployment support for high-stakes AI programs."
        >
          <div className="grid gap-6 md:grid-cols-2">
            {featuredServices.map((service) => (
              <FeatureCard key={service.title} title={service.title} desc={service.description} />
            ))}
          </div>

          <div className="mt-10">
            <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/3 px-5 text-white hover:bg-white/10 hover:text-white">
              <Link to="/services">Explore all services <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
            </Button>
          </div>
        </Section>
      </Reveal>

      <Stats />

      <FAQ />

      <section className="w-full px-6 section-y" aria-labelledby="home-cta-heading">
        <Reveal width="100%">
          <div className="container-custom">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-linear-to-br from-cyan-600/20 via-bg to-sky-500/10 p-8 md:p-14">
              <AccentGlow accent="wdbx" />
              <div className="relative z-10 max-w-3xl">
                <Eyebrow className="mb-6">READY FOR REVIEW</Eyebrow>
                <h2 id="home-cta-heading" className="text-3xl md:text-5xl font-display font-bold tracking-tight text-white">Bring MLAI into your next critical AI system.</h2>
                <p className="mt-6 text-lg leading-relaxed text-text-dim">
                  Share the workflow you want to automate, the failure modes you cannot accept, and the infrastructure constraints we need to respect.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button onClick={openInquiry} className="h-11 rounded-full bg-white px-6 font-bold text-black hover:bg-cyan-50">Start Inquiry</Button>
                  <Button asChild variant="ghost" className="h-11 rounded-full border border-white/10 px-6 text-white hover:bg-white/10 hover:text-white">
                    <Link to="/benchmarks">Review Benchmarks</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <Reveal width="100%">
        {/* `.section-y` sets padding-top at three breakpoints via @apply, so a
            bare `pt-0` would only take effect below `md`. */}
        <Section className="w-full pt-0 md:pt-0 lg:pt-0" eyebrow="KEEP EXPLORING">
          <NextUp items={nextUp} />
        </Section>
      </Reveal>
    </div>
  );
}
