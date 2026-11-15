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

  useEffect(() => {
    if (!isPlaying || total <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, currentSeconds * 1000);

    return () => clearInterval(timer);
  }, [isPlaying, currentSeconds, handleNext, total]);

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
      <div className="p-12 text-center rounded-2xl studio-card text-[#A7A298] text-sm max-w-3xl mx-auto">
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
      {/* Speed & Playback Control Bar (no backdrop-blur over WebGL) */}
      <div className="max-w-4xl mx-auto mb-8 p-3 sm:p-4 rounded-2xl bg-[#181B22]/96 border border-[#2B303D] shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center space-x-2 rtl:space-x-reverse transition-all cursor-pointer ${
              isPlaying
                ? 'bg-[#20242E] hover:bg-[#2B303D] text-emerald-400 border border-emerald-500/35'
                : 'bg-[#E4583B] hover:bg-[#D0492D] text-white'
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

          {/* Speed Presets */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#121419] border border-[#2B303D]">
            <button
              type="button"
              onClick={() => {
                setSpeedMode('slow');
                setIsPlaying(true);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                speedMode === 'slow'
                  ? 'bg-[#E4583B] text-white'
                  : 'text-[#A7A298] hover:text-[#F4F0E8]'
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
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                speedMode === 'medium'
                  ? 'bg-[#E4583B] text-white'
                  : 'text-[#A7A298] hover:text-[#F4F0E8]'
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
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                speedMode === 'high'
                  ? 'bg-[#E4583B] text-white'
                  : 'text-[#A7A298] hover:text-[#F4F0E8]'
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
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors flex items-center space-x-1 rtl:space-x-reverse cursor-pointer ${
                speedMode === 'custom'
                  ? 'bg-[#E4583B] text-white'
                  : 'text-[#A7A298] hover:text-[#F4F0E8]'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>{language === 'bn' ? 'কাস্টম' : 'Custom'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div
              className="px-3 py-1.5 rounded-lg bg-[#20242E] border border-[#2B303D] text-xs font-mono font-bold flex items-center space-x-1.5 rtl:space-x-reverse"
              title="Current Slide Speed"
            >
              <Gauge className="w-3.5 h-3.5 text-[#E4583B]" />
              <span className={isPlaying ? 'text-[#F4F0E8]' : 'text-[#A7A298]'}>
                {isPlaying ? `${currentSeconds.toFixed(1)}s` : 'Paused'}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-[#20242E] border border-[#2B303D] text-xs font-mono font-bold text-[#F4F0E8] tabular-nums">
              <span className="text-[#E4583B]">{String(activeIndex + 1).padStart(2, '0')}</span>
              <span className="text-[#A7A298]"> / {String(total).padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {speedMode === 'custom' && (
          <div className="mt-3 pt-3 border-t border-[#2B303D] flex flex-wrap items-center justify-between gap-4 px-2 text-xs font-mono">
            <span className="text-[#DDD1BE]">
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
                className="w-36 sm:w-48 accent-[#E4583B] cursor-pointer"
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
                className="w-16 px-2 py-1 rounded-lg bg-[#121419] border border-[#2B303D] text-[#E4583B] font-bold text-center focus:border-[#E4583B] focus:outline-none"
              />
              <span className="text-[#A7A298]">sec</span>
            </div>
          </div>
        )}
      </div>

      {/* 3D PARALLAX STACK STAGE */}
      <div
        onMouseEnter={() => setIsStageHovered(true)}
        onMouseLeave={() => setIsStageHovered(false)}
        className="relative h-[480px] sm:h-[530px] w-full flex items-center justify-center [perspective:1500px] overflow-hidden"
      >
        <button
          type="button"
          onClick={() => openVideoPayload(activeVideo)}
          className={`hidden md:flex absolute top-1/3 left-6 lg:left-16 z-50 w-16 h-16 rounded-full bg-[#F4F0E8] text-[#121419] font-mono font-bold text-xs uppercase tracking-widest items-center justify-center shadow-[0_18px_40px_rgba(0,0,0,0.55)] transition-all duration-300 hover:scale-110 cursor-pointer ${
            isStageHovered ? 'opacity-100 scale-100' : 'opacity-85 scale-95'
          }`}
          title="Watch Active Video"
        >
          PLAY
        </button>

        <div className="relative w-full h-full flex items-center justify-center [transform-style:preserve-3d]">
          {videos.map((video, idx) => {
            let diff = (idx - activeIndex + total) % total;
            if (diff > total / 2) diff -= total;

            const absDiff = Math.abs(diff);
            const isCenter = diff === 0;

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
              opacity = Math.max(0.26, 0.76 - absDiff * 0.2);
              zIndex = 35 - absDiff * 5;
              brightness = Math.max(0.5, 0.78 - absDiff * 0.14);
            }

            return (
              <div
                key={video.id || idx}
                data-cursor={isCenter ? 'play' : 'view'}
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
                <div
                  className={`w-[285px] sm:w-[345px] md:w-[370px] h-[435px] sm:h-[465px] rounded-2xl p-5 flex flex-col justify-between overflow-hidden transition-colors ${
                    isCenter
                      ? 'bg-[#181B22] border border-[#E4583B]/45 shadow-[0_32px_64px_rgba(0,0,0,0.82)]'
                      : 'bg-[#14171E] border border-[#2B303D]'
                  }`}
                >
                  {/* Editorial Card Header */}
                  <div className="text-center pt-1">
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A7A298] mb-1">
                      {String(idx + 1).padStart(2, '0')} · {portfolio.branding?.logoText || 'MD JABER HOSAIN'}
                    </div>
                    <h3 className="text-sm sm:text-base font-medium text-[#F4F0E8] line-clamp-1">
                      <span className="font-editorial italic text-lg text-[#DDD1BE]">{videoTitle}</span>
                    </h3>
                  </div>

                  {/* Video Thumbnail Stage with 3D Cursor Tilt */}
                  <div className="rounded-xl bg-[#121419] border border-[#2B303D] p-2.5 flex flex-col justify-between my-2.5 flex-1 min-h-0">
                    <Tilt3DImageStage className="flex-1 min-h-0 w-full" maxTilt={13} scaleOnHover={1.03}>
                      <div className="relative w-full h-full rounded-lg bg-[#0E1015] overflow-hidden flex items-center justify-center group/thumb border border-[#2B303D]">
                        {hasValidThumb ? (
                          <>
                            <img
                              src={resolveAssetUrl(thumbnail)}
                              alt={videoTitle}
                              onError={() => handleImageError(video.id, thumbnail)}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 text-center">
                            <div className="w-12 h-12 rounded-full bg-[#181B22] border border-[#2B303D] flex items-center justify-center text-[#E4583B] mb-2">
                              <Play className="w-5 h-5 fill-current translate-x-0.5" />
                            </div>
                            <span className="text-[10px] font-mono text-[#A7A298] uppercase tracking-widest">
                              VIDEO EDITING
                            </span>
                          </div>
                        )}

                        <div className="absolute top-2.5 left-2.5 z-10">
                          {isVimeo ? (
                            <span className="px-2 py-0.5 rounded bg-[#121419]/90 text-[#1AB7EA] border border-[#2B303D] text-[9px] font-mono font-bold flex items-center space-x-1">
                              <VimeoIcon className="w-3 h-3 fill-current" />
                              <span>VIMEO</span>
                            </span>
                          ) : isYouTube ? (
                            <span className="px-2 py-0.5 rounded bg-[#121419]/90 text-[#FF0000] border border-[#2B303D] text-[9px] font-mono font-bold flex items-center space-x-1">
                              <Youtube className="w-3 h-3 fill-current" />
                              <span>YOUTUBE</span>
                            </span>
                          ) : isFacebook ? (
                            <span className="px-2 py-0.5 rounded bg-[#121419]/90 text-[#1877F2] border border-[#2B303D] text-[9px] font-mono font-bold flex items-center space-x-1">
                              <Facebook className="w-3 h-3 fill-current" />
                              <span>FACEBOOK</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-[#121419]/90 text-[#E4583B] border border-[#2B303D] text-[9px] font-mono font-bold">
                              VIDEO
                            </span>
                          )}
                        </div>

                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-[#F4F0E8] text-[#121419] flex items-center justify-center shadow-2xl transform scale-90 group-hover/thumb:scale-100 transition-transform">
                            <Play className="w-5 h-5 fill-current translate-x-0.5" />
                          </div>
                        </div>

                        {video.duration && (
                          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-[#121419]/90 text-[9px] font-mono text-[#DDD1BE] border border-[#2B303D] tabular-nums">
                            {video.duration}
                          </div>
                        )}
                      </div>
                    </Tilt3DImageStage>
                  </div>

                  {/* Clean Card Bottom Action Row */}
                  <div className="pt-1 flex items-center justify-between gap-2">
                    <div className="text-[11px] font-mono text-[#A7A298] truncate">
                      {isVimeo ? 'Vimeo Cut' : isYouTube ? 'YouTube Cut' : isFacebook ? 'Facebook Cut' : 'Studio Edit'}
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openVideoPayload(video);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-[#E4583B] hover:bg-[#D0492D] text-white text-[10px] font-mono font-bold flex items-center space-x-1 transition-colors shadow cursor-pointer"
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
                          className="p-1.5 rounded-lg bg-[#20242E] hover:bg-[#2B303D] text-[#DDD1BE] border border-[#2B303D] transition-colors"
                          title="Open Original Video"
                        >
                          <ExternalLink className="w-3 h-3 text-[#E4583B]" />
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

      {/* Carousel Arrow Navigation + Interactive Slide Scrubber Dots */}
      <div className="mt-6 max-w-3xl mx-auto px-2 space-y-4">
        <div className="flex items-center justify-center space-x-5 sm:space-x-10">
          <button
            type="button"
            onClick={handlePrev}
            className="w-11 h-11 rounded-full bg-[#181B22] hover:bg-[#20242E] active:scale-95 text-[#F4F0E8] border border-[#2B303D] hover:border-[#E4583B] flex items-center justify-center shadow-lg transition-all group shrink-0 cursor-pointer"
            aria-label="Previous video slide"
          >
            <ChevronLeft className="w-5 h-5 text-[#DDD1BE] group-hover:text-[#E4583B] group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <div className="flex-1 text-center min-w-0">
            <p className="font-editorial italic text-lg sm:text-2xl text-[#F4F0E8] truncate">
              {activeVideoTitle}
              {activeVideoDesc ? (
                <span className="text-[#A7A298] font-sans not-italic text-xs sm:text-sm">
                  {' '}— {activeVideoDesc}
                </span>
              ) : null}
            </p>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-11 h-11 rounded-full bg-[#181B22] hover:bg-[#20242E] active:scale-95 text-[#F4F0E8] border border-[#2B303D] hover:border-[#E4583B] flex items-center justify-center shadow-lg transition-all group shrink-0 cursor-pointer"
            aria-label="Next video slide"
          >
            <ChevronRight className="w-5 h-5 text-[#DDD1BE] group-hover:text-[#E4583B] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Interactive Slide Scrubber Dots */}
        {total > 1 && (
          <div className="flex items-center justify-center gap-2 pt-1" role="tablist" aria-label="Slide navigation">
            {videos.map((v, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={v.id || `dot-${idx}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-selected={isActive}
                  role="tab"
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'w-8 bg-[#E4583B]'
                      : 'w-2.5 bg-[#2B303D] hover:bg-[#A7A298]'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
