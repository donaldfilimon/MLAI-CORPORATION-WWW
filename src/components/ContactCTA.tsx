import { m } from "framer-motion";
import { MessageSquare, ArrowRight, Shield } from "lucide-react";
import { Magnetic } from "./Magnetic";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const ContactCTA = ({
  onOpenInquiry,
}: {
  onOpenInquiry: () => void;
}) => {
  return (
    <section id="contact" className="section-y relative overflow-hidden">
      <div className="bg-orb w-[800px] h-[800px] bg-indigo-500/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="container-custom relative z-10">
        <Card className="max-w-5xl mx-auto p-12 md:p-20 text-center border-indigo-500/10 relative overflow-hidden bg-surface/50">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-sky-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-indigo-500/20">
              <MessageSquare className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
              Ready to evolve your <br />
              AI infrastructure?
            </h2>
            <p className="text-lg text-text-dim mb-4 max-w-2xl mx-auto leading-relaxed">
              Our research analysts will review your requirements and provide a
              customized orchestration roadmap tailored for your organization's
              specific challenges.
            </p>
            <p className="text-xs text-text-dim/60 mb-10 flex items-center justify-center gap-2">
              <Shield className="w-3.5 h-3.5" aria-hidden="true" />
              All inquiries are protected under NDA by default
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Magnetic>
                <Button
                  onClick={onOpenInquiry}
                  className="flex items-center gap-2 px-10 py-7 text-lg"
                >
                  Start an Inquiry <ArrowRight className="w-5 h-5" />
                </Button>
              </Magnetic>
              <Magnetic>
                <Button variant="outline" className="px-8 py-7 text-sm">
                  Schedule a Framework Deep-Dive
                </Button>
              </Magnetic>
            </div>
          </m.div>
        </Card>
      </div>
    </section>
  );
};
