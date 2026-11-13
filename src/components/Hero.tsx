import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown, ArrowUpRight, Sparkles } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useNavigation } from '../context/NavigationContext';
import { resolveAssetUrl } from '../utils/assetUrl';
import { EditableElement } from './common/EditableElement';

export const Hero: React.FC = () => {
  const { portfolio, ui, loc } = usePortfolio();
  const { navigateTo, isMultiPageEnabled } = useNavigation();
  const { hero } = portfolio;

  // Running live timecode counter simulating professional cinema monitor (e.g. TC 00:00:24:18)
  const [timecode, setTimecode] = useState('00:00:24:18');

  useEffect(() => {
    let frame = 18;
    let sec = 24;
    let min = 0;
    const interval = setInterval(() => {
      frame += 1;
      if (frame >= 30) {
        frame = 0;
        sec += 1;
        if (sec >= 60) {
          sec = 0;
          min += 1;
        }
      }
      const pad = (n: number) => n.toString().padStart(2, '0');
      setTimecode(`00:${pad(min)}:${pad(sec)}:${pad(frame)}`);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // 3D Card Interactive Tilt & Glare State
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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize from -1 to 1
    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;

    // Calculate 3D tilt: max 22 degrees for punchy physical depth
    const maxTilt = 20;
    const rotY = normX * maxTilt;
    const rotX = -normY * maxTilt;

    // Glare position percentage
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setCardTransform({
      rotX,
      rotY,
      glareX,
      glareY,
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
    <section id="home" className="relative min-h-[96vh] flex items-center pt-28 pb-16 overflow-hidden bg-[#070A0D] bg-grid-pattern">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#FF5722]/12 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[#FF5722]/6 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Subtle Giant 3D Embossed Typography Watermark (Equinox style) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none -z-10 text-center w-full overflow-hidden">
        <span className="text-[14vw] font-black tracking-tighter text-white/[0.015] uppercase font-sans leading-none block">
          CREATIVE
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        
        {/* Cinema HUD Top Bar Frame */}
        <div className="flex items-center justify-between pb-6 mb-4 text-[11px] font-mono tracking-widest text-neutral-500 border-b border-[#1D232A]/60">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5722] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5722]"></span>
            </span>
            <span className="text-[#FF5722] font-bold">[ • REC ]</span>
            <span className="text-neutral-500 hidden sm:inline-block">PRORES 422 HQ</span>
          </div>

          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <span className="text-neutral-400 font-bold tracking-wider">
              TC {timecode}
            </span>
            <span className="hidden md:inline-block px-2 py-0.5 rounded bg-[#12161A] border border-[#232B33] text-[10px] text-neutral-400">
              24.00 FPS • 4K
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center">
          
          {/* Left Text Column with senior typographic hierarchy */}
          <div className="lg:col-span-7 flex flex-col items-start text-left rtl:items-start rtl:text-right">
            
            {/* Availability Badge */}
            {hero.showBadge !== false && (
              <div className="availability-badge inline-flex items-center space-x-2.5 rtl:space-x-reverse px-4 py-2 rounded-full bg-[#12161A]/90 border border-[#232B33] text-xs font-semibold text-neutral-300 mb-6 glow-orange-sm backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5722] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF5722]"></span>
                </span>
                <span className="availability-badge-text tracking-widest uppercase font-mono text-[11px] text-neutral-300">
                  {loc(hero.badge)}
                </span>
              </div>
            )}

            {/* Editorial Super-Title (Equinox style) */}
            <div className="text-xs font-mono font-bold tracking-widest text-[#FF7043] uppercase mb-3 flex items-center space-x-2 rtl:space-x-reverse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722]" />
              <span>MD JABER HOSAIN • VIDEO EDITING • MOTION • DESIGN</span>
            </div>

            {/* Main Name */}
            <EditableElement id="hero.name" label="Hero Headline Name" as="h1" className="mb-4 inline-block">
              <span className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] text-gradient-orange uppercase font-sans">
                {loc(hero.name)}
              </span>
            </EditableElement>

            {/* Tagline */}
            <EditableElement id="hero.tagline" label="Hero Tagline" as="p" className="text-base sm:text-lg font-mono font-medium text-neutral-400 max-w-2xl mb-8 tracking-widest uppercase leading-relaxed">
              {loc(hero.tagline)}
            </EditableElement>

            {/* Action Buttons + Handwritten Signature */}
            <div className="flex flex-wrap items-center gap-5 w-full">
              {/* Primary: View My Work */}
              {hero.showCtaWork !== false && (
                <a
                  href={hero.ctaWorkUrl || '#projects'}
                  onClick={(e) => {
                    if (isMultiPageEnabled) {
                      e.preventDefault();
                      navigateTo(hero.ctaWorkUrl || 'videos');
                    }
                  }}
                  className="inline-flex items-center justify-center space-x-2.5 rtl:space-x-reverse px-8 py-4 rounded-2xl text-sm sm:text-base font-bold text-white bg-[#FF5722] hover:bg-[#F4511E] glow-orange transition-all duration-300 transform hover:-translate-y-0.5 uppercase font-mono tracking-wider shadow-xl"
                >
                  <EditableElement id="hero.ctaWork" label="Work Button Text" as="span">
                    {loc(hero.ctaWork)}
                  </EditableElement>
                  <ArrowUpRight className="w-5 h-5" />
                </a>
              )}

              {/* Secondary: Let's Work Together */}
              {hero.showCtaContact !== false && (
                <a
                  href={hero.ctaContactUrl || '#advice'}
                  onClick={(e) => {
                    if (isMultiPageEnabled) {
                      e.preventDefault();
                      navigateTo(hero.ctaContactUrl || 'contact');
                    }
                  }}
                  className="inline-flex items-center justify-center space-x-2.5 rtl:space-x-reverse px-7 py-4 rounded-2xl text-sm sm:text-base font-bold text-white bg-[#12161A] hover:bg-[#1A222B] border border-[#232B33] hover:border-[#FF5722]/50 transition-all duration-200 uppercase font-mono tracking-wider"
                >
                  <Sparkles className="w-4 h-4 text-[#FF5722]" />
                  <EditableElement id="hero.ctaContact" label="Contact Button Text" as="span">
                    {loc(hero.ctaContact)}
                  </EditableElement>
                </a>
              )}

              {/* Elegant Autograph Signature (Equinox style) */}
              <div className="hidden sm:flex items-center pl-2 opacity-80 hover:opacity-100 transition-opacity">
                <svg className="w-36 h-10 text-[#FF5722]" viewBox="0 0 200 60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M10,45 C20,15 35,20 40,40 C45,60 55,10 65,30 C75,50 85,35 95,40 C105,45 120,25 135,38 C150,50 165,30 180,45" />
                  <path d="M45,25 L85,25" strokeWidth="1.5" />
                  <path d="M130,22 Q145,15 160,25" strokeWidth="1.5" />
                </svg>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest pl-1">
                  Jaber
                </span>
              </div>
            </div>

            {/* Optional Counter / Stats Bar */}
            {hero.showCounters && hero.counters && hero.counters.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[#1D232A]/80 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                {hero.counters.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-2xl bg-[#12161A]/80 border border-[#232B33]">
                    <div className="text-xl sm:text-2xl font-extrabold text-[#FF5722] font-mono mb-0.5">
                      {c.value}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono uppercase tracking-wider">
                      {loc(c.label)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Visual Stage: Interactive 3D Cursor-Responsive Portrait Frame */}
          <div className="lg:col-span-5 relative flex justify-center items-center py-4 perspective-1200">
            
            {/* The 3D Responsive Card */}
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full max-w-sm sm:max-w-md aspect-[3/4] cursor-grab active:cursor-grabbing select-none"
              style={{
                transform: `perspective(1000px) rotateX(${cardTransform.rotX}deg) rotateY(${cardTransform.rotY}deg) scale3d(${cardTransform.isHovered ? 1.03 : 1}, ${cardTransform.isHovered ? 1.03 : 1}, 1)`,
                transition: cardTransform.isHovered ? 'transform 0.08s ease-out' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                transformStyle: 'preserve-3d'
              }}
            >
              
              {/* Outer Deep Ambient Shadow Layer */}
              <div 
                className="absolute inset-4 -bottom-6 bg-[#FF5722]/20 rounded-3xl blur-3xl -z-20 transition-opacity duration-300 pointer-events-none"
                style={{ opacity: cardTransform.isHovered ? 0.9 : 0.4 }}
              />

              {/* 3D Outer Bezel Frame */}
              <div 
                className="relative w-full h-full rounded-3xl p-1 bg-gradient-to-tr from-[#FF5722] via-[#FF5722]/35 to-neutral-700/50 shadow-2xl overflow-hidden"
                style={{ transform: 'translateZ(0px)' }}
              >
                
                {/* Main Card Canvas */}
                <div className="relative w-full h-full rounded-[22px] overflow-hidden bg-[#0A0E12] border border-[#1E2732]">
                  
                  {/* Portrait Image (with fallback chain) */}
                  <img
                    src={resolveAssetUrl(hero.avatarUrl)}
                    alt={loc(hero.name)}
                    className="w-full h-full object-cover object-top pointer-events-none transition-transform duration-500"
                    style={{
                      transform: `scale(${cardTransform.isHovered ? 1.05 : 1}) translateZ(20px)`,
                    }}
                    loading="eager"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      const fallback = resolveAssetUrl('/assets/jaber_hero.png');
                      const secondFallback = resolveAssetUrl('/assets/jabir_profile.png');
                      if (img.src !== fallback && !img.src.endsWith('/assets/jaber_hero.png')) {
                        img.src = fallback;
                      } else if (img.src !== secondFallback) {
                        img.src = secondFallback;
                      }
                    }}
                  />

                  {/* Dark Vignette Overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070A0D] via-transparent to-transparent opacity-70 pointer-events-none" />

                  {/* Dynamic Realistic Light Glare (moves in 3D with cursor) */}
                  <div
                    className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-200"
                    style={{
                      background: `radial-gradient(circle 350px at ${cardTransform.glareX}% ${cardTransform.glareY}%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 87, 34, 0.12) 40%, transparent 80%)`,
                      opacity: cardTransform.isHovered ? 1 : 0
                    }}
                  />

                  {/* Cinema Crosshair Marks on Canvas */}
                  <div className="absolute top-4 left-4 text-[11px] font-mono font-bold text-white/50 tracking-wider flex items-center space-x-1.5 pointer-events-none">
                    <span className="w-1.5 h-1.5 bg-[#FF5722] rounded-full animate-ping" />
                    <span>CAM_01 • 3D TILT</span>
                  </div>
                  <div className="absolute top-4 right-4 text-[10px] font-mono text-neutral-400 bg-black/60 px-2 py-0.5 rounded border border-white/10 pointer-events-none">
                    X: {Math.round(cardTransform.rotY)}°  Y: {Math.round(cardTransform.rotX)}°
                  </div>
                </div>

                {/* 3D Floating Badge 1: Top-Right LIVE Dot */}
                <div 
                  className="absolute top-6 right-6 px-3 py-1 rounded-full bg-black/85 backdrop-blur-md border border-[#FF5722]/50 text-[10px] font-mono font-bold text-white shadow-2xl flex items-center space-x-1.5 pointer-events-none transition-transform duration-100"
                  style={{
                    transform: 'translateZ(45px)'
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-[#FF5722] shadow-[0_0_8px_#FF5722]" />
                  <span>ONLINE & CREATING</span>
                </div>

                {/* 3D Floating Badge 2: Bottom Verified Pill (Equinox Signature Style) */}
                {hero.showFloatingBadge !== false && (
                  <div 
                    className="absolute -bottom-2 -right-2 px-5 py-2.5 rounded-2xl bg-[#0F1419]/95 backdrop-blur-xl border border-[#232B33] text-xs font-bold text-white shadow-2xl flex items-center space-x-2.5 rtl:space-x-reverse glow-orange-sm transition-transform duration-100"
                    style={{
                      transform: 'translateZ(60px)',
                      boxShadow: '0 20px 30px -10px rgba(0,0,0,0.8), 0 0 15px -3px rgba(255,87,34,0.3)'
                    }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5722] shadow-[0_0_8px_#FF5722]" />
                    <div className="flex flex-col">
                      <span className="font-mono text-[11px] tracking-wider uppercase text-white font-bold">
                        {loc(hero.floatingBadgeText) || loc(hero.name) || 'MD JABER HOSAIN'}
                      </span>
                      <span className="text-[9px] font-mono text-[#FF7043] tracking-widest uppercase">
                        CREATIVE VIDEO EDITOR
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Camera HUD Bottom Bar Frame */}
        <div className="mt-14 pt-4 border-t border-[#1D232A]/60 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-neutral-500">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span>24 FPS • 4K • 180° SHUTTER</span>
            <span className="text-neutral-700">•</span>
            <span>COLOR: LOG_TO_709</span>
          </div>

          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <button
              type="button"
              onClick={() => {
                window.scrollBy({ top: window.innerHeight * 0.88, behavior: 'smooth' });
              }}
              className="inline-flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label={ui.hero.scrollDown}
            >
              <span>{ui.hero.scrollDown}</span>
              <ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#FF5722]" />
            </button>
            <span className="text-neutral-700 hidden sm:inline-block">•</span>
            <span className="hidden sm:inline-block text-[#FF5722]">EQX - MDJ_C001</span>
          </div>
        </div>

      </div>
    </section>
  );
};
