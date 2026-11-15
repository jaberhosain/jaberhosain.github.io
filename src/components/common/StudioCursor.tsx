import React, { useEffect, useRef } from 'react';

type CursorMode = 'default' | 'pointer' | 'play' | 'view' | 'drag';

/**
 * Monochrome Frosted Optical Studio Cursor:
 * Crisp circular glass ring with subtle central white focal point matching
 * international editorial showcase studios, morphing seamlessly into frosted
 * smoked-glass PLAY / VIEW / 3D reticles over interactive targets.
 * Automatically disabled on touch devices and prefers-reduced-motion.
 */
export const StudioCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isTouchOnly =
      window.matchMedia?.('(pointer: coarse)').matches ||
      !window.matchMedia?.('(hover: hover)').matches;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (isTouchOnly || reducedMotion) return;

    let mouseX = -100;
    let mouseY = -100;
    let dotX = -100;
    let dotY = -100;
    let ringX = -100;
    let ringY = -100;
    let isVisible = false;
    let isPressed = false;
    let currentMode: CursorMode = 'default';
    let rafId = 0;

    const applyModeStyles = (mode: CursorMode, pressed: boolean, visible: boolean) => {
      const dot = dotRef.current;
      const ring = ringRef.current;
      const label = labelRef.current;
      if (!dot || !ring || !label) return;

      dot.style.opacity = visible ? (mode === 'play' || mode === 'view' || mode === 'drag' ? '0' : '1') : '0';
      ring.style.opacity = visible ? '1' : '0';

      let size = 34;
      let labelText = '';
      let bg = 'rgba(255, 255, 255, 0.04)';
      let borderColor = 'rgba(255, 255, 255, 0.42)';

      if (mode === 'play') {
        size = 64;
        labelText = 'PLAY';
        bg = 'rgba(244, 240, 232, 0.94)';
        borderColor = 'rgba(255, 255, 255, 0.9)';
      } else if (mode === 'view') {
        size = 62;
        labelText = 'VIEW';
        bg = 'rgba(18, 20, 25, 0.82)';
        borderColor = 'rgba(255, 255, 255, 0.55)';
      } else if (mode === 'drag') {
        size = 58;
        labelText = '3D';
        bg = 'rgba(18, 20, 25, 0.82)';
        borderColor = 'rgba(255, 255, 255, 0.5)';
      } else if (mode === 'pointer') {
        size = 44;
        bg = 'rgba(255, 255, 255, 0.08)';
        borderColor = 'rgba(255, 255, 255, 0.72)';
      }

      const pressScale = pressed ? 0.84 : 1;
      ring.style.width = `${size}px`;
      ring.style.height = `${size}px`;
      ring.style.backgroundColor = bg;
      ring.style.borderColor = borderColor;
      ring.style.color = mode === 'play' ? '#111318' : '#F4F0E8';
      ring.dataset.scale = String(pressScale);

      if (labelText) {
        label.textContent = labelText;
        label.style.opacity = '1';
      } else {
        label.textContent = '';
        label.style.opacity = '0';
      }
    };

    const resolveMode = (target: EventTarget | null): CursorMode => {
      if (!(target instanceof Element)) return 'default';

      const customZone = target.closest('[data-cursor]') as HTMLElement | null;
      if (customZone) {
        const val = customZone.dataset.cursor;
        if (val === 'play' || val === 'view' || val === 'drag') return val;
      }

      const clickable = target.closest('a, button, [role="button"], input, textarea, select, label');
      if (clickable) return 'pointer';

      return 'default';
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
        isVisible = true;
      }
      const nextMode = resolveMode(e.target);
      if (nextMode !== currentMode) {
        currentMode = nextMode;
        applyModeStyles(currentMode, isPressed, isVisible);
      } else if (ringRef.current && ringRef.current.style.opacity !== '1') {
        applyModeStyles(currentMode, isPressed, isVisible);
      }
    };

    const onPointerDown = () => {
      isPressed = true;
      applyModeStyles(currentMode, isPressed, isVisible);
    };

    const onPointerUp = () => {
      isPressed = false;
      applyModeStyles(currentMode, isPressed, isVisible);
    };

    const onMouseLeave = () => {
      isVisible = false;
      applyModeStyles(currentMode, isPressed, false);
    };

    let lastTime = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      if (isVisible) {
        const dotFactor = 1 - Math.exp(-42 * dt);
        const ringFactor = 1 - Math.exp(-16 * dt);

        dotX += (mouseX - dotX) * dotFactor;
        dotY += (mouseY - dotY) * dotFactor;
        ringX += (mouseX - ringX) * ringFactor;
        ringY += (mouseY - ringY) * ringFactor;

        if (dotRef.current) {
          dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate3d(-50%, -50%, 0)`;
        }
        if (ringRef.current) {
          const s = ringRef.current.dataset.scale || '1';
          ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate3d(-50%, -50%, 0) scale(${s})`;
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
      {/* Outer Optical Frosted Ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="fixed top-0 left-0 z-[9998] pointer-events-none rounded-full border flex items-center justify-center transition-[width,height,background-color,border-color,opacity,color] duration-200 ease-out"
        style={{
          width: '34px',
          height: '34px',
          opacity: 0,
          borderColor: 'rgba(255, 255, 255, 0.42)',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.14)',
          willChange: 'transform, width, height'
        }}
      >
        <span
          ref={labelRef}
          className="text-[10px] font-sans font-semibold tracking-[0.14em] select-none transition-opacity duration-150"
          style={{ opacity: 0 }}
        />
      </div>

      {/* Inner Precision Focal Dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed top-0 left-0 z-[9999] w-1.5 h-1.5 rounded-full pointer-events-none transition-opacity duration-150"
        style={{
          opacity: 0,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 0 8px rgba(255, 255, 255, 0.65)',
          willChange: 'transform'
        }}
      />
    </>
  );
};
