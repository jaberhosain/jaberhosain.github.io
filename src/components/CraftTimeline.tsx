import React, { useState } from 'react';
import { Film, Play, Pause } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Reveal3D } from './common/Reveal3D';
import { StudioGlassIcon } from './common/StudioIcon';

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
      metric: '92% Avg. Retention',
      badge: 'Speed Ramp + Hook'
    },
    {
      id: 1,
      number: '02',
      title: language === 'bn' ? 'কাইনেটিক টাইপ ও মোশন গ্রাফিক্স' : 'Kinetic Type & Motion Graphics',
      subtitle: language === 'bn' ? 'কাস্টম কি-ফ্রেম কার্ভ এবং ফিজিক্স সমৃদ্ধ মোশন, কোনো ক্যাটালগ টেমপ্লেট নয়' : 'Dynamic typography with custom Bezier easing curves and spatial physics.',
      trackFocus: 'V3',
      metric: '60 FPS Bezier Easing',
      badge: 'Custom Keyframes'
    },
    {
      id: 2,
      number: '03',
      title: language === 'bn' ? 'সিনেমাটিক কালার গ্রেডিং' : 'Cinematic Color & Contrast',
      subtitle: language === 'bn' ? 'লগ ও র ফুটেজ থেকে হাই-এন্ড ব্র‍্যান্ড লুক ও কালার ব্যালান্স' : 'Film emulation, shadow roll-off, and balanced skin tone highlights.',
      trackFocus: 'V2',
      metric: '10-Bit 4K Master',
      badge: 'Color Science'
    },
    {
      id: 3,
      number: '04',
      title: language === 'bn' ? 'সাউন্ড ডিজাইন ও অডিও ড্রাইভ' : 'Sound Design & Foley Impact',
      subtitle: language === 'bn' ? 'মাল্টি-লেয়ার সাউন্ড ইফেক্ট, রাইজার্স ও বিট-সিঙ্ক ট্রানজিশন' : 'Multi-track foley, sub-bass drops, risers, and vocal clarity EQ.',
      trackFocus: 'A1',
      metric: '-14 LUFS Broadcast EQ',
      badge: 'Layered Foley'
    }
  ];

  const currentTab = tabs[activeTab];

  return (
    <section id="craft-timeline" className="py-24 bg-[#0B0C10]/78 border-t border-white/[0.08] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Heading */}
        <Reveal3D direction="up" className="flex flex-col items-center text-center mb-14">
          <div className="inline-flex items-center space-x-2.5 rtl:space-x-reverse mb-3">
            <StudioGlassIcon size="sm">
              <Film className="w-4 h-4 text-[#F4F0E8]" strokeWidth={1.35} />
            </StudioGlassIcon>
            <span className="text-[11px] font-medium tracking-[0.22em] uppercase text-[#A7A298]">
              Behind the Timeline
            </span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F4F0E8] tracking-tight">
            {language === 'bn' ? 'যেভাবে ভিডিও তৈরি হয় — নিখুঁত পরিমাপে' : 'This is how stories are crafted.'}
            <span className="block font-editorial italic text-[#E4583B] lowercase font-normal mt-1 text-[1.08em]">
              {language === 'bn' ? 'কোনো রেডিমেড টেমপ্লেট নয়, ফ্রেম বাই ফ্রেম।' : 'frame by frame, not templates.'}
            </span>
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-[#A7A298] max-w-2xl leading-relaxed">
            {language === 'bn'
              ? 'প্রিমিয়ার প্রো এবং আফটার ইফেক্টসের পেশাদার টাইমলাইনে প্রতিটি লেয়ার, কি-ফ্রেম এবং সাউন্ড ডিজাইন সমন্বিত করে সর্বোচ্চ অডিয়েন্স রিটেনশন নিশ্চিত করা হয়।'
              : 'Every cut is calculated. Every sound hit is placed on the exact frame. Layered timeline architecture built for maximum retention.'}
          </p>
        </Reveal3D>

        {/* Smoked-Glass NLE Timeline Workspace */}
        <Reveal3D direction="depth" delay={90}>
          <div className="glass-showcase-card rounded-[28px] overflow-hidden mb-10 transition-all duration-300">

            {/* Architectural Sequence Header */}
            <div className="px-6 py-4 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 rounded-full glass-pill-ghost text-[11px] font-medium text-[#DDD1BE]">
                  Sequence 01
                </span>
                <span className="text-xs text-[#A7A298]">
                  Jaber_Studio_Master.prproj
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3.5 py-1.5 rounded-full glass-pill-ghost text-[#F4F0E8] flex items-center space-x-1.5 transition-colors cursor-pointer"
                  title={isPlaying ? 'Pause Playhead' : 'Play Timeline'}
                >
                  {isPlaying ? (
                    <Pause className="w-3 h-3 text-[#E4583B]" strokeWidth={1.5} />
                  ) : (
                    <Play className="w-3 h-3 text-[#F4F0E8] fill-current" strokeWidth={1.5} />
                  )}
                  <span className="text-[11px] font-medium">{isPlaying ? 'Scrubbing' : 'Paused'}</span>
                </button>

                <span className="hidden sm:inline-block text-[#A7A298] text-[11px] tabular-nums">
                  60.00 fps · 3840×2160
                </span>
              </div>
            </div>

            {/* Timeline Tracks Workspace */}
            <div className="p-6 space-y-3 relative overflow-hidden">

              {/* Playhead Scrubber Line */}
              {isPlaying && (
                <div className="animate-playhead absolute top-0 bottom-0 w-[1.5px] bg-[#E4583B]/85 z-30 pointer-events-none">
                  <div className="w-2.5 h-2.5 bg-[#E4583B] rotate-45 -translate-x-1 -translate-y-1" />
                </div>
              )}

              {/* Track 1: V3 - Motion Graphics & Kinetic Typography */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  currentTab.trackFocus === 'V3'
                    ? 'glass-showcase-inner border-[#E4583B]/55'
                    : 'bg-white/[0.02] border-white/[0.06] opacity-70'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2.5">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/[0.08] text-[#F4F0E8] font-medium text-[10px]">V3</span>
                    <span className="text-[#F4F0E8] font-medium">Motion Graphics · Kinetic Typography · Easing Curves</span>
                  </div>
                  <span className="text-[11px] text-[#A7A298] hidden sm:inline">After Effects Bezier Graph</span>
                </div>
                <div className="h-7 w-full bg-black/45 rounded-xl overflow-hidden flex items-center p-1 space-x-1.5">
                  <div className="h-full w-28 bg-white/[0.08] border border-white/[0.12] rounded-lg text-[10px] text-[#EAE5DC] flex items-center justify-center font-medium">
                    Hook Title
                  </div>
                  <div className="h-full w-44 bg-white/[0.14] border border-white/[0.22] rounded-lg text-[10px] text-[#FFFFFF] flex items-center justify-center font-semibold">
                    Kinetic Reveal + 3D Camera
                  </div>
                  <div className="h-full flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg text-[10px] text-[#A7A298] flex items-center justify-center">
                    Call-To-Action Burst
                  </div>
                </div>
              </div>

              {/* Track 2: V2 - B-Roll, Overlays & Color LUT */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  currentTab.trackFocus === 'V2'
                    ? 'glass-showcase-inner border-[#E4583B]/55'
                    : 'bg-white/[0.02] border-white/[0.06] opacity-70'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2.5">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/[0.08] text-[#F4F0E8] font-medium text-[10px]">V2</span>
                    <span className="text-[#F4F0E8] font-medium">B-Roll Cutaways &amp; Color Grade LUT</span>
                  </div>
                  <span className="text-[11px] text-[#A7A298] hidden sm:inline">Arri Alexa LUT · Contrast Curve</span>
                </div>
                <div className="h-7 w-full bg-black/45 rounded-xl overflow-hidden flex items-center p-1 space-x-1.5">
                  <div className="h-full w-36 bg-white/[0.08] border border-white/[0.12] rounded-lg text-[10px] text-[#EAE5DC] flex items-center justify-center">
                    Macro Product B-Roll
                  </div>
                  <div className="h-full w-48 bg-white/[0.14] border border-white/[0.22] rounded-lg text-[10px] text-[#FFFFFF] flex items-center justify-center font-semibold">
                    Split Screen UI Parallax
                  </div>
                  <div className="h-full flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg text-[10px] text-[#A7A298] flex items-center justify-center">
                    Cinematic Glow Flare
                  </div>
                </div>
              </div>

              {/* Track 3: V1 - Primary Story Cut */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  currentTab.trackFocus === 'V1'
                    ? 'glass-showcase-inner border-[#E4583B]/65'
                    : 'bg-white/[0.02] border-white/[0.06] opacity-70'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2.5">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E4583B]/20 text-[#F07C63] font-medium text-[10px]">V1</span>
                    <span className="text-[#F4F0E8] font-medium">Main A-Roll · Pacing &amp; Dynamic Zoom Cut</span>
                  </div>
                  <span className="text-[11px] text-[#DDD1BE] hidden sm:inline">J-Cut / L-Cut Synchronized</span>
                </div>
                <div className="h-7 w-full bg-black/45 rounded-xl overflow-hidden flex items-center p-1 space-x-1.5">
                  <div className="h-full w-24 bg-[#E4583B]/25 border border-[#E4583B]/45 rounded-lg text-[10px] text-[#F4F0E8] flex items-center justify-center font-medium">
                    Hook (0–3s)
                  </div>
                  <div className="h-full w-32 bg-[#E4583B]/35 border border-[#E4583B]/65 rounded-lg text-[10px] text-[#FFFFFF] flex items-center justify-center font-semibold">
                    Problem Punch
                  </div>
                  <div className="h-full w-44 bg-[#E4583B]/25 border border-[#E4583B]/45 rounded-lg text-[10px] text-[#F4F0E8] flex items-center justify-center font-medium">
                    Solution Demo
                  </div>
                  <div className="h-full flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg text-[10px] text-[#A7A298] flex items-center justify-center">
                    Final Payoff &amp; CTA
                  </div>
                </div>
              </div>

              {/* Track 4: A1 - Sound Design, Foley & Waves */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  currentTab.trackFocus === 'A1'
                    ? 'glass-showcase-inner border-[#E4583B]/55'
                    : 'bg-white/[0.02] border-white/[0.06] opacity-70'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2.5">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/[0.08] text-[#F4F0E8] font-medium text-[10px]">A1</span>
                    <span className="text-[#F4F0E8] font-medium">Sound Design · Sub Bass · Risers · Whooshes</span>
                  </div>
                  <div className="flex items-center space-x-1 h-3.5">
                    <span className="w-1 bg-[#DDD1BE]/80 rounded-full animate-wave-1" />
                    <span className="w-1 bg-[#DDD1BE]/80 rounded-full animate-wave-2" />
                    <span className="w-1 bg-[#DDD1BE]/80 rounded-full animate-wave-3" />
                    <span className="w-1 bg-[#DDD1BE]/80 rounded-full animate-wave-4" />
                    <span className="w-1 bg-[#DDD1BE]/80 rounded-full animate-wave-5" />
                  </div>
                </div>
                <div className="h-7 w-full bg-black/45 rounded-xl overflow-hidden flex items-center p-1 space-x-1.5">
                  <div className="h-full w-20 bg-white/[0.08] border border-white/[0.12] rounded-lg text-[10px] text-[#EAE5DC] flex items-center justify-center">
                    Impact
                  </div>
                  <div className="h-full w-28 bg-white/[0.14] border border-white/[0.22] rounded-lg text-[10px] text-[#FFFFFF] flex items-center justify-center font-semibold">
                    Sub Drop + Riser
                  </div>
                  <div className="h-full w-32 bg-white/[0.08] border border-white/[0.12] rounded-lg text-[10px] text-[#EAE5DC] flex items-center justify-center">
                    Fast Whoosh Swish
                  </div>
                  <div className="h-full flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg text-[10px] text-[#A7A298] flex items-center justify-center">
                    Background Beat Sync (-18dB)
                  </div>
                </div>
              </div>

            </div>

            {/* Timeline Bottom Metric Bar */}
            <div className="px-6 py-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <span className="px-3 py-1 rounded-full glass-pill-ghost text-[11px] font-medium text-[#F4F0E8]">
                  {currentTab.badge}
                </span>
                <span className="text-xs text-[#A7A298]">
                  {currentTab.subtitle}
                </span>
              </div>
              <div className="text-xs font-medium text-[#F4F0E8] flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E4583B]" />
                <span>{currentTab.metric}</span>
              </div>
            </div>
          </div>
        </Reveal3D>

        {/* 4 Interactive Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`p-5 rounded-[22px] text-left rtl:text-right transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                  active
                    ? 'glass-showcase-card border-[#E4583B]/65 -translate-y-1'
                    : 'glass-showcase-card-muted hover:-translate-y-0.5'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-medium tabular-nums ${active ? 'text-[#E4583B]' : 'text-[#A7A298]'}`}>
                      {tab.number}
                    </span>
                    {active && <span className="w-2 h-2 rounded-full bg-[#E4583B]" />}
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-[#F4F0E8] mb-2 leading-snug">
                    {tab.title}
                  </h3>
                </div>
                <span className="text-[11px] text-[#A7A298] mt-2 block">
                  Focus: <strong className="text-[#F4F0E8] font-medium">{tab.trackFocus}</strong>
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
