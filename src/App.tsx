import { useEffect, useRef, useState, useCallback } from 'react';
import { MotionConfig } from 'motion/react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TimelineSection } from './components/TimelineSection';
import { LeaksAndMythSection } from './components/LeaksAndMythSection';
import { RevenueSystemSection } from './components/RevenueSystemSection';
import { ToolsSection } from './components/ToolsSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { DoneForYouSection } from './components/DoneForYouSection';
import { BeforeAfterSection } from './components/BeforeAfterSection';
import { FoundingOfferSection } from './components/FoundingOfferSection';
import { FaqSection } from './components/FaqSection';
import { FinalCtaSection } from './components/FinalCtaSection';
import { Footer } from './components/Footer';
import { AuditModal } from './components/AuditModal';
import { getActiveSectionId, SectionPosition } from './utils/scrollspy';
import { startSmoothScroll, smoothScrollTo, setScrollLocked } from './utils/smoothScroll';
import { startSpotlight } from './utils/spotlight';

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260514_135830_bb6491d1-9b66-4aec-9722-13b4dfe3fb46.mp4';

const SECTION_IDS = [
  { id: 'home', elementId: 'home' },
  { id: 'stay-focused', elementId: 'stay-focused' },
  { id: 'the-leaks', elementId: 'the-leaks' },
  { id: 'services', elementId: 'services' },
  { id: 'how-it-works', elementId: 'how-it-works' },
  { id: 'who-we-help', elementId: 'who-we-help' },
  { id: 'before-after', elementId: 'before-after' },
  { id: 'faq', elementId: 'faq' },
];

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);
  const [activeSection, setActiveSection] = useState('home');
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  // ScrollSpy: Automatically synchronize active navbar item with scroll position
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const positions: SectionPosition[] = SECTION_IDS.map(({ id, elementId }) => {
      const el = document.getElementById(elementId);
      if (!el) return { id, top: 0, bottom: 0 };
      const rect = el.getBoundingClientRect();
      const top = rect.top + scrollY;
      const bottom = top + rect.height;
      return { id, top, bottom };
    });

    const currentId = getActiveSectionId(scrollY, positions, 220);
    setActiveSection(currentId);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  useEffect(() => startSmoothScroll(), []);
  useEffect(() => startSpotlight(), []);
  useEffect(() => setScrollLocked(auditModalOpen), [auditModalOpen]);

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const handleReplayAnimation = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    setAnimationKey((prev) => prev + 1);
    smoothScrollTo(0);
  };

  const scrollToSection = (id: string) => {
    const targetMap: Record<string, string> = {
      home: 'home',
      'stay-focused': 'stay-focused',
      'the-leaks': 'the-leaks',
      services: 'services',
      'how-it-works': 'how-it-works',
      'who-we-help': 'who-we-help',
      'before-after': 'before-after',
      'founding-offer': 'founding-offer',
      faq: 'faq',
    };
    const targetId = targetMap[id] || id;
    const el = document.getElementById(targetId);
    if (el) {
      setActiveSection(id);
      smoothScrollTo(el);
    }
  };

  const onHero = activeSection === 'home';
  const mediaButtonClass =
    'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium bg-ink/70 hover:bg-ink/90 text-white/85 hover:text-white backdrop-blur-md border border-white/10 transition-colors cursor-pointer';

  return (
    <MotionConfig reducedMotion="user">
    <main className="relative min-h-screen w-full bg-ink text-ink select-none overflow-x-hidden font-sans">
      {/* Top Floating Navbar */}
      <Navbar
        activeSection={activeSection}
        onNavigate={scrollToSection}
        onReplayHero={handleReplayAnimation}
        onOpenAudit={() => setAuditModalOpen(true)}
      />

      {/* 1. Hero Section (the video lives inside it) */}
      <HeroSection
        animationKey={animationKey}
        videoRef={videoRef}
        videoSrc={VIDEO_SRC}
        onOpenAudit={() => setAuditModalOpen(true)}
        onExploreWorkflow={() => scrollToSection('stay-focused')}
      />

      {/* Video controls: only shown while the hero video is on screen */}
      <div
        className={`fixed bottom-6 right-6 z-30 flex items-center gap-2 transition-opacity duration-300 ${
          onHero ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        role="toolbar"
        aria-label="Media controls"
        aria-hidden={!onHero}
      >
        <button
          type="button"
          onClick={handleReplayAnimation}
          aria-label="Replay hero animation"
          tabIndex={onHero ? 0 : -1}
          className={mediaButtonClass}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Replay</span>
        </button>

        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          tabIndex={onHero ? 0 : -1}
          className={mediaButtonClass}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Muted</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sound</span>
            </>
          )}
        </button>
      </div>

      {/* Content sections. Each sets its own background so the page alternates
          paper / stone / mist, with navy at the hero and the final call to action. */}
      <div className="relative z-10 w-full bg-paper">
        {/* 2. 2:14 PM timeline */}
        <TimelineSection />

        {/* 3. The leaks */}
        <LeaksAndMythSection />

        {/* 4. The Revenue Recovery System */}
        <RevenueSystemSection onOpenAudit={() => setAuditModalOpen(true)} />

        {/* 5. Works With Your Tools */}
        <ToolsSection onOpenAudit={() => setAuditModalOpen(true)} />

        {/* 6. How It Works: Three Steps */}
        <HowItWorksSection onOpenAudit={() => setAuditModalOpen(true)} />

        {/* 7. Done For You: Responsibility Matrix */}
        <DoneForYouSection />

        {/* 8. Before & After */}
        <BeforeAfterSection />

        {/* 9. Founding Clients Offer + 90-Day Guarantee + Quote Revival Tripwire */}
        <FoundingOfferSection onOpenAudit={() => setAuditModalOpen(true)} />

        {/* 10. Frequently Asked Questions (Fair Questions) */}
        <FaqSection />

        {/* 11. Final Call To Action */}
        <FinalCtaSection onOpenAudit={() => setAuditModalOpen(true)} />

        {/* 12. Footer with Compliance and Links */}
        <Footer
          onNavigate={scrollToSection}
          onOpenAudit={() => setAuditModalOpen(true)}
        />
      </div>

      {/* Root Audit Modal */}
      <AuditModal isOpen={auditModalOpen} onClose={() => setAuditModalOpen(false)} />
    </main>
    </MotionConfig>
  );
}
