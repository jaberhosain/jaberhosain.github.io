import React, { useState } from 'react';
import { Layers, Sparkles, Sliders, Volume2, Film, CheckCircle2, Play, Pause } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Reveal3D } from './common/Reveal3D';

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
      color: '#E4583B',
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
    <section id="craft-timeline" className="py-24 bg-[#121419]/78 border-t border-[#2B303D] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Heading */}
        <Reveal3D direction="up" className="flex flex-col items-center text-center mb-16">
          <p className="inline-flex items-center space-x-2 rtl:space-x-reverse text-[11px] font-mono tracking-[0.22em] uppercase text-[#E4583B] mb-3">
            <Film className="w-3.5 h-3.5 text-[#E4583B]" />
            <span>BEHIND THE TIMELINE</span>
          </p>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F4F0E8] tracking-tight uppercase">
            {language === 'bn' ? 'যেভাবে ভিডিও তৈরি হয় — নিখুঁত পরিমাপে' : 'This is how stories are crafted.'}
            <span className="block font-editorial italic text-[#E4583B] lowercase font-normal mt-1 text-[1.08em]">
              {language === 'bn' ? 'কোনো রেডিমেড টেমপ্লেট নয়, ফ্রেম বাই ফ্রেম।' : 'frame by frame, not templates.'}
            </span>
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-[#A7A298] max-w-2xl font-mono leading-relaxed">
            {language === 'bn'
              ? 'প্রিমিয়ার প্রো এবং আফটার ইফেক্টসের পেশাদার টাইমলাইনে প্রতিটি লেয়ার, কি-ফ্রেম এবং সাউন্ড ডিজাইন সমন্বিত করে সর্বোচ্চ অডিয়েন্স রিটেনশন নিশ্চিত করা হয়।'
              : 'Every cut is calculated. Every sound hit is placed on the exact frame. Layered timeline architecture built for maximum retention.'}
          </p>
        </Reveal3D>

        {/* Studio NLE Timeline Workspace */}
        <Reveal3D direction="depth" delay={90}>
          <div className="studio-card rounded-3xl overflow-hidden mb-10 transition-all duration-300">

          {/* Architectural Sequence Header */}
          <div className="px-5 py-3.5 bg-[#1E222B] border-b border-[#2B303D] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <span className="px-2 py-0.5 rounded bg-[#E4583B]/15 border border-[#E4583B]/35 text-[10px] font-mono font-bold text-[#E4583B] tracking-widest uppercase">
                SEQ 01
              </span>
              <span className="text-xs font-mono text-[#DDD1BE]">
                JABER_STUDIO_MASTER.prproj
              </span>
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-2.5 py-1 rounded-lg bg-[#181B22] hover:bg-[#252A36] text-[#F4F0E8] border border-[#2B303D] flex items-center space-x-1.5 transition-colors cursor-pointer"
                title={isPlaying ? 'Pause Playhead' : 'Play Timeline'}
              >
                {isPlaying ? <Pause className="w-3 h-3 text-[#E4583B]" /> : <Play className="w-3 h-3 text-emerald-400 fill-current" />}
                <span className="text-[11px]">{isPlaying ? 'Scrubbing' : 'Paused'}</span>
              </button>

              <span className="hidden sm:inline-block text-[#A7A298] text-[11px]">
                60.00 FPS • 3840×2160
              </span>
            </div>
          </div>

          {/* Timeline Tracks Workspace */}
          <div className="p-6 space-y-3 relative overflow-hidden bg-[#14171E]">

            {/* Playhead Scrubber Line */}
            {isPlaying && (
              <div className="animate-playhead absolute top-0 bottom-0 w-[2px] bg-[#E4583B] z-30 pointer-events-none">
                <div className="w-2.5 h-2.5 bg-[#E4583B] rotate-45 -translate-x-1 -translate-y-1" />
              </div>
            )}

            {/* Track 1: V3 - Motion Graphics & Kinetic Typography */}
            <div className={`p-3 rounded-xl border transition-all ${
              currentTab.trackFocus === 'V3'
                ? 'bg-[#1D212B] border-[#A855F7]'
                : 'bg-[#171A22] border-[#2B303D] opacity-75'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-[#A855F7]/20 text-[#C084FC] font-bold text-[10px]">V3</span>
                  <span className="text-[#F4F0E8] font-semibold">Motion Graphics • Kinetic Typography • Easing Curves</span>
                </div>
                <span className="text-[10px] text-[#A7A298]">Bezier Curve Graph (After Effects)</span>
              </div>
              <div className="h-7 w-full bg-[#121419] rounded-lg overflow-hidden flex items-center p-1 space-x-1.5">
                <div className="h-full w-28 bg-[#A855F7]/25 border border-[#A855F7]/55 rounded text-[9px] font-mono text-[#C084FC] flex items-center justify-center font-bold">
                  ◆ Hook Title
                </div>
                <div className="h-full w-40 bg-[#A855F7]/35 border border-[#A855F7] rounded text-[9px] font-mono text-[#F4F0E8] flex items-center justify-center font-bold">
                  ◆ Kinetic Reveal + 3D Camera
                </div>
                <div className="h-full flex-1 bg-[#A855F7]/15 border border-[#A855F7]/40 rounded text-[9px] font-mono text-[#A7A298] flex items-center justify-center">
                  ◆ Call-To-Action Burst
                </div>
              </div>
            </div>

            {/* Track 2: V2 - B-Roll, Overlays & 3D Visuals */}
            <div className={`p-3 rounded-xl border transition-all ${
              currentTab.trackFocus === 'V2'
                ? 'bg-[#1D212B] border-[#06B6D4]'
                : 'bg-[#171A22] border-[#2B303D] opacity-75'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-[#06B6D4]/20 text-[#67E8F9] font-bold text-[10px]">V2</span>
                  <span className="text-[#F4F0E8] font-semibold">B-Roll Cutaways & Color Grade LUT</span>
                </div>
                <span className="text-[10px] text-[#A7A298]">Arri Alexa LUT • Contrast E-Curve</span>
              </div>
              <div className="h-7 w-full bg-[#121419] rounded-lg overflow-hidden flex items-center p-1 space-x-1.5">
                <div className="h-full w-36 bg-[#06B6D4]/25 border border-[#06B6D4]/55 rounded text-[9px] font-mono text-cyan-200 flex items-center justify-center">
                  Macro Product B-Roll
                </div>
                <div className="h-full w-48 bg-[#06B6D4]/35 border border-[#06B6D4] rounded text-[9px] font-mono text-[#F4F0E8] flex items-center justify-center font-bold">
                  Split Screen UI Parallax
                </div>
                <div className="h-full flex-1 bg-[#06B6D4]/20 border border-[#06B6D4]/45 rounded text-[9px] font-mono text-cyan-300 flex items-center justify-center">
                  Cinematic Glow Flare
                </div>
              </div>
            </div>

            {/* Track 3: V1 - Primary Story Cut */}
            <div className={`p-3 rounded-xl border transition-all ${
              currentTab.trackFocus === 'V1'
                ? 'bg-[#1D212B] border-[#E4583B]'
                : 'bg-[#171A22] border-[#2B303D] opacity-75'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-[#E4583B]/20 text-[#F07C63] font-bold text-[10px]">V1</span>
                  <span className="text-[#F4F0E8] font-semibold">Main A-Roll • Pacing & Dynamic Zoom Cut</span>
                </div>
                <span className="text-[10px] text-[#E4583B] font-bold">J-Cut / L-Cut Synchronized</span>
              </div>
              <div className="h-7 w-full bg-[#121419] rounded-lg overflow-hidden flex items-center p-1 space-x-1.5">
                <div className="h-full w-24 bg-[#E4583B]/25 border border-[#E4583B]/55 rounded text-[9px] font-mono text-[#F4F0E8] flex items-center justify-center font-bold">
                  Hook (0-3s)
                </div>
                <div className="h-full w-32 bg-[#E4583B]/35 border border-[#E4583B] rounded text-[9px] font-mono text-[#F4F0E8] flex items-center justify-center font-bold">
                  Problem Punch
                </div>
                <div className="h-full w-44 bg-[#E4583B]/30 border border-[#E4583B] rounded text-[9px] font-mono text-[#F4F0E8] flex items-center justify-center font-bold">
                  Solution Demonstration
                </div>
                <div className="h-full flex-1 bg-[#E4583B]/20 border border-[#E4583B]/45 rounded text-[9px] font-mono text-[#A7A298] flex items-center justify-center">
                  Final Payoff & CTA
                </div>
              </div>
            </div>

            {/* Track 4: A1 - Sound Design, Foley & Waves */}
            <div className={`p-3 rounded-xl border transition-all ${
              currentTab.trackFocus === 'A1'
                ? 'bg-[#1D212B] border-[#10B981]'
                : 'bg-[#171A22] border-[#2B303D] opacity-75'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-[#10B981]/20 text-[#34D399] font-bold text-[10px]">A1</span>
                  <span className="text-[#F4F0E8] font-semibold">Sound Design • Sub Bass • Risers • Whooshes</span>
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
              <div className="h-7 w-full bg-[#121419] rounded-lg overflow-hidden flex items-center p-1 space-x-1.5">
                <div className="h-full w-20 bg-[#10B981]/25 border border-[#10B981]/55 rounded text-[9px] font-mono text-emerald-200 flex items-center justify-center">
                  ılı Impact
                </div>
                <div className="h-full w-28 bg-[#10B981]/35 border border-[#10B981] rounded text-[9px] font-mono text-[#F4F0E8] flex items-center justify-center font-bold">
                  ılı Sub Drop + Riser
                </div>
                <div className="h-full w-32 bg-[#10B981]/25 border border-[#10B981]/55 rounded text-[9px] font-mono text-emerald-200 flex items-center justify-center">
                  ılı Fast Whoosh Swish
                </div>
                <div className="h-full flex-1 bg-[#10B981]/15 border border-[#10B981]/40 rounded text-[9px] font-mono text-[#A7A298] flex items-center justify-center">
                  ılı Background Beat Sync (-18dB)
                </div>
              </div>
            </div>

          </div>

          {/* Timeline Bottom Metric Bar */}
          <div className="px-6 py-4 bg-[#1E222B] border-t border-[#2B303D] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <span className="px-3 py-1 rounded-md text-[11px] font-mono font-bold bg-[#E4583B]/15 text-[#F07C63] border border-[#E4583B]/35">
                {currentTab.badge}
              </span>
              <span className="text-xs text-[#DDD1BE] font-mono">
                {currentTab.subtitle}
              </span>
            </div>
            <div className="text-xs font-mono font-bold text-[#F4F0E8] flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{currentTab.metric}</span>
            </div>
          </div>
          </div>
        </Reveal3D>

        {/* 4 Interactive Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`p-5 rounded-2xl text-left rtl:text-right border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#1D212B] border-[#E4583B] -translate-y-1'
                  : 'bg-[#181B22] border-[#2B303D] hover:border-[#A7A298]/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-mono font-bold ${activeTab === tab.id ? 'text-[#E4583B]' : 'text-[#A7A298]'}`}>
                    {tab.number}
                  </span>
                  {activeTab === tab.id && (
                    <span className="w-2 h-2 rounded-full bg-[#E4583B]" />
                  )}
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-[#F4F0E8] mb-2 leading-snug">
                  {tab.title}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#A7A298] mt-2 block">
                Focus on Track <strong className="text-[#F4F0E8]">{tab.trackFocus}</strong>
              </span>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
