import { PageHero } from '../components/PageHero';
import { Section } from '../components/Section';
import { SectionHeading } from '../components/SectionHeading';
import { BuildScene } from '../components/illustrations/processScenes';
import { FadeUp } from '../components/FadeUp';
import { CtaButton } from '../components/CtaButton';
// import { JourneyCarousel } from '../components/JourneyCarousel';
import { JourneyPathway } from '../components/JourneyPathway';
// import { JourneySteps } from '../components/JourneySteps';
import { ServiceGridSection } from '../components/ServiceGridSection';
import { ServiceTypesSection } from '../components/ServiceTypesSection';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { PAGE_META } from '../content/pages';
import { usePageMeta } from '../hooks/usePageMeta';
import { AUDIT_PATH, BOOKING_PATH } from '../utils/navigation';

export function ServicesPage() {
  usePageMeta(PAGE_META.services);

  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Less chasing"
        titleMuted="behind every job"
        description="From the first inquiry to the next booking, our system takes care of the routine follow-through."
      >
        <CtaButton size="lg" variant="accent" to={AUDIT_PATH}>
          Run My Audit
        </CtaButton>
        <CtaButton size="lg" variant="outline-light" to={BOOKING_PATH}>
          Schedule a Call
        </CtaButton>
      </PageHero>

      <ServiceGridSection />

      <ServiceTypesSection />

      <Section bg="soft" id="services-system">
        <SectionHeading
          scene={BuildScene}
          title="From inquiry" titleMuted="to repeat business."
          subtitle="See what your system takes care of, every step of the way."
        />
        {/* <FadeUp delay={0.1} y={20} className="mt-14">
          <JourneyCarousel />
        </FadeUp> */}
        <JourneyPathway />
        {/* <JourneySteps /> */}
        <FadeUp delay={0.15} y={12} className="mt-10 text-center">
          <p className="font-display text-lg font-semibold text-primary">
            You approve the messages. <span className="text-body font-normal">Our system handles the follow-through.</span>
          </p>
        </FadeUp>
      </Section>


      <FinalCtaSection
        title="Simplify what happens behind every job"
        body="See which inquiries, follow-ups, and reminders your system could handle first."
        smallLine="Start with one process. Build from there."
      />
    </>
  );
}
