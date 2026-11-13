import React, { useState, useMemo } from 'react';
import { Layers, LayoutGrid } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { PORTFOLIO_PAGES } from '../../context/NavigationContext';
import { ProjectItem } from '../../types/portfolio';
import { getProjectPosters } from '../../lib/imageUrlResolver';
import { PageHeader } from '../common/PageHeader';
import { PagePagination } from '../common/PagePagination';
import { GraphicBestShowcase } from '../GraphicBestShowcase';
import { Portfolio } from '../Portfolio';

interface DesignPageProps {
  onOpenLightbox?: (project: ProjectItem, initialIndex?: number) => void;
}

type GalleryFilter = 'all' | 'best' | 'projects' | 'behance';
type ViewStyle = 'groups' | 'posters';

export const DesignPage: React.FC<DesignPageProps> = ({ onOpenLightbox }) => {
  const { portfolio, language, loc } = usePortfolio();
  const [filter, setFilter] = useState<GalleryFilter>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [viewStyle, setViewStyle] = useState<ViewStyle>('groups');

  const meta = PORTFOLIO_PAGES.find((p) => p.id === 'design')!;

  const { bestCount, projectCount, behanceCount, totalPostersCount, groupNames } = useMemo(() => {
    const best = (portfolio.bestGraphicWorks || []).filter((item) => item.visible !== false);
    const projs = (portfolio.projects || []).filter(
      (p: any) => p.category === 'graphic' && p.visible !== false && !p.hidden
    );
    const beCount =
      best.filter((b) => Boolean(b.behanceUrl)).length +
      projs.filter((p) => Boolean(p.behanceUrl)).length;

    const projectPosterTotal = projs.reduce((acc, p) => {
      const count = getProjectPosters(p).length;
      return acc + Math.max(1, count);
    }, 0);

    // Distinct project groups (prefers explicit groupName, or falls back to project title if multiple groups exist)
    const groupCounts = new Map<string, number>();
    projs.forEach((p) => {
      const gName = (loc(p.groupName) || loc(p.title) || '').trim();
      if (gName) {
        const posterLen = Math.max(1, getProjectPosters(p).length);
        groupCounts.set(gName, (groupCounts.get(gName) || 0) + posterLen);
      }
    });

    return {
      bestCount: best.length,
      projectCount: projs.length,
      behanceCount: beCount,
      totalPostersCount: best.length + projectPosterTotal,
      groupNames: Array.from(groupCounts.entries()).map(([name, count]) => ({ name, count }))
    };
  }, [portfolio.bestGraphicWorks, portfolio.projects, loc]);

  const filterTabs: { id: GalleryFilter; label: string; count: number }[] = [
    {
      id: 'all',
      label: language === 'bn' ? 'সকল ডিজাইন' : language === 'ar' ? 'جميع التصاميم' : 'All Works',
      count: bestCount + projectCount
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
      label: language === 'bn' ? 'গ্রুপ প্রজেক্ট' : language === 'ar' ? 'مجموعات المشاريع' : 'Project Groups',
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
      ? `${projectCount}টি প্রজেক্ট গ্রুপ · ${totalPostersCount}টি পোস্টার ও কাজ`
      : language === 'ar'
      ? `${projectCount} مشاريع · ${totalPostersCount} تصميم`
      : `${projectCount} Groups · ${totalPostersCount} Posters & Works`;

  return (
    <div className="animate-in fade-in duration-300">
      <PageHeader meta={meta} summaryText={summaryText} />

      {/* Interactive Filter + View Mode Bar */}
      <div className="bg-[#0B0F12] border-b border-[#1D232A] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Primary Section Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#12161A] border border-[#232B33]">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setFilter(tab.id);
                    if (tab.id === 'best') setGroupFilter('all');
                  }}
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

            {/* View Style Switcher: Grouped Projects vs All Individual Posters */}
            {filter !== 'best' && (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#12161A] border border-[#232B33]">
                <button
                  type="button"
                  onClick={() => setViewStyle('groups')}
                  className={`inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    viewStyle === 'groups'
                      ? 'bg-[#1E2630] text-white border border-[#2F3A45]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span>{language === 'bn' ? 'গ্রুপ ওয়াইজ' : 'Grouped Projects'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewStyle('posters')}
                  className={`inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    viewStyle === 'posters'
                      ? 'bg-[#1E2630] text-white border border-[#2F3A45]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span>{language === 'bn' ? 'সব পোস্টার' : 'All Posters'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Group Filter Row (shown whenever there are project groups) */}
          {groupNames.length > 0 && filter !== 'best' && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider mr-1">
                {language === 'bn' ? 'প্রজেক্ট গ্রুপ:' : 'Groups:'}
              </span>
              <button
                type="button"
                onClick={() => setGroupFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  groupFilter === 'all'
                    ? 'bg-[#FF5722]/15 text-[#FF7043] border border-[#FF5722]/40 font-semibold'
                    : 'bg-[#12161A] text-neutral-400 hover:text-white border border-[#232B33]'
                }`}
              >
                {language === 'bn' ? 'সব গ্রুপ' : 'All Groups'}
              </button>
              {groupNames.map((g) => (
                <button
                  key={g.name}
                  type="button"
                  onClick={() => {
                    setGroupFilter(g.name);
                    if (filter === 'all' || filter === 'behance') setFilter('projects');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer tabular-nums ${
                    groupFilter === g.name
                      ? 'bg-[#FF5722]/15 text-[#FF7043] border border-[#FF5722]/40 font-semibold'
                      : 'bg-[#12161A] text-neutral-400 hover:text-white border border-[#232B33]'
                  }`}
                >
                  {g.name} ({g.count})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Graphic Design Best Work (hidden if user picked a specific group or switched to All Posters grid) */}
      {(filter === 'all' || filter === 'best' || filter === 'behance') &&
        groupFilter === 'all' &&
        viewStyle === 'groups' && (
          <GraphicBestShowcase
            behanceOnly={filter === 'behance'}
            onOpenLightbox={onOpenLightbox}
          />
        )}

      {/* Graphic Design Grouped Projects / Posters Grid */}
      {(filter === 'all' || filter === 'projects' || filter === 'behance') && (
        <Portfolio
          mode="graphic"
          behanceOnly={filter === 'behance'}
          groupFilter={groupFilter}
          viewStyle={viewStyle}
          onOpenLightbox={onOpenLightbox}
        />
      )}

      <PagePagination currentPageId="design" />
    </div>
  );
};
