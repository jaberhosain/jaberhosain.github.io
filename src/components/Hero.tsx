import React, { useState, useRef } from 'react';
import { ArrowDown, ArrowUpRight, Box, User } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useNavigation } from '../context/NavigationContext';
import { resolveAssetUrl } from '../utils/assetUrl';
import { normalizeDirectImageUrl } from '../lib/imageUrlResolver';
import { EditableElement } from './common/EditableElement';
import { HeroSpatialSculpture } from './three/HeroSpatialSculpture';

export const Hero: React.FC = () => {
  const { portfolio, ui, loc, language } = usePortfolio();
  const { navigateTo, isMultiPageEnabled } = useNavigation();
  const { hero } = portfolio;

  const [stageMode, setStageMode] = useState<'portrait' | 'sculpture'>('portrait');

  // 3D Portrait Interactive Tilt & Specular Light State
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardTransform, setCardTransform] = useState({
    rotX: 0,
    rotY: 0,
    glareX: 50,
    glareY: 50,
    isHovered: false
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;

    const maxTilt = 16;
    setCardTransform({
      rotX: -normY * maxTilt,
      rotY: normX * maxTilt,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
      isHovered: true
    });
  };

  const handleMouseLeave = () => {
    setCardTransform({
      rotX: 0,
      rotY: 0,
      glareX: 50,
      glareY: 50,
      isHovered: false
    });
  };

  return (
    <section
      id="home"
      className="relative min-h-[94vh] flex items-center pt-28 pb-14 overflow-hidden bg-transparent"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">

          {/* Left Column: Calibrated International Editorial Typography */}
          <div className="lg:col-span-7 flex flex-col items-start text-left rtl:items-start rtl:text-right">

            {/* Quiet Unboxed Editorial Kicker */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono tracking-[0.2em] uppercase text-[#A7A298] mb-5">
              <span className="text-[#E4583B] font-semibold">
                {language === 'bn'
                  ? 'ভিজ্যুয়াল ডিরেকশন · ভিডিও এডিটিং · ডিজাইন'
                  : language === 'ar'
                  ? 'إخراج بصري · مونتاج فيديو · تصميم جرافيك'
                  : 'Visual Direction · Motion · Design'}
              </span>
              {hero.showBadge !== false && loc(hero.badge) && (
                <>
                  <span aria-hidden="true" className="text-[#2B303D]">/</span>
                  <span className="text-[#DDD1BE]">{loc(hero.badge)}</span>
                </>
              )}
            </div>

            {/* Primary Display Name */}
            <EditableElement id="hero.name" label="Hero Headline Name" as="h1" className="mb-4 block w-full">
              <span className="font-display text-4xl sm:text-6xl lg:text-[4.35rem] font-extrabold text-[#F4F0E8] tracking-tight leading-[1.04] block">
                {loc(hero.name)}
              </span>
            </EditableElement>

            {/* Editorial Serif Contrast Accent + Tagline */}
            <div className="mb-8 max-w-2xl space-y-3">
              {language === 'en' && (
                <p className="font-editorial italic text-2xl sm:text-3xl text-[#DDD1BE] leading-snug">
                  Crafted frame by frame in 3D space.
                </p>
              )}
              <EditableElement
                id="hero.tagline"
                label="Hero Tagline"
                as="p"
                className="text-sm sm:text-base text-[#A7A298] leading-relaxed font-normal max-w-xl"
              >
                {loc(hero.tagline)}
              </EditableElement>
            </div>

            {/* Clean Architectural CTAs */}
            <div className="flex flex-wrap items-center gap-4 w-full">
              {hero.showCtaWork !== false && (
                <a
                  href={hero.ctaWorkUrl || '#projects'}
                  onClick={(e) => {
                    if (isMultiPageEnabled) {
                      e.preventDefault();
                      navigateTo(hero.ctaWorkUrl || 'videos');
                    }
                  }}
                  className="inline-flex items-center justify-center space-x-2.5 rtl:space-x-reverse px-7 py-3.5 rounded-lg text-xs sm:text-sm font-bold text-white bg-[#E4583B] hover:bg-[#D0492D] glow-orange transition-all duration-200 uppercase font-mono tracking-wider"
                >
                  <EditableElement id="hero.ctaWork" label="Work Button Text" as="span">
                    {loc(hero.ctaWork)}
                  </EditableElement>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              )}

              {hero.showCtaContact !== false && (
                <a
                  href={hero.ctaContactUrl || '#advice'}
                  onClick={(e) => {
                    if (isMultiPageEnabled) {
                      e.preventDefault();
                      navigateTo(hero.ctaContactUrl || 'contact');
                    }
                  }}
                  className="inline-flex items-center justify-center space-x-2 rtl:space-x-reverse px-6 py-3.5 rounded-lg text-xs sm:text-sm font-semibold text-[#F4F0E8] bg-[#181B22]/90 hover:bg-[#20242E] border border-[#2B303D] hover:border-[#E4583B]/60 transition-colors uppercase font-mono tracking-wider"
                >
                  <EditableElement id="hero.ctaContact" label="Contact Button Text" as="span">
                    {loc(hero.ctaContact)}
                  </EditableElement>
                </a>
              )}
            </div>

            {/* Unboxed Architectural Metrics Row */}
            {hero.showCounters && hero.counters && hero.counters.length > 0 && (
              <div className="mt-10 pt-7 border-t border-[#2B303D]/80 grid grid-cols-2 sm:grid-cols-3 gap-6 w-full max-w-xl">
                {hero.counters.map((c) => (
                  <div key={c.id}>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#F4F0E8] font-display tabular-nums">
                      {c.value}
                    </div>
                    <div className="text-[11px] text-[#A7A298] font-mono uppercase tracking-wider mt-1">
                      {loc(c.label)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Dual Interactive 3D Stage (Portrait Monolith + Three.js WebGL Cinema Optics) */}
          <div className="lg:col-span-5 relative flex flex-col items-center">
            <div className="relative w-full max-w-md h-[460px] sm:h-[520px] flex items-center justify-center">

              {/* Always-active ambient Three.js Interactive 3D Cinema Optics Sculpture */}
              <div
                className={`absolute inset-0 transition-all duration-500 ${
                  stageMode === 'sculpture'
                    ? 'z-30 opacity-100 scale-100'
                    : 'z-10 opacity-80 -translate-x-10 sm:-translate-x-14 translate-y-6 scale-90 pointer-events-none lg:pointer-events-auto'
                }`}
              >
                <HeroSpatialSculpture className="w-full h-full" />
              </div>

              {/* 3D Interactive Portrait Monolith */}
              <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={`relative w-[275px] sm:w-[320px] aspect-[3/4] cursor-grab active:cursor-grabbing select-none transition-all duration-500 ${
                  stageMode === 'portrait'
                    ? 'z-20 opacity-100 translate-x-4 sm:translate-x-8'
                    : 'z-0 opacity-15 scale-90 pointer-events-none'
                }`}
                style={{
                  transform:
                    stageMode === 'portrait'
                      ? `perspective(1000px) rotateX(${cardTransform.rotX}deg) rotateY(${cardTransform.rotY}deg) scale3d(${cardTransform.isHovered ? 1.025 : 1}, ${cardTransform.isHovered ? 1.025 : 1}, 1)`
                      : 'perspective(1000px) scale3d(0.9, 0.9, 1)',
                  transition: cardTransform.isHovered
                    ? 'transform 0.08s ease-out, opacity 0.4s ease'
                    : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease',
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#181B22] border border-[#2B303D] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.72)]">
                  <img
                    src={resolveAssetUrl(normalizeDirectImageUrl(hero.avatarUrl) || '/assets/jabir_profile.png')}
                    alt={loc(hero.name)}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top pointer-events-none transition-transform duration-500"
                    style={{
                      transform: `scale(${cardTransform.isHovered ? 1.04 : 1}) translateZ(18px)`
                    }}
                    loading="eager"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      const fallback = resolveAssetUrl('/assets/jaber_hero.png');
                      const secondFallback = resolveAssetUrl('/assets/jabir_profile.png');
                      if (img.dataset.fallbackStage === '2') return;
                      if (img.dataset.fallbackStage !== '1') {
                        img.dataset.fallbackStage = '1';
                        img.src = fallback;
                      } else {
                        img.dataset.fallbackStage = '2';
                        img.src = secondFallback;
                      }
                    }}
                  />

                  {/* Subtle Film-Graded Bottom Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121419]/80 via-transparent to-transparent pointer-events-none" />

                  {/* Calibrated Studio Specular Reflection */}
                  <div
                    className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-200"
                    style={{
                      background: `radial-gradient(circle 320px at ${cardTransform.glareX}% ${cardTransform.glareY}%, rgba(244, 240, 232, 0.32) 0%, rgba(228, 88, 59, 0.1) 45%, transparent 80%)`,
                      opacity: cardTransform.isHovered ? 1 : 0
                    }}
                  />

                  {/* Clean Editorial Caption Bar */}
                  {hero.showFloatingBadge !== false && (
                    <div
                      className="absolute bottom-4 left-4 right-4 px-4 py-3 rounded-xl bg-[#121419]/90 border border-[#2B303D] flex items-center justify-between gap-3"
                      style={{ transform: 'translateZ(36px)' }}
                    >
                      <div className="min-w-0">
                        <div className="font-mono text-[11px] font-bold tracking-wider uppercase text-[#F4F0E8] truncate">
                          {loc(hero.floatingBadgeText) || loc(hero.name) || 'MD JABER HOSAIN'}
                        </div>
                        <div className="text-[10px] font-mono text-[#E4583B] tracking-widest uppercase truncate">
                          {language === 'bn' ? 'ভিডিও ও গ্রাফিক ডিজাইনার' : 'Motion & Visual Design'}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#A7A298] shrink-0">01</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Minimal Interactive 3D Stage Mode Switcher */}
            <div className="mt-4 inline-flex items-center p-1 rounded-lg bg-[#181B22]/95 border border-[#2B303D] z-30">
              <button
                type="button"
                onClick={() => setStageMode('portrait')}
                className={`inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-md text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  stageMode === 'portrait'
                    ? 'bg-[#E4583B] text-white font-bold'
                    : 'text-[#A7A298] hover:text-[#F4F0E8]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'পোর্ট্রেট' : 'Portrait'}</span>
              </button>
              <button
                type="button"
                onClick={() => setStageMode('sculpture')}
                className={`inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-md text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  stageMode === 'sculpture'
                    ? 'bg-[#E4583B] text-white font-bold'
                    : 'text-[#A7A298] hover:text-[#F4F0E8]'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? '৩D অপটিক্স (ঘোরান)' : 'Inspect 3D Rig'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Clean Scroll Anchor Row */}
        <div className="mt-14 pt-5 border-t border-[#2B303D]/70 flex items-center justify-between text-xs font-mono text-[#A7A298]">
          <span>
            {language === 'bn'
              ? 'থ্রিডি স্পেস সক্রিয় — মাউস বা স্ক্রল করে গভীরতা অনুভব করুন'
              : 'Interactive 3D Spatial Portfolio'}
          </span>

          <button
            type="button"
            onClick={() => {
              window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
            }}
            className="inline-flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono uppercase tracking-widest text-[#DDD1BE] hover:text-[#E4583B] transition-colors cursor-pointer"
            aria-label={ui.hero.scrollDown}
          >
            <span>{ui.hero.scrollDown}</span>
            <ArrowDown className="w-3.5 h-3.5 text-[#E4583B]" />
          </button>
        </div>
      </div>
    </section>
  );
};
