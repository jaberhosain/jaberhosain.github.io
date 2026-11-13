import React, { useRef, useState } from 'react';

interface Tilt3DImageStageProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scaleOnHover?: number;
  glareOpacity?: number;
}

/**
 * Reusable mouse-responsive 3D perspective stage for project showcase images.
 * Smoothly rotates/tilts toward the cursor direction with subtle dynamic light glare.
 */
export const Tilt3DImageStage: React.FC<Tilt3DImageStageProps> = ({
  children,
  className = '',
  maxTilt = 14,
  scaleOnHover = 1.03,
  glareOpacity = 0.28,
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

    // Normalize coordinates to [-1, 1]
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
      className={`relative [perspective:900px] ${className}`}
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

        {/* Dynamic Cursor Light Glare */}
        <div
          className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-200 mix-blend-overlay"
          style={{
            background: `radial-gradient(circle 260px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, ${glareOpacity}) 0%, rgba(255, 87, 34, 0.14) 45%, transparent 80%)`,
            opacity: tilt.isHovered ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
};
