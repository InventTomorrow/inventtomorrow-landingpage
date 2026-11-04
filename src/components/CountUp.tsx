import { animate, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

interface CountUpProps {
  value: number;
  duration?: number;
  className?: string;
}

// A number that counts up from 0 the first time it is on screen. It writes straight into the text node, so it never re-renders.
// Screen readers get the final number; reduced motion shows it straight away.
export function CountUp({ value, duration = 1.4, className }: CountUpProps) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(numberRef, { once: true, amount: 0.6 });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const element = numberRef.current;
    if (!isInView || prefersReducedMotion || !element) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        element.textContent = String(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [isInView, prefersReducedMotion, value, duration]);

  return (
    <span className={className}>
      <span className="sr-only">{value}</span>
      <span ref={numberRef} aria-hidden="true">
        {prefersReducedMotion ? value : 0}
      </span>
    </span>
  );
}
