import { Coffee, PenLine, Search, type LucideIcon } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { getFanOutStart } from '../utils/fanOut';
import { AUDIT_PATH } from '../utils/navigation';
import { CtaButton } from './CtaButton';
import { EmergeFromBehind } from './EmergeFromBehind';
import { FadeUp } from './FadeUp';
import { SectionHeading } from './SectionHeading';
import { TextLink } from './TextLink';

interface Step {
  title: string;
  description: string;
  note: string;
  icon: LucideIcon;
}

const STEPS: Step[] = [
  {
    title: 'Find the distractions',
    description: 'We audit the calls, quotes and follow-ups pulling your attention away from the work.',
    note: 'Free · 15-minute call',
    icon: Search,
  },
  {
    title: 'Build the system',
    description: 'We write the messages, connect your tools and set up every follow-up for you.',
    note: 'You approve every message',
    icon: PenLine,
  },
  {
    title: 'Focus on the clean',
    description: 'We handle calls, quotes and rebooking while you focus on doing great work.',
    note: 'Runs every day',
    icon: Coffee,
  },
];

// Matches the md:grid-cols-3 breakpoint below: from here the steps sit side by side.
const ROW_QUERY = '(min-width: 48rem)';

export function HowItWorksSection() {
  const columns = useMediaQuery(ROW_QUERY) ? STEPS.length : 1;

  return (
    <section id="how-it-works" className="relative z-10 w-full overflow-hidden border-t border-ink/[0.06] bg-fade-mist section-y section-deco px-6 sm:px-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="How it works" title="Three steps. You stay focused." />

        <ol className="mt-14 grid grid-cols-1 divide-y divide-ink/[0.08] md:grid-cols-3 md:divide-x md:divide-y-0 md:-mx-9 md:mt-5">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="spotlight py-8 max-md:first:pt-0 max-md:last:pb-0 md:p-9">
                <EmergeFromBehind start={getFanOutStart(index, STEPS.length, columns)} className="h-full" innerClassName="group h-full">
                  <div className="flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-drop bg-accent-soft text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <span
                      className="text-6xl font-bold leading-none tracking-tight tabular-nums text-accent/20 transition-colors duration-300 group-hover:text-accent/40 sm:text-7xl"
                      aria-hidden="true"
                    >
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold tracking-tight text-ink">{step.title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{step.description}</p>
                  <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-ink/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {step.note}
                  </span>
                </EmergeFromBehind>
              </li>
            );
          })}
        </ol>

        <FadeUp delay={0.2} y={16} className="mt-14 flex flex-col items-center gap-5">
          <CtaButton to={AUDIT_PATH}>Run My Audit</CtaButton>
          <TextLink to="/how-it-works" className="text-sm">
            See the full process
          </TextLink>
        </FadeUp>
      </div>
    </section>
  );
}
