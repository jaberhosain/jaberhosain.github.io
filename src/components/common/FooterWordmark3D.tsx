import React, { useMemo, useRef, useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';

/**
 * Monumental 3D sculpted obsidian wordmark integrated seamlessly into the footer floor.
 * Inspired by dark low-relief architectural typography with multi-layer Z extrusion
 * and subtle cursor-tracked studio rim lighting.
 */
export const FooterWordmark3D: React.FC = () => {
  const { portfolio } = usePortfolio();
  const stageRef = useRef<HTMLDivElement>(null);

  const [motion, setMotion] = useState({
    rotX: 4,
    rotY: 0,
    spotX: 50,
    spotY: 22,
    active: false
  });

  const displayWordmark = useMemo(() => {
    const raw = (portfolio.hero?.name?.en || 'MD. Jaber Hosain').trim();
    const withoutPrefix = raw.replace(/^md\.?\s+/i, '').trim();
    return (withoutPrefix || raw).toLowerCase();
  }, [portfolio.hero?.name?.en]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const normX = (e.clientX - rect.left) / rect.width;
    const normY = (e.clientY - rect.top) / rect.height;

    setMotion({
      rotX: 4 + (0.5 - normY) * 8,
      rotY: (normX - 0.5) * 9,
      spotX: normX * 100,
      spotY: normY * 100,
      active: true
    });
  };

  const handleMouseLeave = () => {
    setMotion({
      rotX: 4,
      rotY: 0,
      spotX: 50,
      spotY: 22,
      active: false
    });
  };

  const typeStyle: React.CSSProperties = {
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    fontSize: 'clamp(2.35rem, 11.4vw, 11.4rem)',
    fontWeight: 800,
    lineHeight: 0.9,
    letterSpacing: '-0.048em'
  };

  return (
    <div
      ref={stageRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-hidden="true"
      className="footer-wordmark-stage relative w-full max-w-[1440px] mx-auto px-3 sm:px-6 pt-10 sm:pt-14 pb-2 sm:pb-4 overflow-hidden select-none cursor-default"
      style={{ perspective: '1150px' }}
    >
      {/* Subtle grounded floor ambient vignette behind the wordmark */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 opacity-70"
        style={{
          background:
            'radial-gradient(70% 100% at 50% 100%, rgba(0, 0, 0, 0.55) 0%, transparent 78%)'
        }}
      />

      <div
        className="footer-wordmark-3d-wrap relative flex items-center justify-center preserve-3d transition-transform duration-500 ease-out"
        style={{
          transform: `rotateX(${motion.rotX.toFixed(2)}deg) rotateY(${motion.rotY.toFixed(2)}deg)`
        }}
      >
        <div
          className="relative inline-block whitespace-nowrap text-center footer-wordmark-mask"
          style={typeStyle}
        >
          {/* Layer 0: Deep Soft Ground Shadow */}
          <span
            className="footer-wordmark-shadow pointer-events-none absolute inset-0 block"
            style={{
              transform: 'translate3d(0, 12px, -22px)',
              filter: 'blur(14px)'
            }}
          >
            {displayWordmark}
          </span>

          {/* Layers 1-3: 3D Extruded Depth Slabs */}
          <span
            className="footer-wordmark-extrude-deep pointer-events-none absolute inset-0 block"
            style={{ transform: 'translate3d(0, 7px, -14px)' }}
          >
            {displayWordmark}
          </span>
          <span
            className="footer-wordmark-extrude-mid pointer-events-none absolute inset-0 block"
            style={{ transform: 'translate3d(0, 4px, -8px)' }}
          >
            {displayWordmark}
          </span>
          <span
            className="footer-wordmark-extrude-near pointer-events-none absolute inset-0 block"
            style={{ transform: 'translate3d(0, 2px, -4px)' }}
          >
            {displayWordmark}
          </span>

          {/* Layer 4: Primary Sculpted Relief Face with Top Specular Rim */}
          <span className="footer-wordmark-face relative block">
            {displayWordmark}
          </span>

          {/* Layer 5: Cursor-Tracked Specular Light Sheen & Etched Outline Rim */}
          <span
            className="footer-wordmark-sheen pointer-events-none absolute inset-0 block transition-opacity duration-300"
            style={{
              opacity: motion.active ? 1 : 0.42,
              backgroundImage: `radial-gradient(420px circle at ${motion.spotX}% ${motion.spotY}%, rgba(255, 248, 238, 0.24) 0%, rgba(228, 88, 59, 0.08) 42%, transparent 72%)`,
              WebkitMaskImage: `radial-gradient(360px circle at ${motion.spotX}% ${motion.spotY}%, #000 0%, rgba(0,0,0,0.6) 45%, transparent 78%)`,
              maskImage: `radial-gradient(360px circle at ${motion.spotX}% ${motion.spotY}%, #000 0%, rgba(0,0,0,0.6) 45%, transparent 78%)`
            }}
          >
            {displayWordmark}
          </span>
        </div>
      </div>
    </div>
  );
};
