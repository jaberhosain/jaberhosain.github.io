export type ImageUrlKind =
  | 'empty'
  | 'local'
  | 'direct'
  | 'google_drive'
  | 'behance_page'
  | 'postimg_page'
  | 'imgbb_page'
  | 'webpage';

export interface ImageResolveResult {
  imageUrl: string;
  title?: string;
  resolvedFromPage: boolean;
  note?: string;
  error?: string;
}

const IMAGE_EXT_REGEX = /\.(jpe?g|png|webp|gif|avif|svg|bmp)(\?.*|#.*)?$/i;

/**
 * Extracts a Google Drive file ID from common share/view/open/uc URLs.
 */
export function extractGoogleDriveId(url: string): string | null {
  if (!url || !url.includes('drive.google.com')) return null;
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch?.[1]) return fileMatch[1];
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch?.[1]) return idMatch[1];
  return null;
}

/**
 * Normalizes known direct/share image URLs (e.g., Google Drive view links)
 * into browser-renderable image CDN URLs.
 */
export function normalizeDirectImageUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const clean = rawUrl.trim();
  if (!clean) return '';

  // Allow relative/local asset paths and data URIs untouched
  if (clean.startsWith('/') || clean.startsWith('./') || clean.startsWith('data:')) {
    return clean;
  }

  // Convert Google Drive share links to high-res thumbnail URLs
  const driveId = extractGoogleDriveId(clean);
  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`;
  }

  // Ensure protocol if user omitted https:// on a domain path
  if (!/^https?:\/\//i.test(clean) && /^[a-z0-9.-]+\.[a-z]{2,}\//i.test(clean)) {
    return `https://${clean}`;
  }

  return clean;
}

/**
 * Classifies an image URL to determine whether it is already a direct image CDN link
 * or a webpage wrapper (e.g. postimg.cc/xxx, ibb.co/xxx, behance.net/gallery/...).
 */
export function classifyImageUrl(rawUrl?: string): ImageUrlKind {
  const clean = normalizeDirectImageUrl(rawUrl);
  if (!clean) return 'empty';
  if (clean.startsWith('/') || clean.startsWith('./')) return 'local';

  const lower = clean.toLowerCase();

  if (lower.includes('drive.google.com/thumbnail')) return 'google_drive';

  // Known direct image CDN hosts
  if (
    lower.includes('i.postimg.cc/') ||
    lower.includes('i.ibb.co/') ||
    lower.includes('mir-s3-cdn-cf.behance.net/') ||
    lower.includes('firebasestorage.googleapis.com/') ||
    lower.includes('lh3.googleusercontent.com/') ||
    lower.includes('images.unsplash.com/') ||
    lower.includes('res.cloudinary.com/') ||
    lower.includes('i.imgur.com/') ||
    IMAGE_EXT_REGEX.test(lower)
  ) {
    return 'direct';
  }

  if (lower.includes('behance.net/')) return 'behance_page';
  if (lower.includes('postimg.cc/') || lower.includes('postimages.org/')) return 'postimg_page';
  if (lower.includes('ibb.co/')) return 'imgbb_page';

  return 'webpage';
}

function isUsefulResolvedImage(candidateUrl: string, sourceUrl: string): boolean {
  if (!candidateUrl || candidateUrl.startsWith('data:')) return false;
  const lower = candidateUrl.toLowerCase();
  // Reject Behance anti-bot/logo assets or generic placeholder favicons
  if (
    lower.includes('behance.net/assets') ||
    lower.includes('static.licdn.com') ||
    lower.includes('/favicon') ||
    lower.includes('captcha')
  ) {
    return false;
  }
  return candidateUrl !== sourceUrl;
}

/**
 * Resolves a pasted link into a renderable direct image URL.
 * - Direct image URLs and Google Drive links resolve instantaneously client-side.
 * - Host wrapper pages (postimg.cc/..., ibb.co/..., behance.net/...) try /api/fetch-og
 *   (when running with backend) and Microlink metadata API fallback (for static GitHub Pages).
 */
export async function resolveImageFromUrl(rawUrl: string): Promise<ImageResolveResult> {
  const normalized = normalizeDirectImageUrl(rawUrl);
  if (!normalized) {
    return { imageUrl: '', resolvedFromPage: false, error: 'Please paste an image URL first.' };
  }

  const kind = classifyImageUrl(normalized);
  if (kind === 'local' || kind === 'direct' || kind === 'google_drive') {
    return {
      imageUrl: normalized,
      resolvedFromPage: normalized !== rawUrl.trim(),
      note: kind === 'google_drive' ? 'Converted Google Drive link to direct high-res image URL.' : undefined
    };
  }

  // 1. Try local Express /api/fetch-og endpoint if running in Node/dev mode
  const isGitHubPages =
    typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');

  if (!isGitHubPages) {
    try {
      const res = await fetch(`/api/fetch-og?url=${encodeURIComponent(normalized)}`, {
        signal: AbortSignal.timeout(6500)
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data?.success && data?.ogImage && isUsefulResolvedImage(data.ogImage, normalized)) {
          return {
            imageUrl: normalizeDirectImageUrl(data.ogImage),
            title: data.ogTitle || undefined,
            resolvedFromPage: true,
            note: 'Extracted direct image link automatically.'
          };
        }
      }
    } catch {
      // Fall through to CORS metadata API
    }
  }

  // 2. Client-safe CORS OpenGraph lookup (works on static github.io)
  try {
    const mlRes = await fetch(`https://api.microlink.io?url=${encodeURIComponent(normalized)}`, {
      signal: AbortSignal.timeout(7000)
    });
    if (mlRes.ok) {
      const mlData = await mlRes.json();
      const extracted = mlData?.data?.image?.url || mlData?.data?.logo?.url;
      if (extracted && isUsefulResolvedImage(extracted, normalized)) {
        return {
          imageUrl: normalizeDirectImageUrl(extracted),
          title: mlData?.data?.title || undefined,
          resolvedFromPage: true,
          note: 'Extracted direct image link automatically.'
        };
      }
    }
  } catch {
    // Fall through to user-friendly guidance
  }

  // 3. Actionable guidance when the host page blocks automated scraping
  if (kind === 'behance_page') {
    return {
      imageUrl: normalized,
      resolvedFromPage: false,
      error:
        'Behance gallery pages block automated extraction. Open your project on Behance, right-click the poster image → "Copy image address" (mir-s3-cdn-cf.behance.net/...), and paste that link — or upload the image file.'
    };
  }

  if (kind === 'postimg_page') {
    return {
      imageUrl: normalized,
      resolvedFromPage: false,
      error:
        'That is a Postimages webpage link. On Postimages, copy the "Direct link" (starts with https://i.postimg.cc/...) instead of the Share link.'
    };
  }

  if (kind === 'imgbb_page') {
    return {
      imageUrl: normalized,
      resolvedFromPage: false,
      error:
        'That is an ImgBB webpage link. Copy the "Direct link" (starts with https://i.ibb.co/...) instead.'
    };
  }

  return {
    imageUrl: normalized,
    resolvedFromPage: false,
    error:
      'Could not extract a direct image from this webpage URL. Please copy the direct image address (.jpg/.png/.webp or i.postimg.cc / mir-s3-cdn-cf.behance.net) or upload the image file.'
  };
}

export interface ProjectPosterEntry {
  url: string;
  caption?: string;
}

/**
 * Returns the deduplicated, normalized ordered list of posters for a project group
 * (coverImage + galleryImages), aligning captions identically for cards and LightboxModal.
 */
export function getProjectPosters(project: {
  coverImage?: string;
  galleryImages?: string[];
  galleryCaptions?: string[];
}): ProjectPosterEntry[] {
  const result: ProjectPosterEntry[] = [];
  const seen = new Set<string>();

  const gallery = Array.isArray(project.galleryImages) ? project.galleryImages : [];
  const captions = Array.isArray(project.galleryCaptions) ? project.galleryCaptions : [];
  const normCover = normalizeDirectImageUrl(project.coverImage);

  const normalizedGallery = gallery
    .map((u, i) => ({ url: normalizeDirectImageUrl(u), caption: captions[i] || '' }))
    .filter((item) => Boolean(item.url));

  const coverInGallery = normCover ? normalizedGallery.some((item) => item.url === normCover) : false;

  if (normCover && !coverInGallery) {
    seen.add(normCover);
    result.push({ url: normCover, caption: '' });
  }

  for (const item of normalizedGallery) {
    if (!seen.has(item.url)) {
      seen.add(item.url);
      result.push(item);
    }
  }

  return result;
}

