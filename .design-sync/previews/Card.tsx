import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge } from "mlai-corporation-www";

export const Basic = () => (
  <Card style={{ maxWidth: 360 }}>
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
);
