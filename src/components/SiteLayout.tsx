import { LazyMotion, MotionConfig } from 'motion/react';
import { useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useMatch } from 'react-router';
import { LEGAL_DOCS } from '../content/legal';
import { AUDIT_ADS_PATH, AUDIT_PATH } from '../utils/navigation';
import {
  AboutPage,
  BlogPage,
  BlogPostPage,
  CaseStudyPage,
  ContactPage,
  FaqPage,
  FreeAuditAdsPage,
  FreeAuditPage,
  HowItWorksPage,
  HomePage,
  LegalPage,
  NotFoundPage,
  OurWorkPage,
  ResultsPage,
  ServicesPage,
  ServicePage,
} from '../pages/lazyPages';
import { Footer } from './Footer';
import { BrandLogoImage } from './BrandLogoImage';
import { Navbar } from './Navbar';
import { PageTransition } from './PageTransition';
import { ScrollManager } from './ScrollManager';
import { ScrollToTop } from './ScrollToTop';
import { TopBar } from './TopBar';
import styles from './SiteLayout.module.css';

// The animation code loads in its own file, after the first paint.
const loadMotionFeatures = () => import('../utils/motionFeatures').then((module) => module.default);

// The whole site inside a router. Shared by the browser app and the build-time pre-render (entry-server.tsx).
export function SiteLayout() {
  const auditMatch = useMatch({ path: AUDIT_PATH, end: true });
  const isAdsPage = Boolean(useMatch({ path: AUDIT_ADS_PATH, end: true }));
  const isAuditPage = Boolean(auditMatch) || isAdsPage;
  const layoutRef = useRef<HTMLDivElement>(null);

  // Keep the composer within the visible screen when a phone's keyboard opens.
  useEffect(() => {
    if (!isAuditPage) return;
    const layout = layoutRef.current;
    const viewport = window.visualViewport;
    const resize = () => layout?.style.setProperty('--audit-height', `${viewport?.height ?? window.innerHeight}px`);
    resize();
    viewport?.addEventListener('resize', resize);
    window.addEventListener('resize', resize);
    return () => {
      viewport?.removeEventListener('resize', resize);
      window.removeEventListener('resize', resize);
      layout?.style.removeProperty('--audit-height');
    };
  }, [isAuditPage]);

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">
        <div ref={layoutRef} className={`w-full bg-paper text-body select-none ${isAuditPage ? styles.pinned : 'relative min-h-screen overflow-x-clip'}`}>
          {isAdsPage ? (
            <header className="relative z-50 h-16 bg-header shadow-header sm:h-[5.625rem]" aria-label="Invent Tomorrow">
              <div className="flex h-full w-full items-center px-4 sm:px-8 lg:px-12 xl:px-16">
                <div className="relative flex h-full shrink-0 items-center rounded-br-[1.75rem] bg-paper pr-5 before:absolute before:right-[calc(100%-2px)] before:top-0 before:h-full before:w-screen before:bg-paper sm:rounded-br-[2.25rem] sm:pr-8">
                  <BrandLogoImage className="h-10 sm:h-14" />
                </div>
              </div>
            </header>
          ) : (
            <>
              <TopBar />
              <Navbar />
            </>
          )}
          <ScrollManager />
          <main className={isAuditPage ? styles.main : undefined} data-lenis-prevent={isAuditPage || undefined}>
            <PageTransition className={isAuditPage ? styles.page : undefined}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/:slug" element={<ServicePage />} />
                {/* <Route path="/who-we-help" element={<WhoWeHelpPage />} /> */}
                <Route path="/our-work" element={<OurWorkPage />} />
                <Route path="/our-work/:slug" element={<CaseStudyPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/results" element={<ResultsPage />} />
                <Route path="/free-audit" element={<FreeAuditPage />} />
                <Route path={AUDIT_ADS_PATH} element={<FreeAuditAdsPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                {LEGAL_DOCS.map((doc) => (
                  <Route key={doc.path} path={doc.path} element={<LegalPage doc={doc} />} />
                ))}
                {/* Old links from the previous site. vercel.json also 301s these for direct visits. */}
                <Route path="/free-leak-audit" element={<Navigate to="/free-audit" replace />} />
                <Route path="/case-studies" element={<Navigate to="/our-work" replace />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </PageTransition>
          </main>
          {!isAuditPage && <Footer />}
          {!isAuditPage && <ScrollToTop />}
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
