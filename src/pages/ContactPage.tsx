import { useState } from 'react';
import { BookingSkeleton } from '../components/BookingSkeleton';
import { CtaButton } from '../components/CtaButton';
import { FadeUp } from '../components/FadeUp';
import { PageHero } from '../components/PageHero';
import { Section } from '../components/Section';
import { SectionHeading } from '../components/SectionHeading';
import { textLinkClass } from '../components/TextLink';
import { usePageMeta } from '../hooks/usePageMeta';
import { CALENDLY_URL } from '../utils/navigation';

export function ContactPage() {
  const [isCalendarLoaded, setIsCalendarLoaded] = useState(false);
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
          className="relative mt-12 overflow-hidden rounded-3xl border border-ink/[0.08] bg-white shadow-card"
        >
          <iframe
            src={`${CALENDLY_URL}`}
            title="Schedule a call with Invent Tomorrow"
            loading="lazy"
            onLoad={() => setIsCalendarLoaded(true)}
            className="-my-12 block h-[53.5rem] w-full p-0 md:-mx-[8%] md:mb-0 md:-mt-[56px] md:h-[720px] md:w-[116%]"
          />
          <BookingSkeleton isVisible={!isCalendarLoaded} />
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
