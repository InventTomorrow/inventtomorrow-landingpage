import { motion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';

const STRIKE_DELAY_SECONDS = 0.25;

const strikeVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  shown: {
    pathLength: 1,
    opacity: 1,
    transition: { delay: STRIKE_DELAY_SECONDS, duration: 0.35, ease: [0.65, 0, 0.35, 1], opacity: { delay: STRIKE_DELAY_SECONDS, duration: 0.05 } },
  },
};

// Text with a wavy line drawn through it. It has to sit inside a motion parent that switches between "hidden" and "shown".
export function StruckText({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block">
      {children}
      <svg
        className="pointer-events-none absolute -inset-x-1 top-[58%] h-[0.9em] w-[calc(100%+0.5rem)] -translate-y-1/2 overflow-visible text-ink/35"
        viewBox="0 0 200 12"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <motion.path d="M 0 6 C 22 3, 38 9, 62 6 S 108 3, 130 6 S 176 9, 200 5" variants={strikeVariants} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      </svg>
    </span>
  );
}
