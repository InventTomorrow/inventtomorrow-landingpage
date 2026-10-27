import { PageHero } from '../components/PageHero';
import { Section } from '../components/Section';
import { SectionHeading } from '../components/SectionHeading';
import { FadeUp } from '../components/FadeUp';
import { CtaButton } from '../components/CtaButton';
import { textLinkClass } from '../components/TextLink';
import { usePageMeta } from '../hooks/usePageMeta';
import { CALENDLY_URL } from '../utils/navigation';

export function ContactPage() {
  usePageMeta('Schedule a Call | Invent Tomorrow', 'Talk through the calls, quotes and follow-ups taking up your day.');

  return (
    <>
      <PageHero
        eyebrow="Schedule a call"
        title="Let's talk about your working day"
        description="The tasks taking too long. The details you keep chasing. See where a system could help."
      >
        <CtaButton size="lg" to="/contact#book-or-message">
          Choose a Time
        </CtaButton>
      </PageHero>

      <Section bg="paper" id="book-or-message" width="max-w-[62.5rem]">
        <SectionHeading title="Pick a time that works for you" />
        <FadeUp
          delay={0.1}
          y={18}
          className="mt-12 overflow-hidden rounded-3xl border border-ink/[0.08] bg-white shadow-[0_24px_50px_-34px_rgba(15,27,45,0.35)]"
        >
          <iframe
            src={`${CALENDLY_URL}?hide_gdpr_banner=1`}
            title="Schedule a call with Invent Tomorrow"
            loading="lazy"
            className="block h-[47.5rem] w-full border-0"
          />
        </FadeUp>
        <p className="mt-6 text-center text-sm text-muted">
          Can't see the calendar?{' '}
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className={textLinkClass}>
            Open the booking page
          </a>
          .
        </p>
      </Section>
    </>
  );
}
