import React, { useEffect, useMemo, useRef } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';

/**
 * Interactive cursor-tracked architectural outline wordmark for the Hero backdrop.
 * Tracks cursor position across the full hero stage with spring-damped motion at 60fps
 * and zero React re-renders, lighting transparent-fill hairline strokes on hover.
 */
export const HeroBackdropName: React.FC = () => {
  const { portfolio, loc, language } = usePortfolio();
  const containerRef = useRef<HTMLDivElement>(null);

  const lines = useMemo(() => {
    const raw = (loc(portfolio.hero?.name) || 'MD. JABER HOSAIN').trim();
    if (language !== 'en') {
      return [raw];
    }
    const clean = raw.replace(/^md\.?\s+/i, '').trim() || raw;
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return [parts.slice(0, -1).join(' ').toUpperCase(), parts[parts.length - 1].toUpperCase()];
    }
    return [clean.toUpperCase()];
  }, [loc, portfolio.hero?.name, language]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let rect = el.getBoundingClientRect();
    let targetX = rect.width * 0.56;
    let targetY = rect.height * 0.45;
    let currentX = targetX;
    let currentY = targetY;
    let pointerInside = false;
    let currentOpacity = 0.65;
    let targetOpacity = 0.65;
    let rafId = 0;
    const startTime = performance.now();

    const updateRect = () => {
      if (!containerRef.current) return;
      rect = containerRef.current.getBoundingClientRect();
    };

    const onPointerMove = (e: PointerEvent) => {
      updateRect();
      if (rect.width === 0 || rect.height === 0) return;

      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      if (relY >= -90 && relY <= rect.height + 120) {
        pointerInside = true;
        targetX = relX;
        targetY = relY;
        targetOpacity = 1;
      } else {
        pointerInside = false;
        targetOpacity = 0.6;
      }
    };

    const onPointerLeave = () => {
      pointerInside = false;
      targetOpacity = 0.6;
    };

    el.style.setProperty('--spot-x', `${targetX.toFixed(1)}px`);
    el.style.setProperty('--spot-y', `${targetY.toFixed(1)}px`);
    el.style.setProperty('--spot-opacity', prefersReduced ? '0.52' : '0.65');
    el.style.setProperty('--px', '0px');
    el.style.setProperty('--py', '0px');
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');

    if (prefersReduced) {
      window.addEventListener('resize', updateRect, { passive: true });
      return () => window.removeEventListener('resize', updateRect);
    }

    const animate = (now: number) => {
      const t = (now - startTime) * 0.001;

      if (!pointerInside && rect.width > 0 && rect.height > 0) {
        // Gentle idle cinema sweep across the giant outlined letters
        targetX = rect.width * (0.5 + Math.sin(t * 0.42) * 0.34);
        targetY = rect.height * (0.46 + Math.cos(t * 0.31) * 0.22);
      }

      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;
      currentOpacity += (targetOpacity - currentOpacity) * 0.08;

      el.style.setProperty('--spot-x', `${currentX.toFixed(1)}px`);
      el.style.setProperty('--spot-y', `${currentY.toFixed(1)}px`);
      el.style.setProperty('--spot-opacity', currentOpacity.toFixed(3));

      if (rect.width > 0 && rect.height > 0) {
        const nx = (currentX / rect.width - 0.5) * 2;
        const ny = (currentY / rect.height - 0.5) * 2;
        el.style.setProperty('--px', `${(-nx * 9).toFixed(2)}px`);
        el.style.setProperty('--py', `${(-ny * 6).toFixed(2)}px`);
        el.style.setProperty('--ry', `${(nx * 1.4).toFixed(2)}deg`);
        el.style.setProperty('--rx', `${(-ny * 1.1).toFixed(2)}deg`);
      }

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave);
    window.addEventListener('resize', updateRect, { passive: true });
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseleave', onPointerLeave);
      window.removeEventListener('resize', updateRect);
    };
  }, []);

  const isSingleLine = lines.length === 1;
  const wordmarkTypography: React.CSSProperties = {
    fontFamily:
      language === 'bn'
        ? 'var(--font-bangla)'
        : "'Plus Jakarta Sans', 'Space Grotesk', system-ui, sans-serif",
    fontSize: isSingleLine
      ? 'clamp(4.1rem, 16vw, 14.5rem)'
      : 'clamp(4.15rem, 15.8vw, 13.8rem)',
    fontWeight: 800,
    lineHeight: language === 'bn' ? 1.05 : 0.86,
    letterSpacing: language === 'en' ? '-0.048em' : '-0.01em',
    transform:
      'perspective(1400px) translate3d(var(--px, 0px), var(--py, 0px), 0) rotateY(var(--ry, 0deg)) rotateX(var(--rx, 0deg))'
  };

  const renderLines = (prefix: string) =>
    lines.map((line, i) => (
      <span key={`${prefix}-${i}`} className="block">
        {line}
      </span>
    ));

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="hero-backdrop-wordmark pointer-events-none absolute inset-0 z-[3] overflow-hidden select-none"
      style={
        {
          '--spot-x': '56%',
          '--spot-y': '45%',
          '--spot-opacity': '0.65',
          '--px': '0px',
          '--py': '0px',
          '--rx': '0deg',
          '--ry': '0deg'
        } as React.CSSProperties
      }
    >
      {/* Ambient Subtle Spotlight Halo */}
      <div
        className="hero-backdrop-aura absolute inset-0 pointer-events-none"
        style={{
          opacity: 'var(--spot-opacity)' as unknown as number,
          background:
            'radial-gradient(500px circle at var(--spot-x) var(--spot-y), rgba(255, 255, 255, 0.035) 0%, rgba(228, 88, 59, 0.024) 38%, transparent 74%)'
        }}
      />

      {/* Layer 1: Always-on Subtle Architectural Etched Outline */}
      <div className="absolute inset-0 flex items-center justify-center px-2 sm:px-6">
        <div
          className="hero-stroke-base flex flex-col items-center justify-center text-center whitespace-nowrap will-change-transform"
          style={wordmarkTypography}
        >
          {renderLines('base')}
        </div>
      </div>

      {/* Layer 2: Precision Cursor Spotlight Crisp Chrome Hairline Outline */}
      <div
        className="absolute inset-0 flex items-center justify-center px-2 sm:px-6"
        style={{
          opacity: 'var(--spot-opacity)' as unknown as number,
          WebkitMaskImage:
            'radial-gradient(400px circle at var(--spot-x) var(--spot-y), #000 0%, rgba(0,0,0,0.72) 38%, rgba(0,0,0,0.16) 62%, transparent 78%)',
          maskImage:
            'radial-gradient(400px circle at var(--spot-x) var(--spot-y), #000 0%, rgba(0,0,0,0.72) 38%, rgba(0,0,0,0.16) 62%, transparent 78%)'
        }}
      >
        <div
          className="hero-stroke-spot flex flex-col items-center justify-center text-center whitespace-nowrap will-change-transform"
          style={wordmarkTypography}
        >
          {renderLines('spot')}
        </div>
      </div>

      {/* Layer 3: Inner Studio Accent Rim Trace */}
      <div
        className="absolute inset-0 flex items-center justify-center px-2 sm:px-6"
        style={{
          opacity: 'var(--spot-opacity)' as unknown as number,
          WebkitMaskImage:
            'radial-gradient(210px circle at var(--spot-x) var(--spot-y), #000 0%, rgba(0,0,0,0.5) 44%, transparent 78%)',
          maskImage:
            'radial-gradient(210px circle at var(--spot-x) var(--spot-y), #000 0%, rgba(0,0,0,0.5) 44%, transparent 78%)'
        }}
      >
        <div
          className="hero-stroke-accent flex flex-col items-center justify-center text-center whitespace-nowrap will-change-transform"
          style={wordmarkTypography}
        >
          {renderLines('accent')}
        </div>
      </div>
    </div>
  );
};
