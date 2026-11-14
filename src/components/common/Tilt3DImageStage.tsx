import React, { useRef, useState } from 'react';

interface Tilt3DImageStageProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scaleOnHover?: number;
  glareOpacity?: number;
}

/**
 * Physical 3D perspective stage for visual cards & showcases.
 * Smoothly tilts toward cursor with subtle champagne/vermilion studio specular sheen.
 */
export const Tilt3DImageStage: React.FC<Tilt3DImageStageProps> = ({
  children,
  className = '',
  maxTilt = 14,
  scaleOnHover = 1.03,
  glareOpacity = 0.24,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({
    rotX: 0,
    rotY: 0,
    glareX: 50,
    glareY: 50,
    isHovered: false,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;

    setTilt({
      rotX: -normY * maxTilt,
      rotY: normX * maxTilt,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
      isHovered: true,
    });
  };

  const handleMouseLeave = () => {
    setTilt({
      rotX: 0,
      rotY: 0,
      glareX: 50,
      glareY: 50,
      isHovered: false,
    });
  };

  return (
    <div
      ref={stageRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative [perspective:1000px] ${className}`}
    >
      <div
        className="relative w-full h-full preserve-3d will-change-transform"
        style={{
          transform: `rotateX(${tilt.rotX}deg) rotateY(${tilt.rotY}deg) scale3d(${
            tilt.isHovered ? scaleOnHover : 1
          }, ${tilt.isHovered ? scaleOnHover : 1}, 1)`,
          transition: tilt.isHovered
            ? 'transform 0.1s ease-out'
            : 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {children}

        {/* Calibrated Studio Specular Reflection */}
        <div
          className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-200 mix-blend-overlay rounded-2xl"
          style={{
            background: `radial-gradient(circle 280px at ${tilt.glareX}% ${tilt.glareY}%, rgba(244, 240, 232, ${glareOpacity}) 0%, rgba(228, 88, 59, 0.12) 45%, transparent 80%)`,
            opacity: tilt.isHovered ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
};
