import React, { useState, useRef } from 'react';
import { Layers, Sparkles, Volume2, Film, Type, Eye } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { resolveAssetUrl } from '../utils/assetUrl';
import { Reveal3D } from './common/Reveal3D';
import { StudioGlassIcon } from './common/StudioIcon';

export const LayerExplosionShowcase: React.FC = () => {
  const { portfolio, language } = usePortfolio();
  const [isExploded, setIsExploded] = useState<boolean>(true);
  const [activeLayer, setActiveLayer] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotX: 8, rotY: -18 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotY: -18 + x * 20,
      rotX: 8 - y * 16
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rotX: 8, rotY: -18 });
  };

  const previewImage =
    portfolio.bestGraphicWorks?.[0]?.imageUrl ||
    portfolio.bestVideoWorks?.[0]?.thumbnailUrl ||
    '/assets/jaber_hero.png';

  const layers = [
    {
      id: 4,
      name: language === 'bn' ? 'লেয়ার ৪: কাইনেটিক টাইপ ও সাবটাইটেল' : 'Layer 4: Kinetic Typography & Title Gate',
      tech: 'After Effects · Bezier Curves · Alpha Channel',
      icon: Type,
      depthOffset: 120,
      desc: language === 'bn' ? 'অ্যাকশন-সিঙ্ক টেক্সট অ্যানিমেশন যা স্ক্রল থামিয়ে দেয়।' : 'Dynamic typography with custom easing that locks viewer attention.'
    },
    {
      id: 3,
      name: language === 'bn' ? 'লেয়ার ৩: মোশন গ্রাফিক্স ও ৩D অবজেক্ট' : 'Layer 3: 3D Motion Elements & VFX',
      tech: 'Cinema 4D / Blender · Natural Lighting · 60 FPS',
      icon: Sparkles,
      depthOffset: 60,
      desc: language === 'bn' ? 'থ্রিডি গভীরতা এবং স্মুথ ফ্লুইড ট্রানজিশন।' : 'Volumetric lighting, spatial keyframes, and subtle depth blur.'
    },
    {
      id: 2,
      name: language === 'bn' ? 'লেয়ার ২: ৪K ফুটেজ ও সিনেমাটিক কালার গ্রেড' : 'Layer 2: 4K Master Cut & Film LUT',
      tech: 'DaVinci Resolve · 10-Bit Log · Balanced Skin Tones',
      icon: Film,
      depthOffset: 0,
      desc: language === 'bn' ? 'হাই-এন্ড ক্যামেরা ফুটেজের প্রফেশনাল কালার রোল-অফ।' : 'Contrast curves, rich film emulation, and high dynamic range.'
    },
    {
      id: 1,
      name: language === 'bn' ? 'লেয়ার ১: মাল্টি-ট্র্যাক সাউন্ড ডিজাইন' : 'Layer 1: Multi-Track Foley & Sub Bass',
      tech: 'Adobe Audition · Whooshes · -14 LUFS Broadcast',
      icon: Volume2,
      depthOffset: -60,
      desc: language === 'bn' ? 'প্রতিটি কাটের সাথে নিখুঁত বিট ও ইমপ্যাক্ট সাউন্ড।' : 'Layered atmospheric foley, bass risers, and punchy impact sync.'
    }
  ];

  return (
    <section className="py-24 bg-[#0D0E12]/80 border-t border-white/[0.08] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header with 3D Explode Toggle */}
        <Reveal3D direction="up" className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-white/[0.08]">
          <div>
            <div className="inline-flex items-center space-x-2.5 rtl:space-x-reverse mb-3">
              <StudioGlassIcon size="sm">
                <Layers className="w-4 h-4 text-[#F4F0E8]" strokeWidth={1.35} />
              </StudioGlassIcon>
              <span className="text-[11px] font-medium tracking-[0.22em] uppercase text-[#A7A298]">
                3D Layer Deconstruction
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F4F0E8] tracking-tight">
              {language === 'bn' ? 'একটির ভেতর থেকে বহুমাত্রিক বিস্তার' : 'One Frame. Exploded in 3D.'}
              <span className="block font-editorial italic text-[#E4583B] lowercase font-normal mt-1 text-[1.08em]">
                {language === 'bn' ? 'ভিডিওর প্রতিটি লেয়ার যখন থ্রিডি স্পেসে দৃশ্যমান।' : 'see how every cut is stacked frame by frame.'}
              </span>
            </h2>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center space-x-1.5 p-1.5 rounded-full glass-showcase-inner self-start md:self-auto">
            <button
              type="button"
              onClick={() => setIsExploded(true)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center space-x-2 cursor-pointer ${
                isExploded
                  ? 'glass-pill-cta font-semibold'
                  : 'text-[#A7A298] hover:text-[#F4F0E8]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" strokeWidth={1.4} />
              <span>{language === 'bn' ? '৩D এক্সপ্লোডেড ভিউ' : '3D Exploded View'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsExploded(false)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center space-x-2 cursor-pointer ${
                !isExploded
                  ? 'glass-pill-cta font-semibold'
                  : 'text-[#A7A298] hover:text-[#F4F0E8]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" strokeWidth={1.4} />
              <span>{language === 'bn' ? 'সমবেত ফাইনাল' : 'Assembled Final'}</span>
            </button>
          </div>
        </Reveal3D>

        {/* 3D Stage & Layer Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Interactive 3D Perspective Sandwich View */}
          <Reveal3D direction="left" className="lg:col-span-7">
            <div
              ref={containerRef}
              data-cursor="drag"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="h-[460px] sm:h-[540px] relative flex items-center justify-center perspective-1200 cursor-grab active:cursor-grabbing select-none"
            >
              <div
                className="relative w-[300px] sm:w-[420px] aspect-[16/10] preserve-3d transition-transform duration-200 ease-out"
                style={{
                  transform: `rotateX(${tilt.rotX}deg) rotateY(${tilt.rotY}deg)`
                }}
              >
                {layers.map((layer, idx) => {
                  const zDist = isExploded ? layer.depthOffset * 1.5 : idx * 3;
                  const isSelected = activeLayer === layer.id;

                  return (
                    <div
                      key={layer.id}
                      onMouseEnter={() => setActiveLayer(layer.id)}
                      onMouseLeave={() => setActiveLayer(null)}
                      className="absolute inset-0 rounded-[22px] overflow-hidden border transition-all duration-700 ease-out"
                      style={{
                        transform: `translateZ(${zDist}px) ${isSelected ? 'scale(1.045)' : 'scale(1)'}`,
                        borderColor: isSelected
                          ? 'rgba(228, 88, 59, 0.72)'
                          : isExploded
                          ? 'rgba(255, 255, 255, 0.14)'
                          : 'rgba(255, 255, 255, 0.08)',
                        background: 'linear-gradient(180deg, rgba(28, 30, 36, 0.88) 0%, rgba(13, 14, 18, 0.94) 100%)',
                        boxShadow: isSelected
                          ? '0 28px 56px -14px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.18)'
                          : '0 20px 44px -12px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.09)'
                      }}
                    >

                      {/* Layer 1: Audio Visualizer Grid */}
                      {layer.id === 1 && (
                        <div className="w-full h-full p-6 flex flex-col justify-between bg-[#0E1014]/92">
                          <div className="flex items-center justify-between text-xs text-[#DDD1BE]">
                            <span className="font-medium">Layer 01 · Audio Waveform</span>
                            <span className="text-[#A7A298] tabular-nums">-14 LUFS</span>
                          </div>
                          <div className="flex items-end justify-between space-x-1.5 h-20 px-2">
                            {[40, 75, 30, 90, 60, 45, 85, 95, 35, 65, 80, 50, 70, 90, 40, 60, 85, 70].map((h, i) => (
                              <div
                                key={i}
                                className="flex-1 bg-[#EAE5DC]/75 rounded-t transition-all duration-300"
                                style={{ height: `${h}%`, opacity: 0.72 }}
                              />
                            ))}
                          </div>
                          <div className="text-[11px] text-[#A7A298]">
                            Beat Sync · Sub Drops · Foley Hits
                          </div>
                        </div>
                      )}

                      {/* Layer 2: 4K Master Footage */}
                      {layer.id === 2 && (
                        <div className="relative w-full h-full overflow-hidden bg-[#101216]">
                          <img
                            src={resolveAssetUrl(previewImage)}
                            alt="Color Graded Footage"
                            className="w-full h-full object-cover contrast-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 text-[#EAE5DC] text-[10px] border border-white/15">
                            Log to 709 Color Grade
                          </div>
                        </div>
                      )}

                      {/* Layer 3: 3D Motion Graphics & Optical Overlay */}
                      {layer.id === 3 && (
                        <div className="w-full h-full p-6 flex flex-col justify-between bg-[#14161B]/90">
                          <div className="flex items-center justify-between text-xs text-[#DDD1BE]">
                            <span className="font-medium">Layer 03 · 3D Motion &amp; VFX</span>
                            <span className="text-[#A7A298] tabular-nums">60 FPS</span>
                          </div>
                          <div className="relative flex items-center justify-center">
                            <div
                              className="w-24 h-24 rounded-full border border-dashed border-white/30 animate-spin"
                              style={{ animationDuration: '14s' }}
                            />
                            <Sparkles className="w-7 h-7 text-[#F4F0E8] absolute" strokeWidth={1.35} />
                          </div>
                          <div className="text-[11px] text-[#A7A298]">
                            Custom Bezier Keyframe Curves · Depth Pass
                          </div>
                        </div>
                      )}

                      {/* Layer 4: Kinetic Typography & Optical Title Gate */}
                      {layer.id === 4 && (
                        <div className="w-full h-full p-6 flex flex-col justify-between bg-[#121419]/88">
                          <div className="flex items-center justify-between text-[11px] text-[#A7A298]">
                            <span>Frame 018 · 24 FPS</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#E4583B] text-[#FFFFFF] font-medium text-[10px]">
                              Title Gate
                            </span>
                          </div>
                          <div className="text-center">
                            <h3 className="font-display text-xl sm:text-2xl font-extrabold text-[#F4F0E8] uppercase tracking-tight">
                              Storytelling That Converts
                            </h3>
                            <span className="text-xs font-editorial italic text-[#E4583B] tracking-wide mt-1 block">
                              crafted frame by frame in 3D space
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-[#A7A298]">
                            <span>4K Master Grade</span>
                            <span className="text-[#DDD1BE]">MD Jaber Hosain</span>
                          </div>
                        </div>
                      )}

                      {/* Subtle Depth Label */}
                      {isExploded && (
                        <div className="absolute bottom-2.5 right-3 px-2.5 py-0.5 rounded-full bg-black/75 border border-white/12 text-[10px] text-[#DDD1BE] tabular-nums">
                          Z · {layer.depthOffset}px
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal3D>

          {/* Right Column: Layer Architecture Cards */}
          <Reveal3D direction="right" delay={120} className="lg:col-span-5 space-y-3">
            <span className="text-[11px] font-medium text-[#A7A298] uppercase tracking-[0.2em] block mb-1">
              {language === 'bn' ? 'লেয়ার স্পেসিফিকেশন' : 'Layer Architecture'}
            </span>

            {layers.map((layer) => {
              const Icon = layer.icon;
              const isSelected = activeLayer === layer.id;

              return (
                <div
                  key={layer.id}
                  onMouseEnter={() => setActiveLayer(layer.id)}
                  onMouseLeave={() => setActiveLayer(null)}
                  className={`p-4 rounded-[20px] transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'glass-showcase-card border-[#E4583B]/60 -translate-x-1.5'
                      : 'glass-showcase-card-muted hover:-translate-x-0.5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <StudioGlassIcon size="sm">
                        <Icon className="w-4 h-4 text-[#F4F0E8]" strokeWidth={1.35} />
                      </StudioGlassIcon>
                      <h4 className="font-semibold text-sm text-[#F4F0E8]">
                        {layer.name}
                      </h4>
                    </div>

                    <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full glass-pill-ghost text-[#DDD1BE] tabular-nums shrink-0">
                      {layer.depthOffset}px
                    </span>
                  </div>

                  <p className="text-xs text-[#A7A298] pl-12 rtl:pl-0 rtl:pr-12 leading-relaxed mb-1.5">
                    {layer.desc}
                  </p>

                  <div className="pl-12 rtl:pl-0 rtl:pr-12 text-[11px] text-[#A7A298]/75">
                    {layer.tech}
                  </div>
                </div>
              );
            })}
          </Reveal3D>

        </div>

      </div>
    </section>
  );
};
