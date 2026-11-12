import { lazy, Suspense } from 'react';
import { HeroSection } from '../components/HeroSection';
import { ToolsSection } from '../components/ToolsSection';
import { PAGE_META } from '../content/pages';
import { usePageMeta } from '../hooks/usePageMeta';

// Keep the first screen light. Prerendering still waits for and includes all sections.
const HomeSections = lazy(() => import('./HomeSections').then((module) => ({ default: module.HomeSections })));

export function HomePage() {
  usePageMeta(PAGE_META.home);

  return (
    <>
      <HeroSection />

      {/* Sections grow with their content instead of being forced to fill the viewport. */}
      <div className="home-sections">
        <ToolsSection />
        <Suspense fallback={<section className="min-h-48 bg-paper" aria-busy="true" aria-label="Loading more information" />}>
          <HomeSections />
        </Suspense>
      </div>
    </>
  );
}
