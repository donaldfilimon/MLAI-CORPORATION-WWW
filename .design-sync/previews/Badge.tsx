import { Badge } from "mlai-corporation-www";

export const Variants = () => (
  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
    <Badge>Abbey</Badge>
    <Badge variant="secondary">WDBX</Badge>
    <Badge variant="success">Indexed</Badge>
    <Badge variant="outline">v0.17-dev</Badge>
    <Badge variant="destructive">Deprecated</Badge>
  </div>
);
