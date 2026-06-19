import { Input, Label } from "mlai-corporation-www";

export const Default = () => (
  <div style={{ maxWidth: 280 }}>
    <Input placeholder="Search durable records…" />
  </div>
);

export const WithLabel = () => (
  <div style={{ maxWidth: 280, display: "grid", gap: 6 }}>
    <Label htmlFor="store">Store path</Label>
    <Input id="store" defaultValue="~/wdbx/store.jsonl" />
  </div>
);

export const Disabled = () => (
  <div style={{ maxWidth: 280 }}>
    <Input placeholder="Read-only" disabled />
  </div>
);
