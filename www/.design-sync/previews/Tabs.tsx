import { Tabs, TabsList, TabsTrigger, TabsContent } from "mlai-corporation-www";

/**
 * Lab ink canvas. TabsContent has no text-color class (`flex-1 text-sm`), so it
 * inherits — the ground supplies `color` or the panel copy is invisible on ink.
 */
const ink = {
  background: "#05070d",
  padding: 28,
  borderRadius: 12,
  color: "var(--foreground)",
  fontFamily: "var(--font-sans)",
  maxWidth: 460,
} as const;

const panel = {
  paddingTop: 14,
  fontSize: 13,
  lineHeight: 1.55,
  color: "var(--muted-foreground)",
} as const;

/** `variant="default"` — the segmented control on a `bg-muted` track. */
export const Default = () => (
  <div style={ink}>
    <Tabs defaultValue="wdbx">
      <TabsList>
        <TabsTrigger value="wdbx">WDBX</TabsTrigger>
        <TabsTrigger value="abi">ABI</TabsTrigger>
        <TabsTrigger value="abbey">Abbey</TabsTrigger>
      </TabsList>
      <TabsContent value="wdbx" style={panel}>
        Durable vector and block memory store. Writes append to JSONL segments and
        replay on start, so a restart lands on exactly the last committed state.
      </TabsContent>
      <TabsContent value="abi" style={panel}>
        Query planning and context-pack orchestration, exposed as one CLI and the
        same commands over MCP.
      </TabsContent>
      <TabsContent value="abbey" style={panel}>
        The persona layer — Abi routes each request to Abbey, Aviva, or a blend.
      </TabsContent>
    </Tabs>
  </div>
);

/** `variant="line"` — transparent track, active tab marked by an underline rule. */
export const Line = () => (
  <div style={ink}>
    <Tabs defaultValue="records">
      <TabsList variant="line">
        <TabsTrigger value="records">Records</TabsTrigger>
        <TabsTrigger value="blocks">Blocks</TabsTrigger>
        <TabsTrigger value="audit">Audit</TabsTrigger>
      </TabsList>
      <TabsContent value="records" style={panel}>
        Embeddings resolved by cosine distance over the loaded segments.
      </TabsContent>
      <TabsContent value="blocks" style={panel}>
        Block memory entries, addressable alongside the vector index.
      </TabsContent>
      <TabsContent value="audit" style={panel}>
        The hash-chained log — each block carries its parent hash, so the chain
        can be walked from genesis and verified.
      </TabsContent>
    </Tabs>
  </div>
);

/** `orientation="vertical"` — the list becomes a sidebar beside the panel. */
export const Vertical = () => (
  <div style={ink}>
    <Tabs orientation="vertical" defaultValue="cli">
      <TabsList>
        <TabsTrigger value="cli">CLI</TabsTrigger>
        <TabsTrigger value="mcp">MCP</TabsTrigger>
        <TabsTrigger value="lsp">LSP</TabsTrigger>
      </TabsList>
      <TabsContent value="cli" style={{ ...panel, paddingTop: 0, paddingLeft: 16 }}>
        The abi binary drives ingestion, planning, and retrieval directly.
      </TabsContent>
      <TabsContent value="mcp" style={{ ...panel, paddingTop: 0, paddingLeft: 16 }}>
        The same command surface, offered to agents as MCP tools over stdio.
      </TabsContent>
      <TabsContent value="lsp" style={{ ...panel, paddingTop: 0, paddingLeft: 16 }}>
        Editor-facing protocol surface for in-place context lookups.
      </TabsContent>
    </Tabs>
  </div>
);
