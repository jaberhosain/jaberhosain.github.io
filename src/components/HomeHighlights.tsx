import React, { useState } from 'react';
import {
  Video,
  Palette,
  ArrowRight,
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
import { normalizeDirectImageUrl } from '../lib/imageUrlResolver';
import { Tilt3DImageStage } from './common/Tilt3DImageStage';
import { Reveal3D } from './common/Reveal3D';
import { VideoParallaxCarousel } from './VideoParallaxCarousel';

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
    <div className="bg-transparent border-t border-[#2B303D]">
      {/* 1. Video Portfolio 3D Parallax Slide Showcase */}
      {activeSlideVideos.length > 0 && (
        <section className="py-20 sm:py-24 bg-[#121419]/75 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <Reveal3D direction="left">
                <div className="text-xs font-mono text-[#E4583B] uppercase tracking-[0.2em] mb-2.5">
                  {ui.videos.sectionTag}
                </div>
                <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-[#F4F0E8] tracking-tight leading-[1.08]">
                  {language === 'bn'
                    ? 'ভিডিও পোর্টফোলিও'
                    : language === 'ar'
                    ? 'معرض الفيديو'
                    : 'Video Portfolio'}{' '}
                  <span className="font-editorial italic lowercase font-normal text-[#DDD1BE] block sm:inline mt-1 sm:mt-0">
                    3D parallax.
                  </span>
                </h2>
                <p className="mt-2.5 text-xs sm:text-sm text-[#A7A298] max-w-2xl leading-relaxed">
                  {language === 'bn'
                    ? 'স্পিড কন্ট্রোল ব্যবহার করে থ্রিডি স্লাইডে ভিডিও দেখুন, অথবা সব ভিডিও একসাথে দেখতে ভিডিও পেজে যান।'
                    : 'Browse cuts inside the 3D parallax carousel with speed controls, or explore the full video catalog.'}
                </p>
              </Reveal3D>

              <Reveal3D direction="right" delay={100} className="flex flex-wrap items-center gap-3 shrink-0">
                {visibleVideos.length > 0 && visibleBestVideos.length > 0 && (
                  <div className="inline-flex items-center p-1 rounded-lg bg-[#181B22] border border-[#2B303D]">
                    <button
                      type="button"
                      onClick={() => setSlideSource('projects')}
                      className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-colors whitespace-nowrap cursor-pointer ${
                        slideSource === 'projects'
                          ? 'bg-[#E4583B] text-white'
                          : 'text-[#A7A298] hover:text-[#F4F0E8]'
                      }`}
                    >
                      {ui.projects.tabVideo} ({visibleVideos.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlideSource('best')}
                      className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-colors whitespace-nowrap cursor-pointer ${
                        slideSource === 'best'
                          ? 'bg-[#E4583B] text-white'
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
                  className="inline-flex items-center space-x-2 rtl:space-x-reverse px-4 py-2.5 rounded-lg bg-[#181B22] border border-[#2B303D] hover:border-[#E4583B] text-xs font-mono font-bold text-[#F4F0E8] transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5 text-[#E4583B]" />
                  <span>
                    {language === 'bn'
                      ? 'সব ভিডিও দেখুন'
                      : language === 'ar'
                      ? 'عرض جميع الفيديوهات'
                      : 'All Videos Grid'}
                  </span>
                  <span className="text-[#A7A298] tabular-nums">({totalVideoCount})</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#E4583B] rtl:rotate-180" />
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

      {/* 2. Graphic Design Spotlight Preview (Mobbin-Grade Curation) */}
      {spotlightGraphics.length > 0 && (
        <section className="py-20 bg-[#14171E]/80 border-t border-[#2B303D]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <Reveal3D direction="left">
                <span className="text-xs font-mono text-[#E4583B] uppercase tracking-[0.2em] block mb-2">
                  {language === 'bn' ? 'গ্রাফিক ডিজাইন হাইলাইটস' : language === 'ar' ? 'أبرز أعمال التصميم' : 'Graphic Design Preview'}
                </span>
                <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#F4F0E8] tracking-tight">
                  {language === 'bn'
                    ? 'ভিজ্যুয়াল ডিজাইন ও পোস্টার'
                    : language === 'ar'
                    ? 'التصميم الجرافيكي والهويات'
                    : 'Visual & Graphic Design'}
                </h2>
              </Reveal3D>

              <Reveal3D direction="right" delay={100}>
                <button
                  type="button"
                  onClick={() => navigateTo('design')}
                  className="inline-flex items-center space-x-2 rtl:space-x-reverse px-4 py-2.5 rounded-lg bg-[#181B22] border border-[#2B303D] hover:border-[#E4583B] text-xs font-mono font-bold text-[#F4F0E8] transition-colors self-start md:self-auto whitespace-nowrap cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5 text-[#E4583B]" />
                  <span>
                    {language === 'bn' ? 'সব ডিজাইন দেখুন' : language === 'ar' ? 'كل التصاميم' : 'Open Design Gallery'}
                  </span>
                  <span className="text-[#A7A298] tabular-nums">({totalGraphicCount})</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#E4583B] rtl:rotate-180" />
                </button>
              </Reveal3D>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {spotlightGraphics.map((proj, idx) => {
                const imgKey = proj.id || `sg-${idx}`;
                const cleanCover = normalizeDirectImageUrl(proj.coverImage);
                const hasBroken = brokenGraphicIds[imgKey];
                const posterCount = Array.from(
                  new Set(
                    [cleanCover, ...(proj.galleryImages || []).map(normalizeDirectImageUrl)].filter(Boolean)
                  )
                ).length;

                const dir = idx === 0 ? 'left' : idx === 2 ? 'right' : 'up';

                return (
                  <Reveal3D key={imgKey} direction={dir} delay={idx * 95}>
                    <div
                      onClick={() => onOpenLightbox?.(proj, 0)}
                      data-cursor="view"
                      className="h-full group rounded-2xl studio-card overflow-hidden cursor-pointer flex flex-col justify-between hover:-translate-y-1"
                    >
                      <div className="p-2.5 bg-[#121419]/90 border-b border-[#2B303D]">
                        <Tilt3DImageStage className="aspect-[16/10] w-full" maxTilt={13} scaleOnHover={1.03}>
                          <div className="relative w-full h-full rounded-xl bg-[#20242E] overflow-hidden flex items-center justify-center">
                            {cleanCover && !hasBroken ? (
                              <img
                                src={resolveAssetUrl(cleanCover)}
                                alt={loc(proj.title)}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                                onError={() => setBrokenGraphicIds((prev) => ({ ...prev, [imgKey]: true }))}
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-center p-5 bg-[#181B22]">
                                <div className="w-11 h-11 rounded-xl bg-[#20242E] border border-[#2B303D] flex items-center justify-center text-[#E4583B] mb-2">
                                  <Palette className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-mono text-[#DDD1BE] font-semibold line-clamp-1">
                                  {loc(proj.title)}
                                </span>
                                <span className="text-[10px] font-mono text-[#A7A298] mt-0.5">
                                  {proj.behanceUrl ? 'Behance Visual Project' : 'Graphic Design'}
                                </span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-lg bg-[#121419]/95 border border-[#E4583B]/60 text-[#F4F0E8] text-xs font-mono">
                                <Eye className="w-4 h-4 text-[#E4583B]" />
                                <span>{language === 'bn' ? 'বড় করে দেখুন' : 'Preview'}</span>
                              </span>
                            </div>
                          </div>
                        </Tilt3DImageStage>
                      </div>

                      <div className="p-6 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-xs font-mono text-[#A7A298] mb-1 flex items-center gap-1.5">
                            <span>{loc(proj.groupName) || (language === 'bn' ? 'গ্রাফিক ডিজাইন' : 'Graphic Design')}</span>
                            {posterCount > 1 && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-[#E4583B] tabular-nums">{posterCount} Posters</span>
                              </>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-[#F4F0E8] group-hover:text-[#E4583B] transition-colors truncate">
                            {loc(proj.title)}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateTo('design');
                          }}
                          className="text-xs font-mono font-semibold text-[#E4583B] hover:underline whitespace-nowrap shrink-0 inline-flex items-center space-x-1 rtl:space-x-reverse"
                        >
                          <span>{language === 'bn' ? 'গ্যালারি' : 'Gallery'}</span>
                          <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
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
        <section className="py-20 bg-[#121419]/75 border-t border-[#2B303D]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <Reveal3D direction="left">
                <span className="text-xs font-mono text-[#E4583B] uppercase tracking-[0.2em] block mb-2">
                  {language === 'bn' ? 'পোর্টফোলিও ডিরেক্টরি' : language === 'ar' ? 'أقسام الموقع' : 'Explore Sections'}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#F4F0E8] tracking-tight">
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
                  className="text-xs font-mono font-semibold text-[#E4583B] hover:underline inline-flex items-center space-x-1.5 rtl:space-x-reverse self-start sm:self-auto cursor-pointer"
                >
                  <span>{language === 'bn' ? 'আমার সম্পর্কে বিস্তারিত' : 'Full Bio & Education'}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
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
                      className="h-full group p-6 rounded-2xl studio-card hover:-translate-y-1 flex flex-col justify-between"
                    >
                      <div>
                        <div className="w-10 h-10 rounded-lg bg-[#20242E] border border-[#2B303D] flex items-center justify-center text-[#E4583B] mb-4">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-[#F4F0E8] mb-2 group-hover:text-[#E4583B] transition-colors">
                          {loc(card.title)}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#A7A298] mb-6 leading-relaxed">
                          {loc(card.description)}
                        </p>
                      </div>
                      <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-xs font-semibold text-[#E4583B] group-hover:underline">
                        <span>{loc(card.linkText)}</span>
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
      <section className="py-20 bg-[#14171E]/80 border-t border-[#2B303D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal3D direction="depth">
            <div className="p-8 sm:p-12 rounded-2xl studio-card flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <span className="text-xs font-mono text-[#E4583B] uppercase tracking-[0.2em] block mb-2">
                  {language === 'bn' ? 'সেবা ও সহযোগিতা' : 'Services & Collaboration'}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#F4F0E8] tracking-tight mb-3">
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
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-[#DDD1BE]">
                    {services.map((srv, idx) => (
                      <React.Fragment key={srv.id}>
                        {idx > 0 && <span className="text-[#2B303D]" aria-hidden="true">·</span>}
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
                  className="px-5 py-3 rounded-lg text-xs font-mono font-bold text-[#F4F0E8] bg-[#20242E] hover:bg-[#2B303D] border border-[#2B303D] transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'দক্ষতা ও সেবা দেখুন' : 'View Skills & Proof'}
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('contact')}
                  className="inline-flex items-center space-x-2 rtl:space-x-reverse px-6 py-3 rounded-lg text-xs font-mono font-bold text-white bg-[#E4583B] hover:bg-[#D0492D] glow-orange-sm transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{language === 'bn' ? 'যোগাযোগ পেজে যান' : 'Go to Contact Page'}</span>
                </button>
              </div>
            </div>
          </Reveal3D>
        </div>
      </section>
    </div>
  );
};
