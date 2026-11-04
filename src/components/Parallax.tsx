import { m, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef, type ReactNode } from 'react';

interface ParallaxProps {
  children: ReactNode;
  // How far it drifts up or down over the scroll, in px
  distance?: number;
  className?: string;
}

// Moves its content a little slower than the page, for depth. Transform only, driven by scroll without re-rendering.
// Use it on one or two decorative or hero images, not on text.
export function Parallax({ children, distance = 30, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <m.div ref={ref} className={className} style={prefersReducedMotion ? undefined : { y }}>
      {children}
    </m.div>
  );
}
