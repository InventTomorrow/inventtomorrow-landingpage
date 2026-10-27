import { useEffect, useRef, useState, type FocusEvent } from 'react';
import { animate, motion, useInView, useMotionValue, useReducedMotion, type PanInfo } from 'motion/react';
import { Search, PenLine, Coffee, ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { FadeUp } from './FadeUp';
import { CtaButton } from './CtaButton';

interface Step {
  title: string;
  description: string;
  note: string;
  icon: LucideIcon;
}

const STEPS: Step[] = [
  {
    title: 'We find the leaks',
    description: 'We contact your business like a customer would and show you where jobs slip away.',
    note: 'Free · 15-minute call',
    icon: Search,
  },
  {
    title: 'We build your system',
    description: 'We write every message in your voice and connect it to the tools you already use.',
    note: 'You approve every message',
    icon: PenLine,
  },
  {
    title: 'You get back to work',
    description: 'Calls, quotes and rebooking are handled every day. You just see the results.',
    note: 'Runs every day',
    icon: Coffee,
  },
];

const COUNT = STEPS.length;
const AUTO_SECONDS = 3.5;

// -1 = left, 0 = centre, 1 = right
function slotOf(index: number, active: number) {
  return ((index - active + COUNT + 1) % COUNT) - 1;
}

interface HowItWorksSectionProps {
  onOpenAudit?: () => void;
}

export function HowItWorksSection({ onOpenAudit }: HowItWorksSectionProps) {
  const [active, setActive] = useState(0);
  // The card that jumps from one side to the other during the current move (it travels behind the centre).
  const [wrapIndex, setWrapIndex] = useState<number | null>(null);
  // Pause only while the visitor is reading the centre card, or tabbing through the controls by keyboard.
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { amount: 0.5 });
  const reduceMotion = useReducedMotion();
  const progress = useMotionValue(0);
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);

  const go = (dir: 1 | -1) => {
    setWrapIndex(dir === 1 ? (active - 1 + COUNT) % COUNT : (active + 1) % COUNT);
    setActive((active + dir + COUNT) % COUNT);
  };

  const goTo = (index: number) => {
    if (index === active) return;
    go((index - active + COUNT) % COUNT === 1 ? 1 : -1);
  };

  useEffect(() => {
    if (wrapIndex === null) return;
    const t = window.setTimeout(() => setWrapIndex(null), 700);
    return () => window.clearTimeout(t);
  }, [wrapIndex, active]);

  // Auto-advance: the active dot fills up, then the next card slides to the centre.
  useEffect(() => {
    if (reduceMotion) {
      progress.set(1);
      return;
    }
    progress.set(0);
    const controls = animate(progress, 1, { duration: AUTO_SECONDS, ease: 'linear', onComplete: () => go(1) });
    controlsRef.current = controls;
    return () => controls.stop();
    // `go` reads the current `active`, which is already a dependency.
  }, [active, reduceMotion, progress]);

  const paused = hoveredIndex === active || keyboardFocus || !inView;
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (paused) controls.pause();
    else controls.play();
  }, [paused, active]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) go(1);
    else if (info.offset.x > 60) go(-1);
  };

  const onFocus = (e: FocusEvent<HTMLDivElement>) => setKeyboardFocus(e.target.matches(':focus-visible'));

  return (
    <section
      id="how-it-works"
      className="relative z-10 w-full overflow-hidden border-t border-ink/[0.06] bg-mist px-6 py-24 sm:px-12 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="How it works" title="Three steps. We do the heavy lifting." />

        <motion.div
          className="mt-12"
          onFocus={onFocus}
          onBlur={() => setKeyboardFocus(false)}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            ref={stageRef}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={onDragEnd}
            className="relative h-[23.75rem] cursor-grab active:cursor-grabbing"
            aria-roledescription="carousel"
            aria-label="How it works"
          >
            {STEPS.map((step, i) => {
              const slot = slotOf(i, active);
              const centre = slot === 0;
              const wrapping = wrapIndex === i;
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  className="absolute inset-x-0 top-8 mx-auto w-[min(23.75rem,80vw)]"
                  style={{ zIndex: centre ? 3 : wrapping ? 0 : 1 }}
                  initial={false}
                  animate={{
                    x: `${slot * 106}%`,
                    y: centre ? '-0.75rem' : '0.625rem',
                    scale: centre ? 1 : 0.86,
                    opacity: wrapping ? [0.5, 0, 0.5] : centre ? 1 : 0.5,
                  }}
                  transition={{ type: 'spring', bounce: 0.15, visualDuration: 0.6, opacity: { duration: 0.6 } }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex((h) => (h === i ? null : h))}
                  aria-hidden={!centre}
                  role="group"
                  aria-label={`Step ${i + 1} of ${COUNT}`}
                >
                  {/* Soft shadow pool under the lifted card */}
                  <motion.div
                    className="absolute inset-x-10 -bottom-8 h-16 rounded-full bg-ink/25 blur-2xl"
                    initial={false}
                    animate={{ opacity: centre ? 1 : 0, scaleX: centre ? 1 : 0.6 }}
                    transition={{ duration: 0.5 }}
                    aria-hidden="true"
                  />
                  <div
                    className={`spotlight relative flex h-[18.75rem] flex-col rounded-3xl border bg-white p-8 transition-[border-color,box-shadow] duration-500 ${
                      centre
                        ? 'border-accent/25 shadow-[0_30px_60px_-30px_rgba(15,27,45,0.45)]'
                        : 'border-ink/[0.08] shadow-none'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-500 ${
                          centre ? 'bg-accent text-white' : 'bg-accent-soft text-accent'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-5xl font-bold leading-none tracking-tight text-ink/[0.08] tabular-nums">
                        0{i + 1}
                      </span>
                    </div>
                    <h3 className="mt-7 text-xl font-semibold tracking-tight text-ink">{step.title}</h3>
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{step.description}</p>
                    <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-ink/70">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {step.note}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="mt-6 flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous step"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-white text-ink transition-colors hover:border-[#626262]/40 hover:bg-[#f1f1f1] cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              {STEPS.map((step, i) => (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to step ${i + 1}: ${step.title}`}
                  aria-current={active === i ? 'step' : undefined}
                  className="flex h-6 items-center cursor-pointer"
                >
                  {/* The active dot doubles as a timer: it fills up until the next card moves in */}
                  <motion.span
                    className="relative block h-2 overflow-hidden rounded-full bg-ink/20"
                    initial={false}
                    animate={{ width: active === i ? '2.5rem' : '0.5rem' }}
                    transition={{ duration: 0.3 }}
                  >
                    {active === i && (
                      <motion.span className="absolute inset-0 origin-left bg-accent" style={{ scaleX: progress }} />
                    )}
                  </motion.span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next step"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-white text-ink transition-colors hover:border-[#626262]/40 hover:bg-[#f1f1f1] cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        <FadeUp delay={0.2} y={16} className="mt-12 flex justify-center">
          <CtaButton onClick={onOpenAudit}>Get my free audit</CtaButton>
        </FadeUp>
      </div>
    </section>
  );
}
