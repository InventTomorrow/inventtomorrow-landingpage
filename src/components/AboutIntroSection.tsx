import { Phone } from 'lucide-react';
import { Link } from 'react-router';
import { AUDIT_PATH, BOOKING_PATH } from '../utils/navigation';
import { CtaButton } from './CtaButton';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { SiteImage } from './SiteImage';

const POINTS = [
  "Results, not software. We're measured on booked cleans.",
  'Done for you. We set it up, write the messages and run it.',
  'You stay in control. Nothing goes out until you approve it.',
  'Keep your tools: Jobber, Housecall Pro, your business line.',
  'No long-term contract. You stay because it works.',
];

// Who we are: two illustrations with a guarantee badge on the left, the short story and a checklist on the right.
export function AboutIntroSection() {
  return (
    <section id="about" className="relative z-10 w-full bg-paper section-y px-6 sm:px-12">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
        <Reveal variant="left" distance={48} className="relative mx-auto w-full max-w-xs pb-14 sm:max-w-sm sm:pb-16 lg:max-w-lg lg:pb-20">
          <div className="absolute -left-5 top-6 hidden flex-col gap-3 sm:flex" aria-hidden="true">
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} className="size-2 rounded-full bg-accent" />
            ))}
          </div>
          <div className="aspect-[10/13] w-[58%] overflow-hidden rounded-2xl">
            <SiteImage
              src="/images/about-systems-team-v3.webp"
              alt="3D illustration of a technology team building connected email, messaging, and booking workflows."
              label="Your follow-up, handled for you"
              width={400}
              height={520}
              className="h-full! object-top"
            />
          </div>
          <div className="absolute bottom-0 right-0 aspect-[5/7] w-[54%] overflow-hidden rounded-2xl">
            <SiteImage
              src="/images/about-business-owner-v2.jpg"
              alt="3D illustration of a cleaning business owner using a phone while an AI assistant manages messages and bookings."
              label="More booked cleans from your leads"
              width={400}
              height={560}
              className="h-full! object-top"
            />
          </div>
          <div className="absolute left-[46%] top-1/2 z-10 flex size-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-4 border-paper bg-accent text-center text-on-primary shadow-float sm:size-36 sm:border-[6px]">
            <span className="font-display text-3xl font-semibold leading-none sm:text-5xl">90</span>
            <span className="mt-1 text-[0.625rem] font-medium uppercase sm:text-xs">Days to pay</span>
            <span className="text-[0.625rem] font-medium uppercase sm:text-xs">for itself</span>
          </div>
        </Reveal>

        <div className="min-w-0">
          <SectionHeading
            align="left"
            size="compact"
            eyebrow="The jobs you're missing"
            title="You already paid for these jobs." titleMuted="They just never got booked."
            subtitle="Ads, Google and referrals make your phone ring. Then a call comes in while you're mid-clean, a quote goes quiet, or a happy client never hears from you again. That's work you paid to win, lost at the last step. We win it back."
          />

          <Reveal variant="right" distance={32} delay={0.15}>
            <h3 className="mt-8 font-display text-xl font-semibold text-primary">Why owners choose us</h3>
            <ul className="mt-4 space-y-3 border-l-2 border-accent pl-5">
              {POINTS.map((point) => (
                <li key={point} className="flex min-w-0 items-start gap-3 font-display text-base font-medium text-primary">
                  <span className="mt-[0.5625rem] size-2.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  <span className="min-w-0 text-pretty">{point}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
              <CtaButton size="md" to={AUDIT_PATH} className="w-full min-w-0 whitespace-normal! px-4 sm:w-auto">
                See where my jobs are slipping
              </CtaButton>
              <Link to={BOOKING_PATH} className="group flex min-w-0 items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-on-primary transition-colors duration-300 group-hover:bg-primary sm:size-14">
                  <Phone className="h-4 w-4 sm:h-6 sm:w-6" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5 whitespace-nowrap text-[0.6875rem] leading-snug sm:text-sm">
                  Have a question?
                  <span className="font-display text-sm font-semibold leading-snug text-primary sm:text-lg">Book a call</span>
                </span>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
