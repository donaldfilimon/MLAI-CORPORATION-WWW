import { Input, Label } from "mlai-corporation-www";

/**
 * Dark-only DS: the field is a `border-input` hairline over the canvas with muted placeholder
 * text — on white it reads as an empty rectangle. maxWidth = the old 280 field measure + the
 * 28px ink padding on each side.
 */
const ink = { background: "#05070d", padding: 28, borderRadius: 12, maxWidth: 336 };

export const Default = () => (
  <div style={ink}>
    <Input placeholder="Search durable records…" />
  </div>
);

export const WithLabel = () => (
  <div style={ink}>
    <div style={{ display: "grid", gap: 6 }}>
      <Label htmlFor="store">Store path</Label>
      <Input id="store" defaultValue="~/wdbx/store.jsonl" />
    </div>
  </div>
);

export const Invalid = () => (
  <div style={ink}>
    <div style={{ display: "grid", gap: 6 }}>
      <Label htmlFor="segment">Segment</Label>
      <Input id="segment" defaultValue="wdbx.seg.-1.jsonl" aria-invalid />
    </div>
  </div>
);

export const Disabled = () => (
  <div style={ink}>
    <Input placeholder="Read-only" disabled />
  </div>
);
