import React from 'react';

export interface VimeoInfo {
  id: string | null;
  hash: string | null;
}

/**
 * Extract YouTube 11-character video ID from any YouTube URL
 */
export function extractYouTubeId(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();
  const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (match && match[1]) {
    return match[1];
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const matchOld = clean.match(regExp);
  return (matchOld && matchOld[2] && matchOld[2].length === 11) ? matchOld[2] : null;
}

/**
 * Extract Vimeo video ID and privacy hash (for unlisted videos)
 * Supports:
 * - https://vimeo.com/123456789
 * - https://vimeo.com/123456789/abcdef1234 (unlisted video with privacy hash)
 * - https://player.vimeo.com/video/123456789
 * - https://player.vimeo.com/video/123456789?h=abcdef1234
 * - https://vimeo.com/channels/xyz/123456789
 * - https://vimeo.com/groups/name/videos/123456789
 * - https://vimeo.com/manage/videos/123456789
 */
export function extractVimeoInfo(url?: string | null): VimeoInfo {
  if (!url || typeof url !== 'string') return { id: null, hash: null };
  const clean = url.trim();

  // 1. player.vimeo.com/video/{id}?h={hash}
  const playerMatch = clean.match(/player\.vimeo\.com\/video\/(\d+)(?:[/?].*h=([a-zA-Z0-9]+))?/i);
  if (playerMatch) {
    let hash = playerMatch[2] || null;
    if (!hash) {
      const qHash = clean.match(/[?&]h=([a-zA-Z0-9]+)/i);
      if (qHash) hash = qHash[1];
    }
    return { id: playerMatch[1], hash };
  }

  // 2. Unlisted format: vimeo.com/{id}/{hash}
  const unlistedMatch = clean.match(/vimeo\.com\/(\d+)\/([a-zA-Z0-9]+)/i);
  if (unlistedMatch) {
    return { id: unlistedMatch[1], hash: unlistedMatch[2] };
  }

  // 3. Query param hash format: vimeo.com/{id}?h={hash}
  const queryHashMatch = clean.match(/vimeo\.com\/(\d+)[^?]*[?&]h=([a-zA-Z0-9]+)/i);
  if (queryHashMatch) {
    return { id: queryHashMatch[1], hash: queryHashMatch[2] };
  }

  // 4. Standard channels / groups / manage / standard ID
  const standardMatch = clean.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|manage\/videos\/)?(\d+))/i);
  if (standardMatch) {
    const qHash = clean.match(/[?&]h=([a-zA-Z0-9]+)/i);
    return { id: standardMatch[1], hash: qHash ? qHash[1] : null };
  }

  // 5. Fallback: any 6-12 consecutive digits in a vimeo URL
  if (clean.toLowerCase().includes('vimeo')) {
    const digitMatch = clean.match(/\/(\d{6,12})/);
    if (digitMatch) {
      const qHash = clean.match(/[?&]h=([a-zA-Z0-9]+)/i);
      return { id: digitMatch[1], hash: qHash ? qHash[1] : null };
    }
  }

  return { id: null, hash: null };
}

/**
 * Return official Vimeo embed URL:
 * https://player.vimeo.com/video/ID?h=HASH (h added only if hash exists)
 */
export function getVimeoEmbedUrl(url?: string | null, autoplay = true): string | null {
  const { id, hash } = extractVimeoInfo(url);
  if (!id) return null;
  const params = new URLSearchParams();
  if (autoplay) params.set('autoplay', '1');
  params.set('title', '0');
  params.set('byline', '0');
  params.set('portrait', '0');
  params.set('badge', '0');
  params.set('autopause', '0');
  if (hash) {
    params.set('h', hash);
  }
  return `https://player.vimeo.com/video/${id}?${params.toString()}`;
}

/**
 * Auto-detect video platform from URL
 */
export function detectVideoType(url?: string | null): 'youtube' | 'vimeo' | 'facebook' | 'direct' {
  if (!url) return 'direct';
  const clean = url.trim().toLowerCase();
  if (extractVimeoInfo(clean).id || clean.includes('vimeo.com')) {
    return 'vimeo';
  }
  if (extractYouTubeId(clean) || clean.includes('youtube.com') || clean.includes('youtu.be')) {
    return 'youtube';
  }
  if (clean.includes('facebook.com') || clean.includes('fb.watch')) {
    return 'facebook';
  }
  return 'direct';
}

/**
 * Detect whether video link indicates a vertical / portrait video (Shorts, Reels, TikTok)
 */
export function isVerticalVideoFormat(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim().toLowerCase();
  return (
    clean.includes('/shorts/') ||
    clean.includes('/reel/') ||
    clean.includes('/reels/') ||
    clean.includes('tiktok.com') ||
    clean.includes('instagram.com/reel') ||
    clean.includes('facebook.com/reel') ||
    clean.includes('fb.watch')
  );
}

export interface VideoAutoMetadata {
  thumbnailUrl?: string;
  fallbackThumbnailUrl?: string;
  title?: string;
  duration?: string;
  videoType: 'vimeo' | 'youtube' | 'facebook' | 'direct';
  videoId?: string;
  videoHash?: string;
}

/**
 * Universally fetch video thumbnail & metadata for YouTube, Vimeo, Facebook
 */
export async function fetchVideoAutoMetadata(url: string): Promise<VideoAutoMetadata | null> {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();
  const detectedType = detectVideoType(clean);
  const ytId = extractYouTubeId(clean);
  const vimeoInfo = extractVimeoInfo(clean);

  // 1. YouTube instant client-side baseline (can be enhanced by backend)
  const defaultYtThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : undefined;
  const maxResYtThumb = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : undefined;

  try {
    const res = await fetch(`/api/fetch-og?url=${encodeURIComponent(clean)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && (data.ogImage || data.thumbnailUrl)) {
        return {
          thumbnailUrl: data.ogImage || data.thumbnailUrl,
          fallbackThumbnailUrl: data.fallbackThumb || defaultYtThumb,
          title: data.ogTitle || data.title || '',
          duration: data.duration,
          videoType: data.platform || detectedType,
          videoId: data.videoId || (detectedType === 'youtube' ? ytId || undefined : vimeoInfo.id || undefined),
          videoHash: data.videoHash || vimeoInfo.hash || undefined
        };
      }
    }
  } catch (err) {
    console.warn('Video auto-metadata fetch notice:', err);
  }

  // Fallbacks if backend is unreachable
  if (detectedType === 'youtube' && ytId) {
    return {
      thumbnailUrl: maxResYtThumb || defaultYtThumb,
      fallbackThumbnailUrl: defaultYtThumb,
      videoType: 'youtube',
      videoId: ytId
    };
  }

  if (detectedType === 'vimeo' && vimeoInfo.id) {
    return {
      videoType: 'vimeo',
      videoId: vimeoInfo.id,
      videoHash: vimeoInfo.hash || undefined
    };
  }

  return {
    videoType: detectedType,
    videoId: ytId || vimeoInfo.id || undefined,
    videoHash: vimeoInfo.hash || undefined
  };
}

/**
 * Fetch Vimeo thumbnail & details through secure backend proxy endpoint
 */
export async function fetchVimeoMetadata(url: string): Promise<{
  thumbnailUrl?: string;
  title?: string;
  duration?: string;
  videoId?: string;
  videoHash?: string;
} | null> {
  const meta = await fetchVideoAutoMetadata(url);
  if (!meta) return null;
  return {
    thumbnailUrl: meta.thumbnailUrl,
    title: meta.title,
    duration: meta.duration,
    videoId: meta.videoId,
    videoHash: meta.videoHash
  };
}

/**
 * Crisp SVG Vimeo Brand Icon
 */
export const VimeoIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M22.84 6.72c-.11 2.37-1.74 5.62-4.9 9.75-3.27 4.31-6.04 6.46-8.31 6.46-1.42 0-2.61-1.31-3.59-3.93-.65-2.4-1.3-4.79-1.96-7.19-.71-2.4-1.47-3.6-2.29-3.6-.17 0-.76.36-1.77 1.09L-0.03 7.8C1.06 6.84 2.21 5.91 3.42 5c1.69-1.25 2.94-1.9 3.76-1.95 1.96-.11 3.16 1.23 3.6 4.02.49 3.1.82 5.04 1 5.8.54 2.5 1.14 3.75 1.8 3.75.5 0 1.25-.82 2.24-2.46.98-1.64 1.5-2.89 1.55-3.75.11-1.37-.41-2.05-1.55-2.05-.55 0-1.12.13-1.71.38 1.14-3.74 3.32-5.55 6.55-5.43 2.4.11 3.53 1.58 3.4 4.41z"/>
  </svg>
);
