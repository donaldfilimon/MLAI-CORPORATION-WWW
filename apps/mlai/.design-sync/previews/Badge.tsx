import { Badge } from "mlai-corporation-www";

/**
 * Dark-only DS: `outline` is a border-only chip on `text-foreground` and `success` is a
 * 10%-alpha cyan tint — both are invisible on white, so the cells render on the Lab ink ground.
 */
const ink = { background: "#05070d", padding: 28, borderRadius: 12, maxWidth: 620 };
const row = { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" };

export const Variants = () => (
  <div style={ink}>
    <div style={row}>
      <Badge>Abbey</Badge>
      <Badge variant="secondary">WDBX</Badge>
      <Badge variant="success">Indexed</Badge>
      <Badge variant="outline">v0.17-dev</Badge>
      <Badge variant="destructive">Deprecated</Badge>
    </div>
  </div>
);

export const InContext = () => (
  <div style={ink}>
    <div style={{ display: "grid", gap: 10 }}>
      {[
        { name: "wdbx.seg.0.jsonl", state: "sealed", variant: "success" as const },
        { name: "wdbx.seg.1.jsonl", state: "open", variant: "secondary" as const },
        { name: "wdbx.index", state: "rebuilding", variant: "outline" as const },
      ].map((s) => (
        <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <span style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: 13, color: "#e6edf6" }}>{s.name}</span>
          <Badge variant={s.variant}>{s.state}</Badge>
        </div>
      ))}
    </div>
  </div>
);
