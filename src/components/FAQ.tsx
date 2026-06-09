import { HelpCircle } from "lucide-react";
import { content } from "../data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQ = () => {
  return (
    <section
      id="faq"
      className="py-24 bg-bg relative"
      aria-labelledby="faq-heading"
    >
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Column */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <div
                className="flex items-center gap-2 text-indigo-400 font-mono text-sm mb-4"
                aria-hidden="true"
              >
                <HelpCircle className="w-4 h-4" />
                COMMON INQUIRIES
              </div>
              <h2 id="faq-heading" className="section-title mb-4">
                Frequently Asked Questions.
              </h2>
              <p className="text-text-dim leading-relaxed">
                Answers to the most common questions about our technology,
                framework licensing, and deployment options.
              </p>
            </div>
          </div>

          {/* Right Column — Accordion */}
          <div className="lg:col-span-8">
            <Accordion defaultValue={["item-0"]} className="w-full">
              {content.faq.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border-white/5"
                >
                  <AccordionTrigger className="text-lg font-semibold text-white hover:text-indigo-400 hover:no-underline transition-colors py-6 pr-8 text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-text-dim leading-relaxed pb-6 pr-12 text-base">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};
