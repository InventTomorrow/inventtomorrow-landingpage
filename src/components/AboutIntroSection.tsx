import { Phone } from 'lucide-react';
import { Link } from 'react-router';
import { BOOKING_PATH } from '../utils/navigation';
import { CtaButton } from './CtaButton';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { SiteImage } from './SiteImage';

const POINTS = [
  'We handle the setup',
  'Works even when you’re busy',
  'Keep using your current tools',
  'You stay in control',
  'Free 15 minute audit call',
  'No long term contracts',
];

// Who we are: two illustrations with a guarantee badge on the left, the short story and a checklist on the right.
export function AboutIntroSection() {
  return (
    <section id="about" className="relative z-10 w-full bg-paper section-y px-6 sm:px-12">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <Reveal variant="left" distance={48} className="relative mx-auto w-full max-w-xl pb-16 sm:pb-24">
          <div className="absolute -left-5 top-6 hidden flex-col gap-3 sm:flex" aria-hidden="true">
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} className="size-2 rounded-full bg-accent" />
            ))}
          </div>
          <div className="aspect-[10/13] w-[58%] overflow-hidden rounded-2xl">
            <SiteImage
              src="/images/about-systems-team-v3.webp"
              alt="3D illustration of a technology team building connected email, messaging, and booking workflows."
              label="Simple systems, built together"
              width={400}
              height={520}
              className="h-full! object-top"
            />
          </div>
          <div className="absolute bottom-0 right-0 aspect-[5/7] w-[54%] overflow-hidden rounded-2xl">
            <SiteImage
              src="/images/about-business-owner-v2.jpg"
              alt="3D illustration of a cleaning business owner using a phone while an AI assistant manages messages and bookings."
              label="Business systems, handled for you"
              width={400}
              height={560}
              className="h-full! object-top"
            />
          </div>
          <div className="absolute left-[46%] top-1/2 z-10 flex size-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-4 border-paper bg-accent text-center text-on-primary shadow-float sm:size-36 sm:border-[6px]">
            <span className="font-display text-3xl font-semibold leading-none sm:text-5xl">90</span>
            <span className="mt-1 text-[0.625rem] font-medium uppercase sm:text-xs">Day guarantee</span>
          </div>
        </Reveal>

        <div className="min-w-0">
          <SectionHeading
            align="left"
            eyebrow="About us"
            title="You know cleaning." titleMuted="We know how to help you grow."
            subtitle="We’re Invent Tomorrow. We look at how you run your cleaning business, find what’s holding you back, and make things easier so you can save time, book more jobs, and grow."
          />

          <Reveal variant="right" distance={32} delay={0.15}>
            <h3 className="mt-8 font-display text-xl font-semibold text-primary">Why work with us?</h3>
            <ul className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-x-6 gap-y-3 rounded-2xl bg-stone p-5 sm:border-l-4 sm:border-accent sm:p-6 xl:p-8">
              {POINTS.map((point) => (
                <li key={point} className="flex min-w-0 items-start gap-3 font-display text-base font-medium text-primary">
                  <span className="mt-[0.5625rem] size-2.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  <span className="min-w-0 text-pretty">{point}</span>
                </li>
              ))}
            </ul>

            {/* Compact on phones so the button and the call link sit side by side; they wrap only if the column is truly narrow. */}
            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-4 sm:gap-x-6">
              <CtaButton size="md" to="/services" className="max-sm:min-h-11 max-sm:px-3 max-sm:text-xs">
                See how we can help
              </CtaButton>
              <Link to={BOOKING_PATH} className="group flex min-w-0 items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-on-primary transition-colors duration-300 group-hover:bg-primary sm:size-14">
                  <Phone className="h-4 w-4 sm:h-6 sm:w-6" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5 whitespace-nowrap text-[0.6875rem] leading-snug sm:text-sm">
                  Have a question?
                  <span className="font-display text-sm font-semibold leading-snug text-primary sm:text-lg">Schedule a call</span>
                </span>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
