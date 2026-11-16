import React, { useState, useEffect } from 'react';
import {
  Video,
  Palette,
  Eye,
  GraduationCap,
  Award,
  Wrench,
  MessageSquare,
  ExternalLink,
  Youtube
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useNavigation } from '../context/NavigationContext';
import { useDesignOverrides } from '../context/DesignOverridesContext';
import {
  ProjectItem,
  VideoShowcaseItem,
  CaseStudyItem,
  HomeSectionId
} from '../types/portfolio';
import { resolveAssetUrl } from '../utils/assetUrl';
import { normalizeDirectImageUrl, getProjectPosters } from '../lib/imageUrlResolver';
import { Tilt3DImageStage } from './common/Tilt3DImageStage';
import { Reveal3D } from './common/Reveal3D';
import { VideoParallaxCarousel } from './VideoParallaxCarousel';
import { StudioArrowRight, StudioGlassIcon } from './common/StudioIcon';
import { EditableElement } from './common/EditableElement';
import { StudioSectionShell } from './common/StudioSectionShell';
import { detectVideoType } from '../lib/videoUtils';
import { RevealContactPill } from './common/RevealContactPill';

interface HomeHighlightsProps {
  onOpenLightbox?: (project: ProjectItem, initialIndex?: number) => void;
  onOpenVideo?: (video: VideoShowcaseItem) => void;
}

const iconMap: Record<string, React.ElementType> = {
  GraduationCap,
  Award,
  Video,
  Palette,
  Wrench
};

const DEFAULT_HOME_ORDER: HomeSectionId[] = [
  'caseStudies',
  'videoShowcase',
  'graphicShowcase',
  'aboutPreview',
  'trustTestimonials',
  'overviewDirectory'
];

export const HomeHighlights: React.FC<HomeHighlightsProps> = ({
  onOpenLightbox,
  onOpenVideo
}) => {
  const { portfolio, ui, loc, language } = usePortfolio();
  const { navigateTo, focusMode } = useNavigation();
  const { sectionOrder: liveSectionOrder } = useDesignOverrides();

  const visibleVideos = [...(portfolio.videos || [])]
    .filter((v: any) => v.visible !== false && !v.hidden)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const visibleBestVideos = [...(portfolio.bestVideoWorks || [])]
    .filter((v: any) => v.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const [slideSource, setSlideSource] = useState<'projects' | 'best'>(
    visibleVideos.length > 0 ? 'projects' : 'best'
  );
  const [brokenGraphicIds, setBrokenGraphicIds] = useState<Record<string, boolean>>({});

  const visibleGraphicProjects = [...(portfolio.projects || [])]
    .filter((p: any) => p.category === 'graphic' && p.visible !== false && !p.hidden)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const visibleBestGraphic = [...(portfolio.bestGraphicWorks || [])]
    .filter((g: any) => g.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const spotlightGraphics: ProjectItem[] = (
    visibleBestGraphic.length > 0
      ? visibleBestGraphic.map((item, idx) => ({
          id: item.id || `home-bg-${idx}`,
          title: item.title,
          category: 'graphic_best' as const,
          description: { en: '', bn: '', ar: '' },
          coverImage: item.imageUrl,
          behanceUrl: item.behanceUrl,
          order: item.order
        }))
      : visibleGraphicProjects
  ).slice(0, 3);

  const totalVideoCount = visibleVideos.length + visibleBestVideos.length;
  const totalGraphicCount = visibleGraphicProjects.length + visibleBestGraphic.length;
  const overviewCards = portfolio.overviewCards || [];

  // Case study local tab follows global focusMode when changed
  const [caseCategory, setCaseCategory] = useState<'all' | 'video' | 'graphic' | 'motion'>('all');

  useEffect(() => {
    if (focusMode === 'video') {
      setCaseCategory('video');
    } else if (focusMode === 'graphic') {
      setCaseCategory('graphic');
    } else {
      setCaseCategory('all');
    }
  }, [focusMode]);

  const activeSlideVideos =
    slideSource === 'best' && visibleBestVideos.length > 0
      ? visibleBestVideos
      : visibleVideos.length > 0
      ? visibleVideos
      : visibleBestVideos;

  // Dynamic Case Studies from PortfolioContext
  const rawCaseStudies: CaseStudyItem[] = [...(portfolio.caseStudies || [])]
    .filter((cs) => cs.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const filteredCaseStudies = rawCaseStudies.filter((item) => {
    if (caseCategory === 'all') {
      if (focusMode === 'video') return item.category === 'video' || item.category === 'motion';
      if (focusMode === 'graphic') return item.category === 'graphic';
      return true;
    }
    if (caseCategory === 'video') {
      return item.category === 'video' || item.category === 'motion';
    }
    return item.category === caseCategory;
  });

  // Dynamic Home Stats & Toolkit
  const visibleStats = [...(portfolio.homeStats || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const homeTools = portfolio.homeTools && portfolio.homeTools.length > 0
    ? portfolio.homeTools
    : [
        'Adobe Premiere Pro',
        'Adobe After Effects',
        'Adobe Photoshop',
        'Adobe Illustrator',
        'AI Tools & Workflows',
        'Meta Ads Creative'
      ];

  // Dynamic Testimonials
  const visibleTestimonials = [...(portfolio.testimonials || [])]
    .filter((t) => t.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const handleOpenCaseStudy = (cs: CaseStudyItem) => {
    const isVideoWork = cs.category === 'video' || cs.category === 'motion';
    if (isVideoWork) {
      if (cs.videoUrl) {
        const videoPayload: VideoShowcaseItem = {
          id: cs.id,
          title: cs.title,
          description: cs.result,
          videoUrl: cs.videoUrl,
          videoType: cs.videoType || detectVideoType(cs.videoUrl),
          thumbnailUrl: cs.thumbnail
        };
        onOpenVideo?.(videoPayload);
        return;
      }
      const fallbackVideo = visibleVideos[0] || visibleBestVideos[0];
      if (fallbackVideo) {
        onOpenVideo?.(fallbackVideo as VideoShowcaseItem);
      } else {
        navigateTo('videos');
      }
    } else {
      const images =
        cs.galleryImages && cs.galleryImages.length > 0
          ? cs.galleryImages
          : cs.thumbnail
          ? [cs.thumbnail]
          : [];
      const fallbackProj = visibleGraphicProjects[0] || spotlightGraphics[0];
      const projectPayload: ProjectItem = {
        id: cs.id,
        title: cs.title,
        groupName: cs.categoryLabel,
        category: 'graphic',
        description: cs.result,
        coverImage: cs.thumbnail || fallbackProj?.coverImage || '/assets/jabir_profile.png',
        galleryImages: images.length > 0 ? images : fallbackProj?.galleryImages || [],
        behanceUrl: cs.behanceUrl || fallbackProj?.behanceUrl || portfolio.contact?.behanceUrl
      };
      onOpenLightbox?.(projectPayload, 0);
    }
  };

  // Resolve effective section ordering: Live Edit overrides take precedence, then PortfolioConfig, then defaults
  const baseOrder =
    liveSectionOrder && liveSectionOrder.length > 0
      ? liveSectionOrder
      : portfolio.homeSectionOrder && portfolio.homeSectionOrder.length > 0
      ? portfolio.homeSectionOrder
      : DEFAULT_HOME_ORDER;

  const effectiveSectionOrder: HomeSectionId[] = Array.from(
    new Set([...baseOrder, ...DEFAULT_HOME_ORDER])
  ).filter((id): id is HomeSectionId =>
    DEFAULT_HOME_ORDER.includes(id as HomeSectionId)
  );

  const isSectionVisible = (id: HomeSectionId) =>
    portfolio.homeSectionVisibility?.[id] !== false;

  const youtubeUrl =
    portfolio.contact?.youtubeUrl ||
    portfolio.channelLinks?.find((c) => c.id === 'ch-youtube')?.url;
  const behanceUrl =
    portfolio.contact?.behanceUrl ||
    portfolio.channelLinks?.find((c) => c.id === 'ch-behance')?.url;

  const renderSection = (sectionId: HomeSectionId) => {
    if (!isSectionVisible(sectionId)) return null;

    switch (sectionId) {
      case 'caseStudies': {
        if (portfolio.caseStudiesSection?.visible === false) return null;
        return (
          <StudioSectionShell
            key="caseStudies"
            id="case-studies"
            sectionBgKey="case-studies"
            customLayerTarget="case-studies"
            className="py-20 sm:py-24 bg-[#101217]/85 border-b border-white/[0.07]"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <Reveal3D direction="left">
                  <EditableElement
                    id="caseStudies.tag"
                    label="Case Studies Tag"
                    as="span"
                    className="text-[11px] font-sans uppercase tracking-[0.22em] text-[#E4583B] block mb-2"
                  >
                    {loc(portfolio.caseStudiesSection?.tag) ||
                      (language === 'bn' ? 'নির্বাচিত কেস স্টাডি' : 'Selected Case Studies')}
                  </EditableElement>
                  <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#F4F0E8] tracking-tight leading-[1.08]">
                    <EditableElement
                      id="caseStudies.titlePrefix"
                      label="Case Studies Title"
                      as="span"
                    >
                      {loc(portfolio.caseStudiesSection?.titlePrefix) ||
                        (language === 'bn' ? 'প্রজেক্ট ও ফলাফল' : 'Work That Delivers')}
                    </EditableElement>{' '}
                    <EditableElement
                      id="caseStudies.titleItalic"
                      label="Case Studies Accent Title"
                      as="span"
                      className="font-editorial italic font-normal text-[#DDD1BE]"
                    >
                      {loc(portfolio.caseStudiesSection?.titleItalic) ||
                        (language === 'bn' ? 'কেস স্টাডি' : 'real results.')}
                    </EditableElement>
                  </h2>
                </Reveal3D>

                {/* Category Filters: All, Video Editing, Graphic Design, Motion Graphics */}
                <Reveal3D direction="right" delay={80} className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'all', label: language === 'bn' ? 'সব কাজ' : 'All Works' },
                    { id: 'video', label: language === 'bn' ? 'ভিডিও এডিটিং' : 'Video Editing' },
                    { id: 'graphic', label: language === 'bn' ? 'গ্রাফিক ডিজাইন' : 'Graphic Design' },
                    { id: 'motion', label: language === 'bn' ? 'মোশন গ্রাফিক্স' : 'Motion Graphics' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setCaseCategory(tab.id as any)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        caseCategory === tab.id
                          ? 'glass-pill-cta'
                          : 'glass-pill-ghost text-[#A7A298] hover:text-[#F4F0E8]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </Reveal3D>
              </div>

              {filteredCaseStudies.length === 0 ? (
                <div className="p-10 rounded-[24px] glass-showcase-card text-center text-sm text-[#A7A298]">
                  {language === 'bn'
                    ? 'এই ক্যাটাগরিতে এখনো কোনো কেস স্টাডি যুক্ত করা হয়নি।'
                    : 'No case studies found in this category yet.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredCaseStudies.map((cs, idx) => {
                    const isVideoWork = cs.category === 'video' || cs.category === 'motion';
                    const catText =
                      loc(cs.categoryLabel) ||
                      (cs.category === 'video'
                        ? language === 'bn'
                          ? 'ভিডিও এডিটিং'
                          : 'Video Editing'
                        : cs.category === 'motion'
                        ? language === 'bn'
                          ? 'মোশন গ্রাফিক্স'
                          : 'Motion Graphics'
                        : language === 'bn'
                        ? 'গ্রাফিক ডিজাইন'
                        : 'Graphic Design');

                    return (
                      <Reveal3D key={cs.id} direction={idx % 2 === 0 ? 'left' : 'right'} delay={idx * 80}>
                        <article
                          onClick={() => handleOpenCaseStudy(cs)}
                          className="h-full group rounded-[24px] glass-showcase-card overflow-hidden flex flex-col justify-between cursor-pointer hover:-translate-y-1 transition-all duration-300"
                        >
                          <div className="p-2.5 bg-[#0D0E12]/70 border-b border-white/[0.07]">
                            <div className="relative aspect-[16/9] w-full rounded-[16px] overflow-hidden bg-[#14171E]">
                              <img
                                src={resolveAssetUrl(normalizeDirectImageUrl(cs.thumbnail) || '/assets/jaber_hero.png')}
                                alt={loc(cs.title)}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0E12]/80 via-transparent to-transparent" />
                              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#121419]/85 border border-white/10 text-[11px] font-medium text-[#EAE5DC]">
                                {catText}
                              </div>
                              <div className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-full glass-pill-cta text-xs font-semibold inline-flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                                <span>
                                  {isVideoWork
                                    ? language === 'bn'
                                      ? 'ভিডিও দেখুন'
                                      : 'Watch Reel'
                                    : language === 'bn'
                                    ? 'কেস স্টাডি দেখুন'
                                    : 'Inspect Visuals'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                            <div>
                              <EditableElement
                                id={`caseStudy.${cs.id}.title`}
                                label={`Case Study: ${loc(cs.title)}`}
                                as="h3"
                                className="text-lg sm:text-xl font-bold text-[#F4F0E8] mb-4 group-hover:text-white transition-colors"
                              >
                                {loc(cs.title)}
                              </EditableElement>

                              <div className="space-y-2.5 text-xs sm:text-sm">
                                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                  <span className="font-semibold text-[#E4583B] uppercase tracking-wider text-[11px] block mb-0.5">
                                    {language === 'bn' ? 'সমস্যা (Problem)' : 'Problem'}
                                  </span>
                                  <EditableElement
                                    id={`caseStudy.${cs.id}.problem`}
                                    label={`${loc(cs.title)} Problem`}
                                    as="p"
                                    className="text-[#DDD1BE] leading-relaxed"
                                  >
                                    {loc(cs.problem)}
                                  </EditableElement>
                                </div>

                                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                  <span className="font-semibold text-[#EAE5DC] uppercase tracking-wider text-[11px] block mb-0.5">
                                    {language === 'bn' ? 'প্রক্রিয়া (My Process)' : 'My Process'}
                                  </span>
                                  <EditableElement
                                    id={`caseStudy.${cs.id}.process`}
                                    label={`${loc(cs.title)} Process`}
                                    as="p"
                                    className="text-[#A7A298] leading-relaxed"
                                  >
                                    {loc(cs.process)}
                                  </EditableElement>
                                </div>

                                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                  <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px] block mb-0.5">
                                    {language === 'bn' ? 'ফলাফল (Result)' : 'Result'}
                                  </span>
                                  <EditableElement
                                    id={`caseStudy.${cs.id}.result`}
                                    label={`${loc(cs.title)} Result`}
                                    as="p"
                                    className="text-[#EAE5DC] leading-relaxed"
                                  >
                                    {loc(cs.result)}
                                  </EditableElement>
                                </div>
                              </div>
                            </div>

                            {((isVideoWork && cs.videoUrl) || (!isVideoWork && cs.behanceUrl)) && (
                              <div className="pt-2 flex items-center justify-between text-xs text-[#A7A298]">
                                <a
                                  href={isVideoWork ? cs.videoUrl : cs.behanceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center space-x-1.5 text-[#F07C63] hover:text-white transition-colors"
                                >
                                  <span>
                                    {isVideoWork
                                      ? language === 'bn'
                                        ? 'অরিজিনাল ভিডিও লিংক'
                                        : 'Open Source Video'
                                      : language === 'bn'
                                      ? 'Behance-এ দেখুন'
                                      : 'View on Behance'}
                                  </span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        </article>
                      </Reveal3D>
                    );
                  })}
                </div>
              )}
            </div>
          </StudioSectionShell>
        );
      }

      case 'videoShowcase': {
        if (focusMode === 'graphic' || activeSlideVideos.length === 0) return null;
        return (
          <StudioSectionShell
            key="videoShowcase"
            sectionBgKey="video-showcase"
            className="py-20 sm:py-24 bg-[#0D0E12]/78"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <Reveal3D direction="left">
                  <EditableElement
                    id="videoShowcase.tag"
                    label="Video Section Tag"
                    as="div"
                    className="text-[11px] font-sans uppercase tracking-[0.24em] text-[#9A958C] mb-2"
                  >
                    {ui.videos.sectionTag}
                  </EditableElement>
                  <EditableElement
                    id="videoShowcase.heading"
                    label="Video Section Title"
                    as="h2"
                    className="font-display text-3xl sm:text-5xl font-bold text-[#F4F0E8] tracking-tight leading-[1.08]"
                  >
                    {language === 'bn'
                      ? 'ভিডিও এডিটিং'
                      : language === 'ar'
                      ? 'معرض الفيديو'
                      : 'Selected Reels'}{' '}
                    <span className="font-editorial italic font-normal text-[#DDD1BE] block sm:inline mt-1 sm:mt-0">
                      {language === 'bn' ? 'শোকেস' : '& motion cuts.'}
                    </span>
                  </EditableElement>
                </Reveal3D>

                <Reveal3D direction="right" delay={100} className="flex flex-wrap items-center gap-3 shrink-0">
                  {youtubeUrl && (
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3.5 py-2 rounded-full bg-[#FF4B5C]/15 border border-[#FF4B5C]/40 text-xs font-medium text-[#F4F0E8] hover:bg-[#FF4B5C]/25 transition-colors"
                    >
                      <Youtube className="w-3.5 h-3.5 text-[#FF4B5C]" />
                      <span>YouTube Channel</span>
                    </a>
                  )}

                  {visibleVideos.length > 0 && visibleBestVideos.length > 0 && (
                    <div className="inline-flex items-center p-1 rounded-full glass-pill-ghost">
                      <button
                        type="button"
                        onClick={() => setSlideSource('projects')}
                        className={`px-3.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                          slideSource === 'projects'
                            ? 'bg-[#F4F0E8] text-[#111318]'
                            : 'text-[#A7A298] hover:text-[#F4F0E8]'
                        }`}
                      >
                        {ui.projects.tabVideo} ({visibleVideos.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSlideSource('best')}
                        className={`px-3.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                          slideSource === 'best'
                            ? 'bg-[#F4F0E8] text-[#111318]'
                            : 'text-[#A7A298] hover:text-[#F4F0E8]'
                        }`}
                      >
                        {language === 'bn' ? 'সেরা কাজ' : 'Best Work'} ({visibleBestVideos.length})
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => navigateTo('videos')}
                    className="inline-flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-full glass-pill-ghost text-xs font-medium transition-colors whitespace-nowrap cursor-pointer group"
                  >
                    <span>
                      {language === 'bn'
                        ? 'সব ভিডিও'
                        : language === 'ar'
                        ? 'عرض الكل'
                        : 'All Reels'}
                    </span>
                    <span className="text-[#8E8A82] tabular-nums">({totalVideoCount})</span>
                    <StudioArrowRight className="w-3.5 h-3.5 text-[#EAE5DC] group-hover:translate-x-0.5 transition-transform rtl:rotate-180" />
                  </button>
                </Reveal3D>
              </div>

              <Reveal3D direction="depth" delay={140}>
                <VideoParallaxCarousel
                  videos={activeSlideVideos}
                  onOpenVideo={onOpenVideo}
                  emptyPlaceholder={ui.projects.emptyPlaceholder}
                />
              </Reveal3D>
            </div>
          </StudioSectionShell>
        );
      }

      case 'graphicShowcase': {
        if (focusMode === 'video' || spotlightGraphics.length === 0) return null;
        return (
          <StudioSectionShell
            key="graphicShowcase"
            sectionBgKey="graphic-showcase"
            className="py-20 bg-[#14171E]/80 border-t border-white/[0.07]"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                <Reveal3D direction="left">
                  <EditableElement
                    id="graphicShowcase.tag"
                    label="Graphic Section Tag"
                    as="span"
                    className="text-[11px] font-sans text-[#9A958C] uppercase tracking-[0.22em] block mb-2"
                  >
                    {language === 'bn' ? 'গ্রাফিক ডিজাইন হাইলাইটস' : language === 'ar' ? 'أبرز أعمال التصميم' : 'Visual & Print Direction'}
                  </EditableElement>
                  <EditableElement
                    id="graphicShowcase.title"
                    label="Graphic Section Title"
                    as="h2"
                    className="font-display text-2xl sm:text-4xl font-bold text-[#F4F0E8] tracking-tight"
                  >
                    {language === 'bn'
                      ? 'ভিজ্যুয়াল ডিজাইন ও পোস্টার'
                      : language === 'ar'
                      ? 'التصميم الجرافيكي والهويات'
                      : 'Graphic Design Archive'}
                  </EditableElement>
                </Reveal3D>

                <Reveal3D direction="right" delay={100} className="flex flex-wrap items-center gap-2.5">
                  {behanceUrl && (
                    <a
                      href={behanceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-[#0057FF]/15 border border-[#0057FF]/40 text-xs font-medium text-[#F4F0E8] hover:bg-[#0057FF]/25 transition-colors"
                    >
                      <span className="font-bold text-[#60A5FA]">Bē</span>
                      <span>Behance Portfolio</span>
                      <ExternalLink className="w-3 h-3 text-[#93C5FD]" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => navigateTo('design')}
                    className="inline-flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-full glass-pill-ghost text-xs font-medium self-start md:self-auto whitespace-nowrap cursor-pointer group"
                  >
                    <span>
                      {language === 'bn' ? 'সব ডিজাইন' : language === 'ar' ? 'كل التصاميم' : 'Open Gallery'}
                    </span>
                    <span className="text-[#8E8A82] tabular-nums">({totalGraphicCount})</span>
                    <StudioArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </Reveal3D>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {spotlightGraphics.map((proj, idx) => {
                  const imgKey = proj.id || `sg-${idx}`;
                  const posters = getProjectPosters(proj);
                  const cleanCover = posters[0]?.url || normalizeDirectImageUrl(proj.coverImage);
                  const hasBroken = brokenGraphicIds[imgKey];
                  const posterCount = posters.length;

                  const dir = idx === 0 ? 'left' : idx === 2 ? 'right' : 'up';

                  return (
                    <Reveal3D key={imgKey} direction={dir} delay={idx * 95}>
                      <div
                        onClick={() => onOpenLightbox?.(proj, 0)}
                        data-cursor="view"
                        className="h-full group rounded-[22px] glass-showcase-card overflow-hidden cursor-pointer flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300"
                      >
                        <div className="p-2.5 bg-[#0D0E12]/70 border-b border-white/[0.07]">
                          {posterCount >= 2 ? (
                            <Tilt3DImageStage className="aspect-[16/10] w-full" maxTilt={11} scaleOnHover={1.02}>
                              <div
                                className={`relative w-full h-full rounded-[14px] bg-[#14171E] overflow-hidden grid gap-1 p-1 ${
                                  posterCount === 2 ? 'grid-cols-2' : 'grid-cols-3'
                                }`}
                              >
                                {posters.slice(0, 3).map((poster, pIdx) => {
                                  const tileKey = `${imgKey}-t-${pIdx}`;
                                  return (
                                    <button
                                      key={tileKey}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenLightbox?.(proj, pIdx);
                                      }}
                                      className="relative w-full h-full rounded-lg overflow-hidden bg-black/40 group/tile cursor-pointer"
                                      title={poster.caption || `Poster ${pIdx + 1}`}
                                    >
                                      {!brokenGraphicIds[tileKey] ? (
                                        <img
                                          src={resolveAssetUrl(poster.url)}
                                          alt={poster.caption || loc(proj.title)}
                                          loading="lazy"
                                          className="w-full h-full object-cover group-hover/tile:scale-105 transition-transform duration-500"
                                          referrerPolicy="no-referrer"
                                          onError={() => setBrokenGraphicIds((prev) => ({ ...prev, [tileKey]: true }))}
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#8E8A82]">
                                          <Palette className="w-4 h-4" strokeWidth={1.35} />
                                        </div>
                                      )}
                                      {pIdx === 2 && posterCount > 3 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-semibold text-[#F4F0E8]">
                                          +{posterCount - 3}
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </Tilt3DImageStage>
                          ) : (
                            <Tilt3DImageStage className="aspect-[16/10] w-full" maxTilt={13} scaleOnHover={1.03}>
                              <div className="relative w-full h-full rounded-[14px] bg-[#14171E] overflow-hidden flex items-center justify-center">
                                {cleanCover && !hasBroken ? (
                                  <img
                                    src={resolveAssetUrl(cleanCover)}
                                    alt={loc(proj.title)}
                                    loading="lazy"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    referrerPolicy="no-referrer"
                                    onError={() => setBrokenGraphicIds((prev) => ({ ...prev, [imgKey]: true }))}
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-5 bg-[#14171E]">
                                    <StudioGlassIcon size="md" className="mb-2">
                                      <Palette className="w-4 h-4" strokeWidth={1.35} />
                                    </StudioGlassIcon>
                                    <span className="text-xs text-[#DDD1BE] font-medium line-clamp-1">
                                      {loc(proj.title)}
                                    </span>
                                    <span className="text-[10px] text-[#8E8A82] mt-0.5">
                                      {proj.behanceUrl ? 'Behance Visual Project' : 'Graphic Design'}
                                    </span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-1.5 rounded-full glass-pill-ghost text-xs font-medium">
                                    <Eye className="w-3.5 h-3.5" strokeWidth={1.4} />
                                    <span>{language === 'bn' ? 'দেখুন' : 'Preview'}</span>
                                  </span>
                                </div>
                              </div>
                            </Tilt3DImageStage>
                          )}
                        </div>

                        <div className="p-5 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-xs text-[#8E8A82] mb-1 flex items-center gap-1.5">
                              <span>{loc(proj.groupName) || (language === 'bn' ? 'গ্রাফিক ডিজাইন' : 'Graphic Design')}</span>
                              {posterCount > 1 && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-[#EAE5DC] tabular-nums">{posterCount} Posters</span>
                                </>
                              )}
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-[#F4F0E8] group-hover:text-white transition-colors truncate">
                              {loc(proj.title)}
                            </h3>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateTo('design');
                            }}
                            className="w-9 h-9 rounded-full glass-icon-disc flex items-center justify-center shrink-0"
                            aria-label={language === 'bn' ? 'গ্যালারি' : 'Gallery'}
                          >
                            <StudioArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                          </button>
                        </div>
                      </div>
                    </Reveal3D>
                  );
                })}
              </div>
            </div>
          </StudioSectionShell>
        );
      }

      case 'aboutPreview': {
        return (
          <StudioSectionShell
            key="aboutPreview"
            id="about-preview"
            sectionBgKey="about-preview"
            customLayerTarget="about-preview"
            className="py-20 bg-[#0E1015]/85 border-t border-white/[0.07]"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <Reveal3D direction="left" className="lg:col-span-4 flex justify-center">
                  <EditableElement id="aboutPreview.portrait" label="About Preview Portrait" as="div">
                    <div className="relative w-64 sm:w-72 aspect-[4/5] rounded-[24px] glass-showcase-card p-2.5 overflow-hidden">
                      <img
                        src={resolveAssetUrl(normalizeDirectImageUrl(portfolio.about?.avatarUrl) || '/assets/jabir_profile.png')}
                        alt="Md. Jaber Hosain — Video Editor and Graphic Designer portrait"
                        loading="lazy"
                        className="w-full h-full object-cover object-top rounded-[18px]"
                      />
                    </div>
                  </EditableElement>
                </Reveal3D>

                <Reveal3D direction="right" delay={90} className="lg:col-span-8 space-y-5">
                  <EditableElement
                    id="aboutPreview.tag"
                    label="About Tag"
                    as="span"
                    className="text-[11px] font-sans uppercase tracking-[0.22em] text-[#E4583B] block"
                  >
                    {language === 'bn' ? 'আমার সম্পর্কে' : 'About Me'}
                  </EditableElement>
                  <EditableElement
                    id="aboutPreview.heading"
                    label="About Headline"
                    as="h2"
                    className="font-display text-2xl sm:text-4xl font-bold text-[#F4F0E8] tracking-tight"
                  >
                    {language === 'bn'
                      ? 'হ্যালো, আমি মো. জাবির হোসেন — আপনার ক্রিয়েটিভ পার্টনার'
                      : "Hi, I'm Md. Jaber Hosain — crafting visuals that connect & convert."}
                  </EditableElement>
                  <EditableElement
                    id="aboutPreview.bio"
                    label="About Biography"
                    as="p"
                    className="text-sm sm:text-base text-[#DDD1BE] leading-relaxed max-w-2xl"
                  >
                    {loc(portfolio.about?.bio)}
                  </EditableElement>

                  {/* Core Tools & Software Pills */}
                  <div className="pt-2">
                    <div className="text-xs uppercase tracking-wider text-[#9A958C] mb-3">
                      {language === 'bn' ? 'মূল দক্ষতা ও টুলস' : 'Core Skills & Creative Toolkit'}
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {homeTools.map((tool, idx) => (
                        <EditableElement
                          key={`${tool}-${idx}`}
                          id={`homeTools.${idx}`}
                          label={`Tool Pill: ${tool}`}
                          as="span"
                          className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.09] text-xs font-medium text-[#F4F0E8]"
                        >
                          {tool}
                        </EditableElement>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigateTo('about')}
                      className="inline-flex items-center space-x-2 rtl:space-x-reverse px-5 py-2.5 rounded-full glass-pill-ghost text-xs font-medium cursor-pointer"
                    >
                      <span>{language === 'bn' ? 'বিস্তারিত প্রোফাইল ও সিভি' : 'Full Bio & CV'}</span>
                      <StudioArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </button>
                  </div>
                </Reveal3D>
              </div>
            </div>
          </StudioSectionShell>
        );
      }

      case 'trustTestimonials': {
        const showStats = portfolio.showHomeStats !== false && visibleStats.length > 0;
        const showTestimonials =
          portfolio.testimonialsSection?.visible !== false && visibleTestimonials.length > 0;
        if (!showStats && !showTestimonials) return null;

        return (
          <StudioSectionShell
            key="trustTestimonials"
            id="trust-testimonials"
            sectionBgKey="trust-testimonials"
            customLayerTarget="trust-testimonials"
            className="py-20 bg-[#121419]/80 border-t border-white/[0.07]"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
              {/* Editable Trust Stats Row */}
              {showStats && (
                <div
                  className={`grid grid-cols-1 gap-6 ${
                    visibleStats.length === 1
                      ? 'sm:grid-cols-1 max-w-md mx-auto'
                      : visibleStats.length === 2
                      ? 'sm:grid-cols-2 max-w-3xl mx-auto'
                      : 'sm:grid-cols-3'
                  }`}
                >
                  {visibleStats.map((stat, idx) => (
                    <Reveal3D key={stat.id || idx} direction="up" delay={idx * 70}>
                      <div className="p-6 rounded-[22px] glass-showcase-card text-center">
                        <EditableElement
                          id={`homeStat.${stat.id}.value`}
                          label={`Stat Value: ${stat.value}`}
                          as="div"
                          className="font-display text-3xl sm:text-4xl font-extrabold text-[#F4F0E8] tabular-nums"
                        >
                          {stat.value}
                        </EditableElement>
                        <EditableElement
                          id={`homeStat.${stat.id}.label`}
                          label={`Stat Label: ${loc(stat.label)}`}
                          as="div"
                          className="text-xs uppercase tracking-[0.18em] text-[#A7A298] mt-2"
                        >
                          {loc(stat.label)}
                        </EditableElement>
                      </div>
                    </Reveal3D>
                  ))}
                </div>
              )}

              {/* Client Testimonials */}
              {showTestimonials && (
                <div>
                  <Reveal3D direction="up" className="text-center max-w-2xl mx-auto mb-10">
                    <EditableElement
                      id="testimonials.tag"
                      label="Testimonials Tag"
                      as="span"
                      className="text-[11px] font-sans uppercase tracking-[0.22em] text-[#E4583B] block mb-2"
                    >
                      {loc(portfolio.testimonialsSection?.tag) ||
                        (language === 'bn' ? 'ক্লায়েন্টদের মতামত' : 'Client Trust & Feedback')}
                    </EditableElement>
                    <EditableElement
                      id="testimonials.title"
                      label="Testimonials Heading"
                      as="h2"
                      className="font-display text-2xl sm:text-4xl font-bold text-[#F4F0E8] tracking-tight"
                    >
                      {loc(portfolio.testimonialsSection?.title) ||
                        (language === 'bn' ? 'ক্লায়েন্টরা যা বলেন' : 'What Clients & Collaborators Say')}
                    </EditableElement>
                  </Reveal3D>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {visibleTestimonials.map((item, idx) => (
                      <Reveal3D key={item.id} direction="up" delay={idx * 85}>
                        <div className="h-full p-6 rounded-[22px] glass-showcase-card flex flex-col justify-between space-y-5">
                          <EditableElement
                            id={`testimonial.${item.id}.quote`}
                            label={`Quote by ${item.clientName}`}
                            as="p"
                            className="text-xs sm:text-sm text-[#DDD1BE] leading-relaxed italic"
                          >
                            “{loc(item.quote)}”
                          </EditableElement>
                          <div className="pt-4 border-t border-white/[0.08]">
                            <EditableElement
                              id={`testimonial.${item.id}.name`}
                              label={`Client Name: ${item.clientName}`}
                              as="div"
                              className="text-sm font-semibold text-[#F4F0E8]"
                            >
                              {item.clientName}
                            </EditableElement>
                            <EditableElement
                              id={`testimonial.${item.id}.role`}
                              label={`Client Role`}
                              as="div"
                              className="text-xs text-[#9A958C]"
                            >
                              {loc(item.clientRole)}
                            </EditableElement>
                          </div>
                        </div>
                      </Reveal3D>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </StudioSectionShell>
        );
      }

      case 'overviewDirectory': {
        const filteredOverviewCards = overviewCards.filter((card) => {
          if (focusMode === 'video' && (card.icon === 'Palette' || card.id === 'ov-4')) {
            return false;
          }
          if (focusMode === 'graphic' && (card.icon === 'Video' || card.id === 'ov-3')) {
            return false;
          }
          return true;
        });

        if (filteredOverviewCards.length === 0) return null;
        return (
          <StudioSectionShell
            key="overviewDirectory"
            sectionBgKey="overview-directory"
            className="py-20 bg-[#121419]/75 border-t border-white/[0.07]"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
                <Reveal3D direction="left">
                  <EditableElement
                    id="directory.tag"
                    label="Directory Tag"
                    as="span"
                    className="text-[11px] font-sans text-[#9A958C] uppercase tracking-[0.22em] block mb-2"
                  >
                    {language === 'bn' ? 'পোর্টফোলিও ডিরেক্টরি' : language === 'ar' ? 'أقسام الموقع' : 'Explore Studio'}
                  </EditableElement>
                  <EditableElement
                    id="directory.heading"
                    label="Directory Heading"
                    as="h2"
                    className="font-display text-2xl sm:text-3xl font-bold text-[#F4F0E8] tracking-tight"
                  >
                    {language === 'bn'
                      ? 'ওয়েবসাইটের প্রতিটি পেজ ভিজিট করুন'
                      : language === 'ar'
                      ? 'تصفح صفحات المعرض'
                      : 'Navigate Dedicated Pages'}
                  </EditableElement>
                </Reveal3D>
                <Reveal3D direction="right" delay={100}>
                  <button
                    type="button"
                    onClick={() => navigateTo('about')}
                    className="text-xs font-medium text-[#EAE5DC] hover:text-white inline-flex items-center space-x-2 rtl:space-x-reverse self-start sm:self-auto cursor-pointer group"
                  >
                    <span>{language === 'bn' ? 'আমার সম্পর্কে বিস্তারিত' : 'Full Bio & Education'}</span>
                    <StudioArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </Reveal3D>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOverviewCards.map((card, idx) => {
                  const Icon = iconMap[card.icon] || Award;
                  const handleCardClick = (e: React.MouseEvent) => {
                    e.preventDefault();
                    if (card.icon === 'Palette' || card.id === 'ov-4') {
                      navigateTo('design');
                    } else if (card.icon === 'Video' || card.id === 'ov-3') {
                      navigateTo('videos');
                    } else {
                      navigateTo(card.linkTarget);
                    }
                  };

                  const col = idx % 3;
                  const dir = col === 0 ? 'tilt-left' : col === 2 ? 'tilt-right' : 'up';

                  return (
                    <Reveal3D key={card.id} direction={dir} delay={(idx % 3) * 85}>
                      <a
                        href={card.linkTarget}
                        onClick={handleCardClick}
                        className="h-full group p-6 rounded-[22px] glass-showcase-card-muted hover:-translate-y-1 flex flex-col justify-between transition-all duration-300"
                      >
                        <div>
                          <StudioGlassIcon size="md" className="mb-5">
                            <Icon className="w-4 h-4" strokeWidth={1.35} />
                          </StudioGlassIcon>
                          <EditableElement
                            id={`overviewCard.${card.id}.title`}
                            label={`Directory Card: ${loc(card.title)}`}
                            as="h3"
                            className="text-base sm:text-lg font-semibold text-[#F4F0E8] mb-2 group-hover:text-white transition-colors"
                          >
                            {loc(card.title)}
                          </EditableElement>
                          <EditableElement
                            id={`overviewCard.${card.id}.desc`}
                            label={`Directory Description`}
                            as="p"
                            className="text-xs sm:text-sm text-[#A7A298] mb-6 leading-relaxed"
                          >
                            {loc(card.description)}
                          </EditableElement>
                        </div>
                        <span className="inline-flex items-center space-x-2 rtl:space-x-reverse text-xs font-medium text-[#EAE5DC] group-hover:text-white">
                          <span>{loc(card.linkText)}</span>
                          <StudioArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </a>
                    </Reveal3D>
                  );
                })}
              </div>
            </div>
          </StudioSectionShell>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="bg-transparent border-t border-white/[0.08]">
      {effectiveSectionOrder.map((secId) => renderSection(secId))}

      {/* Direct Contact Bridge: Email, WhatsApp, Behance & "Let's work together" */}
      <StudioSectionShell
        id="contact-cta"
        sectionBgKey="contact-cta"
        className="py-20 bg-[#14171E]/85 border-t border-white/[0.07]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal3D direction="depth">
            <div className="p-8 sm:p-12 rounded-[26px] glass-showcase-card flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <EditableElement
                  id="contactCta.tag"
                  label="Contact CTA Tag"
                  as="span"
                  className="text-[11px] font-sans text-[#E4583B] uppercase tracking-[0.22em] block mb-2"
                >
                  {language === 'bn' ? 'সরাসরি যোগাযোগ করুন' : "Let's Work Together"}
                </EditableElement>
                <EditableElement
                  id="contactCta.title"
                  label="Contact CTA Heading"
                  as="h2"
                  className="font-display text-2xl sm:text-4xl font-bold text-[#F4F0E8] tracking-tight mb-3"
                >
                  {language === 'bn'
                    ? 'চলুন একসাথে আপনার পরবর্তী প্রজেক্ট শুরু করি'
                    : "Let's work together on your next visual project."}
                </EditableElement>
                <EditableElement
                  id="contactCta.subtitle"
                  label="Contact CTA Subtitle"
                  as="p"
                  className="text-sm text-[#DDD1BE] leading-relaxed mb-5"
                >
                  {language === 'bn'
                    ? 'ইমেইল, হোয়াটসঅ্যাপ অথবা বিহ্যান্সে সরাসরি যুক্ত হোন। আমি ২৪ ঘণ্টার মধ্যে উত্তর দিই।'
                    : 'Reach out directly via Email, WhatsApp, or Behance for video editing, motion graphics, and brand design inquiries.'}
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
                      className="px-4 py-2.5 rounded-full bg-white/[0.05] border border-white/10 text-[#F4F0E8] hover:border-[#FF4B5C] transition-colors"
                    >
                      YouTube Channel
                    </a>
                  )}
                  {focusMode !== 'video' && (
                    <a
                      href={behanceUrl || 'https://www.behance.net/jaberhosain'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-full bg-white/[0.05] border border-white/10 text-[#F4F0E8] hover:border-white/30 transition-colors"
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
                  <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                  <span>{language === 'bn' ? 'একসাথে কাজ করি' : "Let's Work Together"}</span>
                </button>
              </div>
            </div>
          </Reveal3D>
        </div>
      </StudioSectionShell>
    </div>
  );
};
