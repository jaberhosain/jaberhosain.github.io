import React, { useState } from 'react';
import { Layers, Sparkles, Sliders, Volume2, Film, CheckCircle2, Play, Pause } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export const CraftTimeline: React.FC = () => {
  const { language } = usePortfolio();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const tabs = [
    {
      id: 0,
      number: '01',
      title: language === 'bn' ? 'প্রিসিশন কাটিং ও পেসিং' : 'Precision Pacing & Rhythm',
      subtitle: language === 'bn' ? 'ভিউয়ার রিটেনশন ধরে রাখার জন্য অ্যাকশন-কাট এবং ফ্রেম মেজারমেন্ট' : 'Measured cut-on-action pacing designed to hold attention past 3 seconds.',
      trackFocus: 'V1',
      color: '#FF5722',
      metric: '92% Avg. Retention',
      badge: 'SPEED RAMP + HOOK'
    },
    {
      id: 1,
      number: '02',
      title: language === 'bn' ? 'কাইনেটিক টাইপ ও মোশন গ্রাফিক্স' : 'Kinetic Type & Motion Graphics',
      subtitle: language === 'bn' ? 'কাস্টম কি-ফ্রেম কার্ভ এবং ফিজিক্স সমৃদ্ধ মোশন, কোনো ক্যাটালগ টেমপ্লেট নয়' : 'Dynamic typography with custom Bezier easing curves and spatial physics.',
      trackFocus: 'V3',
      color: '#A855F7',
      metric: '60 FPS Bezier Easing',
      badge: 'CUSTOM KEYFRAMES'
    },
    {
      id: 2,
      number: '03',
      title: language === 'bn' ? 'সিনেমাটিক কালার গ্রেডিং' : 'Cinematic Color & Contrast',
      subtitle: language === 'bn' ? 'লগ ও র ফুটেজ থেকে হাই-এন্ড ব্র‍্যান্ড লুক ও কালার ব্যালান্স' : 'Film emulation, shadow roll-off, and balanced skin tone highlights.',
      trackFocus: 'V2',
      color: '#06B6D4',
      metric: '10-Bit 4K Master',
      badge: 'COLOR SCIENCE'
    },
    {
      id: 3,
      number: '04',
      title: language === 'bn' ? 'সাউন্ড ডিজাইন ও অডিও ড্রাইভ' : 'Sound Design & Foley Impact',
      subtitle: language === 'bn' ? 'মাল্টি-লেয়ার সাউন্ড ইফেক্ট, রাইজার্স ও বিট-সিঙ্ক ট্রানজিশন' : 'Multi-track foley, sub-bass drops, risers, and vocal clarity EQ.',
      trackFocus: 'A1',
      color: '#10B981',
      metric: '-14 LUFS Broadcast EQ',
      badge: 'LAYERED FOLEY'
    }
  ];

  const currentTab = tabs[activeTab];

  return (
    <section id="craft-timeline" className="py-24 bg-[#080B0D] border-t border-[#1D232A] relative overflow-hidden">
      {/* Background ambient radial aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#FF5722]/8 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-md bg-[#181E24] border border-[#232B33] text-xs font-mono text-[#FF5722] mb-3">
            <Film className="w-3.5 h-3.5 text-[#FF5722]" />
            <span>BEHIND THE TIMELINE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight uppercase">
            {language === 'bn' ? 'যেভাবে ভিডিও তৈরি হয় — নিখুঁত পরিমাপে' : 'This is how stories are crafted.'}
            <span className="block font-serif italic text-[#FF7043] lowercase font-normal mt-1">
              {language === 'bn' ? 'কোনো রেডিমেড টেমপ্লেট নয়, ফ্রেম বাই ফ্রেম।' : 'frame by frame, not templates.'}
            </span>
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-neutral-400 max-w-2xl font-mono leading-relaxed">
            {language === 'bn' 
              ? 'প্রিমিয়ার প্রো এবং আফটার ইফেক্টসের পেশাদার টাইমলাইনে প্রতিটি লেয়ার, কি-ফ্রেম এবং সাউন্ড ডিজাইন সমন্বিত করে সর্বোচ্চ অডিয়েন্স রিটেনশন নিশ্চিত করা হয়।'
              : 'Every cut is calculated. Every sound hit is placed on the exact frame. Layered timeline architecture built for maximum retention.'}
          </p>
        </div>

        {/* Mac OS Style Window Frame: Interactive Timeline Studio */}
        <div className="rounded-3xl bg-[#0F1419] border border-[#232B33] shadow-2xl overflow-hidden mb-10 transition-all duration-300">
          
          {/* Window Chrome Header */}
          <div className="px-5 py-3.5 bg-[#141A20] border-b border-[#232B33] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <span className="w-3 h-3 rounded-full bg-[#10B981]" />
              <span className="text-xs font-mono text-neutral-400 pl-3">
                JABER_PROJECT_MAIN.prproj — Sequence 01
              </span>
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-2.5 py-1 rounded-lg bg-[#181E24] hover:bg-[#202830] text-white border border-[#232B33] flex items-center space-x-1.5 transition-colors"
                title={isPlaying ? 'Pause Playhead' : 'Play Timeline'}
              >
                {isPlaying ? <Pause className="w-3 h-3 text-[#FF5722]" /> : <Play className="w-3 h-3 text-emerald-400 fill-current" />}
                <span className="text-[11px]">{isPlaying ? 'Scrubbing' : 'Paused'}</span>
              </button>

              <span className="px-2.5 py-1 rounded-lg bg-black/60 text-[#FF5722] border border-[#232B33] text-[11px] font-bold">
                00:00:18:24
              </span>
              <span className="hidden sm:inline-block text-neutral-500 text-[11px]">
                60.00 FPS • 3840×2160
              </span>
            </div>
          </div>

          {/* Timeline Tracks Workspace */}
          <div className="p-6 space-y-3 relative overflow-hidden bg-[#0B0F12]">
            
            {/* Playhead Scrubber Line */}
            {isPlaying && (
              <div className="animate-playhead absolute top-0 bottom-0 w-[2px] bg-[#FF5722] shadow-[0_0_12px_#FF5722] z-30 pointer-events-none">
                <div className="w-3 h-3 bg-[#FF5722] rotate-45 -translate-x-1 -translate-y-1 shadow-md" />
              </div>
            )}

            {/* Track 1: V3 - Motion Graphics & Kinetic Typography */}
            <div className={`p-3 rounded-xl border transition-all ${
              currentTab.trackFocus === 'V3' 
                ? 'bg-[#181E24] border-[#A855F7] shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                : 'bg-[#101418] border-[#1D232A] opacity-75'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-[#A855F7]/20 text-[#C084FC] font-bold text-[10px]">V3</span>
                  <span className="text-white font-semibold">Motion Graphics • Kinetic Typography • Easing Curves</span>
                </div>
                <span className="text-[10px] text-neutral-400">Bezier Curve Graph (After Effects)</span>
              </div>
              <div className="h-7 w-full bg-[#0A0D10] rounded-lg overflow-hidden flex items-center p-1 space-x-1.5">
                <div className="h-full w-28 bg-[#A855F7]/30 border border-[#A855F7]/60 rounded text-[9px] font-mono text-[#C084FC] flex items-center justify-center font-bold">
                  ◆ Hook Title
                </div>
                <div className="h-full w-40 bg-[#A855F7]/40 border border-[#A855F7] rounded text-[9px] font-mono text-white flex items-center justify-center font-bold shadow-sm">
                  ◆ Kinetic Reveal + 3D Camera
                </div>
                <div className="h-full flex-1 bg-[#A855F7]/20 border border-[#A855F7]/40 rounded text-[9px] font-mono text-neutral-300 flex items-center justify-center">
                  ◆ Call-To-Action Burst
                </div>
              </div>
            </div>

            {/* Track 2: V2 - B-Roll, Overlays & 3D Visuals */}
            <div className={`p-3 rounded-xl border transition-all ${
              currentTab.trackFocus === 'V2' 
                ? 'bg-[#181E24] border-[#06B6D4] shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                : 'bg-[#101418] border-[#1D232A] opacity-75'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-[#06B6D4]/20 text-[#67E8F9] font-bold text-[10px]">V2</span>
                  <span className="text-white font-semibold">B-Roll Cutaways & Color Grade LUT</span>
                </div>
                <span className="text-[10px] text-neutral-400">Arri Alexa LUT • Contrast E-Curve</span>
              </div>
              <div className="h-7 w-full bg-[#0A0D10] rounded-lg overflow-hidden flex items-center p-1 space-x-1.5">
                <div className="h-full w-36 bg-[#06B6D4]/30 border border-[#06B6D4]/60 rounded text-[9px] font-mono text-cyan-200 flex items-center justify-center">
                  Macro Product B-Roll
                </div>
                <div className="h-full w-48 bg-[#06B6D4]/40 border border-[#06B6D4] rounded text-[9px] font-mono text-white flex items-center justify-center font-bold">
                  Split Screen UI Parallax
                </div>
                <div className="h-full flex-1 bg-[#06B6D4]/25 border border-[#06B6D4]/50 rounded text-[9px] font-mono text-cyan-300 flex items-center justify-center">
                  Cinematic Glow Flare
                </div>
              </div>
            </div>

            {/* Track 3: V1 - Primary Story Cut */}
            <div className={`p-3 rounded-xl border transition-all ${
              currentTab.trackFocus === 'V1' 
                ? 'bg-[#181E24] border-[#FF5722] shadow-[0_0_15px_rgba(255,87,34,0.18)]' 
                : 'bg-[#101418] border-[#1D232A] opacity-75'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-[#FF5722]/20 text-[#FF7043] font-bold text-[10px]">V1</span>
                  <span className="text-white font-semibold">Main A-Roll • Pacing & Dynamic Zoom Cut</span>
                </div>
                <span className="text-[10px] text-[#FF5722] font-bold">J-Cut / L-Cut Synchronized</span>
              </div>
              <div className="h-7 w-full bg-[#0A0D10] rounded-lg overflow-hidden flex items-center p-1 space-x-1.5">
                <div className="h-full w-24 bg-[#FF5722]/30 border border-[#FF5722]/60 rounded text-[9px] font-mono text-white flex items-center justify-center font-bold">
                  Hook (0-3s)
                </div>
                <div className="h-full w-32 bg-[#FF5722]/40 border border-[#FF5722] rounded text-[9px] font-mono text-white flex items-center justify-center font-bold">
                  Problem Punch
                </div>
                <div className="h-full w-44 bg-[#FF5722]/35 border border-[#FF5722] rounded text-[9px] font-mono text-white flex items-center justify-center font-bold">
                  Solution Demonstration
                </div>
                <div className="h-full flex-1 bg-[#FF5722]/25 border border-[#FF5722]/50 rounded text-[9px] font-mono text-neutral-300 flex items-center justify-center">
                  Final Payoff & CTA
                </div>
              </div>
            </div>

            {/* Track 4: A1 - Sound Design, Foley & Waves */}
            <div className={`p-3 rounded-xl border transition-all ${
              currentTab.trackFocus === 'A1' 
                ? 'bg-[#181E24] border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.18)]' 
                : 'bg-[#101418] border-[#1D232A] opacity-75'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-[#10B981]/20 text-[#34D399] font-bold text-[10px]">A1</span>
                  <span className="text-white font-semibold">Sound Design • Sub Bass • Risers • Whooshes</span>
                </div>
                {/* Audio visualizer bars */}
                <div className="flex items-center space-x-1 h-3.5">
                  <span className="w-1 bg-[#10B981] rounded-full animate-wave-1" />
                  <span className="w-1 bg-[#10B981] rounded-full animate-wave-2" />
                  <span className="w-1 bg-[#10B981] rounded-full animate-wave-3" />
                  <span className="w-1 bg-[#10B981] rounded-full animate-wave-4" />
                  <span className="w-1 bg-[#10B981] rounded-full animate-wave-5" />
                </div>
              </div>
              <div className="h-7 w-full bg-[#0A0D10] rounded-lg overflow-hidden flex items-center p-1 space-x-1.5">
                <div className="h-full w-20 bg-[#10B981]/30 border border-[#10B981]/60 rounded text-[9px] font-mono text-emerald-200 flex items-center justify-center">
                  ılı Impact
                </div>
                <div className="h-full w-28 bg-[#10B981]/40 border border-[#10B981] rounded text-[9px] font-mono text-white flex items-center justify-center font-bold">
                  ılı Sub Drop + Riser
                </div>
                <div className="h-full w-32 bg-[#10B981]/30 border border-[#10B981]/60 rounded text-[9px] font-mono text-emerald-200 flex items-center justify-center">
                  ılı Fast Whoosh Swish
                </div>
                <div className="h-full flex-1 bg-[#10B981]/20 border border-[#10B981]/40 rounded text-[9px] font-mono text-neutral-300 flex items-center justify-center">
                  ılı Background Beat Sync (-18dB)
                </div>
              </div>
            </div>

          </div>

          {/* Timeline Bottom Metric Bar */}
          <div className="px-6 py-4 bg-[#141A20] border-t border-[#232B33] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FF5722]/15 text-[#FF7043] border border-[#FF5722]/30">
                {currentTab.badge}
              </span>
              <span className="text-xs text-neutral-300 font-mono">
                {currentTab.subtitle}
              </span>
            </div>
            <div className="text-xs font-mono font-bold text-white flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{currentTab.metric}</span>
            </div>
          </div>
        </div>

        {/* 4 Interactive Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`p-5 rounded-2xl text-left rtl:text-right border transition-all duration-300 flex flex-col justify-between ${
                activeTab === tab.id
                  ? 'bg-[#141A20] border-[#FF5722] shadow-xl -translate-y-1'
                  : 'bg-[#0F1419] border-[#232B33] hover:border-neutral-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-mono font-bold ${activeTab === tab.id ? 'text-[#FF5722]' : 'text-neutral-500'}`}>
                    {tab.number}
                  </span>
                  {activeTab === tab.id && (
                    <span className="w-2 h-2 rounded-full bg-[#FF5722] shadow-[0_0_8px_#FF5722]" />
                  )}
                </div>
                <h3 className="font-bold text-sm sm:text-base text-white mb-2 leading-snug">
                  {tab.title}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-neutral-400 mt-2 block">
                Focus on Track <strong className="text-white">{tab.trackFocus}</strong>
              </span>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
