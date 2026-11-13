import React, { useState } from 'react';
import { Play, ExternalLink, Youtube, Facebook } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { VideoShowcaseItem } from '../types/portfolio';
import { extractYouTubeId } from './VideoModal';
import { extractVimeoInfo, VimeoIcon } from '../lib/videoUtils';
import { resolveAssetUrl } from '../utils/assetUrl';
import { Tilt3DImageStage } from './common/Tilt3DImageStage';

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
      <div className="p-12 text-center rounded-3xl bg-[#12161A] border border-[#232B33] text-neutral-400 text-sm max-w-3xl mx-auto">
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

        const playLabel = language === 'bn' ? 'ভিডিও দেখুন' : language === 'ar' ? 'شاهد الفيديو' : 'Play Video';

        return (
          <div
            key={video.id || idx}
            onClick={() => openVideoPayload(video)}
            className="group relative rounded-3xl bg-[#12161A] border border-[#232B33] hover:border-[#FF5722]/60 overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between cursor-pointer hover:-translate-y-1"
          >
            {/* Visual Thumbnail Stage with 3D Cursor Tilt */}
            <div className="p-2.5 bg-[#0D1115] border-b border-[#232B33]">
              <Tilt3DImageStage className="aspect-[16/10] w-full" maxTilt={14} scaleOnHover={1.03}>
                <div className="relative w-full h-full rounded-2xl bg-[#050709] flex items-center justify-center border border-[#1E252D] overflow-hidden shadow-lg">
                  {hasValidThumb ? (
                    <>
                      <img
                        src={resolveAssetUrl(thumbnail)}
                        alt={videoTitle}
                        loading="lazy"
                        onError={() => handleImageError(video.id, thumbnail)}
                        className="w-full h-full object-contain bg-[#050709] transition-transform duration-500 group-hover:scale-[1.03]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                      <div className="w-14 h-14 rounded-full bg-[#12161A] border border-[#232B33] flex items-center justify-center text-[#FF5722]">
                        <Play className="w-6 h-6 fill-current translate-x-0.5" />
                      </div>
                      <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest">
                        {platformLabel}
                      </span>
                    </div>
                  )}

                  {/* Platform Badge Top-Left */}
                  <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 z-10">
                    {isVimeo ? (
                      <span className="px-2.5 py-1 rounded bg-black/85 text-[#1AB7EA] border border-[#1AB7EA]/40 text-[10px] font-mono font-bold flex items-center space-x-1.5 rtl:space-x-reverse">
                        <VimeoIcon className="w-3 h-3 fill-current" />
                        <span>VIMEO</span>
                      </span>
                    ) : isYouTube ? (
                      <span className="px-2.5 py-1 rounded bg-black/85 text-[#FF0000] border border-[#232B33] text-[10px] font-mono font-bold flex items-center space-x-1.5 rtl:space-x-reverse">
                        <Youtube className="w-3 h-3 fill-current" />
                        <span>YOUTUBE</span>
                      </span>
                    ) : isFacebook ? (
                      <span className="px-2.5 py-1 rounded bg-black/85 text-[#1877F2] border border-[#232B33] text-[10px] font-mono font-bold flex items-center space-x-1.5 rtl:space-x-reverse">
                        <Facebook className="w-3 h-3 fill-current" />
                        <span>FACEBOOK</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-black/85 text-[#FF5722] border border-[#232B33] text-[10px] font-mono font-bold">
                        VIDEO
                      </span>
                    )}
                  </div>

                  {/* Duration Badge Bottom-Right */}
                  {video.duration && (
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/85 text-[10px] font-mono text-neutral-200 border border-[#232B33] z-10 tabular-nums">
                      {video.duration}
                    </div>
                  )}

                  {/* Subtle Center Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-[#FF5722] text-white flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 fill-current translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Tilt3DImageStage>
            </div>

            {/* Card Body & Footer */}
            <div className="p-6 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2 group-hover:text-[#FF5722] transition-colors leading-snug">
                  {videoTitle}
                </h3>

                {videoDesc && (
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-2 mb-2">
                    {videoDesc}
                  </p>
                )}
              </div>

              {/* Action Row matching Screenshot: Left Play Video | Right External Platform Button */}
              <div className="mt-4 pt-4 border-t border-[#1D232A] flex items-center justify-between text-xs font-mono">
                <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse font-bold text-[#FF5722] group-hover:translate-x-0.5 transition-transform">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{playLabel}</span>
                </span>

                {video.videoUrl && (
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-lg bg-[#181E24] hover:bg-[#202830] border border-[#232B33] hover:border-[#FF5722]/50 text-neutral-300 hover:text-white transition-colors"
                    title={`Open on ${platformLabel}`}
                  >
                    <span>{platformLabel}</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
