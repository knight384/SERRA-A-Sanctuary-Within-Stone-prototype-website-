import React, { useEffect, useRef } from 'react';
import { Waves, Sun } from 'lucide-react';
import { CARDS } from '../constants/chapters';
import { smooth } from '../utils/math';

interface GlassCardsProps {
  progress: number;
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
  stillness: boolean;
}

export const GlassCards: React.FC<GlassCardsProps> = ({
  progress,
  videoRef,
  stillness
}) => {
  // Card enter envelope: smooth(0.76, 0.84, p)
  const cardEnter = smooth(0.76, 0.84, progress);

  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const canvas1Ref = useRef<HTMLCanvasElement>(null);
  const canvas2Ref = useRef<HTMLCanvasElement>(null);

  // Synchronized 2D canvas drawing live video crops with filter: blur(24px)
  useEffect(() => {
    if (stillness || cardEnter <= 0.01) return;

    let animId: number;

    const updateCanvas = (
      cardEl: HTMLDivElement | null,
      canvasEl: HTMLCanvasElement | null
    ) => {
      const video = videoRef.current;
      if (!cardEl || !canvasEl || !video || video.readyState < 2 || video.seeking) return;

      const cardRect = cardEl.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const videoWidth = video.videoWidth || 1920;
      const videoHeight = video.videoHeight || 1080;

      // Oversized canvas by 24px on each edge
      const canvasWidth = cardRect.width + 48;
      const canvasHeight = cardRect.height + 48;

      if (canvasEl.width !== Math.round(canvasWidth) || canvasEl.height !== Math.round(canvasHeight)) {
        canvasEl.width = Math.round(canvasWidth);
        canvasEl.height = Math.round(canvasHeight);
      }

      const ctx = canvasEl.getContext('2d');
      if (!ctx) return;

      // Calculate video cover scale as max(vw/videoWidth, vh/videoHeight) * 1.031
      const scale = Math.max(vw / videoWidth, vh / videoHeight) * 1.031;
      const scaledVideoWidth = videoWidth * scale;
      const scaledVideoHeight = videoHeight * scale;

      // Centered video offset on viewport
      const videoLeftOnViewport = (vw - scaledVideoWidth) / 2;
      const videoTopOnViewport = (vh - scaledVideoHeight) / 2;

      // Offset relative to the card's oversized canvas (-24px padding)
      const drawX = videoLeftOnViewport - (cardRect.left - 24);
      const drawY = videoTopOnViewport - (cardRect.top - 24);

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      try {
        ctx.drawImage(video, drawX, drawY, scaledVideoWidth, scaledVideoHeight);
      } catch {
        // Ignored if video frame is temporarily busy
      }
    };

    const renderLoop = () => {
      updateCanvas(card1Ref.current, canvas1Ref.current);
      updateCanvas(card2Ref.current, canvas2Ref.current);
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => cancelAnimationFrame(animId);
  }, [cardEnter, stillness, videoRef]);

  if (cardEnter <= 0.01) return null;

  const translateY = (1 - cardEnter) * 28;

  return (
    <div
      className="fixed inset-0 w-full h-[100svh] pointer-events-none z-20 select-none overflow-hidden"
      style={{
        opacity: cardEnter,
        transform: `translate3d(0, ${translateY}px, 0)`,
        willChange: 'transform, opacity'
      }}
      aria-hidden={cardEnter <= 0.05}
    >
      {/* Desktop Layout (> 900px): Asymmetric positioning */}
      <div className="hidden min-[901px]:block w-full h-full relative">
        {/* Card 1: Left 28px, Top 22% */}
        <div
          ref={card1Ref}
          className="absolute left-[28px] top-[22%] w-[300px] xl:w-[330px] rounded-[26px] border border-[#ffffff40] overflow-hidden p-[24px_25px_28px] shadow-[0_16px_36px_rgba(0,0,0,0.35)] backdrop-blur-[24px] pointer-events-auto isolation-auto"
        >
          {/* Synchronized live blurred canvas layer */}
          {!stillness && (
            <canvas
              ref={canvas1Ref}
              className="absolute -inset-[24px] pointer-events-none"
              style={{ filter: 'blur(24px)' }}
            />
          )}

          {/* Warm Tint Overlay */}
          <div className="absolute inset-0 card-tint pointer-events-none" />

          {/* Card Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] tracking-[0.2em] font-medium text-[#d9a588] uppercase">
                {CARDS[0].kicker}
              </span>
              <Waves className="w-4 h-4 text-[#fffdf8]/70" />
            </div>
            <h3 className="text-[25px] xl:text-[27px] font-normal text-[#fffdf8] leading-tight mb-3">
              {CARDS[0].title}
            </h3>
            <p className="text-[15px] xl:text-[16px] leading-[1.38] text-[#d6c8bc] font-light">
              {CARDS[0].body}
            </p>
          </div>
        </div>

        {/* Card 2: Right 28px, Top 46% */}
        <div
          ref={card2Ref}
          className="absolute right-[28px] top-[46%] w-[300px] xl:w-[330px] rounded-[26px] border border-[#ffffff40] overflow-hidden p-[24px_25px_28px] shadow-[0_16px_36px_rgba(0,0,0,0.35)] backdrop-blur-[24px] pointer-events-auto isolation-auto"
        >
          {/* Synchronized live blurred canvas layer */}
          {!stillness && (
            <canvas
              ref={canvas2Ref}
              className="absolute -inset-[24px] pointer-events-none"
              style={{ filter: 'blur(24px)' }}
            />
          )}

          {/* Warm Tint Overlay */}
          <div className="absolute inset-0 card-tint pointer-events-none" />

          {/* Card Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] tracking-[0.2em] font-medium text-[#d9a588] uppercase">
                {CARDS[1].kicker}
              </span>
              <Sun className="w-4 h-4 text-[#fffdf8]/70" />
            </div>
            <h3 className="text-[25px] xl:text-[27px] font-normal text-[#fffdf8] leading-tight mb-3">
              {CARDS[1].title}
            </h3>
            <p className="text-[15px] xl:text-[16px] leading-[1.38] text-[#d6c8bc] font-light">
              {CARDS[1].body}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Layout (<= 900px): Positioned above the lower headlines */}
      <div className="block min-[901px]:hidden w-full h-full relative">
        {/* Mobile Card 1: Left 18px, Top 96px (top 86px on short screens) */}
        <div
          ref={card1Ref}
          className="absolute left-[18px] top-[96px] max-h-[140px] w-[calc(100%-68px)] max-w-[300px] rounded-[22px] border border-[#ffffff40] overflow-hidden p-[16px_18px_18px] shadow-lg backdrop-blur-[20px] pointer-events-auto"
        >
          {!stillness && (
            <canvas
              ref={canvas1Ref}
              className="absolute -inset-[24px] pointer-events-none"
              style={{ filter: 'blur(24px)' }}
            />
          )}
          <div className="absolute inset-0 card-tint pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] tracking-[0.2em] font-medium text-[#d9a588] uppercase">
                {CARDS[0].kicker}
              </span>
              <Waves className="w-3.5 h-3.5 text-[#fffdf8]/70" />
            </div>
            <h3 className="text-[21px] font-normal text-[#fffdf8] leading-tight mb-1.5">
              {CARDS[0].title}
            </h3>
            <p className="text-[13px] leading-[1.35] text-[#d6c8bc] font-light">
              {CARDS[0].body}
            </p>
          </div>
        </div>

        {/* Mobile Card 2: Right 18px, Top 259px (top 224px on short screens) */}
        <div
          ref={card2Ref}
          className="absolute right-[18px] top-[259px] max-h-[140px] w-[calc(100%-68px)] max-w-[300px] rounded-[22px] border border-[#ffffff40] overflow-hidden p-[16px_18px_18px] shadow-lg backdrop-blur-[20px] pointer-events-auto"
        >
          {!stillness && (
            <canvas
              ref={canvas2Ref}
              className="absolute -inset-[24px] pointer-events-none"
              style={{ filter: 'blur(24px)' }}
            />
          )}
          <div className="absolute inset-0 card-tint pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] tracking-[0.2em] font-medium text-[#d9a588] uppercase">
                {CARDS[1].kicker}
              </span>
              <Sun className="w-3.5 h-3.5 text-[#fffdf8]/70" />
            </div>
            <h3 className="text-[21px] font-normal text-[#fffdf8] leading-tight mb-1.5">
              {CARDS[1].title}
            </h3>
            <p className="text-[13px] leading-[1.35] text-[#d6c8bc] font-light">
              {CARDS[1].body}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
