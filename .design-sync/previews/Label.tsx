import { Label, Input } from "mlai-corporation-www";

export const WithInput = () => (
  <div style={{ maxWidth: 280, display: "grid", gap: 6 }}>
    <Label htmlFor="persona">Persona</Label>
    <Input id="persona" defaultValue="Abbey" />
  </div>
);
