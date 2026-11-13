import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  ChevronLeft,
  ChevronRight,
  Sliders,
  ExternalLink,
  Youtube,
  Facebook,
  Gauge,
  Square
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { VideoShowcaseItem } from '../types/portfolio';
import { extractYouTubeId } from './VideoModal';
import { extractVimeoInfo, VimeoIcon } from '../lib/videoUtils';
import { resolveAssetUrl } from '../utils/assetUrl';
import { Tilt3DImageStage } from './common/Tilt3DImageStage';

export interface VideoParallaxCarouselProps {
  videos: any[];
  onOpenVideo?: (video: VideoShowcaseItem) => void;
  emptyPlaceholder?: string;
}

type SpeedMode = 'slow' | 'medium' | 'high' | 'custom';

export const VideoParallaxCarousel: React.FC<VideoParallaxCarouselProps> = ({
  videos,
  onOpenVideo,
  emptyPlaceholder = 'No videos added yet.'
}) => {
  const { loc, language, portfolio } = usePortfolio();
  const total = videos.length;

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMode, setSpeedMode] = useState<SpeedMode>('medium');
  const [customSeconds, setCustomSeconds] = useState<number>(3.5);
  const [isStageHovered, setIsStageHovered] = useState<boolean>(false);

  const [failedThumbnails, setFailedThumbnails] = useState<Record<string, boolean>>({});
  const [fallbackThumbnails, setFallbackThumbnails] = useState<Record<string, string>>({});

  // Keep activeIndex valid if video list changes
  useEffect(() => {
    if (total > 0 && activeIndex >= total) {
      setActiveIndex(0);
    }
  }, [total, activeIndex]);

  const handleImageError = (id: string, currentSrc: string) => {
    if (currentSrc.includes('maxresdefault.jpg')) {
      const hqFallback = currentSrc.replace('maxresdefault.jpg', 'hqdefault.jpg');
      setFallbackThumbnails((prev) => ({ ...prev, [id]: hqFallback }));
    } else {
      setFailedThumbnails((prev) => ({ ...prev, [id]: true }));
    }
  };

  const currentSeconds =
    speedMode === 'slow'
      ? 6.0
      : speedMode === 'medium'
      ? 3.2
      : speedMode === 'high'
      ? 1.5
      : Math.max(0.8, Math.min(20, customSeconds || 3.5));

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-slide timer driven by selected speed & play/stop state
  useEffect(() => {
    if (!isPlaying || total <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, currentSeconds * 1000);

    return () => clearInterval(timer);
  }, [isPlaying, currentSeconds, handleNext, total]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePrev, handleNext]);

  if (total === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-[#12161A] border border-[#232B33] text-neutral-400 text-sm max-w-3xl mx-auto">
        {emptyPlaceholder}
      </div>
    );
  }

  const activeVideo = videos[activeIndex] || videos[0];
  const activeVideoTitle = loc(activeVideo?.title) || `Video Project #${activeIndex + 1}`;
  const activeVideoDesc = activeVideo?.description ? loc(activeVideo.description) : '';

  const openVideoPayload = (video: any) => {
    if (video.videoUrl && onOpenVideo) {
      onOpenVideo({
        id: video.id,
        title: video.title,
        description: video.description,
        videoType: (video.videoType as any) || 'youtube',
        videoUrl: video.videoUrl,
        videoId: video.videoId,
        videoHash: video.videoHash,
        thumbnailUrl: video.thumbnailUrl,
        customThumbnailUrl: video.customThumbnailUrl,
        duration: video.duration,
        order: video.order
      });
    }
  };

  return (
    <div className="w-full select-none">
      {/* Speed & Playback Control Bar */}
      <div className="max-w-4xl mx-auto mb-8 p-3 sm:p-4 rounded-3xl bg-[#0E1216]/95 border border-[#232B33] backdrop-blur-xl shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Play / Stop Control */}
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className={`px-4 py-2 rounded-2xl text-xs font-mono font-bold flex items-center space-x-2 rtl:space-x-reverse transition-all ${
              isPlaying
                ? 'bg-[#181E24] hover:bg-[#202830] text-emerald-400 border border-emerald-500/40'
                : 'bg-[#FF5722] hover:bg-[#F4511E] text-white glow-orange-sm'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3 h-3 fill-current" />
                <span>{language === 'bn' ? 'স্টপ রাখুন' : 'STOP SLIDE'}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{language === 'bn' ? 'স্লাইড চালু করুন' : 'START SLIDE'}</span>
              </>
            )}
          </button>

          {/* Speed Presets: Slow / Medium / High / Custom */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#080B0D] border border-[#1D232A]">
            <button
              type="button"
              onClick={() => {
                setSpeedMode('slow');
                setIsPlaying(true);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                speedMode === 'slow'
                  ? 'bg-[#FF5722] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {language === 'bn' ? 'স্লো (6s)' : 'Slow'}
            </button>

            <button
              type="button"
              onClick={() => {
                setSpeedMode('medium');
                setIsPlaying(true);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                speedMode === 'medium'
                  ? 'bg-[#FF5722] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {language === 'bn' ? 'মিডিয়াম (3.2s)' : 'Medium'}
            </button>

            <button
              type="button"
              onClick={() => {
                setSpeedMode('high');
                setIsPlaying(true);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                speedMode === 'high'
                  ? 'bg-[#FF5722] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {language === 'bn' ? 'হাই (1.5s)' : 'High'}
            </button>

            <button
              type="button"
              onClick={() => {
                setSpeedMode('custom');
                setIsPlaying(true);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-1 rtl:space-x-reverse ${
                speedMode === 'custom'
                  ? 'bg-[#FF5722] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>{language === 'bn' ? 'কাস্টম' : 'Custom'}</span>
            </button>
          </div>

          {/* Numeric Speed Indicator & Slide Counter */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div
              className="px-3 py-1.5 rounded-xl bg-[#141A20] border border-[#232B33] text-xs font-mono font-bold flex items-center space-x-1.5 rtl:space-x-reverse"
              title="Current Slide Speed"
            >
              <Gauge className="w-3.5 h-3.5 text-[#FF5722]" />
              <span className={isPlaying ? 'text-white' : 'text-neutral-500'}>
                {isPlaying ? `${currentSeconds.toFixed(1)}s` : '0.0s (Stopped)'}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-[#141A20] border border-[#232B33] text-xs font-mono font-bold text-white">
              <span className="text-[#FF5722]">{String(activeIndex + 1).padStart(2, '0')}</span>
              <span className="text-neutral-500"> / {String(total).padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* Custom Speed Control Section */}
        {speedMode === 'custom' && (
          <div className="mt-3 pt-3 border-t border-[#1D232A] flex flex-wrap items-center justify-between gap-4 px-2 text-xs font-mono">
            <span className="text-neutral-300">
              {language === 'bn'
                ? 'কাস্টম স্লাইড স্পিড সেট করুন (সেকেন্ড):'
                : 'Custom Slide Speed (seconds per slide):'}
            </span>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <input
                type="range"
                min="1"
                max="15"
                step="0.5"
                value={customSeconds}
                onChange={(e) => {
                  setCustomSeconds(parseFloat(e.target.value));
                  setIsPlaying(true);
                }}
                className="w-36 sm:w-48 accent-[#FF5722] cursor-pointer"
              />
              <input
                type="number"
                min="0.8"
                max="30"
                step="0.5"
                value={customSeconds}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!Number.isNaN(val)) {
                    setCustomSeconds(Math.max(0.8, Math.min(30, val)));
                    setIsPlaying(true);
                  }
                }}
                className="w-16 px-2 py-1 rounded-lg bg-[#080B0D] border border-[#232B33] text-[#FF5722] font-bold text-center focus:border-[#FF5722] focus:outline-none"
              />
              <span className="text-neutral-400">sec</span>
            </div>
          </div>
        )}
      </div>

      {/* 3D PARALLAX STACK STAGE (Matching Screenshot Anatomy) */}
      <div
        onMouseEnter={() => setIsStageHovered(true)}
        onMouseLeave={() => setIsStageHovered(false)}
        className="relative h-[490px] sm:h-[540px] w-full flex items-center justify-center [perspective:1500px] overflow-hidden"
      >
        {/* Floating Circular VIEW Pill (Left side matching screenshot) */}
        <button
          type="button"
          onClick={() => openVideoPayload(activeVideo)}
          className={`hidden md:flex absolute top-1/3 left-6 lg:left-16 z-50 w-16 h-16 rounded-full bg-white text-black font-mono font-bold text-xs uppercase tracking-widest items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.65)] transition-all duration-300 hover:scale-110 ${
            isStageHovered ? 'opacity-100 scale-100' : 'opacity-85 scale-95'
          }`}
          title="Watch Active Video"
        >
          VIEW
        </button>

        {/* 3D Card Stack */}
        <div className="relative w-full h-full flex items-center justify-center [transform-style:preserve-3d]">
          {videos.map((video, idx) => {
            // Compute cyclic distance from activeIndex
            let diff = (idx - activeIndex + total) % total;
            if (diff > total / 2) diff -= total;

            const absDiff = Math.abs(diff);
            const isCenter = diff === 0;

            // Keep up to 2 cards on each side visible in 3D space (5 cards fanned like screenshot)
            if (absDiff > 2 && total > 4) return null;

            const ytId = extractYouTubeId(video.videoUrl);
            const vimeoInfo = extractVimeoInfo(video.videoUrl);
            const isVimeo = video.videoType === 'vimeo' || Boolean(vimeoInfo.id);
            const isYouTube = !isVimeo && (video.videoType === 'youtube' || Boolean(ytId));
            const isFacebook =
              !isVimeo &&
              !isYouTube &&
              (video.videoType === 'facebook' ||
                (video.videoUrl &&
                  (video.videoUrl.includes('facebook.com') || video.videoUrl.includes('fb.watch'))));

            const autoYtThumb = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : '';
            const rawThumbnail = video.customThumbnailUrl || video.thumbnailUrl || autoYtThumb;
            const thumbnail = fallbackThumbnails[video.id] || rawThumbnail;
            const hasValidThumb = Boolean(thumbnail && !failedThumbnails[video.id]);
            const videoTitle =
              loc(video.title) ||
              (isVimeo
                ? `Vimeo Video ${idx + 1}`
                : isYouTube
                ? `YouTube Video ${idx + 1}`
                : isFacebook
                ? `Facebook Video ${idx + 1}`
                : `Video ${idx + 1}`);

            // Smooth 3D fanned stacking matching the screenshot depth
            let transX = 0;
            let rotY = 0;
            let transZ = 0;
            let scale = 1;
            let opacity = 1;
            let zIndex = 30;
            let brightness = 1;

            if (isCenter) {
              transX = 0;
              rotY = 0;
              transZ = 90;
              scale = 1.03;
              opacity = 1;
              zIndex = 40;
              brightness = 1;
            } else {
              const sign = diff < 0 ? -1 : 1;
              transX = diff * 165;
              rotY = -sign * (18 + absDiff * 6);
              transZ = -absDiff * 95;
              scale = Math.max(0.74, 1 - absDiff * 0.11);
              opacity = Math.max(0.22, 0.72 - absDiff * 0.2);
              zIndex = 35 - absDiff * 5;
              brightness = Math.max(0.45, 0.75 - absDiff * 0.15);
            }

            return (
              <div
                key={video.id || idx}
                onClick={() => {
                  if (isCenter) {
                    openVideoPayload(video);
                  } else {
                    setActiveIndex(idx);
                  }
                }}
                className="absolute cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  transform: `translate3d(${transX}px, 0, ${transZ}px) rotateY(${rotY}deg) scale(${scale})`,
                  zIndex,
                  opacity,
                  filter: `brightness(${brightness})`
                }}
              >
                {/* Vertical Studio Showcase Card matching Screenshot */}
                <div
                  className={`w-[285px] sm:w-[340px] md:w-[365px] h-[440px] sm:h-[475px] rounded-[28px] p-5 flex flex-col justify-between overflow-hidden shadow-2xl transition-colors ${
                    isCenter
                      ? 'bg-[#101419] border border-[#2C3642] shadow-[0_30px_70px_rgba(0,0,0,0.95),0_0_32px_rgba(255,87,34,0.18)]'
                      : 'bg-[#0B0E12] border border-[#1D232A]'
                  }`}
                >
                  {/* Card Top Eyebrow + Italic Title */}
                  <div className="text-center pt-1">
                    <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-neutral-400 mb-1.5">
                      {portfolio.branding?.logoText || 'MD JABER HOSAIN'} • {String(idx + 1).padStart(2, '0')}
                    </div>
                    <h3 className="text-sm sm:text-base font-medium text-white line-clamp-1">
                      <span className="font-serif italic text-neutral-200">{videoTitle}</span>
                    </h3>
                  </div>

                  {/* Inner Frame Window (Screenshot-style Timeline + Video Stage) */}
                  <div className="rounded-2xl bg-[#07090C] border border-[#1F2730] p-2.5 shadow-inner flex flex-col justify-between my-2 flex-1 min-h-0">
                    {/* Tiny inner HUD */}
                    <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500 px-1 pb-1.5">
                      <span>Edited by {portfolio.branding?.logoText || 'Jaber'}</span>
                      <span className="text-[#FF7043]">REC • 24 FPS</span>
                    </div>

                    {/* Video Thumbnail Frame with 3D Cursor-Responsive Tilt */}
                    <Tilt3DImageStage className="flex-1 min-h-0 w-full" maxTilt={14} scaleOnHover={1.03}>
                      <div className="relative w-full h-full rounded-xl bg-[#050709] overflow-hidden flex items-center justify-center group/thumb border border-[#181E24] shadow-lg">
                        {hasValidThumb ? (
                          <>
                            <img
                              src={resolveAssetUrl(thumbnail)}
                              alt={videoTitle}
                              onError={() => handleImageError(video.id, thumbnail)}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 text-center">
                            <div className="w-12 h-12 rounded-full bg-[#12161A] border border-[#232B33] flex items-center justify-center text-[#FF5722] mb-2">
                              <Play className="w-5 h-5 fill-current translate-x-0.5" />
                            </div>
                            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                              VIDEO EDITING
                            </span>
                          </div>
                        )}

                        {/* Platform Badge */}
                        <div className="absolute top-2.5 left-2.5 z-10">
                          {isVimeo ? (
                            <span className="px-2 py-0.5 rounded bg-black/85 text-[#1AB7EA] border border-[#1AB7EA]/40 text-[9px] font-mono font-bold flex items-center space-x-1">
                              <VimeoIcon className="w-3 h-3 fill-current" />
                              <span>VIMEO</span>
                            </span>
                          ) : isYouTube ? (
                            <span className="px-2 py-0.5 rounded bg-black/85 text-[#FF0000] border border-[#232B33] text-[9px] font-mono font-bold flex items-center space-x-1">
                              <Youtube className="w-3 h-3 fill-current" />
                              <span>YOUTUBE</span>
                            </span>
                          ) : isFacebook ? (
                            <span className="px-2 py-0.5 rounded bg-black/85 text-[#1877F2] border border-[#232B33] text-[9px] font-mono font-bold flex items-center space-x-1">
                              <Facebook className="w-3 h-3 fill-current" />
                              <span>FACEBOOK</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-black/85 text-[#FF5722] border border-[#232B33] text-[9px] font-mono font-bold">
                              VIDEO
                            </span>
                          )}
                        </div>

                        {/* Play Button on Hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transform scale-90 group-hover/thumb:scale-100 transition-transform">
                            <Play className="w-5 h-5 fill-current translate-x-0.5" />
                          </div>
                        </div>

                        {video.duration && (
                          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/85 text-[9px] font-mono text-neutral-300 border border-[#232B33]">
                            {video.duration}
                          </div>
                        )}
                      </div>
                    </Tilt3DImageStage>

                    {/* Mini NLE Timeline Graphic inside card (like screenshot) */}
                    <div className="mt-2 pt-2 border-t border-[#14191F] space-y-1">
                      <div className="flex items-center justify-between text-[8px] font-mono text-neutral-500">
                        <span>0:00:19:05</span>
                        <span>30.00 fps • LAYERED</span>
                      </div>
                      <div className="space-y-1">
                        <div className="h-1.5 w-full bg-[#11151A] rounded-full overflow-hidden flex space-x-1">
                          <div className="h-full w-2/5 bg-[#FF5722]/85 rounded-full" />
                          <div className="h-full w-1/4 bg-purple-500/80 rounded-full" />
                          <div className="h-full flex-1 bg-cyan-400/75 rounded-full" />
                        </div>
                        <div className="h-1 w-full bg-[#11151A] rounded-full overflow-hidden flex space-x-1">
                          <div className="h-full w-1/3 bg-emerald-400/70 rounded-full" />
                          <div className="h-full w-1/2 bg-amber-400/65 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Profile + Action Pill (matching screenshot bottom bar) */}
                  <div className="pt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[#181E24] border border-[#232B33] flex items-center justify-center text-[11px] font-mono font-bold text-[#FF5722] shrink-0">
                        {portfolio.branding?.logoInitials?.[0] || 'J'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-mono font-semibold text-neutral-200 truncate">
                          jaber_studio
                        </span>
                        <span className="text-[9px] font-mono text-neutral-500 truncate">
                          Editing • Motion • 3D
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openVideoPayload(video);
                        }}
                        className="px-3 py-1.5 rounded-full bg-white hover:bg-neutral-200 text-black text-[10px] font-mono font-bold flex items-center space-x-1 transition-colors shadow"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>Watch</span>
                      </button>

                      {video.videoUrl && (
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-full bg-[#181E24] hover:bg-[#232B33] text-neutral-300 hover:text-white border border-[#232B33] transition-colors"
                          title="Open Original Video"
                        >
                          <ExternalLink className="w-3 h-3 text-[#FF5722]" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM NAVIGATION CONTROLS (Left Arrow + Italic Title + Right Arrow) */}
      <div className="mt-6 flex items-center justify-center space-x-5 sm:space-x-10 max-w-3xl mx-auto px-2">
        <button
          type="button"
          onClick={handlePrev}
          className="w-11 h-11 rounded-full bg-[#141A20] hover:bg-[#1E252D] active:scale-95 text-white border border-[#232B33] hover:border-[#FF5722] flex items-center justify-center shadow-xl transition-all group shrink-0"
          aria-label="Previous video slide"
        >
          <ChevronLeft className="w-5 h-5 text-neutral-300 group-hover:text-[#FF5722] group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <div className="flex-1 text-center min-w-0">
          <p className="font-serif italic text-base sm:text-xl text-neutral-200 truncate">
            {activeVideoTitle}
            {activeVideoDesc ? (
              <span className="text-neutral-400 font-sans not-italic text-xs sm:text-sm">
                {' '}— {activeVideoDesc}
              </span>
            ) : null}
          </p>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="w-11 h-11 rounded-full bg-[#141A20] hover:bg-[#1E252D] active:scale-95 text-white border border-[#232B33] hover:border-[#FF5722] flex items-center justify-center shadow-xl transition-all group shrink-0"
          aria-label="Next video slide"
        >
          <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-[#FF5722] group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
