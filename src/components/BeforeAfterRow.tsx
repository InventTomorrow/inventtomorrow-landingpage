import { Check, type LucideIcon } from 'lucide-react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { useRef } from 'react';
import { useDirectionalReveal } from '../hooks/useDirectionalReveal';
import { StruckText } from './StruckText';

interface BeforeAfterRowProps {
  icon: LucideIcon;
  before: string;
  after: string;
  // Small label above the lines, e.g. "Result"
  label?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

// One beat per line: the icon and old line appear, the old line is struck through, then the new line arrives.
const iconVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  shown: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: EASE } },
};
const beforeVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  shown: { opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.4, ease: EASE } },
};
const afterVariants: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  shown: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { delay: 1.15, duration: 0.55, ease: EASE } },
};
const checkVariants: Variants = {
  hidden: { opacity: 0, scale: 0 },
  shown: { opacity: 1, scale: 1, transition: { delay: 1.3, type: 'spring', stiffness: 500, damping: 22 } },
};

// Plays when the row is nearly all on screen and again every time it comes back into view.
export function BeforeAfterRow({ icon: Icon, before, after, label }: BeforeAfterRowProps) {
  const rowRef = useRef<HTMLLIElement>(null);
  const reduceMotion = useReducedMotion();
  const { isVisible } = useDirectionalReveal(rowRef, 0.9);

  return (
    <motion.li
      ref={rowRef}
      initial="hidden"
      animate={isVisible || reduceMotion ? 'shown' : 'hidden'}
      className="spotlight relative flex items-start gap-4 px-2 py-6 sm:items-center sm:gap-6 sm:px-5 sm:py-7"
    >
      <motion.span
        variants={iconVariants}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-drop bg-gradient-to-br from-accent-soft via-accent-soft/60 to-transparent text-accent sm:h-14 sm:w-14"
      >
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </motion.span>

      <div className="min-w-0 flex-1">
        {label && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">{label}</p>}
        <motion.p variants={beforeVariants} className="text-[0.9375rem] text-muted sm:text-base">
          <StruckText>{before}</StruckText>
        </motion.p>
        <motion.p variants={afterVariants} className="mt-1.5 flex items-start gap-2.5 text-base font-semibold text-ink sm:text-lg">
          <motion.span variants={checkVariants} className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-white">
            <Check className="h-3 w-3" strokeWidth={3} />
          </motion.span>
          {after}
        </motion.p>
      </div>

      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-ink/20 to-transparent"
        aria-hidden="true"
      />
    </motion.li>
  );
}
