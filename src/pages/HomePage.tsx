import { AboutIntroSection } from '../components/AboutIntroSection';
import { BeforeAfterSection } from '../components/BeforeAfterSection';
import { BlogPreviewSection } from '../components/BlogPreviewSection';
import { FaqSection } from '../components/FaqSection';
import { DefaultClosingCta } from '../components/FinalCtaSection';
import { FoundingOfferSection } from '../components/FoundingOfferSection';
import { HeroSection } from '../components/HeroSection';
import { ServicesSection } from '../components/ServicesSection';
import { StatsSection } from '../components/StatsSection';
import { TimelineSection } from '../components/TimelineSection';
import { ToolsSection } from '../components/ToolsSection';
import { HOME_FAQS } from '../content/faq';
import { usePageMeta } from '../hooks/usePageMeta';

export function HomePage() {
  usePageMeta(
    'Invent Tomorrow | Systems for Cleaning Service Businesses',
    'Win back missed inquiries, follow up quotes and build recurring bookings for your cleaning service business.',
  );

  return (
    <>
      <HeroSection />

      {/* Home page sections alternate white / light gray backgrounds. */}
      <div className="screen-sections">
        <ToolsSection />
        <AboutIntroSection />
        <StatsSection isDark />
        <ServicesSection />
        <TimelineSection />
        <BeforeAfterSection />
        <FoundingOfferSection />
        <BlogPreviewSection />
        <FaqSection faqs={HOME_FAQS} showAllLink />
        <DefaultClosingCta />
      </div>
    </>
  );
}
