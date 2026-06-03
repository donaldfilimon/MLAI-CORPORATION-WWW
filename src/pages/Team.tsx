import React from 'react';
import { motion } from 'framer-motion';
import { Users, ExternalLink } from 'lucide-react';
import { content } from '../data';
import { Button, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { CardGrid } from '@/components/CardGrid';

export const Team = () => {
  return (
    <section id="team" className="py-24 bg-surface/20 relative noise-overlay" aria-labelledby="team-heading">
      <div className="container-custom relative z-10">
        <PageHeader 
          id="team-heading"
          tag="LEADERSHIP"
          title="The Minds Behind MLAI."
          subtitle="Our multidisciplinary team of researchers and engineers is dedicated to the safe, scalable advancement of machine intelligence."
        />

        <CardGrid cols={3} className="gap-8">
          {content.team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="group relative bg-transparent border-0 overflow-visible shadow-none">
                <div className="p-0">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-5">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      loading="lazy"
                      className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent opacity-70" />
                    
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{member.name}</h3>
                  <div className="text-blue-400 font-mono text-[10px] uppercase tracking-[0.15em] mb-3">{member.role}</div>
                  <p className="text-sm text-text-dim leading-relaxed">{member.bio}</p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Join Us Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: content.team.length * 0.1 }}
          >
            <Card variant="glass" className="h-full border border-dashed border-blue-500/20 bg-blue-500/5 flex flex-col items-center justify-center p-12 text-center group hover:bg-blue-500/10 hover:border-blue-500/30 transition-all duration-500">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Join the Mission</h3>
              <p className="text-sm text-text-dim mb-6">We're always looking for exceptional minds in neural research and systems safety.</p>
              <Button 
                variant="ghost"
                onClick={() => (window.location.href = 'mailto:careers@mlai-corp.com')}
                className="text-xs font-mono uppercase tracking-[0.2em] text-blue-400 hover:text-white transition-colors flex items-center gap-2"
              >
                View Openings <ExternalLink className="w-3 h-3" />
              </Button>
            </Card>
          </motion.div>
        </CardGrid>
      </div>
    </section>
  );
};
