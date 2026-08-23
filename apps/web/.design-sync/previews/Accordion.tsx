import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "mlai-corporation-www";

/**
 * Dark-only DS: the item divider is `border-b` on the token border color and the trigger
 * text is `text-foreground` — both disappear on a white ground, so every cell renders on
 * the Lab ink canvas. maxWidth = the old 420 measure + the 28px ink padding on each side.
 */
const ink = { background: "#05070d", padding: 28, borderRadius: 12, maxWidth: 476 };

export const Faq = () => (
  <div style={ink}>
    <Accordion defaultValue={["item-0"]}>
      <AccordionItem value="item-0">
        <AccordionTrigger>What is WDBX?</AccordionTrigger>
        <AccordionContent>A durable vector and block memory store with append-only JSONL persistence.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-1">
        <AccordionTrigger>What does ABI do?</AccordionTrigger>
        <AccordionContent>Query planning and context-pack orchestration around WDBX.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Who are the personas?</AccordionTrigger>
        <AccordionContent>Abbey, Aviva, and Abi — routed by the Abbey persona layer.</AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);

export const Multiple = () => (
  <div style={ink}>
    <Accordion multiple defaultValue={["durability", "audit"]}>
      <AccordionItem value="durability">
        <AccordionTrigger>Durability</AccordionTrigger>
        <AccordionContent>Writes append to a JSONL segment before they are acknowledged.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="audit">
        <AccordionTrigger>Audit</AccordionTrigger>
        <AccordionContent>Each block links to the previous block hash, so the log is chain-verifiable.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="isolation">
        <AccordionTrigger>Isolation</AccordionTrigger>
        <AccordionContent>Readers observe an MVCC snapshot and are never blocked by a writer.</AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);

export const Collapsed = () => (
  <div style={ink}>
    <Accordion>
      <AccordionItem value="cli">
        <AccordionTrigger>abi CLI</AccordionTrigger>
        <AccordionContent>One command surface for stores, packs, and persona routing.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="mcp">
        <AccordionTrigger>MCP server</AccordionTrigger>
        <AccordionContent>The same commands exposed to agents as MCP tools.</AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);
