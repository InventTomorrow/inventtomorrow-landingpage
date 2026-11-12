import { AuditForm } from '../components/AuditForm';
import { CtaButton } from '../components/CtaButton';
import { FadeUp } from '../components/FadeUp';
import { PageHero } from '../components/PageHero';
import { Section } from '../components/Section';
import { SectionHeading } from '../components/SectionHeading';
import { PAGE_META } from '../content/pages';
import { usePageMeta } from '../hooks/usePageMeta';
import { BOOKING_PATH } from '../utils/navigation';

export function ContactPage() {
  usePageMeta(PAGE_META.contact);

  return (
    <>
      <PageHero
        eyebrow="Schedule a call"
        title="Let's talk about your working day"
        description="The tasks taking too long. The details you keep chasing. See where a system could help."
      >
        <CtaButton size="lg" variant="accent" to={BOOKING_PATH}>
          Book My Free Audit
        </CtaButton>
      </PageHero>

      <Section bg="paper" id="book-or-message" width="max-w-[45rem]">
        <SectionHeading title="Request your" titleMuted="free audit" />
        <FadeUp
          delay={0.1}
          y={18}
          className="mt-8 rounded-3xl border border-border bg-paper p-5 sm:p-8"
        >
          <p className="mb-6 text-base text-ink">Share your details and preferred appointment time. Our team will confirm availability.</p>
          <AuditForm pagePath="/contact" />
        </FadeUp>
      </Section>
    </>
  );
}
