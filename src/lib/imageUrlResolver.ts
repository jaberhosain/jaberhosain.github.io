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

export interface BehanceExtractResult {
  success: boolean;
  title?: string;
  description?: string;
  coverImage?: string;
  images: string[];
  source: string;
  note?: string;
  error?: string;
}

const BEHANCE_RES_RANK: Record<string, number> = {
  max_3840: 6,
  source: 6,
  orig: 6,
  max_1920: 5,
  '1400_opt_1': 5,
  '1400': 5,
  max_1200: 4,
  fs: 3,
  disp: 2,
  hd: 2,
};

function scoreBehanceResolution(url: string): number {
  const lower = url.toLowerCase();
  for (const [k, weight] of Object.entries(BEHANCE_RES_RANK)) {
    if (lower.includes(`/${k}/`)) return weight;
  }
  return lower.includes('/project_modules/') ? 1 : 0;
}

/**
 * Parses raw HTML source, CSS, Markdown, or newline/comma-separated text
 * to extract all unique direct poster/image URLs cleanly.
 */
export function extractImageUrlsFromRawTextOrHtml(input: string): string[] {
  if (!input || typeof input !== 'string') return [];

  const decoded = input
    .replace(/\\u002F/gi, '/')
    .replace(/\\\//g, '/')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"');

  const urls: string[] = [];

  // 1. Prioritize Behance CDN project module URLs (pick highest resolution per asset filename)
  const behanceRegex =
    /https?:\/\/mir-s3-cdn-cf\.behance\.net\/(?:project_modules|projects)\/[^\s"'<>\\)]+?\.(?:jpe?g|png|webp|gif)(?:\?[^\s"'<>\\)]*)?/gi;
  const behanceMatches = decoded.match(behanceRegex) || [];
  if (behanceMatches.length > 0) {
    const bestByAsset = new Map<string, { url: string; score: number }>();
    const order: string[] = [];
    for (const raw of behanceMatches) {
      const clean = raw.replace(/[),.;]+$/, '');
      const lower = clean.toLowerCase();
      if (
        lower.includes('/user/') ||
        lower.includes('/avatars/') ||
        lower.includes('max_384') ||
        lower.includes('/280/') ||
        lower.includes('/202/') ||
        lower.includes('/115/')
      ) {
        continue;
      }
      const assetKey = (clean.match(/\/([a-zA-Z0-9_-]+\.(?:jpe?g|png|webp|gif))(?:\?|$)/i)?.[1] || clean).toLowerCase();
      const score = scoreBehanceResolution(clean);
      const prev = bestByAsset.get(assetKey);
      if (!prev) {
        order.push(assetKey);
        bestByAsset.set(assetKey, { url: clean, score });
      } else if (score > prev.score) {
        bestByAsset.set(assetKey, { url: clean, score });
      }
    }
    order.forEach((k) => urls.push(bestByAsset.get(k)!.url));
  }

  // 2. Also capture standard direct image URLs or Google Drive links pasted in multi-line text
  const generalRegex = /https?:\/\/[^\s"'<>\\)]+/gi;
  const allMatches = decoded.match(generalRegex) || [];
  for (const raw of allMatches) {
    const clean = raw.replace(/[),.;]+$/, '');
    const lower = clean.toLowerCase();
    if (lower.includes('mir-s3-cdn-cf.behance.net/')) continue; // already handled above
    if (
      lower.includes('behance.net/assets') ||
      lower.includes('/favicon') ||
      lower.includes('static.licdn.com') ||
      lower.includes('captcha')
    ) {
      continue;
    }
    const kind = classifyImageUrl(clean);
    if (kind === 'direct' || kind === 'google_drive') {
      const normalized = normalizeDirectImageUrl(clean);
      if (normalized && !urls.includes(normalized)) {
        urls.push(normalized);
      }
    }
  }

  return urls;
}

/**
 * Extracts project title, description, cover image, and ALL individual posters
 * from a Behance project URL (`behance.net/gallery/...`).
 */
export async function resolveBehanceProjectFromUrl(rawUrl: string): Promise<BehanceExtractResult> {
  const cleanUrl = rawUrl.trim();
  if (!cleanUrl) {
    return { success: false, images: [], source: 'none', error: 'Please paste a Behance project URL first.' };
  }

  const normalizedUrl = !/^https?:\/\//i.test(cleanUrl) ? `https://${cleanUrl}` : cleanUrl;

  // If user directly pasted a Behance CDN poster image instead of the gallery page
  if (normalizedUrl.toLowerCase().includes('mir-s3-cdn-cf.behance.net/')) {
    return {
      success: true,
      coverImage: normalizedUrl,
      images: [normalizedUrl],
      source: 'direct_cdn',
      note: 'Added direct Behance poster image.',
    };
  }

  const isGitHubPages =
    typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');

  // 1. Try local Express /api/extract-behance endpoint
  if (!isGitHubPages) {
    try {
      const res = await fetch(`/api/extract-behance?url=${encodeURIComponent(normalizedUrl)}`, {
        signal: AbortSignal.timeout(14000),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data?.success && Array.isArray(data.images) && data.images.length > 0) {
          return {
            success: true,
            title: data.title,
            description: data.description,
            coverImage: data.coverImage || data.images[0],
            images: data.images,
            source: data.source || 'server',
            note: `Behance থেকে ${data.images.length}টি পোস্টার অটোমেটিক ইম্পোর্ট হয়েছে।`,
          };
        }
      }
    } catch {
      // Fall through to client-side extractors
    }
  }

  // 2. Client fallback: r.jina.ai text/markdown mirror (CORS-friendly & captures full gallery posters)
  try {
    const jinaRes = await fetch(`https://r.jina.ai/${normalizedUrl}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (jinaRes.ok) {
      const md = await jinaRes.text();
      const extracted = extractImageUrlsFromRawTextOrHtml(md);
      if (extracted.length > 0) {
        const titleLine = md.match(/^Title:\s*(.+)$/m)?.[1]
          ?.replace(/\s*::\s*Behance\s*$/i, '')
          ?.replace(/\s+on\s+Behance\s*$/i, '')
          ?.trim();
        return {
          success: true,
          title: titleLine,
          coverImage: extracted[0],
          images: extracted,
          source: 'jina_client',
          note: `Extracted ${extracted.length} poster(s) from Behance.`,
        };
      }
    }
  } catch {
    // Fall through to Microlink cover fallback
  }

  // 3. Microlink fallback (gets cover image + title cleanly)
  try {
    const mlRes = await fetch(`https://api.microlink.io?url=${encodeURIComponent(normalizedUrl)}`, {
      signal: AbortSignal.timeout(7000),
    });
    if (mlRes.ok) {
      const mlData = await mlRes.json();
      const cover = mlData?.data?.image?.url;
      if (cover && isUsefulResolvedImage(cover, normalizedUrl)) {
        const cleanTitle = (mlData?.data?.title || '')
          .replace(/\s*::\s*Behance\s*$/i, '')
          .replace(/\s+on\s+Behance\s*$/i, '')
          .trim();
        return {
          success: true,
          title: cleanTitle || undefined,
          description: mlData?.data?.description || undefined,
          coverImage: cover,
          images: [cover],
          source: 'microlink',
          note: 'Extracted Behance cover image (add remaining posters below if needed).',
        };
      }
    }
  } catch {
    // Final error guidance
  }

  return {
    success: false,
    images: [],
    source: 'blocked',
    error:
      'Behance এই প্রজেক্টে অটো-স্ক্র্যাপিং ব্লক করেছে। সহজ সমাধান: নিচে "Multi-URL / Page Source" বক্সে পোস্টারের ডিরেক্ট লিংক অথবা Behance পেজের Ctrl+U সোর্স পেস্ট করুন, কিংবা সরাসরি কম্পিউটার/ফোন থেকে পোস্টারগুলো আপলোড করুন।',
  };
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

  // If user pasted a Behance project link into a single-image field, use the Behance multi-extractor first
  if (kind === 'behance_page') {
    const be = await resolveBehanceProjectFromUrl(normalized);
    if (be.success && be.coverImage) {
      return {
        imageUrl: normalizeDirectImageUrl(be.coverImage),
        title: be.title,
        resolvedFromPage: true,
        note: be.images.length > 1
          ? `Behance কভার ইমেজ পাওয়া গেছে (${be.images.length}টি পোস্টারের মধ্যে ১মটি)। সবগুলো পোস্টার যোগ করতে নিচের "Import from Behance" ব্যবহার করুন।`
          : 'Extracted cover image from Behance link automatically.'
      };
    }
  }

  // 1. Try local Express /api/fetch-og endpoint if running in Node/dev mode
  const isGitHubPages =
    typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');

  if (!isGitHubPages) {
    try {
      const res = await fetch(`/api/fetch-og?url=${encodeURIComponent(normalized)}`, {
        signal: AbortSignal.timeout(7000)
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
        'Behance পেজ থেকে অটোমেটিক ছবি নেওয়া যায়নি। Behance-এ পোস্টারটির ওপর Right-Click → "Copy image address" (mir-s3-cdn-cf.behance.net/...) দিয়ে লিংকটি দিন অথবা ছবি ফাইল আপলোড করুন।'
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

