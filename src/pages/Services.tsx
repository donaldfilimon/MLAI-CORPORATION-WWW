import { motion, useReducedMotion } from "framer-motion";
import {
  Cpu,
  Network,
  Database,
  Layers,
  BarChart3,
  Lock,
  Globe,
  Shield,
  Code,
  CheckCircle2,
} from "lucide-react";
import { content } from "../data";
import { useUI } from "../lib/ui-context";
import { PageHeader } from "@/components/PageHeader";
import { CardGrid } from "@/components/CardGrid";
import { Card, CardContent } from "@/components/ui";

const icons = [
  <Cpu className="w-7 h-7 text-indigo-400" />,
  <Network className="w-7 h-7 text-indigo-400" />,
  <Database className="w-7 h-7 text-indigo-400" />,
  <Layers className="w-7 h-7 text-indigo-400" />,
  <BarChart3 className="w-7 h-7 text-indigo-400" />,
  <Lock className="w-7 h-7 text-indigo-400" />,
  <Globe className="w-7 h-7 text-indigo-400" />,
  <Shield className="w-7 h-7 text-indigo-400" />,
  <Code className="w-7 h-7 text-indigo-400" />,
];

export const Services = () => {
  const { openInquiry } = useUI();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="services"
      className="py-24 relative overflow-hidden font-sans"
      aria-labelledby="services-heading"
    >
      <div className="container-custom">
        <PageHeader
          id="services-heading"
          tag="WHAT WE OFFER"
          title="Core Services"
          subtitle="Audit, design, build, and harden AI systems that need traceability, private deployment options, and operational control."
          align="center"
        />

        <CardGrid cols={3}>
          {content.services.map((service, i) => {
            const motionProps = shouldReduceMotion
              ? { initial: false }
              : {
                  initial: { opacity: 0, scale: 0.95 },
                  whileInView: { opacity: 1, scale: 1 },
                  transition: { delay: i * 0.08 },
                };

            return (
              <motion.div
                key={service.title}
                viewport={{ once: true }}
                className="h-full"
                {...motionProps}
              >
                <Card
                  variant="glass"
                  className="group relative overflow-hidden h-full flex flex-col justify-between p-0"
                >
                  <CardContent className="p-8">
                    <div
                      className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-all"
                      aria-hidden="true"
                    >
                      {icons[i]}
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors mb-3">
                      {service.title}
                    </h3>
                    <p className="text-text-dim leading-relaxed text-sm mb-6">
                      {service.description}
                    </p>
                    <div className="space-y-2 mb-6">
                      {service.outcomes.map((outcome) => (
                        <div
                          key={outcome}
                          className="flex items-center gap-2 text-xs text-text-dim"
                        >
                          <CheckCircle2
                            className="h-3.5 w-3.5 shrink-0 text-indigo-400"
                            aria-hidden="true"
                          />
                          <span>{outcome}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <div className="mt-auto p-6 border-t border-white/5 bg-white/[0.02]">
                    <button
                      onClick={openInquiry}
                      className="text-sm font-semibold text-indigo-400 flex items-center gap-2 hover:gap-3 transition-all opacity-85 group-hover:opacity-100 cursor-pointer"
                    >
                      Discuss Service{" "}
                      <span className="text-lg leading-none" aria-hidden="true">
                        →
                      </span>
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </CardGrid>
      </div>
    </section>
  );
};
