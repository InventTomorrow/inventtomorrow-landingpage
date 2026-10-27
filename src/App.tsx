import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { MotionConfig } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollManager } from './components/ScrollManager';
import { startSmoothScroll } from './utils/smoothScroll';
import { startSpotlight } from './utils/spotlight';
import { HomePage } from './pages/HomePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ServicesPage } from './pages/ServicesPage';
import { WhoWeHelpPage } from './pages/WhoWeHelpPage';
import { AboutPage } from './pages/AboutPage';
import { FaqPage } from './pages/FaqPage';
import { ResultsPage } from './pages/ResultsPage';
import { FreeAuditPage } from './pages/FreeAuditPage';
import { ContactPage } from './pages/ContactPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { LegalPage } from './pages/LegalPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LEGAL_DOCS } from './content/legal';

export default function App() {
  useEffect(() => startSmoothScroll(), []);
  useEffect(() => startSpotlight(), []);

  return (
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <div className="relative min-h-screen w-full overflow-x-hidden bg-paper font-sans text-ink select-none">
          <Navbar />
          <ScrollManager />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/who-we-help" element={<WhoWeHelpPage />} />
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
              {/* Old links from the previous site */}
              <Route path="/free-leak-audit" element={<Navigate to="/free-audit" replace />} />
              <Route path="/case-studies" element={<Navigate to="/results" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </MotionConfig>
    </BrowserRouter>
  );
}
