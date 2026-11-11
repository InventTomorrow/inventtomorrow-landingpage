import { useState } from 'react';
import { BookingSkeleton } from '../components/BookingSkeleton';
import { CtaButton } from '../components/CtaButton';
import { FadeUp } from '../components/FadeUp';
import { PageHero } from '../components/PageHero';
import { Section } from '../components/Section';
import { SectionHeading } from '../components/SectionHeading';
import { textLinkClass } from '../components/TextLink';
import { PAGE_META } from '../content/pages';
import { usePageMeta } from '../hooks/usePageMeta';
import { CALENDLY_URL } from '../utils/navigation';

export function ContactPage() {
  const [isCalendarLoaded, setIsCalendarLoaded] = useState(false);
  usePageMeta(PAGE_META.contact);

  return (
    <>
      <PageHero
        eyebrow="Schedule a call"
        title="Let's talk about your working day"
        description="The tasks taking too long. The details you keep chasing. See where a system could help."
      >
        <CtaButton size="lg" variant="accent" to="/contact#book-or-message">
          Choose a Time
        </CtaButton>
      </PageHero>

      <Section bg="paper" id="book-or-message" width="max-w-[62.5rem]">
        <SectionHeading title="Pick a time" titleMuted="that works for you" />
        <FadeUp
          delay={0.1}
          y={18}
     className="relative mt-12 overflow-hidden rounded-3xl border border-border bg-paper"
        >
          <iframe
            src={`${CALENDLY_URL}`}
            title="Schedule a call with Invent Tomorrow"
            loading="lazy"
            onLoad={() => setIsCalendarLoaded(true)}
            className="block h-[62rem] w-full border-0 p-0 lg:h-[48rem]"
          />
          <BookingSkeleton isVisible={!isCalendarLoaded} />
        </FadeUp>
        <p className="mt-6 text-center text-sm text-body">
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
