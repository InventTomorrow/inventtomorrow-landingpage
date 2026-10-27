import { FadeUp } from './FadeUp';
import { SectionHeading } from './SectionHeading';
import { CtaButton } from './CtaButton';
import { TextLink } from './TextLink';
import { AUDIT_PATH } from '../utils/navigation';
import { Award, Check } from 'lucide-react';

const TOTAL_SPOTS = 10;

const PERKS = [
  'Founding price, locked in for life',
  'A direct line to the founders',
  'Priority setup for your software',
];

export function FoundingOfferSection() {
  return (
    <section id="founding-offer" className="relative z-10 w-full border-t border-ink/[0.06] bg-mist px-6 py-24 sm:px-12 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          eyebrow="Founding clients"
          title="Become one of our 10 founding clients"
          subtitle="Founding pricing and a direct line to the founders. In return, your results become our first case study."
        />

        <FadeUp
          delay={0.1}
          y={18}
          className="spotlight mt-14 rounded-2xl border border-ink/[0.08] bg-white p-8 transition-colors duration-300 hover:border-[#626262]/25 sm:p-10"
        >
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <ul className="space-y-3">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-ink">
                  <Check className="h-5 w-5 shrink-0 text-accent" />
                  {perk}
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-4 sm:items-end">
              <div className="sm:text-right">
                <p className="text-3xl font-bold tracking-tight text-ink tabular-nums">
                  {TOTAL_SPOTS} <span className="text-lg font-medium text-muted">founding spots</span>
                </p>
                <div className="mt-3 flex gap-1 sm:justify-end" aria-hidden="true">
                  {Array.from({ length: TOTAL_SPOTS }, (_, i) => (
                    <span key={i} className="h-1.5 w-5 rounded-full bg-accent" />
                  ))}
                </div>
              </div>
              <CtaButton to={AUDIT_PATH} className="w-full sm:w-auto">
                Claim a founding spot
              </CtaButton>
            </div>
          </div>
        </FadeUp>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,7fr)_minmax(0,6fr)]">
          <FadeUp delay={0.18} y={18} className="spotlight spotlight-light rounded-2xl bg-ink p-8 text-white">
            <Award className="h-6 w-6 text-accent-light" />
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">Our promise</p>
            <p className="mt-2 text-xl font-semibold leading-snug">
              If we don't book jobs that cover our fee within 90 days, we work free until we do.
            </p>
          </FadeUp>

          <FadeUp
            delay={0.24}
            y={18}
            className="spotlight flex flex-col justify-between rounded-2xl border border-ink/[0.08] bg-white p-8 transition-colors duration-300 hover:border-[#626262]/25"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">An easy start</p>
              <p className="mt-3 text-lg font-semibold text-ink">Not ready for the full system? Start small.</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                <strong className="font-semibold text-ink">Quote Revival: $497, one time.</strong> We revive your old
                quotes in 14 days. Upgrade later and it's credited to your setup.
              </p>
            </div>
            <TextLink to={AUDIT_PATH} className="mt-6 self-start text-sm">
              Start with Quote Revival
            </TextLink>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
