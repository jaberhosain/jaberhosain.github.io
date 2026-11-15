import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { PageMeta, useNavigation } from '../../context/NavigationContext';
import { Reveal3D } from './Reveal3D';

interface PageHeaderProps {
  meta: PageMeta;
  summaryText?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ meta, summaryText }) => {
  const { language } = usePortfolio();
  const { navigateTo } = useNavigation();

  const homeLabel = language === 'bn' ? 'হোম' : language === 'ar' ? 'الرئيسية' : 'Home';
  const pageLabel = meta.label[language] || meta.label.en;
  const title = meta.title[language] || meta.title.en;
  const subtitle = meta.subtitle[language] || meta.subtitle.en;

  return (
    <section className="relative pt-28 pb-12 sm:pt-32 sm:pb-14 bg-[#121419]/78 border-b border-[#2B303D] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Clean Breadcrumb Row */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono text-[#A7A298] mb-6">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="inline-flex items-center space-x-1.5 rtl:space-x-reverse hover:text-[#E4583B] transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{homeLabel}</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#A7A298]/60 rtl:rotate-180" />
          <span className="text-[#F4F0E8] font-semibold">{pageLabel}</span>
        </nav>

        {/* Title & Editorial Index Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <Reveal3D direction="left" className="max-w-3xl">
            <div className="text-xs font-mono text-[#E4583B] tracking-[0.2em] uppercase mb-2 tabular-nums">
              {meta.index} / {pageLabel}
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#F4F0E8] tracking-tight leading-[1.08] text-balance">
              {title}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#A7A298] leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          </Reveal3D>

          {summaryText && (
            <Reveal3D direction="right" delay={120}>
              <div className="text-xs font-mono text-[#DDD1BE] tabular-nums md:text-right shrink-0">
                {summaryText}
              </div>
            </Reveal3D>
          )}
        </div>
      </div>
    </section>
  );
};
