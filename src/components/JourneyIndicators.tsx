import React from 'react';
import { ArrowDown } from 'lucide-react';
import { DESTINATIONS } from '../constants/chapters';
import { smooth } from '../utils/math';

interface JourneyIndicatorsProps {
  progress: number;
  onNavigate: (p: number, id: string) => void;
}

export const JourneyIndicators: React.FC<JourneyIndicatorsProps> = ({
  progress,
  onNavigate
}) => {
  // Section 9:
  // "Fade the rail with 1-smooth(0.70,0.76,p) and disable it after p=0.76 so it never conflicts with the cards."
  const railOpacity = 1 - smooth(0.70, 0.76, progress);
  const isRailActive = progress < 0.76;

  // "Fade the scroll invitation with 1-smooth(0.04,0.12,p)."
  const scrollCueOpacity = 1 - smooth(0.04, 0.12, progress);

  // Active destination based on p < 0.18, 0.18..0.45, 0.45..0.76, 0.76+
  const activeIndex = React.useMemo(() => {
    if (progress < 0.18) return 0;
    if (progress < 0.45) return 1;
    if (progress < 0.76) return 2;
    return 3;
  }, [progress]);

  return (
    <>
      {/* Vertical Rail: right 28px and top 41% (mobile: right 18px and top 32%) */}
      {isRailActive && (
        <nav
          className="fixed right-[18px] md:right-[28px] top-[32%] md:top-[41%] z-30 flex flex-col items-end gap-3 pointer-events-auto select-none transition-opacity duration-300"
          style={{ opacity: railOpacity }}
          aria-label="Journey Progress Rail"
        >
          {DESTINATIONS.map((dest, idx) => {
            const isActive = activeIndex === idx;
            const chapterNum = `0${idx + 1}`;
            return (
              <button
                key={dest.id}
                onClick={() => onNavigate(dest.p, dest.id)}
                className="group flex items-center gap-2 p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f1c9a6] rounded-full"
                aria-label={`Go to ${dest.label}`}
                aria-current={isActive ? 'step' : undefined}
              >
                {/* Chapter number to the left when active */}
                <span
                  className={`text-[9px] font-medium tracking-[0.1em] text-[#fffdf8] transition-all duration-300 ${
                    isActive ? 'opacity-100 -translate-x-1' : 'opacity-0 translate-x-2 pointer-events-none'
                  }`}
                >
                  {chapterNum}
                </span>

                {/* Marker: 4px dot or 4px × 19px capsule */}
                <div
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'h-[19px] bg-[#fffdf8] shadow-sm'
                      : 'h-1 bg-[#fffdf8]/35 group-hover:bg-[#fffdf8]/70'
                  }`}
                />
              </button>
            );
          })}
        </nav>
      )}

      {/* Centered SCROLL TO DISCOVER button */}
      {scrollCueOpacity > 0.01 && (
        <div
          className="fixed left-1/2 -translate-x-1/2 top-[39%] md:top-[61%] z-20 flex flex-col items-center pointer-events-auto select-none transition-opacity duration-300"
          style={{ opacity: scrollCueOpacity }}
          aria-hidden={scrollCueOpacity <= 0.05}
        >
          <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#d6c8bc]/90 font-medium mb-3">
            SCROLL TO DISCOVER
          </span>
          <button
            onClick={() => onNavigate(0.29, 'the-stay')}
            className="w-[26px] h-[38px] rounded-full border border-[#ffffff40] flex items-center justify-center text-[#fffdf8]/80 hover:text-[#fffdf8] hover:border-[#ffffff80] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f1c9a6]"
            aria-label="Scroll to discover next chapter"
          >
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" style={{ animationDuration: '2s' }} />
          </button>
        </div>
      )}

      {/* Bottom 2px Warm-Ivory Progress Line */}
      <div className="fixed bottom-0 left-0 right-0 h-[2px] bg-[#ffffff10] z-40 pointer-events-none">
        <div
          className="h-full bg-[#fffdf8] transition-transform duration-75 ease-out"
          style={{
            transform: `scaleX(${progress})`,
            transformOrigin: 'left'
          }}
        />
      </div>
    </>
  );
};
