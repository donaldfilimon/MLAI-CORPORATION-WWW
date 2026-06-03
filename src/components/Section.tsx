import React from 'react';
import { Reveal } from './Reveal';

interface SectionProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  bgClass?: string;
  ariaLabel?: string;
}

export const Section = ({ id, children, className = '', bgClass = '', ariaLabel }: SectionProps) => {
  return (
    <section id={id} className={`py-24 relative overflow-hidden ${bgClass} ${className}`} aria-label={ariaLabel || id}>
      <Reveal width="100%">
        <div className="container-custom relative z-10">
          {children}
        </div>
      </Reveal>
    </section>
  );
};
