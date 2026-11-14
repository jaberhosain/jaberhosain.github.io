import React, { useEffect, useState, useRef } from 'react';
import { X, ExternalLink, Play, Facebook, Youtube, Maximize2, Minimize2 } from 'lucide-react';
import { VideoShowcaseItem } from '../types/portfolio';
import { usePortfolio } from '../context/PortfolioContext';
import { 
  extractYouTubeId, 
  extractVimeoInfo, 
  getVimeoEmbedUrl, 
  isVerticalVideoFormat,
  VimeoIcon 
} from '../lib/videoUtils';

export { extractYouTubeId };

interface VideoModalProps {
  video: VideoShowcaseItem | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  const { loc, ui } = usePortfolio();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (modalContainerRef.current) {
          await modalContainerRef.current.requestFullscreen();
        }
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request notice:', err);
    }
  };

  if (!video) return null;

  const ytId = extractYouTubeId(video.videoUrl);
  const vimeoInfo = extractVimeoInfo(video.videoUrl);
  const isVimeo = video.videoType === 'vimeo' || Boolean(vimeoInfo.id);
  const isYouTube = !isVimeo && (video.videoType === 'youtube' || Boolean(ytId));
  const isFacebook = !isVimeo && !isYouTube && (video.videoType === 'facebook' || (video.videoUrl && (video.videoUrl.includes('facebook.com') || video.videoUrl.includes('fb.watch'))));
  const isVertical = isVerticalVideoFormat(video.videoUrl);

  // Determine Facebook embed URL
  let facebookEmbedUrl = '';
  if (isFacebook && video.videoUrl) {
    const isPost = video.videoUrl.includes('/share/p/') || video.videoUrl.includes('/posts/');
    if (isPost) {
      facebookEmbedUrl = `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(video.videoUrl)}&show_text=true&width=500`;
    } else {
      facebookEmbedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(video.videoUrl)}&show_text=false&width=500`;
    }
  }

  const vimeoEmbedUrl = isVimeo ? getVimeoEmbedUrl(video.videoUrl, true) : null;

  const defaultTitle = isVimeo 
    ? 'Vimeo Video Showcase' 
    : isYouTube 
    ? 'YouTube Video Showcase' 
    : isFacebook 
    ? 'Facebook Video Edit' 
    : 'Video Showcase';

  const videoTitle = (video.title && loc(video.title)) ? loc(video.title) : defaultTitle;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-4 md:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalContainerRef}
        className={`relative flex flex-col w-full bg-[#181B22] border border-[#2B303D] rounded-2xl overflow-hidden shadow-2xl transition-all ${
          isFullscreen
            ? 'h-full w-full max-w-none max-h-none rounded-none'
            : isVertical
            ? 'max-w-xl max-h-[96vh]'
            : 'max-w-6xl max-h-[96vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5 border-b border-[#2B303D] bg-[#121419]">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse min-w-0 pr-3">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isVimeo ? 'bg-[#1AB7EA]' : 'bg-[#E4583B]'}`} />
            <h3 className="font-semibold text-sm sm:text-base text-[#F4F0E8] truncate">
              {videoTitle}
            </h3>
            {isVertical && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E4583B]/15 text-[#E4583B] border border-[#E4583B]/30">
                Portrait / Reel
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse shrink-0">
            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-[#DDD1BE] hover:text-[#F4F0E8] bg-[#20242E] hover:bg-[#2B303D] border border-[#2B303D] rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Clear Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-[#DDD1BE] hover:text-[#F4F0E8] bg-[#20242E] hover:bg-[#2B303D] border border-[#2B303D] rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
              aria-label="Close video"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Stage - Responsive Contain Fit (Never cropped or half-hidden) */}
        <div className="relative w-full bg-black flex items-center justify-center overflow-hidden flex-1 min-h-[45vh] max-h-[80vh] p-1 sm:p-2">
          <div
            className={`relative flex items-center justify-center w-full h-full ${
              isVertical 
                ? 'aspect-[9/16] max-h-[78vh] max-w-[420px] mx-auto rounded-xl overflow-hidden' 
                : 'aspect-[16/9] max-h-[78vh] w-full rounded-xl overflow-hidden'
            }`}
          >
            {isVimeo && vimeoEmbedUrl ? (
              <div className="relative w-full h-full bg-[#0F1419] flex items-center justify-center">
                {/* Friendly message layer visible if Vimeo embed is blocked by privacy settings */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0 bg-[#0E1217]">
                  <div className="w-12 h-12 rounded-2xl bg-[#141A20] border border-[#232B33] flex items-center justify-center text-[#1AB7EA] mb-3">
                    <VimeoIcon className="w-6 h-6 fill-current" />
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">Playing Vimeo Video</p>
                  <p className="text-xs text-neutral-400 max-w-sm mb-4">
                    If this video has privacy restrictions that prevent embedding, watch it directly on Vimeo.
                  </p>
                  {video.videoUrl && (
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#1AB7EA] hover:bg-[#169AC4] transition-all shadow-md"
                    >
                      <VimeoIcon className="w-3.5 h-3.5 fill-current" />
                      <span>Watch on Vimeo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <iframe
                  src={vimeoEmbedUrl}
                  title={videoTitle}
                  className="absolute inset-0 w-full h-full border-0 z-10"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : isYouTube && ytId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                title={videoTitle}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : isFacebook && facebookEmbedUrl ? (
              <div className="w-full h-full flex flex-col items-center justify-center relative">
                {!iframeLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F1419] p-6 text-center z-0">
                    <div className="w-12 h-12 rounded-full bg-[#181E24] border border-[#232B33] flex items-center justify-center text-[#1877F2] mb-3 animate-pulse">
                      <Facebook className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-mono text-neutral-400">Loading Facebook Player...</p>
                  </div>
                )}
                <iframe
                  src={facebookEmbedUrl}
                  title={videoTitle}
                  className="w-full h-full border-0 relative z-10"
                  style={{ border: 'none', overflow: 'hidden' }}
                  scrolling="no"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen={true}
                  onLoad={() => setIframeLoaded(true)}
                />
              </div>
            ) : (
              <video
                src={video.videoUrl}
                poster={video.customThumbnailUrl || video.thumbnailUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain mx-auto"
              />
            )}
          </div>
        </div>
        {/* Footer info & Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 bg-[#121419] border-t border-[#2B303D] text-xs sm:text-sm text-[#A7A298] gap-3">
          <div className="flex items-center space-x-3 rtl:space-x-reverse w-full sm:w-auto justify-between sm:justify-start">
            <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1 rounded-md bg-[#20242E] border border-[#2B303D] text-[11px] font-mono">
              {isVimeo ? (
                <>
                  <VimeoIcon className="w-3.5 h-3.5 text-[#1AB7EA]" />
                  <span className="text-[#1AB7EA]">Vimeo Video</span>
                </>
              ) : isYouTube ? (
                <>
                  <Youtube className="w-3.5 h-3.5 text-[#FF0000]" />
                  <span className="text-[#FF0000]">YouTube Video</span>
                </>
              ) : isFacebook ? (
                <>
                  <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />
                  <span className="text-[#1877F2]">Facebook Video</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current text-[#E4583B]" />
                  <span className="text-[#E4583B]">Video Clip</span>
                </>
              )}
            </span>
            {video.duration && <span className="font-mono text-xs">Duration: {video.duration}</span>}
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse w-full sm:w-auto justify-end">
            {isVimeo && video.videoUrl && (
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#1AB7EA] hover:bg-[#169AC4] transition-all shadow-md group w-full sm:w-auto"
              >
                <VimeoIcon className="w-3.5 h-3.5 fill-current" />
                <span>{ui.projects?.watchOnVimeo || 'Watch on Vimeo'}</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}

            {isYouTube && video.videoUrl && (
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF0000] hover:bg-[#D90000] transition-all shadow-md group w-full sm:w-auto"
              >
                <Youtube className="w-3.5 h-3.5 fill-current" />
                <span>{ui.projects?.watchOnYouTube || 'Watch on YouTube'}</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}

            {isFacebook && video.videoUrl && (
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166FE5] transition-all shadow-md group w-full sm:w-auto"
              >
                <Facebook className="w-3.5 h-3.5 fill-current" />
                <span>Watch on Facebook</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
