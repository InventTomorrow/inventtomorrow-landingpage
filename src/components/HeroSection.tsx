import { Award, CheckCircle2, ShieldCheck } from 'lucide-react';
import { m } from 'motion/react';
import { AUDIT_PATH, BOOKING_PATH } from '../utils/navigation';
import { CtaButton } from './CtaButton';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const TRUST_POINTS = [
  { Icon: ShieldCheck, label: 'Done for you' },
  { Icon: CheckCircle2, label: 'You approve every message' },
  { Icon: Award, label: '90-day guarantee' },
];

// The home page opening: copy over a full-width cleaning scene, with a curved edge into the next section.
export function HeroSection() {
  return (
    <section id="home" className="relative z-10 flex w-full flex-col justify-center overflow-hidden bg-stone px-6 [--curve-h:clamp(3rem,6vw,7rem)] sm:px-12 lg:min-h-[calc(100svh-8.125rem)]">
      <img
        src="/images/hero-cleaning-automation.jpg"
        alt=""
        aria-hidden="true"
        width={2752}
        height={1536}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[60%_center] lg:object-center"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-r from-stone/98 via-stone/90 to-stone/75 lg:via-stone/85 lg:via-40% lg:to-transparent lg:to-80%"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl pb-[calc(var(--curve-h)+2rem)] pt-10 sm:pt-12 lg:pt-16 lg:[@media(max-height:820px)]:pt-8">
        <div className="flex max-w-xl flex-col items-start">
          <m.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
            className="flex items-center gap-4 text-sm font-semibold uppercase text-accent"
          >
            For cleaning service businesses
            <span className="h-0.5 w-12 bg-accent sm:w-16" aria-hidden="true" />
          </m.p>

          <m.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease }}
            className="mt-5 max-w-2xl text-balance font-display text-4xl font-bold leading-[1.12] tracking-display text-primary select-text sm:text-5xl xl:text-6xl xl:[@media(max-height:820px)]:text-5xl"
          >
            Focus on your jobs.{' '}
            <span className="block text-primary/70">Our system handles the rest.</span>
          </m.h1>

          <m.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease }}
            className="mt-6 max-w-lg text-balance text-ink"
          >
            Spend less time following up and more time getting jobs done.
          </m.p>

          <m.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease }}
            className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
          >
            <CtaButton size="lg" to={AUDIT_PATH}>
              Run My Audit
            </CtaButton>
            <CtaButton size="lg" variant="outline" to={BOOKING_PATH}>
              Schedule a Call
            </CtaButton>
          </m.div>

          <m.ul
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease }}
            className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-border pt-7"
          >
            {TRUST_POINTS.map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm font-medium text-primary">
                <Icon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                {label}
              </li>
            ))}
          </m.ul>
        </div>

      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-(--curve-h) rounded-t-[50%_80%] bg-paper"
        aria-hidden="true"
      />
    </section>
  );
}
