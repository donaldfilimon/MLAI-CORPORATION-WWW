import { Button } from "mlai-corporation-www";

const row: React.CSSProperties = { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" };

export const Variants = () => (
  <div style={row}>
    <Button>Run query</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="destructive">Delete store</Button>
    <Button variant="link">Docs</Button>
  </div>
);

export const Sizes = () => (
  <div style={row}>
    <Button size="xs">xs</Button>
    <Button size="sm">sm</Button>
    <Button size="default">default</Button>
    <Button size="lg">lg</Button>
  </div>
);

export const Disabled = () => (
  <div style={row}>
    <Button disabled>Disabled</Button>
    <Button variant="outline" disabled>Disabled</Button>
  </div>
);
