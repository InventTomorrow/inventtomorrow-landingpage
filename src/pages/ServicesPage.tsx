import { PageHero } from '../components/PageHero';
import { CtaButton } from '../components/CtaButton';
// import { JourneyCarousel } from '../components/JourneyCarousel';
// import { JourneySteps } from '../components/JourneySteps';
import { ServiceGridSection } from '../components/ServiceGridSection';
import { ServiceTypesSection } from '../components/ServiceTypesSection';
import { DoneForYouSection } from '../components/DoneForYouSection';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { usePageMeta } from '../hooks/usePageMeta';
import { AUDIT_PATH, BOOKING_PATH } from '../utils/navigation';

export function ServicesPage() {
  usePageMeta(
    'Services | Invent Tomorrow',
    'Follow up and booking systems for cleaning businesses. Inquiries answered, teams informed and less for you to chase.',
  );

  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Less chasing"
        titleMuted="behind every job"
        description="From the first inquiry to the next booking, our system takes care of the routine follow through."
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

      <DoneForYouSection />

      <FinalCtaSection
        title="Simplify what happens behind every job"
        body="See which inquiries, follow ups, and reminders your system could handle first."
        smallLine="Start with one process. Build from there."
      />
    </>
  );
}
