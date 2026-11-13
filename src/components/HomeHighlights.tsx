import React, { useState } from 'react';
import {
  Video,
  Palette,
  ArrowRight,
  Eye,
  GraduationCap,
  Award,
  Wrench,
  MessageSquare,
  Film
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useNavigation } from '../context/NavigationContext';
import { ProjectItem, VideoShowcaseItem } from '../types/portfolio';
import { resolveAssetUrl } from '../utils/assetUrl';
import { Tilt3DImageStage } from './common/Tilt3DImageStage';
import { VideoParallaxCarousel } from './VideoParallaxCarousel';

interface HomeHighlightsProps {
  onOpenLightbox?: (project: ProjectItem) => void;
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
    <div className="bg-[#0B0F12] border-t border-[#1D232A]">
      {/* 1. Video Portfolio 3D Parallax Slide Showcase on Home Page */}
      {activeSlideVideos.length > 0 && (
        <section className="py-20 sm:py-24 bg-[#070A0D] relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-[#FF5722]/8 rounded-full blur-[200px] pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-md bg-[#181E24] border border-[#232B33] text-xs font-mono text-[#FF5722] mb-3">
                  <Film className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span>{ui.videos.sectionTag}</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight uppercase leading-[1.08]">
                  {language === 'bn'
                    ? 'ভিডিও পোর্টফোলিও'
                    : language === 'ar'
                    ? 'معرض الفيديو'
                    : 'Video Portfolio'}{' '}
                  <span className="font-serif italic lowercase font-normal text-neutral-300 block sm:inline mt-1 sm:mt-0">
                    3D parallax.
                  </span>
                </h2>
                <p className="mt-2.5 text-xs sm:text-sm text-neutral-400 max-w-2xl font-mono leading-relaxed">
                  {language === 'bn'
                    ? 'স্পিড কন্ট্রোল ব্যবহার করে থ্রিডি স্লাইডে ভিডিও দেখুন, অথবা সব ভিডিও একসাথে স্ক্রল করে দেখতে ভিডিও পেজে যান।'
                    : 'Browse projects in the 3D parallax slider with custom speed control, or view all videos as a scrollable gallery.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {visibleVideos.length > 0 && visibleBestVideos.length > 0 && (
                  <div className="inline-flex items-center p-1 rounded-xl bg-[#12161A] border border-[#232B33]">
                    <button
                      type="button"
                      onClick={() => setSlideSource('projects')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors whitespace-nowrap cursor-pointer ${
                        slideSource === 'projects'
                          ? 'bg-[#FF5722] text-white'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {ui.projects.tabVideo} ({visibleVideos.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlideSource('best')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors whitespace-nowrap cursor-pointer ${
                        slideSource === 'best'
                          ? 'bg-[#FF5722] text-white'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {language === 'bn' ? 'সেরা কাজ' : 'Best Work'} ({visibleBestVideos.length})
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => navigateTo('videos')}
                  className="inline-flex items-center space-x-2 rtl:space-x-reverse px-4 py-2.5 rounded-xl bg-[#12161A] border border-[#232B33] hover:border-[#FF5722] text-xs font-mono font-bold text-white transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span>
                    {language === 'bn'
                      ? 'সব ভিডিও বিস্তারিত দেখুন'
                      : language === 'ar'
                      ? 'عرض جميع الفيديوهات'
                      : 'All Videos Grid'}
                  </span>
                  <span className="text-neutral-400 tabular-nums">({totalVideoCount})</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#FF5722] rtl:rotate-180" />
                </button>
              </div>
            </div>

            <VideoParallaxCarousel
              videos={activeSlideVideos}
              onOpenVideo={onOpenVideo}
              emptyPlaceholder={ui.projects.emptyPlaceholder}
            />
          </div>
        </section>
      )}

      {/* 2. Graphic Design Spotlight Preview */}
      {spotlightGraphics.length > 0 && (
        <section className="py-20 bg-[#0B0F12] border-t border-[#1D232A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <span className="text-xs font-mono text-[#FF5722] uppercase tracking-widest block mb-2">
                  {language === 'bn' ? 'গ্রাফিক ডিজাইন হাইলাইটস' : language === 'ar' ? 'أبرز أعمال التصميم' : 'Graphic Design Preview'}
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
                  {language === 'bn'
                    ? 'ভিজ্যুয়াল ডিজাইন ও পোস্টার'
                    : language === 'ar'
                    ? 'التصميم الجرافيكي والهويات'
                    : 'Visual & Graphic Design'}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => navigateTo('design')}
                className="inline-flex items-center space-x-2 rtl:space-x-reverse px-4 py-2.5 rounded-xl bg-[#12161A] border border-[#232B33] hover:border-[#FF5722] text-xs font-mono font-bold text-white transition-colors self-start md:self-auto whitespace-nowrap cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5 text-[#FF5722]" />
                <span>
                  {language === 'bn' ? 'সব ডিজাইন দেখুন' : language === 'ar' ? 'كل التصاميم' : 'Open Design Gallery'}
                </span>
                <span className="text-neutral-400 tabular-nums">({totalGraphicCount})</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FF5722] rtl:rotate-180" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {spotlightGraphics.map((proj, idx) => (
                <div
                  key={proj.id || `sg-${idx}`}
                  onClick={() => onOpenLightbox?.(proj)}
                  className="group rounded-3xl bg-[#12161A] border border-[#232B33] hover:border-[#FF5722]/60 overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-xl"
                >
                  <div className="p-2.5 bg-[#0D1115] border-b border-[#232B33]">
                    <Tilt3DImageStage className="aspect-[16/10] w-full" maxTilt={13} scaleOnHover={1.03}>
                      <div className="relative w-full h-full rounded-2xl bg-[#181E24] overflow-hidden flex items-center justify-center">
                        {proj.coverImage ? (
                          <img
                            src={resolveAssetUrl(proj.coverImage)}
                            alt={loc(proj.title)}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Palette className="w-10 h-10 text-[#FF5722]" />
                        )}
                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-xl bg-black/85 border border-[#FF5722]/60 text-white text-xs font-mono">
                            <Eye className="w-4 h-4 text-[#FF5722]" />
                            <span>{language === 'bn' ? 'বড় করে দেখুন' : 'Preview'}</span>
                          </span>
                        </div>
                      </div>
                    </Tilt3DImageStage>
                  </div>

                  <div className="p-6 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-neutral-400 mb-1">
                        <span>{language === 'bn' ? 'গ্রাফিক ডিজাইন' : 'Graphic Design'}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#FF5722] transition-colors truncate">
                        {loc(proj.title)}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateTo('design');
                      }}
                      className="text-xs font-mono font-semibold text-[#FF5722] hover:underline whitespace-nowrap shrink-0 inline-flex items-center space-x-1 rtl:space-x-reverse"
                    >
                      <span>{language === 'bn' ? 'গ্যালারি' : 'Gallery'}</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Page Directory Gateway (Powered strictly by real overviewCards) */}
      {overviewCards.length > 0 && (
        <section className="py-20 bg-[#090C0F] border-t border-[#1D232A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <span className="text-xs font-mono text-[#FF5722] uppercase tracking-widest block mb-2">
                  {language === 'bn' ? 'পোর্টফোলিও ডিরেক্টরি' : language === 'ar' ? 'أقسام الموقع' : 'Explore Sections'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
                  {language === 'bn'
                    ? 'ওয়েবসাইটের প্রতিটি পেজ ভিজিট করুন'
                    : language === 'ar'
                    ? 'تصفح صفحات المعرض'
                    : 'Navigate Dedicated Pages'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('about')}
                className="text-xs font-mono font-semibold text-[#FF5722] hover:underline inline-flex items-center space-x-1.5 rtl:space-x-reverse self-start sm:self-auto cursor-pointer"
              >
                <span>{language === 'bn' ? 'আমার সম্পর্কে বিস্তারিত' : 'Full Bio & Education'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {overviewCards.map((card) => {
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

                return (
                  <a
                    key={card.id}
                    href={card.linkTarget}
                    onClick={handleCardClick}
                    className="group p-6 rounded-2xl bg-[#12161A] border border-[#232B33] hover:border-[#FF5722]/60 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-[#181E24] border border-[#232B33] flex items-center justify-center text-[#FF5722] mb-4">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white mb-2 group-hover:text-[#FF5722] transition-colors">
                        {loc(card.title)}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-400 mb-6 leading-relaxed">
                        {loc(card.description)}
                      </p>
                    </div>
                    <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-xs font-semibold text-[#FF5722] group-hover:underline">
                      <span>{loc(card.linkText)}</span>
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. Real Services & Direct Contact Bridge */}
      <section className="py-20 bg-[#0B0F12] border-t border-[#1D232A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#12161A] border border-[#232B33] flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <span className="text-xs font-mono text-[#FF5722] uppercase tracking-widest block mb-2">
                {language === 'bn' ? 'সেবা ও সহযোগিতা' : 'Services & Collaboration'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase mb-3">
                {portfolio.contactForm?.projectPitchTitle
                  ? loc(portfolio.contactForm.projectPitchTitle)
                  : language === 'bn'
                  ? 'আপনার প্রজেক্ট নিয়ে কাজ করতে প্রস্তুত?'
                  : 'Have a Project in Mind?'}
              </h2>
              <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                {portfolio.contactForm?.projectPitchSubtitle
                  ? loc(portfolio.contactForm.projectPitchSubtitle)
                  : language === 'bn'
                  ? 'আপনার ব্র্যান্ড বা চ্যানেলের জন্য ভিডিও এডিটিং কিংবা গ্রাফিক ডিজাইনের প্রয়োজন হলে সরাসরি বার্তা পাঠান।'
                  : "Let's collaborate on your next video edit or graphic design visual."}
              </p>

              {services.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-neutral-300">
                  {services.map((srv, idx) => (
                    <React.Fragment key={srv.id}>
                      {idx > 0 && <span className="text-neutral-600" aria-hidden="true">·</span>}
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
                className="px-5 py-3 rounded-xl text-xs font-mono font-bold text-neutral-200 bg-[#181E24] hover:bg-[#1E252D] border border-[#232B33] transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'দক্ষতা ও সেবা দেখুন' : 'View Skills & Proof'}
              </button>
              <button
                type="button"
                onClick={() => navigateTo('contact')}
                className="inline-flex items-center space-x-2 rtl:space-x-reverse px-6 py-3 rounded-xl text-xs font-mono font-bold text-white bg-[#FF5722] hover:bg-[#F4511E] glow-orange-sm transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{language === 'bn' ? 'যোগাযোগ পেজে যান' : 'Go to Contact Page'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
