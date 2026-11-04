import { Award, CheckCircle2, ShieldCheck } from 'lucide-react';
import { m } from 'motion/react';
import { AUDIT_PATH, BOOKING_PATH } from '../utils/navigation';
import { CtaButton } from './CtaButton';
import { GraphicShape } from './GraphicShape';
import { Parallax } from './Parallax';
import { SiteImage } from './SiteImage';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const TRUST_POINTS = [
  { Icon: ShieldCheck, label: 'Done for you' },
  { Icon: CheckCircle2, label: 'You approve every message' },
  { Icon: Award, label: '90-day guarantee' },
];

// The home page opening: copy on the left, a cut-out photo inside a circle on the right, and a curved edge into the next section.
export function HeroSection() {
  return (
    <section id="home" className="relative z-10 flex w-full flex-col justify-center overflow-hidden bg-hero-soft px-6 [--curve-h:clamp(3rem,6vw,7rem)] sm:px-12 lg:min-h-[calc(100svh-8.125rem)]">
      <GraphicShape name="dots-grid" className="left-[53%] top-[9%] hidden h-14 w-14 opacity-70 xl:block" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 pb-[calc(var(--curve-h)+2rem)] pt-10 sm:pt-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:pt-16 lg:[@media(max-height:820px)]:pt-8">
        <div className="flex flex-col items-start">
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
            <span className="block text-primary/45">Our system handles the rest.</span>
          </m.h1>

          <m.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease }}
            className="mt-6 max-w-lg text-balance"
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

        <m.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
          className="relative mx-auto w-full max-w-[22rem] sm:max-w-sm lg:max-w-[26rem]"
        >
          <span className="absolute inset-x-[6%] top-[8%] aspect-square rounded-full bg-accent-soft" aria-hidden="true" />
          <span className="absolute inset-x-[-2%] top-[4%] aspect-square rounded-full border border-accent/50" aria-hidden="true" />
          <span className="absolute right-[14%] top-[6%] h-3.5 w-3.5 rounded-full bg-accent" aria-hidden="true" />
          <Parallax distance={22}>
            <SiteImage
              alt="A cleaner holding a mop and a bucket of supplies"
              label="Hero image"
              width={560}
              height={640}
              isEager
              className="relative mx-auto max-w-[80%]"
            />
          </Parallax>
        </m.div>
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-(--curve-h) rounded-t-[50%_80%] bg-paper"
        aria-hidden="true"
      />
    </section>
  );
}
