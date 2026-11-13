import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { PORTFOLIO_PAGES } from '../../context/NavigationContext';
import { PageHeader } from '../common/PageHeader';
import { PagePagination } from '../common/PagePagination';
import { Services } from '../Services';
import { Skills } from '../Skills';
import { ChannelLinks } from '../ChannelLinks';

export const SkillsPage: React.FC = () => {
  const { portfolio, language } = usePortfolio();
  const meta = PORTFOLIO_PAGES.find((p) => p.id === 'skills')!;

  const skillsCount = (portfolio.skills || []).length;
  const linkedCount = (portfolio.channelLinks || []).filter(
    (c) => c.status === 'LINKED' && Boolean(c.url)
  ).length;

  const summaryText =
    language === 'bn'
      ? `${skillsCount}টি দক্ষতা ক্ষেত্র · ${linkedCount}টি ভেরিফায়েড চ্যানেল`
      : language === 'ar'
      ? `${skillsCount} مهارة · ${linkedCount} قناة موثقة`
      : `${skillsCount} Skill Areas · ${linkedCount} Linked Channels`;

  return (
    <div className="animate-in fade-in duration-300">
      <PageHeader meta={meta} summaryText={summaryText} />
      <Services />
      <Skills />
      <ChannelLinks />
      <PagePagination currentPageId="skills" />
    </div>
  );
};
