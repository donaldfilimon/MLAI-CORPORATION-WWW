import { Button } from "mlai-corporation-www";

/**
 * Dark-only DS: `outline`/`ghost`/`link` are transparent-ground variants and the primary is a
 * LIGHT cyan with a dark foreground — the whole set only reads on the Lab ink canvas.
 */
const ink = { background: "#05070d", padding: 28, borderRadius: 12, maxWidth: 700 };
const row = { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" };

export const Variants = () => (
  <div style={ink}>
    <div style={row}>
      <Button>Run query</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Delete store</Button>
      <Button variant="link">Docs</Button>
    </div>
  </div>
);

export const Sizes = () => (
  <div style={ink}>
    <div style={row}>
      <Button size="xs">xs</Button>
      <Button size="sm">sm</Button>
      <Button size="default">default</Button>
      <Button size="lg">lg</Button>
    </div>
  </div>
);

export const Disabled = () => (
  <div style={ink}>
    <div style={row}>
      <Button disabled>Disabled</Button>
      <Button variant="outline" disabled>Disabled</Button>
    </div>
  </div>
);
