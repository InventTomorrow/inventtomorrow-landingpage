import { AboutIntroSection } from '../components/AboutIntroSection';
import { BeforeAfterSection } from '../components/BeforeAfterSection';
import { BlogPreviewSection } from '../components/BlogPreviewSection';
import { DoneForYouSection } from '../components/DoneForYouSection';
import { FaqSection } from '../components/FaqSection';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { FoundingOfferSection } from '../components/FoundingOfferSection';
import { HeroSection } from '../components/HeroSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { LeaksAndMythSection } from '../components/LeaksAndMythSection';
import { ServicesSection } from '../components/ServicesSection';
import { StatsSection } from '../components/StatsSection';
import { StickyStatementSection } from '../components/StickyStatementSection';
import { TimelineSection } from '../components/TimelineSection';
import { ToolsSection } from '../components/ToolsSection';
import { HOME_FAQS } from '../content/faq';
import { PAGE_META } from '../content/pages';
import { usePageMeta } from '../hooks/usePageMeta';

export function HomePage() {
  usePageMeta(PAGE_META.home);

  return (
    <>
      <HeroSection />

      {/* Sections alternate paper / stone backgrounds */}
      <ToolsSection />
      <AboutIntroSection />
      <StatsSection isDark />
      <ServicesSection />
      <HowItWorksSection />
      <TimelineSection />
      <LeaksAndMythSection />
      <DoneForYouSection />
      <BeforeAfterSection />
      <StickyStatementSection />
      <FoundingOfferSection />
      <BlogPreviewSection />
      <FaqSection faqs={HOME_FAQS} showAllLink />
      <FinalCtaSection
        title="Find out what you're losing."
        titleAccent="It's free."
        body="We test your business in secret, then walk you through the results in a 15-minute call."
        smallLine="No contract. No pressure. Just the numbers."
        buttons="audit"
      />
    </>
  );
}
