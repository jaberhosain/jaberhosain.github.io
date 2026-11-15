import React from 'react';

interface IconProps {
  className?: string;
}

/**
 * Hairline Editorial Arrow Left (matches screenshot reference arrow buttons)
 */
export const StudioArrowLeft: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M19 12H5" />
    <path d="m11 18-6-6 6-6" />
  </svg>
);

/**
 * Hairline Editorial Arrow Right (matches screenshot reference arrow buttons)
 */
export const StudioArrowRight: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

/**
 * Delicate Play / Reel Trigger Glyph
 */
export const StudioPlayGlyph: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M8.2 5.4a1 1 0 0 1 1.52-.85l9.4 6.1a1 1 0 0 1 0 1.68l-9.4 6.1A1 1 0 0 1 8.2 17.6V5.4Z" />
  </svg>
);

/**
 * Minimal Editorial Quote / Watch Action Chip Icon
 */
export const StudioReelChipGlyph: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="14" rx="4" />
    <path d="m10 9.5 5 2.5-5 2.5v-5Z" fill="currentColor" stroke="none" />
  </svg>
);

interface StudioGlassIconProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Consistent circular smoked-glass icon medallion used site-wide
 * so icons have an authored studio consistency instead of bulky template boxes.
 */
export const StudioGlassIcon: React.FC<StudioGlassIconProps> = ({
  children,
  size = 'md',
  className = ''
}) => {
  const sizeClass =
    size === 'sm'
      ? 'w-9 h-9'
      : size === 'lg'
      ? 'w-12 h-12'
      : 'w-10 h-10';

  return (
    <div
      className={`${sizeClass} rounded-full glass-icon-disc flex items-center justify-center shrink-0 ${className}`}
    >
      {children}
    </div>
  );
};
