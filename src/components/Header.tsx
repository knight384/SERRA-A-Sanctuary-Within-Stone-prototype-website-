import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { DESTINATIONS } from '../constants/chapters';

interface HeaderProps {
  progress: number;
  onNavigate: (p: number, id: string) => void;
  onOpenMenu: () => void;
  headerVisible: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  onNavigate,
  onOpenMenu,
  headerVisible
}) => {
  // Active destination based on Section 9 specification:
  // "The active header destination is The Place below p=0.18, The Stay from 0.18 to 0.45, Experiences from 0.45 to 0.76, and The Horizon thereafter."
  const activeChapterId = React.useMemo(() => {
    if (progress < 0.18) return 'the-place';
    if (progress < 0.45) return 'the-stay';
    if (progress < 0.76) return 'experiences';
    return 'the-horizon';
  }, [progress]);

  return (
    <header
      className={`fixed top-[20px] md:top-[22px] left-[18px] md:left-[28px] right-[18px] md:right-[28px] z-30 flex items-center justify-between pointer-events-none transition-all duration-[850ms] ${
        headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
      style={{ transitionTimingFunction: 'var(--ease-serra)' }}
    >
      {/* SERRA Wordmark */}
      <a
        href="#the-place"
        onClick={(e) => {
          e.preventDefault();
          onNavigate(0, 'the-place');
        }}
        className="pointer-events-auto block select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1c9a6]"
        aria-label="SERRA — A Sanctuary Within Stone"
      >
        <span
          className="block font-[450] tracking-[0.18em] text-[#fffdf8] leading-none text-[31px] sm:text-[32px] md:text-[39px] w-[150px] md:w-[186px]"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          SERRA
        </span>
      </a>

      {/* Header Controls (Nav Capsule + Menu) */}
      <div className="flex items-center gap-2 md:gap-3 pointer-events-auto">
        {/* Desktop 4-Link Frosted Capsule (Hidden <= 900px) */}
        <nav
          className="hidden min-[901px]:flex items-center p-1 gap-[2px] rounded-[50px] border border-[#ffffff42] bg-[#ffffff0e] backdrop-blur-[20px] shadow-sm select-none"
          aria-label="Journey Chapters"
        >
          {DESTINATIONS.map((dest) => {
            const isActive = activeChapterId === dest.id;
            return (
              <button
                key={dest.id}
                onClick={() => onNavigate(dest.p, dest.id)}
                className={`text-[13px] xl:text-[14px] px-[11px] xl:px-[18px] py-[8px] rounded-full transition-all duration-250 font-normal leading-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f1c9a6] ${
                  isActive
                    ? 'bg-[#fffdf8] text-[#100d0a] shadow-sm font-medium'
                    : 'text-[#fffdf8]/85 hover:text-[#fffdf8] hover:bg-[#ffffff10]'
                }`}
                aria-current={isActive ? 'true' : undefined}
              >
                {dest.label}
              </button>
            );
          })}
        </nav>

        {/* Menu Pill Button (Hidden <= 560px) */}
        <button
          onClick={onOpenMenu}
          className="hidden sm:flex items-center justify-center h-[43px] px-5 rounded-full bg-[#fffdf8] text-[#100d0a] hover:bg-[#f5eee6] active:scale-[0.97] transition-all duration-200 text-[14px] font-medium leading-none select-none shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1c9a6]"
          aria-label="Open Navigation Menu"
        >
          Menu
        </button>

        {/* Circular Arrow Button (Always visible on mobile & desktop) */}
        <button
          onClick={onOpenMenu}
          className="flex items-center justify-center w-[43px] h-[43px] rounded-full bg-[#fffdf8] text-[#100d0a] hover:bg-[#f5eee6] active:scale-[0.97] transition-all duration-200 select-none shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1c9a6]"
          aria-label="Open Navigation Dialog"
        >
          <ArrowUpRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" />
        </button>
      </div>
    </header>
  );
};
