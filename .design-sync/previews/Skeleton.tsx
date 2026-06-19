import { Skeleton } from "mlai-corporation-www";

export const Card = () => (
  <div style={{ maxWidth: 320, display: "flex", gap: 12, alignItems: "center" }}>
    <Skeleton style={{ width: 48, height: 48, borderRadius: 999 }} />
    <div style={{ display: "grid", gap: 8, flex: 1 }}>
      <Skeleton style={{ height: 14, width: "70%" }} />
      <Skeleton style={{ height: 14, width: "40%" }} />
    </div>
  </div>
);
