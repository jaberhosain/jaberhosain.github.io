import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { PORTFOLIO_PAGES } from '../../context/NavigationContext';
import { ProjectItem } from '../../types/portfolio';
import { PageHeader } from '../common/PageHeader';
import { PagePagination } from '../common/PagePagination';
import { GraphicBestShowcase } from '../GraphicBestShowcase';
import { Portfolio } from '../Portfolio';

interface DesignPageProps {
  onOpenLightbox?: (project: ProjectItem) => void;
}

type GalleryFilter = 'all' | 'best' | 'projects' | 'behance';

export const DesignPage: React.FC<DesignPageProps> = ({ onOpenLightbox }) => {
  const { portfolio, language } = usePortfolio();
  const [filter, setFilter] = useState<GalleryFilter>('all');

  const meta = PORTFOLIO_PAGES.find((p) => p.id === 'design')!;

  const { bestCount, projectCount, behanceCount, totalCount } = useMemo(() => {
    const best = (portfolio.bestGraphicWorks || []).filter((item) => item.visible !== false);
    const projs = (portfolio.projects || []).filter(
      (p: any) => p.category === 'graphic' && p.visible !== false && !p.hidden
    );
    const beCount =
      best.filter((b) => Boolean(b.behanceUrl)).length +
      projs.filter((p) => Boolean(p.behanceUrl)).length;

    return {
      bestCount: best.length,
      projectCount: projs.length,
      behanceCount: beCount,
      totalCount: best.length + projs.length
    };
  }, [portfolio.bestGraphicWorks, portfolio.projects]);

  const filterTabs: { id: GalleryFilter; label: string; count: number }[] = [
    {
      id: 'all',
      label: language === 'bn' ? 'সকল ডিজাইন' : language === 'ar' ? 'جميع التصاميم' : 'All Works',
      count: totalCount
    }
  ];

  if (bestCount > 0) {
    filterTabs.push({
      id: 'best',
      label: language === 'bn' ? 'সেরা কাজ' : language === 'ar' ? 'أبرز الأعمال' : 'Best Work',
      count: bestCount
    });
  }
  if (projectCount > 0) {
    filterTabs.push({
      id: 'projects',
      label: language === 'bn' ? 'ডিজাইন প্রজেক্ট' : language === 'ar' ? 'مشاريع التصميم' : 'Graphic Projects',
      count: projectCount
    });
  }
  if (behanceCount > 0) {
    filterTabs.push({
      id: 'behance',
      label: 'Behance',
      count: behanceCount
    });
  }

  const summaryText =
    language === 'bn'
      ? `মোট ডিজাইন কাজ: ${totalCount}`
      : language === 'ar'
      ? `إجمالي التصاميم: ${totalCount}`
      : `${totalCount} Visual Works`;

  return (
    <div className="animate-in fade-in duration-300">
      <PageHeader meta={meta} summaryText={summaryText} />

      {/* Interactive Filter Bar */}
      {filterTabs.length > 1 && (
        <div className="bg-[#0B0F12] border-b border-[#1D232A] py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              {language === 'bn' ? 'গ্যালারি ভিউ' : language === 'ar' ? 'عرض المعرض' : 'Gallery View'}
            </span>
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#12161A] border border-[#232B33]">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors whitespace-nowrap tabular-nums cursor-pointer ${
                    filter === tab.id
                      ? 'bg-[#FF5722] text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Graphic Design Best Work */}
      {(filter === 'all' || filter === 'best' || filter === 'behance') && (
        <GraphicBestShowcase
          behanceOnly={filter === 'behance'}
          onOpenLightbox={onOpenLightbox}
        />
      )}

      {/* Graphic Design Projects Grid */}
      {(filter === 'all' || filter === 'projects' || filter === 'behance') && (
        <Portfolio
          mode="graphic"
          behanceOnly={filter === 'behance'}
          onOpenLightbox={onOpenLightbox}
        />
      )}

      <PagePagination currentPageId="design" />
    </div>
  );
};
