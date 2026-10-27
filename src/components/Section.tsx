import { ReactNode } from 'react';

const BACKGROUNDS = {
  paper: 'bg-paper',
  stone: 'bg-stone',
  mist: 'bg-mist',
};

interface SectionProps {
  bg?: keyof typeof BACKGROUNDS;
  id?: string;
  width?: string; // max width of the content column
  className?: string;
  children: ReactNode;
}

// A full-width band with the site's standard spacing. Pages alternate paper / stone / mist.
export function Section({ bg = 'paper', id, width = 'max-w-6xl', className = '', children }: SectionProps) {
  return (
    <section
      id={id}
      className={`relative z-10 w-full border-t border-ink/[0.06] px-6 py-24 sm:px-12 sm:py-32 ${BACKGROUNDS[bg]} ${className}`}
    >
      <div className={`mx-auto ${width}`}>{children}</div>
    </section>
  );
}
