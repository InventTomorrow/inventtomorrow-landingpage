import { BeforeAfterSection } from '../components/BeforeAfterSection';
import { BlogPreviewSection } from '../components/BlogPreviewSection';
import { FaqSection } from '../components/FaqSection';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { FoundingOfferSection, GuaranteeSection } from '../components/FoundingOfferSection';
import { ServicesSection } from '../components/ServicesSection';
import { TimelineSection } from '../components/TimelineSection';
import { StatsSection } from '../components/StatsSection';
import { HOME_FAQS } from '../content/faq';

export function HomeSections() {
  return (
    <>
      <StatsSection isDark />
      <AboutIntroSection />
      <ServicesSection />
      <TimelineSection />
      <BeforeAfterSection />
      <FoundingOfferSection />
      <GuaranteeSection />
      <BlogPreviewSection />
      <FaqSection faqs={HOME_FAQS} showAllLink />
      <FinalCtaSection
        title="How many cleans did you miss last month?"
        body="Walk us through your calls, quotes and past clients. In 15 minutes we'll show you roughly how many cleans are slipping away and what they're worth."
        smallLine="Free, no pressure. You'll leave with the number either way."
        auditLabel="Find my missed jobs"
        callLabel="Book a 15-minute call"
      />
    </>
  );
}
import { AboutIntroSection } from '../components/AboutIntroSection';
