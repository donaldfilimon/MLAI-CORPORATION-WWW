import { FileText } from "lucide-react";
import { formalModel, benchmarks, PROV, type Prov } from "@/lib/brand";
import { architecture } from "@/lib/content";
import { Eyebrow, Surface, ProvTag } from "@/components/ui/Prim";
import { LayerStack } from "@/components/viz/LayerStack";
import { FlowStrip } from "@/components/viz/FlowStrip";

export const metadata = { title: "Architecture" };

const sysColor = (s: string) =>
  s === "WDBX" ? "var(--color-wdbx)" : s === "ABI" ? "var(--color-abi)" : "var(--color-abbey)";

export default function Page() {
  return (
    <div style={{ paddingTop: 116, paddingBottom: 88 }}>
      <div className="mx-auto max-w-[1120px] px-6">
        <Eyebrow color="var(--color-signal)">Architecture</Eyebrow>
        <h1 className="mt-3.5 font-display text-[42px] font-semibold leading-[1.1] tracking-[-0.04em]">
          The whole stack, and why it is<br />shaped this way.
        </h1>
        <p className="mt-5 max-w-[620px] text-[16px] leading-[1.75] text-muted">{architecture.intro}</p>

        <div className="mt-12"><LayerStack /></div>

        <div className="mt-14">
          <Eyebrow>Retrieval path</Eyebrow>
          <div className="mt-3.5"><FlowStrip /></div>
          <p className="mt-3 max-w-[620px] text-[12.5px] leading-[1.7] text-faint">{architecture.flowNote}</p>
        </div>

        <div className="mt-14">
          <Eyebrow>Formal model</Eyebrow>
          <p className="mt-2.5 max-w-[560px] text-[13px] text-faint">
            These describe design. None is a performance claim.
          </p>
          <div className="mt-4 grid gap-3.5">
            {formalModel.map((f) => (
              <Surface key={f.name} className="p-[22px]">
                <div className="font-display text-[15px] font-medium">{f.name}</div>
                <pre className="mt-3 overflow-x-auto rounded-[9px] border border-line bg-white/[0.02] px-4 py-3">
                  <code className="font-mono text-[12.5px] text-wdbx">{f.expr}</code>
                </pre>
                <p className="mt-3 text-[13px] leading-[1.7] text-muted">{f.note}</p>
              </Surface>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <Eyebrow>How we label numbers</Eyebrow>
          <Surface className="mt-3.5 p-5">
            <div className="grid gap-3">
              {(Object.keys(PROV) as Prov[]).map((k) => (
                <div key={k} className="flex items-start gap-3">
                  <ProvTag p={k} />
                  <span className="text-[12.5px] leading-[1.65] text-faint">{PROV[k].def}</span>
                </div>
              ))}
            </div>
          </Surface>

          <div className="mt-5 overflow-hidden rounded-xl border border-line">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/[0.03]">
                    {["System", "Metric", "Value", "Provenance", "Conditions"].map((h) => (
                      <th key={h}
                        className="border-b border-line px-[18px] py-[11px] text-left font-mono text-[10px] font-normal uppercase tracking-[0.13em] text-faint">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {benchmarks.map((r, i) => (
                    <tr key={i} className={i < benchmarks.length - 1 ? "border-b border-line" : ""}>
                      <td className="px-[18px] py-3.5 font-mono text-[12px]" style={{ color: sysColor(r.sys) }}>{r.sys}</td>
                      <td className="px-[18px] py-3.5 text-[13px]">{r.metric}</td>
                      <td className="px-[18px] py-3.5 font-mono text-[13.5px] font-semibold">{r.value}</td>
                      <td className="px-[18px] py-3.5"><ProvTag p={r.prov} small /></td>
                      <td className="px-[18px] py-3.5 text-[11.5px] text-faint">{r.cond}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Surface className="mt-[18px] p-[22px]">
            <div className="flex items-start gap-3">
              <FileText size={15} className="mt-0.5 shrink-0 text-muted" />
              <div>
                <div className="font-display text-[14px] font-medium">What a measured tag will require</div>
                <p className="mt-2 max-w-[700px] text-[13px] leading-[1.72] text-muted">
                  {architecture.measuredNote}
                </p>
              </div>
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}
