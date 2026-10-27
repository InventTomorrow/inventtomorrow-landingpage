import { Home, Building2, KeyRound, Sparkles } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { Section } from '../components/Section';
import { SectionHeading } from '../components/SectionHeading';
import { FadeUp } from '../components/FadeUp';
import { CtaButton } from '../components/CtaButton';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { usePageMeta } from '../hooks/usePageMeta';
import { AUDIT_PATH, BOOKING_PATH } from '../utils/navigation';

const TYPES = [
  {
    title: 'Residential cleaning',
    text: 'Keep regular customers and new inquiries organized.',
    tags: ['Recurring bookings', 'Appointment reminders', 'Customer preferences'],
    icon: Home,
  },
  {
    title: 'Commercial cleaning',
    text: 'Keep client communication and team handoffs consistent.',
    tags: ['Site visit reminders', 'Quote follow-ups', 'Job and client updates'],
    icon: Building2,
  },
  {
    title: 'Move-out and deep cleaning',
    text: 'Keep time-sensitive inquiries and one-off jobs moving.',
    tags: ['Quote details', 'Booking confirmations', 'Access instructions'],
    icon: KeyRound,
  },
  {
    title: 'Specialist cleaning',
    text: 'Support the details around carpet, window, upholstery and other specialist jobs.',
    tags: ['Service inquiries', 'Preparation instructions', 'Repeat booking reminders'],
    icon: Sparkles,
  },
];

export function WhoWeHelpPage() {
  usePageMeta(
    'Who We Help | Invent Tomorrow',
    'Systems built around residential, commercial and specialist cleaning service businesses.',
  );

  return (
    <>
      <PageHero
        eyebrow="Who we help"
        title="Your workflow."
        titleMuted="Our flexibility."
        description="We adapt to your cleaning business with flexible automation that simplifies tasks, streamlines follow-ups, and keeps operations running smoothly."
      >
        <CtaButton size="lg" to={AUDIT_PATH}>
          Run My Audit
        </CtaButton>
        <CtaButton size="lg" variant="outline-light" to={BOOKING_PATH}>
          Schedule a Call
        </CtaButton>
      </PageHero>

      <Section bg="paper" id="service-types" width="max-w-5xl">
        <SectionHeading
          title="Built around the services you offer"
          subtitle="The jobs may be different. The need for clear, consistent follow-through is the same."
        />
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          {TYPES.map((type, i) => {
            const Icon = type.icon;
            return (
              <FadeUp
                key={type.title}
                delay={0.08 + i * 0.07}
                y={18}
                className="spotlight flex flex-col rounded-2xl border border-ink/[0.08] bg-white p-7 transition-colors duration-300 hover:border-[#626262]/25 sm:p-8"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 text-xl font-semibold tracking-tight text-ink">{type.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{type.text}</p>
                <div className="mt-6 flex flex-wrap gap-2 border-t border-ink/[0.07] pt-6">
                  {type.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-stone px-3 py-1 text-sm text-ink/80">
                      {tag}
                    </span>
                  ))}
                </div>
              </FadeUp>
            );
          })}
        </div>
        <FadeUp delay={0.15} y={12} className="mt-12 text-center">
          <p className="text-lg font-semibold tracking-tight text-ink">
            Your business has its own way of working.{' '}
            <span className="text-muted font-normal">Your system should support it.</span>
          </p>
        </FadeUp>
      </Section>

      <FinalCtaSection
        title="See how it could fit your business"
        body="Show us how your cleaning service works. We'll find the best place to start."
        smallLine="Built around your tools and workflow."
      />
    </>
  );
}
