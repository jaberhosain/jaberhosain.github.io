import React, { useState } from 'react';
import { Play, ExternalLink, Eye } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { ProjectItem, VideoShowcaseItem } from '../types/portfolio';
import { resolveAssetUrl } from '../utils/assetUrl';
import { EditableElement } from './common/EditableElement';
import { VideoCardGrid } from './VideoCardGrid';
import { Tilt3DImageStage } from './common/Tilt3DImageStage';

interface PortfolioProps {
  onOpenLightbox?: (project: ProjectItem) => void;
  onOpenVideo?: (video: VideoShowcaseItem) => void;
  onOpenAdmin?: () => void;
  mode?: 'all' | 'video' | 'graphic';
  platformFilter?: 'all' | 'youtube' | 'vimeo' | 'facebook';
  behanceOnly?: boolean;
}

export const Portfolio: React.FC<PortfolioProps> = ({
  onOpenLightbox,
  onOpenVideo,
  mode = 'all',
  platformFilter = 'all',
  behanceOnly = false
}) => {
  const { portfolio, ui, loc } = usePortfolio();
  const { projects = [], videos = [] } = portfolio;
  const [activeTab, setActiveTab] = useState<'video' | 'graphic'>(mode === 'graphic' ? 'graphic' : 'video');

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

  // Graphic Design tab reads portfolio.projects (category === 'graphic'), hiding items marked hidden/visible===false
  const graphicProjects = [...(projects || [])]
    .filter((p: any) => p.category === 'graphic' && p.visible !== false && !p.hidden && (!behanceOnly || Boolean(p.behanceUrl)))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const videoCount = visibleVideos.length;
  const graphicCount = graphicProjects.length;

  return (
    <section
      id={mode === 'graphic' ? 'graphic-projects' : mode === 'video' ? 'video-projects' : 'projects'}
      className="py-24 bg-[#0B0F12] border-t border-[#1D232A] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-md bg-[#181E24] border border-[#232B33] text-xs font-mono text-[#FF5722] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722]" />
            <span>
              {mode === 'graphic'
                ? ui.projects.tabGraphic
                : mode === 'video'
                ? ui.projects.tabVideo
                : ui.projects.sectionTag}
            </span>
          </div>
          <EditableElement id="portfolio.title" label="Portfolio Section Title" as="h2">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight uppercase">
              {mode === 'graphic'
                ? ui.projects.tabGraphic
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
              className={`inline-flex items-center space-x-2 rtl:space-x-reverse px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'video'
                  ? 'bg-[#FF5722] text-white glow-orange-sm'
                  : 'bg-[#181E24] text-neutral-400 hover:text-white border border-[#232B33]'
              }`}
            >
              <EditableElement id="portfolio.tabVideo" label="Video Tab Label" as="span">
                {ui.projects.tabVideo}
              </EditableElement>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-black/40 tabular-nums">
                {videoCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('graphic')}
              className={`inline-flex items-center space-x-2 rtl:space-x-reverse px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'graphic'
                  ? 'bg-[#FF5722] text-white glow-orange-sm'
                  : 'bg-[#181E24] text-neutral-400 hover:text-white border border-[#232B33]'
              }`}
            >
              <EditableElement id="portfolio.tabGraphic" label="Graphic Tab Label" as="span">
                {ui.projects.tabGraphic}
              </EditableElement>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-black/40 tabular-nums">
                {graphicCount}
              </span>
            </button>
          </div>
        )}

        {/* Scrollable Video Card Grid OR Graphic Design Grid */}
        {effectiveTab === 'video' ? (
          <div className="mb-12">
            <VideoCardGrid
              videos={visibleVideos}
              onOpenVideo={onOpenVideo}
              emptyPlaceholder={ui.projects.emptyPlaceholder}
            />
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {graphicProjects.length > 0 ? (
            graphicProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => onOpenLightbox?.(project)}
                className="group relative rounded-3xl bg-[#12161A] border border-[#232B33] hover:border-[#FF5722]/60 overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between cursor-pointer"
              >
                {/* Visual Stage with 3D Cursor-Responsive Tilt */}
                <div className="p-2.5 bg-[#0D1115] border-b border-[#232B33]">
                  <Tilt3DImageStage className="aspect-[16/10] w-full" maxTilt={15} scaleOnHover={1.03}>
                    <div className="relative w-full h-full rounded-2xl bg-[#181E24] flex items-center justify-center border border-[#232B33]/80 overflow-hidden shadow-xl">
                      {project.coverImage ? (
                        <img
                          src={resolveAssetUrl(project.coverImage)}
                          alt={loc(project.title)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                          <div className="w-14 h-14 rounded-full bg-[#0B0F12] border border-[#232B33] flex items-center justify-center text-[#FF5722]">
                            <Play className="w-6 h-6 fill-current translate-x-0.5" />
                          </div>
                          <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
                            GRAPHIC DESIGN
                          </span>
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="absolute top-3.5 left-3.5 rtl:left-auto rtl:right-3.5 px-3 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-black/80 text-[#FF5722] border border-[#232B33] z-10">
                        GRAPHIC DESIGN
                      </div>

                      {/* Subtle Lightbox Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2 rtl:space-x-reverse z-10 pointer-events-none">
                        <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-xl bg-black/85 border border-[#FF5722]/60 text-white text-xs font-mono font-medium shadow-xl">
                          <Eye className="w-4 h-4 text-[#FF5722]" />
                          <span>Preview in Lightbox</span>
                        </span>
                      </div>
                    </div>
                  </Tilt3DImageStage>
                </div>

                {/* Card Body */}
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#FF5722] transition-colors">
                      {loc(project.title)}
                    </h3>

                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-3">
                      {loc(project.description)}
                    </p>
                  </div>

                  {/* Action & Metadata Footer */}
                  <div className="mt-5 pt-4 border-t border-[#1D232A] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      {project.behanceUrl && (
                        <span className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 rounded-md bg-[#0057FF]/15 text-[#388BFD] border border-[#0057FF]/30 text-[11px] font-bold">
                          <span>Bē</span>
                          <span>Behance</span>
                        </span>
                      )}
                      {project.externalUrl && (
                        <span className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2 py-1 rounded-md bg-[#181E24] text-neutral-300 border border-[#232B33] text-[11px]">
                          <span>Link</span>
                          <ExternalLink className="w-3 h-3 text-[#FF5722]" />
                        </span>
                      )}
                    </div>

                    <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-neutral-400 group-hover:text-[#FF5722] transition-colors text-xs font-semibold">
                      <span>Preview</span>
                      <Eye className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))
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
