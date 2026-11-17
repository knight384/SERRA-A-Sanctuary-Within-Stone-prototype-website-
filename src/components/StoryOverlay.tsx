import React from 'react';
import { ArrowUpRight, ArrowDown } from 'lucide-react';
import { CHAPTERS } from '../constants/chapters';
import { clamp, smooth } from '../utils/math';

interface StoryOverlayProps {
  progress: number;
  introProgress: number;
  onNavigate: (p: number, id: string) => void;
}

export const StoryOverlay: React.FC<StoryOverlayProps> = ({
  progress,
  introProgress,
  onNavigate
}) => {
  // Top caption fade: 1 - smooth(0.12, 0.24, p)
  const topCaptionOpacity = 1 - smooth(0.12, 0.24, progress);

  return (
    <div className="fixed inset-0 w-full h-[100svh] pointer-events-none z-10 select-none">
      {/* Small top caption: left 28px and top 123px (mobile: top 94px) */}
      <div
        className="absolute left-[18px] md:left-[28px] top-[94px] md:top-[123px] flex items-center gap-2 transition-opacity duration-300"
        style={{ opacity: topCaptionOpacity }}
        aria-hidden={topCaptionOpacity <= 0.02}
      >
        <span className="text-[10px] text-[#d6c8bc]/80">✦</span>
        <span className="text-[8px] md:text-[10px] uppercase tracking-[0.18em] text-[#d6c8bc]/90 font-medium">
          A SANCTUARY WITHIN STONE
        </span>
      </div>

      {/* Chapters */}
      {CHAPTERS.map((chapter, idx) => {
        let E = 0;
        let X = 0;

        if (idx === 0) {
          E = introProgress;
          X = smooth(0.07, 0.13, progress);
        } else if (idx === 1) {
          E = smooth(0.19, 0.25, progress);
          X = smooth(0.34, 0.40, progress);
        } else if (idx === 2) {
          E = smooth(0.49, 0.55, progress);
          X = smooth(0.66, 0.72, progress);
        } else if (idx === 3) {
          E = smooth(0.85, 0.91, progress);
          X = 0;
        }

        const isLayerActive = E > 0.01 && (1 - X) > 0.01;
        if (!isLayerActive) return null;

        // Eyebrow math: opacity E * (1-X), translateY (1-E)*12 - X*10
        const eyebrowOpacity = E * (1 - X);
        const eyebrowY = (1 - E) * 12 - X * 10;

        // Supporting copy math: opacity clamp((E-0.2)/0.65)*(1-X), translateY (1-E)*20 - X*12, blur (1-E)*3px
        const copyOpacity = clamp((E - 0.2) / 0.65) * (1 - X);
        const copyY = (1 - E) * 20 - X * 12;
        const copyBlur = (1 - E) * 3;

        // Headline words
        const wordsLine1 = chapter.line1.split(' ');
        const wordsLine2 = chapter.line2.split(' ');

        return (
          <section
            key={chapter.id}
            id={chapter.id}
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden={!isLayerActive}
          >
            {/* Desktop View: Separate Left Headline Group & Right Supporting Block */}
            <div className="hidden min-[901px]:block w-full h-full">
              {/* Left Headline Group */}
              <div
                className="absolute left-[28px] bottom-[32px] max-w-[65vw]"
                style={{ willChange: 'transform, opacity, filter' }}
              >
                {/* Eyebrow */}
                <div
                  className="flex items-center gap-3 mb-[27px]"
                  style={{
                    opacity: eyebrowOpacity,
                    transform: `translate3d(0, ${eyebrowY}px, 0)`
                  }}
                >
                  <span className="text-[10px] tracking-[0.2em] font-medium text-[#fffdf8]/90">
                    {chapter.number}
                  </span>
                  <div className="w-[30px] h-[1px] bg-[#fffdf8]/35" />
                  <span className="text-[10px] tracking-[0.2em] font-medium text-[#ab826b] uppercase">
                    {chapter.eyebrow}
                  </span>
                </div>

                {/* Main Headline Lines */}
                <div className="select-none">
                  {/* First Line (Inter 400) */}
                  <h1 className="text-[clamp(58px,6.16vw,94px)] font-normal text-[#fffdf8] leading-[0.98] tracking-[-0.055em] flex flex-wrap gap-x-[0.28em] whitespace-nowrap">
                    {wordsLine1.map((word, wIdx) => {
                      const v = clamp(E * 1.35 - wIdx * 0.09);
                      const wOpacity = v * (1 - X);
                      const wBlur = (1 - v) * 7;
                      const wY = (1 - v) * 26 - X * 16;
                      return (
                        <span
                          key={wIdx}
                          className="inline-block"
                          style={{
                            opacity: wOpacity,
                            filter: `blur(${wBlur}px)`,
                            transform: `translate3d(0, ${wY}px, 0)`
                          }}
                        >
                          {word}
                        </span>
                      );
                    })}
                  </h1>

                  {/* Second Line (Cormorant Garamond Italic 400 at 1.13x heading size) */}
                  <div className="font-serif italic text-[clamp(65px,6.96vw,106px)] text-[#fffdf8] leading-[0.92] tracking-[-0.045em] mt-[6px] flex flex-wrap gap-x-[0.25em] whitespace-nowrap">
                    {wordsLine2.map((word, wIdx) => {
                      const E2 = Math.max(0, E - 0.07);
                      const v = clamp(E2 * 1.35 - wIdx * 0.09);
                      const wOpacity = v * (1 - X);
                      const wBlur = (1 - v) * 7;
                      const wY = (1 - v) * 26 - X * 16;
                      return (
                        <span
                          key={wIdx}
                          className="inline-block"
                          style={{
                            opacity: wOpacity,
                            filter: `blur(${wBlur}px)`,
                            transform: `translate3d(0, ${wY}px, 0)`
                          }}
                        >
                          {word}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Supporting Copy & CTA Block */}
              <div
                className="absolute right-[28px] bottom-[35px] w-[300px] xl:w-[330px] flex flex-col items-start pointer-events-auto"
                style={{
                  opacity: copyOpacity,
                  filter: `blur(${copyBlur}px)`,
                  transform: `translate3d(0, ${copyY}px, 0)`,
                  willChange: 'transform, opacity, filter'
                }}
              >
                <p className="text-[16px] xl:text-[18px] leading-[1.45] tracking-[-0.02em] text-[#d6c8bc] font-normal">
                  {chapter.supporting}
                </p>

                {/* Chapter 1 CTA */}
                {chapter.cta?.type === 'explore' && (
                  <button
                    onClick={() => onNavigate(0.29, 'the-stay')}
                    className="explore-serra-cta group mt-[25px] flex items-center justify-between px-[23px] py-[16px] rounded-full bg-[#d6a486] text-[#23180f] hover:bg-[#e4b598] active:scale-[0.97] transition-all duration-200 text-[14px] font-medium leading-none shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1c9a6]"
                    tabIndex={copyOpacity > 0.5 ? 0 : -1}
                    aria-label="Explore Serra, continue to The Stay"
                  >
                    <span>{chapter.cta.label}</span>
                    <ArrowUpRight className="w-4 h-4 ml-[33px] transition-transform duration-200 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" />
                  </button>
                )}

                {/* Chapter 2 CTA Link */}
                {chapter.cta?.type === 'continue' && (
                  <button
                    onClick={() => onNavigate(0.59, 'experiences')}
                    className="group mt-[24px] flex items-center gap-[25px] text-[12px] text-[#fffdf8]/90 hover:text-[#fffdf8] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f1c9a6]"
                    tabIndex={copyOpacity > 0.5 ? 0 : -1}
                    aria-label="The journey continues, proceed to Experiences"
                  >
                    <span className="underline underline-offset-4 decoration-[#fffdf8]/35 group-hover:decoration-[#fffdf8]">
                      {chapter.cta.label}
                    </span>
                    <ArrowDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-y-[2px]" />
                  </button>
                )}

                {/* Chapter 4 CTA Link */}
                {chapter.cta?.type === 'return' && (
                  <button
                    onClick={() => onNavigate(0, 'the-place')}
                    className="group mt-[24px] flex items-center gap-[30px] text-[12px] text-[#fffdf8]/90 hover:text-[#fffdf8] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f1c9a6]"
                    tabIndex={copyOpacity > 0.5 ? 0 : -1}
                    aria-label="Return to the beginning"
                  >
                    <span className="underline underline-offset-4 decoration-[#fffdf8]/35 group-hover:decoration-[#fffdf8]">
                      {chapter.cta.label}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile View (<= 900px): Bottom Vertical Stack */}
            <div className="block min-[901px]:hidden absolute inset-x-[18px] bottom-[28px] max-w-[90vw] pointer-events-auto">
              {/* Eyebrow */}
              <div
                className="flex items-center gap-2 mb-3"
                style={{
                  opacity: eyebrowOpacity,
                  transform: `translate3d(0, ${eyebrowY}px, 0)`
                }}
              >
                <span className="text-[10px] tracking-[0.2em] font-medium text-[#fffdf8]/80">
                  {chapter.number}
                </span>
                <div className="w-5 h-[1px] bg-[#fffdf8]/30" />
                <span className="text-[9px] tracking-[0.2em] font-medium text-[#ab826b] uppercase">
                  {chapter.eyebrow}
                </span>
              </div>

              {/* Headings */}
              <div className="mb-4">
                <h2 className="text-[clamp(40px,9vw,60px)] font-normal text-[#fffdf8] leading-[1.0] tracking-[-0.052em] flex flex-wrap gap-x-[0.24em]">
                  {wordsLine1.map((word, wIdx) => {
                    const v = clamp(E * 1.35 - wIdx * 0.09);
                    return (
                      <span
                        key={wIdx}
                        className="inline-block"
                        style={{
                          opacity: v * (1 - X),
                          transform: `translate3d(0, ${(1 - v) * 20 - X * 12}px, 0)`
                        }}
                      >
                        {word}
                      </span>
                    );
                  })}
                </h2>
                <div className="font-serif italic text-[clamp(44px,10vw,66px)] text-[#fffdf8] leading-[0.94] tracking-[-0.045em] mt-1 flex flex-wrap gap-x-[0.22em]">
                  {wordsLine2.map((word, wIdx) => {
                    const E2 = Math.max(0, E - 0.07);
                    const v = clamp(E2 * 1.35 - wIdx * 0.09);
                    return (
                      <span
                        key={wIdx}
                        className="inline-block"
                        style={{
                          opacity: v * (1 - X),
                          transform: `translate3d(0, ${(1 - v) * 20 - X * 12}px, 0)`
                        }}
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Supporting Copy & CTAs */}
              <div
                className="w-full max-w-[320px]"
                style={{
                  opacity: copyOpacity,
                  transform: `translate3d(0, ${copyY}px, 0)`
                }}
              >
                <p className="text-[15px] leading-[1.45] text-[#d6c8bc]">
                  {chapter.supporting}
                </p>

                {chapter.cta?.type === 'explore' && (
                  <button
                    onClick={() => onNavigate(0.29, 'the-stay')}
                    className="explore-serra-cta group mt-5 flex items-center justify-between px-5 py-3.5 rounded-full bg-[#d6a486] text-[#23180f] active:scale-[0.97] transition-all text-[13px] font-medium"
                    tabIndex={copyOpacity > 0.5 ? 0 : -1}
                  >
                    <span>{chapter.cta.label}</span>
                    <ArrowUpRight className="w-4 h-4 ml-6" />
                  </button>
                )}

                {chapter.cta?.type === 'continue' && (
                  <button
                    onClick={() => onNavigate(0.59, 'experiences')}
                    className="group mt-4 flex items-center gap-4 text-[12px] text-[#fffdf8]/90"
                    tabIndex={copyOpacity > 0.5 ? 0 : -1}
                  >
                    <span className="underline underline-offset-4 decoration-[#fffdf8]/40">
                      {chapter.cta.label}
                    </span>
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                )}

                {chapter.cta?.type === 'return' && (
                  <button
                    onClick={() => onNavigate(0, 'the-place')}
                    className="group mt-4 flex items-center gap-5 text-[12px] text-[#fffdf8]/90"
                    tabIndex={copyOpacity > 0.5 ? 0 : -1}
                  >
                    <span className="underline underline-offset-4 decoration-[#fffdf8]/40">
                      {chapter.cta.label}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};
