import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge } from "mlai-corporation-www";

/**
 * Dark-only DS: the card surface is `bg-card` with a `ring-foreground/10` hairline, and the
 * `glass` variant is a translucent fill with a 1px inset top highlight — neither exists on a
 * white ground. maxWidth = the old 360 card measure + the 28px ink padding on each side.
 */
const ink = { background: "#05070d", padding: 28, borderRadius: 12, maxWidth: 416 };

export const Basic = () => (
  <div style={ink}>
    <Card>
      <CardHeader>
        <CardTitle>WDBX store</CardTitle>
        <CardDescription>Durable vector / block memory with JSONL persistence.</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Badge variant="success">healthy</Badge>
          <span style={{ fontSize: 13, opacity: 0.7 }}>1,204 vectors · 12 blocks</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button size="sm">Open</Button>
        <Button size="sm" variant="outline">Compact</Button>
      </CardFooter>
    </Card>
  </div>
);

export const Glass = () => (
  <div style={ink}>
    <Card variant="glass">
      <CardHeader>
        <CardTitle>Context pack</CardTitle>
        <CardDescription>Evidence blocks assembled by ABI for the active query.</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Badge variant="outline">MVCC snapshot</Badge>
          <Badge variant="secondary">hash-chained</Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="outline">Inspect</Button>
      </CardFooter>
    </Card>
  </div>
);

export const Compact = () => (
  <div style={ink}>
    <Card size="sm">
      <CardHeader>
        <CardTitle>Abbey</CardTitle>
        <CardDescription>Empathetic persona in the Abbey / Aviva / Abi routing layer.</CardDescription>
      </CardHeader>
      <CardContent>
        <span style={{ fontSize: 13, opacity: 0.7 }}>Routed by the persona layer, not pinned per session.</span>
      </CardContent>
    </Card>
  </div>
);
