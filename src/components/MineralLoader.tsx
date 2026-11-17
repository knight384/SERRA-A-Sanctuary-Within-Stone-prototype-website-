import React, { useEffect, useRef, useState } from 'react';
import { clamp } from '../utils/math';

interface MineralLoaderProps {
  progress: number; // 0 to 100
  isReady: boolean;
  onRevealComplete: () => void;
  reducedMotion: boolean;
}

export const MineralLoader: React.FC<MineralLoaderProps> = ({
  progress,
  isReady,
  onRevealComplete,
  reducedMotion
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animatingReveal, setAnimatingReveal] = useState<boolean>(false);
  const [labelsFading, setLabelsFading] = useState<boolean>(false);
  const revealStartTime = useRef<number | null>(null);

  // If reduced motion is requested, complete immediately
  useEffect(() => {
    if (reducedMotion) {
      onRevealComplete();
    }
  }, [reducedMotion, onRevealComplete]);

  // Start reveal animation when ready
  useEffect(() => {
    if (isReady && !animatingReveal && !reducedMotion) {
      setAnimatingReveal(true);
      setLabelsFading(true);
    }
  }, [isReady, animatingReveal, reducedMotion]);

  // Canvas expanding transparent opening animation
  useEffect(() => {
    if (!animatingReveal || reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      onRevealComplete();
      return;
    }

    const internalWidth = 300;
    const aspect = window.innerHeight / window.innerWidth;
    const internalHeight = Math.max(150, Math.round(internalWidth * aspect));

    canvas.width = internalWidth;
    canvas.height = internalHeight;

    const imgData = ctx.createImageData(internalWidth, internalHeight);
    const data = imgData.data;
    const w = internalWidth;
    const h = internalHeight;

    let animId: number;

    const drawFrame = (timestamp: number) => {
      if (revealStartTime.current === null) {
        revealStartTime.current = timestamp;
      }

      const elapsedMs = timestamp - revealStartTime.current;
      const t = clamp(elapsedMs / 1150);

      // Section 12 exact formula
      const radius = t * 1.25 - 0.08;

      let pixelIndex = 0;
      for (let y = 0; y < h; y++) {
        const yNorm = (y / h - 0.43) * 0.83;
        for (let x = 0; x < w; x++) {
          const xNorm = x / w - 0.51;

          const noise =
            Math.sin(x * 0.041 + y * 0.018) * 0.035 +
            Math.sin(y * 0.095 - x * 0.067) * 0.025 +
            Math.sin(x * 0.27 + y * 0.16) * 0.012;

          const d = Math.hypot(xNorm, yNorm) + noise;
          const edge = d - radius;
          const alpha = clamp(edge / 0.065);
          const rim = 1 - clamp(Math.abs(edge) / 0.085);

          data[pixelIndex] = Math.round(169 + rim * 55);
          data[pixelIndex + 1] = Math.round(132 + rim * 51);
          data[pixelIndex + 2] = Math.round(107 + rim * 44);
          data[pixelIndex + 3] = Math.round(alpha * 255);

          pixelIndex += 4;
        }
      }

      ctx.putImageData(imgData, 0, 0);

      if (elapsedMs < 1150) {
        animId = requestAnimationFrame(drawFrame);
      } else {
        onRevealComplete();
      }
    };

    animId = requestAnimationFrame(drawFrame);

    return () => cancelAnimationFrame(animId);
  }, [animatingReveal, onRevealComplete, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none select-none flex flex-col justify-between p-7"
      aria-live="polite"
      aria-label="Loading sanctuary environment"
    >
      {/* Background veil canvas or flat color */}
      {animatingReveal ? (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ imageRendering: 'auto' }}
        />
      ) : (
        <div className="absolute inset-0 bg-[#a9846b]" />
      )}

      {/* Top Bar Labels */}
      <div
        className={`relative z-10 flex justify-between items-start transition-opacity duration-250 ${
          labelsFading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <span className="text-[32px] md:text-[39px] font-[450] tracking-[0.18em] text-[#fffdf8] leading-none">
          SERRA
        </span>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#fffdf8]/80 font-medium">
          <span className="text-xs">✦</span>
          <span>A SANCTUARY WITHIN STONE</span>
        </div>
      </div>

      {/* Bottom Bar Labels and Progress */}
      <div
        className={`relative z-10 flex justify-between items-end transition-opacity duration-250 ${
          labelsFading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="font-serif italic text-6xl md:text-8xl text-[#fffdf8] leading-none tracking-tight">
          {Math.round(progress)}
          <span className="text-3xl md:text-4xl not-italic ml-1 opacity-70">%</span>
        </div>
        <p className="text-sm md:text-base font-light tracking-wide text-[#fffdf8]/90">
          Good things take a moment.
        </p>
      </div>

      {/* 4px Ivory Bottom Progress Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#fffdf8]/20 z-10">
        <div
          className="h-full bg-[#fffdf8] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
