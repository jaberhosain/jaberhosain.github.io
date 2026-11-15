import React, { useState } from 'react';
import { Play, ExternalLink, Youtube, Facebook } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { VideoShowcaseItem } from '../types/portfolio';
import { extractYouTubeId } from './VideoModal';
import { extractVimeoInfo, VimeoIcon } from '../lib/videoUtils';
import { resolveAssetUrl } from '../utils/assetUrl';
import { Tilt3DImageStage } from './common/Tilt3DImageStage';
import { Reveal3D } from './common/Reveal3D';

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
      <div className="p-12 text-center rounded-2xl studio-card text-[#A7A298] text-sm max-w-3xl mx-auto">
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
          <Reveal3D
            key={video.id || idx}
            direction={idx % 2 === 0 ? 'tilt-left' : 'tilt-right'}
            delay={(idx % 2) * 90}
          >
            <div
              onClick={() => openVideoPayload(video)}
              className="h-full group relative rounded-2xl studio-card overflow-hidden flex flex-col justify-between cursor-pointer hover:-translate-y-1"
            >
              {/* Visual Thumbnail Stage with 3D Cursor Tilt */}
              <div className="p-2.5 bg-[#121419]/90 border-b border-[#2B303D]">
                <Tilt3DImageStage className="aspect-[16/10] w-full" maxTilt={13} scaleOnHover={1.03}>
                  <div className="relative w-full h-full rounded-xl bg-[#0E1015] flex items-center justify-center border border-[#2B303D] overflow-hidden">
                    {hasValidThumb ? (
                      <>
                        <img
                          src={resolveAssetUrl(thumbnail)}
                          alt={videoTitle}
                          loading="lazy"
                          onError={() => handleImageError(video.id, thumbnail)}
                          className="w-full h-full object-contain bg-[#0E1015] transition-transform duration-500 group-hover:scale-[1.03]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-[#181B22] border border-[#2B303D] flex items-center justify-center text-[#E4583B]">
                          <Play className="w-5 h-5 fill-current translate-x-0.5" />
                        </div>
                        <span className="text-[11px] font-mono text-[#A7A298] uppercase tracking-widest">
                          {platformLabel}
                        </span>
                      </div>
                    )}

                    {/* Platform Tag */}
                    <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 z-10">
                      {isVimeo ? (
                        <span className="px-2.5 py-1 rounded bg-[#121419]/90 text-[#1AB7EA] border border-[#2B303D] text-[10px] font-mono font-bold flex items-center space-x-1.5 rtl:space-x-reverse">
                          <VimeoIcon className="w-3 h-3 fill-current" />
                          <span>VIMEO</span>
                        </span>
                      ) : isYouTube ? (
                        <span className="px-2.5 py-1 rounded bg-[#121419]/90 text-[#FF0000] border border-[#2B303D] text-[10px] font-mono font-bold flex items-center space-x-1.5 rtl:space-x-reverse">
                          <Youtube className="w-3 h-3 fill-current" />
                          <span>YOUTUBE</span>
                        </span>
                      ) : isFacebook ? (
                        <span className="px-2.5 py-1 rounded bg-[#121419]/90 text-[#1877F2] border border-[#2B303D] text-[10px] font-mono font-bold flex items-center space-x-1.5 rtl:space-x-reverse">
                          <Facebook className="w-3 h-3 fill-current" />
                          <span>FACEBOOK</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded bg-[#121419]/90 text-[#E4583B] border border-[#2B303D] text-[10px] font-mono font-bold">
                          VIDEO
                        </span>
                      )}
                    </div>

                    {video.duration && (
                      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-[#121419]/90 text-[10px] font-mono text-[#DDD1BE] border border-[#2B303D] z-10 tabular-nums">
                        {video.duration}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-[#E4583B] text-white flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-5 h-5 fill-current translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </Tilt3DImageStage>
              </div>

              {/* Card Body & Footer */}
              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#F4F0E8] mb-2 group-hover:text-[#E4583B] transition-colors leading-snug">
                    {videoTitle}
                  </h3>

                  {videoDesc && (
                    <p className="text-xs sm:text-sm text-[#A7A298] leading-relaxed line-clamp-2 mb-2">
                      {videoDesc}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-[#2B303D] flex items-center justify-between text-xs font-mono">
                  <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse font-bold text-[#E4583B] group-hover:translate-x-0.5 transition-transform">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{playLabel}</span>
                  </span>

                  {video.videoUrl && (
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-lg bg-[#20242E] hover:bg-[#2B303D] border border-[#2B303D] hover:border-[#E4583B]/50 text-[#DDD1BE] hover:text-white transition-colors"
                      title={`Open on ${platformLabel}`}
                    >
                      <span>{platformLabel}</span>
                      <ExternalLink className="w-3 h-3 text-[#A7A298]" />
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
