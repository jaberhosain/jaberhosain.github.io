import React, { useState, useMemo } from 'react';
import { ExternalLink, Eye, Palette, Layers, Grid } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { ProjectItem, VideoShowcaseItem } from '../types/portfolio';
import { resolveAssetUrl } from '../utils/assetUrl';
import { getProjectPosters } from '../lib/imageUrlResolver';
import { EditableElement } from './common/EditableElement';
import { VideoCardGrid } from './VideoCardGrid';
import { Tilt3DImageStage } from './common/Tilt3DImageStage';

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

  // Video Editing tab reads portfolio.videos, hiding items marked hidden/visible===false
  const visibleVideos = [...(videos || [])]
    .filter((v: any) => v.visible !== false && !v.hidden && matchesPlatform(v))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Graphic Design project groups
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

  // Flat individual poster entries across matching groups (and Best Work when showing All)
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

    // Also include Best Works in flat "All Posters" view when not restricted to a specific project group
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
      className="py-20 bg-[#0B0F12] border-t border-[#1D232A] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-xs font-mono text-[#FF5722] uppercase tracking-widest mb-2.5">
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
            <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight uppercase">
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
        </div>

        {/* Tab Pills (Only shown in combined 'all' mode) */}
        {mode === 'all' && (
          <div className="flex justify-center space-x-3 rtl:space-x-reverse mb-12">
            <button
              onClick={() => setActiveTab('video')}
              className={`inline-flex items-center space-x-2 rtl:space-x-reverse px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-[#FF5722] text-white glow-orange-sm'
                  : 'bg-[#181E24] text-neutral-400 hover:text-white border border-[#232B33]'
              }`}
            >
              <EditableElement id="portfolio.tabVideo" label="Video Tab Label" as="span">
                {ui.projects.tabVideo}
              </EditableElement>
              <span className="text-xs font-mono opacity-80 tabular-nums">
                ({videoCount})
              </span>
            </button>

            <button
              onClick={() => setActiveTab('graphic')}
              className={`inline-flex items-center space-x-2 rtl:space-x-reverse px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'graphic'
                  ? 'bg-[#FF5722] text-white glow-orange-sm'
                  : 'bg-[#181E24] text-neutral-400 hover:text-white border border-[#232B33]'
              }`}
            >
              <EditableElement id="portfolio.tabGraphic" label="Graphic Tab Label" as="span">
                {ui.projects.tabGraphic}
              </EditableElement>
              <span className="text-xs font-mono opacity-80 tabular-nums">
                ({graphicCount})
              </span>
            </button>
          </div>
        )}

        {/* Scrollable Video Card Grid OR Graphic Design Showcase */}
        {effectiveTab === 'video' ? (
          <div className="mb-12">
            <VideoCardGrid
              videos={visibleVideos}
              onOpenVideo={onOpenVideo}
              emptyPlaceholder={ui.projects.emptyPlaceholder}
            />
          </div>
        ) : viewStyle === 'posters' ? (
          /* ALL INDIVIDUAL POSTERS GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {flattenedPosters.length > 0 ? (
              flattenedPosters.map((entry) => {
                const isBroken = brokenImages[entry.key];
                return (
                  <div
                    key={entry.key}
                    onClick={() => onOpenLightbox?.(entry.project, entry.indexInProject)}
                    className="group rounded-2xl bg-[#12161A] border border-[#232B33] hover:border-[#FF5722]/60 overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-lg hover:-translate-y-1"
                  >
                    <div className="relative aspect-[4/5] bg-[#0D1115] overflow-hidden flex items-center justify-center border-b border-[#232B33]">
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
                          <Palette className="w-8 h-8 text-[#FF5722] mb-2" />
                          <span className="text-xs font-mono text-neutral-300">{entry.caption}</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-xl bg-black/85 border border-[#FF5722]/60 text-white text-xs font-mono">
                          <Eye className="w-4 h-4 text-[#FF5722]" />
                          <span>{language === 'bn' ? 'পোস্টার দেখুন' : 'Inspect Poster'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5 truncate">
                          <Layers className="w-3 h-3 text-[#FF5722] shrink-0" />
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
                        <h3 className="text-sm font-bold text-white group-hover:text-[#FF5722] transition-colors truncate mt-0.5">
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
                );
              })
            ) : (
              <div className="col-span-full p-12 text-center rounded-3xl bg-[#12161A] border border-[#232B33] text-neutral-400 text-sm">
                {ui.projects.emptyPlaceholder}
              </div>
            )}
          </div>
        ) : (
          /* GROUPED BEHANCE PROJECTS VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
            {graphicProjects.length > 0 ? (
              graphicProjects.map((project) => {
                const posters = getProjectPosters(project);
                const coverPoster = posters[0]?.url || '';
                const coverKey = `${project.id}-cover`;
                const coverBroken = brokenImages[coverKey];
                const groupLabel = loc(project.groupName);

                return (
                  <div
                    key={project.id}
                    onClick={() => onOpenLightbox?.(project, 0)}
                    className="group relative rounded-3xl bg-[#12161A] border border-[#232B33] hover:border-[#FF5722]/60 overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between cursor-pointer"
                  >
                    {/* Visual Stage with 3D Cursor-Responsive Tilt */}
                    <div className="p-2.5 bg-[#0D1115] border-b border-[#232B33]">
                      <Tilt3DImageStage className="aspect-[16/10] w-full" maxTilt={14} scaleOnHover={1.03}>
                        <div className="relative w-full h-full rounded-2xl bg-[#181E24] flex items-center justify-center border border-[#232B33]/80 overflow-hidden shadow-xl">
                          {coverPoster && !coverBroken ? (
                            <img
                              src={resolveAssetUrl(coverPoster)}
                              alt={loc(project.title)}
                              referrerPolicy="no-referrer"
                              onError={() => setBrokenImages((prev) => ({ ...prev, [coverKey]: true }))}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#141A20] via-[#12161A] to-[#0B0F12] flex flex-col items-center justify-center text-center p-6 space-y-2.5">
                              <div className="w-12 h-12 rounded-2xl bg-[#0B0F12] border border-[#232B33] flex items-center justify-center text-[#FF5722]">
                                <Palette className="w-6 h-6" />
                              </div>
                              <span className="text-xs font-mono text-neutral-300 font-semibold line-clamp-1">
                                {loc(project.title)}
                              </span>
                              <span className="text-[10px] font-mono text-neutral-500">
                                {project.behanceUrl ? 'Behance Design Series' : 'Graphic Design'}
                              </span>
                            </div>
                          )}

                          {/* Lightbox Hover Overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 pointer-events-none">
                            <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-xl bg-black/85 border border-[#FF5722]/60 text-white text-xs font-mono font-medium shadow-xl">
                              <Eye className="w-4 h-4 text-[#FF5722]" />
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

                      {/* Multi-Poster Interactive Strip Inside Project Group */}
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
                                className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#181E24] border border-[#232B33] hover:border-[#FF5722] shrink-0 transition-all cursor-pointer group/thumb"
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
                                  <div className="w-full h-full flex items-center justify-center text-neutral-500">
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

                    {/* Card Body */}
                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div>
                        {/* Quiet Unboxed Metadata */}
                        <div className="text-[11px] font-mono text-neutral-400 mb-1.5 flex flex-wrap items-center gap-1.5">
                          <span className="text-[#FF7043] uppercase tracking-wider font-semibold">
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

                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#FF5722] transition-colors">
                          {loc(project.title)}
                        </h3>

                        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-3">
                          {loc(project.description)}
                        </p>
                      </div>

                      {/* Clean Footer */}
                      <div className="mt-5 pt-4 border-t border-[#1D232A] flex items-center justify-between text-xs font-mono">
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
                              className="inline-flex items-center space-x-1 rtl:space-x-reverse text-neutral-300 hover:text-white transition-colors"
                            >
                              <span>Link</span>
                              <ExternalLink className="w-3 h-3 text-[#FF5722]" />
                            </a>
                          )}
                        </div>

                        <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-neutral-400 group-hover:text-[#FF5722] transition-colors font-semibold">
                          <span>{posters.length > 1 ? 'Open Group' : 'Preview'}</span>
                          <Eye className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 p-12 text-center rounded-3xl bg-[#12161A] border border-[#232B33] text-neutral-400 text-sm">
                {ui.projects.emptyPlaceholder}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
