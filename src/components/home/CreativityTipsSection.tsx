import React, { useState } from 'react';
import {
  Zap,
  Scissors,
  Volume2,
  SlidersHorizontal,
  Type,
  FolderKanban,
  ArrowUpRight,
  ChevronDown,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useNavigation } from '../../context/NavigationContext';
import { Reveal3D } from '../common/Reveal3D';

export const CreativityTipsSection: React.FC = () => {
  const { language } = usePortfolio();
  const { navigateTo } = useNavigation();
  const [expandedGuide, setExpandedGuide] = useState<'hook' | 'ai' | null>('hook');

  const blueprints = [
    {
      id: 'hook' as const,
      badge: language === 'bn' ? 'প্রোডাকশন ব্লুপ্রিন্ট ০১' : 'BLUEPRINT 01',
      title:
        language === 'bn'
          ? '৩-সেকেন্ড হুক ও রাইদমিক পেসিং ফ্রেমওয়ার্ক'
          : 'The 3-Second Hook & Pacing Framework',
      summary:
        language === 'bn'
          ? 'দর্শকের মনোযোগ ধরে রাখতে প্রথম ৩ সেকেন্ডে ভিজ্যুয়াল মুভমেন্ট, J-Cut অডিও লিড এবং সঠিক শট পরিবর্তন যেভাবে সাজাতে হয়।'
          : 'How to pair opening frame kinetic cues, J-cut dialogue leads, and pattern interrupts to lift audience retention.',
      howToApply:
        language === 'bn'
          ? [
              'ধাপ ১: শুরুর ২.৫ সেকেন্ডের মধ্যেই মূল প্রশ্ন বা ভিজ্যুয়াল কন্ট্রাস্ট দেখান—লম্বা ইন্ট্রো বাদ দিন।',
              'ধাপ ২: পরবর্তী ক্লিপ আসার ৪–৬ ফ্রেম আগেই তার সাউন্ড/ডায়ালগ চালু (J-Cut) করুন।',
              'ধাপ ৩: প্রতি ৩–৫ সেকেন্ডে ক্যামেরা অ্যাঙ্গেল, B-Roll বা টেক্সট হাইলাইট পরিবর্তন করে একঘেয়েমি কাটান।'
            ]
          : [
              'Step 1: Open directly on conflict, result, or motion within the first 2.5 seconds — skip slow logos.',
              'Step 2: Lead the audio 4–6 frames before the visual cut (J-Cut) to create seamless flow.',
              'Step 3: Introduce a visual pattern shift (zoom punch-in, B-roll, or typography pop) every 3–5 seconds.'
            ],
      accentColor: '#E4583B',
      visualType: 'timeline'
    },
    {
      id: 'ai' as const,
      badge: language === 'bn' ? 'প্রোডাকশন ব্লুপ্রিন্ট ০২' : 'BLUEPRINT 02',
      title:
        language === 'bn'
          ? 'AI-সহায়ক এডিটিং ও ক্লিন ফোল্ডার ওয়ার্কফ্লো'
          : 'AI-Assisted Workflow & Clean Asset Architecture',
      summary:
        language === 'bn'
          ? 'Premiere Pro, After Effects ও Generative AI টুলসকে একসাথে ব্যবহার করে অর্ধেক সময়ে স্টুডিও-গ্রেড আউটপুট পাওয়ার প্র্যাকটিক্যাল পদ্ধতি।'
          : 'Combining Premiere Pro, After Effects, Generative AI scripting/cleanup, and IT-grade folder trees for rapid delivery.',
      howToApply:
        language === 'bn'
          ? [
              'ধাপ ১: র ফুটেজ, অডিও, SFX, ফন্ট এবং প্রজেক্ট ফাইলকে 01_Footage, 02_Audio, 03_Design ফোল্ডারে আলাদা করুন।',
              'ধাপ ২: নয়েজ ক্লিনআপ, রাফ-কাট ট্রান্সক্রিপ্ট এবং ক্যাপশন জেনারেশনে AI টুলস ব্যবহার করে সময় বাঁচান।',
              'ধাপ ৩: কালার-কোডেড টাইমলাইন ট্র্যাক (A-Roll, B-Roll, Motion, SFX) দিয়ে ফাইনাল মাস্টার এক্সপোর্ট দিন।'
            ]
          : [
              'Step 1: Structure every project into standardized numbered bins (01_Footage, 02_Audio, 03_Motion, 04_Exports).',
              'Step 2: Offload silence removal, voice isolation, and subtitle drafting to verified AI utilities.',
              'Step 3: Color-code timeline tracks (A-roll, B-roll, SFX, Graphics) for zero-friction revisions.'
            ],
      accentColor: '#38BDF8',
      visualType: 'ai'
    }
  ];

  const creativityTips = [
    {
      id: 'tip-1',
      icon: Zap,
      title: language === 'bn' ? 'হুক ইঞ্জিনিয়ারিং ও ক্যাপশন' : 'Hook Engineering & Kinetic Subtitles',
      desc:
        language === 'bn'
          ? 'ভিডিওর শুরুতেই স্ক্রল-স্টপিং ভিজ্যুয়াল ক্যাপশন ও কনট্রাস্ট টেক্সট দিয়ে দর্শকের নজর আটকানো।'
          : 'Keep viewers watching past second 3 using crisp kinetic callouts synced cleanly to vocal emphasis.',
      usage:
        language === 'bn'
          ? 'ব্যবহার: প্রথম লাইনে ২-৩ শব্দের বড় কন্ট্রাস্ট কীওয়ার্ড + পপ SFX দিন।'
          : 'Apply: Emphasize 2–3 power words per phrase with a clean ease-out scale curve.'
    },
    {
      id: 'tip-2',
      icon: Scissors,
      title: language === 'bn' ? 'রাইদমিক কাটিং ও J/L-Cut' : 'Rhythmic Cutting & J/L-Cuts',
      desc:
        language === 'bn'
          ? 'অ্যাকশনের মাঝপথে এবং বিট/বাক্যের ছন্দে কাট দিলে এডিটিং চোখে ন্যাচারাল ও স্মুথ লাগে।'
          : 'Cut on physical motion and vocal cadence rather than static pauses so stories flow effortlessly.',
      usage:
        language === 'bn'
          ? 'ব্যবহার: ডেড-এয়ার কেটে ৪ ফ্রেম অডিও ওভারল্যাপ রাখুন।'
          : 'Apply: Trim silent breath gaps tightly and overlap ambient/voice audio across cuts.'
    },
    {
      id: 'tip-3',
      icon: Volume2,
      title: language === 'bn' ? 'লেয়ার্ড সাউন্ড ডিজাইন (SFX)' : 'Layered Sound Design & Foley',
      desc:
        language === 'bn'
          ? 'শুধু ব্যাকগ্রাউন্ড মিউজিক নয়—হুইশ, রাইজার এবং অ্যাম্বিয়েন্স লেয়ার দর্শকের আবেগ বাড়িয়ে তোলে।'
          : 'Pair clean vocal EQ with subtle whooshes, room tone, and risers to add physical weight to cuts.',
      usage:
        language === 'bn'
          ? 'ব্যবহার: ভয়েস -6dB থেকে -12dB রেখে মিউজিক -22dB তে ডাকিং করুন।'
          : 'Apply: Keep dialogue locked at -6 to -12 dB and duck music subtly under speech.'
    },
    {
      id: 'tip-4',
      icon: SlidersHorizontal,
      title: language === 'bn' ? 'কালার মুড ও স্কিন টোন ব্যালেন্স' : 'Color Mood & Skin-Tone Balance',
      desc:
        language === 'bn'
          ? 'প্রথমে এক্সপোজার ও স্বাভাবিক স্কিন টোন ঠিক করে তারপর ব্র্যান্ড অনুযায়ী সিনেমাটিক কালার টোন দিন।'
          : 'Correct exposure and natural skin tones first, then introduce controlled highlight/shadow color grading.',
      usage:
        language === 'bn'
          ? 'ব্যবহার: Lumetri Vectorscope দিয়ে স্কিন-টোন লাইন যাচাই করে LUT কম মাত্রায় দিন।'
          : 'Apply: Verify skin tones on the Vectorscope before dialing subtle contrast & grade.'
    },
    {
      id: 'tip-5',
      icon: Type,
      title: language === 'bn' ? 'ভিজ্যুয়াল হায়ারার্কি ও পোস্টার ব্যালেন্স' : 'Visual Hierarchy & Contrast Focus',
      desc:
        language === 'bn'
          ? 'গ্রাফিক পোস্টার বা থাম্বনেইলে অযথা এলিমেন্ট না বাড়িয়ে মূল সাবজেক্ট ও শিরোনামে ৭০% ফোকাস রাখুন।'
          : 'Design thumbnails and brand posters around one unmistakable focal subject and high-contrast type.',
      usage:
        language === 'bn'
          ? 'ব্যবহার: ৩টি ফন্টের বেশি নয় এবং প্রচুর হোয়াইট-স্পেস/নেগেটিভ স্পেস ব্যবহার করুন।'
          : 'Apply: Stick to max 2 type families and leave generous breathing space around focal text.'
    },
    {
      id: 'tip-6',
      icon: FolderKanban,
      title: language === 'bn' ? 'প্রক্সি ও IT গ্রেড অ্যাসেট অর্গানাইজেশন' : 'Proxy Workflow & IT Asset Hygiene',
      desc:
        language === 'bn'
          ? '4K ফুটেজে স্মুথ প্লেব্যাকের জন্য Proxy ব্যবহার এবং প্রতিটি প্রজেক্টে সুশৃঙ্খল ফাইল স্ট্রাকচার।'
          : 'Use low-bitrate ProRes/DNx proxies for lag-free timeline scrubbing and backup-ready project hygiene.',
      usage:
        language === 'bn'
          ? 'ব্যবহার: বড় ফুটেজ ইনজেস্টেই Auto-Proxy অন রাখুন ও ভার্সন-কন্ট্রোলড ফাইল নাম দিন।'
          : 'Apply: Generate ingest proxies for 4K footage and version exports clearly (v01, v02_final).'
    }
  ];

  return (
    <div className="space-y-0">
      {/* 1. 2-COLUMN WORKFLOW BLUEPRINT CARDS (No Courses — Actionable Creative Guides) */}
      <section className="py-16 sm:py-20 bg-[#121419]/85 border-t border-white/[0.07]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal3D direction="up" className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#E4583B] block mb-2">
              {language === 'bn' ? 'ওয়ার্কফ্লো ও সিস্টেম' : 'CREATIVE WORKFLOW'}
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#F4F0E8] tracking-tight">
              {language === 'bn'
                ? 'কাজের মূল কৌশল ও ব্যবহারের নিয়ম'
                : 'How Every Project Is Engineered'}
            </h2>
            <p className="text-xs sm:text-sm text-[#9A958C] mt-2.5">
              {language === 'bn'
                ? 'রেডিমেড টেমপ্লেট নয়—প্রতিটি ভিডিও ও ডিজাইনে বাস্তবসম্মত স্টোরিটেলিং ও পরিচ্ছন্ন IT অর্গানাইজেশন।'
                : 'Real production discipline blending retention psychology, AI speed, and organized timelines.'}
            </p>
          </Reveal3D>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blueprints.map((bp, idx) => {
              const isOpen = expandedGuide === bp.id;
              return (
                <Reveal3D key={bp.id} direction={idx === 0 ? 'left' : 'right'} delay={idx * 80}>
                  <article className="h-full rounded-[24px] editorial-card-surface overflow-hidden flex flex-col justify-between">
                    {/* Custom Crisp Vector Diagram Header */}
                    <div className="relative h-48 sm:h-52 bg-[#0D0F14] overflow-hidden p-6 flex flex-col justify-between border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[10px] font-mono uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-white/10 text-white"
                        >
                          {bp.badge}
                        </span>
                        <Sparkles className="w-4 h-4 text-[#E4583B]" />
                      </div>

                      {bp.visualType === 'timeline' ? (
                        <div className="space-y-2.5 my-auto" aria-hidden="true">
                          <div className="flex items-center gap-2">
                            <span className="w-16 h-5 rounded bg-[#E4583B]/80 text-[9px] font-mono text-white flex items-center justify-center">
                              HOOK 3s
                            </span>
                            <span className="flex-1 h-5 rounded bg-sky-500/35 border border-sky-400/40" />
                            <span className="w-24 h-5 rounded bg-emerald-500/35 border border-emerald-400/40" />
                          </div>
                          <div className="flex items-center gap-2 pl-6">
                            <span className="w-20 h-4 rounded bg-amber-400/40 border border-amber-300/40 text-[9px] font-mono text-amber-100 flex items-center justify-center">
                              J-CUT
                            </span>
                            <span className="flex-1 h-4 rounded bg-white/15" />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2.5 my-auto" aria-hidden="true">
                          <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-center">
                            <div className="text-[10px] font-mono text-sky-300">01_RAW</div>
                            <div className="text-[9px] text-white/60 mt-0.5">Proxies Ready</div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/[0.08] border border-[#E4583B]/45 text-center">
                            <div className="text-[10px] font-mono text-[#F07C63]">02_AI</div>
                            <div className="text-[9px] text-white/60 mt-0.5">Clean & Sync</div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-center">
                            <div className="text-[10px] font-mono text-emerald-300">03_OUT</div>
                            <div className="text-[9px] text-white/60 mt-0.5">4K Master</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                      <div>
                        <h3 className="font-display text-lg sm:text-xl font-bold text-[#F4F0E8] mb-2">
                          {bp.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#9A958C] leading-relaxed">
                          {bp.summary}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={() => setExpandedGuide(isOpen ? null : bp.id)}
                          aria-expanded={isOpen}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill-ghost text-xs font-semibold cursor-pointer"
                        >
                          <span>
                            {language === 'bn' ? 'কিভাবে ব্যবহার করবেন' : 'How to Apply'}
                          </span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              isOpen ? 'rotate-180 text-[#E4583B]' : ''
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="p-4 rounded-2xl editorial-sand-band border space-y-2">
                            {bp.howToApply.map((step, sIdx) => (
                              <div
                                key={sIdx}
                                className="flex items-start gap-2 text-xs text-[#DDD1BE] leading-relaxed"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#E4583B] shrink-0 mt-0.5" />
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                </Reveal3D>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. 6-CARD VIDEO EDITING & CREATIVITY TIPS GRID (Warm Sand Section matching Screenshot) */}
      <section className="py-16 sm:py-24 editorial-sand-band border-t">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Intro Column */}
            <Reveal3D direction="left" className="lg:col-span-4 space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#E4583B] block">
                {language === 'bn' ? 'ক্রিয়েটিভিটি ও এডিটিং টিপস' : 'CREATIVITY PLAYBOOK'}
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#F4F0E8] tracking-tight leading-[1.12]">
                {language === 'bn'
                  ? 'উন্নত ভিডিও এডিটিং ও ডিজাইনে যা যা জরুরি, সব এখানে'
                  : 'Core Editing Principles & How to Apply Them'}
              </h2>
              <p className="text-xs sm:text-sm text-[#9A958C] leading-relaxed">
                {language === 'bn'
                  ? 'প্রতিটি প্রজেক্টকে সাধারণ থেকে অসাধারণ করতে যে ৬টি ক্রিয়েটিভ কৌশল ও টেকনিক্যাল নিয়ম আমি নিয়মিত অনুসরণ করি।'
                  : 'Practical craft principles behind sharp storytelling, cleaner visuals, and dependable IT-backed delivery.'}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigateTo('skills')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-pill-cta text-xs font-semibold cursor-pointer"
                >
                  <span>
                    {language === 'bn' ? 'সব স্কিল ও টুলস দেখুন' : 'Explore Tools & Skills'}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Reveal3D>

            {/* Right 2x3 Grid of White Cards */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {creativityTips.map((tip, idx) => {
                const Icon = tip.icon;
                return (
                  <Reveal3D key={tip.id} direction="up" delay={(idx % 3) * 70}>
                    <div className="h-full p-5 sm:p-6 rounded-[22px] editorial-card-surface flex flex-col justify-between space-y-3 hover:-translate-y-0.5 transition-transform duration-200">
                      <div className="space-y-2.5">
                        <span className="w-9 h-9 rounded-full editorial-sand-band border flex items-center justify-center text-[#E4583B]">
                          <Icon className="w-4 h-4" strokeWidth={1.75} />
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-[#F4F0E8]">
                          {tip.title}
                        </h3>
                        <p className="text-xs text-[#9A958C] leading-relaxed">{tip.desc}</p>
                      </div>
                      <div className="pt-2.5 border-t border-white/[0.08] text-[11px] font-medium text-[#E4583B]">
                        {tip.usage}
                      </div>
                    </div>
                  </Reveal3D>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
