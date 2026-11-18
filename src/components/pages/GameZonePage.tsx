import React from 'react';
import { CreativeGameArena } from '../games/CreativeGameArena';
import { PagePagination } from '../common/PagePagination';

export const GameZonePage: React.FC = () => {
  return (
    <div className="animate-page-enter-3d">
      <CreativeGameArena variant="page" />
      <PagePagination currentPageId="games" />
    </div>
  );
};
