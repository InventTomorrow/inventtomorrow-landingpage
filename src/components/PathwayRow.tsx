import { Check } from 'lucide-react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import { useRef, useState } from 'react';
import { getAlternatingStackStart } from '../utils/fanOut';
import { EmergeFromBehind } from './EmergeFromBehind';
import type { PathwayStep } from './PathwaySteps';

interface PathwayRowProps {
  step: PathwayStep;
  index: number;
  count: number;
}

// One stop on the pathway. Its marker sits on a dotted line that runs down to the next row and fills in as the visitor scrolls.
export function PathwayRow({ step, index, count }: PathwayRowProps) {
  const rowRef = useRef<HTMLLIElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: rowRef, offset: ['start 75%', 'end 75%'] });
  const [hasStarted, setHasStarted] = useState(false);
  useMotionValueEvent(scrollYProgress, 'change', (value) => setHasStarted(value > 0));

  const isReached = reduceMotion || hasStarted;
  const Icon = step.icon;
  const isLast = index === count - 1;

  return (
    <li ref={rowRef} className="spotlight relative border-t border-ink/[0.08] py-9 pl-[6.5rem] pr-6 lg:py-12 lg:pl-[8.5rem]">
      {!isLast && (
        <span
          className="pointer-events-none absolute left-[3.25rem] top-16 h-full w-0.5 -translate-x-1/2 border-l-2 border-dotted border-accent/30 lg:top-[4.75rem]"
          aria-hidden="true"
        >
          <motion.span
            className="absolute inset-y-0 -left-0.5 block w-0.5 origin-top bg-accent"
            style={{ scaleY: reduceMotion ? 1 : scrollYProgress }}
          />
        </span>
      )}

      <span
        className={`absolute left-6 top-9 z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 transition-colors duration-500 lg:top-12 ${
          isReached ? 'border-accent bg-accent text-white shadow-pop' : 'border-ink/15 bg-white text-accent'
        }`}
      >
        <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
      </span>

      <EmergeFromBehind
        start={getAlternatingStackStart(index, count)}
        innerClassName="lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-12"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{step.eyebrow}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">{step.title}</h3>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{step.text}</p>
        </div>

        {step.points && (
          <ul className="mt-5 space-y-3 lg:mt-1">
            {step.points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-ink">
                <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        )}
      </EmergeFromBehind>
    </li>
  );
}
