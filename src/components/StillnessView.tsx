import React from 'react';
import { Waves, Sun, ArrowUpRight, ArrowDown } from 'lucide-react';
import { CHAPTERS, CARDS } from '../constants/chapters';
import { MEDIA } from '../constants/media';

interface StillnessViewProps {
  filmFailed?: boolean;
  onEnableCinematic?: () => void;
  onOpenMenu: () => void;
}

export const StillnessView: React.FC<StillnessViewProps> = ({
  filmFailed,
  onEnableCinematic,
  onOpenMenu
}) => {
  return (
    <div className="relative min-h-screen w-full bg-[#100d0a] text-[#fffdf8] font-sans selection:bg-[#d9a588] selection:text-[#23180f]">
      {/* Fixed Horizon Poster Background with stronger dark shading */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src={MEDIA.horizonPoster}
          alt="SERRA Desert Horizon"
          className="w-full h-full object-cover select-none opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-[#100d0a]/80" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-12 py-6 bg-[#100d0a]/75 backdrop-blur-md border-b border-[#ffffff10]">
        <a href="#the-place" className="font-[450] tracking-[0.18em] text-[#fffdf8] text-2xl md:text-3xl leading-none">
          SERRA
        </a>

        <div className="flex items-center gap-3">
          {onEnableCinematic && !filmFailed && (
            <button
              onClick={onEnableCinematic}
              className="text-[12px] md:text-[13px] text-[#d9a588] hover:text-[#fffdf8] underline underline-offset-4 px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f1c9a6]"
            >
              Enable cinematic journey
            </button>
          )}

          <button
            onClick={onOpenMenu}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#fffdf8] text-[#100d0a] hover:bg-[#f5eee6] active:scale-[0.97] transition-all text-xs font-medium"
            aria-label="Open Navigation Menu"
          >
            <span>Menu</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content Flow */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 py-16 space-y-28">
        {/* Status Notification */}
        <div className="inline-block p-4 rounded-xl border border-[#ffffff20] bg-[#342a23]/60 backdrop-blur-md text-[13px] text-[#d6c8bc]">
          {filmFailed
            ? 'A quiet view. The film is unavailable on this connection.'
            : 'Stillness mode · Take the journey at your own pace.'}
        </div>

        {/* Chapter 1: The Place */}
        <section id="the-place" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-xs tracking-[0.2em] font-medium text-[#fffdf8]/70">{CHAPTERS[0].number}</span>
            <div className="w-8 h-[1px] bg-[#fffdf8]/30" />
            <span className="text-xs tracking-[0.2em] font-medium text-[#ab826b] uppercase">{CHAPTERS[0].eyebrow}</span>
          </div>

          <div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal leading-[1.0] tracking-[-0.04em] text-[#fffdf8]">
              {CHAPTERS[0].line1}
            </h1>
            <div className="font-serif italic text-5xl sm:text-7xl md:text-8xl text-[#fffdf8] leading-[0.95] tracking-[-0.035em] mt-2">
              {CHAPTERS[0].line2}
            </div>
          </div>

          <p className="text-lg md:text-xl leading-relaxed text-[#d6c8bc] max-w-xl font-light">
            {CHAPTERS[0].supporting}
          </p>

          <a
            href="#the-stay"
            className="inline-flex items-center gap-6 px-6 py-4 rounded-full bg-[#d6a486] text-[#23180f] font-medium text-sm hover:bg-[#e4b598] transition-colors"
          >
            <span>Explore Serra</span>
            <ArrowDown className="w-4 h-4" />
          </a>
        </section>

        {/* Chapter 2: The Stay */}
        <section id="the-stay" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-xs tracking-[0.2em] font-medium text-[#fffdf8]/70">{CHAPTERS[1].number}</span>
            <div className="w-8 h-[1px] bg-[#fffdf8]/30" />
            <span className="text-xs tracking-[0.2em] font-medium text-[#ab826b] uppercase">{CHAPTERS[1].eyebrow}</span>
          </div>

          <div>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-normal leading-[1.0] tracking-[-0.04em] text-[#fffdf8]">
              {CHAPTERS[1].line1}
            </h2>
            <div className="font-serif italic text-5xl sm:text-7xl md:text-8xl text-[#fffdf8] leading-[0.95] tracking-[-0.035em] mt-2">
              {CHAPTERS[1].line2}
            </div>
          </div>

          <p className="text-lg md:text-xl leading-relaxed text-[#d6c8bc] max-w-xl font-light">
            {CHAPTERS[1].supporting}
          </p>

          <a
            href="#experiences"
            className="inline-flex items-center gap-4 text-xs tracking-wider uppercase text-[#d9a588] hover:text-[#fffdf8] transition-colors"
          >
            <span>The journey continues</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </a>
        </section>

        {/* Chapter 3: Experiences */}
        <section id="experiences" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-xs tracking-[0.2em] font-medium text-[#fffdf8]/70">{CHAPTERS[2].number}</span>
            <div className="w-8 h-[1px] bg-[#fffdf8]/30" />
            <span className="text-xs tracking-[0.2em] font-medium text-[#ab826b] uppercase">{CHAPTERS[2].eyebrow}</span>
          </div>

          <div>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-normal leading-[1.0] tracking-[-0.04em] text-[#fffdf8]">
              {CHAPTERS[2].line1}
            </h2>
            <div className="font-serif italic text-5xl sm:text-7xl md:text-8xl text-[#fffdf8] leading-[0.95] tracking-[-0.035em] mt-2">
              {CHAPTERS[2].line2}
            </div>
          </div>

          <p className="text-lg md:text-xl leading-relaxed text-[#d6c8bc] max-w-xl font-light">
            {CHAPTERS[2].supporting}
          </p>
        </section>

        {/* The Two Glass Cards (Section 16: "put all four chapters and both cards into normal document flow, with the cards before the closing chapter") */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="p-8 rounded-[24px] border border-[#ffffff30] bg-[#342a23]/70 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-[0.2em] font-medium text-[#d9a588] uppercase">
                {CARDS[0].kicker}
              </span>
              <Waves className="w-5 h-5 text-[#fffdf8]/70" />
            </div>
            <h3 className="text-2xl font-normal text-[#fffdf8]">{CARDS[0].title}</h3>
            <p className="text-sm leading-relaxed text-[#d6c8bc] font-light">{CARDS[0].body}</p>
          </div>

          <div className="p-8 rounded-[24px] border border-[#ffffff30] bg-[#342a23]/70 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-[0.2em] font-medium text-[#d9a588] uppercase">
                {CARDS[1].kicker}
              </span>
              <Sun className="w-5 h-5 text-[#fffdf8]/70" />
            </div>
            <h3 className="text-2xl font-normal text-[#fffdf8]">{CARDS[1].title}</h3>
            <p className="text-sm leading-relaxed text-[#d6c8bc] font-light">{CARDS[1].body}</p>
          </div>
        </section>

        {/* Chapter 4: The Horizon */}
        <section id="the-horizon" className="scroll-mt-24 space-y-6 pt-6">
          <div className="flex items-center gap-3">
            <span className="text-xs tracking-[0.2em] font-medium text-[#fffdf8]/70">{CHAPTERS[3].number}</span>
            <div className="w-8 h-[1px] bg-[#fffdf8]/30" />
            <span className="text-xs tracking-[0.2em] font-medium text-[#ab826b] uppercase">{CHAPTERS[3].eyebrow}</span>
          </div>

          <div>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-normal leading-[1.0] tracking-[-0.04em] text-[#fffdf8]">
              {CHAPTERS[3].line1}
            </h2>
            <div className="font-serif italic text-5xl sm:text-7xl md:text-8xl text-[#fffdf8] leading-[0.95] tracking-[-0.035em] mt-2">
              {CHAPTERS[3].line2}
            </div>
          </div>

          <p className="text-lg md:text-xl leading-relaxed text-[#d6c8bc] max-w-xl font-light">
            {CHAPTERS[3].supporting}
          </p>

          <a
            href="#the-place"
            className="inline-flex items-center gap-4 text-xs tracking-wider uppercase text-[#d9a588] hover:text-[#fffdf8] transition-colors"
          >
            <span>Return to the beginning</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </section>

        <footer className="pt-16 pb-12 border-t border-[#ffffff15] text-xs text-[#d6c8bc]/60 uppercase tracking-[0.18em]">
          SERRA — A Sanctuary Within Stone
        </footer>
      </main>
    </div>
  );
};
