import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { ProjectItem } from '../types/portfolio';
import { resolveAssetUrl } from '../utils/assetUrl';

interface LightboxModalProps {
  project: ProjectItem | null;
  initialIndex?: number;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ project, initialIndex = 0, onClose }) => {
  const { ui, loc, language } = usePortfolio();
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  const images = React.useMemo(() => {
    if (!project) return [];
    if (project.galleryImages && project.galleryImages.length > 0) {
      return project.galleryImages;
    }
    return project.coverImage ? [project.coverImage] : [];
  }, [project]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

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

  const currentImgUrl = images[currentIndex] || project.coverImage;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative flex flex-col max-w-5xl w-full max-h-[92vh] bg-[#12161A] border border-[#232B33] rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with title and close button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232B33] bg-[#0B0F12]/80 backdrop-blur-sm">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5722] animate-pulse" />
            <h3 className="font-semibold text-lg text-white truncate max-w-xs sm:max-w-md">
              {loc(project.title)}
            </h3>
            {images.length > 1 && (
              <span className="text-xs text-neutral-400 font-mono bg-neutral-800/80 px-2 py-0.5 rounded">
                {ui.lightbox.imageCount} {currentIndex + 1} / {images.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label={ui.lightbox.close}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800/80 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main image preview stage */}
        <div className="relative flex-1 flex items-center justify-center min-h-[300px] sm:min-h-[440px] max-h-[60vh] bg-black/60 p-2 sm:p-6 select-none overflow-hidden">
          {currentImgUrl ? (
            <img
              src={resolveAssetUrl(currentImgUrl)}
              alt={loc(project.title)}
              className="max-h-full max-w-full object-contain rounded-lg transition-all duration-300"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-neutral-400 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[#141A20] border border-[#232B33] flex items-center justify-center text-[#FF5722]">
                <span className="font-mono font-bold text-lg">Bē</span>
              </div>
              <p className="text-white font-medium">{loc(project.title)}</p>
              <p className="text-xs font-mono text-neutral-500">Preview artwork directly on Behance via button below</p>
            </div>
          )}

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-[#FF5722] text-white border border-neutral-700 hover:border-[#FF5722] transition-all shadow-lg"
                aria-label={ui.lightbox.prev}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-[#FF5722] text-white border border-neutral-700 hover:border-[#FF5722] transition-all shadow-lg"
                aria-label={ui.lightbox.next}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Bottom details & Behance Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 bg-[#0B0F12] border-t border-[#232B33]">
          <div className="text-sm text-neutral-300 line-clamp-2 max-w-xl text-center sm:text-left rtl:sm:text-right">
            {loc(project.description)}
          </div>

          <div className="flex items-center space-x-3 rtl:space-x-reverse shrink-0">
            {/* View on Behance CTA */}
            {project.behanceUrl && (
              <a
                href={project.behanceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 rtl:space-x-reverse px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-[#0057FF] hover:bg-[#0047D4] transition-all shadow-md hover:shadow-blue-500/20"
              >
                <span className="font-bold tracking-tight">Bē</span>
                <span>{ui.lightbox.viewBehance}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Optional External Link CTA */}
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
