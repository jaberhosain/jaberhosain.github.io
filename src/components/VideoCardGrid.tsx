import React, { useState } from 'react';
import { Play, ExternalLink, Youtube, Facebook } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { VideoShowcaseItem } from '../types/portfolio';
import { extractYouTubeId } from './VideoModal';
import { extractVimeoInfo, VimeoIcon } from '../lib/videoUtils';
import { resolveAssetUrl } from '../utils/assetUrl';
import { Tilt3DImageStage } from './common/Tilt3DImageStage';
import { Reveal3D } from './common/Reveal3D';
import { StudioGlassIcon, StudioPlayGlyph } from './common/StudioIcon';

interface VideoCardGridProps {
  videos: any[];
  onOpenVideo?: (video: VideoShowcaseItem) => void;
  emptyPlaceholder?: string;
}

export const VideoCardGrid: React.FC<VideoCardGridProps> = ({
  videos,
  onOpenVideo,
  emptyPlaceholder = 'Add project from admin panel'
}) => {
  const { loc, language } = usePortfolio();
  const [failedThumbnails, setFailedThumbnails] = useState<Record<string, boolean>>({});
  const [fallbackThumbnails, setFallbackThumbnails] = useState<Record<string, string>>({});

  const handleImageError = (id: string, currentSrc: string) => {
    if (currentSrc.includes('maxresdefault.jpg')) {
      const hqFallback = currentSrc.replace('maxresdefault.jpg', 'hqdefault.jpg');
      setFallbackThumbnails((prev) => ({ ...prev, [id]: hqFallback }));
    } else {
      setFailedThumbnails((prev) => ({ ...prev, [id]: true }));
    }
  };

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

  if (videos.length === 0) {
    return (
      <div className="p-12 text-center rounded-[24px] glass-showcase-card-muted text-[#A7A298] text-sm max-w-3xl mx-auto">
        {emptyPlaceholder}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {videos.map((video, idx) => {
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
            : `Video Project #${idx + 1}`);
        const videoDesc = video.description ? loc(video.description) : '';

        const platformLabel = isVimeo
          ? 'Vimeo'
          : isYouTube
          ? 'YouTube'
          : isFacebook
          ? 'Facebook'
          : 'Watch Link';

        const playLabel = language === 'bn' ? 'ভিডিও দেখুন' : language === 'ar' ? 'شاهد الفيديو' : 'Watch Cut';

        return (
          <Reveal3D
            key={video.id || idx}
            direction={idx % 2 === 0 ? 'tilt-left' : 'tilt-right'}
            delay={(idx % 2) * 90}
          >
            <div
              onClick={() => openVideoPayload(video)}
              data-cursor="play"
              className="h-full group relative rounded-[24px] glass-showcase-card overflow-hidden flex flex-col justify-between cursor-pointer hover:-translate-y-1 transition-transform duration-300"
            >
              {/* Visual Thumbnail Stage with 3D Cursor Tilt */}
              <div className="p-3 bg-[#0D0E12]/65 border-b border-white/[0.07]">
                <Tilt3DImageStage className="aspect-[16/10] w-full" maxTilt={13} scaleOnHover={1.03}>
                  <div className="relative w-full h-full rounded-[14px] bg-[#0B0C10] flex items-center justify-center border border-white/[0.07] overflow-hidden">
                    {hasValidThumb ? (
                      <>
                        <img
                          src={resolveAssetUrl(thumbnail)}
                          alt={videoTitle}
                          loading="lazy"
                          onError={() => handleImageError(video.id, thumbnail)}
                          className="w-full h-full object-contain bg-[#0B0C10] transition-transform duration-500 group-hover:scale-[1.03]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                        <StudioGlassIcon size="lg">
                          <StudioPlayGlyph className="w-4 h-4 translate-x-[1px]" />
                        </StudioGlassIcon>
                        <span className="text-[11px] text-[#9A958C] uppercase tracking-widest">
                          {platformLabel}
                        </span>
                      </div>
                    )}

                    {/* Clean Minimal Hover Reticle */}
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-white/15 border border-white/30 text-white flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                        <StudioPlayGlyph className="w-4 h-4 translate-x-[1px]" />
                      </div>
                    </div>
                  </div>
                </Tilt3DImageStage>
              </div>

              {/* Card Body & Footer */}
              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  {/* Quiet Unboxed Source Metadata */}
                  <div className="text-[11px] text-[#8E8A82] mb-1.5 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[#DDD1BE]">
                      {isVimeo ? (
                        <VimeoIcon className="w-3 h-3 fill-current" />
                      ) : isYouTube ? (
                        <Youtube className="w-3.5 h-3.5" strokeWidth={1.35} />
                      ) : isFacebook ? (
                        <Facebook className="w-3 h-3" strokeWidth={1.35} />
                      ) : null}
                      <span>{platformLabel}</span>
                    </span>
                    {video.duration && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{video.duration}</span>
                      </>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold text-[#F4F0E8] mb-2 group-hover:text-white transition-colors leading-snug">
                    {videoTitle}
                  </h3>

                  {videoDesc && (
                    <p className="text-xs sm:text-sm text-[#A7A298] leading-relaxed line-clamp-2 mb-2">
                      {videoDesc}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs">
                  <span className="inline-flex items-center space-x-2 rtl:space-x-reverse font-medium text-[#EAE5DC]">
                    <span className="px-3.5 py-1.5 rounded-full glass-pill-cta text-[11px] font-semibold inline-flex items-center gap-1.5">
                      <Play className="w-3 h-3 fill-current" />
                      <span>{playLabel}</span>
                    </span>
                  </span>

                  {video.videoUrl && (
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3.5 py-1.5 rounded-full glass-pill-ghost text-[11px] font-medium"
                      title={`Open on ${platformLabel}`}
                    >
                      <span>{platformLabel}</span>
                      <ExternalLink className="w-3 h-3" strokeWidth={1.35} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Reveal3D>
        );
      })}
    </div>
  );
};
