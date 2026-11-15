import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { VideoShowcaseItem } from '../types/portfolio';
import { VideoCardGrid } from './VideoCardGrid';
import { Reveal3D } from './common/Reveal3D';

interface VideoShowcaseProps {
  onOpenVideo?: (video: VideoShowcaseItem) => void;
  platformFilter?: 'all' | 'youtube' | 'vimeo' | 'facebook';
}

export const VideoShowcase: React.FC<VideoShowcaseProps> = ({
  onOpenVideo,
  platformFilter = 'all'
}) => {
  const { portfolio, ui, loc, language } = usePortfolio();

  const rawBestVideos =
    portfolio.bestVideoWorks !== undefined ? portfolio.bestVideoWorks : portfolio.videos;

  const matchesPlatform = (v: VideoShowcaseItem) => {
    if (platformFilter === 'all') return true;
    const url = (v.videoUrl || '').toLowerCase();
    const explicit = (v.videoType || '').toLowerCase();
    if (platformFilter === 'youtube') return explicit === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be');
    if (platformFilter === 'vimeo') return explicit === 'vimeo' || url.includes('vimeo.com');
    if (platformFilter === 'facebook') return explicit === 'facebook' || url.includes('facebook.com') || url.includes('fb.watch');
    return true;
  };

  const sortedVideos = [...(rawBestVideos || [])]
    .filter((v: any) => v.visible !== false && matchesPlatform(v))
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (sortedVideos.length === 0) {
    return null;
  }

  const sectionConfig = portfolio.bestVideoSection;
  const sectionTag = loc(sectionConfig?.sectionTag) || ui.videos.sectionTag;
  const sectionTitle = loc(sectionConfig?.title) || ui.videos.title;
  const sectionSubtitle = loc(sectionConfig?.subtitle);

  return (
    <section
      id="videos"
      className="py-24 bg-[#121419]/75 border-t border-[#2B303D] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal3D direction="up" className="flex flex-col items-center text-center mb-12">
          <span className="text-xs font-mono text-[#E4583B] uppercase tracking-[0.2em] mb-2.5">
            {sectionTag}
          </span>

          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-[#F4F0E8] tracking-tight leading-[1.08]">
            {sectionTitle}
          </h2>

          {sectionSubtitle ? (
            <p className="mt-3 text-xs sm:text-sm text-[#A7A298] max-w-2xl leading-relaxed">
              {sectionSubtitle}
            </p>
          ) : (
            <p className="mt-3 text-xs sm:text-sm text-[#A7A298] max-w-2xl leading-relaxed">
              {language === 'bn'
                ? 'সেরা ভিডিও এডিটিং কাজগুলো স্ক্রল করে একসাথে দেখুন এবং যেকোনো ভিডিও ক্লিক করে প্লে করুন।'
                : 'Scroll through curated best video editing works and click any project to watch in full player.'}
            </p>
          )}
        </Reveal3D>

        <VideoCardGrid videos={sortedVideos} onOpenVideo={onOpenVideo} />
      </div>
    </section>
  );
};
