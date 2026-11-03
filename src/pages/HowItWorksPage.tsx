import { Search, SlidersHorizontal, Plug, RefreshCw, Check } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { Section } from '../components/Section';
import { SectionHeading } from '../components/SectionHeading';
import { AuditScene, BuildScene } from '../components/illustrations/processScenes';
import { EmergeFromBehind } from '../components/EmergeFromBehind';
import { FadeUp } from '../components/FadeUp';
import { CtaButton } from '../components/CtaButton';
import { DefaultClosingCta } from '../components/FinalCtaSection';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { usePageMeta } from '../hooks/usePageMeta';
import { getFanOutStart } from '../utils/fanOut';
import { AUDIT_PATH } from '../utils/navigation';

const PROCESS = [
  {
    title: 'Start with your audit',
    text: 'Walk through your calls, quotes and bookings to find where time is being lost and what can come off your list.',
    icon: Search,
  },
  {
    title: 'Shape your system',
    text: 'Choose what to improve first, then agree on the messages, timing and moments where your team should step in.',
    icon: SlidersHorizontal,
  },
  {
    title: 'Put it to work',
    text: 'Connect your tools, test each step and show your team exactly what they need to know before launch.',
    icon: Plug,
  },
  {
    title: 'Keep it working',
    text: 'Review the process and make focused adjustments as your customers, team and business change.',
    icon: RefreshCw,
  },
];

const ROLES = [
  {
    label: 'Your role',
    items: ['Share how your business works', 'Approve the messages and timing', 'Handle decisions that need your expertise'],
  },
  {
    label: 'Our system',
    items: ['Send the agreed follow-ups', 'Keep customer and job details moving', 'Flag anything that needs your attention'],
  },
];

export function HowItWorksPage() {
  const processColumns = useMediaQuery('(min-width: 64rem)') ? PROCESS.length : 1;

  usePageMeta(
    'How It Works | Invent Tomorrow',
    'Review your process, approve your messages and put a follow-up system in place for your cleaning business.',
  );

  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="Great work starts with"
        titleMuted="a better process"
        description="A clear four-step path from audit to launch, built around the way your team already works."
      >
        <CtaButton size="lg" to={AUDIT_PATH}>
          Run My Audit
        </CtaButton>
      </PageHero>

      <Section bg="paper">
        <SectionHeading
          scene={AuditScene}
          eyebrow="The process"
          title="A smarter way to connect everything"
          subtitle="Each step has a clear purpose, a clear owner and a practical result."
        />
        <ol className="mt-14 grid grid-cols-1 divide-y divide-ink/[0.08] lg:-mx-8 lg:mt-6 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          {PROCESS.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="spotlight py-8 max-lg:first:pt-0 max-lg:last:pb-0 lg:p-8">
                <EmergeFromBehind start={getFanOutStart(i, PROCESS.length, processColumns)} className="h-full" innerClassName="group h-full">
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-drop bg-accent-soft text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <span
                      className="text-5xl font-bold leading-none tracking-tight tabular-nums text-ink/[0.07] sm:text-6xl"
                      aria-hidden="true"
                    >
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">{step.title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{step.text}</p>
                </EmergeFromBehind>
              </li>
            );
          })}
        </ol>
      </Section>

      <Section bg="stone" width="max-w-5xl">
        <SectionHeading
          scene={BuildScene}
          title="Clear roles at every step"
          subtitle="You make the decisions that need your expertise while the system keeps the agreed process moving."
        />
        <div className="mt-14 grid grid-cols-1 divide-y divide-ink/[0.08] md:-mx-10 md:mt-4 md:grid-cols-2 md:divide-x md:divide-y-0">
          {ROLES.map(({ label, items }, i) => (
            <FadeUp
              key={label}
              delay={0.1 + i * 0.08}
              y={18}
              className="spotlight py-8 max-md:first:pt-0 max-md:last:pb-0 md:p-10"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{label}</p>
              <ul className="mt-6 space-y-4">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-ink">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </FadeUp>
          ))}
        </div>
      </Section>

      <DefaultClosingCta />
    </>
  );
}
