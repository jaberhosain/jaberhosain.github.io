import React from 'react';
import { PORTFOLIO_PAGES } from '../../context/NavigationContext';
import { PageHeader } from '../common/PageHeader';
import { PagePagination } from '../common/PagePagination';
import { Contact } from '../Contact';

export const ContactPage: React.FC = () => {
  const meta = PORTFOLIO_PAGES.find((p) => p.id === 'contact')!;

  return (
    <div className="animate-page-enter-3d">
      <PageHeader meta={meta} />
      <Contact />
      <PagePagination currentPageId="contact" />
    </div>
  );
};
