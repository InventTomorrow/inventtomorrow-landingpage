import { motion, type Variants } from 'motion/react';

type CurvedArrowVariant = 'sweep' | 'down';

interface CurvedArrowProps {
  // 'sweep' arcs sideways and lands downward (wide screens); 'down' is a short bend between stacked cards
  variant: CurvedArrowVariant;
  className?: string;
  // Seconds to wait before it starts drawing
  delay?: number;
}

const SHAPES: Record<CurvedArrowVariant, { viewBox: string; line: string; head: string; dot: { cx: number; cy: number } }> = {
  sweep: {
    viewBox: '0 0 240 160',
    line: 'M 6 34 C 92 -8, 206 20, 206 128',
    head: 'M 192 112 L 206 132 L 222 114',
    dot: { cx: 6, cy: 34 },
  },
  down: {
    viewBox: '0 0 80 110',
    line: 'M 40 6 C 0 32, 40 62, 40 98',
    head: 'M 28 84 L 40 102 L 52 84',
    dot: { cx: 40, cy: 6 },
  },
};

const DRAW_SECONDS = 0.9;
const HEAD_FADE_SECONDS = 0.3;

// A hand-off arrow that draws itself from its start dot to its head as it scrolls into view.
export function CurvedArrow({ variant, className, delay = 0.5 }: CurvedArrowProps) {
  const shape = SHAPES[variant];
  const line: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    shown: { pathLength: 1, opacity: 1, transition: { delay, duration: DRAW_SECONDS, ease: [0.65, 0, 0.35, 1], opacity: { delay, duration: 0.05 } } },
  };
  const dot: Variants = {
    hidden: { opacity: 0, scale: 0 },
    shown: { opacity: 1, scale: 1, transition: { delay, duration: 0.3 } },
  };
  const head: Variants = {
    hidden: { opacity: 0 },
    shown: { opacity: 1, transition: { delay: delay + DRAW_SECONDS - 0.1, duration: HEAD_FADE_SECONDS } },
  };

  return (
    <motion.svg
      viewBox={shape.viewBox}
      fill="none"
      className={`text-accent ${className ?? ''}`}
      initial="hidden"
      whileInView="shown"
      viewport={{ amount: 0.6 }}
      aria-hidden="true"
    >
      <motion.circle cx={shape.dot.cx} cy={shape.dot.cy} r={5} fill="currentColor" variants={dot} style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
      <motion.path d={shape.line} stroke="currentColor" strokeWidth={3} strokeLinecap="round" variants={line} />
      <motion.path d={shape.head} stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" variants={head} />
    </motion.svg>
  );
}
