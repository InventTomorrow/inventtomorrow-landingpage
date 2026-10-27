import { RefObject } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, CheckCircle2, Award } from 'lucide-react';
import { CtaButton } from './CtaButton';

interface HeroSectionProps {
  animationKey: number;
  videoRef: RefObject<HTMLVideoElement | null>;
  videoSrc: string;
  onOpenAudit?: () => void;
  onExploreWorkflow?: () => void;
}

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const TRUST_POINTS = [
  { Icon: ShieldCheck, label: 'Done for you' },
  { Icon: CheckCircle2, label: 'You approve every message' },
  { Icon: Award, label: '90-day guarantee' },
];

export function HeroSection({ animationKey, videoRef, videoSrc, onOpenAudit, onExploreWorkflow }: HeroSectionProps) {
  return (
    // Layout and video placement live in index.css (.hero-stage / .hero-video).
    <section id="home" className="hero-stage relative z-10 w-full overflow-hidden px-6 pt-[4.75rem] pb-16 sm:px-12 lg:flex lg:items-center lg:pb-0">
      {/* Phones and tablets: a band above the copy. Desktop: fills the hero behind the copy. */}
      <div
        className="pointer-events-none relative -mx-6 h-[340px] sm:mx-auto sm:h-[440px] sm:max-w-[720px] lg:static lg:mx-0 lg:h-auto lg:max-w-none"
        aria-hidden="true"
      >
        <motion.video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster="/poster.jpg"
          src={videoSrc}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease }}
          className="hero-video"
        />
      </div>

      <div key={animationKey} className="relative mx-auto -mt-8 w-full max-w-7xl sm:-mt-12 lg:mt-0">
        <div className="flex max-w-xl flex-col items-start text-left lg:max-w-[25rem] xl:max-w-[32rem]">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
            className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-white/70"
          >
            For cleaning businesses
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease }}
            className="text-4xl font-bold leading-[1.06] tracking-tight text-white select-text sm:text-5xl lg:text-[2.625rem] xl:text-[3.5rem]"
          >
            Focus on your jobs.
            <br />
            <span className="text-white/70">
              We'll handle the <span className="whitespace-nowrap">follow-up.</span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease }}
            className="mt-6 text-lg leading-relaxed text-white/80"
          >
            We text back missed calls, follow up on quotes and rebook past clients, in your voice, while you're on the job.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease }}
            className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
          >
            <CtaButton size="lg" onClick={onOpenAudit}>
              Get my free audit
            </CtaButton>
            <CtaButton size="lg" variant="outline-light" onClick={onExploreWorkflow}>
              See how it works
            </CtaButton>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease }}
            className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-white/15 pt-7 xl:w-max"
          >
            {TRUST_POINTS.map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Icon className="h-4 w-4 shrink-0 text-white/60" />
                {label}
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
