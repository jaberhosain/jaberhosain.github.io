import React, { useState, useRef } from 'react';
import { Layers, Sparkles, Volume2, Film, Type, Eye, ArrowRight } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { resolveAssetUrl } from '../utils/assetUrl';

export const LayerExplosionShowcase: React.FC = () => {
  const { portfolio, loc, language } = usePortfolio();
  const [isExploded, setIsExploded] = useState<boolean>(true);
  const [activeLayer, setActiveLayer] = useState<number | null>(null);

  // 3D Mouse Parallax
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

  const previewImage = portfolio.bestGraphicWorks?.[0]?.imageUrl || portfolio.bestVideoWorks?.[0]?.thumbnailUrl || '/assets/jaber_hero.png';

  const layers = [
    {
      id: 4,
      name: language === 'bn' ? 'লেয়ার ৪: কাইনেটিক টাইপ ও সাবটাইটেল' : 'Layer 4: Kinetic Typography & Hook HUD',
      tech: 'After Effects • Bezier Curves • Alpha Channel',
      icon: Type,
      color: '#FF5722',
      depthOffset: 120,
      desc: language === 'bn' ? 'অ্যাকশন-সিঙ্ক টেক্সট অ্যানিমেশন যা স্ক্রল থামিয়ে দেয়।' : 'Dynamic typography with custom easing that locks viewer attention.'
    },
    {
      id: 3,
      name: language === 'bn' ? 'লেয়ার ৩: মোশন গ্রাফিক্স ও ৩D অবজেক্ট' : 'Layer 3: 3D Motion Elements & VFX',
      tech: 'Cinema 4D / Blender • Real Lighting • 60 FPS',
      icon: Sparkles,
      color: '#A855F7',
      depthOffset: 60,
      desc: language === 'bn' ? 'থ্রিডি গভীরতা এবং স্মুথ ফ্লুইড ট্রানজিশন।' : 'Volumetric 3D lighting, physics-based particles, and UI motion.'
    },
    {
      id: 2,
      name: language === 'bn' ? 'লেয়ার ২: ৪K ফুটেজ ও সিনেমাটিক কালার গ্রেড' : 'Layer 2: 4K Master Cut & Film LUT',
      tech: 'DaVinci Resolve • 10-Bit Log • Balanced Skin Tones',
      icon: Film,
      color: '#06B6D4',
      depthOffset: 0,
      desc: language === 'bn' ? 'হাই-এন্ড ক্যামেরা ফুটেজের প্রফেশনাল কালার রোল-অফ।' : 'Contrast curves, rich film emulation, and high dynamic range.'
    },
    {
      id: 1,
      name: language === 'bn' ? 'লেয়ার ১: মাল্টি-ট্র্যাক সাউন্ড ডিজাইন' : 'Layer 1: Multi-Track Foley & Sub Bass',
      tech: 'Adobe Audition • Whooshes • -14 LUFS Broadcast',
      icon: Volume2,
      color: '#10B981',
      depthOffset: -60,
      desc: language === 'bn' ? 'প্রতিটি কাটের সাথে নিখুঁত বিট ও ইমপ্যাক্ট সাউন্ড।' : 'Layered atmospheric foley, bass risers, and punchy impact sync.'
    }
  ];

  return (
    <section className="py-24 bg-[#090C0F] border-t border-[#1D232A] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF5722]/8 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#A855F7]/8 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header with 3D Explode Toggle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-[#1D232A]">
          <div>
            <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-md bg-[#181E24] border border-[#232B33] text-xs font-mono text-[#FF5722] mb-3">
              <Layers className="w-3.5 h-3.5 text-[#FF5722]" />
              <span>3D LAYER DECONSTRUCTION</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight uppercase">
              {language === 'bn' ? 'একটির ভেতর থেকে বহুমাত্রিক বিস্তার' : 'One Frame. Exploded in 3D.'}
              <span className="block font-serif italic text-[#FF7043] lowercase font-normal mt-1">
                {language === 'bn' ? 'ভিডিওর প্রতিটি লেয়ার যখন থ্রিডি স্পেসে দৃশ্যমান।' : 'see how every cut is stacked frame by frame.'}
              </span>
            </h2>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center space-x-2 p-1.5 rounded-2xl bg-[#12161A] border border-[#232B33] self-start md:self-auto">
            <button
              type="button"
              onClick={() => setIsExploded(true)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2 ${
                isExploded
                  ? 'bg-[#FF5722] text-white glow-orange-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? '⬡ ৩D এক্সপ্লোডেড ভিউ' : '⬡ 3D Exploded View'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsExploded(false)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2 ${
                !isExploded
                  ? 'bg-[#FF5722] text-white glow-orange-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? '◼ সমবেত ফাইনাল' : '◼ Assembled Final'}</span>
            </button>
          </div>
        </div>

        {/* 3D Stage & Layer Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Interactive 3D Perspective Sandwich View */}
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="lg:col-span-7 h-[460px] sm:h-[540px] relative flex items-center justify-center perspective-1200 cursor-grab active:cursor-grabbing select-none"
          >
            <div 
              className="relative w-[300px] sm:w-[420px] aspect-[16/10] preserve-3d transition-transform duration-200 ease-out"
              style={{
                transform: `rotateX(${tilt.rotX}deg) rotateY(${tilt.rotY}deg)`
              }}
            >
              
              {/* Render 4 Floating Glass Planes */}
              {layers.map((layer, idx) => {
                const zDist = isExploded ? layer.depthOffset * 1.5 : idx * 3;
                const isSelected = activeLayer === layer.id;

                return (
                  <div
                    key={layer.id}
                    onMouseEnter={() => setActiveLayer(layer.id)}
                    onMouseLeave={() => setActiveLayer(null)}
                    className="absolute inset-0 rounded-2xl overflow-hidden border backdrop-blur-md transition-all duration-700 ease-out shadow-2xl"
                    style={{
                      transform: `translateZ(${zDist}px) ${isSelected ? 'scale(1.05)' : 'scale(1)'}`,
                      borderColor: isSelected ? layer.color : isExploded ? `${layer.color}66` : '#232B33',
                      backgroundColor: isExploded ? 'rgba(15, 20, 25, 0.75)' : '#0F1419',
                      boxShadow: isSelected 
                        ? `0 25px 50px -12px rgba(0,0,0,0.8), 0 0 25px ${layer.color}40`
                        : '0 20px 40px -10px rgba(0,0,0,0.6)'
                    }}
                  >
                    
                    {/* Layer 1: Audio Visualizer Grid */}
                    {layer.id === 1 && (
                      <div className="w-full h-full p-6 flex flex-col justify-between bg-gradient-to-br from-[#0A1A12] to-[#050B08]">
                        <div className="flex items-center justify-between text-xs font-mono text-[#34D399]">
                          <span className="font-bold">LAYER 01: AUDIO WAVEFORM</span>
                          <span>-14 LUFS</span>
                        </div>
                        <div className="flex items-end justify-between space-x-1.5 h-20 px-2">
                          {[40, 75, 30, 90, 60, 45, 85, 95, 35, 65, 80, 50, 70, 90, 40, 60, 85, 70].map((h, i) => (
                            <div 
                              key={i} 
                              className="flex-1 bg-[#10B981] rounded-t transition-all duration-300"
                              style={{ height: `${h}%`, opacity: 0.8 }}
                            />
                          ))}
                        </div>
                        <div className="text-[10px] font-mono text-neutral-400">
                          Beat Sync • Sub Drops • Foley Hits
                        </div>
                      </div>
                    )}

                    {/* Layer 2: 4K Master Footage */}
                    {layer.id === 2 && (
                      <div className="relative w-full h-full overflow-hidden bg-[#0A0D10]">
                        <img
                          src={resolveAssetUrl(previewImage)}
                          alt="Color Graded Footage"
                          className="w-full h-full object-cover filter contrast-110 saturate-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 text-cyan-300 text-[10px] font-mono border border-cyan-500/40">
                          LOG TO 709 COLOR GRADE
                        </div>
                      </div>
                    )}

                    {/* Layer 3: 3D Motion Graphics & Vector Overlay */}
                    {layer.id === 3 && (
                      <div className="w-full h-full p-6 flex flex-col justify-between bg-[#150F22]/80 border border-purple-500/30">
                        <div className="flex items-center justify-between text-xs font-mono text-[#C084FC]">
                          <span className="font-bold">LAYER 03: 3D MOTION & VFX</span>
                          <span>60 FPS</span>
                        </div>
                        <div className="relative flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#A855F7] animate-spin" style={{ animationDuration: '10s' }} />
                          <Sparkles className="w-8 h-8 text-[#C084FC] absolute" />
                        </div>
                        <div className="text-[10px] font-mono text-purple-300">
                          Custom Bezier Keyframe Curves • Particle Emitters
                        </div>
                      </div>
                    )}

                    {/* Layer 4: Kinetic Typography & Hook HUD */}
                    {layer.id === 4 && (
                      <div className="w-full h-full p-6 flex flex-col justify-between bg-black/40">
                        <div className="flex items-center justify-between text-xs font-mono text-[#FF7043]">
                          <span className="font-bold">[ • REC ] 00:00:18:24</span>
                          <span className="px-2 py-0.5 rounded bg-[#FF5722] text-white font-bold text-[10px]">HOOK TITLE</span>
                        </div>
                        <div className="text-center">
                          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight text-gradient-orange">
                            STORYTELLING THAT CONVERTS
                          </h3>
                          <span className="text-xs font-mono text-neutral-300 tracking-widest mt-1 block">
                            NO TEMPLATES • MEASURED FRAME BY FRAME
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                          <span>24 FPS • 4K</span>
                          <span className="text-[#FF5722]">MD JABER HOSAIN</span>
                        </div>
                      </div>
                    )}

                    {/* Depth Label Badge on edge */}
                    {isExploded && (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/90 border border-white/20 text-[9px] font-mono text-white font-bold">
                        Z: {layer.depthOffset}px
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          </div>

          {/* Right Column: Layer Info Cards */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block mb-1">
              {language === 'bn' ? 'লেয়ার স্পেসিফিকেশন' : 'LAYER ARCHITECTURE'}
            </span>

            {layers.map((layer) => {
              const Icon = layer.icon;
              const isSelected = activeLayer === layer.id;

              return (
                <div
                  key={layer.id}
                  onMouseEnter={() => setActiveLayer(layer.id)}
                  onMouseLeave={() => setActiveLayer(null)}
                  className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-[#181E24] shadow-xl -translate-x-1.5'
                      : 'bg-[#12161A] border-[#232B33] hover:border-neutral-600'
                  }`}
                  style={{
                    borderColor: isSelected ? layer.color : undefined
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${layer.color}25`, color: layer.color }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm text-white">
                        {layer.name}
                      </h4>
                    </div>

                    <span 
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${layer.color}15`, color: layer.color }}
                    >
                      {layer.depthOffset}px Depth
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 pl-10 rtl:pl-0 rtl:pr-10 leading-relaxed mb-2">
                    {layer.desc}
                  </p>

                  <div className="pl-10 rtl:pl-0 rtl:pr-10 text-[10px] font-mono text-neutral-500">
                    {layer.tech}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
