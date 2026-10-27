import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { FadeUp } from './FadeUp';
import { SectionHeading } from './SectionHeading';

const STEPS = [
  { id: 'call', time: '2:14', title: 'A new customer calls.', detail: "You can't pick up. That's fine." },
  { id: 'text', time: '2:14', title: 'They get a text back.', detail: 'Within seconds, in your voice.' },
  { id: 'handled', time: '2:20', title: 'The lead is handled.', detail: 'You never stopped cleaning.' },
] as const;

const LAST = STEPS.length - 1;
const START_DELAY_MS = 300;
const STEP_MS = 1000;
const LINE_LEAD_MS = 150;

// The line between two dots starts drawing just after the first dot lights up
// and finishes exactly when the next dot lights up.
function lineTransition(drawing: boolean) {
  return drawing
    ? { duration: (STEP_MS - LINE_LEAD_MS) / 1000, delay: LINE_LEAD_MS / 1000, ease: [0.65, 0, 0.35, 1] as const }
    : { duration: 0.2 };
}

function Dot({ reached }: { reached: boolean }) {
  return (
    <span className="relative z-10 flex h-4 w-4 items-center justify-center">
      {reached && (
        <motion.span
          className="absolute inset-0 rounded-full bg-accent"
          initial={{ scale: 1, opacity: 0.4 }}
          animate={{ scale: 2.8, opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          aria-hidden="true"
        />
      )}
      <motion.span
        className={`h-4 w-4 rounded-full border-2 transition-colors duration-300 ${
          reached ? 'border-accent bg-accent' : 'border-ink/20 bg-white'
        }`}
        initial={false}
        animate={{ scale: reached ? 1 : 0.75 }}
        transition={{ type: 'spring', bounce: 0.45, visualDuration: 0.35 }}
      />
    </span>
  );
}

export function TimelineSection() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const inView = useInView(timelineRef, { amount: 0.5 });
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(-1);
  const [run, setRun] = useState(0);

  // Plays every time the timeline scrolls into view, and resets while it's off screen.
  useEffect(() => {
    if (!inView) {
      if (!reduceMotion) setActive(-1);
      return;
    }
    if (reduceMotion) {
      setActive(LAST);
      return;
    }
    setActive(-1);
    const timers = STEPS.map((_, i) => window.setTimeout(() => setActive(i), START_DELAY_MS + i * STEP_MS));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [inView, run, reduceMotion]);

  const playing = inView && active < LAST;

  return (
    <section id="stay-focused" className="relative z-10 w-full bg-paper px-6 py-24 sm:px-12 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="A typical afternoon"
          title="It's 2:14 pm. You're mid-clean."
          subtitle="Your phone rings. Here's what happens next."
        />

        <div ref={timelineRef} className="mt-16 sm:mt-20">
          {/* Desktop: horizontal */}
          <ol className="hidden md:grid grid-cols-3">
            {STEPS.map((step, i) => {
              const reached = active >= i;
              return (
                <li key={step.id} className="flex flex-col items-center text-center">
                  <span
                    className={`text-4xl font-bold tracking-tight tabular-nums transition-colors duration-500 ${
                      reached ? 'text-ink' : 'text-ink/25'
                    }`}
                  >
                    {step.time}
                  </span>

                  {/* Dot row. The connector lives in the same row, centred with top-1/2 and a
                      negative margin of half its height, so it runs through the dot centres. */}
                  <div className="relative mt-6 flex h-6 w-full items-center justify-center">
                    {i < LAST && (
                      <div className="absolute left-1/2 top-1/2 -mt-px h-0.5 w-full bg-ink/10" aria-hidden="true">
                        <motion.div
                          className="h-full w-full origin-left bg-accent"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: active >= i ? 1 : 0 }}
                          transition={lineTransition(active >= i)}
                        />
                      </div>
                    )}
                    <Dot reached={reached} />
                  </div>

                  <p
                    className={`mt-6 px-4 text-base font-semibold transition-colors duration-500 ${
                      reached ? 'text-ink' : 'text-ink/35'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p
                    className={`mt-1 px-4 text-sm transition-colors duration-500 ${
                      reached ? 'text-muted' : 'text-ink/30'
                    }`}
                  >
                    {step.detail}
                  </p>
                </li>
              );
            })}
          </ol>

          {/* Mobile: vertical. Same idea: the connector runs from this dot's centre to the next one. */}
          <ol className="mx-auto max-w-sm md:hidden">
            {STEPS.map((step, i) => {
              const reached = active >= i;
              return (
                <li key={step.id} className="relative flex gap-5 pb-10 last:pb-0">
                  {i < LAST && (
                    <div
                      className="absolute left-2 -ml-px w-0.5 bg-ink/10"
                      style={{ top: 16, bottom: -16 }}
                      aria-hidden="true"
                    >
                      <motion.div
                        className="h-full w-full origin-top bg-accent"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: active >= i ? 1 : 0 }}
                        transition={lineTransition(active >= i)}
                      />
                    </div>
                  )}
                  <div className="flex h-8 w-4 shrink-0 items-center justify-center">
                    <Dot reached={reached} />
                  </div>
                  <div className="text-left">
                    <span
                      className={`block text-2xl font-bold leading-8 tabular-nums transition-colors duration-500 ${
                        reached ? 'text-ink' : 'text-ink/25'
                      }`}
                    >
                      {step.time}
                    </span>
                    <p className={`mt-1 font-semibold transition-colors duration-500 ${reached ? 'text-ink' : 'text-ink/35'}`}>
                      {step.title}
                    </p>
                    <p className={`text-sm transition-colors duration-500 ${reached ? 'text-muted' : 'text-ink/30'}`}>
                      {step.detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <FadeUp delay={0.2} y={14} className="mt-16 flex flex-col items-center gap-6 text-center">
          <p className="text-xl sm:text-2xl font-semibold tracking-tight text-ink">
            No missed lead. <span className="text-muted font-normal">No interrupted clean.</span>
          </p>
          <button
            type="button"
            onClick={() => setRun((r) => r + 1)}
            disabled={!inView || playing}
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-xs font-medium text-muted transition-colors hover:border-ink/30 hover:text-ink disabled:opacity-40 cursor-pointer disabled:cursor-default"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Replay
          </button>
        </FadeUp>
      </div>
    </section>
  );
}
