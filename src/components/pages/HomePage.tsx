import React from 'react';
import { ProjectItem, VideoShowcaseItem } from '../../types/portfolio';
import { Hero } from '../Hero';
import { HomeHighlights } from '../HomeHighlights';
import { PagePagination } from '../common/PagePagination';

interface HomePageProps {
  onOpenLightbox?: (project: ProjectItem) => void;
  onOpenVideo?: (video: VideoShowcaseItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenLightbox, onOpenVideo }) => {
  return (
    <div className="animate-in fade-in duration-300">
      <Hero />
      <HomeHighlights onOpenLightbox={onOpenLightbox} onOpenVideo={onOpenVideo} />
      <PagePagination currentPageId="home" />
    </div>
  );
};
