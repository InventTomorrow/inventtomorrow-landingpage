import { motion, useInView } from 'motion/react';
import { ReactNode, useRef } from 'react';
import type { FanOutStart } from '../utils/fanOut';

interface EmergeFromBehindProps {
  start: FanOutStart;
  children: ReactNode;
  // The box that holds the item's place in the layout (grid cell, padding, divider lines)
  className?: string;
  // The box that slides out
  innerClassName?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

// Slides its content out from behind a neighbour as it scrolls into view, and tucks it back when it leaves.
export function EmergeFromBehind({ start, children, className, innerClassName }: EmergeFromBehindProps) {
  const holderRef = useRef<HTMLDivElement>(null);
  // Watch the holder, which never moves, so where the item starts doesn't change when it triggers.
  const isInView = useInView(holderRef, { amount: 0.3 });
  const tucked = { opacity: 0, x: `${start.fromX}%`, y: `${start.fromY}%`, scale: 0.94 };
  const placed = { opacity: 1, x: '0%', y: '0%', scale: 1 };

  return (
    <div ref={holderRef} className={className}>
      <motion.div
        initial={tucked}
        animate={isInView ? placed : tucked}
        transition={
          isInView
            ? { duration: 0.85, delay: start.delay, ease: EASE, opacity: { duration: 0.5, delay: start.delay } }
            : { duration: 0.3, ease: EASE }
        }
        style={{ position: 'relative', zIndex: start.layer }}
        className={innerClassName}
      >
        {children}
      </motion.div>
    </div>
  );
}
