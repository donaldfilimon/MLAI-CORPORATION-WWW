import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Newspaper, Sparkles } from 'lucide-react';
import { Button, Card, CardContent, Separator } from '@/components/ui';
import { content } from '@/data';
import { PageHeader } from '@/components/PageHeader';
import { CardGrid } from '@/components/CardGrid';
import { useUI } from '@/lib/ui-context';

export function Blog() {
  const shouldReduceMotion = useReducedMotion();
  const { openInquiry } = useUI();

  return (
    <div className="container-custom pt-32 pb-20 min-h-screen font-sans overflow-hidden" role="main" aria-labelledby="blog-heading">
      <div className="mx-auto max-w-5xl">
        <PageHeader 
          id="blog-heading"
          tag="LAB NOTES"
          title="Research notes for teams building serious AI systems."
          subtitle="Fresh thinking on retrieval, autonomy, interface design, evaluation, and the discipline required to move from experiments to reliable operations."
        />

        <CardGrid cols={3} className="mb-12">
          {['Architecture memos', 'Safety drills', 'Operator UX'].map((item) => (
            <Card key={item} variant="glass" className="p-6">
              <Sparkles className="mb-3 h-4 w-4 text-blue-400" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-white mb-2">{item}</h3>
              <p className="text-xs leading-relaxed text-text-dim">Practical context, patterns, and decision notes for production-minded AI teams.</p>
            </Card>
          ))}
        </CardGrid>

        <div className="grid gap-6">
          {content.blog.map((post, i) => (
            <motion.div
              key={post.title}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={shouldReduceMotion ? undefined : { delay: i * 0.1 }}
            >
              <Card variant="glass" className="group flex flex-col justify-between hover:border-blue-500/20 transition-all duration-300 p-0 overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-blue-400 uppercase">{post.tag}</span>
                    <Separator orientation="vertical" className="h-3 bg-white/20" />
                    <span className="text-[10px] font-mono text-text-dim/60 uppercase tracking-widest">{post.date}</span>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white group-hover:text-blue-400 transition-colors leading-tight mb-4">
                    {post.title}
                  </h3>
                  <p className="text-sm md:text-base text-text-dim leading-relaxed mb-6">
                    {post.excerpt}
                  </p>
                </CardContent>
                <div className="px-8 py-4 border-t border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <span className="text-xs font-mono text-text-dim/40 uppercase tracking-widest">{post.readTime}</span>
                  <Button type="button" variant="link" onClick={openInquiry} className="text-white group-hover:text-blue-400 p-0 h-auto font-bold uppercase tracking-widest text-xs gap-2 transition-all cursor-pointer">
                    Request Note <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
