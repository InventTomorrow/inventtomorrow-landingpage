import { Search, SlidersHorizontal, Plug, RefreshCw, Check } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { Section } from '../components/Section';
import { SectionHeading } from '../components/SectionHeading';
import { FadeUp } from '../components/FadeUp';
import { CtaButton } from '../components/CtaButton';
import { DefaultClosingCta } from '../components/FinalCtaSection';
import { usePageMeta } from '../hooks/usePageMeta';
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

const YOUR_ROLE = [
  'Share how your business works',
  'Approve the messages and timing',
  'Handle decisions that need your expertise',
];

const OUR_SYSTEM = [
  'Send the agreed follow-ups',
  'Keep customer and job details moving',
  'Flag anything that needs your attention',
];

export function HowItWorksPage() {
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
          eyebrow="The process"
          title="A smarter way to connect everything"
          subtitle="Each step has a clear purpose, a clear owner and a practical result."
        />
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          {PROCESS.map((step, i) => {
            const Icon = step.icon;
            return (
              <FadeUp
                key={step.title}
                delay={0.08 + i * 0.07}
                y={18}
                className="spotlight flex gap-5 rounded-2xl border border-ink/[0.08] bg-white p-7 transition-colors duration-300 hover:border-ink/25 sm:p-8"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-drop bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold tabular-nums text-accent">0{i + 1}</p>
                  <h3 className="mt-1 text-lg font-semibold tracking-tight text-ink">{step.title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{step.text}</p>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </Section>

      <Section bg="stone" width="max-w-5xl">
        <SectionHeading
          title="Clear roles at every step"
          subtitle="You make the decisions that need your expertise while the system keeps the agreed process moving."
        />
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          <FadeUp
            delay={0.1}
            y={18}
            className="spotlight rounded-3xl border border-ink/[0.08] bg-white p-8 transition-colors duration-300 hover:border-ink/25 sm:p-10"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Your role</p>
            <ul className="mt-6 space-y-4">
              {YOUR_ROLE.map((item) => (
                <li key={item} className="flex items-start gap-3 text-ink">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </FadeUp>
          <FadeUp delay={0.18} y={18} className="spotlight spotlight-light relative overflow-hidden rounded-3xl bg-navy p-8 text-white sm:p-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue/30 blur-[90px]" aria-hidden="true" />
            <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-sky">Our system</p>
            <ul className="relative mt-6 space-y-4">
              {OUR_SYSTEM.map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/90">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-sky" />
                  {item}
                </li>
              ))}
            </ul>
          </FadeUp>
        </div>
      </Section>

      <DefaultClosingCta />
    </>
  );
}
