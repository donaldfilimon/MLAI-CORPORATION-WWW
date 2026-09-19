import { Textarea, Label } from "mlai-corporation-www";

/**
 * Lab ink canvas. Textarea is `bg-transparent` with no text-color class, so both
 * the typed value and the surrounding label inherit — the ground supplies
 * `color`, matching `<body className="text-text">` in the real app.
 */
const ink = {
  background: "#05070d",
  padding: 28,
  borderRadius: 12,
  color: "var(--foreground)",
  fontFamily: "var(--font-sans)",
  maxWidth: 400,
} as const;

/** Empty: the placeholder renders in `--muted-foreground`. */
export const Default = () => (
  <div style={ink}>
    <Textarea placeholder="Ask Abbey…" />
  </div>
);

/** Labelled and filled — the shape it takes in a console form. */
export const WithLabel = () => (
  <div style={ink}>
    <div style={{ display: "grid", gap: 6 }}>
      <Label htmlFor="q">Query</Label>
      <Textarea
        id="q"
        rows={3}
        defaultValue="Summarize the last three audit blocks covering WDBX segment replay."
      />
    </div>
  </div>
);

/** `disabled` — reduced opacity and a filled track; not focusable. */
export const Disabled = () => (
  <div style={ink}>
    <div style={{ display: "grid", gap: 6 }}>
      <Label htmlFor="frozen">Snapshot note</Label>
      <Textarea
        id="frozen"
        rows={3}
        disabled
        defaultValue="Read-only — this snapshot was loaded with --load-db and cannot be edited."
      />
    </div>
  </div>
);
