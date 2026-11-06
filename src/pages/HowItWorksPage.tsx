import { Search, SlidersHorizontal, Plug, RefreshCw, Check } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { Section } from '../components/Section';
import { SectionHeading } from '../components/SectionHeading';
import { AuditScene, BuildScene } from '../components/illustrations/processScenes';
import { FadeUp } from '../components/FadeUp';
import { ProcessSteps } from '../components/ProcessSteps';
import { SiteImage } from '../components/SiteImage';
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
        <CtaButton size="lg" variant="accent" to={AUDIT_PATH}>
          Run My Audit
        </CtaButton>
      </PageHero>

      <Section bg="soft">
        <SectionHeading
          scene={AuditScene}
          eyebrow="The process"
          title="A smarter way" titleMuted="to connect everything"
          subtitle="Each step has a clear purpose, a clear owner and a practical result."
        />
        <div className="mt-14">
          <ProcessSteps steps={PROCESS} />
        </div>
      </Section>

      <Section bg="paper" width="max-w-5xl">
        <SectionHeading
          scene={BuildScene}
          title="Clear roles" titleMuted="at every step"
          subtitle="You make the decisions that need your expertise while the system keeps the agreed process moving."
        />
        <FadeUp delay={0.1} y={18} className="mt-12">
          <SiteImage
            src="/images/clear-roles.webp"
            alt="A business owner making decisions while automated workflows carry out the agreed tasks."
            label="Roles image"
            width={2059}
            height={764}
            className="rounded-3xl object-contain!"
          />
        </FadeUp>
        <div className="mt-10 grid grid-cols-1 divide-y divide-primary/[0.08] md:-mx-10 md:mt-6 md:grid-cols-2 md:divide-x md:divide-y-0">
          {ROLES.map(({ label, items }, i) => (
            <FadeUp
              key={label}
              delay={0.1 + i * 0.08}
              y={18}
              className="py-8 max-md:first:pt-0 max-md:last:pb-0 md:p-10"
            >
              <p className="text-xs font-semibold text-accent">{label}</p>
              <ul className="mt-6 space-y-4">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-primary">
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
