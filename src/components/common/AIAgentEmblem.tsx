import React from 'react';

interface AIAgentEmblemProps {
  className?: string;
}

/**
 * Custom signature emblem for Jaber's AI Agent:
 * Hexagonal cinema aperture + tilted orbital ring + 4-point neural studio star core.
 */
export const AIAgentEmblem: React.FC<AIAgentEmblemProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer Precision Hexagonal Aperture Frame */}
      <path
        d="M20 3.2L34.5 11.6V28.4L20 36.8L5.5 28.4V11.6L20 3.2Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
        opacity="0.92"
      />

      {/* Tilted Cinema Gimbal Ring */}
      <ellipse
        cx="20"
        cy="20"
        rx="11.5"
        ry="6.8"
        transform="rotate(-28 20 20)"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeDasharray="3.2 2.4"
        opacity="0.72"
      />

      {/* Inner Optical Iris Circle */}
      <circle
        cx="20"
        cy="20"
        r="5.6"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.95"
      />

      {/* Central 4-Point Studio Focal Star */}
      <path
        d="M20 12.2L21.9 18.1L27.8 20L21.9 21.9L20 27.8L18.1 21.9L12.2 20L18.1 18.1L20 12.2Z"
        fill="currentColor"
      />
    </svg>
  );
};
