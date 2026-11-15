import React, { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { VideoShowcaseItem } from '../types/portfolio';
import { extractYouTubeId } from './VideoModal';
import { extractVimeoInfo } from '../lib/videoUtils';
import { resolveAssetUrl } from '../utils/assetUrl';
import { normalizeDirectImageUrl } from '../lib/imageUrlResolver';
import { Tilt3DImageStage } from './common/Tilt3DImageStage';
import {
  StudioArrowLeft,
  StudioArrowRight,
  StudioPlayGlyph,
  StudioReelChipGlyph
} from './common/StudioIcon';

export interface VideoParallaxCarouselProps {
  videos: any[];
  onOpenVideo?: (video: VideoShowcaseItem) => void;
  emptyPlaceholder?: string;
}

type SpeedMode = 'slow' | 'medium' | 'high' | 'custom';

/**
 * Splits a headline cleanly so the trailing phrase sits in editorial italic,
 * matching international director showcase framing ("Great stories need great edits.").
 */
function splitEditorialHeadline(text: string): { lead: string; italicTail: string } {
  const clean = (text || '').trim();
  if (!clean) return { lead: '', italicTail: '' };
  const words = clean.split(/\s+/);
  if (words.length <= 2) return { lead: '', italicTail: clean };
  const splitPoint = Math.max(1, Math.ceil(words.length / 2));
  return {
    lead: words.slice(0, splitPoint).join(' '),
    italicTail: words.slice(splitPoint).join(' ')
  };
}

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
  const [showSpeedControl, setShowSpeedControl] = useState<boolean>(false);

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
      ? 3.4
      : speedMode === 'high'
      ? 1.7
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
      <div className="p-12 text-center rounded-3xl glass-showcase-card-muted text-[#A7A298] text-sm max-w-3xl mx-auto">
        {emptyPlaceholder}
      </div>
    );
  }

  const activeVideo = videos[activeIndex] || videos[0];
  const activeVideoTitle = loc(activeVideo?.title) || `Video Cut ${activeIndex + 1}`;
  const activeVideoDesc = activeVideo?.description ? loc(activeVideo.description) : '';
  const ownerBrand = (portfolio.branding?.logoText || 'MD JABER HOSAIN').toUpperCase();
  const creatorAvatar = resolveAssetUrl(
    normalizeDirectImageUrl(portfolio.hero?.avatarUrl) || '/assets/jabir_profile.png'
  );

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
    <div className="w-full select-none relative">
      {/* Subtle Ambient Radial Stage Halo behind Center Deck */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-6 h-[500px] mx-auto max-w-2xl rounded-full opacity-55"
        style={{
          background:
            'radial-gradient(circle at center, rgba(255, 255, 255, 0.055) 0%, rgba(255, 255, 255, 0.015) 42%, transparent 72%)'
        }}
      />

      {/* 5-CARD FANNED SMOKED-GLASS PARALLAX DECK */}
      <div className="relative h-[530px] sm:h-[590px] w-full flex items-center justify-center [perspective:1600px] overflow-hidden">
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
                ? `Vimeo Reel ${idx + 1}`
                : isYouTube
                ? `YouTube Cut ${idx + 1}`
                : isFacebook
                ? `Facebook Film ${idx + 1}`
                : `Studio Cut ${idx + 1}`);

            const { lead, italicTail } = splitEditorialHeadline(videoTitle);

            // Tight Symmetrical Fanned Depth Cascade matching reference geometry
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
              transZ = 85;
              scale = 1;
              opacity = 1;
              zIndex = 40;
              brightness = 1;
            } else {
              const sign = diff < 0 ? -1 : 1;
              transX = absDiff === 1 ? sign * 145 : sign * 268;
              rotY = -sign * (absDiff === 1 ? 7 : 13);
              transZ = absDiff === 1 ? -55 : -145;
              scale = absDiff === 1 ? 0.905 : 0.81;
              opacity = absDiff === 1 ? 0.72 : 0.34;
              zIndex = 35 - absDiff * 6;
              brightness = absDiff === 1 ? 0.68 : 0.44;
            }

            const platformLabel = isVimeo
              ? 'Vimeo · Cinema'
              : isYouTube
              ? 'YouTube · Motion'
              : isFacebook
              ? 'Facebook · Social'
              : 'Editing · Motion · 3D';

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
                {/* OUTER FROSTED SMOKED-GLASS CARD */}
                <div
                  className={`w-[292px] sm:w-[342px] md:w-[366px] h-[500px] sm:h-[550px] rounded-[24px] p-4 sm:p-5 flex flex-col justify-between overflow-hidden transition-all ${
                    isCenter ? 'glass-showcase-card' : 'glass-showcase-card-muted'
                  }`}
                >
                  {/* Top Centered Micro Eyebrow + Two-Tone Editorial Headline */}
                  <div className="text-center pt-1.5 pb-3 px-2 shrink-0">
                    <div className="text-[9.5px] font-sans tracking-[0.26em] uppercase text-[#9A958C] mb-1.5">
                      {ownerBrand}
                    </div>
                    <h3 className="font-editorial text-xl sm:text-[23px] leading-tight text-[#ECE7DF] line-clamp-1">
                      {lead && <span className="font-normal">{lead} </span>}
                      <span className="italic text-[#FFFFFF]">{italicTail}</span>
                    </h3>
                  </div>

                  {/* INNER DARK STUDIO WINDOW FRAME */}
                  <div className="glass-showcase-inner rounded-[18px] p-3 flex flex-col justify-between flex-1 min-h-0">
                    {/* Inner Top Signature Strip ("Edited by: Jaber Hosain" + fps/duration) */}
                    <div className="flex items-baseline justify-between gap-2 px-1 pb-2.5 shrink-0">
                      <div className="flex items-baseline gap-1.5 min-w-0">
                        <span className="text-[9.5px] text-[#8E8A82] whitespace-nowrap">
                          {language === 'bn' ? 'এডিটিং:' : 'Edited by:'}
                        </span>
                        <span className="font-editorial italic text-[17px] sm:text-[19px] text-[#F4F0E8] leading-none truncate">
                          Jaber Hosain
                        </span>
                      </div>
                      <span className="text-[9.5px] tracking-wider text-[#8E8A82] tabular-nums whitespace-nowrap shrink-0">
                        {video.duration ? `${video.duration} · ` : ''}24 fps
                      </span>
                    </div>

                    {/* Visual Viewport inside Showcase Window */}
                    <Tilt3DImageStage className="flex-1 min-h-0 w-full" maxTilt={10} scaleOnHover={1.02}>
                      <div className="relative w-full h-full rounded-[12px] bg-[#090A0D] overflow-hidden flex items-center justify-center group/thumb border border-white/[0.07]">
                        {hasValidThumb ? (
                          <>
                            <img
                              src={resolveAssetUrl(thumbnail)}
                              alt={videoTitle}
                              referrerPolicy="no-referrer"
                              onError={() => handleImageError(video.id, thumbnail)}
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/thumb:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15 pointer-events-none" />
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 text-center">
                            <div className="w-11 h-11 rounded-full glass-icon-disc flex items-center justify-center mb-2">
                              <StudioPlayGlyph className="w-4 h-4 translate-x-[1px]" />
                            </div>
                            <span className="text-[10px] tracking-[0.2em] text-[#8E8A82] uppercase">
                              {platformLabel}
                            </span>
                          </div>
                        )}

                        {/* Hover Minimal Frosted Play Circle */}
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/15 border border-white/30 text-white flex items-center justify-center shadow-2xl transform scale-90 group-hover/thumb:scale-100 transition-transform duration-300">
                            <StudioPlayGlyph className="w-4 h-4 translate-x-[1px]" />
                          </div>
                        </div>
                      </div>
                    </Tilt3DImageStage>

                    {/* Inner Bottom Creator Bar matching Reference ("avatar + handle" on left, ivory CTA + ghost pill on right) */}
                    <div className="pt-3 px-0.5 flex items-center justify-between gap-2 shrink-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={creatorAvatar}
                          alt="Jaber Hosain"
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full object-cover object-top border border-white/15 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-[10.5px] font-medium text-[#EAE5DC] leading-tight truncate">
                            jaber_hosain
                          </div>
                          <div className="text-[9px] text-[#8E8A82] leading-tight truncate">
                            {platformLabel}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openVideoPayload(video);
                          }}
                          className="px-3 py-1.5 rounded-full glass-pill-cta text-[10px] font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <StudioReelChipGlyph className="w-3 h-3" />
                          <span>{language === 'bn' ? 'প্লে রিল' : 'Watch Edit'}</span>
                        </button>

                        {video.videoUrl && (
                          <a
                            href={video.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-2.5 py-1.5 rounded-full glass-pill-ghost text-[10px] font-medium whitespace-nowrap"
                            title="Open Source Video"
                          >
                            {language === 'bn' ? 'লিংক' : 'Open'}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM MINIMALIST EDITORIAL NAVIGATION BAR (Exact match to reference footer) */}
      <div className="mt-4 max-w-2xl mx-auto px-4 flex items-center justify-between gap-4 sm:gap-8">
        <button
          type="button"
          onClick={handlePrev}
          className="w-10 h-10 rounded-full glass-icon-disc flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
          aria-label="Previous video slide"
        >
          <StudioArrowLeft className="w-4 h-4 rtl:rotate-180" />
        </button>

        <div className="flex-1 text-center min-w-0">
          <p className="font-editorial italic text-lg sm:text-2xl text-[#EAE5DC] truncate">
            {activeVideoTitle}
            {activeVideoDesc ? (
              <span className="text-[#8E8A82] font-sans not-italic text-xs sm:text-sm">
                {' '}— {activeVideoDesc}
              </span>
            ) : null}
          </p>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="w-10 h-10 rounded-full glass-icon-disc flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
          aria-label="Next video slide"
        >
          <StudioArrowRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>

      {/* Quiet, Unobtrusive Autoplay & Timing Micro-Strip (Zero dashboard clutter) */}
      {total > 1 && (
        <div className="mt-4 flex flex-col items-center gap-2.5">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-[#8E8A82]">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="hover:text-[#EAE5DC] transition-colors cursor-pointer whitespace-nowrap"
            >
              {isPlaying
                ? language === 'bn'
                  ? 'অটোপ্লে চালু'
                  : 'Autoplay · On'
                : language === 'bn'
                ? 'বিরতি'
                : 'Autoplay · Paused'}
            </button>

            <span aria-hidden="true" className="text-white/15">·</span>

            <span className="tabular-nums">
              {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>

            <span aria-hidden="true" className="text-white/15">·</span>

            <button
              type="button"
              onClick={() => setShowSpeedControl((v) => !v)}
              className="hover:text-[#EAE5DC] transition-colors cursor-pointer whitespace-nowrap"
            >
              {language === 'bn' ? 'স্লাইড স্পিড' : `Pace · ${currentSeconds.toFixed(1)}s`}
            </button>
          </div>

          {showSpeedControl && (
            <div className="inline-flex flex-wrap items-center justify-center gap-1.5 px-3 py-1.5 rounded-full glass-pill-ghost text-[11px]">
              {(['slow', 'medium', 'high', 'custom'] as SpeedMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setSpeedMode(m);
                    setIsPlaying(true);
                  }}
                  className={`px-2.5 py-0.5 rounded-full capitalize transition-colors cursor-pointer ${
                    speedMode === m
                      ? 'bg-[#F4F0E8] text-[#111318] font-medium'
                      : 'text-[#A7A298] hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
              {speedMode === 'custom' && (
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  value={customSeconds}
                  onChange={(e) => {
                    setCustomSeconds(parseFloat(e.target.value));
                    setIsPlaying(true);
                  }}
                  className="w-20 ml-1 accent-[#F4F0E8] cursor-pointer"
                  aria-label="Custom slide seconds"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
