import { PageHero } from '../components/PageHero';
import { CtaButton } from '../components/CtaButton';
// import { JourneyCarousel } from '../components/JourneyCarousel';
// import { JourneySteps } from '../components/JourneySteps';
import { ServiceGridSection } from '../components/ServiceGridSection';
import { ServiceTypesSection } from '../components/ServiceTypesSection';
import { DoneForYouSection } from '../components/DoneForYouSection';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { PAGE_META } from '../content/pages';
import { usePageMeta } from '../hooks/usePageMeta';
import { AUDIT_PATH, BOOKING_PATH } from '../utils/navigation';
import { SERVICE_IMAGES } from '../content/serviceImages';

export function ServicesPage() {
  usePageMeta(PAGE_META.services);
  const image = SERVICE_IMAGES['/services'];

  return (
    <>
      <PageHero
        visual={<img src={image.src} srcSet={image.srcSet} sizes="(min-width: 1024px) 45vw, 100vw" alt={image.alt} width={image.width} height={image.height} loading="eager" fetchPriority="high" decoding="async" className="aspect-video w-full rounded-2xl border border-white/15 object-cover" />}
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
