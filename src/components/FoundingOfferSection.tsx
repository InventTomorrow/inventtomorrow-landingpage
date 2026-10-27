import { FadeUp } from './FadeUp';
import { SectionHeading } from './SectionHeading';
import { CtaButton } from './CtaButton';
import { Award, Check } from 'lucide-react';

const TOTAL_SPOTS = 10;
const SPOTS_LEFT = 6;

const PERKS = [
  'Founding price, locked in for life',
  'A direct line to the founders',
  'Priority setup for your software',
];

interface FoundingOfferSectionProps {
  onOpenAudit?: () => void;
}

export function FoundingOfferSection({ onOpenAudit }: FoundingOfferSectionProps) {
  return (
    <section id="founding-offer" className="relative z-10 w-full border-t border-ink/[0.06] bg-mist px-6 py-24 sm:px-12 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          eyebrow="Founding clients"
          title="Be one of our first 10 clients"
          subtitle="You get founding pricing and a direct line to the founders. We get a case study."
        />

        <FadeUp delay={0.1} y={18} className="spotlight mt-14 rounded-2xl border border-ink/[0.08] bg-white p-8 transition-colors duration-300 hover:border-[#626262]/25 sm:p-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <ul className="space-y-3">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-ink">
                  <Check className="h-5 w-5 shrink-0 text-accent" />
                  {perk}
                </li>
              ))}
            </ul>

            <div className="sm:text-right">
              <p className="text-3xl font-bold tracking-tight text-ink tabular-nums">
                {SPOTS_LEFT} <span className="text-lg font-medium text-muted">of {TOTAL_SPOTS} spots left</span>
              </p>
              <div className="mt-3 flex gap-1 sm:justify-end" aria-hidden="true">
                {Array.from({ length: TOTAL_SPOTS }, (_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-5 rounded-full ${i < TOTAL_SPOTS - SPOTS_LEFT ? 'bg-ink/15' : 'bg-accent'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <CtaButton onClick={onOpenAudit} className="mt-8 w-full sm:w-auto">
            Claim a founding spot
          </CtaButton>
        </FadeUp>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <FadeUp delay={0.18} y={18} className="spotlight spotlight-light rounded-2xl bg-ink p-8 text-white">
            <Award className="h-6 w-6 text-accent-light" />
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">90-day guarantee</p>
            <p className="mt-2 text-lg font-semibold leading-snug">
              If we don't book jobs that cover our fee within 90 days, we keep working for free until we do.
            </p>
          </FadeUp>

          <FadeUp delay={0.24} y={18} className="spotlight flex flex-col justify-between rounded-2xl border border-ink/[0.08] bg-white p-8 transition-colors duration-300 hover:border-[#626262]/25">
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Start small</p>
                <p className="text-2xl font-bold text-ink">
                  $497 <span className="text-sm font-medium text-muted">one time</span>
                </p>
              </div>
              <p className="mt-3 text-lg font-semibold text-ink">Quote Revival in 14 days</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Not ready for the full system? We'll revive your old quotes first. If you upgrade, it's credited to your
                setup.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAudit}
              className="mt-6 self-start text-sm font-semibold text-accent underline decoration-accent/30 decoration-2 underline-offset-4 transition-colors hover:text-accent-hover hover:decoration-accent cursor-pointer"
            >
              Start with Quote Revival
            </button>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
