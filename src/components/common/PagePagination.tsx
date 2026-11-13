import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { PORTFOLIO_PAGES, PageId, useNavigation } from '../../context/NavigationContext';

interface PagePaginationProps {
  currentPageId: PageId;
}

export const PagePagination: React.FC<PagePaginationProps> = ({ currentPageId }) => {
  const { language } = usePortfolio();
  const { navigateTo } = useNavigation();

  const currentIdx = PORTFOLIO_PAGES.findIndex((p) => p.id === currentPageId);
  if (currentIdx === -1) return null;

  const prevPage = currentIdx > 0 ? PORTFOLIO_PAGES[currentIdx - 1] : null;
  const nextPage = PORTFOLIO_PAGES[(currentIdx + 1) % PORTFOLIO_PAGES.length];

  const prevKicker = language === 'bn' ? 'পূর্ববর্তী পেজ' : language === 'ar' ? 'الصفحة السابقة' : 'Previous Page';
  const nextKicker = language === 'bn' ? 'পরবর্তী পেজ' : language === 'ar' ? 'الصفحة التالية' : 'Next Page';

  return (
    <section className="py-12 bg-[#070A0D] border-t border-[#1D232A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 ${prevPage ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-4`}>
          {prevPage && (
            <button
              type="button"
              onClick={() => navigateTo(prevPage.id)}
              className="group p-6 rounded-2xl bg-[#12161A] border border-[#232B33] hover:border-[#FF5722]/60 transition-all text-left rtl:text-right flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                  {prevKicker} · {prevPage.index}
                </span>
                <span className="text-lg font-bold text-white group-hover:text-[#FF5722] transition-colors">
                  {prevPage.title[language] || prevPage.title.en}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#181E24] border border-[#232B33] flex items-center justify-center text-neutral-300 group-hover:text-[#FF5722] group-hover:border-[#FF5722]/40 transition-colors shrink-0">
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              </div>
            </button>
          )}

          <button
            type="button"
            onClick={() => navigateTo(nextPage.id)}
            className="group p-6 rounded-2xl bg-[#12161A] border border-[#232B33] hover:border-[#FF5722]/60 transition-all text-left rtl:text-right flex items-center justify-between cursor-pointer"
          >
            <div>
              <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                {nextKicker} · {nextPage.index}
              </span>
              <span className="text-lg font-bold text-white group-hover:text-[#FF5722] transition-colors">
                {nextPage.title[language] || nextPage.title.en}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#181E24] border border-[#232B33] flex items-center justify-center text-neutral-300 group-hover:text-[#FF5722] group-hover:border-[#FF5722]/40 transition-colors shrink-0">
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};
