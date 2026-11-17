import { useEffect, useRef, useState, useCallback } from 'react';
import { CinematicScene } from './components/CinematicScene';
import { MineralLoader } from './components/MineralLoader';
import { Header } from './components/Header';
import { StoryOverlay } from './components/StoryOverlay';
import { GlassCards } from './components/GlassCards';
import { JourneyIndicators } from './components/JourneyIndicators';
import { MenuDialog } from './components/MenuDialog';
import { CustomCursor } from './components/CustomCursor';
import { StillnessView } from './components/StillnessView';
import { QualitySetting } from './types';
import { clamp } from './utils/math';
import { DESTINATIONS } from './constants/chapters';
import { MEDIA } from './constants/media';

export default function App() {
  const mainRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Stillness / Accessibility
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [stillnessMode, setStillnessMode] = useState<boolean>(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [filmFailed, setFilmFailed] = useState<boolean>(false);

  // Quality settings
  const [quality, setQuality] = useState<QualitySetting>('auto');

  // Loading & Readiness state (Section 12: 30 poster, 10 font, 60 video frame)
  const [posterLoaded, setPosterLoaded] = useState<boolean>(false);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  const [videoFrameReady, setVideoFrameReady] = useState<boolean>(false);
  const [videoBufferedSeconds, setVideoBufferedSeconds] = useState<number>(0);
  const [loaderComplete, setLoaderComplete] = useState<boolean>(false);

  // Reveal transitions
  const [headerVisible, setHeaderVisible] = useState<boolean>(false);
  const [introProgress, setIntroProgress] = useState<number>(0);

  // Scroll and Smooth Scene Progress
  const [progress, setProgress] = useState<number>(0);
  const progressRef = useRef<number>(0);
  const targetProgressRef = useRef<number>(0);

  // Dialog state
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  // Calculate weighted loading score (0 to 100)
  const loadingScore = Math.min(
    100,
    (posterLoaded ? 30 : 0) +
    (fontsLoaded ? 10 : 0) +
    (videoFrameReady
      ? 60
      : Math.min(55, Math.round((videoBufferedSeconds / 1.5) * 55)))
  );

  const isEnvironmentReady = loadingScore >= 100;

  // Listen to prefers-reduced-motion changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
      if (e.matches) setStillnessMode(true);
    };
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  // Preload poster and check fonts
  useEffect(() => {
    if (stillnessMode) {
      setLoaderComplete(true);
      return;
    }

    // Preload opening poster
    const img = new Image();
    const isMobile = window.innerWidth <= 900;
    img.src = isMobile ? MEDIA.mobileOpeningPoster : MEDIA.openingPoster;
    img.onload = () => setPosterLoaded(true);
    img.onerror = () => setPosterLoaded(true); // Don't block if fallback handles it

    // Check fonts
    if (document.fonts) {
      document.fonts.ready.then(() => setFontsLoaded(true)).catch(() => setFontsLoaded(true));
    } else {
      setFontsLoaded(true);
    }

    // 12-second failsafe deadline (Section 12: "Set a bounded readiness deadline of 12 seconds")
    const timeout = setTimeout(() => {
      if (!loaderComplete) {
        setPosterLoaded(true);
        setFontsLoaded(true);
        setVideoFrameReady(true);
      }
    }, 12000);

    return () => clearTimeout(timeout);
  }, [stillnessMode, loaderComplete]);

  // Handle video readiness callbacks
  const handleVideoReady = useCallback(() => {
    setVideoFrameReady(true);
  }, []);

  const handleVideoProgress = useCallback((sec: number) => {
    setVideoBufferedSeconds(sec);
  }, []);

  const handleVideoError = useCallback((err: Error) => {
    console.warn('Video failed to load:', err);
    setFilmFailed(true);
    setStillnessMode(true);
    setLoaderComplete(true);
  }, []);

  // When mineral reveal finishes:
  // 1) Header enters with 850ms opacity transition + 12px upward settling
  // 2) Opening word reveal runs over 1100ms (introProgress 0 -> 1)
  const handleRevealComplete = useCallback(() => {
    setLoaderComplete(true);
    setHeaderVisible(true);

    const startTime = performance.now();
    const duration = 1100;

    const animateIntro = (now: number) => {
      const elapsed = now - startTime;
      const t = clamp(elapsed / duration);
      setIntroProgress(t);
      if (t < 1) {
        requestAnimationFrame(animateIntro);
      } else {
        // Check initial URL hash
        if (window.location.hash) {
          const targetHash = window.location.hash.replace('#', '');
          const dest = DESTINATIONS.find((d) => d.id === targetHash);
          if (dest) {
            scrollToDestination(dest.p);
          }
        }
      }
    };

    requestAnimationFrame(animateIntro);
  }, []);

  // Scroll tracking and smoothing loop
  useEffect(() => {
    if (stillnessMode || !loaderComplete) return;

    const onScroll = () => {
      const main = mainRef.current;
      if (!main) return;

      const totalTravel = main.offsetHeight - window.innerHeight;
      if (totalTravel <= 0) return;

      const scrollY = -main.getBoundingClientRect().top;
      targetProgressRef.current = clamp(scrollY / totalTravel);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

    let animId: number;
    let lastTime = performance.now();

    const smoothLoop = (now: number) => {
      const dt = Math.min(100, now - lastTime);
      lastTime = now;

      // Section 9 exact smoothing formula:
      // const a = 1 - Math.pow(0.91, dt / 16.667);
      // p += (target - p) * a;
      const a = 1 - Math.pow(0.91, dt / 16.667);
      progressRef.current += (targetProgressRef.current - progressRef.current) * a;

      setProgress(progressRef.current);
      animId = requestAnimationFrame(smoothLoop);
    };

    animId = requestAnimationFrame(smoothLoop);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(animId);
    };
  }, [stillnessMode, loaderComplete]);

  // Navigate to destination p (0 to 1) and update hash
  const scrollToDestination = useCallback((targetP: number, chapterId?: string) => {
    const main = mainRef.current;
    if (!main) return;

    const totalTravel = main.offsetHeight - window.innerHeight;
    const targetScrollTop = main.offsetTop + totalTravel * targetP;

    window.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });

    if (chapterId) {
      window.history.replaceState(null, '', `#${chapterId}`);
    }
  }, []);

  // Handle Quality switch: preserve normalized journey progress
  const handleQualityChange = useCallback((newQuality: QualitySetting) => {
    setQuality(newQuality);
    // Preserves progress automatically via progressRef
  }, []);

  // Handle Stillness Toggle
  const handleToggleStillness = useCallback(() => {
    setStillnessMode((prev) => !prev);
    setMenuOpen(false);
  }, []);

  // Skip animation accessibility handler
  const handleSkipAnimation = useCallback(() => {
    setStillnessMode(true);
    setLoaderComplete(true);
  }, []);

  if (stillnessMode) {
    return (
      <>
        <StillnessView
          filmFailed={filmFailed}
          onEnableCinematic={filmFailed ? undefined : () => setStillnessMode(false)}
          onOpenMenu={() => setMenuOpen(true)}
        />
        <MenuDialog
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          onNavigate={(_p, id) => {
            const el = document.getElementById(id);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          quality={quality}
          onQualityChange={handleQualityChange}
          stillness={stillnessMode}
          onToggleStillness={handleToggleStillness}
        />
      </>
    );
  }

  return (
    <div className="relative w-full bg-[#100d0a] text-[#fffdf8]">
      {/* Keyboard-visible Skip Link (Section 16) */}
      <a
        href="#the-place"
        onClick={(e) => {
          e.preventDefault();
          handleSkipAnimation();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999] focus:px-4 focus:py-2 focus:bg-[#fffdf8] focus:text-[#100d0a] focus:rounded-md focus:shadow-lg focus:font-medium"
      >
        Skip animation and read the story
      </a>

      {/* Mineral-Haze Loading Reveal (Section 12) */}
      {!loaderComplete && (
        <MineralLoader
          progress={loadingScore}
          isReady={isEnvironmentReady}
          onRevealComplete={handleRevealComplete}
          reducedMotion={reducedMotion}
        />
      )}

      {/* Custom Cursor for fine-pointer hover devices (Section 14) */}
      <CustomCursor hidden={menuOpen || stillnessMode} />

      {/* 940svh Main Scroll Container with 100svh Sticky Stage (Section 7) */}
      <main ref={mainRef} className="h-[940svh] min-h-[940vh] relative">
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden isolation-auto">
          {/* Full-bleed Cinematic Scene (WebGL Depth Parallax + Native Video) */}
          <CinematicScene
            progress={progress}
            quality={quality}
            stillness={stillnessMode}
            onVideoReady={handleVideoReady}
            onVideoProgress={handleVideoProgress}
            onVideoError={handleVideoError}
            videoRefOut={videoRef}
          />

          {/* Fixed Header */}
          <Header
            progress={progress}
            onNavigate={scrollToDestination}
            onOpenMenu={() => setMenuOpen(true)}
            headerVisible={headerVisible}
          />

          {/* Story Overlay: Headlines, Word Spans, Supporting Copy, and CTAs */}
          <StoryOverlay
            progress={progress}
            introProgress={introProgress}
            onNavigate={scrollToDestination}
          />

          {/* The Two Live Glass Cards at p = 0.76..0.84 */}
          <GlassCards
            progress={progress}
            videoRef={videoRef}
            stillness={stillnessMode}
          />

          {/* Journey Indicators: Vertical Rail, Scroll Cue, and Progress Line */}
          <JourneyIndicators
            progress={progress}
            onNavigate={scrollToDestination}
          />
        </div>
      </main>

      {/* Full-screen Menu & Quality Controls Dialog */}
      <MenuDialog
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={scrollToDestination}
        quality={quality}
        onQualityChange={handleQualityChange}
        stillness={stillnessMode}
        onToggleStillness={handleToggleStillness}
      />
    </div>
  );
}
