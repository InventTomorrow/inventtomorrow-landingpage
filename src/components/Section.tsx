import { ReactNode } from 'react';
import { GraphicShape } from './GraphicShape';

const BACKGROUNDS = {
  paper: 'bg-paper',
  stone: 'bg-fade-stone',
  soft: 'bg-hero-soft',
};

interface SectionProps {
  bg?: keyof typeof BACKGROUNDS;
  id?: string;
  width?: string; // max width of the content column
  className?: string;
  children: ReactNode;
}

// A full-width band with the site's standard spacing. Pages alternate paper / stone; step sections use soft.
export function Section({ bg = 'paper', id, width = 'max-w-6xl', className = '', children }: SectionProps) {
  return (
    <section
      id={id}
      className={`relative z-10 w-full border-t border-border section-y px-6 sm:px-12 ${BACKGROUNDS[bg]} ${className}`}
    >
      <GraphicShape name="dots-grid" className="right-[6%] top-12 hidden h-14 w-14 opacity-60 xl:block" />
      <div className={`mx-auto ${width}`}>{children}</div>
    </section>
  );
}
