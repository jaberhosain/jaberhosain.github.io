import React, { useState } from 'react';
import { ExternalLink, Youtube, Facebook } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { VideoShowcaseItem } from '../types/portfolio';
import { extractYouTubeId } from './VideoModal';
import { extractVimeoInfo, VimeoIcon } from '../lib/videoUtils';
import {
  OrganizedVideoItem,
  getVideoSubSectionLabel
} from '../lib/videoOrganization';
import { resolveAssetUrl } from '../utils/assetUrl';
import { Tilt3DImageStage } from './common/Tilt3DImageStage';
import { Reveal3D } from './common/Reveal3D';
import { StudioPlayGlyph } from './common/StudioIcon';

interface ReelCardGridProps {
  reels: OrganizedVideoItem[];
  onOpenVideo?: (video: VideoShowcaseItem) => void;
  emptyPlaceholder?: string;
}

export const ReelCardGrid: React.FC<ReelCardGridProps> = ({
  reels,
  onOpenVideo,
  emptyPlaceholder
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

  const openReelPayload = (reel: OrganizedVideoItem) => {
    if (reel.videoUrl && onOpenVideo) {
      onOpenVideo({
        id: reel.id,
        title: reel.title,
        description: reel.description,
        videoType: (reel.videoType as any) || 'facebook',
        videoUrl: reel.videoUrl,
        videoId: reel.videoId,
        videoHash: reel.videoHash,
        thumbnailUrl: reel.thumbnailUrl,
        customThumbnailUrl: reel.customThumbnailUrl,
        duration: reel.duration,
        videoSection: reel.videoSection || reel.resolvedSection,
        subSection: reel.subSection || reel.resolvedSubSection,
        order: reel.order
      });
    }
  };

  if (reels.length === 0) {
    return (
      <div className="p-10 text-center rounded-[24px] glass-showcase-card-muted text-[#A7A298] text-sm max-w-2xl mx-auto">
        {emptyPlaceholder ||
          (language === 'bn'
            ? 'এই সাব-সেকশনে এখনো কোনো রিল যুক্ত করা হয়নি।'
            : 'No reels assigned to this sub-section yet.')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
      {reels.map((reel, idx) => {
        const ytId = extractYouTubeId(reel.videoUrl);
        const vimeoInfo = extractVimeoInfo(reel.videoUrl);
        const isVimeo = reel.videoType === 'vimeo' || Boolean(vimeoInfo.id);
        const isYouTube = !isVimeo && (reel.videoType === 'youtube' || Boolean(ytId));
        const isFacebook =
          !isVimeo &&
          !isYouTube &&
          (reel.videoType === 'facebook' ||
            (reel.videoUrl &&
              (reel.videoUrl.includes('facebook.com') || reel.videoUrl.includes('fb.watch'))));

        const autoYtThumb = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : '';
        const rawThumbnail = reel.customThumbnailUrl || reel.thumbnailUrl || autoYtThumb;
        const thumbnail = fallbackThumbnails[reel.id] || rawThumbnail;
        const hasValidThumb = Boolean(thumbnail && !failedThumbnails[reel.id]);

        const reelTitle =
          loc(reel.title) ||
          (isVimeo
            ? `Reel Cut #${idx + 1}`
            : isYouTube
            ? `Short Cut #${idx + 1}`
            : isFacebook
            ? `Social Reel #${idx + 1}`
            : `Vertical Reel #${idx + 1}`);

        const platformLabel = isVimeo
          ? 'Vimeo'
          : isYouTube
          ? 'Shorts'
          : isFacebook
          ? 'Facebook Reel'
          : 'Reel';

        const tierLabel = getVideoSubSectionLabel(reel.resolvedSubSection, language);

        return (
          <Reveal3D
            key={reel.id || idx}
            direction={idx % 3 === 0 ? 'tilt-left' : idx % 3 === 2 ? 'tilt-right' : 'up'}
            delay={(idx % 6) * 55}
          >
            <article
              onClick={() => openReelPayload(reel)}
              data-cursor="play"
              className="group relative flex flex-col cursor-pointer select-none"
            >
              {/* Tall Vertical 9:16 Cinema Frame */}
              <Tilt3DImageStage className="aspect-[9/16] w-full" maxTilt={11} scaleOnHover={1.025}>
                <div className="relative w-full h-full rounded-[20px] overflow-hidden glass-showcase-card border border-white/[0.10] group-hover:border-[#E4583B]/45 transition-all duration-300 shadow-[0_20px_44px_-16px_rgba(0,0,0,0.8)]">
                  {hasValidThumb ? (
                    <img
                      src={resolveAssetUrl(thumbnail)}
                      alt={reelTitle}
                      loading="lazy"
                      onError={() => handleImageError(reel.id, thumbnail)}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#181B22] via-[#121419] to-[#0B0C10] flex flex-col items-center justify-center p-4 text-center">
                      <div className="w-10 h-10 rounded-full glass-icon-disc flex items-center justify-center mb-2.5 text-[#E4583B]">
                        {isVimeo ? (
                          <VimeoIcon className="w-4 h-4 fill-current" />
                        ) : isYouTube ? (
                          <Youtube className="w-4 h-4" />
                        ) : isFacebook ? (
                          <Facebook className="w-4 h-4" />
                        ) : (
                          <StudioPlayGlyph className="w-3.5 h-3.5 translate-x-[1px]" />
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-[#DDD1BE] line-clamp-2 px-1">
                        {reelTitle}
                      </span>
                      <span className="text-[10px] text-[#8E8A82] mt-1">{platformLabel}</span>
                    </div>
                  )}

                  {/* Measured Bottom & Subtle Top Cinema Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/25 pointer-events-none" />

                  {/* Centered Glass Play Orb */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-white/90 text-[#111318] flex items-center justify-center shadow-[0_12px_28px_rgba(0,0,0,0.45)] group-hover:scale-110 group-hover:bg-[#E4583B] group-hover:text-white transition-all duration-300">
                      <StudioPlayGlyph className="w-4 h-4 translate-x-[1px]" />
                    </div>
                  </div>

                  {/* Top-Right Direct External Link Affordance */}
                  {reel.videoUrl && (
                    <a
                      href={reel.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Open ${reelTitle} on ${platformLabel}`}
                      title={`Open on ${platformLabel}`}
                      className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-black/55 hover:bg-[#E4583B] border border-white/15 text-white/85 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <ExternalLink className="w-3 h-3" strokeWidth={1.6} />
                    </a>
                  )}

                  {/* Bottom-Left Crisp Duration Stamp (screenshot-inspired) */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between gap-2 pointer-events-none">
                    {reel.duration ? (
                      <span className="px-2 py-0.5 rounded-md bg-black/75 border border-white/15 text-[11px] font-medium text-[#F4F0E8] tabular-nums">
                        {reel.duration}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-black/65 border border-white/10 text-[10px] font-medium text-[#DDD1BE]">
                        9:16
                      </span>
                    )}
                  </div>
                </div>
              </Tilt3DImageStage>

              {/* Quiet Unboxed Editorial Caption Under Frame */}
              <div className="mt-2.5 px-1 space-y-0.5">
                <h4 className="text-xs sm:text-[13px] font-semibold text-[#F4F0E8] group-hover:text-[#E4583B] transition-colors truncate">
                  {reelTitle}
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-[#8E8A82] truncate">
                  <span>{tierLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{platformLabel}</span>
                </div>
              </div>
            </article>
          </Reveal3D>
        );
      })}
    </div>
  );
};
