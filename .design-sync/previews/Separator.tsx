import { Separator } from "mlai-corporation-www";

export const Horizontal = () => (
  <div style={{ maxWidth: 300 }}>
    <div style={{ fontSize: 14, fontWeight: 600 }}>ABI runtime</div>
    <div style={{ fontSize: 13, opacity: 0.7 }}>Query planning + context packs</div>
    <Separator style={{ margin: "12px 0" }} />
    <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
      <span>Abbey</span><span>Aviva</span><span>Abi</span>
    </div>
  </div>
);

export const Vertical = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, height: 24, fontSize: 13 }}>
    <span>CLI</span>
    <Separator orientation="vertical" />
    <span>MCP</span>
    <Separator orientation="vertical" />
    <span>WDBX</span>
  </div>
);
