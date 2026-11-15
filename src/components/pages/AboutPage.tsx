import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { PORTFOLIO_PAGES } from '../../context/NavigationContext';
import { PageHeader } from '../common/PageHeader';
import { PagePagination } from '../common/PagePagination';
import { About } from '../About';
import { Experience } from '../Experience';
import { WorkExperienceCVSection } from '../WorkExperienceCVSection';

export const AboutPage: React.FC = () => {
  const { portfolio, language } = usePortfolio();
  const meta = PORTFOLIO_PAGES.find((p) => p.id === 'about')!;

  const academicCount = (portfolio.academicRecords || []).length;
  const instituteCount =
    portfolio.professionalInstitutes && portfolio.professionalInstitutes.length > 0
      ? portfolio.professionalInstitutes.length
      : portfolio.professionalInstitute
      ? 1
      : 0;

  const summaryText =
    language === 'bn'
      ? `${academicCount}টি প্রাতিষ্ঠানিক অর্জন · ${instituteCount}টি প্রশিক্ষণ · ১.১ বছর অভিজ্ঞতা`
      : language === 'ar'
      ? `${academicCount} مؤهل أكاديمي · ${instituteCount} تدريب مهني`
      : `${academicCount} Academic · ${instituteCount} Training · 1.1 Yrs Experience`;

  return (
    <div className="animate-page-enter-3d">
      <PageHeader meta={meta} summaryText={summaryText} />
      <About />
      <WorkExperienceCVSection />
      <Experience />
      <PagePagination currentPageId="about" />
    </div>
  );
};
