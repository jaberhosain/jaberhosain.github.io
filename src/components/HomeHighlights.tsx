import React, { useState } from 'react';
import {
  Video,
  Palette,
  Eye,
  GraduationCap,
  Award,
  Wrench,
  MessageSquare
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useNavigation } from '../context/NavigationContext';
import { ProjectItem, VideoShowcaseItem } from '../types/portfolio';
import { resolveAssetUrl } from '../utils/assetUrl';
import { normalizeDirectImageUrl, getProjectPosters } from '../lib/imageUrlResolver';
import { Tilt3DImageStage } from './common/Tilt3DImageStage';
import { Reveal3D } from './common/Reveal3D';
import { VideoParallaxCarousel } from './VideoParallaxCarousel';
import { StudioArrowRight, StudioGlassIcon } from './common/StudioIcon';

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

export const HomeHighlights: React.FC<HomeHighlightsProps> = ({
  onOpenLightbox,
  onOpenVideo
}) => {
  const { portfolio, ui, loc, language } = usePortfolio();
  const { navigateTo } = useNavigation();

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
  const services = portfolio.services || [];
  const overviewCards = portfolio.overviewCards || [];

  const activeSlideVideos =
    slideSource === 'best' && visibleBestVideos.length > 0
      ? visibleBestVideos
      : visibleVideos.length > 0
      ? visibleVideos
      : visibleBestVideos;

  return (
    <div className="bg-transparent border-t border-white/[0.08]">
      {/* 1. Video Portfolio Smoked-Glass 3D Slide Showcase */}
      {activeSlideVideos.length > 0 && (
        <section className="py-20 sm:py-24 bg-[#0D0E12]/78 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <Reveal3D direction="left">
                <div className="text-[11px] font-sans uppercase tracking-[0.24em] text-[#9A958C] mb-2">
                  {ui.videos.sectionTag}
                </div>
                <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#F4F0E8] tracking-tight leading-[1.08]">
                  {language === 'bn'
                    ? 'ভিডিও এডিটিং'
                    : language === 'ar'
                    ? 'معرض الفيديو'
                    : 'Selected Reels'}{' '}
                  <span className="font-editorial italic font-normal text-[#DDD1BE] block sm:inline mt-1 sm:mt-0">
                    {language === 'bn' ? 'শোকেস' : '& motion cuts.'}
                  </span>
                </h2>
              </Reveal3D>

              <Reveal3D direction="right" delay={100} className="flex flex-wrap items-center gap-3 shrink-0">
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
        </section>
      )}

      {/* 2. Graphic Design Spotlight Preview */}
      {spotlightGraphics.length > 0 && (
        <section className="py-20 bg-[#14171E]/80 border-t border-white/[0.07]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <Reveal3D direction="left">
                <span className="text-[11px] font-sans text-[#9A958C] uppercase tracking-[0.22em] block mb-2">
                  {language === 'bn' ? 'গ্রাফিক ডিজাইন হাইলাইটস' : language === 'ar' ? 'أبرز أعمال التصميم' : 'Visual & Print Direction'}
                </span>
                <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#F4F0E8] tracking-tight">
                  {language === 'bn'
                    ? 'ভিজ্যুয়াল ডিজাইন ও পোস্টার'
                    : language === 'ar'
                    ? 'التصميم الجرافيكي والهويات'
                    : 'Graphic Design Archive'}
                </h2>
              </Reveal3D>

              <Reveal3D direction="right" delay={100}>
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
        </section>
      )}

      {/* 3. Page Directory Gateway */}
      {overviewCards.length > 0 && (
        <section className="py-20 bg-[#121419]/75 border-t border-white/[0.07]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <Reveal3D direction="left">
                <span className="text-[11px] font-sans text-[#9A958C] uppercase tracking-[0.22em] block mb-2">
                  {language === 'bn' ? 'পোর্টফোলিও ডিরেক্টরি' : language === 'ar' ? 'أقسام الموقع' : 'Explore Studio'}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F0E8] tracking-tight">
                  {language === 'bn'
                    ? 'ওয়েবসাইটের প্রতিটি পেজ ভিজিট করুন'
                    : language === 'ar'
                    ? 'تصفح صفحات المعرض'
                    : 'Navigate Dedicated Pages'}
                </h2>
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
              {overviewCards.map((card, idx) => {
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
                        <h3 className="text-base sm:text-lg font-semibold text-[#F4F0E8] mb-2 group-hover:text-white transition-colors">
                          {loc(card.title)}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#A7A298] mb-6 leading-relaxed">
                          {loc(card.description)}
                        </p>
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
        </section>
      )}

      {/* 4. Services & Direct Contact Bridge */}
      <section className="py-20 bg-[#14171E]/80 border-t border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal3D direction="depth">
            <div className="p-8 sm:p-12 rounded-[26px] glass-showcase-card flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <span className="text-[11px] font-sans text-[#9A958C] uppercase tracking-[0.22em] block mb-2">
                  {language === 'bn' ? 'সেবা ও সহযোগিতা' : 'Services & Collaboration'}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F0E8] tracking-tight mb-3">
                  {portfolio.contactForm?.projectPitchTitle
                    ? loc(portfolio.contactForm.projectPitchTitle)
                    : language === 'bn'
                    ? 'আপনার প্রজেক্ট নিয়ে কাজ করতে প্রস্তুত?'
                    : 'Have a Project in Mind?'}
                </h2>
                <p className="text-sm text-[#A7A298] leading-relaxed mb-4">
                  {portfolio.contactForm?.projectPitchSubtitle
                    ? loc(portfolio.contactForm.projectPitchSubtitle)
                    : language === 'bn'
                    ? 'আপনার ব্র্যান্ড বা চ্যানেলের জন্য ভিডিও এডিটিং কিংবা গ্রাফিক ডিজাইনের প্রয়োজন হলে সরাসরি বার্তা পাঠান।'
                    : "Let's collaborate on your next video edit or graphic design visual."}
                </p>

                {services.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#DDD1BE]">
                    {services.map((srv, idx) => (
                      <React.Fragment key={srv.id}>
                        {idx > 0 && <span className="text-white/20" aria-hidden="true">·</span>}
                        <span>{loc(srv.title)}</span>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => navigateTo('skills')}
                  className="px-5 py-2.5 rounded-full text-xs font-medium glass-pill-ghost cursor-pointer"
                >
                  {language === 'bn' ? 'দক্ষতা ও সেবা দেখুন' : 'View Skills & Proof'}
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('contact')}
                  className="inline-flex items-center space-x-2 rtl:space-x-reverse px-6 py-2.5 rounded-full text-xs font-semibold glass-pill-cta cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>{language === 'bn' ? 'যোগাযোগ করুন' : 'Start a Conversation'}</span>
                </button>
              </div>
            </div>
          </Reveal3D>
        </div>
      </section>
    </div>
  );
};

