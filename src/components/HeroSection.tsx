import { CheckCircle2, Clock3, ShieldCheck } from 'lucide-react';
import { m } from 'motion/react';
import { getOptimizedImage } from '../utils/images';
import { AUDIT_PATH, BOOKING_PATH } from '../utils/navigation';
import { CtaButton } from './CtaButton';
import { TextLink } from './TextLink';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const TRUST_POINTS = [
  { Icon: CheckCircle2, label: 'You approve every message' },
  { Icon: Clock3, label: 'About 1 hour of your time' },
];

// The home page opening: copy over the cleaning scene, with a curved edge into the next section.
// Phones stay plain white (the scene would only add empty space); tablets and desktop show it behind the copy.
export function HeroSection() {
  const image = getOptimizedImage('/images/hero-cleaning-automation.jpg');

  return (
    <section id="home" aria-labelledby="home-title" className="relative z-10 w-full overflow-hidden bg-paper px-6 [--curve-h:clamp(1.5rem,4vw,4rem)] sm:px-12">
      <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
        <picture className="block h-full w-full">
          <source media="(min-width: 48rem)" srcSet={image?.srcSet ?? '/images/hero-cleaning-automation.jpg'} sizes="100vw" />
          <img
            src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
            alt=""
            width={2752}
            height={1536}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            draggable={false}
            className="block h-full w-full object-cover object-[60%_center] lg:object-center"
          />
        </picture>
        <div className="absolute inset-0 bg-linear-to-r from-paper/98 via-paper/90 to-paper/35 lg:via-paper/90 lg:via-40% lg:to-transparent lg:to-80%" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl pb-10 pt-10 sm:pb-[calc(var(--curve-h)+2rem)] sm:pt-12 lg:pt-14">
        <div className="flex w-full min-w-0 max-w-[40rem] flex-col items-start">
          <m.p
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
            className="flex items-center gap-4 text-xs font-semibold uppercase text-accent sm:text-sm"
          >
            For cleaning companies with a crew
            <span className="hidden h-0.5 w-16 bg-accent sm:block" aria-hidden="true" />
          </m.p>

          <m.h1
            id="home-title"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease }}
            className="mt-4 max-w-full font-display text-[clamp(2.125rem,5vw,3.5rem)] font-bold leading-[1.08] tracking-display text-primary select-text sm:mt-5 sm:max-w-[19ch] sm:text-balance"
          >
            More booked cleans{' '}
            <span className="block text-accent">
              from the leads you already have.
            </span>
          </m.h1>

          <m.p
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease }}
            className="mt-5 max-w-[52ch] text-pretty text-base leading-relaxed text-ink sm:text-lg"
          >
            Every month, cleans slip away through missed calls, quotes nobody chased and one-time clients who never rebooked. We win them back for you, in your voice.
          </m.p>

          <p className="mt-5 flex max-w-full items-start gap-3 rounded-xl bg-accent-soft px-4 py-3 font-display text-base font-semibold leading-snug text-primary sm:text-lg">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
            Pays for itself in 90 days, guaranteed.
          </p>

          {/* The actions sit right under the copy; the secondary button has a white fill so it reads over the scene. */}
          <m.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease }}
            className="mt-6 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2"
          >
            <CtaButton size="lg" to={AUDIT_PATH} className="min-w-0 w-full whitespace-normal! px-4">
              Find my missed jobs
            </CtaButton>
            <CtaButton
              size="lg"
              variant="outline"
              to={BOOKING_PATH}
              className="min-w-0 w-full whitespace-normal! bg-paper px-4"
            >
              Book a 15-minute call
            </CtaButton>
          </m.div>

          <m.ul
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease }}
            className="mt-5 flex w-full flex-wrap gap-x-6 gap-y-2"
          >
            {TRUST_POINTS.map(({ Icon, label }) => (
              <li key={label} className="flex min-w-0 items-center gap-2.5 text-[0.8125rem] leading-5 text-primary sm:gap-2 sm:text-sm sm:font-medium sm:leading-normal">
                <Icon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                {label}
              </li>
            ))}
          </m.ul>
          <p className="mt-6 max-w-full border-l-2 border-accent pl-3 text-sm leading-relaxed text-primary">
            <TextLink to="/our-work/old-leads-revenue-recovery">18 new jobs booked from 200 old enquiries</TextLink>
          </p>
        </div>
      </div>

      <div
        className="absolute inset-x-0 bottom-0 hidden h-(--curve-h) rounded-t-[50%_80%] bg-stone sm:block"
        aria-hidden="true"
      />
    </section>
  );
}
