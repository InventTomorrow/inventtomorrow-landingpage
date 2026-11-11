import { CaseStudyCard } from '../components/CaseStudyCard';
import { CtaButton } from '../components/CtaButton';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { PageHero } from '../components/PageHero';
import { Section } from '../components/Section';
import { CASE_STUDIES } from '../content/caseStudies';
import { PAGE_META } from '../content/pages';
import { usePageMeta } from '../hooks/usePageMeta';
import { AUDIT_PATH, BOOKING_PATH } from '../utils/navigation';

export function OurWorkPage() {
  usePageMeta(PAGE_META.ourWork);

  return (
    <>
      <PageHero
        eyebrow="Our Work"
        title="Your Daily Challenges."
        titleMuted="Our Practical Solutions."
        description="See how we've helped cleaning businesses."
      >
        <CtaButton size="lg" variant="accent" to={AUDIT_PATH}>
          Run My Audit
        </CtaButton>
        <CtaButton size="lg" variant="outline-light" to={BOOKING_PATH}>
          Schedule a Call
        </CtaButton>
      </PageHero>

      <Section bg="paper">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {CASE_STUDIES.map((study, i) => (
            <CaseStudyCard key={study.slug} study={study} delay={0.06 + (i % 2) * 0.07} />
          ))}
        </div>
      </Section>

      <FinalCtaSection
        title="Want to be our next success story?"
        body="Run your audit and we'll show you where a system could take over first."
        smallLine="Audit first. Automate what matters."
      />
    </>
  );
}
