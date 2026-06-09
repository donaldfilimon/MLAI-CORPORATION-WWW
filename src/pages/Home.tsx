import React from 'react';
import { ArrowRight, BrainCircuit, CheckCircle2, Cpu, DatabaseZap, GitBranch, Layers3, LockKeyhole, Network, ServerCog, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { Reveal } from '../components/Reveal';
import { Stats } from '../components/Stats';
import { FAQ } from '../components/FAQ';
import { Button } from '@/components/ui/button';
import { content } from '../data';
import { useUI } from '@/lib/ui-context';

const Technology = React.lazy(() => import('../components/Technology').then(module => ({ default: module.Technology })));

const capabilities = [
  {
    icon: <BrainCircuit className="w-6 h-6 text-indigo-400" />,
    title: 'Agentic orchestration',
    description: 'Coordinate Abbey, Aviva, and Abi personas with auditable task handoffs, bounded autonomy, and clear operator control.',
  },
  {
    icon: <DatabaseZap className="w-6 h-6 text-sky-300" />,
    title: 'WDBX retrieval core',
    description: 'Weighted backtrace graphs preserve context, reduce hallucination surfaces, and keep high-throughput retrieval explainable.',
  },
  {
    icon: <LockKeyhole className="w-6 h-6 text-indigo-300" />,
    title: 'Policy-locked execution',
    description: 'Constraint enforcement, audit trails, and human approval gates are designed into the runtime instead of bolted on later.',
  },
];

const workflow = [
  'Map high-risk workflows, latency budgets, data residency, and approval boundaries.',
  'Prototype retrieval, orchestration, and safety layers against production-like traffic.',
  'Deploy with monitoring, benchmark baselines, and continuous reliability reviews.',
];

const featuredResearch = content.research.publications.slice(0, 3);
const featuredServices = content.services.slice(0, 4);
const platformIcons = [GitBranch, ShieldCheck, Layers3, ServerCog];

export function Home() {
  const { openInquiry } = useUI();

  return (
    <div className="home-page flex flex-col items-center overflow-hidden">
      <Hero />

      <section className="relative w-full section-y" aria-labelledby="home-capabilities-heading">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent" aria-hidden="true" />
        <Reveal width="100%">
          <div className="container-custom">
            <div className="mb-14 max-w-3xl">
              <div className="label-chip mb-6">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                PRODUCTION AI FOUNDATIONS
              </div>
              <h2 id="home-capabilities-heading" className="section-title">Move from impressive demos to accountable systems.</h2>
              <p className="section-subtitle mb-0">
                MLAI combines retrieval infrastructure, multi-agent orchestration, and safety governance into one deployable architecture for teams shipping consequential AI.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {capabilities.map((item) => (
                <div key={item.title} className="glass-card h-full flex flex-col">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]" aria-hidden="true">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-text-dim">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="relative w-full section-y bg-surface/20 noise-overlay" aria-labelledby="home-workflow-heading">
        <Reveal width="100%">
          <div className="container-custom relative z-10 grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <div className="label-chip mb-6">
                <Network className="w-3.5 h-3.5" aria-hidden="true" />
                DELIVERY MODEL
              </div>
              <h2 id="home-workflow-heading" className="section-title">A practical path to reliable autonomy.</h2>
              <p className="text-lg leading-relaxed text-text-dim">
                We start with the operational risk profile, then build only the layers needed to make your system observable, governable, and fast enough for real users.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="rounded-full bg-white px-5 font-bold text-black hover:bg-indigo-50">
                  <Link to="/services">See Services <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
                </Button>
                <Button variant="outline" onClick={openInquiry} className="rounded-full border-white/10 bg-white/[0.03] px-5 text-white hover:bg-white/10 hover:text-white">
                  Start Inquiry
                </Button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-bg/70 p-4 shadow-2xl shadow-indigo-950/20 backdrop-blur">
              <ol className="grid gap-3" aria-label="MLAI delivery workflow">
                {workflow.map((step, index) => (
                  <li key={step} className="flex gap-4 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 font-mono text-sm font-bold text-indigo-300 ring-1 ring-indigo-400/20">
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

      <section className="w-full section-y bg-surface/20" aria-labelledby="home-platform-heading">
        <Reveal width="100%">
          <div className="container-custom">
            <div className="mb-14 max-w-3xl">
              <div className="label-chip mb-6">
                <Layers3 className="w-3.5 h-3.5" aria-hidden="true" />
                PLATFORM LAYERS
              </div>
              <h2 id="home-platform-heading" className="section-title">The stack behind reliable AI workflows.</h2>
              <p className="section-subtitle mb-0">MLAI separates traceability, control, evaluation, and deployment so teams can improve one layer without breaking the rest of the system.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {content.platform.map((item, index) => {
                const Icon = platformIcons[index] ?? Layers3;
                return (
                  <div key={item.title} className="glass-card h-full flex flex-col justify-between">
                    <div>
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                      <p className="text-sm leading-relaxed text-text-dim mb-4">{item.description}</p>
                    </div>
                    <p className="mt-auto rounded-xl border border-white/5 bg-bg/40 p-3 text-xs leading-relaxed text-text-dim/80 font-mono">{item.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="w-full section-y" aria-labelledby="home-industries-heading">
        <Reveal width="100%">
          <div className="container-custom grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <div className="label-chip mb-6">
                <ServerCog className="w-3.5 h-3.5" aria-hidden="true" />
                WHERE IT FITS
              </div>
              <h2 id="home-industries-heading" className="section-title">Built for teams with real constraints.</h2>
              <p className="text-lg leading-relaxed text-text-dim">The site, console, and API are organized around private deployments, measurable controls, and AI features that can survive production review.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {content.industries.map((industry) => (
                <div key={industry} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-text-dim">
                  <CheckCircle2 className="mb-4 h-5 w-5 text-indigo-300" aria-hidden="true" />
                  {industry}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="w-full section-y" aria-labelledby="home-research-heading">
        <Reveal width="100%">
          <div className="container-custom">
            <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <div className="label-chip mb-6">
                  <GitBranch className="w-3.5 h-3.5" aria-hidden="true" />
                  RESEARCH TO RUNTIME
                </div>
                <h2 id="home-research-heading" className="section-title">Selected architecture notes.</h2>
                <p className="section-subtitle mb-0">A focused preview of the research themes behind MLAI systems.</p>
              </div>
              <Button asChild variant="link" className="h-auto justify-start p-0 text-indigo-300 hover:text-indigo-200">
                <Link to="/research">View research archive <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {featuredResearch.map((item) => (
                <Link
                  key={item.title}
                  to={`/research/${item.slug}`}
                  className="glass-card group flex h-full flex-col transition-colors hover:border-indigo-500/20"
                >
                  <div className="mb-5 flex flex-wrap items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-indigo-300">
                    <span>{item.tag}</span>
                    <span className="h-1 w-1 rounded-full bg-white/30" aria-hidden="true" />
                    <span className="text-text-dim/70">{item.date}</span>
                  </div>
                  <h3 className="text-xl font-display font-bold leading-tight text-white mb-3 group-hover:text-indigo-300 transition-colors">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-text-dim mb-4">{item.abstract}</p>
                  <span className="mt-auto inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-300">
                    Read paper <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="w-full section-y bg-surface/20" aria-labelledby="home-services-heading">
        <Reveal width="100%">
          <div className="container-custom">
            <div className="mb-14 max-w-3xl">
              <div className="label-chip mb-6">
                <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
                ENGINEERING SERVICES
              </div>
              <h2 id="home-services-heading" className="section-title">Focused help where reliability matters most.</h2>
              <p className="section-subtitle mb-0">Architecture, integration, auditing, and deployment support for high-stakes AI programs.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {featuredServices.map((service) => (
                <div key={service.title} className="glass-card group flex gap-5 items-start">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-indigo-400 transition-transform group-hover:scale-110" aria-hidden="true" />
                  <div>
                    <h3 className="font-display text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{service.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-dim">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/[0.03] px-5 text-white hover:bg-white/10 hover:text-white">
                <Link to="/services">Explore all services <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      <Stats />

      <FAQ />

      <section className="w-full px-6 section-y" aria-labelledby="home-cta-heading">
        <Reveal width="100%">
          <div className="container-custom">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-indigo-600/20 via-bg to-sky-500/10 p-8 md:p-14">
              <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-400/20 blur-[90px]" aria-hidden="true" />
              <div className="relative z-10 max-w-3xl">
                <div className="label-chip mb-6">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  READY FOR REVIEW
                </div>
                <h2 id="home-cta-heading" className="text-3xl md:text-5xl font-display font-bold tracking-tight text-white">Bring MLAI into your next critical AI system.</h2>
                <p className="mt-6 text-lg leading-relaxed text-text-dim">
                  Share the workflow you want to automate, the failure modes you cannot accept, and the infrastructure constraints we need to respect.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button onClick={openInquiry} className="h-11 rounded-full bg-white px-6 font-bold text-black hover:bg-indigo-50">Start Inquiry</Button>
                  <Button asChild variant="ghost" className="h-11 rounded-full border border-white/10 px-6 text-white hover:bg-white/10 hover:text-white">
                    <Link to="/benchmarks">Review Benchmarks</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
