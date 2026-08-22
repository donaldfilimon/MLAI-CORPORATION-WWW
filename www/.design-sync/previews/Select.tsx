import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Label,
} from "mlai-corporation-www";

/**
 * Lab ink canvas. `color` is required here too — SelectTrigger is
 * `bg-transparent` with no text-color class, so it inherits.
 *
 * Base UI portals the open popup to `document.body`, so only the **closed**
 * trigger is photographable. The closed trigger prints the raw `value` string
 * (the item label is resolved only once the popup mounts), so values are kept
 * human-readable — "Abbey", not "abbey".
 */
const ink = {
  background: "#05070d",
  padding: 28,
  borderRadius: 12,
  color: "var(--foreground)",
  fontFamily: "var(--font-sans)",
  maxWidth: 340,
} as const;

/** Default size, with a selection already made. */
export const Default = () => (
  <div style={ink}>
    <div style={{ display: "grid", gap: 6 }}>
      <Label htmlFor="persona">Routing persona</Label>
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
  </div>
);

/** Unset: the trigger falls back to the placeholder in `--muted-foreground`. */
export const Placeholder = () => (
  <div style={ink}>
    <div style={{ display: "grid", gap: 6 }}>
      <Label htmlFor="backend">Vector backend</Label>
      <Select>
        <SelectTrigger id="backend">
          <SelectValue placeholder="Select a backend" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="CPU">CPU (authoritative)</SelectItem>
          <SelectItem value="WebGPU">WebGPU (experimental)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

/** `size="sm"` — the compact trigger used in toolbars and inline filters. */
export const Small = () => (
  <div style={ink}>
    <div style={{ display: "grid", gap: 6 }}>
      <Label htmlFor="scope">Retrieval scope</Label>
      <Select defaultValue="All segments">
        <SelectTrigger id="scope" size="sm">
          <SelectValue placeholder="Select a scope" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All segments">All segments</SelectItem>
          <SelectItem value="Latest snapshot">Latest snapshot</SelectItem>
          <SelectItem value="Block memory">Block memory only</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);
