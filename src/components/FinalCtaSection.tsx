import { CalendarCheck, ClipboardCheck } from 'lucide-react';
import { ReactNode } from 'react';
import { AUDIT_PATH, BOOKING_PATH } from '../utils/navigation';
import { BrandLogo } from './BrandLogo';
import { CtaButton } from './CtaButton';
import { FadeUp } from './FadeUp';

interface FinalCtaSectionProps {
  title: ReactNode;
  // Second part of the headline, shown in navy
  titleAccent?: ReactNode;
  body: ReactNode;
  smallLine?: ReactNode;
  // 'both': Run My Audit + Schedule a Call. 'audit' or 'call': just that one.
  buttons?: 'both' | 'audit' | 'call';
}

// The closing strip: logo, the message on blue, the buttons on navy. It overlaps the top of the footer (see Footer's pt).
export function FinalCtaSection({ title, titleAccent, body, smallLine, buttons = 'both' }: FinalCtaSectionProps) {
  return (
    <section className="final-cta relative z-20 w-full px-4 pt-8 [--cta-overlap:4rem] [background:linear-gradient(to_bottom,var(--color-paper)_calc(100%-var(--cta-overlap)),transparent_0)] sm:px-8 sm:pt-12 sm:[--cta-overlap:5rem]">
      <FadeUp y={20} className="relative mx-auto -mb-[var(--cta-overlap)] grid max-w-6xl lg:grid-cols-[minmax(0,2.8fr)_minmax(0,4.4fr)_minmax(0,3.5fr)]">
        <div className="flex items-center justify-center rounded-t-2xl border border-border bg-paper p-6 max-lg:border-b-0 lg:mr-8 lg:rounded-2xl">
          <BrandLogo />
        </div>

        <div className="flex items-center gap-5 bg-accent-glow p-6 text-on-primary sm:p-8 lg:rounded-l-2xl lg:p-6 xl:p-8">
          <ClipboardCheck className="hidden h-14 w-14 shrink-0 sm:block" strokeWidth={1.25} aria-hidden="true" />
          <div>
            <h2 className="text-2xl font-semibold leading-tight tracking-display text-on-primary text-balance sm:text-3xl">
              {title} {titleAccent && <span className="text-primary">{titleAccent}</span>}
            </h2>
            <p className="mt-2 text-base text-on-primary/90">{body}</p>
          </div>
        </div>

        <div className="flex items-center gap-5 rounded-b-2xl bg-navy-glow p-6 sm:p-8 lg:rounded-b-none lg:rounded-r-2xl lg:p-6 xl:p-8">
          <CalendarCheck className="hidden h-14 w-14 shrink-0 text-accent xl:block" strokeWidth={1.25} aria-hidden="true" />
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              {buttons !== 'call' && (
                <CtaButton variant="accent" to={AUDIT_PATH}>
                  Run My Audit
                </CtaButton>
              )}
              {buttons !== 'audit' && (
                <CtaButton variant={buttons === 'call' ? 'accent' : 'outline-light'} to={BOOKING_PATH}>
                  Schedule a Call
                </CtaButton>
              )}
            </div>
            {smallLine && <p className="text-sm text-white/60">{smallLine}</p>}
          </div>
        </div>
      </FadeUp>
    </section>
  );
}

// The closing block most inner pages use.
export function DefaultClosingCta() {
  return (
    <FinalCtaSection
      title="Discover the hours you could reclaim"
      body="Walk us through how you handle calls, quotes, and bookings. Your audit shows where time is being lost and what our system could take off your hands."
      smallLine="Know what to improve. Know where to start."
    />
  );
}
