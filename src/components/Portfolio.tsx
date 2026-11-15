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
      className="py-20 bg-[#14171E]/80 border-t border-[#2B303D] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <Reveal3D direction="up" className="flex flex-col items-center text-center mb-12">
          <span className="text-xs font-mono text-[#E4583B] uppercase tracking-[0.2em] mb-2.5">
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
              className={`inline-flex items-center space-x-2 rtl:space-x-reverse px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-[#E4583B] text-white'
                  : 'bg-[#181B22] text-[#A7A298] hover:text-[#F4F0E8] border border-[#2B303D]'
              }`}
            >
              <EditableElement id="portfolio.tabVideo" label="Video Tab Label" as="span">
                {ui.projects.tabVideo}
              </EditableElement>
              <span className="text-xs font-mono opacity-80 tabular-nums">({videoCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('graphic')}
              className={`inline-flex items-center space-x-2 rtl:space-x-reverse px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'graphic'
                  ? 'bg-[#E4583B] text-white'
                  : 'bg-[#181B22] text-[#A7A298] hover:text-[#F4F0E8] border border-[#2B303D]'
              }`}
            >
              <EditableElement id="portfolio.tabGraphic" label="Graphic Tab Label" as="span">
                {ui.projects.tabGraphic}
              </EditableElement>
              <span className="text-xs font-mono opacity-80 tabular-nums">({graphicCount})</span>
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
                      className="h-full group rounded-2xl studio-card overflow-hidden cursor-pointer flex flex-col justify-between hover:-translate-y-1"
                    >
                      <div className="p-2.5 bg-[#121419]/90 border-b border-[#2B303D]">
                        <Tilt3DImageStage className="aspect-[4/5] w-full" maxTilt={11} scaleOnHover={1.02}>
                          <div className="relative w-full h-full rounded-xl bg-[#0E1015] overflow-hidden flex items-center justify-center">
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
                              <div className="flex flex-col items-center justify-center p-6 text-center">
                                <Palette className="w-8 h-8 text-[#E4583B] mb-2" />
                                <span className="text-xs font-mono text-[#DDD1BE]">{entry.caption}</span>
                              </div>
                            )}

                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-lg bg-[#121419]/95 border border-[#E4583B]/60 text-[#F4F0E8] text-xs font-mono">
                                <Eye className="w-4 h-4 text-[#E4583B]" />
                                <span>{language === 'bn' ? 'পোস্টার দেখুন' : 'Inspect Poster'}</span>
                              </span>
                            </div>
                          </div>
                        </Tilt3DImageStage>
                      </div>

                      <div className="p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[11px] font-mono text-[#A7A298] flex items-center gap-1.5 truncate">
                            <Layers className="w-3 h-3 text-[#E4583B] shrink-0" />
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
                          <h3 className="text-sm font-bold text-[#F4F0E8] group-hover:text-[#E4583B] transition-colors truncate mt-0.5">
                            {entry.caption}
                          </h3>
                        </div>

                        {entry.project.behanceUrl && (
                          <a
                            href={entry.project.behanceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-mono font-bold text-[#60A5FA] hover:text-white shrink-0"
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
              <div className="col-span-full p-12 text-center rounded-2xl studio-card text-[#A7A298] text-sm">
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
                      className="h-full group relative rounded-2xl studio-card overflow-hidden flex flex-col justify-between cursor-pointer hover:-translate-y-1"
                    >
                      <div className="p-2.5 bg-[#121419]/90 border-b border-[#2B303D]">
                        <Tilt3DImageStage className="aspect-[16/10] w-full" maxTilt={13} scaleOnHover={1.03}>
                          <div className="relative w-full h-full rounded-xl bg-[#20242E] flex items-center justify-center border border-[#2B303D] overflow-hidden">
                            {coverPoster && !coverBroken ? (
                              <img
                                src={resolveAssetUrl(coverPoster)}
                                alt={loc(project.title)}
                                referrerPolicy="no-referrer"
                                onError={() => setBrokenImages((prev) => ({ ...prev, [coverKey]: true }))}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#181B22] flex flex-col items-center justify-center text-center p-6 space-y-2.5">
                                <div className="w-11 h-11 rounded-xl bg-[#121419] border border-[#2B303D] flex items-center justify-center text-[#E4583B]">
                                  <Palette className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-mono text-[#DDD1BE] font-semibold line-clamp-1">
                                  {loc(project.title)}
                                </span>
                                <span className="text-[10px] font-mono text-[#A7A298]">
                                  {project.behanceUrl ? 'Behance Design Series' : 'Graphic Design'}
                                </span>
                              </div>
                            )}

                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 pointer-events-none">
                              <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-lg bg-[#121419]/95 border border-[#E4583B]/60 text-[#F4F0E8] text-xs font-mono font-medium">
                                <Eye className="w-4 h-4 text-[#E4583B]" />
                                <span>
                                  {posters.length > 1
                                    ? language === 'bn'
                                      ? `সব ${posters.length}টি পোস্টার দেখুন`
                                      : `Browse ${posters.length} Posters`
                                    : language === 'bn'
                                    ? 'বড় করে দেখুন'
                                    : 'Preview in Lightbox'}
                                </span>
                              </span>
                            </div>
                          </div>
                        </Tilt3DImageStage>

                        {posters.length > 1 && (
                          <div className="mt-2.5 px-1 flex items-center gap-2 overflow-x-auto pb-0.5">
                            {posters.slice(0, 6).map((p, idx) => {
                              const thumbKey = `${project.id}-t-${idx}`;
                              const isOverflowBadge = idx === 5 && posters.length > 6;
                              return (
                                <button
                                  key={thumbKey}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenLightbox?.(project, idx);
                                  }}
                                  className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#20242E] border border-[#2B303D] hover:border-[#E4583B] shrink-0 transition-all cursor-pointer group/thumb"
                                  title={p.caption || `Poster ${idx + 1}`}
                                >
                                  {!brokenImages[thumbKey] ? (
                                    <img
                                      src={resolveAssetUrl(p.url)}
                                      alt={p.caption || `Poster ${idx + 1}`}
                                      referrerPolicy="no-referrer"
                                      onError={() =>
                                        setBrokenImages((prev) => ({ ...prev, [thumbKey]: true }))
                                      }
                                      className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#A7A298]">
                                      <Grid className="w-4 h-4" />
                                    </div>
                                  )}
                                  {isOverflowBadge && (
                                    <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-[11px] font-mono font-bold text-white">
                                      +{posters.length - 5}
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
                          <div className="text-[11px] font-mono text-[#A7A298] mb-1.5 flex flex-wrap items-center gap-1.5">
                            <span className="text-[#E4583B] uppercase tracking-wider font-semibold">
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

                          <h3 className="text-lg font-bold text-[#F4F0E8] mb-2 group-hover:text-[#E4583B] transition-colors">
                            {loc(project.title)}
                          </h3>

                          <p className="text-xs sm:text-sm text-[#A7A298] leading-relaxed line-clamp-3">
                            {loc(project.description)}
                          </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-[#2B303D] flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            {project.behanceUrl && (
                              <a
                                href={project.behanceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center space-x-1 rtl:space-x-reverse text-[#60A5FA] hover:text-white font-bold transition-colors"
                              >
                                <span>Bē</span>
                                <span>Behance</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {project.externalUrl && (
                              <a
                                href={project.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center space-x-1 rtl:space-x-reverse text-[#DDD1BE] hover:text-white transition-colors"
                              >
                                <span>Link</span>
                                <ExternalLink className="w-3 h-3 text-[#E4583B]" />
                              </a>
                            )}
                          </div>

                          <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-[#A7A298] group-hover:text-[#E4583B] transition-colors font-semibold">
                            <span>{posters.length > 1 ? 'Open Group' : 'Preview'}</span>
                            <Eye className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Reveal3D>
                );
              })
            ) : (
              <div className="col-span-2 p-12 text-center rounded-2xl studio-card text-[#A7A298] text-sm">
                {ui.projects.emptyPlaceholder}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
