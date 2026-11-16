import React, { useEffect, useRef } from 'react';

type CursorMode = 'default' | 'pointer' | 'play' | 'view' | 'drag';

/**
 * Uncommon Director's Kinetic Aperture Reticle & Optical Trail Cursor:
 * - Contrast-adaptive: Automatically switches ink tones between Daylight Gradient surfaces
 *   and dark Obsidian Islands / Dark Mode so it stays razor-sharp everywhere.
 * - Velocity-reactive aperture ring with 4 rotating cinema viewfinder brackets.
 * - 3 staggered micro trailing light motes creating a subtle liquid ribbon on motion.
 * - Interactive magnetic pill morphing into PLAY / VIEW / 3D reticles + click shockwave ripple.
 * - Automatically disabled on touch devices, prefers-reduced-motion, and native text/video inputs.
 */
export const StudioCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const bracketsRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isTouchOnly =
      window.matchMedia?.('(pointer: coarse)').matches ||
      !window.matchMedia?.('(hover: hover)').matches;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (isTouchOnly || reducedMotion) return;

    let mouseX = -120;
    let mouseY = -120;
    let dotX = -120;
    let dotY = -120;
    let ringX = -120;
    let ringY = -120;
    const trailPos = [
      { x: -120, y: -120 },
      { x: -120, y: -120 },
      { x: -120, y: -120 }
    ];

    let isVisible = false;
    let isPressed = false;
    let isOverNativeControl = false;
    let currentMode: CursorMode = 'default';
    let currentOverDarkSurface = false;
    let bracketAngle = 0;
    let lastClientX = -120;
    let lastClientY = -120;
    let rafId = 0;

    const isSurfaceDark = (target: EventTarget | null): boolean => {
      const theme = document.documentElement.getAttribute('data-theme') || 'light';
      if (theme !== 'light') return true;
      if (target instanceof Element) {
        if (
          target.closest(
            '.obsidian-island, footer.bg-\\[\\#121419\\], .bg-black, [role="dialog"]'
          )
        ) {
          return true;
        }
      }
      return false;
    };

    const getAccentColor = (): string => {
      const computed = getComputedStyle(document.documentElement)
        .getPropertyValue('--brand-orange')
        .trim();
      return computed || '#E4583B';
    };

    const applyModeStyles = (
      mode: CursorMode,
      pressed: boolean,
      visible: boolean,
      overDark: boolean,
      hideCustom: boolean
    ) => {
      const dot = dotRef.current;
      const ring = ringRef.current;
      const label = labelRef.current;
      const brackets = bracketsRef.current;
      if (!dot || !ring || !label || !brackets) return;

      const accent = getAccentColor();
      const shouldShow = visible && !hideCustom;

      dot.style.opacity = shouldShow
        ? mode === 'play' || mode === 'view' || mode === 'drag'
          ? '0'
          : '1'
        : '0';
      ring.style.opacity = shouldShow ? '1' : '0';

      let size = 36;
      let labelText = '';
      let bg = overDark ? 'rgba(244, 240, 232, 0.05)' : 'rgba(20, 22, 26, 0.04)';
      let borderColor = overDark ? 'rgba(244, 240, 232, 0.48)' : 'rgba(20, 22, 26, 0.34)';
      let textColor = overDark ? '#F4F0E8' : '#14161A';
      let bracketColor = accent;

      if (mode === 'play') {
        size = 66;
        labelText = 'PLAY';
        bg = overDark ? 'rgba(244, 240, 232, 0.96)' : '#14161A';
        borderColor = overDark ? '#FFFFFF' : '#14161A';
        textColor = overDark ? '#111318' : '#FAF8F3';
        bracketColor = accent;
      } else if (mode === 'view') {
        size = 64;
        labelText = 'VIEW';
        bg = overDark ? 'rgba(18, 20, 26, 0.88)' : 'rgba(20, 22, 26, 0.90)';
        borderColor = accent;
        textColor = '#FAF8F3';
        bracketColor = '#F4F0E8';
      } else if (mode === 'drag') {
        size = 58;
        labelText = '3D';
        bg = overDark ? 'rgba(18, 20, 26, 0.86)' : 'rgba(20, 22, 26, 0.88)';
        borderColor = overDark ? 'rgba(244, 240, 232, 0.65)' : accent;
        textColor = '#FAF8F3';
        bracketColor = accent;
      } else if (mode === 'pointer') {
        size = 46;
        bg = overDark ? 'rgba(228, 88, 59, 0.14)' : 'rgba(209, 74, 43, 0.10)';
        borderColor = accent;
        bracketColor = overDark ? '#F4F0E8' : '#14161A';
      }

      const pressScale = pressed ? 0.84 : 1;
      ring.style.width = `${size}px`;
      ring.style.height = `${size}px`;
      ring.style.backgroundColor = bg;
      ring.style.borderColor = borderColor;
      ring.style.color = textColor;
      ring.style.boxShadow =
        mode === 'play' || mode === 'view' || mode === 'drag'
          ? `0 12px 28px -8px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.16)`
          : overDark
          ? '0 0 18px rgba(244, 240, 232, 0.08)'
          : '0 6px 18px -6px rgba(20, 22, 26, 0.16)';
      ring.dataset.scale = String(pressScale);

      // Update corner viewfinder brackets tint
      brackets.style.color = bracketColor;
      brackets.style.opacity =
        mode === 'pointer' || mode === 'play' || mode === 'view' || mode === 'drag'
          ? '0.95'
          : '0.68';

      // Precision central ink/ivory core
      dot.style.backgroundColor = overDark ? '#F4F0E8' : '#14161A';
      dot.style.boxShadow = overDark
        ? `0 0 10px ${accent}, 0 0 4px rgba(255, 255, 255, 0.8)`
        : `0 0 8px rgba(209, 74, 43, 0.35)`;

      if (labelText) {
        label.textContent = labelText;
        label.style.opacity = '1';
      } else {
        label.textContent = '';
        label.style.opacity = '0';
      }
    };

    const resolveMode = (target: EventTarget | null): { mode: CursorMode; nativeOnly: boolean } => {
      if (!(target instanceof Element)) return { mode: 'default', nativeOnly: false };

      if (target.closest('input, textarea, select, iframe, [data-native-cursor]')) {
        return { mode: 'default', nativeOnly: true };
      }

      const customZone = target.closest('[data-cursor]') as HTMLElement | null;
      if (customZone) {
        const val = customZone.dataset.cursor;
        if (val === 'play' || val === 'view' || val === 'drag') {
          return { mode: val, nativeOnly: false };
        }
      }

      const clickable = target.closest('a, button, [role="button"], label');
      if (clickable) return { mode: 'pointer', nativeOnly: false };

      return { mode: 'default', nativeOnly: false };
    };

    const triggerRipple = (x: number, y: number) => {
      const ripple = rippleRef.current;
      if (!ripple || isOverNativeControl) return;
      const accent = getAccentColor();
      ripple.style.borderColor = accent;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.transition = 'none';
      ripple.style.transform = 'translate3d(-50%, -50%, 0) scale(0.35)';
      ripple.style.opacity = '0.85';

      // Force style flush cleanly for crisp replay
      void ripple.offsetWidth;

      ripple.style.transition =
        'transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 420ms ease-out';
      ripple.style.transform = 'translate3d(-50%, -50%, 0) scale(2.15)';
      ripple.style.opacity = '0';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        dotX = mouseX;
        dotY = mouseY;
        ringX = mouseX;
        ringY = mouseY;
        lastClientX = mouseX;
        lastClientY = mouseY;
        trailPos.forEach((p) => {
          p.x = mouseX;
          p.y = mouseY;
        });
        isVisible = true;
      }

      const { mode, nativeOnly } = resolveMode(e.target);
      const darkSurface = isSurfaceDark(e.target);

      if (
        mode !== currentMode ||
        darkSurface !== currentOverDarkSurface ||
        nativeOnly !== isOverNativeControl ||
        (ringRef.current && ringRef.current.style.opacity !== '1' && !nativeOnly)
      ) {
        currentMode = mode;
        currentOverDarkSurface = darkSurface;
        isOverNativeControl = nativeOnly;
        applyModeStyles(currentMode, isPressed, isVisible, currentOverDarkSurface, isOverNativeControl);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      isPressed = true;
      applyModeStyles(currentMode, isPressed, isVisible, currentOverDarkSurface, isOverNativeControl);
      triggerRipple(e.clientX, e.clientY);
    };

    const onPointerUp = () => {
      isPressed = false;
      applyModeStyles(currentMode, isPressed, isVisible, currentOverDarkSurface, isOverNativeControl);
    };

    const onMouseLeave = () => {
      isVisible = false;
      applyModeStyles(currentMode, isPressed, false, currentOverDarkSurface, isOverNativeControl);
      trailRefs.current.forEach((el) => {
        if (el) el.style.opacity = '0';
      });
    };

    let lastTime = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      if (isVisible) {
        const vx = mouseX - lastClientX;
        const vy = mouseY - lastClientY;
        lastClientX = mouseX;
        lastClientY = mouseY;

        const speed = Math.hypot(vx, vy);
        const dotFactor = 1 - Math.exp(-44 * dt);
        const ringFactor = 1 - Math.exp(-15 * dt);

        dotX += (mouseX - dotX) * dotFactor;
        dotY += (mouseY - dotY) * dotFactor;
        ringX += (mouseX - ringX) * ringFactor;
        ringY += (mouseY - ringY) * ringFactor;

        // Subtle continuous cinema reticle spin boosted gently by movement
        bracketAngle = (bracketAngle + dt * (18 + Math.min(90, speed * 1.6))) % 360;

        // Smooth velocity stretch on outer ring when moving swiftly
        const dxRing = ringX - mouseX;
        const dyRing = ringY - mouseY;
        const lagDist = Math.hypot(dxRing, dyRing);
        const stretch =
          currentMode === 'default' || currentMode === 'pointer'
            ? Math.min(0.18, lagDist * 0.0038)
            : 0;
        const travelAngle = Math.atan2(dyRing, dxRing) * (180 / Math.PI);

        if (dotRef.current) {
          dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate3d(-50%, -50%, 0)`;
        }

        if (ringRef.current) {
          const baseScale = Number(ringRef.current.dataset.scale || '1');
          const sx = (baseScale * (1 + stretch)).toFixed(3);
          const sy = (baseScale * (1 - stretch * 0.45)).toFixed(3);
          ringRef.current.style.transform =
            stretch > 0.012
              ? `translate3d(${ringX}px, ${ringY}px, 0) translate3d(-50%, -50%, 0) rotate(${travelAngle.toFixed(
                  1
                )}deg) scale(${sx}, ${sy}) rotate(${(-travelAngle).toFixed(1)}deg)`
              : `translate3d(${ringX}px, ${ringY}px, 0) translate3d(-50%, -50%, 0) scale(${baseScale})`;
        }

        if (bracketsRef.current) {
          bracketsRef.current.style.transform = `rotate(${bracketAngle.toFixed(1)}deg)`;
        }

        // Update 3 staggered liquid ribbon motes behind focal point
        const accent = getAccentColor();
        const trailRates = [24, 15, 9];
        for (let i = 0; i < 3; i++) {
          const prev = i === 0 ? { x: dotX, y: dotY } : trailPos[i - 1];
          const f = 1 - Math.exp(-trailRates[i] * dt);
          trailPos[i].x += (prev.x - trailPos[i].x) * f;
          trailPos[i].y += (prev.y - trailPos[i].y) * f;

          const mote = trailRefs.current[i];
          if (mote) {
            const dist = Math.hypot(trailPos[i].x - dotX, trailPos[i].y - dotY);
            const showTrail =
              !isOverNativeControl &&
              currentMode !== 'play' &&
              currentMode !== 'view' &&
              currentMode !== 'drag' &&
              dist > 2.2;
            mote.style.opacity = showTrail ? String((0.55 - i * 0.14).toFixed(2)) : '0';
            mote.style.backgroundColor = i === 0 ? accent : currentOverDarkSurface ? '#F4F0E8' : '#14161A';
            mote.style.transform = `translate3d(${trailPos[i].x}px, ${trailPos[i].y}px, 0) translate3d(-50%, -50%, 0)`;
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <>
      {/* 3 Staggered Kinetic Ribbon Motes */}
      {[0, 1, 2].map((idx) => (
        <div
          key={idx}
          ref={(el) => {
            trailRefs.current[idx] = el;
          }}
          aria-hidden="true"
          className="fixed top-0 left-0 z-[9996] rounded-full pointer-events-none transition-opacity duration-150"
          style={{
            width: `${5.5 - idx * 1.1}px`,
            height: `${5.5 - idx * 1.1}px`,
            opacity: 0,
            willChange: 'transform, opacity'
          }}
        />
      ))}

      {/* Click Shockwave Pulse Ring */}
      <div
        ref={rippleRef}
        aria-hidden="true"
        className="fixed top-0 left-0 z-[9997] w-7 h-7 rounded-full border pointer-events-none"
        style={{
          opacity: 0,
          willChange: 'transform, opacity'
        }}
      />

      {/* Outer Kinetic Aperture Ring with Rotating Viewfinder Brackets */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="fixed top-0 left-0 z-[9998] pointer-events-none rounded-full border flex items-center justify-center transition-[width,height,background-color,border-color,opacity,color] duration-200 ease-out"
        style={{
          width: '36px',
          height: '36px',
          opacity: 0,
          borderColor: 'rgba(20, 22, 26, 0.34)',
          backgroundColor: 'rgba(20, 22, 26, 0.04)',
          willChange: 'transform, width, height'
        }}
      >
        {/* 4 Precision Cinema Aperture Viewfinder Ticks */}
        <div
          ref={bracketsRef}
          className="absolute -inset-[5px] pointer-events-none transition-opacity duration-200"
          style={{ willChange: 'transform' }}
        >
          <span className="absolute top-0 left-0 w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-current rounded-tl-[2px]" />
          <span className="absolute top-0 right-0 w-2 h-2 border-t-[1.5px] border-r-[1.5px] border-current rounded-tr-[2px]" />
          <span className="absolute bottom-0 left-0 w-2 h-2 border-b-[1.5px] border-l-[1.5px] border-current rounded-bl-[2px]" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-current rounded-br-[2px]" />
        </div>

        <span
          ref={labelRef}
          className="text-[10px] font-sans font-bold tracking-[0.16em] select-none transition-opacity duration-150"
          style={{ opacity: 0 }}
        />
      </div>

      {/* Inner Precision Optical Core */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed top-0 left-0 z-[9999] w-2 h-2 rounded-full pointer-events-none transition-opacity duration-150"
        style={{
          opacity: 0,
          backgroundColor: '#14161A',
          willChange: 'transform'
        }}
      />
    </>
  );
};
