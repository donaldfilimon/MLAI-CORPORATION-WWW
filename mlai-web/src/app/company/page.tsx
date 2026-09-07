import { Mail, Github } from "lucide-react";
import { org, principles } from "@/lib/brand";
import { company } from "@/lib/content";
import { Eyebrow, Surface } from "@/components/ui/Prim";

export const metadata = { title: "Company" };

const FACTS = [["Model", "Open core"], ["Licence", org.licence], ["Stage", "Pre-release"]] as const;

export default function Page() {
  return (
    <div style={{ paddingTop: 116, paddingBottom: 88 }}>
      <div className="mx-auto max-w-[1120px] px-6">
        <Eyebrow>Company</Eyebrow>
        <h1 className="mt-3.5 font-display text-[42px] font-semibold tracking-[-0.04em]">{org.name}</h1>
        <p className="mt-5 max-w-[620px] text-[16px] leading-[1.75] text-muted">{company.intro}</p>

        <div className="mt-10 grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
          {FACTS.map(([k, v]) => (
            <Surface key={k} className="p-5">
              <Eyebrow>{k}</Eyebrow>
              <div className="mt-2 font-display text-[17px] font-medium">{v}</div>
            </Surface>
          ))}
        </div>

        <div className="mt-14">
          <Eyebrow>Principles</Eyebrow>
          <div className="mt-[18px] grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>
            {principles.map((p) => (
              <Surface key={p.title} accent={p.color} interactive className="p-6">
                <span className="block h-[3px] w-8 rounded-full" style={{ background: p.color }} />
                <h2 className="mt-4 font-display text-[16px] font-semibold">{p.title}</h2>
                <p className="mt-2.5 text-[13.5px] leading-[1.7] text-muted">{p.body}</p>
              </Surface>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <Eyebrow>Approach</Eyebrow>
          <div className="mt-[18px] grid gap-3">
            {company.approach.map((a) => (
              <Surface key={a.title} className="p-[22px]">
                <div className="font-display text-[15.5px] font-medium">{a.title}</div>
                <p className="mt-2 max-w-[720px] text-[13.5px] leading-[1.7] text-muted">{a.body}</p>
              </Surface>
            ))}
          </div>
        </div>

        <Surface accent="var(--color-signal)" interactive className="mt-14 p-8">
          <Eyebrow color="var(--color-signal)">Get in touch</Eyebrow>
          <h2 className="mt-3 font-display text-[22px] font-semibold">Early access</h2>
          <p className="mt-3 max-w-[520px] text-[14px] leading-[1.72] text-muted">{company.contact}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`mailto:${org.email}`} className="btn bg-signal text-black">
              <Mail size={15} />{org.email}
            </a>
            <a href={org.repo} target="_blank" rel="noreferrer noopener" className="btn btn-line">
              <Github size={15} />GitHub
            </a>
          </div>
        </Surface>
      </div>
    </div>
  );
}
