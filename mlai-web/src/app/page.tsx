import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { org, products, personas } from "@/lib/brand";
import { home } from "@/lib/content";
import { Eyebrow, Surface, Section } from "@/components/ui/Prim";
import { ChipDiagram } from "@/components/viz/ChipDiagram";
import { ConventionalDiagram } from "@/components/viz/ConventionalDiagram";
import { FlowStrip } from "@/components/viz/FlowStrip";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden" style={{ paddingTop: 132, paddingBottom: 72 }}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(780px circle at 50% -8%, rgba(34,211,238,0.08), transparent 62%)" }} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg,transparent,rgba(34,211,238,0.33),transparent)" }} />

        <div className="relative mx-auto max-w-[1120px] px-6">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-raise px-3 py-[5px]">
            <span className="breathe h-[5px] w-[5px] rounded-full bg-signal" />
            <span className="font-mono text-[10.5px] tracking-[0.06em] text-muted">
              Pre-release · Open core · {org.licence}
            </span>
          </div>

          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <h1 className="max-w-[620px] font-display font-semibold leading-[1.05] tracking-[-0.045em]"
                style={{ fontSize: "clamp(2.4rem, 5.4vw, 3.5rem)" }}>
                The inference, the index,<br />and the data live on{" "}
                <span className="text-wdbx">the same chip.</span>
              </h1>
              <p className="mt-[26px] max-w-[480px] text-[16.5px] leading-[1.68] text-muted">{home.heroLead}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/architecture" className="btn bg-wdbx text-black">
                  See the architecture <ArrowRight size={15} />
                </Link>
                <Link href="/docs" className="btn btn-line">Read the docs</Link>
              </div>
            </div>

            <Surface accent="var(--color-wdbx)" interactive className="p-5">
              <ChipDiagram />
            </Surface>
          </div>

          <div className="mt-14"><FlowStrip /></div>
        </div>
      </section>

      <Section eyebrow="Why it matters" title="One boundary, or three." sub={home.contrastSub}>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))" }}>
          <Surface accent="var(--color-wdbx)" interactive className="p-5">
            <div className="mb-3.5 flex justify-between">
              <Eyebrow color="var(--color-wdbx)">MLAI</Eyebrow>
              <span className="font-mono text-[10px] text-faint">one address space</span>
            </div>
            <ChipDiagram />
          </Surface>
          <Surface className="p-5">
            <div className="mb-3.5 flex justify-between">
              <Eyebrow>Conventional</Eyebrow>
              <span className="font-mono text-[10px] text-dim">three services</span>
            </div>
            <ConventionalDiagram />
          </Surface>
        </div>
      </Section>

      <Section eyebrow="The stack" title="Three layers, one substrate." sub={home.stackSub}>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
          {products.map((p) => (
            <Link key={p.key} href={p.href} className="block">
              <Surface accent={p.color} interactive className="h-full p-6">
                <div className="flex items-center justify-between">
                  <div className="h-[38px] w-[38px] rounded-[10px] border"
                    style={{ background: `${p.color}14`, borderColor: `${p.color}33` }} />
                  <ChevronRight size={15} className="text-dim" />
                </div>
                <div className="mt-[18px] flex items-baseline gap-2.5">
                  <span className="font-display text-[19px] font-semibold tracking-[-0.02em]" style={{ color: p.color }}>
                    {p.name}
                  </span>
                  <span className="font-mono text-[10.5px] text-faint">{p.tag}</span>
                </div>
                <p className="mt-3 text-[13.5px] leading-[1.7] text-muted">{p.summary}</p>
                <div className="mt-[18px] border-t border-line pt-3.5">
                  <span className="font-mono text-[10.5px]" style={{ color: p.color }}>{p.lang}</span>
                </div>
              </Surface>
            </Link>
          ))}
        </div>
      </Section>

      <Section eyebrow="Personas" title="One model surface. Three dispositions."
        sub={home.personaSub} color="var(--color-abi)">
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
          {personas.map((p) => (
            <Surface key={p.key} accent={p.color} interactive className="p-6">
              <div className="flex items-center gap-2.5">
                <span className="h-[7px] w-[7px] rounded-full" style={{ background: p.color }} />
                <span className="font-display text-[17px] font-semibold">{p.name}</span>
              </div>
              <div className="mt-1 pl-[17px] font-mono text-[10.5px]" style={{ color: p.color }}>{p.role}</div>
              <p className="mt-4 text-[13.5px] leading-[1.7] text-muted">{p.blurb}</p>
              <div className="mt-[18px] flex flex-wrap gap-1.5">
                {p.traits.map((t) => (
                  <span key={t} className="rounded-md border border-line bg-white/[0.04] px-2 py-[3px] font-mono text-[10px] text-muted">
                    {t}
                  </span>
                ))}
              </div>
            </Surface>
          ))}
        </div>
      </Section>
    </>
  );
}
