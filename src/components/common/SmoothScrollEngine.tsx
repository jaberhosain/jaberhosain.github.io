import React, { useEffect, useRef } from 'react';

/**
 * Silky Desktop Wheel Inertia Engine & GPU Scroll Progress Hairline:
 * - Provides effortless, 60fps damped wheel glide on desktop fine pointers.
 * - Never blocks touch scrolling, native pinch-zoom (ctrlKey), inner scrollable panels,
 *   open modals/dialogs, or programmatic anchor / scrollIntoView navigation.
 * - Syncs automatically whenever the user drags the scrollbar or uses keyboard scrolling.
 */
export const SmoothScrollEngine: React.FC = () => {
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer =
      window.matchMedia?.('(pointer: coarse)').matches &&
      !window.matchMedia?.('(hover: hover)').matches;

    let progressRaf = 0;

    const updateProgressBar = () => {
      progressRaf = 0;
      const bar = progressBarRef.current;
      if (!bar) return;
      const docEl = document.documentElement;
      const maxScroll = Math.max(1, docEl.scrollHeight - window.innerHeight);
      const ratio = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      bar.style.transform = `scaleX(${ratio.toFixed(4)})`;
      bar.style.opacity = window.scrollY > 12 ? '1' : '0';
    };

    const scheduleProgress = () => {
      if (!progressRaf) {
        progressRaf = window.requestAnimationFrame(updateProgressBar);
      }
    };

    updateProgressBar();

    // On touch devices or reduced-motion preference, keep native scrolling untouched and only render progress hairline
    if (reducedMotion || isCoarsePointer) {
      window.addEventListener('scroll', scheduleProgress, { passive: true });
      window.addEventListener('resize', scheduleProgress, { passive: true });
      return () => {
        window.removeEventListener('scroll', scheduleProgress);
        window.removeEventListener('resize', scheduleProgress);
        if (progressRaf) window.cancelAnimationFrame(progressRaf);
      };
    }

    let currentY = window.scrollY;
    let targetY = window.scrollY;
    let wheelRaf = 0;
    let isAnimating = false;
    let lastTickTime = performance.now();
    let expectedProgrammaticY = -1;

    const getMaxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const canElementScroll = (target: EventTarget | null, deltaY: number): boolean => {
      if (!(target instanceof Element)) return false;
      let node: Element | null = target;

      while (node && node !== document.body && node !== document.documentElement) {
        const tag = node.tagName;
        if (tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'IFRAME') return true;

        const style = window.getComputedStyle(node);
        const overflowY = style.overflowY;
        const isScrollable = overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';

        if (isScrollable && node.scrollHeight > node.clientHeight + 2) {
          const atTop = node.scrollTop <= 0;
          const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
          if ((deltaY < 0 && !atTop) || (deltaY > 0 && !atBottom)) {
            return true;
          }
        }
        node = node.parentElement;
      }

      // Skip wheel hijack when any fullscreen dialog/lightbox/video modal is active
      if (document.querySelector('[role="dialog"], [data-smooth-scroll-lock="true"]')) {
        return true;
      }

      return false;
    };

    const stopWheelAnimation = () => {
      isAnimating = false;
      if (wheelRaf) {
        window.cancelAnimationFrame(wheelRaf);
        wheelRaf = 0;
      }
      currentY = window.scrollY;
      targetY = window.scrollY;
    };

    const step = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTickTime) / 1000));
      lastTickTime = now;

      const maxScroll = getMaxScroll();
      targetY = Math.max(0, Math.min(maxScroll, targetY));

      const diff = targetY - currentY;
      if (Math.abs(diff) < 0.45) {
        currentY = targetY;
        expectedProgrammaticY = Math.round(currentY);
        window.scrollTo({ top: expectedProgrammaticY, behavior: 'instant' as ScrollBehavior });
        scheduleProgress();
        isAnimating = false;
        wheelRaf = 0;
        return;
      }

      // Critically damped silky glide
      const ease = 1 - Math.exp(-10.5 * dt);
      currentY += diff * ease;
      expectedProgrammaticY = Math.round(currentY);
      window.scrollTo({ top: expectedProgrammaticY, behavior: 'instant' as ScrollBehavior });
      scheduleProgress();

      wheelRaf = window.requestAnimationFrame(step);
    };

    const onWheel = (e: WheelEvent) => {
      // Allow zoom gestures, horizontal trackpad swipes, and inner scrollable drawers
      if (e.ctrlKey || e.metaKey || e.deltaMode === 2) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.15) return;
      if (canElementScroll(e.target, e.deltaY)) return;

      e.preventDefault();

      // Convert line-mode mouse wheels (~36px/line) vs pixel-mode trackpads
      const lineScale = e.deltaMode === 1 ? 36 : 1;
      const rawDelta = e.deltaY * lineScale;
      // Subtle momentum multiplier for notched mouse wheels without over-accelerating trackpads
      const impulse = Math.abs(rawDelta) >= 40 ? rawDelta * 1.12 : rawDelta;

      if (!isAnimating) {
        currentY = window.scrollY;
        targetY = currentY;
      }

      targetY = Math.max(0, Math.min(getMaxScroll(), targetY + impulse));

      if (!isAnimating) {
        isAnimating = true;
        lastTickTime = performance.now();
        wheelRaf = window.requestAnimationFrame(step);
      }
    };

    const onScroll = () => {
      scheduleProgress();
      // If a native scroll happened (scrollbar drag, keyboard nav, scrollIntoView, or anchor), sync loop
      if (isAnimating && Math.abs(window.scrollY - expectedProgrammaticY) > 6) {
        stopWheelAnimation();
      } else if (!isAnimating) {
        currentY = window.scrollY;
        targetY = window.scrollY;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
      if (scrollKeys.includes(e.key) && isAnimating) {
        stopWheelAnimation();
      }
    };

    const onTouchStart = () => {
      if (isAnimating) stopWheelAnimation();
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', scheduleProgress, { passive: true });
    window.addEventListener('keydown', onKeyDown, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });

    return () => {
      stopWheelAnimation();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', scheduleProgress);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('touchstart', onTouchStart);
      if (progressRaf) window.cancelAnimationFrame(progressRaf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2.5px] z-[65] pointer-events-none"
    >
      <div
        ref={progressBarRef}
        className="w-full h-full origin-left opacity-0 transition-opacity duration-300"
        style={{
          transform: 'scaleX(0)',
          background:
            'linear-gradient(90deg, var(--brand-orange, #E4583B) 0%, var(--brand-orange-light, #F07C63) 65%, #F4F0E8 100%)',
          boxShadow: '0 0 10px var(--brand-orange-glow, rgba(228,88,59,0.4))',
          willChange: 'transform, opacity'
        }}
      />
    </div>
  );
};
