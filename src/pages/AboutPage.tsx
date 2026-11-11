import {
  CircleDollarSign,
  Clock3,
  Focus,
} from 'lucide-react';
import { CtaButton } from '../components/CtaButton';
import { FadeUp } from '../components/FadeUp';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { PageHero } from '../components/PageHero';
import { Section } from '../components/Section';
import { SectionHeading } from '../components/SectionHeading';
import { StandardsSection } from '../components/StandardsSection';
import { TeamSection } from '../components/TeamSection';
import { usePageMeta } from '../hooks/usePageMeta';
import { AUDIT_PATH, BOOKING_PATH } from '../utils/navigation';

const OUTCOMES = [
  { title: 'Save time', text: 'Reduce the repetitive work that slows down the day.', icon: Clock3 },
  { title: 'Reduce costs', text: 'Use smarter workflows to remove avoidable effort.', icon: CircleDollarSign },
  { title: 'Create focus', text: 'Give owners and teams more room for what matters.', icon: Focus },
];

export function AboutPage() {
  usePageMeta(
    'About Us | Invent Tomorrow',
    'Invent Tomorrow builds simple, reliable automation systems that make everyday work easier for cleaning businesses.',
  );

  return (
    <>
      <PageHero
        eyebrow="About Invent Tomorrow"
        title="Making cleaning businesses"
        titleMuted="easier to run."
        description="We're Invent Tomorrow, a team that works with cleaning businesses to solve everyday challenges and build simpler ways to work."
      >
        <CtaButton size="lg" variant="accent" to={AUDIT_PATH}>
          Run My Audit
        </CtaButton>
        <CtaButton size="lg" variant="outline-light" to={BOOKING_PATH}>
          Schedule a Call
        </CtaButton>
      </PageHero>

      {/* Each section below the hero fills the screen, like the Home page. */}
      <div className="screen-sections">
        <Section bg="paper" width="max-w-6xl">
          <div className="mx-auto max-w-3xl">
            <SectionHeading
              eyebrow="Our Mission"
              title="Less paperwork. More bookings."
              titleMuted="Faster growth for your cleaning business."
            />
          </div>
          <ul className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-8 border-t border-border pt-8">
            {OUTCOMES.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="min-w-0">
                  <FadeUp delay={0.1 + index * 0.08} y={14} className="flex items-start gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xs bg-accent-soft text-accent">
                      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-primary">{item.title}</h3>
                      <p className="mt-1 max-w-[32ch] text-pretty text-base leading-relaxed">{item.text}</p>
                    </div>
                  </FadeUp>
                </li>
              );
            })}
          </ul>
        </Section>

        <StandardsSection />

        <TeamSection />
      </div>

      <FinalCtaSection
        title="Let's get in touch"
        body="Show us how work moves through your business. We'll find the best place to automate first."
        smallLine="Audit first. Automate what matters."
      />
    </>
  );
}
