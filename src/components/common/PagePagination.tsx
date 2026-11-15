import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { PORTFOLIO_PAGES, PageId, useNavigation } from '../../context/NavigationContext';
import { Reveal3D } from './Reveal3D';

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
    <section className="py-12 bg-[#121419]/80 border-t border-[#2B303D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 ${prevPage ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-4`}>
          {prevPage && (
            <Reveal3D direction="left">
              <button
                type="button"
                onClick={() => navigateTo(prevPage.id)}
                className="w-full group p-6 rounded-2xl studio-card text-left rtl:text-right flex items-center justify-between cursor-pointer hover:-translate-y-0.5"
              >
                <div>
                  <span className="text-[11px] font-mono text-[#A7A298] uppercase tracking-wider block mb-1">
                    {prevKicker} · {prevPage.index}
                  </span>
                  <span className="text-lg font-bold text-[#F4F0E8] group-hover:text-[#E4583B] transition-colors">
                    {prevPage.title[language] || prevPage.title.en}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#20242E] border border-[#2B303D] flex items-center justify-center text-[#DDD1BE] group-hover:text-[#E4583B] group-hover:border-[#E4583B]/40 transition-colors shrink-0">
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                </div>
              </button>
            </Reveal3D>
          )}

          <Reveal3D direction={prevPage ? 'right' : 'up'} delay={prevPage ? 90 : 0}>
            <button
              type="button"
              onClick={() => navigateTo(nextPage.id)}
              className="w-full group p-6 rounded-2xl studio-card text-left rtl:text-right flex items-center justify-between cursor-pointer hover:-translate-y-0.5"
            >
              <div>
                <span className="text-[11px] font-mono text-[#A7A298] uppercase tracking-wider block mb-1">
                  {nextKicker} · {nextPage.index}
                </span>
                <span className="text-lg font-bold text-[#F4F0E8] group-hover:text-[#E4583B] transition-colors">
                  {nextPage.title[language] || nextPage.title.en}
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#20242E] border border-[#2B303D] flex items-center justify-center text-[#DDD1BE] group-hover:text-[#E4583B] group-hover:border-[#E4583B]/40 transition-colors shrink-0">
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </div>
            </button>
          </Reveal3D>
        </div>
      </div>
    </section>
  );
};
