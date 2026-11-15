import React, { useState, useMemo } from 'react';
import { ExternalLink, Eye, Palette, Layers, Grid } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { ProjectItem, VideoShowcaseItem } from '../types/portfolio';
import { resolveAssetUrl } from '../utils/assetUrl';
import { getProjectPosters } from '../lib/imageUrlResolver';
import { EditableElement } from './common/EditableElement';
import { VideoCardGrid } from './VideoCardGrid';
import { Tilt3DImageStage } from './common/Tilt3DImageStage';
import { Reveal3D } from './common/Reveal3D';
import { StudioGlassIcon } from './common/StudioIcon';

interface PortfolioProps {
  onOpenLightbox?: (project: ProjectItem, initialIndex?: number) => void;
  onOpenVideo?: (video: VideoShowcaseItem) => void;
  onOpenAdmin?: () => void;
  mode?: 'all' | 'video' | 'graphic';
  platformFilter?: 'all' | 'youtube' | 'vimeo' | 'facebook';
  behanceOnly?: boolean;
  groupFilter?: string;
  viewStyle?: 'groups' | 'posters';
}

export const Portfolio: React.FC<PortfolioProps> = ({
  onOpenLightbox,
  onOpenVideo,
  mode = 'all',
  platformFilter = 'all',
  behanceOnly = false,
  groupFilter = 'all',
  viewStyle = 'groups'
}) => {
  const { portfolio, ui, loc, language } = usePortfolio();
  const { projects = [], videos = [], bestGraphicWorks = [] } = portfolio;
  const [activeTab, setActiveTab] = useState<'video' | 'graphic'>(mode === 'graphic' ? 'graphic' : 'video');
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const effectiveTab = mode === 'all' ? activeTab : mode;

  const matchesPlatform = (v: VideoShowcaseItem) => {
    if (platformFilter === 'all') return true;
    const url = (v.videoUrl || '').toLowerCase();
    const explicit = (v.videoType || '').toLowerCase();
    if (platformFilter === 'youtube') return explicit === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be');
    if (platformFilter === 'vimeo') return explicit === 'vimeo' || url.includes('vimeo.com');
    if (platformFilter === 'facebook') return explicit === 'facebook' || url.includes('facebook.com') || url.includes('fb.watch');
    return true;
  };

  const visibleVideos = [...(videos || [])]
    .filter((v: any) => v.visible !== false && !v.hidden && matchesPlatform(v))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const graphicProjects = useMemo(() => {
    return [...(projects || [])]
      .filter((p: any) => {
        if (p.category !== 'graphic' || p.visible === false || p.hidden) return false;
        if (behanceOnly && !p.behanceUrl) return false;
        if (groupFilter && groupFilter !== 'all') {
          const pGroup = (loc(p.groupName) || loc(p.title) || p.id).trim();
          return pGroup === groupFilter;
        }
        return true;
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [projects, behanceOnly, groupFilter, loc]);

  const flattenedPosters = useMemo(() => {
    const entries: {
      key: string;
      url: string;
      caption: string;
      projectTitle: string;
      groupLabel: string;
      posterNumber: number;
      totalInGroup: number;
      project: ProjectItem;
      indexInProject: number;
    }[] = [];

    graphicProjects.forEach((proj) => {
      const posters = getProjectPosters(proj);
      const groupLabel = loc(proj.groupName) || loc(proj.title);
      const projTitle = loc(proj.title);

      posters.forEach((poster, idx) => {
        entries.push({
          key: `${proj.id}-poster-${idx}`,
          url: poster.url,
          caption: poster.caption || projTitle,
          projectTitle: projTitle,
          groupLabel,
          posterNumber: idx + 1,
          totalInGroup: posters.length,
          project: proj,
          indexInProject: idx
        });
      });
    });

    if (groupFilter === 'all') {
      (bestGraphicWorks || [])
        .filter((b) => b.visible !== false && (!behanceOnly || Boolean(b.behanceUrl)))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .forEach((b, idx) => {
          const bestProj: ProjectItem = {
            id: b.id || `best-flat-${idx}`,
            title: b.title,
            groupName: { en: 'Best Work', bn: 'সেরা কাজ', ar: 'أبرز الأعمال' },
            category: 'graphic_best',
            description: { en: '', bn: '', ar: '' },
            coverImage: b.imageUrl,
            behanceUrl: b.behanceUrl,
            order: b.order
          };
          const posters = getProjectPosters(bestProj);
          if (posters[0]) {
            entries.push({
              key: `best-flat-${bestProj.id}`,
              url: posters[0].url,
              caption: loc(b.title),
              projectTitle: loc(b.title),
              groupLabel: language === 'bn' ? 'সেরা কাজ' : 'Best Work',
              posterNumber: 1,
              totalInGroup: 1,
              project: bestProj,
              indexInProject: 0
            });
          }
        });
    }

    return entries;
  }, [graphicProjects, bestGraphicWorks, groupFilter, behanceOnly, loc, language]);

  const videoCount = visibleVideos.length;
  const graphicCount = graphicProjects.length;

  return (
    <section
      id={mode === 'graphic' ? 'graphic-projects' : mode === 'video' ? 'video-projects' : 'projects'}
      className="py-20 bg-[#0E1014]/75 border-t border-white/[0.08] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <Reveal3D direction="up" className="flex flex-col items-center text-center mb-12">
          <span className="text-[11px] font-medium text-[#E4583B] uppercase tracking-[0.22em] mb-2.5">
            {mode === 'graphic'
              ? viewStyle === 'posters'
                ? language === 'bn'
                  ? 'সকল পোস্টার ও ডিজাইন'
                  : 'All Individual Posters'
                : language === 'bn'
                ? 'বিহ্যান্স প্রজেক্ট ও গ্রুপ'
                : 'Behance Project Groups'
              : mode === 'video'
              ? ui.projects.tabVideo
              : ui.projects.sectionTag}
          </span>
          <EditableElement id="portfolio.title" label="Portfolio Section Title" as="h2">
            <span className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F4F0E8] tracking-tight">
              {mode === 'graphic'
                ? groupFilter && groupFilter !== 'all'
                  ? groupFilter
                  : viewStyle === 'posters'
                  ? language === 'bn'
                    ? 'সকল পোস্টার গ্যালারি'
                    : 'Poster Gallery'
                  : ui.projects.tabGraphic
                : mode === 'video'
                ? ui.projects.tabVideo
                : ui.projects.title}
            </span>
          </EditableElement>
        </Reveal3D>

        {/* Mode Tabs */}
        {mode === 'all' && (
          <div className="flex justify-center space-x-3 rtl:space-x-reverse mb-12">
            <button
              onClick={() => setActiveTab('video')}
              className={`inline-flex items-center space-x-2 rtl:space-x-reverse px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'video'
                  ? 'glass-pill-cta'
                  : 'glass-pill-ghost text-[#A7A298] hover:text-[#F4F0E8]'
              }`}
            >
              <EditableElement id="portfolio.tabVideo" label="Video Tab Label" as="span">
                {ui.projects.tabVideo}
              </EditableElement>
              <span className="text-xs opacity-75 tabular-nums">({videoCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('graphic')}
              className={`inline-flex items-center space-x-2 rtl:space-x-reverse px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'graphic'
                  ? 'glass-pill-cta'
                  : 'glass-pill-ghost text-[#A7A298] hover:text-[#F4F0E8]'
              }`}
            >
              <EditableElement id="portfolio.tabGraphic" label="Graphic Tab Label" as="span">
                {ui.projects.tabGraphic}
              </EditableElement>
              <span className="text-xs opacity-75 tabular-nums">({graphicCount})</span>
            </button>
          </div>
        )}

        {effectiveTab === 'video' ? (
          <div className="mb-12">
            <VideoCardGrid
              videos={visibleVideos}
              onOpenVideo={onOpenVideo}
              emptyPlaceholder={ui.projects.emptyPlaceholder}
            />
          </div>
        ) : viewStyle === 'posters' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {flattenedPosters.length > 0 ? (
              flattenedPosters.map((entry, idx) => {
                const isBroken = brokenImages[entry.key];
                const col = idx % 3;
                const dir = col === 0 ? 'tilt-left' : col === 2 ? 'tilt-right' : 'up';
                return (
                  <Reveal3D key={entry.key} direction={dir} delay={col * 80}>
                    <div
                      onClick={() => onOpenLightbox?.(entry.project, entry.indexInProject)}
                      data-cursor="view"
                      className="h-full group rounded-[22px] glass-showcase-card overflow-hidden cursor-pointer flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="p-2.5 border-b border-white/[0.08]">
                        <Tilt3DImageStage className="aspect-[4/5] w-full" maxTilt={11} scaleOnHover={1.02}>
                          <div className="relative w-full h-full rounded-2xl glass-showcase-inner overflow-hidden flex items-center justify-center">
                            {entry.url && !isBroken ? (
                              <img
                                src={resolveAssetUrl(entry.url)}
                                alt={entry.caption}
                                referrerPolicy="no-referrer"
                                onError={() => setBrokenImages((prev) => ({ ...prev, [entry.key]: true }))}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center p-6 text-center space-y-2.5">
                                <StudioGlassIcon size="lg">
                                  <Palette className="w-5 h-5 text-[#F4F0E8]" strokeWidth={1.35} />
                                </StudioGlassIcon>
                                <span className="text-xs text-[#DDD1BE]">{entry.caption}</span>
                              </div>
                            )}

                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-full glass-pill-cta text-xs font-semibold">
                                <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                                <span>{language === 'bn' ? 'পোস্টার দেখুন' : 'Inspect Poster'}</span>
                              </span>
                            </div>
                          </div>
                        </Tilt3DImageStage>
                      </div>

                      <div className="p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[11px] text-[#A7A298] flex items-center gap-1.5 truncate">
                            <Layers className="w-3 h-3 text-[#E4583B] shrink-0" strokeWidth={1.35} />
                            <span className="truncate">{entry.groupLabel}</span>
                            {entry.totalInGroup > 1 && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="tabular-nums shrink-0">
                                  {entry.posterNumber}/{entry.totalInGroup}
                                </span>
                              </>
                            )}
                          </div>
                          <h3 className="text-sm font-semibold text-[#F4F0E8] group-hover:text-white transition-colors truncate mt-0.5">
                            {entry.caption}
                          </h3>
                        </div>

                        {entry.project.behanceUrl && (
                          <a
                            href={entry.project.behanceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 h-8 rounded-full glass-icon-disc flex items-center justify-center text-[11px] font-semibold shrink-0"
                            title="Open Behance Project"
                          >
                            Bē
                          </a>
                        )}
                      </div>
                    </div>
                  </Reveal3D>
                );
              })
            ) : (
              <div className="col-span-full p-12 text-center rounded-[22px] glass-showcase-card text-[#A7A298] text-sm">
                {ui.projects.emptyPlaceholder}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
            {graphicProjects.length > 0 ? (
              graphicProjects.map((project, projIdx) => {
                const posters = getProjectPosters(project);
                const coverPoster = posters[0]?.url || '';
                const coverKey = `${project.id}-cover`;
                const coverBroken = brokenImages[coverKey];
                const groupLabel = loc(project.groupName);

                return (
                  <Reveal3D
                    key={project.id}
                    direction={projIdx % 2 === 0 ? 'tilt-left' : 'tilt-right'}
                    delay={(projIdx % 2) * 95}
                  >
                    <div
                      onClick={() => onOpenLightbox?.(project, 0)}
                      data-cursor="view"
                      className="h-full group relative rounded-[22px] glass-showcase-card overflow-hidden flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="p-2.5 border-b border-white/[0.08]">
                        {posters.length >= 2 ? (
                          <Tilt3DImageStage className="aspect-[16/10] w-full" maxTilt={11} scaleOnHover={1.02}>
                            <div
                              className={`relative w-full h-full rounded-2xl glass-showcase-inner overflow-hidden grid gap-1.5 p-1.5 ${
                                posters.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                              }`}
                            >
                              {posters.slice(0, 3).map((poster, pIdx) => {
                                const tileKey = `${project.id}-tile-${pIdx}`;
                                const tileBroken = brokenImages[tileKey];
                                const showMoreBadge = pIdx === 2 && posters.length > 3;
                                return (
                                  <button
                                    key={tileKey}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenLightbox?.(project, pIdx);
                                    }}
                                    className="relative w-full h-full rounded-xl overflow-hidden bg-black/40 group/tile cursor-pointer focus:outline-none"
                                    title={poster.caption || `Poster ${pIdx + 1}`}
                                  >
                                    {!tileBroken ? (
                                      <img
                                        src={resolveAssetUrl(poster.url)}
                                        alt={poster.caption || `${loc(project.title)} - Poster ${pIdx + 1}`}
                                        referrerPolicy="no-referrer"
                                        onError={() =>
                                          setBrokenImages((prev) => ({ ...prev, [tileKey]: true }))
                                        }
                                        className="w-full h-full object-cover group-hover/tile:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-[#A7A298]">
                                        <Palette className="w-5 h-5" strokeWidth={1.35} />
                                      </div>
                                    )}

                                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/tile:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="w-8 h-8 rounded-full glass-pill-cta flex items-center justify-center">
                                        <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                                      </span>
                                    </div>

                                    {showMoreBadge && (
                                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-sm font-semibold text-[#F4F0E8] tracking-wide pointer-events-none">
                                        +{posters.length - 3}
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </Tilt3DImageStage>
                        ) : (
                          <Tilt3DImageStage className="aspect-[16/10] w-full" maxTilt={13} scaleOnHover={1.03}>
                            <div className="relative w-full h-full rounded-2xl glass-showcase-inner flex items-center justify-center overflow-hidden">
                              {coverPoster && !coverBroken ? (
                                <img
                                  src={resolveAssetUrl(coverPoster)}
                                  alt={loc(project.title)}
                                  referrerPolicy="no-referrer"
                                  onError={() => setBrokenImages((prev) => ({ ...prev, [coverKey]: true }))}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-2.5">
                                  <StudioGlassIcon size="lg">
                                    <Palette className="w-5 h-5 text-[#F4F0E8]" strokeWidth={1.35} />
                                  </StudioGlassIcon>
                                  <span className="text-xs text-[#DDD1BE] font-semibold line-clamp-1">
                                    {loc(project.title)}
                                  </span>
                                  <span className="text-[11px] text-[#A7A298]">
                                    {project.behanceUrl ? 'Behance Design Series' : 'Graphic Design'}
                                  </span>
                                </div>
                              )}

                              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 pointer-events-none">
                                <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-full glass-pill-cta text-xs font-semibold">
                                  <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                                  <span>
                                    {language === 'bn' ? 'বড় করে দেখুন' : 'Preview in Lightbox'}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </Tilt3DImageStage>
                        )}

                        {posters.length > 3 && (
                          <div className="mt-2.5 px-1 flex items-center gap-2 overflow-x-auto pb-0.5">
                            {posters.slice(3, 9).map((p, sliceIdx) => {
                              const realIdx = sliceIdx + 3;
                              const thumbKey = `${project.id}-t-${realIdx}`;
                              const isOverflowBadge = sliceIdx === 5 && posters.length > 9;
                              return (
                                <button
                                  key={thumbKey}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenLightbox?.(project, realIdx);
                                  }}
                                  className="relative w-12 h-12 rounded-xl overflow-hidden glass-showcase-inner hover:border-white/30 shrink-0 transition-all cursor-pointer group/thumb"
                                  title={p.caption || `Poster ${realIdx + 1}`}
                                >
                                  {!brokenImages[thumbKey] ? (
                                    <img
                                      src={resolveAssetUrl(p.url)}
                                      alt={p.caption || `Poster ${realIdx + 1}`}
                                      referrerPolicy="no-referrer"
                                      onError={() =>
                                        setBrokenImages((prev) => ({ ...prev, [thumbKey]: true }))
                                      }
                                      className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#A7A298]">
                                      <Grid className="w-4 h-4" strokeWidth={1.35} />
                                    </div>
                                  )}
                                  {isOverflowBadge && (
                                    <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-[11px] font-semibold text-white">
                                      +{posters.length - 8}
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex flex-col justify-between flex-1">
                        <div>
                          <div className="text-[11px] text-[#A7A298] mb-1.5 flex flex-wrap items-center gap-1.5">
                            <span className="text-[#E4583B] font-medium">
                              {groupLabel || 'Graphic Design'}
                            </span>
                            {posters.length > 0 && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="tabular-nums">
                                  {posters.length} {posters.length === 1 ? 'Poster' : 'Posters'}
                                </span>
                              </>
                            )}
                            {project.behanceUrl && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>Behance</span>
                              </>
                            )}
                          </div>

                          <h3 className="text-lg font-semibold text-[#F4F0E8] mb-2 group-hover:text-white transition-colors">
                            {loc(project.title)}
                          </h3>

                          <p className="text-xs sm:text-sm text-[#A7A298] leading-relaxed line-clamp-3">
                            {loc(project.description)}
                          </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            {project.behanceUrl && (
                              <a
                                href={project.behanceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center space-x-1 rtl:space-x-reverse px-3 py-1 rounded-full glass-pill-ghost text-[#EAE5DC] hover:text-white font-medium transition-colors"
                              >
                                <span>Bē</span>
                                <span>Behance</span>
                                <ExternalLink className="w-3 h-3" strokeWidth={1.35} />
                              </a>
                            )}
                            {project.externalUrl && (
                              <a
                                href={project.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center space-x-1 rtl:space-x-reverse px-3 py-1 rounded-full glass-pill-ghost text-[#EAE5DC] hover:text-white transition-colors"
                              >
                                <span>Link</span>
                                <ExternalLink className="w-3 h-3" strokeWidth={1.35} />
                              </a>
                            )}
                          </div>

                          <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-[#A7A298] group-hover:text-[#F4F0E8] transition-colors font-medium">
                            <span>{posters.length > 1 ? 'Open Group' : 'Preview'}</span>
                            <Eye className="w-3.5 h-3.5" strokeWidth={1.35} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Reveal3D>
                );
              })
            ) : (
              <div className="col-span-2 p-12 text-center rounded-[22px] glass-showcase-card text-[#A7A298] text-sm">
                {ui.projects.emptyPlaceholder}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
