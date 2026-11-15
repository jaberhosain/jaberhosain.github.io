import React, { useEffect, useCallback, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink, ZoomIn, ZoomOut, Palette, LayoutGrid, Maximize2 } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { ProjectItem } from '../types/portfolio';
import { resolveAssetUrl } from '../utils/assetUrl';
import { getProjectPosters } from '../lib/imageUrlResolver';

interface LightboxModalProps {
  project: ProjectItem | null;
  initialIndex?: number;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ project, initialIndex = 0, onClose }) => {
  const { ui, loc, language } = usePortfolio();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [zoomed, setZoomed] = useState(false);
  const [imgError, setImgError] = useState(false);

  const posters = React.useMemo(() => {
    if (!project) return [];
    return getProjectPosters(project);
  }, [project]);

  useEffect(() => {
    const safeIdx = posters.length > 0 ? Math.min(Math.max(0, initialIndex), posters.length - 1) : 0;
    setCurrentIndex(safeIdx);
    setViewMode('single');
    setZoomed(false);
    setImgError(false);
  }, [project, initialIndex, posters.length]);

  useEffect(() => {
    setImgError(false);
    setZoomed(false);
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (posters.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % posters.length);
  }, [posters.length]);

  const handlePrev = useCallback(() => {
    if (posters.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + posters.length) % posters.length);
  }, [posters.length]);

  // Keyboard navigation: Esc to close, Arrow keys to navigate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (viewMode === 'single' && e.key === 'ArrowRight') {
        if (language === 'ar') handlePrev();
        else handleNext();
      } else if (viewMode === 'single' && e.key === 'ArrowLeft') {
        if (language === 'ar') handleNext();
        else handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleNext, handlePrev, language, viewMode]);

  // Prevent background body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!project) return null;

  const currentPoster = posters[currentIndex];
  const currentImgUrl = currentPoster?.url || '';
  const currentCaption = currentPoster?.caption || '';
  const groupLabel = loc(project.groupName);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md p-3 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col max-w-5xl w-full max-h-[94vh] glass-showcase-card rounded-[24px] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with group context, view toggle, zoom toggle & close button */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#E4583B] shrink-0" />
            <div className="min-w-0">
              {groupLabel && (
                <div className="text-[11px] font-medium text-[#E4583B] truncate">
                  {groupLabel}
                </div>
              )}
              <h3 className="font-semibold text-sm sm:text-lg text-[#F4F0E8] truncate">
                {loc(project.title)}
              </h3>
            </div>
            {posters.length > 1 && (
              <span className="text-xs text-[#A7A298] whitespace-nowrap shrink-0 tabular-nums">
                {viewMode === 'grid'
                  ? `${posters.length} ${language === 'bn' ? 'টি পোস্টার' : 'Posters'}`
                  : `${currentIndex + 1} / ${posters.length}`}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse shrink-0">
            {posters.length > 1 && (
              <button
                type="button"
                onClick={() => setViewMode((m) => (m === 'single' ? 'grid' : 'single'))}
                className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 h-9 rounded-full glass-pill-ghost text-xs font-medium text-[#EAE5DC] hover:text-white cursor-pointer"
                title={viewMode === 'single' ? 'View all posters separately' : 'Single poster view'}
              >
                {viewMode === 'single' ? (
                  <>
                    <LayoutGrid className="w-3.5 h-3.5" strokeWidth={1.4} />
                    <span className="hidden sm:inline">
                      {language === 'bn' ? 'সব পোস্টার' : 'All Posters'}
                    </span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.4} />
                    <span className="hidden sm:inline">
                      {language === 'bn' ? 'একটি করে দেখুন' : 'Single View'}
                    </span>
                  </>
                )}
              </button>
            )}

            {viewMode === 'single' && currentImgUrl && !imgError && (
              <button
                type="button"
                onClick={() => setZoomed((z) => !z)}
                aria-label={zoomed ? 'Fit to screen' : 'Zoom in'}
                className="w-9 h-9 rounded-full glass-icon-disc flex items-center justify-center cursor-pointer"
                title={zoomed ? 'Fit view' : 'Zoom view'}
              >
                {zoomed ? <ZoomOut className="w-4 h-4" strokeWidth={1.35} /> : <ZoomIn className="w-4 h-4" strokeWidth={1.35} />}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label={ui.lightbox.close}
              className="w-9 h-9 rounded-full glass-icon-disc flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" strokeWidth={1.35} />
            </button>
          </div>
        </div>

        {/* Main stage: Either All-Posters Separate Grid OR Single Zoomable Poster */}
        {viewMode === 'grid' && posters.length > 1 ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-black/60 max-h-[68vh]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {posters.map((p, idx) => (
                <button
                  key={`${p.url}-${idx}`}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setViewMode('single');
                  }}
                  className="group text-left rounded-2xl glass-showcase-inner overflow-hidden border border-white/[0.08] hover:border-white/25 transition-all cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-[4/5] w-full bg-black/50 overflow-hidden">
                    <img
                      src={resolveAssetUrl(p.url)}
                      alt={p.caption || `Poster ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3.5 py-1.5 rounded-full glass-pill-cta text-xs font-semibold">
                        {language === 'bn' ? 'আলাদা করে দেখুন' : 'Inspect Poster'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 flex items-center justify-between gap-2 text-xs">
                    <span className="text-[#F4F0E8] font-medium truncate">
                      {p.caption || `${language === 'bn' ? 'পোস্টার' : 'Poster'} #${idx + 1}`}
                    </span>
                    <span className="text-[11px] text-[#A7A298] tabular-nums shrink-0">
                      #{idx + 1}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div
            className={`relative flex-1 flex items-center justify-center min-h-[260px] sm:min-h-[420px] max-h-[60vh] bg-black/70 select-none ${
              zoomed ? 'overflow-auto p-4' : 'overflow-hidden p-2 sm:p-6'
            }`}
          >
            {currentImgUrl && !imgError ? (
              <img
                key={currentImgUrl}
                src={resolveAssetUrl(currentImgUrl)}
                alt={currentCaption || loc(project.title)}
                referrerPolicy="no-referrer"
                onClick={() => setZoomed((z) => !z)}
                onError={() => setImgError(true)}
                className={`rounded-lg transition-all duration-300 ${
                  zoomed
                    ? 'max-w-none max-h-none w-auto h-auto cursor-zoom-out'
                    : 'max-h-full max-w-full object-contain cursor-zoom-in'
                }`}
                loading="eager"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-neutral-400 space-y-3">
                <div className="w-16 h-16 rounded-full glass-icon-disc flex items-center justify-center text-[#F4F0E8]">
                  {project.behanceUrl ? (
                    <span className="font-semibold text-lg">Bē</span>
                  ) : (
                    <Palette className="w-6 h-6" strokeWidth={1.35} />
                  )}
                </div>
                <p className="text-[#F4F0E8] font-medium">{currentCaption || loc(project.title)}</p>
                <p className="text-xs text-[#A7A298] max-w-md">
                  {imgError
                    ? 'External host blocked direct preview. Open the project directly on Behance using the button below.'
                    : 'Preview artwork directly on Behance via the button below.'}
                </p>
              </div>
            )}

            {/* Navigation buttons */}
            {posters.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full glass-icon-disc flex items-center justify-center shadow-lg cursor-pointer"
                  aria-label={ui.lightbox.prev}
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={1.35} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full glass-icon-disc flex items-center justify-center shadow-lg cursor-pointer"
                  aria-label={ui.lightbox.next}
                >
                  <ChevronRight className="w-5 h-5" strokeWidth={1.35} />
                </button>
              </>
            )}
          </div>
        )}

        {/* Multi-poster thumbnail filmstrip inside Project Group */}
        {viewMode === 'single' && posters.length > 1 && (
          <div className="px-4 sm:px-6 py-2.5 bg-black/50 border-t border-white/[0.08] flex items-center gap-2 overflow-x-auto">
            {posters.map((p, idx) => (
              <button
                key={`${p.url}-${idx}`}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                  idx === currentIndex
                    ? 'border-[#E4583B] ring-2 ring-[#E4583B]/30 scale-105'
                    : 'border-white/[0.12] opacity-65 hover:opacity-100'
                }`}
                title={p.caption || `Poster ${idx + 1}`}
              >
                <img
                  src={resolveAssetUrl(p.url)}
                  alt={p.caption || `Poster ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Bottom details & Behance Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-white/[0.08]">
          <div className="min-w-0 text-center sm:text-left rtl:sm:text-right">
            {currentCaption && (
              <div className="text-xs font-semibold text-[#F07C63] mb-0.5 truncate">
                {currentCaption}
              </div>
            )}
            <div className="text-xs sm:text-sm text-[#A7A298] line-clamp-2 max-w-xl">
              {loc(project.description)}
            </div>
          </div>

          <div className="flex items-center space-x-3 rtl:space-x-reverse shrink-0">
            {project.behanceUrl && (
              <a
                href={project.behanceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 rtl:space-x-reverse px-5 py-2.5 rounded-full glass-pill-cta font-semibold text-xs sm:text-sm transition-all"
              >
                <span className="font-bold tracking-tight">Bē</span>
                <span>{ui.lightbox.viewBehance}</span>
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
              </a>
            )}

            {project.externalUrl && (
              <a
                href={project.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 rtl:space-x-reverse px-4 py-2.5 rounded-full glass-pill-ghost font-medium text-xs sm:text-sm transition-all"
              >
                <span>Project Link</span>
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.35} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
