import React, { useState, useMemo } from 'react';
import {
  Film,
  Clapperboard,
  Layers,
  Palette,
  Star,
  ArrowLeft,
  ArrowRight,
  Eye,
  ExternalLink
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useNavigation } from '../context/NavigationContext';
import {
  ProjectItem,
  VideoSectionFormat,
  VideoShowcaseItem,
  VideoSubSectionTier
} from '../types/portfolio';
import {
  OrganizedVideoItem,
  VIDEO_SECTION_META,
  VIDEO_SUBSECTION_META,
  mergeAndClassifyVideos
} from '../lib/videoOrganization';
import { ReelCardGrid } from './ReelCardGrid';
import { VideoCardGrid } from './VideoCardGrid';
import { Reveal3D } from './common/Reveal3D';
import { Tilt3DImageStage } from './common/Tilt3DImageStage';
import { RevealContactPill } from './common/RevealContactPill';
import { resolveAssetUrl } from '../utils/assetUrl';
import { getProjectPosters } from '../lib/imageUrlResolver';

interface CreativePortfolioOrganizerProps {
  onOpenVideo?: (video: VideoShowcaseItem) => void;
  onOpenLightbox?: (project: ProjectItem, initialIndex?: number) => void;
  initialPlatformFilter?: 'all' | 'youtube' | 'vimeo' | 'facebook';
  showGraphicTab?: boolean;
  showTestimonialsStrip?: boolean;
  showProjectCta?: boolean;
}

type PortfolioScope = 'full' | 'reels_only' | 'video_only';
type PrimaryFilter = 'all' | VideoSectionFormat | 'graphic';
type TierFilter = 'all' | VideoSubSectionTier;
type PlatformFilter = 'all' | 'youtube' | 'vimeo' | 'facebook';

const VIDEO_SUBSECTION_KEYS: Exclude<VideoSectionFormat, 'reels'>[] = [
  'long_video',
  'motion_graphics',
  'documentary',
  'full_production',
  'saas',
  'cgi'
];

export const CreativePortfolioOrganizer: React.FC<CreativePortfolioOrganizerProps> = ({
  onOpenVideo,
  onOpenLightbox,
  initialPlatformFilter = 'all',
  showGraphicTab = true,
  showTestimonialsStrip = true,
  showProjectCta = true
}) => {
  const { portfolio, loc, language } = usePortfolio();
  const { navigateTo } = useNavigation();

  const [scope, setScope] = useState<PortfolioScope>('full');
  const [primaryCategory, setPrimaryCategory] = useState<PrimaryFilter>('all');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [videoSubFilter, setVideoSubFilter] = useState<'all' | Exclude<VideoSectionFormat, 'reels'>>('all');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>(initialPlatformFilter);
  const [testimonialSlide, setTestimonialSlide] = useState(0);

  // Sync external platform filter changes if controlled from VideosPage
  React.useEffect(() => {
    setPlatformFilter(initialPlatformFilter);
  }, [initialPlatformFilter]);

  const allOrganizedVideos = useMemo(
    () =>
      mergeAndClassifyVideos(
        portfolio.videos || [],
        portfolio.bestVideoWorks || [],
        loc,
        platformFilter
      ),
    [portfolio.videos, portfolio.bestVideoWorks, loc, platformFilter]
  );

  // Apply tier filter across both Reels & Video Editing
  const tierFilteredVideos = useMemo(() => {
    if (tierFilter === 'all') return allOrganizedVideos;
    return allOrganizedVideos.filter((v) => v.resolvedSubSection === tierFilter);
  }, [allOrganizedVideos, tierFilter]);

  // Split Reels (strict vertical 9:16 section) vs Video Editing Cuts (strict 16:9 widescreen sub-sections)
  const reelItems = useMemo(
    () => tierFilteredVideos.filter((v) => v.resolvedSection === 'reels'),
    [tierFilteredVideos]
  );

  const videoEditingItems = useMemo(
    () => tierFilteredVideos.filter((v) => v.resolvedSection !== 'reels'),
    [tierFilteredVideos]
  );

  // Counts before tier filtering so tabs always indicate accurate inventory
  const sectionCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allOrganizedVideos.length,
      reels: 0,
      long_video: 0,
      motion_graphics: 0,
      documentary: 0,
      full_production: 0,
      saas: 0,
      cgi: 0
    };
    allOrganizedVideos.forEach((v) => {
      counts[v.resolvedSection] = (counts[v.resolvedSection] || 0) + 1;
    });
    return counts;
  }, [allOrganizedVideos]);

  // Active Video Editing Subsections that match selection
  const activeVideoSubSections = useMemo(() => {
    const targetFormat =
      primaryCategory !== 'all' && primaryCategory !== 'reels' && primaryCategory !== 'graphic'
        ? primaryCategory
        : videoSubFilter !== 'all'
        ? videoSubFilter
        : null;

    if (targetFormat) {
      const meta = VIDEO_SECTION_META.find((m) => m.id === targetFormat)!;
      const items = videoEditingItems.filter((v) => v.resolvedSection === targetFormat);
      return [{ meta, items }];
    }

    const populated = VIDEO_SUBSECTION_KEYS.map((key) => {
      const meta = VIDEO_SECTION_META.find((m) => m.id === key)!;
      const items = videoEditingItems.filter((v) => v.resolvedSection === key);
      return { meta, items };
    }).filter((group) => group.items.length > 0);

    // If no non-reel items are categorized yet, show one clean empty showcase state for Long Video
    if (populated.length === 0 && videoEditingItems.length === 0) {
      const longMeta = VIDEO_SECTION_META.find((m) => m.id === 'long_video')!;
      return [{ meta: longMeta, items: [] as OrganizedVideoItem[] }];
    }

    return populated;
  }, [primaryCategory, videoSubFilter, videoEditingItems]);

  // Graphic Design Projects (only rendered when Graphic tab is selected)
  const graphicProjects = useMemo(() => {
    return [...(portfolio.projects || [])]
      .filter((p) => p.category === 'graphic' && p.visible !== false && !p.hidden)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [portfolio.projects]);

  const testimonials = useMemo(
    () =>
      [...(portfolio.testimonials || [])]
        .filter((t) => t.visible !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [portfolio.testimonials]
  );

  // Scope selection handlers
  const handleScopeChange = (nextScope: PortfolioScope) => {
    setScope(nextScope);
    if (nextScope === 'reels_only') {
      setPrimaryCategory('reels');
    } else if (nextScope === 'video_only') {
      setPrimaryCategory('all');
      setVideoSubFilter('all');
    } else {
      setPrimaryCategory('all');
      setVideoSubFilter('all');
    }
  };

  const handlePrimarySelect = (cat: PrimaryFilter) => {
    setPrimaryCategory(cat);
    if (cat === 'reels') {
      setScope('reels_only');
    } else if (cat === 'all') {
      setScope('full');
      setVideoSubFilter('all');
    } else if (cat === 'graphic') {
      setScope('full');
    } else {
      setScope('video_only');
      setVideoSubFilter(cat);
    }
  };

  const showReelsSection =
    primaryCategory !== 'graphic' &&
    scope !== 'video_only' &&
    (primaryCategory === 'all' || primaryCategory === 'reels');

  const showVideoEditingSection =
    primaryCategory !== 'graphic' &&
    primaryCategory !== 'reels' &&
    scope !== 'reels_only';

  const showGraphicSection = showGraphicTab && primaryCategory === 'graphic';

  const emailAddress = portfolio.contact?.email || 'sbmc.3925@gmail.com';
  const whatsappNumber = '+880 1904-621391';
  const whatsappHref = 'https://wa.me/8801904621391';

  return (
    <div className="space-y-14 sm:space-y-16 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* ================================================================
            1. ARCHITECTURAL SHOWCASE HEADER CARD (Screenshot-inspired, elevated 3D Dark Obsidian)
            ================================================================ */}
        <Reveal3D direction="up">
          <div className="rounded-[28px] glass-showcase-card border border-white/[0.10] p-7 sm:p-11 text-center relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <div className="text-[11px] font-sans font-medium uppercase tracking-[0.26em] text-[#E4583B]">
                {language === 'bn'
                  ? 'ক্রিয়েটিভ পোর্টফোলিও অর্গানাইজেশন'
                  : language === 'ar'
                  ? 'معرض الأعمال المنظم'
                  : 'PORTFOLIO ARCHIVE'}
              </div>

              <h2
                className="font-display text-3xl sm:text-5xl font-bold text-[#F4F0E8] tracking-tight leading-[1.1]"
                style={{ textWrap: 'balance' }}
              >
                {language === 'bn' ? (
                  <>
                    আমাদের ক্রিয়েটিভ{' '}
                    <span className="font-editorial italic font-normal text-[#DDD1BE]">
                      পোর্টফোলিও
                    </span>
                  </>
                ) : language === 'ar' ? (
                  <>
                    أعمالنا{' '}
                    <span className="font-editorial italic font-normal text-[#DDD1BE]">
                      الإبداعية
                    </span>
                  </>
                ) : (
                  <>
                    Curated Studio{' '}
                    <span className="font-editorial italic font-normal text-[#DDD1BE]">
                      Portfolio
                    </span>
                  </>
                )}
              </h2>

              <p className="text-xs sm:text-sm text-[#A7A298] leading-relaxed max-w-xl mx-auto">
                {language === 'bn'
                  ? 'রিল সেকশনে ভার্টিক্যাল ৯:১৬ রিলস, আর ভিডিও এডিটিং সেকশনে লং ভিডিও, মোশন গ্রাফিক্স, ডকুমেন্টারি এবং প্রিমিয়াম সাব-সেকশন অনুযায়ী সাজানো প্রজেক্টসমূহ।'
                  : language === 'ar'
                  ? 'تنظيم إبداعي يفصل بين مقاطع الريلز العمودية 9:16 ومشاريع المونتاج والموشن جرافيك 16:9.'
                  : 'Thoughtfully organized across vertical 9:16 Reels, widescreen 16:9 Video Editing sub-sections, Motion Graphics, and Visual Brand Design.'}
              </p>

              {/* Scope Segmented Switcher inside Showcase Card */}
              <div className="pt-2 flex justify-center">
                <div className="inline-flex flex-wrap items-center justify-center gap-1 p-1 rounded-full glass-showcase-inner border border-white/[0.09]">
                  {[
                    {
                      id: 'full' as const,
                      label: language === 'bn' ? 'সম্পূর্ণ পোর্টফোলিও' : 'Full Portfolio'
                    },
                    {
                      id: 'reels_only' as const,
                      label:
                        language === 'bn'
                          ? `রিলস (৯:১৬) · ${sectionCounts.reels}`
                          : `Reels (9:16) · ${sectionCounts.reels}`
                    },
                    {
                      id: 'video_only' as const,
                      label:
                        language === 'bn'
                          ? `ভিডিও এডিটিং (১৬:৯) · ${allOrganizedVideos.length - sectionCounts.reels}`
                          : `Video Studio (16:9) · ${allOrganizedVideos.length - sectionCounts.reels}`
                    }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleScopeChange(item.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                        scope === item.id
                          ? 'glass-pill-cta font-semibold'
                          : 'text-[#A7A298] hover:text-[#F4F0E8]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal3D>

        {/* ================================================================
            2. TWO-TIER DISCIPLINE & SUB-SECTION FILTER NAVIGATOR
            ================================================================ */}
        <div className="space-y-3">
          {/* Row A: Primary Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl glass-showcase-inner border border-white/[0.08] max-w-5xl mx-auto">
            <button
              type="button"
              onClick={() => handlePrimarySelect('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                primaryCategory === 'all'
                  ? 'glass-pill-cta font-semibold'
                  : 'text-[#A7A298] hover:text-[#F4F0E8]'
              }`}
            >
              {language === 'bn' ? 'সব সেকশন' : 'All Sections'} ({allOrganizedVideos.length})
            </button>

            {VIDEO_SECTION_META.map((sec) => {
              const count = sectionCounts[sec.id] || 0;
              // Always show core primary tabs; hide obscure subtabs only if zero unless explicitly chosen
              const isCore =
                sec.id === 'reels' ||
                sec.id === 'long_video' ||
                sec.id === 'motion_graphics' ||
                sec.id === 'documentary';
              if (!isCore && count === 0 && primaryCategory !== sec.id) return null;

              const isActive = primaryCategory === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => handlePrimarySelect(sec.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                    isActive
                      ? 'glass-pill-cta font-semibold'
                      : 'text-[#A7A298] hover:text-[#F4F0E8]'
                  }`}
                >
                  {sec.label[language]}
                  {count > 0 ? ` (${count})` : ''}
                </button>
              );
            })}

            {showGraphicTab && (
              <button
                type="button"
                onClick={() => handlePrimarySelect('graphic')}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                  primaryCategory === 'graphic'
                    ? 'glass-pill-cta font-semibold'
                    : 'text-[#A7A298] hover:text-[#F4F0E8]'
                }`}
              >
                {language === 'bn' ? 'গ্রাফিক্স ডিজাইন' : 'Graphics Design'} ({graphicProjects.length})
              </button>
            )}
          </div>

          {/* Row B: Secondary Sub-Section Tier Switcher (Premium / Standard / Storytelling / Commercial) */}
          {primaryCategory !== 'graphic' && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setTierFilter('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  tierFilter === 'all'
                    ? 'bg-[#E4583B] text-white font-semibold'
                    : 'glass-pill-ghost text-[#A7A298] hover:text-[#F4F0E8]'
                }`}
              >
                {language === 'bn' ? 'সব লেভেল' : 'All Tiers'}
              </button>

              {VIDEO_SUBSECTION_META.map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setTierFilter(tier.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    tierFilter === tier.id
                      ? 'bg-[#E4583B] text-white font-semibold'
                      : 'glass-pill-ghost text-[#A7A298] hover:text-[#F4F0E8]'
                  }`}
                >
                  {tier.label[language]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================================================================
            3. DEDICATED REELS SECTION (STRICT 9:16 VERTICAL GRID)
            ================================================================ */}
        {showReelsSection && (
          <section
            aria-labelledby="reels-section-heading"
            className="space-y-6 pt-2"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-[#E4583B] uppercase tracking-[0.2em] mb-1.5">
                  <Clapperboard className="w-3.5 h-3.5" />
                  <span>
                    {language === 'bn' ? '০১. রিল সেকশন (৯:১৬)' : '01. Vertical Reels Studio (9:16)'}
                  </span>
                </div>
                <h3
                  id="reels-section-heading"
                  className="font-display text-2xl sm:text-3xl font-bold text-[#F4F0E8] tracking-tight"
                >
                  {language === 'bn'
                    ? 'শর্ট-ফর্ম ও ভার্টিক্যাল রিলস'
                    : 'Short-Form Reels Showcase'}
                </h3>
                <p className="text-xs sm:text-sm text-[#A7A298] mt-1">
                  {VIDEO_SECTION_META[0].shortDesc[language]}
                </p>
              </div>

              <div className="text-xs text-[#A7A298] tabular-nums shrink-0">
                {reelItems.length} {language === 'bn' ? 'টি রিলস' : 'Reels'}
              </div>
            </div>

            <ReelCardGrid reels={reelItems} onOpenVideo={onOpenVideo} />
          </section>
        )}

        {/* ================================================================
            4. DEDICATED VIDEO EDITING SECTION WITH RICH SUB-SECTIONS (16:9)
            ================================================================ */}
        {showVideoEditingSection && (
          <section
            aria-labelledby="video-editing-section-heading"
            className="space-y-8 pt-6 border-t border-white/[0.08]"
          >
            {/* Section Header + Sub-Section Switcher */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-4 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-[#E4583B] uppercase tracking-[0.2em] mb-1.5">
                  <Film className="w-3.5 h-3.5" />
                  <span>
                    {language === 'bn'
                      ? '০২. ভিডিও এডিটিং ও সাব-সেকশন (১৬:৯)'
                      : '02. Video Editing & Sub-Sections (16:9)'}
                  </span>
                </div>
                <h3
                  id="video-editing-section-heading"
                  className="font-display text-2xl sm:text-3xl font-bold text-[#F4F0E8] tracking-tight"
                >
                  {language === 'bn'
                    ? 'ভিডিও এডিটিং স্টুডিও ও সাব-সেকশন'
                    : 'Long-Form, Motion & Film Sub-Sections'}
                </h3>
                <p className="text-xs sm:text-sm text-[#A7A298] mt-1 max-w-2xl">
                  {language === 'bn'
                    ? 'প্রতিটি ভিডিও এডিটিং কাজ লং ভিডিও, মোশন গ্রাফিক্স, ডকুমেন্টারি ও প্রোডাকশন সাব-সেকশন অনুযায়ী সুবিন্যস্ত।'
                    : 'Widescreen cinema cuts organized by editing discipline—Long Video, Motion Graphics, Documentary, Full Production, SaaS, and CGI.'}
                </p>
              </div>

              {/* Dedicated Video Editing Sub-Section Pills */}
              {primaryCategory === 'all' && (
                <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl glass-showcase-inner border border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setVideoSubFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                      videoSubFilter === 'all'
                        ? 'glass-pill-cta font-semibold'
                        : 'text-[#A7A298] hover:text-[#F4F0E8]'
                    }`}
                  >
                    {language === 'bn' ? 'সব সাব-সেকশন' : 'All Cuts'}
                  </button>
                  {VIDEO_SUBSECTION_KEYS.map((key) => {
                    const count = videoEditingItems.filter((v) => v.resolvedSection === key).length;
                    const meta = VIDEO_SECTION_META.find((m) => m.id === key)!;
                    if (count === 0 && key !== 'long_video' && key !== 'motion_graphics') return null;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setVideoSubFilter(key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer tabular-nums ${
                          videoSubFilter === key
                            ? 'glass-pill-cta font-semibold'
                            : 'text-[#A7A298] hover:text-[#F4F0E8]'
                        }`}
                      >
                        {meta.label[language]} ({count})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Organized Sub-Section Shelves */}
            <div className="space-y-12">
              {activeVideoSubSections.map(({ meta, items }, groupIdx) => (
                <div key={meta.id} className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-baseline gap-3">
                      <span className="text-xs font-semibold text-[#E4583B] tabular-nums">
                        {String(groupIdx + 1).padStart(2, '0')}.
                      </span>
                      <div>
                        <h4 className="text-lg sm:text-xl font-semibold text-[#F4F0E8]">
                          {meta.label[language]}
                        </h4>
                        <p className="text-xs text-[#8E8A82] mt-0.5">{meta.shortDesc[language]}</p>
                      </div>
                    </div>

                    <span className="text-xs text-[#A7A298] tabular-nums">
                      {items.length} {language === 'bn' ? 'টি প্রজেক্ট' : items.length === 1 ? 'Cut' : 'Cuts'}
                    </span>
                  </div>

                  <VideoCardGrid
                    videos={items}
                    onOpenVideo={onOpenVideo}
                    emptyPlaceholder={
                      language === 'bn'
                        ? `"${meta.label.bn}" সাব-সেকশনে অ্যাডমিন প্যানেল থেকে ভিডিও যুক্ত করুন অথবা ক্যাটাগরি নির্বাচন করুন।`
                        : `Assign cuts to "${meta.label.en}" from the Admin Video Editor.`
                    }
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================================================================
            5. DEDICATED GRAPHIC DESIGN ARCHIVE TAB
            ================================================================ */}
        {showGraphicSection && (
          <section className="space-y-6 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-[#E4583B] uppercase tracking-[0.2em] mb-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  <span>
                    {language === 'bn' ? '০৩. গ্রাফিক ডিজাইন ও ভিজ্যুয়াল' : '03. Graphic Design & Posters'}
                  </span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F0E8] tracking-tight">
                  {language === 'bn' ? 'গ্রাফিক ডিজাইন প্রজেক্টসমূহ' : 'Visual Direction & Poster Series'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => navigateTo('design')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill-ghost text-xs font-medium cursor-pointer self-start sm:self-auto"
              >
                <Layers className="w-3.5 h-3.5 text-[#E4583B]" />
                <span>{language === 'bn' ? 'সম্পূর্ণ গ্যালারি খুলুন' : 'Open Full Design Gallery'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {graphicProjects.map((project, idx) => {
                const posters = getProjectPosters(project);
                const coverUrl = posters[0]?.url || project.coverImage || '';
                return (
                  <Reveal3D key={project.id || idx} direction="up" delay={(idx % 3) * 70}>
                    <div
                      onClick={() => onOpenLightbox?.(project, 0)}
                      className="h-full group rounded-[22px] glass-showcase-card overflow-hidden cursor-pointer flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300"
                    >
                      <div className="p-2.5 border-b border-white/[0.08]">
                        <Tilt3DImageStage className="aspect-[16/10] w-full" maxTilt={11} scaleOnHover={1.025}>
                          <div className="relative w-full h-full rounded-[14px] glass-showcase-inner overflow-hidden flex items-center justify-center">
                            {coverUrl ? (
                              <img
                                src={resolveAssetUrl(coverUrl)}
                                alt={loc(project.title)}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                                <Palette className="w-6 h-6 text-[#E4583B]" />
                                <span className="text-xs text-[#DDD1BE]">{loc(project.title)}</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass-pill-cta text-xs font-semibold">
                                <Eye className="w-3.5 h-3.5" />
                                <span>{language === 'bn' ? 'দেখুন' : 'Inspect'}</span>
                              </span>
                            </div>
                          </div>
                        </Tilt3DImageStage>
                      </div>

                      <div className="p-5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[11px] text-[#8E8A82] flex items-center gap-1.5">
                            <span className="text-[#E4583B] font-medium">
                              {loc(project.groupName) || 'Graphic Design'}
                            </span>
                            {posters.length > 0 && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="tabular-nums">{posters.length} Posters</span>
                              </>
                            )}
                          </div>
                          <h4 className="text-sm sm:text-base font-semibold text-[#F4F0E8] truncate mt-0.5">
                            {loc(project.title)}
                          </h4>
                        </div>
                        {project.behanceUrl && (
                          <a
                            href={project.behanceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 h-8 rounded-full glass-icon-disc flex items-center justify-center shrink-0"
                            title="Open Behance"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </Reveal3D>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* ================================================================
          6. CLIENT FEEDBACK & VOICE CAROUSEL (ক্লায়েন্টদের মুখেই শুনুন)
          ================================================================ */}
      {showTestimonialsStrip && testimonials.length > 0 && (
        <section className="py-16 bg-[#111319]/75 border-y border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#E4583B] mb-1.5">
                  {language === 'bn' ? 'ক্লায়েন্ট রিভিউ' : 'Client Voices'}
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F0E8] tracking-tight">
                  {language === 'bn'
                    ? 'ক্লায়েন্টদের মুখেই শুনুন'
                    : 'What Brands & Creators Say'}
                </h3>
                <p className="text-xs sm:text-sm text-[#A7A298] mt-1">
                  {language === 'bn'
                    ? 'যাদের সাথে কাজ করা হয়েছে, তাদের বাস্তব অভিজ্ঞতা ও মতামত।'
                    : 'Feedback from creators, founders, and production teams we collaborated with.'}
                </p>
              </div>

              {testimonials.length > 1 && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setTestimonialSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length)
                    }
                    className="w-9 h-9 rounded-full glass-icon-disc flex items-center justify-center cursor-pointer"
                    aria-label="Previous testimonial"
                  >
                    <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestimonialSlide((prev) => (prev + 1) % testimonials.length)}
                    className="w-9 h-9 rounded-full glass-icon-disc flex items-center justify-center cursor-pointer"
                    aria-label="Next testimonial"
                  >
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, idx) => {
                const isFocused = idx === testimonialSlide % testimonials.length;
                return (
                  <article
                    key={t.id || idx}
                    className={`rounded-[22px] p-6 glass-showcase-card border transition-all duration-300 flex flex-col justify-between ${
                      isFocused ? 'border-[#E4583B]/40' : 'border-white/[0.08]'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-1 text-[#F2B705]">
                        {Array.from({ length: Math.max(1, Math.min(5, t.rating || 5)) }).map((_, s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs sm:text-sm text-[#DDD1BE] leading-relaxed">
                        &ldquo;{loc(t.quote)}&rdquo;
                      </p>
                    </div>

                    <div className="pt-5 mt-5 border-t border-white/[0.08] flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-xs font-bold text-[#F4F0E8] shrink-0">
                        {t.clientAvatar ? (
                          <img
                            src={resolveAssetUrl(t.clientAvatar)}
                            alt={t.clientName}
                            className="w-full h-full rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          t.clientName.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#F4F0E8] truncate">
                          {t.clientName}
                        </div>
                        <div className="text-[11px] text-[#8E8A82] truncate">
                          {loc(t.clientRole)}
                          {t.clientCompany ? ` · ${t.clientCompany}` : ''}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          7. OBSIDIAN PROJECT CONVERSION CTA (WITH CLICK-TO-REVEAL PRIVACY)
          ================================================================ */}
      {showProjectCta && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal3D direction="up">
            <div className="rounded-[28px] glass-showcase-card border border-white/[0.12] p-8 sm:p-12 text-center space-y-5 relative overflow-hidden">
              <h3
                className="font-display text-2xl sm:text-4xl font-bold text-[#F4F0E8] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                {language === 'bn'
                  ? 'আপনার মাথায় কোনো প্রজেক্ট আছে?'
                  : language === 'ar'
                  ? 'هل لديك مشروع في ذهنك؟'
                  : 'Have a project in mind?'}
              </h3>
              <p className="text-xs sm:text-sm text-[#A7A298] max-w-lg mx-auto leading-relaxed">
                {language === 'bn'
                  ? 'আপনার ব্র্যান্ড বা চ্যানেলের জন্য কেমন রিলস, লং ভিডিও বা ডিজাইন প্রয়োজন জানান—সাথে সাথেই সেরা পরামর্শ পাবেন।'
                  : 'Tell us what Reels, Video Editing, or Design assets your brand needs and get tailored creative guidance.'}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
                <RevealContactPill
                  type="whatsapp"
                  value={whatsappNumber}
                  href={whatsappHref}
                  language={language}
                />
                <RevealContactPill
                  type="email"
                  value={emailAddress}
                  href={`mailto:${emailAddress}`}
                  language={language}
                />
                <button
                  type="button"
                  onClick={() => navigateTo('contact')}
                  className="px-5 py-2.5 rounded-full glass-pill-ghost text-xs font-semibold cursor-pointer whitespace-nowrap"
                >
                  {language === 'bn' ? 'কনসালটেশন ও ফর্ম' : 'Book Consultation'}
                </button>
              </div>
            </div>
          </Reveal3D>
        </div>
      )}
    </div>
  );
};
