import { AUDIT_PATH, BOOKING_PATH } from '../utils/navigation';
import { CtaButton } from './CtaButton';
import { ParallaxBand } from './ParallaxBand';
import { Reveal } from './Reveal';

const STATEMENTS = [
  { eyebrow: 'The problem', text: 'Calls, quotes and follow-ups keep pulling you away from the work.' },
  { eyebrow: 'The fix', text: 'The system keeps every opportunity moving while you stay focused on the clean.' },
] as const;

// Full-width statement band: a pinned background picture with three lines of text scrolling over it, ending on the main call to action.
export function StickyStatementSection() {
  return (
    <ParallaxBand id="statement" imageAlt="A cleaner at work, full-width background">
      <div className="mx-auto max-w-4xl text-center text-white">
        {STATEMENTS.map(({ eyebrow, text }) => (
          <div key={eyebrow} className="flex min-h-[80svh] flex-col items-center justify-center">
            <Reveal>
              <p className="text-sm font-semibold uppercase text-white/70">{eyebrow}</p>
              <p className="mt-4 font-display text-3xl font-semibold leading-tight tracking-display text-balance sm:text-5xl lg:text-6xl">{text}</p>
            </Reveal>
          </div>
        ))}

        <div className="flex min-h-[80svh] flex-col items-center justify-center">
          <Reveal>
            <p className="font-display text-3xl font-semibold leading-tight tracking-display text-balance sm:text-5xl lg:text-6xl">
              Win back the jobs <span className="text-accent">you already earned.</span>
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <CtaButton size="lg" variant="accent" to={AUDIT_PATH}>
                Run My Audit
              </CtaButton>
              <CtaButton size="lg" variant="outline-light" to={BOOKING_PATH}>
                Schedule a Call
              </CtaButton>
            </div>
          </Reveal>
        </div>
      </div>
    </ParallaxBand>
  );
}
