import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, GitBranch, GraduationCap, Layers3 } from "lucide-react";
import { Button, Card, CardContent, Separator } from "@/components/ui";
import { content } from "@/data";
import { PageHeader } from "@/components/PageHeader";
import { CardGrid } from "@/components/CardGrid";
import { useUI } from "@/lib/ui-context";

const tagColors: Record<string, string> = {
  "CORE ARCHITECTURE": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "ETHICS & SAFETY": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  SCALABILITY: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  ENGINEERING: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  RESEARCH: "text-rose-400 bg-rose-500/10 border-rose-400/20",
  SAFETY: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
};

export const Research = () => {
  const publications = content.research.publications;
  const shouldReduceMotion = useReducedMotion();
  const { openInquiry } = useUI();

  return (
    <section
      id="research"
      className="min-h-screen py-24 bg-bg relative overflow-hidden font-sans"
      aria-labelledby="research-heading"
    >
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/10 to-transparent -z-10" />
      <div className="container-custom">
        <PageHeader
          id="research-heading"
          tag="DYNAMIC RESEARCH ARCHIVE"
          title="Applied research for accountable autonomy."
          subtitle="Architecture notes, safety memos, and engineering studies behind traceable retrieval, controlled agent workflows, and private deployment paths."
        />

        <CardGrid cols={3} className="mb-16">
          {content.research.tracks.map((track, index) => (
            <Card key={track.name} variant="glass" className="p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                {index === 0 ? (
                  <GitBranch className="h-5 w-5" />
                ) : index === 1 ? (
                  <Layers3 className="h-5 w-5" />
                ) : (
                  <GraduationCap className="h-5 w-5" />
                )}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {track.name}
              </h3>
              <p className="text-sm leading-relaxed text-text-dim">
                {track.description}
              </p>
            </Card>
          ))}
        </CardGrid>

        <div className="grid gap-6">
          {publications.map((item, i) => {
            const motionProps = shouldReduceMotion
              ? { initial: false }
              : {
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  transition: { delay: i * 0.05 },
                };

            return (
              <motion.div
                key={item.title}
                viewport={{ once: true }}
                {...motionProps}
              >
                <Card
                  variant="glass"
                  className="group flex flex-col justify-between hover:border-blue-500/20 transition-all duration-300 p-0 overflow-hidden"
                >
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <span
                        className={`text-[10px] font-mono font-bold tracking-[0.2em] px-2 py-0.5 rounded-sm uppercase ${tagColors[item.tag] || "text-blue-400 bg-blue-500/10"}`}
                      >
                        {item.tag}
                      </span>
                      <Separator
                        orientation="vertical"
                        className="h-3 bg-white/20"
                      />
                      <span className="text-[10px] font-mono text-text-dim/60 uppercase tracking-widest">
                        {item.date}
                      </span>
                    </div>
                    <h3 className="text-2xl font-display font-bold text-white group-hover:text-blue-400 transition-colors leading-tight mb-4">
                      {item.title}
                    </h3>
                    <p className="text-sm md:text-base text-text-dim leading-relaxed mb-6">
                      {item.abstract}
                    </p>
                  </CardContent>
                  <div className="px-8 py-4 border-t border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <span className="text-xs font-mono text-text-dim/40 uppercase tracking-widest">
                      {item.readTime}
                    </span>
                    <Button
                      type="button"
                      variant="link"
                      onClick={openInquiry}
                      className="text-white group-hover:text-blue-400 p-0 h-auto font-bold uppercase tracking-widest text-xs gap-2 transition-all cursor-pointer"
                    >
                      Request Paper{" "}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
