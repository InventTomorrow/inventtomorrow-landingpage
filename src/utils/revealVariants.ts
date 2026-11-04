import type { Variants } from 'motion/react';

export type RevealVariant = 'up' | 'down' | 'left' | 'right' | 'zoom' | 'fade';

export type RevealState = {
  opacity: number;
  x?: number;
  y?: number;
  scale?: number;
};

const SMOOTH_EASE = [0.22, 1, 0.36, 1] as const;

// Where an element starts before it appears. Only opacity and transforms, so the browser never has to re-layout.
export function getRevealHidden(variant: RevealVariant, distance: number): RevealState {
  switch (variant) {
    case 'up':
      return { opacity: 0, y: distance };
    case 'down':
      return { opacity: 0, y: -distance };
    case 'left':
      return { opacity: 0, x: -distance };
    case 'right':
      return { opacity: 0, x: distance };
    case 'zoom':
      return { opacity: 0, scale: 0.92 };
    case 'fade':
      return { opacity: 0 };
  }
}

// The two states of a reveal ("hidden" and "shown"), ready to hand to a motion component's `variants`.
export function getRevealVariants(variant: RevealVariant, distance: number, duration: number, delay = 0): Variants {
  return {
    hidden: getRevealHidden(variant, distance),
    shown: { opacity: 1, x: 0, y: 0, scale: 1, transition: { duration, delay, ease: SMOOTH_EASE } },
  };
}
