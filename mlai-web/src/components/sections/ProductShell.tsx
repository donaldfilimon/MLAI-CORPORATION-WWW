import type { Metric } from "@/lib/brand";
import { Eyebrow, MetricGrid, FAQ, Note } from "@/components/ui/Prim";

export function ProductShell({
  name, tag, color, tagline, body, metrics, notes, faq,
}: {
  name: string; tag: string; color: string; tagline: string; body: string;
  metrics: Metric[];
  notes: readonly { title: string; body: string }[];
  faq: readonly { q: string; a: string }[];
}) {
  return (
    <div style={{ paddingTop: 116, paddingBottom: 88 }}>
      <div className="mx-auto max-w-[1120px] px-6">
        <Eyebrow color={color}>{tag}</Eyebrow>
        <h1 className="mt-3.5 font-display text-[46px] font-semibold leading-[1.06] tracking-[-0.04em]">{name}</h1>
        <p className="mt-3 text-[19px]" style={{ color }}>{tagline}</p>
        <p className="mt-[22px] max-w-[640px] text-[15.5px] leading-[1.78] text-muted">{body}</p>

        <div className="mt-12"><MetricGrid metrics={metrics} accent={color} /></div>

        <div className="mt-14 grid gap-8" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))" }}>
          <div>
            <Eyebrow>Design notes</Eyebrow>
            <div className="mt-4 grid gap-3">
              {notes.map((n) => <Note key={n.title} title={n.title} body={n.body} accent={color} />)}
            </div>
          </div>
          <div>
            <Eyebrow>Questions</Eyebrow>
            <div className="mt-4"><FAQ items={faq} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
