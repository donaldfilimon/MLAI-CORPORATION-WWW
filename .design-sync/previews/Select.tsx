import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label } from "mlai-corporation-www";

export const Default = () => (
  <div style={{ maxWidth: 280, display: "grid", gap: 6 }}>
    <Label htmlFor="persona">Persona</Label>
    <Select defaultValue="Abbey">
      <SelectTrigger id="persona">
        <SelectValue placeholder="Select a persona" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Abbey">Abbey — empathetic polymath</SelectItem>
        <SelectItem value="Aviva">Aviva — direct expert</SelectItem>
        <SelectItem value="Abi">Abi — adaptive router</SelectItem>
      </SelectContent>
    </Select>
  </div>
);
