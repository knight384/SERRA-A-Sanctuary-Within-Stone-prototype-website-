import React, { useEffect, useRef } from 'react';
import { X, ArrowUpRight } from 'lucide-react';
import { DESTINATIONS } from '../constants/chapters';
import { QualitySetting } from '../types';

interface MenuDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (p: number, id: string) => void;
  quality: QualitySetting;
  onQualityChange: (quality: QualitySetting) => void;
  stillness: boolean;
  onToggleStillness: () => void;
}

export const MenuDialog: React.FC<MenuDialogProps> = ({
  isOpen,
  onClose,
  onNavigate,
  quality,
  onQualityChange,
  stillness,
  onToggleStillness
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap & Escape listener
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (!dialog.open) {
        dialog.showModal();
      }
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = '';
      if (dialog.open) {
        dialog.close();
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-0 w-full h-[100svh] max-w-none max-h-none p-0 bg-transparent text-[#fffdf8] z-50 flex flex-col backdrop:bg-black/80 overflow-y-auto"
      style={{
        background: 'radial-gradient(ellipse at 0% 100%, #594133 0%, transparent 65%), #251e19'
      }}
      aria-label="Navigation Menu"
    >
      <div className="min-h-full flex flex-col justify-between px-[18px] md:px-[7vw] pt-[clamp(24px,5vh,64px)] pb-8">
        {/* Top Bar: Wordmark + Close Button */}
        <div className="flex items-center justify-between pb-8 border-b border-[#ffffff15]">
          <span className="font-[450] tracking-[0.18em] text-[#fffdf8] leading-none text-[28px] md:text-[39px]">
            SERRA
          </span>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#ffffff40] bg-[#ffffff0a] hover:bg-[#ffffff18] active:scale-[0.97] transition-all duration-200 text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1c9a6]"
            aria-label="Close Navigation Menu"
          >
            <span>Close</span>
            <X className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
          </button>
        </div>

        {/* Main Columns Content */}
        <div className="py-8 md:py-14 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-[10%] items-start my-auto">
          {/* Left Column: Editorial Introduction */}
          <div className="md:col-span-5 flex flex-col justify-center">
            <p className="text-[10px] tracking-[0.2em] font-medium text-[#ab826b] uppercase mb-4">
              AWAY FROM EVERYTHING.
            </p>
            <div className="mb-6">
              <h2 className="text-[34px] sm:text-[44px] md:text-[52px] font-normal text-[#fffdf8] leading-[1.0] tracking-[-0.04em]">
                Come back
              </h2>
              <div className="font-serif italic text-[38px] sm:text-[48px] md:text-[58px] text-[#fffdf8] leading-[0.95] tracking-[-0.035em] mt-1">
                to yourself.
              </div>
            </div>
            <div className="hidden sm:block text-[15px] leading-[1.6] text-[#d6c8bc]/90 font-light space-y-1">
              <p>A quieter world awaits.</p>
              <p>Take your time finding it.</p>
            </div>
          </div>

          {/* Right Column: 4 Chapter Link Rows */}
          <nav className="md:col-span-7 flex flex-col divide-y divide-[#ffffff20]" aria-label="Menu Chapters">
            {DESTINATIONS.map((dest, idx) => {
              const num = `0${idx + 1}`;
              return (
                <button
                  key={dest.id}
                  onClick={() => {
                    onClose();
                    onNavigate(dest.p, dest.id);
                  }}
                  className="group w-full py-[14px] md:py-[19px] flex items-center justify-between text-left transition-colors hover:bg-[#ffffff08] px-2 rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f1c9a6]"
                >
                  <div className="flex items-baseline gap-4 md:gap-6">
                    <span className="hidden sm:inline text-[12px] text-[#ab826b] font-medium tracking-wider">
                      {num}
                    </span>
                    <div>
                      <div className="text-[26px] sm:text-[31px] md:text-[39px] font-normal text-[#fffdf8] group-hover:text-[#d9a588] transition-colors tracking-[-0.04em] leading-tight">
                        {dest.label}
                      </div>
                      <div className="text-[11px] md:text-[12px] text-[#d6c8bc]/80 tracking-wide mt-1">
                        {dest.subtitle}
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-[#fffdf8]/60 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[#d9a588]" />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer: Quality Controls + Stillness Mode */}
        <div className="pt-6 border-t border-[#ffffff15] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-auto">
          <div className="text-[10px] uppercase tracking-[0.18em] text-[#d6c8bc]/80">
            A SANCTUARY WITHIN STONE
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            {/* Film Quality Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="film-quality" className="text-[11px] text-[#d6c8bc]/70">
                Film Quality:
              </label>
              <select
                id="film-quality"
                value={quality}
                onChange={(e) => onQualityChange(e.target.value as QualitySetting)}
                className="bg-[#342a23]/60 border border-[#ffffff35] text-[#fffdf8] rounded-[24px] px-3 py-1.5 text-[12px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f1c9a6] cursor-pointer"
              >
                <option value="auto">Auto · adaptive</option>
                <option value="1080p">Full HD · 1080p</option>
                <option value="720p">HD · 720p</option>
              </select>
            </div>

            {/* Stillness Toggle Button */}
            <button
              onClick={onToggleStillness}
              className="text-[12px] text-[#d9a588] hover:text-[#fffdf8] underline underline-offset-4 decoration-[#d9a588]/40 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f1c9a6]"
            >
              {stillness ? 'Enable cinematic journey' : 'Switch to stillness mode'}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};
