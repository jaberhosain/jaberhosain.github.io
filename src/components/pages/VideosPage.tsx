import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { PORTFOLIO_PAGES } from '../../context/NavigationContext';
import { VideoShowcaseItem } from '../../types/portfolio';
import { PageHeader } from '../common/PageHeader';
import { PagePagination } from '../common/PagePagination';
import { Portfolio } from '../Portfolio';
import { VideoShowcase } from '../VideoShowcase';
import { CraftTimeline } from '../CraftTimeline';
import { LayerExplosionShowcase } from '../LayerExplosionShowcase';

interface VideosPageProps {
  onOpenVideo?: (video: VideoShowcaseItem) => void;
}

type PlatformFilter = 'all' | 'youtube' | 'vimeo' | 'facebook';

export const VideosPage: React.FC<VideosPageProps> = ({ onOpenVideo }) => {
  const { portfolio, language } = usePortfolio();
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');

  const meta = PORTFOLIO_PAGES.find((p) => p.id === 'videos')!;

  const { totalCount, availablePlatforms } = useMemo(() => {
    const projectVideos = (portfolio.videos || []).filter((v: any) => v.visible !== false && !v.hidden);
    const bestVideos = (portfolio.bestVideoWorks || []).filter((v: any) => v.visible !== false);
    const all = [...projectVideos, ...bestVideos];

    const hasYouTube = all.some((v) => {
      const u = (v.videoUrl || '').toLowerCase();
      return v.videoType === 'youtube' || u.includes('youtube.com') || u.includes('youtu.be');
    });
    const hasVimeo = all.some((v) => {
      const u = (v.videoUrl || '').toLowerCase();
      return v.videoType === 'vimeo' || u.includes('vimeo.com');
    });
    const hasFacebook = all.some((v) => {
      const u = (v.videoUrl || '').toLowerCase();
      return v.videoType === 'facebook' || u.includes('facebook.com') || u.includes('fb.watch');
    });

    const platforms: { id: PlatformFilter; label: string }[] = [
      { id: 'all', label: language === 'bn' ? 'সকল প্ল্যাটফর্ম' : language === 'ar' ? 'الكل' : 'All Platforms' }
    ];
    if (hasYouTube) platforms.push({ id: 'youtube', label: 'YouTube' });
    if (hasVimeo) platforms.push({ id: 'vimeo', label: 'Vimeo' });
    if (hasFacebook) platforms.push({ id: 'facebook', label: 'Facebook' });

    return { totalCount: all.length, availablePlatforms: platforms };
  }, [portfolio.videos, portfolio.bestVideoWorks, language]);

  const summaryText =
    language === 'bn'
      ? `মোট ভিডিও প্রজেক্ট: ${totalCount}`
      : language === 'ar'
      ? `إجمالي الفيديوهات: ${totalCount}`
      : `${totalCount} Published Cuts`;

  return (
    <div className="animate-page-enter-3d">
      <PageHeader meta={meta} summaryText={summaryText} />

      {/* Frosted Platform Filter Toolbar */}
      {availablePlatforms.length > 1 && (
        <div className="sticky top-[64px] z-30 bg-[#0D0E12]/90 backdrop-blur-md border-b border-white/[0.08] py-3.5 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-medium text-[#A7A298] tracking-wide">
              {language === 'bn' ? 'প্ল্যাটফর্ম ফিল্টার' : language === 'ar' ? 'تصفية حسب المنصة' : 'Filter by Source'}
            </span>
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-full glass-showcase-inner">
              {availablePlatforms.map((plat) => (
                <button
                  key={plat.id}
                  type="button"
                  onClick={() => setPlatformFilter(plat.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    platformFilter === plat.id
                      ? 'glass-pill-cta font-semibold'
                      : 'text-[#A7A298] hover:text-[#F4F0E8]'
                  }`}
                >
                  {plat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Video Projects 3D Parallax Carousel */}
      <Portfolio
        mode="video"
        platformFilter={platformFilter}
        onOpenVideo={onOpenVideo}
      />

      {/* Featured Best Video Showcase */}
      <VideoShowcase
        platformFilter={platformFilter}
        onOpenVideo={onOpenVideo}
      />

      {/* Interactive Timeline Studio & 3D Frame Deconstruction */}
      <CraftTimeline />
      <LayerExplosionShowcase />

      <PagePagination currentPageId="videos" />
    </div>
  );
};
