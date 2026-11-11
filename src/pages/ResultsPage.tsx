import { Timer, Send, Clock3, TrendingUp, Repeat } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { Section } from '../components/Section';
import { SectionHeading } from '../components/SectionHeading';
import { AuditScene } from '../components/illustrations/processScenes';
import { FadeUp } from '../components/FadeUp';
import { SiteImage } from '../components/SiteImage';
import { CtaButton } from '../components/CtaButton';
import { DefaultClosingCta } from '../components/FinalCtaSection';
import { PAGE_META } from '../content/pages';
import { usePageMeta } from '../hooks/usePageMeta';
import { AUDIT_PATH, BOOKING_PATH } from '../utils/navigation';

const MEASURES = [
  { title: 'Quicker replies', text: 'How quickly new inquiries hear back.', icon: Timer },
  { title: 'Consistent follow ups', text: 'Which quotes receive a reminder and move towards a booking.', icon: Send },
  { title: 'Time back', text: 'Which repeated tasks your team no longer handles by hand.', icon: Clock3 },
  { title: 'Booking progress', text: 'Where inquiries move forward and where they stop.', icon: TrendingUp },
  { title: 'Repeat business', text: 'How customers respond to reminders to book again.', icon: Repeat },
];

export function ResultsPage() {
  usePageMeta(PAGE_META.results);

  return (
    <>
      <PageHero
        eyebrow="Results"
        title="See what comes off your list"
        description="Start with how your business runs today. Then measure what changes once your system is in place."
      >
        <CtaButton size="lg" variant="accent" to={AUDIT_PATH}>
          Run My Audit
        </CtaButton>
        <CtaButton size="lg" variant="outline-light" to={BOOKING_PATH}>
          Schedule a Call
        </CtaButton>
      </PageHero>

      <Section bg="paper" width="max-w-5xl">
        <SectionHeading scene={AuditScene} title="What to keep track of" />
        <FadeUp delay={0.1} y={18} className="mt-12">
          <SiteImage alt="Tracking results on a screen" label="Results image" width={1024} height={380} className="rounded-3xl" />
        </FadeUp>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {MEASURES.map((item, i) => {
            const Icon = item.icon;
            return (
              <FadeUp
                key={item.title}
                delay={0.08 + i * 0.06}
                y={18}
        className={`rounded-2xl border border-border bg-paper p-7 transition-colors duration-300 hover:border-accent lg:col-span-2 ${
                  i === 3 ? 'lg:col-start-2' : ''
                }`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xs bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-primary">{item.title}</h3>
                <p className="mt-2 text-base text-body">{item.text}</p>
              </FadeUp>
            );
          })}
        </div>
        <FadeUp delay={0.15} y={12} className="mt-12 text-center">
          <p className="text-base text-body">
            Agree on what to measure before launch, using the information available in your tools.
          </p>
        </FadeUp>
      </Section>

      <DefaultClosingCta />
    </>
  );
}
