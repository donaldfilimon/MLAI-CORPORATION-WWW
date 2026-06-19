import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "mlai-corporation-www";

export const Faq = () => (
  <div style={{ maxWidth: 420 }}>
    <Accordion defaultValue={["item-0"]}>
      <AccordionItem value="item-0">
        <AccordionTrigger>What is WDBX?</AccordionTrigger>
        <AccordionContent>A durable vector and block memory store with JSONL persistence.</AccordionContent>
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
