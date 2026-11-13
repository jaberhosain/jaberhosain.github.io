import React, { useEffect, useCallback, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink, ZoomIn, ZoomOut, Palette } from 'lucide-react';
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
  const [zoomed, setZoomed] = useState(false);
  const [imgError, setImgError] = useState(false);

  const posters = React.useMemo(() => {
    if (!project) return [];
    return getProjectPosters(project);
  }, [project]);

  useEffect(() => {
    const safeIdx = posters.length > 0 ? Math.min(Math.max(0, initialIndex), posters.length - 1) : 0;
    setCurrentIndex(safeIdx);
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
      } else if (e.key === 'ArrowRight') {
        if (language === 'ar') handlePrev();
        else handleNext();
      } else if (e.key === 'ArrowLeft') {
        if (language === 'ar') handleNext();
        else handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleNext, handlePrev, language]);

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
        className="relative flex flex-col max-w-5xl w-full max-h-[94vh] bg-[#12161A] border border-[#232B33] rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with group context, title, zoom toggle & close button */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-[#232B33] bg-[#0B0F12]/90">
          <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5722] shrink-0" />
            <div className="min-w-0">
              {groupLabel && (
                <div className="text-[11px] font-mono text-[#FF7043] truncate">
                  {groupLabel}
                </div>
              )}
              <h3 className="font-semibold text-sm sm:text-lg text-white truncate">
                {loc(project.title)}
              </h3>
            </div>
            {posters.length > 1 && (
              <span className="text-xs text-neutral-400 font-mono whitespace-nowrap shrink-0 tabular-nums">
                {currentIndex + 1} / {posters.length}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1.5 rtl:space-x-reverse shrink-0">
            {currentImgUrl && !imgError && (
              <button
                type="button"
                onClick={() => setZoomed((z) => !z)}
                aria-label={zoomed ? 'Fit to screen' : 'Zoom in'}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800/80 rounded-lg transition-colors cursor-pointer"
                title={zoomed ? 'Fit view' : 'Zoom view'}
              >
                {zoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label={ui.lightbox.close}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800/80 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main image preview stage */}
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
              <div className="w-16 h-16 rounded-2xl bg-[#141A20] border border-[#232B33] flex items-center justify-center text-[#FF5722]">
                {project.behanceUrl ? (
                  <span className="font-mono font-bold text-lg">Bē</span>
                ) : (
                  <Palette className="w-7 h-7" />
                )}
              </div>
              <p className="text-white font-medium">{currentCaption || loc(project.title)}</p>
              <p className="text-xs font-mono text-neutral-500 max-w-md">
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
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/70 hover:bg-[#FF5722] text-white border border-neutral-700 hover:border-[#FF5722] transition-all shadow-lg cursor-pointer"
                aria-label={ui.lightbox.prev}
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/70 hover:bg-[#FF5722] text-white border border-neutral-700 hover:border-[#FF5722] transition-all shadow-lg cursor-pointer"
                aria-label={ui.lightbox.next}
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}
        </div>

        {/* Multi-poster thumbnail filmstrip inside Project Group */}
        {posters.length > 1 && (
          <div className="px-4 sm:px-6 py-2.5 bg-[#0E1318] border-t border-[#1D232A] flex items-center gap-2 overflow-x-auto">
            {posters.map((p, idx) => (
              <button
                key={`${p.url}-${idx}`}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                  idx === currentIndex
                    ? 'border-[#FF5722] ring-2 ring-[#FF5722]/30 scale-105'
                    : 'border-[#232B33] opacity-65 hover:opacity-100'
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 bg-[#0B0F12] border-t border-[#232B33]">
          <div className="min-w-0 text-center sm:text-left rtl:sm:text-right">
            {currentCaption && (
              <div className="text-xs font-mono font-semibold text-[#FF7043] mb-0.5 truncate">
                {currentCaption}
              </div>
            )}
            <div className="text-xs sm:text-sm text-neutral-300 line-clamp-2 max-w-xl">
              {loc(project.description)}
            </div>
          </div>

          <div className="flex items-center space-x-3 rtl:space-x-reverse shrink-0">
            {project.behanceUrl && (
              <a
                href={project.behanceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 rtl:space-x-reverse px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-[#0057FF] hover:bg-[#0047D4] transition-all shadow-md"
              >
                <span className="font-bold tracking-tight">Bē</span>
                <span>{ui.lightbox.viewBehance}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {project.externalUrl && (
              <a
                href={project.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 rtl:space-x-reverse px-4 py-2.5 rounded-xl font-medium text-sm text-white bg-[#181E24] hover:bg-[#232B33] border border-[#232B33] transition-all"
              >
                <span>Project Link</span>
                <ExternalLink className="w-4 h-4 text-[#FF5722]" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
