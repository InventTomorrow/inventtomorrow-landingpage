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

// The dark closing block above the footer. Each page passes its own copy.
export function FinalCtaSection({ title, titleAccent, body, smallLine, buttons = 'both' }: FinalCtaSectionProps) {
  return (
    <section className="relative z-10 w-full bg-ink px-6 py-24 sm:px-12 sm:py-32">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <FadeUp delay={0.05} y={18}>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-white text-balance">
            {title} {titleAccent && <span className="text-accent-light">{titleAccent}</span>}
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
                Schedule a Call
              </CtaButton>
            )}
          </div>
          {smallLine && <p className="mt-5 text-sm text-white/55">{smallLine}</p>}
        </FadeUp>
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
