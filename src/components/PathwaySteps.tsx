import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { Check, type LucideIcon } from 'lucide-react';
import { FadeUp } from './FadeUp';
import { useStepPath } from '../hooks/useStepPath';
import { buildZigzagPath, getPathFractions } from '../utils/zigzagPath';

export interface PathwayStep {
  title: string;
  text: string;
  icon: LucideIcon;
  // Small label above the title, e.g. "Step 01 / 06"
  eyebrow: string;
  points?: string[];
  note?: string;
  scene?: ComponentType;
}

// The road runs a little past the first and last marker so it doesn't start or stop at a circle.
const ROAD_LEAD_PX = 32;

interface PathwayStepsProps {
  steps: PathwayStep[];
}

// A winding road from top to bottom, with each step in a card beside its marker. Wide screens swing the road left
// and right; phones and tablets keep it straight down the left edge. The road fills in as the visitor scrolls.
export function PathwaySteps({ steps }: PathwayStepsProps) {
  const { containerRef, markerRefs, layout } = useStepPath(steps.length);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start 75%', 'end 55%'] });
  const lineOpacity = useTransform(scrollYProgress, [0, 0.005], [0, 1]);
  const [reachedCount, setReachedCount] = useState(0);

  const roadPoints = useMemo(() => {
    const { points } = layout;
    if (points.length !== steps.length || points.length === 0) return [];
    const first = points[0];
    const last = points[points.length - 1];
    return [{ x: first.x, y: first.y - ROAD_LEAD_PX }, ...points, { x: last.x, y: last.y + ROAD_LEAD_PX }];
  }, [layout, steps.length]);
  const road = useMemo(() => buildZigzagPath(roadPoints), [roadPoints]);
  const fractions = useMemo(() => getPathFractions(roadPoints), [roadPoints]);

  const countReached = (progress: number) => steps.filter((_, index) => (fractions[index + 1] ?? 1) <= progress).length;
  useMotionValueEvent(scrollYProgress, 'change', (value) => setReachedCount(countReached(value)));
  useEffect(() => {
    setReachedCount(countReached(scrollYProgress.get()));
    // Re-check when the road changes shape.
  }, [fractions]);

  const shownCount = reduceMotion ? steps.length : reachedCount;

  return (
    <ol ref={containerRef} className="relative mt-14 pb-2">
      {road && (
        <svg
          className="pointer-events-none absolute left-0 top-0 overflow-visible"
          width={layout.width}
          height={layout.height}
          aria-hidden="true"
        >
          <path d={road} className="fill-none stroke-accent-soft" strokeWidth={16} strokeLinecap="round" />
          <path d={road} className="fill-none stroke-white" strokeWidth={2} strokeLinecap="round" strokeDasharray="2 9" />
          <motion.path
            d={road}
            className="fill-none stroke-accent"
            strokeWidth={4}
            strokeLinecap="round"
            style={{ pathLength: reduceMotion ? 1 : scrollYProgress, opacity: reduceMotion ? 1 : lineOpacity }}
          />
        </svg>
      )}

      {steps.map((step, index) => {
        const Icon = step.icon;
        const Scene = step.scene;
        const isLeft = index % 2 === 0;
        const isReached = index < shownCount;
        return (
          <li
            key={step.title}
            className={`relative pb-10 pl-20 last:pb-0 lg:flex lg:pb-16 lg:pl-0 lg:last:pb-0 ${isLeft ? 'lg:justify-start' : 'lg:justify-end'}`}
          >
            <span
              ref={(element) => {
                markerRefs.current[index] = element;
              }}
              className={`absolute left-0 top-3 z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 transition-colors duration-500 lg:-translate-x-1/2 ${
                isLeft ? 'lg:left-[41%]' : 'lg:left-[59%]'
              } ${isReached ? 'border-accent bg-accent text-white shadow-pop' : 'border-ink/15 bg-white text-accent'}`}
            >
              <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
            </span>

            <FadeUp delay={0.05} y={20} className="relative lg:w-[36%]">
              <div
                className={`relative rounded-3xl border bg-white p-6 shadow-card transition-[border-color] duration-500 sm:p-7 ${
                  isReached ? 'border-accent/30' : 'border-ink/[0.08]'
                }`}
              >
                {/* Points at the marker: left on phones and for right-hand cards, right for left-hand cards */}
                <span
                  className={`absolute -left-1.5 top-[2.125rem] h-3 w-3 rotate-45 border-b border-l bg-white transition-[border-color] duration-500 ${
                    isReached ? 'border-accent/30' : 'border-ink/[0.08]'
                  } ${isLeft ? 'lg:hidden' : ''}`}
                  aria-hidden="true"
                />
                {isLeft && (
                  <span
                    className={`absolute -right-1.5 top-[2.125rem] hidden h-3 w-3 rotate-45 border-r border-t bg-white transition-[border-color] duration-500 lg:block ${
                      isReached ? 'border-accent/30' : 'border-ink/[0.08]'
                    }`}
                    aria-hidden="true"
                  />
                )}

                {Scene && (
                  <div className="-mx-2 -mt-2 mb-5 h-28 overflow-hidden rounded-2xl bg-gradient-to-b from-accent-soft/70 to-transparent">
                    <Scene />
                  </div>
                )}
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{step.eyebrow}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">{step.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{step.text}</p>

                {step.points && (
                  <ul className="mt-5 space-y-3 border-t border-ink/[0.07] pt-5">
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

                {step.note && (
                  <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-ink/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {step.note}
                  </span>
                )}
              </div>
            </FadeUp>
          </li>
        );
      })}
    </ol>
  );
}
