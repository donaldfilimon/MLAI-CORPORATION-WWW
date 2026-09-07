import Link from "next/link";
import { Mark } from "./Mark";
import { org, APPLE_DISCLAIMER } from "@/lib/brand";
import { Eyebrow } from "./ui/Prim";

const COLS = [
  { h: "Products", items: [["WDBX", "/wdbx"], ["ABI", "/abi"], ["Abbey", "/abbey"]] },
  { h: "Learn", items: [["Architecture", "/architecture"], ["Docs", "/docs"], ["Company", "/company"]] },
  { h: "Legal", items: [["Terms", "/legal/terms"], ["Privacy", "/legal/privacy"]] },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-line py-14">
      <div className="mx-auto max-w-[1120px] px-6">
        <div className="grid gap-10" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
          <div>
            <div className="flex items-center gap-2.5">
              <Mark size={22} />
              <span className="font-mono text-[13.5px] font-semibold tracking-[0.09em]">MLAI</span>
            </div>
            <p className="mt-4 text-[12.5px] leading-[1.7] text-faint">
              {org.name} · {org.licence}
              <br />Built by {org.builder}
            </p>
          </div>

          {COLS.map((c) => (
            <div key={c.h}>
              <Eyebrow>{c.h}</Eyebrow>
              <div className="mt-4 grid gap-2.5">
                {c.items.map(([label, href]) => (
                  <Link key={label} href={href} className="text-[13px] text-muted hover:text-fg">{label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-11 grid gap-4 border-t border-line pt-7">
          <p className="max-w-[760px] text-[11.5px] leading-[1.7] text-faint">
            <strong className="text-muted">Independence.</strong> {APPLE_DISCLAIMER}
          </p>
          <div className="flex flex-wrap justify-between gap-3">
            <span className="font-mono text-[11px] text-faint">© 2026 {org.name} · {org.licence}</span>
            <span className="font-mono text-[11px] text-faint">Next.js · React 19 · Static export</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
