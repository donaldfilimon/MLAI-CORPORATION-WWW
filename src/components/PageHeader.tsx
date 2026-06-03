import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  tag?: string;
  title: string;
  subtitle?: string;
  className?: string;
  align?: 'left' | 'center';
  id?: string;
}

export const PageHeader = ({ 
  tag, 
  title, 
  subtitle, 
  className,
  align = 'left',
  id
}: PageHeaderProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={cn(
      "space-y-6 mb-16",
      align === 'center' ? "text-center flex flex-col items-center" : "text-left",
      className
    )}>
      {tag && (
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? undefined : { duration: 0.5 }}
        >
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-4 py-1 uppercase tracking-widest text-[10px] font-bold">
            {tag}
          </Badge>
        </motion.div>
      )}
      
      <motion.h1
        id={id}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? undefined : { duration: 0.5, delay: 0.1 }}
        className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight leading-[1.1]"
      >
        {title}
      </motion.h1>
      
      {subtitle && (
        <motion.p
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? undefined : { duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-text-dim max-w-2xl leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};
