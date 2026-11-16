import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Film,
  Sparkles,
  Volume2,
  Palette,
  Grid,
  Maximize2
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useNavigation } from '../../context/NavigationContext';
import { ProjectItem, VideoShowcaseItem } from '../../types/portfolio';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { normalizeDirectImageUrl, getProjectPosters } from '../../lib/imageUrlResolver';
import { resolveVideoSection } from '../../lib/videoOrganization';
import { EditableElement } from '../common/EditableElement';
import { StudioArrowRight } from '../common/StudioIcon';

interface FeaturedShowcaseStageProps {
  onOpenVideo?: (video: VideoShowcaseItem) => void;
  onOpenLightbox?: (project: ProjectItem, initialIndex?: number) => void;
}

interface GraphicCardSlideProps {
  project: ProjectItem;
  index: number;
  total: number;
  cardRef: (el: HTMLDivElement | null) => void;
  scrimRef: (el: HTMLDivElement | null) => void;
  language: string;
  loc: (val: any) => string;
  onOpenLightbox?: (project: ProjectItem, initialIndex?: number) => void;
}

/**
 * Reusable Interactive Graphic Design Card with inline uncropped multi-poster switching
 */
const GraphicStackedCard: React.FC<GraphicCardSlideProps> = ({
  project,
  index,
  total,
  cardRef,
  scrimRef,
  language,
  loc,
  onOpenLightbox
}) => {
  const posters = useMemo(() => getProjectPosters(project), [project]);
  const [posterIdx, setPosterIdx] = useState(0);
  const safeIdx = posters.length > 0 ? Math.min(posterIdx, posters.length - 1) : 0;
  const activeUrl =
    posters[safeIdx]?.url ||
    normalizeDirectImageUrl(project.coverImage) ||
    '/assets/jaber_about.png';

  const groupLabel =
    loc(project.groupName) || (language === 'bn' ? 'গ্রাফিক ডিজাইন' : 'Graphic Design');

  const topOffset = 88 + Math.min(index, 5) * 14;

  return (
    <div
      className="relative md:sticky"
      style={{
        top: `${topOffset}px`,
        zIndex: 10 + index
      }}
    >
      <article
        ref={cardRef}
        data-cursor="view"
        onClick={() => onOpenLightbox?.(project, safeIdx)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenLightbox?.(project, safeIdx);
          }
        }}
        className="obsidian-island smooth-sticky-card group relative w-full rounded-[22px] sm:rounded-[28px] border border-white/[0.11] shadow-[0_32px_70px_-18px_rgba(0,0,0,0.78)] overflow-hidden cursor-pointer origin-top will-change-transform active:scale-[0.99] transition-transform duration-150"
      >
        {/* GPU-Composited Depth Scrim Overlay (zero filter repaint cost during scroll) */}
        <div
          ref={scrimRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 bg-[#050608] opacity-0 will-change-[opacity]"
        />
        {/* Top Card Header Bar (01 / 05  ---  Group / Year) */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-3.5 border-b border-white/[0.08]">
          <span className="font-mono text-[11px] tracking-[0.2em] text-[#8E8A82] tabular-nums">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <span className="font-mono text-[11px] tracking-[0.14em] text-[#8E8A82] uppercase">
            {posters.length > 1
              ? `${posters.length} ${language === 'bn' ? 'পোস্টার' : 'POSTERS'} · 2026`
              : `${project.year || '2026'} · GRAPHIC`}
          </span>
        </div>

        {/* Two-Column Card Body matching Frame Reference */}
        <div className="grid grid-cols-1 lg:grid-cols-[0.86fr_1.34fr] items-stretch">
          {/* Left Editorial Info Column */}
          <div className="p-5 sm:p-8 flex flex-col justify-between gap-5 sm:gap-6 border-b lg:border-b-0 lg:border-r border-white/[0.08]">
            <div>
              <div className="font-editorial italic text-[15px] text-[#B7B2A8] border-b border-white/[0.14] w-fit pb-0.5 mb-3">
                {groupLabel}
              </div>

              <h3 className="font-display text-xl sm:text-[28px] font-bold text-[#F4F0E8] leading-[1.15] tracking-tight">
                {loc(project.title)}
              </h3>

              <div className="h-px w-full bg-white/[0.08] my-3.5 sm:my-4" />

              <p className="text-xs sm:text-sm text-[#A7A298] leading-relaxed line-clamp-3">
                {loc(project.description) ||
                  (language === 'bn'
                    ? 'হাই-কনট্রাস্ট ব্র্যান্ড ভিজ্যুয়াল, পরিচ্ছন্ন টাইপোগ্রাফি এবং পূর্ণ রেজোলিউশন পোস্টার সিস্টেম।'
                    : 'Balanced typographic hierarchy, custom color grading, and crisp multi-format campaign layouts.')}
              </p>
            </div>

            {/* Bottom Icons & Tactile Ivory CTA Pill */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-[10.5px] font-mono text-[#8E8A82]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-[#001E36] border border-[#31A8FF]/50 text-[#31A8FF] font-bold text-[9px] flex items-center justify-center">
                    Ps
                  </span>
                  <span>Photoshop</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-[#330000] border border-[#FF9A00]/50 text-[#FF9A00] font-bold text-[9px] flex items-center justify-center">
                    Ai
                  </span>
                  <span>Illustrator</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Grid className="w-3 h-3 text-[#A7A298]" />
                  <span>Full Preview</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 px-5 min-h-[42px] py-2.5 rounded-full bg-[#F4F0E8] group-hover:bg-white text-[#111318] text-xs font-semibold shadow-lg transition-all">
                  <Eye className="w-3.5 h-3.5" strokeWidth={1.8} />
                  <span>
                    {language === 'bn' ? 'পূর্ণ পোস্টার দেখুন' : 'Inspect the piece'}
                  </span>
                </span>

                {project.behanceUrl && (
                  <a
                    href={project.behanceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-4 min-h-[42px] py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-xs font-semibold text-[#F4F0E8] transition-colors"
                  >
                    <span className="text-[#38BDF8] font-bold">Bē</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Uncropped Full-Preview Poster Viewport */}
          <div className="p-3.5 sm:p-6 flex flex-col justify-center bg-[#090B0E]/60">
            <div className="relative w-full h-[220px] sm:h-[340px] lg:h-[380px] rounded-[16px] sm:rounded-[18px] overflow-hidden bg-[#07080B] border border-white/[0.08] flex items-center justify-center p-2.5 sm:p-5 group/media">
              <img
                src={resolveAssetUrl(activeUrl)}
                alt={posters[safeIdx]?.caption || loc(project.title)}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-[0_20px_44px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover/media:scale-[1.025]"
              />

              {/* Centered Floating White Circular Inspect Disc (matches reference frame overlay circle) */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity duration-300 bg-black/25">
                <span className="w-14 h-14 rounded-full bg-white text-[#111318] flex items-center justify-center shadow-[0_14px_34px_rgba(0,0,0,0.55)]">
                  <Maximize2 className="w-5 h-5" strokeWidth={1.8} />
                </span>
              </div>

              {/* Multi-poster Prev/Next Controls inside Frame */}
              {posters.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPosterIdx((prev) => (prev - 1 + posters.length) % posters.length);
                    }}
                    aria-label="Previous poster"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/75 hover:bg-[#E4583B] text-white border border-white/15 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPosterIdx((prev) => (prev + 1) % posters.length);
                    }}
                    aria-label="Next poster"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/75 hover:bg-[#E4583B] text-white border border-white/15 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Inline Thumbnail Selector Strip if Group has Multiple Posters */}
            {posters.length > 1 && (
              <div
                className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar pb-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                {posters.map((pst, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => setPosterIdx(pIdx)}
                    className={`w-11 h-11 rounded-lg overflow-hidden shrink-0 border-2 p-0.5 bg-[#0A0C10] transition-all cursor-pointer ${
                      pIdx === safeIdx
                        ? 'border-[#F4F0E8] scale-105'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={resolveAssetUrl(pst.url)}
                      alt={pst.caption || `Poster ${pIdx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

/**
 * Stacked Scroll-Card Showcase Stage (Modeled faithfully after Freme_0871937b.mp4):
 * 1) TOP SECTION: Video Editing (Stacked sticky frames sliding smoothly one over another)
 * 2) BOTTOM SECTION: Graphic Design (Stacked sticky uncropped poster frames directly below Video)
 */
export const FeaturedShowcaseStage: React.FC<FeaturedShowcaseStageProps> = ({
  onOpenVideo,
  onOpenLightbox
}) => {
  const { portfolio, loc, language } = usePortfolio();
  const { focusMode, navigateTo } = useNavigation();

  const [videoTab, setVideoTab] = useState<'all' | 'best' | 'reels' | 'long' | 'motion'>('all');
  const [graphicGroup, setGraphicGroup] = useState<string>('ALL');

  const videoCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoScrimRefs = useRef<(HTMLDivElement | null)[]>([]);
  const graphicCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const graphicScrimRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ---------------- 1. VIDEO EDITING STACK DATA ----------------
  const { filteredVideos, totalVideosCount } = useMemo(() => {
    const best: VideoShowcaseItem[] = [...(portfolio.bestVideoWorks || [])]
      .filter((v) => v.visible !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((b) => ({
        id: b.id,
        title: b.title,
        description: b.description || { en: '', bn: '', ar: '' },
        videoUrl: b.videoUrl,
        videoType: b.videoType,
        thumbnailUrl: b.thumbnailUrl,
        customThumbnailUrl: b.customThumbnailUrl || b.thumbnailUrl,
        videoSection: b.videoSection,
        subSection: b.subSection,
        duration: b.duration,
        clientName: b.clientName
      }));

    const regular: VideoShowcaseItem[] = [...(portfolio.videos || [])]
      .filter((v: any) => v.visible !== false && !v.hidden)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // Merge deduplicated list prioritizing Best Work first
    const seenIds = new Set<string>();
    const allMerged: VideoShowcaseItem[] = [];
    [...best, ...regular].forEach((v) => {
      const key = v.id || v.videoUrl;
      if (!seenIds.has(key)) {
        seenIds.add(key);
        allMerged.push(v);
      }
    });

    let list = allMerged;
    if (videoTab === 'best' && best.length > 0) {
      list = best;
    } else if (videoTab === 'reels') {
      const r = allMerged.filter(
        (v) => resolveVideoSection(v, loc(v.title), loc(v.description)) === 'reels'
      );
      if (r.length > 0) list = r;
    } else if (videoTab === 'long') {
      const l = allMerged.filter((v) => {
        const s = resolveVideoSection(v, loc(v.title), loc(v.description));
        return s === 'long_video' || s === 'documentary' || s === 'full_production';
      });
      if (l.length > 0) list = l;
    } else if (videoTab === 'motion') {
      const m = allMerged.filter((v) => {
        const s = resolveVideoSection(v, loc(v.title), loc(v.description));
        return s === 'motion_graphics' || s === 'cgi' || s === 'saas';
      });
      if (m.length > 0) list = m;
    }

    return {
      filteredVideos: list.slice(0, 6),
      totalVideosCount: allMerged.length
    };
  }, [portfolio.bestVideoWorks, portfolio.videos, videoTab, loc]);

  // ---------------- 2. GRAPHIC DESIGN STACK DATA ----------------
  const { filteredGraphicProjects, graphicGroups, totalGraphicCount } = useMemo(() => {
    const reg: ProjectItem[] = [...(portfolio.projects || [])]
      .filter((p: any) => p.category === 'graphic' && p.visible !== false && !p.hidden)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const bestG: ProjectItem[] = [...(portfolio.bestGraphicWorks || [])]
      .filter((g) => g.visible !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((item, idx) => ({
        id: item.id || `best-g-${idx}`,
        title: item.title,
        groupName: {
          en: 'Featured Graphic',
          bn: 'সেরা গ্রাফিক কাজ',
          ar: 'أفضل التصاميم'
        },
        category: 'graphic_best' as const,
        description: { en: '', bn: '', ar: '' },
        coverImage: item.imageUrl,
        galleryImages: [item.imageUrl],
        behanceUrl: item.behanceUrl,
        order: item.order
      }));

    const allG = [...bestG, ...reg];

    const gSet = new Set<string>();
    const gList: string[] = [];
    allG.forEach((p) => {
      const g = (
        loc(p.groupName) || (language === 'bn' ? 'গ্রাফিক ডিজাইন' : 'Graphic Design')
      ).trim();
      if (g && !gSet.has(g)) {
        gSet.add(g);
        gList.push(g);
      }
    });

    const filtered =
      graphicGroup === 'ALL'
        ? allG
        : allG.filter(
            (p) =>
              (
                loc(p.groupName) || (language === 'bn' ? 'গ্রাফিক ডিজাইন' : 'Graphic Design')
              ).trim() === graphicGroup
          );

    return {
      filteredGraphicProjects: filtered.slice(0, 6),
      graphicGroups: gList,
      totalGraphicCount: allG.length
    };
  }, [portfolio.projects, portfolio.bestGraphicWorks, graphicGroup, loc, language]);

  // ---------------- 3. SILKY 60FPS SCROLL-DRIVEN STACK COMPRESSION (GPU COMPOSITOR ONLY) ----------------
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let rafId = 0;

    const updateStackCompression = (
      refs: (HTMLDivElement | null)[],
      scrimRefs: (HTMLDivElement | null)[]
    ) => {
      const isTabletOrDesktop = window.innerWidth >= 768;

      for (let i = 0; i < refs.length; i++) {
        const card = refs[i];
        const scrim = scrimRefs[i];
        if (!card) continue;

        if (!isTabletOrDesktop) {
          // On compact mobile viewports, keep full cards crystal-clear and zero-clipping
          card.style.transform = 'translate3d(0, 0, 0) scale(1)';
          if (scrim) scrim.style.opacity = '0';
          continue;
        }

        const nextCard = refs[i + 1];
        if (!nextCard) {
          card.style.transform = 'translate3d(0, 0, 0) scale(1)';
          if (scrim) scrim.style.opacity = '0';
          continue;
        }

        const currentRect = card.getBoundingClientRect();
        const nextRect = nextCard.getBoundingClientRect();

        // How closely the next card has risen over the active sticky card
        const overlapSpan = Math.max(220, currentRect.height * 0.72);
        const distance = nextRect.top - currentRect.top;
        const rawProgress = 1 - Math.max(0, Math.min(1, distance / overlapSpan));

        const scale = 1 - rawProgress * 0.055;
        const translateY = -rawProgress * 8;
        const scrimOpacity = rawProgress * 0.42;

        card.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        if (scrim) {
          scrim.style.opacity = scrimOpacity.toFixed(3);
        }
      }
    };

    const tick = () => {
      updateStackCompression(videoCardRefs.current, videoScrimRefs.current);
      updateStackCompression(graphicCardRefs.current, graphicScrimRefs.current);
      rafId = 0;
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    tick();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [filteredVideos.length, filteredGraphicProjects.length, videoTab, graphicGroup]);

  return (
    <div id="featured-stage" className="bg-[#121419]/85 transition-colors">
      {/* ========================================================================
          SECTION 1 (TOP): VIDEO EDITING — STACKED SCROLL DECK FRAMES
          ======================================================================== */}
      {focusMode !== 'graphic' && filteredVideos.length > 0 && (
        <section
          id="video-editing-showcase"
          aria-label={language === 'bn' ? 'ভিডিও এডিটিং সেকশন' : 'Video Editing Showcase'}
          className="py-16 sm:py-24 border-b border-white/[0.07]"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Editorial Two-Tone Section Heading matching Frame Reference */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-14">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-[#E4583B] block mb-2">
                  {language === 'bn' ? 'বিহাইন্ড দ্য কাট · ভিডিও এডিটিং' : 'BEHIND THE CUT · VIDEO EDITING'}
                </span>
                <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#F4F0E8] tracking-tight leading-[1.08]">
                  {language === 'bn' ? 'ভিডিও এডিটিং —' : "This is how it's made."}{' '}
                  <span className="font-editorial italic font-normal text-[#A7A298] block sm:inline">
                    {language === 'bn' ? 'ফ্রেমে ফ্রেমে গল্প।' : 'And made right.'}
                  </span>
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all' as const, label: language === 'bn' ? 'সব ভিডিও' : 'All Cuts' },
                  { id: 'best' as const, label: language === 'bn' ? 'সেরা কাজ' : 'Best Work' },
                  { id: 'reels' as const, label: language === 'bn' ? 'রিলস (৯:১৬)' : 'Reels 9:16' },
                  { id: 'long' as const, label: language === 'bn' ? 'লং ভিডিও' : 'Long Video' },
                  { id: 'motion' as const, label: language === 'bn' ? 'মোশন' : 'Motion' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setVideoTab(tab.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      videoTab === tab.id ? 'glass-pill-cta' : 'glass-pill-ghost'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => navigateTo('videos')}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full glass-pill-ghost text-xs font-semibold cursor-pointer whitespace-nowrap"
                >
                  <span>{language === 'bn' ? `সব (${totalVideosCount})` : `All (${totalVideosCount})`}</span>
                  <StudioArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </div>
            </div>

            {/* Stacked Scroll Frames Container (NO overflow-hidden so position:sticky glides cleanly) */}
            <div className="relative space-y-6 md:space-y-14 pb-4 sm:pb-8">
              {filteredVideos.map((vid, idx) => {
                const sectionKind = resolveVideoSection(vid, loc(vid.title), loc(vid.description));
                const categoryItalic =
                  sectionKind === 'reels'
                    ? language === 'bn'
                      ? 'শর্ট রিলস (৯:১৬)'
                      : 'Vertical Reel · 9:16'
                    : sectionKind === 'motion_graphics'
                    ? language === 'bn'
                      ? 'মোশন গ্রাফিক্স'
                      : 'Motion IT · 3D'
                    : sectionKind === 'documentary'
                    ? language === 'bn'
                      ? 'ডকুমেন্টারি কাট'
                      : 'Documentary Cut'
                    : language === 'bn'
                    ? 'ভিডিও এডিটিং'
                    : 'Featured Video Cut';

                const topOffset = 88 + Math.min(idx, 5) * 14;
                const thumbSrc = resolveAssetUrl(
                  normalizeDirectImageUrl(vid.customThumbnailUrl || vid.thumbnailUrl) ||
                    '/assets/jaber_hero.png'
                );

                return (
                  <div
                    key={vid.id || idx}
                    className="relative md:sticky"
                    style={{
                      top: `${topOffset}px`,
                      zIndex: 10 + idx
                    }}
                  >
                    <article
                      ref={(el) => {
                        videoCardRefs.current[idx] = el as HTMLDivElement | null;
                      }}
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
                      className="obsidian-island smooth-sticky-card group relative w-full rounded-[22px] sm:rounded-[28px] border border-white/[0.11] shadow-[0_32px_70px_-18px_rgba(0,0,0,0.78)] overflow-hidden cursor-pointer origin-top will-change-transform active:scale-[0.99] transition-transform duration-150"
                    >
                      {/* GPU-Composited Depth Scrim Overlay */}
                      <div
                        ref={(el) => {
                          videoScrimRefs.current[idx] = el;
                        }}
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 z-30 bg-[#050608] opacity-0 will-change-[opacity]"
                      />

                      {/* Top Header Strip inside Frame (01 / 06  ---  2026 · Aspect) */}
                      <div className="flex items-center justify-between px-5 sm:px-8 py-3.5 border-b border-white/[0.08]">
                        <span className="font-mono text-[11px] tracking-[0.2em] text-[#8E8A82] tabular-nums">
                          {String(idx + 1).padStart(2, '0')} /{' '}
                          {String(filteredVideos.length).padStart(2, '0')}
                        </span>
                        <span className="font-mono text-[11px] tracking-[0.14em] text-[#8E8A82] uppercase">
                          {vid.duration ? `${vid.duration} · ` : ''}
                          {sectionKind === 'reels' ? '9:16 REELS' : '16:9 VIDEO'}
                        </span>
                      </div>

                      {/* Two-Column Card Body matching Frame Reference */}
                      <div className="grid grid-cols-1 lg:grid-cols-[0.86fr_1.34fr] items-stretch">
                        {/* Left Info & Tool Icons Column */}
                        <div className="p-5 sm:p-8 flex flex-col justify-between gap-5 sm:gap-6 border-b lg:border-b-0 lg:border-r border-white/[0.08]">
                          <div>
                            <div className="font-editorial italic text-[15px] text-[#B7B2A8] border-b border-white/[0.14] w-fit pb-0.5 mb-3">
                              {categoryItalic}
                            </div>

                            <EditableElement
                              id={`featuredVideo.${vid.id}.title`}
                              label={`Video Card Title: ${loc(vid.title)}`}
                              as="h3"
                              className="font-display text-xl sm:text-[28px] font-bold text-[#F4F0E8] leading-[1.15] tracking-tight"
                            >
                              {loc(vid.title)}
                            </EditableElement>

                            <div className="h-px w-full bg-white/[0.08] my-4" />

                            <p className="text-xs sm:text-sm text-[#A7A298] leading-relaxed line-clamp-3">
                              {loc(vid.description) ||
                                (language === 'bn'
                                  ? 'দর্শক ধরে রাখার হুক, ডায়নামিক কাইনেটিক ক্যাপশন, লেয়ার্ড সাউন্ড ডিজাইন ও সিনেমাটিক কালার গ্রেডিং।'
                                  : 'Clean narrative cut engineered with hook pacing, kinetic typography, and cinema-grade sound design.')}
                            </p>
                          </div>

                          {/* Tool Badges & Tactile Ivory CTA Button */}
                          <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3 text-[10.5px] font-mono text-[#8E8A82]">
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded bg-[#00005B] border border-[#9999FF]/50 text-[#9999FF] font-bold text-[9px] flex items-center justify-center">
                                  Pr
                                </span>
                                <span>Premiere Pro</span>
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded bg-[#00005B] border border-[#C084FC]/50 text-[#C084FC] font-bold text-[9px] flex items-center justify-center">
                                  Ae
                                </span>
                                <span>After Effects</span>
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Volume2 className="w-3 h-3 text-[#A7A298]" />
                                <span>SFX</span>
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-[#E4583B]" />
                                <span>Motion 3D</span>
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="inline-flex items-center gap-2 px-5 min-h-[42px] py-2.5 rounded-full bg-[#F4F0E8] group-hover:bg-white text-[#111318] text-xs font-semibold shadow-lg transition-all">
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>
                                  {language === 'bn' ? 'ভিডিও দেখুন' : 'Watch the piece'}
                                </span>
                              </span>

                              {vid.videoUrl && (
                                <a
                                  href={vid.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1.5 px-4 min-h-[42px] py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-xs font-semibold text-[#F4F0E8] transition-colors"
                                  title="Open Original Video"
                                >
                                  <Film className="w-3.5 h-3.5 text-[#E4583B]" />
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Framed Video Media Window */}
                        <div className="p-3.5 sm:p-6 flex items-center bg-[#090B0E]/60">
                          <div className="relative w-full aspect-[16/10] rounded-[16px] sm:rounded-[18px] overflow-hidden bg-[#07080B] border border-white/[0.08] shadow-2xl group/media">
                            <img
                              src={thumbSrc}
                              alt={loc(vid.title)}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover/media:scale-[1.04]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

                            {/* Centered Crisp White Play Circle Badge matching Frame 00:01 */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white group-hover:bg-[#E4583B] text-[#111318] group-hover:text-white flex items-center justify-center shadow-[0_18px_40px_rgba(0,0,0,0.65)] transition-all duration-300 group-hover:scale-110">
                                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================
          SECTION 2 (BELOW VIDEO): GRAPHIC DESIGN — STACKED FULL-PREVIEW DECK
          ======================================================================== */}
      {focusMode !== 'video' && filteredGraphicProjects.length > 0 && (
        <section
          id="graphic-design-showcase"
          aria-label={language === 'bn' ? 'গ্রাফিক ডিজাইন সেকশন' : 'Graphic Design Showcase'}
          className="py-16 sm:py-24 border-b border-white/[0.07]"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Editorial Transition Heading matching Video End-Frame 00:05 */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-14">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-[#E4583B] block mb-2">
                  {language === 'bn'
                    ? 'ভিজ্যুয়াল সিস্টেম · গ্রাফিক ডিজাইন'
                    : 'VISUAL CRAFT · GRAPHIC DESIGN'}
                </span>
                <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#F4F0E8] tracking-tight leading-[1.08]">
                  {language === 'bn' ? 'গ্রাফিক ডিজাইন —' : "This is how it looks"}{' '}
                  <span className="font-editorial italic font-normal text-[#A7A298] block sm:inline">
                    {language === 'bn'
                      ? 'গ্রুপ ও পূর্ণ পোস্টার।'
                      : "when visual craft hits."}
                  </span>
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGraphicGroup('ALL')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    graphicGroup === 'ALL' ? 'glass-pill-cta' : 'glass-pill-ghost'
                  }`}
                >
                  {language === 'bn' ? 'সব গ্রুপ' : 'All Groups'}
                </button>
                {graphicGroups.map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setGraphicGroup(grp)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      graphicGroup === grp ? 'glass-pill-cta' : 'glass-pill-ghost'
                    }`}
                  >
                    {grp}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => navigateTo('design')}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full glass-pill-ghost text-xs font-semibold cursor-pointer whitespace-nowrap"
                >
                  <Palette className="w-3.5 h-3.5 text-[#E4583B]" />
                  <span>
                    {language === 'bn' ? `সব ডিজাইন (${totalGraphicCount})` : `All (${totalGraphicCount})`}
                  </span>
                  <StudioArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </div>
            </div>

            {/* Stacked Scroll Frames Container for Graphic Design */}
            <div className="relative space-y-6 md:space-y-14 pb-4 sm:pb-8">
              {filteredGraphicProjects.map((proj, idx) => (
                <GraphicStackedCard
                  key={proj.id || idx}
                  project={proj}
                  index={idx}
                  total={filteredGraphicProjects.length}
                  cardRef={(el) => {
                    graphicCardRefs.current[idx] = el;
                  }}
                  scrimRef={(el) => {
                    graphicScrimRefs.current[idx] = el;
                  }}
                  language={language}
                  loc={loc}
                  onOpenLightbox={onOpenLightbox}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
