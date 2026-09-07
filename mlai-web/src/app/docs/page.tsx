import { ChevronRight } from "lucide-react";
import { docs } from "@/lib/content";
import { T } from "@/lib/tokens";
import { Eyebrow, Surface } from "@/components/ui/Prim";
import { CodeBlock } from "@/components/ui/CodeBlock";

export const metadata = { title: "Docs" };

const COLORS: Record<string, string> = {
  tutorials: T.signal, howto: T.wdbx, reference: T.abi, explanation: T.abbey,
};

const BUILD = [
  "git clone https://github.com/donaldfilimon/abi",
  "cd abi",
  "zig build -Doptimize=ReleaseFast",
  "zig build test",
];

export default function Page() {
  return (
    <div style={{ paddingTop: 116, paddingBottom: 88 }}>
      <div className="mx-auto max-w-[1120px] px-6">
        <Eyebrow>Documentation</Eyebrow>
        <h1 className="mt-3.5 font-display text-[42px] font-semibold leading-[1.1] tracking-[-0.04em]">
          Four kinds of docs,<br />kept separate.
        </h1>
        <p className="mt-5 max-w-[620px] text-[16px] leading-[1.75] text-muted">{docs.intro}</p>

        <div className="mt-12 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>
          {docs.sections.map((d) => {
            const color = COLORS[d.key] ?? T.wdbx;
            return (
              <Surface key={d.key} accent={color} interactive className="p-6">
                <div className="flex items-start justify-between">
                  <div className="h-[34px] w-[34px] rounded-[9px] border"
                    style={{ background: `${color}14`, borderColor: `${color}33` }} />
                  <span className="font-mono text-[9.5px] tracking-[0.08em] text-dim">{d.kind.toUpperCase()}</span>
                </div>
                <h2 className="mt-[18px] font-display text-[17px] font-semibold">{d.title}</h2>
                <p className="mt-2 text-[13.5px] leading-[1.68] text-muted">{d.body}</p>
                <div className="mt-[18px] grid gap-2 border-t border-line pt-3.5">
                  {d.links.map((l) => (
                    <div key={l} className="flex items-center gap-2">
                      <ChevronRight size={12} className="text-dim" />
                      <span className="font-mono text-[11.5px] text-muted">{l}</span>
                    </div>
                  ))}
                </div>
              </Surface>
            );
          })}
        </div>

        <div className="mt-10">
          <Eyebrow>Build from source</Eyebrow>
          <div className="mt-3.5"><CodeBlock lang="bash" lines={BUILD} prompt /></div>
          <p className="mt-3.5 max-w-[620px] text-[12.5px] leading-[1.7] text-faint">{docs.buildNote}</p>
        </div>
      </div>
    </div>
  );
}
