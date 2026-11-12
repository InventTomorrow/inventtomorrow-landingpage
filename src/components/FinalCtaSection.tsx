import { CalendarCheck, ClipboardCheck } from 'lucide-react';
import { ReactNode } from 'react';
import { AUDIT_PATH, BOOKING_PATH } from '../utils/navigation';
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
  overlapFooter?: boolean;
  auditLabel?: string;
  callLabel?: string;
}

// The closing strip: the message on blue, the buttons on navy. It overlaps the top of the footer (see Footer's pt).
export function FinalCtaSection({ title, titleAccent, body, smallLine, buttons = 'both', overlapFooter = true, auditLabel = 'Run My Audit', callLabel = 'Schedule a Call' }: FinalCtaSectionProps) {
  return (
    <section className={`relative z-20 w-full px-4 sm:px-8 ${overlapFooter ? 'final-cta pt-8 [--cta-overlap:4rem] [background:linear-gradient(to_bottom,var(--color-stone)_calc(100%-var(--cta-overlap)),transparent_0)] sm:pt-12 sm:[--cta-overlap:5rem]' : 'bg-paper py-14 sm:py-16'}`}>
      <FadeUp y={20} className={`relative mx-auto grid max-w-7xl overflow-hidden rounded-2xl lg:grid-cols-[minmax(0,3fr)_minmax(19rem,2fr)] ${overlapFooter ? '-mb-[var(--cta-overlap)]' : ''}`}>
        <div className="flex items-center gap-5 bg-accent-glow p-8 text-on-primary sm:p-10 lg:p-12">
          <ClipboardCheck className="hidden h-14 w-14 shrink-0 sm:block" strokeWidth={1.25} aria-hidden="true" />
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold leading-tight tracking-display text-on-primary text-balance sm:text-3xl">
              {title} {titleAccent && <span className="text-primary">{titleAccent}</span>}
            </h2>
            <p className="mt-2 text-base text-on-primary/90">{body}</p>
          </div>
        </div>

        <div className="flex items-center gap-5 bg-navy-glow p-8 sm:p-10 lg:p-12">
          <CalendarCheck className="hidden h-14 w-14 shrink-0 text-accent xl:block" strokeWidth={1.25} aria-hidden="true" />
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-col">
              {buttons !== 'call' && (
                <CtaButton variant="accent" to={AUDIT_PATH} className="min-w-0 whitespace-normal! px-4">
                  {auditLabel}
                </CtaButton>
              )}
              {buttons !== 'audit' && (
                <CtaButton variant={buttons === 'call' ? 'accent' : 'outline-light'} to={BOOKING_PATH} className="min-w-0 whitespace-normal! px-4">
                  {callLabel}
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
      title="Discover the revenue you could reclaim"
      body="Walk us through how you handle calls, quotes, and bookings. Your audit shows where time is being lost and what our system could take off your hands."
      smallLine="Know what to improve. Know where to start."
    />
  );
}
