import React, { useEffect, useRef, useState } from 'react';

interface CustomCursorProps {
  hidden: boolean;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ hidden }) => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const [isFinePointer, setIsFinePointer] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isOverExplore, setIsOverExplore] = useState<boolean>(false);

  const mousePos = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const ringPos = useRef<{ x: number; y: number }>({ x: -100, y: -100 });

  useEffect(() => {
    const checkFinePointer = () => {
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      setIsFinePointer(fine);
      if (fine && !hidden) {
        document.body.classList.add('custom-cursor-active');
      } else {
        document.body.classList.remove('custom-cursor-active');
      }
    };

    checkFinePointer();
    window.addEventListener('resize', checkFinePointer);

    return () => {
      window.removeEventListener('resize', checkFinePointer);
      document.body.classList.remove('custom-cursor-active');
    };
  }, [hidden]);

  useEffect(() => {
    if (!isFinePointer || hidden) {
      document.body.classList.remove('custom-cursor-active');
      return;
    }

    document.body.classList.add('custom-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      mousePos.current = { x: e.clientX, y: e.clientY };

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX - 4}px, ${e.clientY - 4}px, 0)`;
      }

      // Check if hovering interactive target
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = !!target.closest('a, button, select, [role="button"], input');
        setIsHovered(interactive);

        const exploreCta = !!target.closest('.explore-serra-cta');
        setIsOverExplore(exploreCta);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min(50, time - lastTime);
      lastTime = time;

      // Circle smoothing: 1 - Math.pow(0.82, dt/16.667)
      const alpha = 1 - Math.pow(0.82, dt / 16.667);
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * alpha;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * alpha;

      const size = isHovered ? 53 : 36;
      const offset = size / 2;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x - offset}px, ${ringPos.current.y - offset}px, 0)`;
      }

      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y + offset + 6}px, 0)`;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animId);
      document.body.classList.remove('custom-cursor-active');
    };
  }, [isFinePointer, hidden, isHovered]);

  if (!isFinePointer || hidden || !isVisible) return null;

  const size = isHovered ? 53 : 36;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden select-none" aria-hidden="true">
      {/* 8px Ivory Dot following directly */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-[#fffdf8] shadow-sm pointer-events-none"
        style={{ willChange: 'transform' }}
      />

      {/* Thin outlined circle following smoothly */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 rounded-full border transition-[width,height,background-color] duration-200 pointer-events-none ${
          isHovered
            ? 'border-[#fffdf8]/80 bg-[#fffdf8]/15'
            : 'border-[#fffdf8]/50 bg-transparent'
        }`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          willChange: 'transform'
        }}
      />

      {/* Tiny "Enter" word under circle when over Explore Serra */}
      {isOverExplore && (
        <div
          ref={labelRef}
          className="fixed top-0 left-0 -translate-x-1/2 pointer-events-none text-[9px] tracking-[0.2em] uppercase font-medium text-[#fffdf8] px-1 py-0.5 rounded bg-black/60 shadow"
        >
          Enter
        </div>
      )}
    </div>
  );
};
