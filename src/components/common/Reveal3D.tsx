import React, { useEffect, useRef, useState } from 'react';

export type RevealDirection = 'up' | 'left' | 'right' | 'depth' | 'tilt-left' | 'tilt-right';

interface Reveal3DProps {
  children: React.ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

const HIDDEN_TRANSFORMS: Record<RevealDirection, string> = {
  up: 'perspective(1200px) translate3d(0, 38px, -32px) rotateX(6deg) scale3d(0.97, 0.97, 1)',
  left: 'perspective(1200px) translate3d(-44px, 10px, -36px) rotateY(8deg) scale3d(0.97, 0.97, 1)',
  right: 'perspective(1200px) translate3d(44px, 10px, -36px) rotateY(-8deg) scale3d(0.97, 0.97, 1)',
  depth: 'perspective(1200px) translate3d(0, 18px, -90px) rotateX(4deg) scale3d(0.93, 0.93, 1)',
  'tilt-left': 'perspective(1200px) translate3d(-28px, 28px, -45px) rotateX(5deg) rotateY(7deg) scale3d(0.96, 0.96, 1)',
  'tilt-right': 'perspective(1200px) translate3d(28px, 28px, -45px) rotateX(5deg) rotateY(-7deg) scale3d(0.96, 0.96, 1)'
};

const VISIBLE_TRANSFORM = 'perspective(1200px) translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';

/**
 * Scroll-triggered directional 3D reveal wrapper.
 * Animates strictly GPU-composited transform & opacity with reduced-motion
 * and immediate viewport-safety fallbacks so content never remains hidden.
 */
export const Reveal3D: React.FC<Reveal3DProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 760,
  className = '',
  once = true
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return true;
    return false;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || isVisible) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    // Reveal immediately if element is already in or above the viewport on mount
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.98) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
            setIsVisible(true);
            if (once) observer.unobserve(el);
          } else if (!once) {
            setIsVisible(false);
          }
        }
      },
      {
        threshold: 0.05,
        rootMargin: '40px 0px -24px 0px'
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [isVisible, once]);

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      ref={ref}
      className={className}
      style={
        reduced
          ? undefined
          : {
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? VISIBLE_TRANSFORM : HIDDEN_TRANSFORMS[direction],
              transitionProperty: 'transform, opacity',
              transitionDuration: `${duration}ms`,
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: `${isVisible ? delay : 0}ms`,
              willChange: isVisible ? 'auto' : 'transform, opacity'
            }
      }
    >
      {children}
    </div>
  );
};
