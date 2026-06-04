import { motion } from "framer-motion";
import { Shield, Zap, Target, Globe, Activity, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { content } from "../data";
import { Button, Card } from "@/components/ui";
import { ContactCTA } from "../components/ContactCTA";
import { useUI } from "@/lib/ui-context";
import { PageHeader } from "@/components/PageHeader";
import { CardGrid } from "@/components/CardGrid";

const icons = [
  <Shield className="w-6 h-6 text-blue-400" />,
  <Zap className="w-6 h-6 text-blue-400" />,
  <Target className="w-6 h-6 text-blue-400" />,
  <Globe className="w-6 h-6 text-blue-400" />,
  <Activity className="w-6 h-6 text-blue-400" />,
  <Users className="w-6 h-6 text-blue-400" />,
];

export const About = () => {
  const { openInquiry } = useUI();
  return (
    <section
      id="about"
      className="py-24 bg-surface/50 relative overflow-hidden noise-overlay"
      aria-labelledby="about-heading"
    >
      <div className="container-custom relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <PageHeader
              id="about-heading"
              tag="WHO WE ARE"
              title="Rooted in Research. Driven by Reliability."
              subtitle="MLAI Corporation emerged from the intersection of deep neural research and the critical need for structural AI reliability. We don't just build models — we build the foundational layers that allow models to operate safely in the most demanding environments on Earth."
              className="mb-8"
            />

            <ul
              className="space-y-4 font-mono text-sm text-blue-400/80 mb-8"
              role="list"
            >
              <li className="flex items-center gap-3">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-blue-400"
                  aria-hidden="true"
                />
                ESTABLISHED 2024 · PALO ALTO, CA
              </li>
              <li className="flex items-center gap-3">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-blue-400"
                  aria-hidden="true"
                />
                PIONEERING WDBX ARCHITECTURE
              </li>
              <li className="flex items-center gap-3">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-blue-400"
                  aria-hidden="true"
                />
                TRACEABLE RETRIEVAL AND AGENT SAFETY FOCUS
              </li>
              <li className="flex items-center gap-3">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-blue-400"
                  aria-hidden="true"
                />
                AUDIT-READY SECURITY CONTROLS
              </li>
            </ul>

            <Link to="/research">
              <Button
                variant="outline"
                className="inline-flex items-center gap-2 text-sm"
              >
                Read Our Research →
              </Button>
            </Link>
          </div>

          <div className="lg:w-1/2">
            <CardGrid cols={2} className="gap-5">
              {content.about.values.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card variant="glass" className="h-full p-6">
                    <div
                      className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4"
                      aria-hidden="true"
                    >
                      {icons[i]}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text-dim leading-relaxed">
                      {item.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </CardGrid>
          </div>
        </div>
      </div>
      <div className="container-custom mt-32 relative z-10">
        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-500/10 border border-white/10 rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 blur-[100px] -mr-48 -mt-48 group-hover:bg-blue-400/30 transition-all duration-700" />
          <div className="max-w-3xl relative z-10">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-8">
              Our Mission: <br />
              Ensuring the Safety of{" "}
              <span className="text-blue-400">Autonomous Progress.</span>
            </h2>
            <p className="text-xl text-text-dim leading-relaxed mb-10">
              As AI systems transition from generative tools to autonomous
              agents, the margin for error disappears. Our mission is to provide
              the structural integrity required for this transition, building
              the guardrails, backtrace engines, and orchestration layers that
              make autonomous intelligence a force for positive, predictable
              change.
            </p>
            <div className="flex flex-wrap gap-12">
              <div>
                <div className="text-3xl font-display font-bold text-white mb-1">
                  2024
                </div>
                <div className="text-xs font-mono uppercase tracking-widest text-blue-400">
                  Founded
                </div>
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-white mb-1">
                  100%
                </div>
                <div className="text-xs font-mono uppercase tracking-widest text-blue-400">
                  Private-First Patterns
                </div>
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-white mb-1">
                  Global
                </div>
                <div className="text-xs font-mono uppercase tracking-widest text-blue-400">
                  Research Network
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container-custom mt-20 relative z-10">
        <CardGrid cols={2} className="gap-6">
          {content.about.operatingPrinciples.map((principle) => (
            <Card
              key={principle}
              variant="glass"
              className="text-sm leading-relaxed text-text-dim p-6"
            >
              {principle}
            </Card>
          ))}
        </CardGrid>
      </div>
      <ContactCTA onOpenInquiry={openInquiry} />
    </section>
  );
};
