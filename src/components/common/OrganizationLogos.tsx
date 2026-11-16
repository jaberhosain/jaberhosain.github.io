import React from 'react';
import { resolveAssetUrl } from '../../utils/assetUrl';

interface EmblemProps {
  className?: string;
  variant?: 'card' | 'compact';
}

const ASSUNNAH_FOUNDATION_PNG = '/assets/aistudio/Screenshot_2026-11-16_203536_deb463f1.png';
const ASSUNNAH_SKILL_PNG = '/assets/aistudio/Screenshot_2026-11-14_193652_8e9962cd.png';

/**
 * Official As-Sunnah Foundation Logo (Crisp PNG inside matched deep forest green shield)
 */
export const AsSunnahFoundationLogo: React.FC<EmblemProps> = ({
  className = '',
  variant = 'card'
}) => {
  const isCompact = variant === 'compact';
  return (
    <div
      className={`inline-flex items-center justify-center bg-[#0F271D] border border-emerald-500/30 shadow-[0_8px_20px_-8px_rgba(16,185,129,0.45)] overflow-hidden select-none shrink-0 ${
        isCompact ? 'h-8 px-2 rounded-lg' : 'h-14 px-3 py-1.5 rounded-xl'
      } ${className}`}
    >
      <img
        src={resolveAssetUrl(ASSUNNAH_FOUNDATION_PNG)}
        alt="As-Sunnah Foundation Official Logo"
        referrerPolicy="no-referrer"
        loading="lazy"
        className={`${isCompact ? 'h-6' : 'h-11'} w-auto max-w-full object-contain`}
        style={{ imageRendering: 'auto' }}
      />
    </div>
  );
};

/**
 * Official As-Sunnah Skill Development Institute Logo (Crisp PNG inside clean white surface frame)
 */
export const AsSunnahSkillInstituteLogo: React.FC<EmblemProps> = ({
  className = '',
  variant = 'card'
}) => {
  const isCompact = variant === 'compact';
  return (
    <div
      className={`inline-flex items-center justify-center bg-white border border-black/10 shadow-[0_8px_22px_-10px_rgba(20,22,26,0.22)] overflow-hidden select-none shrink-0 ${
        isCompact ? 'h-8 px-2 rounded-lg' : 'h-14 px-3.5 py-1.5 rounded-xl'
      } ${className}`}
    >
      <img
        src={resolveAssetUrl(ASSUNNAH_SKILL_PNG)}
        alt="As-Sunnah Skill Development Institute Official Logo"
        referrerPolicy="no-referrer"
        loading="lazy"
        className={`${isCompact ? 'h-6' : 'h-11'} w-auto max-w-full object-contain`}
        style={{ clipPath: 'inset(0 0 3px 0)' }}
      />
    </div>
  );
};

/**
 * Ta'mirul Millat Kamil Madrasah Emblem (Deep Teal & Champagne Geometric Crest)
 */
export const TamirulMillatLogo: React.FC<EmblemProps> = ({ className = 'w-12 h-12' }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="64" height="64" rx="16" fill="#132A2E" />
    <rect x="2" y="2" width="60" height="60" rx="14" stroke="#D4A853" strokeOpacity="0.45" strokeWidth="1.5" />
    <path
      d="M32 13L47 22V41L32 51L17 41V22L32 13Z"
      stroke="#E6C27A"
      strokeWidth="2"
      fill="#1A3B40"
    />
    <path
      d="M24 37.5L32 24L40 37.5H34.5L32 32.8L29.5 37.5H24Z"
      fill="#F5E4BE"
    />
  </svg>
);
