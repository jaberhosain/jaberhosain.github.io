import React, { useMemo, useState } from 'react';
import {
  Play,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Star,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Layers,
  Building2,
  MessageSquare
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useNavigation } from '../../context/NavigationContext';
import { VideoShowcaseItem } from '../../types/portfolio';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { normalizeDirectImageUrl } from '../../lib/imageUrlResolver';
import { resolveVideoSection } from '../../lib/videoOrganization';
import { EditableElement } from '../common/EditableElement';
import { Reveal3D } from '../common/Reveal3D';
import { RevealContactPill } from '../common/RevealContactPill';
import {
  AsSunnahFoundationLogo,
  AsSunnahSkillInstituteLogo,
  TamirulMillatLogo
} from '../common/OrganizationLogos';

interface ReelsAndTrustSectionsProps {
  onOpenVideo?: (video: VideoShowcaseItem) => void;
}

export const ReelsAndTrustSections: React.FC<ReelsAndTrustSectionsProps> = ({
  onOpenVideo
}) => {
  const { portfolio, loc, language } = usePortfolio();
  const { navigateTo, focusMode } = useNavigation();

  const [reelOffset, setReelOffset] = useState(0);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // ---------------- 1. SLIDING 9:16 REELS CAROUSEL ----------------
  const reelVideos = useMemo(() => {
    const all = [...(portfolio.videos || [])]
      .filter((v: any) => v.visible !== false && !v.hidden)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const strictlyReels = all.filter(
      (v: any) => resolveVideoSection(v, loc(v.title), loc(v.description)) === 'reels'
    );
    return strictlyReels.length > 0 ? strictlyReels : all;
  }, [portfolio.videos, loc]);

  const visibleTestimonials = [...(portfolio.testimonials || [])]
    .filter((t) => t.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const reelsPageSize = 4;
  const maxReelStart = Math.max(0, reelVideos.length - reelsPageSize);
  const clampedReelOffset = Math.min(reelOffset, maxReelStart);

  // ---------------- 2. IT, COMPUTER OPERATOR & VIDEO VIVA FAQ ----------------
  const vivaAndClientFaq =
    language === 'bn'
      ? [
          {
            q: 'আইটি ও কম্পিউটার অপারেটর হিসেবে কী কী প্র্যাকটিক্যাল দক্ষতা রয়েছে?',
            a: 'Windows, macOS ও Linux অপারেটিং সিস্টেমে দক্ষ কাজ, MS Word ও Google Docs-এ প্রফেশনাল ডকুমেন্টেশন, Excel ও Google Sheets-এ হিসাব ও ডেটা এন্ট্রি, বাংলা-ইংরেজি দ্রুত টাইপিং, ফাইল ম্যানেজমেন্ট ও হার্ডওয়্যার/সফটওয়্যার বেসিক ট্রাবলশুটিং।'
          },
          {
            q: 'ভিডিও এডিটিং ও গ্রাফিক ডিজাইনের প্রজেক্টের ফাইল কীভাবে সাজানো হয় (Viva Technical Workflow)?',
            a: 'প্রতিটি প্রজেক্ট শুরুতে 01_Raw_Footage, 02_Audio_SFX, 03_Graphics_Assets এবং 04_Project_Files ফোল্ডারে সাজানো হয়। 4K ফুটেজে Proxy ব্যবহার করে Premiere Pro ও After Effects-এর Dynamic Link দিয়ে স্মুথ রেন্ডার ও সময়মতো ডেলিভারি নিশ্চিত করা হয়।'
          },
          {
            q: 'আপনার সাথে নতুন ভিডিও বা ডিজাইন প্রজেক্ট কীভাবে শুরু করবো?',
            a: 'নিচের বাটনে ক্লিক করে আমার ইমেইল বা হোয়াটসঅ্যাপ আনলক করে প্রজেক্টের বিস্তারিত ও রেফারেন্স শেয়ার করুন। Google Drive লিংকের মাধ্যমে র ফুটেজ পাঠালে আমি সাথে সাথে এডিটিং শুরু করি।'
          },
          {
            q: 'কাজে AI টুলস এবং সোশ্যাল মিডিয়া মার্কেটিং কীভাবে যুক্ত করেন?',
            a: 'অডিও ক্লিনআপ, স্ক্রিপ্টিং আইডিয়া, সাবটাইটেল ড্রাফটিং ও দ্রুত অ্যাসেট ভ্যারিয়েশনে AI টুলস ব্যবহার করা হয়; পাশাপাশি Meta Marketing-এর জন্য হাই-CTR থাম্বনেইল, রিলস হুক ও অ্যাড ক্রিয়েটিভ তৈরি করা হয়।'
          },
          {
            q: 'একটি ভিডিও বা ডিজাইন ডেলিভারি পেতে কতদিন লাগে এবং রিভিশন পাওয়া যাবে কি?',
            a: 'শর্ট রিলস বা সোশ্যাল পোস্টার সাধারণত ২৪–৪৮ ঘণ্টার মধ্যে এবং লং ইউটিউব ভিডিও বা ব্র্যান্ড প্রজেক্ট ৩–৫ দিনের মধ্যে ডেলিভারি হয়। প্রতি প্রজেক্টে রিভিশন সুবিধা অন্তর্ভুক্ত থাকে।'
          },
          {
            q: 'মাসিক কন্ট্রাক্ট বা অফিসে ফুল-টাইম / রিমোট রোল হিসেবে কি পাওয়া যাবে?',
            a: 'হ্যাঁ, এজেন্সি, ইউটিউব চ্যানেল বা প্রতিষ্ঠানে Video Editor, Graphic Designer অথবা IT/Computer Operator হিসেবে ফুল-টাইম, রিমোট বা মাসিক রিটেইনার ভিত্তিতে কাজ করতে প্রস্তুত।'
          }
        ]
      : [
          {
            q: 'What Computer Operator, Office & IT skills do you bring alongside design?',
            a: 'Hands-on proficiency across Windows, macOS, and Linux, clean file/backup architecture, MS Word & Google Docs formatting, MS Excel & Google Sheets accounting/data tracking, fast bilingual typing, and hardware/software setup.'
          },
          {
            q: 'How is a Premiere Pro & After Effects project organized technically (Viva Standard)?',
            a: 'Every job uses numbered project bins (01_Footage, 02_Audio_SFX, 03_Design, 04_Exports), automatic ingest proxies for smooth scrubbing, Dynamic Link for motion typography, and clean 4K/1080p master exports.'
          },
          {
            q: 'How do we start a project and transfer raw footage safely?',
            a: 'Click the Email or WhatsApp reveal capsules below to share your brief. Upload raw footage to Google Drive or Mega, and I handle timeline sorting, cutting, grading, and delivery.'
          },
          {
            q: 'How do you combine AI tools & Social Media knowledge with traditional craft?',
            a: 'AI accelerates noise cleanup, rough captioning, and ideation—while human taste drives pacing, typography, and Meta ad visual hooks built for real engagement.'
          },
          {
            q: 'What are typical turnaround times and revision policies?',
            a: 'Short-form Reels and campaign graphics deliver in 24–48 hours; long-form YouTube or documentary projects deliver in 3–5 business days with structured revision rounds included.'
          },
          {
            q: 'Are you available for full-time roles or ongoing monthly creative retainers?',
            a: 'Yes—open to creative agency, e-commerce, educational institute, and corporate teams as a Video Editor, Graphic Designer, or Computer/IT Operations specialist.'
          }
        ];

  const youtubeUrl =
    portfolio.contact?.youtubeUrl ||
    portfolio.channelLinks?.find((c) => c.id === 'ch-youtube')?.url;
  const behanceUrl =
    portfolio.contact?.behanceUrl ||
    portfolio.channelLinks?.find((c) => c.id === 'ch-behance')?.url;

  return (
    <div className="space-y-0">
      {/* 1. SLIDING 9:16 REELS CAROUSEL (Matches Screenshot Vertical Portrait Row) */}
      {focusMode !== 'graphic' && reelVideos.length > 0 && (
        <section className="py-16 sm:py-20 bg-[#121419]/85 border-t border-white/[0.07]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <Reveal3D direction="left">
                <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#E4583B] block mb-1.5">
                  {language === 'bn' ? 'শর্ট রিলস স্লাইডার' : 'VERTICAL REELS'}
                </span>
                <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#F4F0E8] tracking-tight">
                  {language === 'bn' ? 'রিলস ও শর্ট ভিডিও শোকেস' : 'Scroll-Stopping Short Reels'}
                </h2>
                <p className="text-xs sm:text-sm text-[#9A958C] mt-1.5">
                  {language === 'bn'
                    ? '৯:১৬ ভার্টিকাল ফ্রেমে ডায়নামিক রিলস ও সোশ্যাল ভিডিও প্রিভিউ'
                    : 'Vertical 9:16 stories engineered for Reels, Shorts & high-retention feeds.'}
                </p>
              </Reveal3D>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {reelVideos.length > 1 && (
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setReelOffset((p) => Math.max(0, p - 1))}
                      disabled={clampedReelOffset === 0}
                      aria-label="Previous reels"
                      className="w-10 h-10 rounded-full editorial-card-surface flex items-center justify-center text-[#F4F0E8] disabled:opacity-40 hover:border-[#E4583B] active:scale-95 transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setReelOffset((p) => (p >= maxReelStart ? 0 : p + 1))
                      }
                      aria-label="Next reels"
                      className="w-10 h-10 rounded-full editorial-card-surface flex items-center justify-center text-[#F4F0E8] hover:border-[#E4583B] active:scale-95 transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => navigateTo('videos')}
                  className="inline-flex items-center gap-1.5 px-4 min-h-[40px] py-2 rounded-full glass-pill-ghost text-xs font-semibold active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>{language === 'bn' ? 'সব রিলস' : 'View All'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {reelVideos
                .slice(clampedReelOffset, clampedReelOffset + reelsPageSize)
                .map((vid, idx) => (
                  <div
                    key={vid.id || idx}
                    data-cursor="play"
                    onClick={() => onOpenVideo?.(vid)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onOpenVideo?.(vid);
                      }
                    }}
                    className="animate-frame-slide group relative aspect-[9/16] rounded-[18px] sm:rounded-[24px] overflow-hidden bg-[#0E1015] border border-black/10 dark:border-white/10 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.3)] active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    <img
                      src={resolveAssetUrl(
                        normalizeDirectImageUrl(vid.customThumbnailUrl || vid.thumbnailUrl) ||
                          '/assets/jaber_hero.png'
                      )}
                      alt={loc(vid.title)}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="w-12 h-12 rounded-full bg-white/95 group-hover:bg-[#E4583B] text-[#14161A] group-hover:text-white flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-110">
                        <Play className="w-4 h-4 fill-current translate-x-0.5" />
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="inline-block text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-black/55 border border-white/15 mb-1">
                        9:16 REEL
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                        {loc(vid.title)}
                      </h3>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. 5-STAR CLIENT REVIEWS GRID (Matches Screenshot "শিক্ষার্থীরা যা বলছেন" adapted cleanly to Client Reviews) */}
      {portfolio.testimonialsSection?.visible !== false && visibleTestimonials.length > 0 && (
        <section
          id="trust-testimonials"
          className="py-16 sm:py-20 bg-[#121419]/80 border-t border-white/[0.07]"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <Reveal3D direction="left">
                <EditableElement
                  id="testimonials.tag"
                  label="Testimonials Tag"
                  as="span"
                  className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#E4583B] block mb-1.5"
                >
                  {loc(portfolio.testimonialsSection?.tag) ||
                    (language === 'bn' ? 'ক্লায়েন্ট রিভিউ' : 'CLIENT TESTIMONIALS')}
                </EditableElement>
                <EditableElement
                  id="testimonials.title"
                  label="Testimonials Heading"
                  as="h2"
                  className="font-display text-2xl sm:text-4xl font-bold text-[#F4F0E8] tracking-tight"
                >
                  {loc(portfolio.testimonialsSection?.title) ||
                    (language === 'bn'
                      ? 'ক্লায়েন্ট ও ক্রিয়েটররা যা বলছেন'
                      : 'Trusted by Creators & Brands')}
                </EditableElement>
              </Reveal3D>

              <div className="inline-flex items-center gap-2.5 self-start sm:self-auto px-4 py-2 rounded-full editorial-card-surface">
                <span className="font-display text-lg font-extrabold text-[#F4F0E8] tabular-nums">
                  5.0
                </span>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] text-[#9A958C]">
                  {language === 'bn' ? 'যাচাইকৃত মতামত' : 'Verified Reviews'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {visibleTestimonials.map((item, idx) => {
                const stars = Math.max(1, Math.min(5, item.rating || 5));
                return (
                  <Reveal3D key={item.id} direction="up" delay={idx * 75}>
                    <div className="h-full p-6 rounded-[22px] editorial-card-surface flex flex-col justify-between space-y-5">
                      <div className="space-y-3.5">
                        <div className="flex items-center gap-1" aria-label={`${stars} out of 5 stars`}>
                          {Array.from({ length: stars }).map((_, sIdx) => (
                            <Star
                              key={sIdx}
                              className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                        <EditableElement
                          id={`testimonial.${item.id}.quote`}
                          label={`Quote by ${item.clientName}`}
                          as="p"
                          className="text-xs sm:text-sm text-[#DDD1BE] leading-relaxed"
                        >
                          “{loc(item.quote)}”
                        </EditableElement>
                      </div>

                      <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-2">
                        <div>
                          <EditableElement
                            id={`testimonial.${item.id}.name`}
                            label={`Client Name: ${item.clientName}`}
                            as="div"
                            className="text-sm font-bold text-[#F4F0E8]"
                          >
                            {item.clientName}
                          </EditableElement>
                          <EditableElement
                            id={`testimonial.${item.id}.role`}
                            label="Client Role"
                            as="div"
                            className="text-xs text-[#9A958C]"
                          >
                            {loc(item.clientRole)}
                          </EditableElement>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      </div>
                    </div>
                  </Reveal3D>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 3. IT, COMPUTER & VIDEO EDITING VIVA + CLIENT FAQ (Exact 2-Column Layout from Screenshot) */}
      <section className="py-16 sm:py-24 bg-[#121419]/85 border-t border-white/[0.07]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <Reveal3D direction="left" className="lg:col-span-5 space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#E4583B] block">
                {language === 'bn' ? 'আইটি, কম্পিউটার ও প্রজেক্ট জিজ্ঞাসা' : 'TECHNICAL & CLIENT FAQ'}
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#F4F0E8] tracking-tight">
                {language === 'bn' ? 'সচরাচর জিজ্ঞাসিত প্রশ্ন' : 'Frequently Asked Questions'}
              </h2>
              <p className="text-xs sm:text-sm text-[#9A958C] leading-relaxed">
                {language === 'bn'
                  ? 'ভিডিও এডিটিং, গ্রাফিক ডিজাইন, AI ওয়ার্কফ্লো এবং কম্পিউটার অপারেটর/IT ভাইভা ও কাজের মান সম্পর্কে বিস্তারিত উত্তর।'
                  : 'Answers covering production turnaround, technical IT & Computer Operations capabilities, and creative collaboration.'}
              </p>

              <div className="pt-2 flex flex-wrap gap-2.5">
                <a
                  href="#contact-cta"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('contact-cta')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-pill-cta text-xs font-semibold cursor-pointer"
                >
                  <span>{language === 'bn' ? 'সরাসরি যোগাযোগ' : 'Contact Directly'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => navigateTo('about')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-pill-ghost text-xs font-semibold cursor-pointer"
                >
                  <span>{language === 'bn' ? 'সিভি ও যোগ্যতা' : 'Full CV & Education'}</span>
                </button>
              </div>
            </Reveal3D>

            <div className="lg:col-span-7 space-y-3">
              {vivaAndClientFaq.map((item, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl editorial-card-surface overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full px-5 sm:px-6 py-4 text-left rtl:text-right flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <span className="text-xs sm:text-[15px] font-semibold text-[#F4F0E8]">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#9A958C] shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-[#E4583B]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-4 text-xs sm:text-sm text-[#9A958C] leading-relaxed border-t border-white/[0.08] pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. WARM SAND EDITORIAL BANNER + BRAND VIDEO HIRING SPLIT (No Courses) */}
      <section className="py-14 sm:py-20 bg-[#121419]/80 border-t border-white/[0.07]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Warm Sand Conversion Card */}
          <Reveal3D direction="up">
            <div className="editorial-sand-band border rounded-[26px] sm:rounded-[32px] p-8 sm:p-12 text-center space-y-5">
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#F4F0E8] tracking-tight">
                {language === 'bn'
                  ? 'আপনার ক্রিয়েটিভ প্রজেক্ট আজই শুরু করুন'
                  : 'Start Your Next Creative Project Today'}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#9A958C]">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{language === 'bn' ? 'সিনেমাটিক ও কাস্টম কাজ' : 'Zero Generic Templates'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{language === 'bn' ? 'সময়মতো ডেলিভারি ও রিভিশন' : 'On-Time Delivery & Revisions'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{language === 'bn' ? 'AI ও IT অর্গানাইজড ওয়ার্কফ্লো' : 'AI & IT Organized Pipeline'}</span>
                </span>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="#contact-cta"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('contact-cta')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 px-6 min-h-[44px] py-3 rounded-full glass-pill-cta text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span>{language === 'bn' ? 'হায়ার করুন' : 'Hire for a Project'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => navigateTo('videos')}
                    className="inline-flex items-center gap-2 px-6 min-h-[44px] py-3 rounded-full glass-pill-ghost text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span>{language === 'bn' ? 'সব কাজ দেখুন' : 'Browse Portfolio'}</span>
                  </button>
              </div>
            </div>
          </Reveal3D>

          {/* Split "আপনার ব্র্যান্ডের জন্য ভিডিও বা ডিজাইন দরকার?" Section matching Screenshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <Reveal3D direction="left" className="lg:col-span-6 space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#E4583B] block">
                {language === 'bn' ? 'এজেন্সি মানের ডেলিভারি' : 'DEDICATED PRODUCTION'}
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#F4F0E8] tracking-tight leading-[1.12]">
                {language === 'bn'
                  ? 'আপনার ব্র্যান্ডের জন্য মানসম্মত ভিডিও ও ডিজাইন দরকার?'
                  : 'Need High-Retention Video & Design for Your Brand?'}
              </h2>
              <p className="text-xs sm:text-sm text-[#9A958C] leading-relaxed">
                {language === 'bn'
                  ? 'ইউটিউব চ্যানেল, ফেসবুক/মেটা অ্যাডস, কর্পোরেট প্রেজেন্টেশন কিংবা সোশ্যাল মিডিয়া ব্র্যান্ডিং—সব কিছুর জন্য নির্ভরযোগ্য ক্রিয়েটিভ সাপোর্ট।'
                  : 'Reliable creative execution for creators, e-commerce brands, institutions, and marketing teams.'}
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href="#contact-cta"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('contact-cta')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-pill-cta text-xs font-semibold cursor-pointer"
                >
                  <span>{language === 'bn' ? 'আলোচনা শুরু করুন' : 'Discuss Brief'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => navigateTo('skills')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-pill-ghost text-xs font-semibold cursor-pointer"
                >
                  <span>{language === 'bn' ? 'সার্ভিস বিস্তারিত' : 'Capabilities'}</span>
                </button>
              </div>
            </Reveal3D>

            <div className="lg:col-span-6 space-y-3.5">
              {[
                {
                  icon: ShieldCheck,
                  title: language === 'bn' ? 'সময় ও বাজেট সাশ্রয়ী সমাধান' : 'Efficient, Zero-Overhead Delivery',
                  desc:
                    language === 'bn'
                      ? 'এজেন্সির বড় খরচ ছাড়াই সরাসরি এক্সপার্টের হাতে প্রিমিয়াম ভিডিও ও ডিজাইন আউটপুট।'
                      : 'Agency-grade production rigor directly with the creator—fast communication and clear milestones.'
                },
                {
                  icon: Layers,
                  title: language === 'bn' ? 'ব্র্যান্ড কনসিস্টেন্সি ও AI স্পিড' : 'Brand Consistency + AI Speed',
                  desc:
                    language === 'bn'
                      ? 'প্রতিটি রিলস, থাম্বনেইল ও পোস্টারে ব্র্যান্ডের নিজস্ব ফন্ট, কালার ও ভিজ্যুয়াল গাইডলাইন বজায় রাখা হয়।'
                      : 'Unified typography, color palette, and motion identity maintained seamlessly across campaigns.'
                },
                {
                  icon: Clock,
                  title: language === 'bn' ? 'ডেডলাইন ও কোয়ালিটি গ্যারান্টি' : 'Strict Deadline & Quality Control',
                  desc:
                    language === 'bn'
                      ? 'IT-গ্রেড অ্যাসেট ম্যানেজমেন্ট ও নির্ধারিত সময়ে সম্পূর্ণ যাচাইকৃত ফাইনাল ফাইল ডেলিভারি।'
                      : 'Organized folder backups, verified exports across aspect ratios, and dependable turnaround.'
                }
              ].map((feat, fIdx) => {
                const FIcon = feat.icon;
                return (
                  <Reveal3D key={fIdx} direction="right" delay={fIdx * 75}>
                    <div className="p-5 rounded-2xl editorial-card-surface flex items-start gap-4">
                      <span className="w-10 h-10 rounded-xl editorial-sand-band border flex items-center justify-center text-[#E4583B] shrink-0">
                        <FIcon className="w-4 h-4" strokeWidth={1.75} />
                      </span>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-[#F4F0E8] mb-1">
                          {feat.title}
                        </h3>
                        <p className="text-xs text-[#9A958C] leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  </Reveal3D>
                );
              })}
            </div>
          </div>

          {/* 5. AFFILIATED ORGANIZATIONS & TRAINING TRUST CARD (As-Sunnah Foundation & As-Sunnah Skill Dev. Institute) */}
          <Reveal3D direction="up">
            <div className="p-6 sm:p-8 rounded-[24px] editorial-card-surface space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-4">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#E4583B] block">
                    {language === 'bn' ? 'প্রশিক্ষণ ও প্রাতিষ্ঠানিক স্বীকৃতি' : 'TRAINING & AFFILIATED INSTITUTIONS'}
                  </span>
                  <h3 className="font-display text-lg sm:text-2xl font-bold text-[#F4F0E8] mt-1">
                    {language === 'bn'
                      ? 'প্রাতিষ্ঠানিক অভিজ্ঞতা ও স্কিল ফাউন্ডেশন'
                      : 'Institutes & Practical Foundations'}
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-[#9A958C]">
                  <Building2 className="w-3.5 h-3.5 text-[#E4583B]" />
                  <span>Dhaka & Gazipur, Bangladesh</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                <div className="p-5 rounded-2xl editorial-sand-band border flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                    <AsSunnahFoundationLogo variant="card" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#9A958C]">
                      01 · Foundation
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-bold text-[#F4F0E8] leading-snug">
                      {language === 'bn' ? 'আস-সুন্নাহ ফাউন্ডেশন' : 'As-Sunnah Foundation'}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-[#9A958C] mt-1.5 leading-relaxed">
                      {language === 'bn'
                        ? 'দক্ষতা উন্নয়ন ও নৈতিক কমিউনিটি উদ্যোগের মূল ফাউন্ডেশন (আফতাবনগর, ঢাকা)।'
                        : 'Skill development & community empowerment umbrella (Aftabnagar, Dhaka-1212).'}
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl editorial-sand-band border flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                    <AsSunnahSkillInstituteLogo variant="card" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#9A958C]">
                      02 · Institute
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-bold text-[#F4F0E8] leading-snug">
                      {language === 'bn'
                        ? 'আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট'
                        : 'As-Sunnah Skill Development Institute'}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-[#9A958C] mt-1.5 leading-relaxed">
                      {language === 'bn'
                        ? 'ভিডিও এডিটিং, গ্রাফিক ডিজাইন, মেটা মার্কেটিং ও AI টুলস প্র্যাকটিক্যাল ট্রেনিং (সাতারকুল, ঢাকা)।'
                        : 'Practical Training in Video Editing, Graphic Design, Meta Marketing & AI Tools (Satarkul, Dhaka).'}
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl editorial-sand-band border flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                    <TamirulMillatLogo className="w-14 h-14 shrink-0" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#9A958C]">
                      03 · Education
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-bold text-[#F4F0E8] leading-snug">
                      {language === 'bn'
                        ? "তা'মীরুল মিল্লাত কামিল মাদরাসা"
                        : "Ta'mirul Millat Kamil Madrasah"}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-[#9A958C] mt-1.5 leading-relaxed">
                      {language === 'bn'
                        ? 'আল মানার হোস্টেল অফিস ম্যানেজমেন্ট, ডেটা এন্ট্রি, হিসাব পরিচালনা ও আলিম শিক্ষা (টঙ্গী)।'
                        : 'Al Manar Hostel Office Management, Financial Accounts & Alim Education (Tongi, Gazipur).'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal3D>

          {/* 6. OBSIDIAN BRAND CONVERSION & CLICK-TO-REVEAL CONTACT CARD (Preserves High-Contrast Dark Block from Screenshot) */}
          <div id="contact-cta">
            <Reveal3D direction="depth">
              <div className="obsidian-island rounded-[28px] sm:rounded-[34px] p-8 sm:p-12 border border-white/10 shadow-[0_28px_64px_-22px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="max-w-2xl">
                  <EditableElement
                    id="contactCta.tag"
                    label="Contact CTA Tag"
                    as="span"
                    className="text-[11px] font-mono text-[#E4583B] uppercase tracking-[0.22em] block mb-2"
                  >
                    {language === 'bn' ? 'সরাসরি যোগাযোগ করুন' : "LET'S WORK TOGETHER"}
                  </EditableElement>
                  <EditableElement
                    id="contactCta.title"
                    label="Contact CTA Heading"
                    as="h2"
                    className="font-display text-2xl sm:text-4xl font-bold text-[#F4F0E8] tracking-tight mb-3"
                  >
                    {language === 'bn'
                      ? 'আপনার ব্র্যান্ডের ভিডিও ও ডিজাইন নিয়ে কথা বলুন'
                      : "Let's Talk About Your Brand Video & Visuals"}
                  </EditableElement>
                  <EditableElement
                    id="contactCta.subtitle"
                    label="Contact CTA Subtitle"
                    as="p"
                    className="text-xs sm:text-sm text-[#DDD1BE] leading-relaxed mb-6"
                  >
                    {language === 'bn'
                      ? 'নিরাপত্তার স্বার্থে ক্লিক করে ইমেইল ও হোয়াটসঅ্যাপ নাম্বার দেখে নিন অথবা বিহ্যান্স ও ইউটিউবে যুক্ত হোন।'
                      : 'Click below to reveal my verified Email & WhatsApp number, or inspect live channels directly.'}
                  </EditableElement>

                  <div className="flex flex-wrap items-start gap-3 text-xs">
                    <RevealContactPill
                      type="email"
                      value={portfolio.contact?.email || 'sbmc.3925@gmail.com'}
                      href={`mailto:${portfolio.contact?.email || 'sbmc.3925@gmail.com'}`}
                      language={language}
                      compact
                    />
                    <RevealContactPill
                      type="whatsapp"
                      value="+880 1904-621391"
                      href="https://wa.me/8801904621391"
                      language={language}
                      compact
                    />
                    {youtubeUrl && focusMode !== 'graphic' && (
                      <a
                        href={youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-full bg-white/[0.07] border border-white/15 text-[#F4F0E8] hover:border-[#FF4B5C] transition-colors"
                      >
                        YouTube Channel
                      </a>
                    )}
                    {focusMode !== 'video' && (
                      <a
                        href={behanceUrl || 'https://www.behance.net/jaberhosain'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-full bg-white/[0.07] border border-white/15 text-[#F4F0E8] hover:border-white/35 transition-colors"
                      >
                        Behance: behance.net/jaberhosain
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => navigateTo('contact')}
                    className="inline-flex items-center space-x-2 rtl:space-x-reverse px-6 py-3 rounded-full text-xs sm:text-sm font-semibold glass-pill-cta cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" strokeWidth={1.6} />
                    <span>{language === 'bn' ? 'একসাথে কাজ করি' : "Let's Work Together"}</span>
                  </button>
                </div>
              </div>
            </Reveal3D>
          </div>
        </div>
      </section>
    </div>
  );
};
