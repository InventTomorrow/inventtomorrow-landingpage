import { Award, CheckCircle2, ShieldCheck } from 'lucide-react';
import { m } from 'motion/react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { AUDIT_PATH, BOOKING_PATH } from '../utils/navigation';
import { CtaButton } from './CtaButton';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const TRUST_POINTS = [
  { Icon: ShieldCheck, label: 'Done for you' },
  { Icon: CheckCircle2, label: 'You approve every message' },
  { Icon: Award, label: '90 day guarantee' },
];

// The home page opening: copy over the cleaning scene, with a curved edge into the next section.
// Phones stay plain white (the scene would only add empty space); tablets and desktop show it behind the copy.
export function HeroSection() {
  const showScene = useMediaQuery('(min-width: 48rem)');

  return (
    <section id="home" className="relative z-10 flex w-full flex-col justify-center overflow-hidden bg-paper px-6 [--curve-h:clamp(2.5rem,6vw,7rem)] sm:px-12 lg:min-h-[calc(100svh-8.125rem)]">
      {showScene && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <img
            src="/images/hero-cleaning-automation.jpg"
            alt=""
            width={2752}
            height={1536}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            draggable={false}
            className="block h-full w-full object-cover object-[60%_center] lg:object-center"
          />
          <div className="absolute inset-0 bg-linear-to-r from-paper/98 via-paper/85 to-paper/35 lg:via-paper/80 lg:via-35% lg:to-transparent lg:to-70%" />
        </div>
      )}

      <div className="relative z-10 mx-auto w-full max-w-7xl pb-[max(2rem,env(safe-area-inset-bottom))] pt-10 sm:pb-[calc(var(--curve-h)+1.5rem)] sm:pt-8 md:pb-[calc(var(--curve-h)+2rem)] md:pt-12 lg:pt-16 lg:[@media(max-height:820px)]:pt-8">
        <div className="flex w-full min-w-0 max-w-xl flex-col items-start">
          <m.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
            className="flex items-center gap-4 text-xs font-semibold uppercase text-accent sm:text-sm"
          >
            For cleaning service businesses
            <span className="hidden h-0.5 w-16 bg-accent sm:block" aria-hidden="true" />
          </m.p>

          <m.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease }}
            className="mt-4 max-w-2xl font-display text-[clamp(1.75rem,8.6vw,2.5rem)] font-bold leading-[1.1] tracking-display text-primary select-text sm:mt-5 sm:text-balance sm:text-5xl sm:leading-[1.12] xl:text-6xl xl:[@media(max-height:820px)]:text-5xl"
          >
            Focus on your jobs.{' '}
            <span className="block text-accent">
              <span className="block sm:inline">Our system handles</span>{' '}
              <span className="block sm:inline">the rest.</span>
            </span>
          </m.h1>

          <m.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease }}
            className="mt-5 max-w-[32ch] text-balance text-ink sm:mt-6 sm:max-w-lg"
          >
            Spend less time following up and more time getting jobs done.
          </m.p>

          {/* The actions sit right under the copy; the secondary button has a white fill so it reads over the scene. */}
          <m.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease }}
            className="mt-7 flex w-full flex-col gap-3 sm:mt-9 sm:w-auto sm:flex-row sm:flex-wrap"
          >
            <CtaButton size="lg" to={AUDIT_PATH} className="w-full sm:w-auto">
              Run My Audit
            </CtaButton>
            <CtaButton
              size="lg"
              variant="outline"
              to={BOOKING_PATH}
              className="w-full bg-paper sm:w-auto"
            >
              Schedule a Call
            </CtaButton>
          </m.div>

          <m.ul
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease }}
            className="hidden gap-2.5 border-t border-border sm:mt-10 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-x-7 sm:pt-7"
          >
            {TRUST_POINTS.map(({ Icon, label }) => (
              <li key={label} className="flex min-w-0 items-center gap-2.5 text-[0.8125rem] leading-5 text-primary sm:gap-2 sm:text-sm sm:font-medium sm:leading-normal">
                <Icon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                {label}
              </li>
            ))}
          </m.ul>
        </div>
      </div>

      <div
        className="absolute inset-x-0 bottom-0 hidden h-(--curve-h) rounded-t-[50%_80%] bg-stone sm:block"
        aria-hidden="true"
      />
    </section>
  );
}
