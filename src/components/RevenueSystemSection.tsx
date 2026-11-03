import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, type Variants } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FIXES } from '../content/fixes';
import { useParallaxStage } from '../hooks/useParallaxStage';
import { AUDIT_PATH } from '../utils/navigation';
import { FixScenePreview, SNAPPY_TRANSITION } from './FixScenePreview';
import { SectionHeading } from './SectionHeading';
import { TextLink } from './TextLink';

// Each example plays for this long, then the next one takes over.
const SLIDE_SECONDS = 3.2;
const SLIDE_OFFSET = 40;
const tabSpring = { type: 'spring', stiffness: 460, damping: 36 } as const;

type StepDirection = 1 | -1;

// The next example comes in from below and the old one leaves upward; going back to an earlier one reverses it.
const slideVariants: Variants = {
  enter: (direction: StepDirection) => ({ opacity: 0, y: SLIDE_OFFSET * direction, scale: 0.98 }),
  center: { opacity: 1, y: 0, scale: 1 },
  exit: (direction: StepDirection) => ({ opacity: 0, y: -SLIDE_OFFSET * direction, scale: 0.98, transition: { duration: 0.12 } }),
};

interface RevenueSystemSectionProps {
  // Home page: adds a link to the full Services page
  showMoreLink?: boolean;
}

export function RevenueSystemSection({ showMoreLink = false }: RevenueSystemSectionProps) {
  const [hovered, setHovered] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.35 });
  const reduceMotion = useReducedMotion();
  const [{ active, direction }, setStep] = useState<{ active: number; direction: StepDirection }>({ active: 0, direction: 1 });
  const progress = useMotionValue(0);
  const parallax = useParallaxStage();
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);
  // Nothing plays until the section is on screen, so the first example animates in front of the visitor.
  const [started, setStarted] = useState(false);

  // Wrapping from the last example back to the first still counts as moving forward.
  const showStep = useCallback((next: number, forcedDirection?: StepDirection) => {
    setStep((current) =>
      current.active === next ? current : { active: next, direction: forcedDirection ?? (next > current.active ? 1 : -1) },
    );
  }, []);

  useEffect(() => {
    if (inView) setStarted(true);
  }, [inView]);

  // Auto-advance: fill the progress bar, then move to the next automation.
  useEffect(() => {
    progress.set(0);
    if (reduceMotion || !started) return;
    const controls = animate(progress, 1, {
      duration: SLIDE_SECONDS,
      ease: 'linear',
      onComplete: () => showStep((active + 1) % FIXES.length, 1),
    });
    controlsRef.current = controls;
    return () => controls.stop();
  }, [active, reduceMotion, progress, started, showStep]);

  // Pause while the visitor is reading (hovering) or the section is off screen.
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (hovered || !inView) controls.pause();
    else controls.play();
  }, [hovered, inView, active, started]);

  // On phones the tabs are a horizontal strip; keep the active one in view without moving the page.
  useEffect(() => {
    const strip = tabsRef.current;
    const tab = strip?.children[active] as HTMLElement | undefined;
    if (!strip || !tab || strip.scrollWidth <= strip.clientWidth) return;
    strip.scrollTo({ left: tab.offsetLeft - 24, behavior: 'smooth' });
  }, [active]);

  const current = FIXES[active];

  return (
    <section id="services" className="relative z-10 w-full border-t border-ink/[0.06] bg-fade-paper section-y px-6 sm:px-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="The system"
          title="Meet the Revenue Recovery System"
          subtitle="Seven fixes that plug every leak. We build them, write them and run them."
        />

        <motion.div
          ref={rootRef}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.15 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-10"
        >
          {/* Phone: horizontal tab strip */}
          <div
            ref={tabsRef}
            role="tablist"
            aria-label="Automations"
            className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] lg:hidden"
          >
            {FIXES.map((fix, i) => (
              <button
                key={fix.title}
                type="button"
                role="tab"
                aria-selected={active === i}
                onClick={() => showStep(i)}
                className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  active === i ? 'border-ink bg-navy text-white' : 'border-ink/15 bg-white text-ink/70'
                }`}
              >
                {fix.title}
              </button>
            ))}
          </div>

          {/* Desktop: vertical list */}
          <div role="tablist" aria-label="Automations" className="hidden flex-col gap-1.5 lg:flex">
            {FIXES.map((fix, i) => {
              const Icon = fix.icon;
              const isActive = active === i;
              return (
                <button
                  key={fix.title}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => showStep(i)}
                  className={`spotlight relative overflow-hidden rounded-2xl border px-5 py-4 text-left transition-colors duration-300 cursor-pointer ${
                    isActive ? 'border-transparent' : 'border-transparent hover:border-ink/15 hover:bg-ink/[0.05]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="fix-active-tab"
                      transition={tabSpring}
                      className="absolute inset-0 -z-10 rounded-2xl border border-ink/10 bg-white shadow-chip"
                      aria-hidden="true"
                    />
                  )}
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-drop transition-colors duration-300 ${
                        isActive ? 'bg-accent text-white' : 'bg-accent-soft text-accent'
                      }`}
                    >
                      <Icon className="h-[1.125rem] w-[1.125rem]" />
                    </span>
                    <span className={`font-semibold transition-colors ${isActive ? 'text-ink' : 'text-ink/70'}`}>{fix.title}</span>
                  </div>
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.p
                        key="text"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={SNAPPY_TRANSITION}
                        className="overflow-hidden pl-[3.25rem] text-sm leading-relaxed text-muted"
                      >
                        <span className="block pt-1.5">{fix.text}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                  {isActive && (
                    <span className="absolute inset-x-5 bottom-0 h-0.5 overflow-hidden rounded-full bg-ink/[0.06]">
                      <motion.span className="block h-full origin-left bg-accent" style={{ scaleX: progress }} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Example conversation for the selected automation */}
          <div
            ref={parallax.stageRef}
            onPointerMove={reduceMotion ? undefined : parallax.onPointerMove}
            onPointerLeave={reduceMotion ? undefined : parallax.onPointerLeave}
            className="relative flex min-h-[32.5rem] flex-col justify-center overflow-hidden rounded-[2rem] bg-[radial-gradient(120%_90%_at_50%_0%,var(--color-accent-soft)_0%,var(--color-mist)_45%,var(--color-stone)_100%)] px-5 py-10 sm:px-10"
          >
            <motion.div style={reduceMotion ? undefined : parallax.back} className="pointer-events-none absolute inset-0" aria-hidden="true">
              <span className="absolute -right-16 -top-12 h-64 w-64 rounded-drop bg-primary/10" />
              <span className="absolute -left-10 bottom-4 h-44 w-44 rounded-drop border border-primary/20" />
              <span className="absolute bottom-16 right-10 h-14 w-14 rounded-drop bg-sky/50" />
              <span className="absolute left-12 top-14 h-5 w-5 rounded-drop bg-primary/40" />
            </motion.div>

            <div className="mb-6 text-center lg:hidden">
              <p className="font-semibold text-ink">{current.title}</p>
              <p className="mt-1 text-sm text-muted">{current.text}</p>
              <span className="mx-auto mt-4 block h-0.5 w-24 overflow-hidden rounded-full bg-ink/10">
                <motion.span className="block h-full origin-left bg-accent" style={{ scaleX: progress }} />
              </span>
            </div>

            <motion.div style={reduceMotion ? undefined : parallax.front} className="relative">
              <AnimatePresence mode="wait" custom={direction}>
                {started && (
                  <motion.div
                    key={active}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={SNAPPY_TRANSITION}
                  >
                    <FixScenePreview fix={current} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>

        <p className="mt-10 text-center text-sm text-muted">
          Not sure which you need? <TextLink to={AUDIT_PATH}>Your free audit shows which leak costs you the most</TextLink>
          {showMoreLink && (
            <>
              <span className="mx-3 text-ink/20" aria-hidden="true">
                |
              </span>
              <TextLink to="/services">See all services</TextLink>
            </>
          )}
        </p>
      </div>
    </section>
  );
}
