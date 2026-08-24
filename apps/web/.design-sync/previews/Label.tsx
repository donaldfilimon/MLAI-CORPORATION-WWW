import { Label, Input, Textarea } from "mlai-corporation-www";

/**
 * The Lab ink canvas these primitives are designed for.
 *
 * Note the extra `color`: unlike the `site/` blocks, the form primitives
 * (Label, Input, Textarea, SelectTrigger, TabsContent) carry **no** text-color
 * class of their own — they inherit. The preview harness body sets no `color`,
 * so without this the label renders black-on-ink, i.e. invisible. `--foreground`
 * reproduces what `<body className="text-text">` does in the real app.
 */
const ink = {
  background: "#05070d",
  padding: 28,
  borderRadius: 12,
  color: "var(--foreground)",
  fontFamily: "var(--font-sans)",
  maxWidth: 340,
} as const;

/** The base pairing: a label bound to an Input by `htmlFor`/`id`. */
export const WithInput = () => (
  <div style={ink}>
    <div style={{ display: "grid", gap: 6 }}>
      <Label htmlFor="persona">Routing persona</Label>
      <Input id="persona" defaultValue="Abbey" />
    </div>
  </div>
);

/**
 * Label is `flex items-center gap-2`, so a trailing hint composes onto the same
 * row without extra layout — the idiomatic place for a format or unit note.
 */
export const WithHint = () => (
  <div style={ink}>
    <div style={{ display: "grid", gap: 6 }}>
      <Label htmlFor="store">
        Store segment
        <span
          style={{
            fontSize: 11,
            fontWeight: 400,
            color: "var(--muted-foreground)",
            fontFamily: "var(--font-mono)",
          }}
        >
          append-only JSONL
        </span>
      </Label>
      <Input id="store" defaultValue="~/.abi/wdbx.seg.0.jsonl" />
    </div>
  </div>
);

/** The same contract against a multi-line control. */
export const WithTextarea = () => (
  <div style={ink}>
    <div style={{ display: "grid", gap: 6 }}>
      <Label htmlFor="pack">Context pack notes</Label>
      <Textarea
        id="pack"
        rows={3}
        defaultValue="Pin the hash-chained audit blocks from this session into the retrieval pack."
      />
    </div>
  </div>
);
