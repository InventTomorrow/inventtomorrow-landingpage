import { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { HeroSection } from '../components/HeroSection';
import { TimelineSection } from '../components/TimelineSection';
import { LeaksAndMythSection } from '../components/LeaksAndMythSection';
import { RevenueSystemSection } from '../components/RevenueSystemSection';
import { ToolsSection } from '../components/ToolsSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { DoneForYouSection } from '../components/DoneForYouSection';
import { BeforeAfterSection } from '../components/BeforeAfterSection';
import { FoundingOfferSection } from '../components/FoundingOfferSection';
import { FaqSection } from '../components/FaqSection';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { HOME_FAQS } from '../content/faq';
import { usePageMeta } from '../hooks/usePageMeta';
import { smoothScrollTo } from '../utils/smoothScroll';

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260514_135830_bb6491d1-9b66-4aec-9722-13b4dfe3fb46.mp4';

const mediaButtonClass =
  'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium bg-ink/70 hover:bg-ink/90 text-white/85 hover:text-white backdrop-blur-md border border-white/10 transition-colors cursor-pointer';

export function HomePage() {
  usePageMeta(
    'Invent Tomorrow | Systems for Cleaning Service Businesses',
    'Win back missed inquiries, follow up quotes and build recurring bookings for your cleaning service business.',
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const onHero = useInView(heroRef, { amount: 0.35 });
  const [isMuted, setIsMuted] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const replay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    setAnimationKey((k) => k + 1);
    smoothScrollTo(0);
  };

  return (
    <>
      <div ref={heroRef}>
        <HeroSection animationKey={animationKey} videoRef={videoRef} videoSrc={VIDEO_SRC} />
      </div>

      {/* Video controls: only shown while the hero video is on screen */}
      <div
        className={`fixed bottom-6 right-6 z-30 flex items-center gap-2 transition-opacity duration-300 ${
          onHero ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        role="toolbar"
        aria-label="Media controls"
        aria-hidden={!onHero}
      >
        <button type="button" onClick={replay} aria-label="Replay hero animation" tabIndex={onHero ? 0 : -1} className={mediaButtonClass}>
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
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Sound'}</span>
        </button>
      </div>

      {/* Sections alternate paper / stone / mist backgrounds */}
      <TimelineSection />
      <LeaksAndMythSection />
      <RevenueSystemSection showMoreLink />
      <ToolsSection />
      <HowItWorksSection />
      <DoneForYouSection />
      <BeforeAfterSection />
      <FoundingOfferSection />
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
