import { Textarea, Label } from "mlai-corporation-www";

export const Default = () => (
  <div style={{ maxWidth: 360 }}>
    <Textarea placeholder="Ask Abbey…" />
  </div>
);

export const WithLabel = () => (
  <div style={{ maxWidth: 360, display: "grid", gap: 6 }}>
    <Label htmlFor="q">Query</Label>
    <Textarea id="q" defaultValue="Summarize the last three evidence blocks about WDBX persistence." rows={3} />
  </div>
);
