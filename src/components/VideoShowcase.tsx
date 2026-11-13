import React from 'react';
import { Film } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { VideoShowcaseItem } from '../types/portfolio';
import { VideoCardGrid } from './VideoCardGrid';

interface VideoShowcaseProps {
  onOpenVideo?: (video: VideoShowcaseItem) => void;
  platformFilter?: 'all' | 'youtube' | 'vimeo' | 'facebook';
}

export const VideoShowcase: React.FC<VideoShowcaseProps> = ({
  onOpenVideo,
  platformFilter = 'all'
}) => {
  const { portfolio, ui, loc, language } = usePortfolio();

  // Connect to "Video Editing - Best Work", fallback to portfolio.videos if not set
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

  // Filter only visible videos
  const sortedVideos = [...(rawBestVideos || [])]
    .filter((v: any) => v.visible !== false && matchesPlatform(v))
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Rule: Show each Best Work section on the public website only if it has at least one visible item.
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
      className="py-24 bg-[#070A0D] border-t border-[#1D232A] relative overflow-hidden"
    >
      {/* Background ambient lighting aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-[#FF5722]/8 rounded-full blur-[200px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-md bg-[#181E24] border border-[#232B33] text-xs font-mono text-[#FF5722] mb-3">
            <Film className="w-3.5 h-3.5 text-[#FF5722]" />
            <span>{sectionTag}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight uppercase leading-[1.08]">
            {sectionTitle}
          </h2>

          {sectionSubtitle ? (
            <p className="mt-3 text-xs sm:text-sm text-neutral-400 max-w-2xl font-mono leading-relaxed">
              {sectionSubtitle}
            </p>
          ) : (
            <p className="mt-3 text-xs sm:text-sm text-neutral-400 max-w-2xl font-mono leading-relaxed">
              {language === 'bn'
                ? 'সেরা ভিডিও এডিটিং কাজগুলো স্ক্রল করে একসাথে দেখুন এবং যেকোনো ভিডিও ক্লিক করে প্লে করুন।'
                : 'Scroll through curated best video editing works and click any project to watch in full player.'}
            </p>
          )}
        </div>

        {/* Scrollable Video Grid */}
        <VideoCardGrid videos={sortedVideos} onOpenVideo={onOpenVideo} />
      </div>
    </section>
  );
};
