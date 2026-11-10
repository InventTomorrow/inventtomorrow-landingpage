import { LazyMotion, MotionConfig } from 'motion/react';
import { Navigate, Route, Routes } from 'react-router';
import { LEGAL_DOCS } from '../content/legal';
import { HomePage } from '../pages/HomePage';
import {
  AboutPage,
  BlogPage,
  BlogPostPage,
  ContactPage,
  FaqPage,
  FreeAuditPage,
  HowItWorksPage,
  LegalPage,
  NotFoundPage,
  ResultsPage,
  ServicesPage,
} from '../pages/lazyPages';
import { AppLoader } from './AppLoader';
import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { PageTransition } from './PageTransition';
import { ScrollManager } from './ScrollManager';
import { ScrollToTop } from './ScrollToTop';
import { TopBar } from './TopBar';

// The animation code loads in its own file, after the first paint.
const loadMotionFeatures = () => import('../utils/motionFeatures').then((module) => module.default);

// The whole site inside a router. Shared by the browser app and the build-time pre-render (entry-server.tsx).
export function SiteLayout() {
  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">
        <div className="relative min-h-screen w-full overflow-x-clip bg-paper text-body select-none">
          <AppLoader />
          <TopBar />
          <Navbar />
          <ScrollManager />
          <main>
            <PageTransition>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/services" element={<ServicesPage />} />
                {/* <Route path="/who-we-help" element={<WhoWeHelpPage />} /> */}
                <Route path="/about" element={<AboutPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/results" element={<ResultsPage />} />
                <Route path="/free-audit" element={<FreeAuditPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                {LEGAL_DOCS.map((doc) => (
                  <Route key={doc.path} path={doc.path} element={<LegalPage doc={doc} />} />
                ))}
                {/* Old links from the previous site. vercel.json also 301s these for direct visits. */}
                <Route path="/free-leak-audit" element={<Navigate to="/free-audit" replace />} />
                <Route path="/case-studies" element={<Navigate to="/results" replace />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </PageTransition>
          </main>
          <Footer />
          <ScrollToTop />
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
