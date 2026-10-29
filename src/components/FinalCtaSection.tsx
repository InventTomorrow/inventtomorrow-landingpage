import { CalendarCheck, Phone } from 'lucide-react';
import { ReactNode } from 'react';
import { FadeUp } from './FadeUp';
import { CtaButton } from './CtaButton';
import { AUDIT_PATH, BOOKING_PATH } from '../utils/navigation';

interface FinalCtaSectionProps {
  title: ReactNode;
  // Second part of the headline, shown in the light accent
  titleAccent?: ReactNode;
  body: ReactNode;
  smallLine?: ReactNode;
  // 'both': Run My Audit + Schedule a Call. 'audit' or 'call': just that one.
  buttons?: 'both' | 'audit' | 'call';
}

// The rounded dark closing card. It overlaps the top of the footer (see Footer's pt).
export function FinalCtaSection({ title, titleAccent, body, smallLine, buttons = 'both' }: FinalCtaSectionProps) {
  return (
    <section className="final-cta relative z-20 w-full px-4 pt-12 [--cta-overlap:6rem] [background:linear-gradient(to_bottom,var(--color-paper)_calc(100%-var(--cta-overlap)),transparent_0)] sm:px-8 sm:pt-16 sm:[--cta-overlap:8rem]">
      <div className="relative mx-auto -mb-[var(--cta-overlap)] max-w-6xl overflow-hidden rounded-[2rem] bg-navy px-6 py-16 shadow-cta sm:rounded-[3rem] sm:px-12 sm:py-24">
        <div className="graphic-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="graphic-glow pointer-events-none absolute -left-32 -top-40 h-[28rem] w-[28rem] opacity-70" aria-hidden="true" />
        <div className="graphic-glow pointer-events-none absolute -bottom-48 -right-24 h-[30rem] w-[30rem] opacity-50" aria-hidden="true" />
        <div className="graphic-drop pointer-events-none absolute -bottom-20 -right-16 h-72 w-72 sm:-bottom-28 sm:-right-10 sm:h-[26rem] sm:w-[26rem]" aria-hidden="true" />
        <div className="graphic-drop-outline pointer-events-none absolute -left-20 -top-20 h-64 w-64 sm:-left-12 sm:-top-12 sm:h-[22rem] sm:w-[22rem]" aria-hidden="true" />
        <div className="graphic-drop-outline pointer-events-none absolute -bottom-24 -left-10 hidden h-56 w-56 sm:block" aria-hidden="true" />
        <div className="pointer-events-none absolute right-8 top-8 h-5 w-5 rounded-drop bg-sky sm:right-16 sm:top-14 sm:h-7 sm:w-7" aria-hidden="true" />

        <div className="absolute left-10 top-1/2 hidden -translate-y-1/2 -rotate-6 items-center justify-center rounded-drop border border-white/15 bg-white/[0.06] p-4 text-sky backdrop-blur-sm lg:flex" aria-hidden="true">
          <CalendarCheck className="h-8 w-8" />
        </div>
        <div className="absolute right-10 top-1/2 hidden -translate-y-1/2 rotate-6 items-center justify-center rounded-drop border border-white/15 bg-white/[0.06] p-4 text-sky backdrop-blur-sm lg:flex" aria-hidden="true">
          <Phone className="h-8 w-8" />
        </div>

        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <FadeUp delay={0.05} y={18}>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-white text-balance">
              {title} {titleAccent && <span className="text-sky">{titleAccent}</span>}
            </h2>
          </FadeUp>

          <FadeUp delay={0.12} y={16}>
            <p className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-white/70">{body}</p>
          </FadeUp>

          <FadeUp delay={0.2} y={16} className="mt-10 flex w-full flex-col items-center">
            <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
              {buttons !== 'call' && (
                <CtaButton size="lg" to={AUDIT_PATH}>
                  Run My Audit
                </CtaButton>
              )}
              {buttons !== 'audit' && (
                <CtaButton size="lg" variant={buttons === 'call' ? 'primary' : 'outline-light'} to={BOOKING_PATH}>
                  <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                  Schedule a Call
                </CtaButton>
              )}
            </div>
            {smallLine && <p className="mt-5 text-sm text-white/55">{smallLine}</p>}
          </FadeUp>
        </div>
      </div>
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
