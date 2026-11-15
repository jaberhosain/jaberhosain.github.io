import express from 'express';
import path from 'path';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { JABER_CV_SYSTEM_DOCUMENT } from './src/data/jaberCvData';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.resolve(process.cwd(), 'public')));

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory cache for Open Graph & Behance metadata
const ogCache = new Map<string, { ogImage?: string; ogTitle?: string; cachedAt: number }>();
const behanceCache = new Map<string, {
  success: boolean;
  title?: string;
  description?: string;
  coverImage?: string;
  images: string[];
  source: string;
  cachedAt: number;
}>();

const RESOLUTION_RANK: Record<string, number> = {
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

function decodeHtmlAndEscapes(input: string): string {
  return input
    .replace(/\\u002F/gi, '/')
    .replace(/\\\//g, '/')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function scoreBehanceVariant(url: string): number {
  const lower = url.toLowerCase();
  for (const [key, weight] of Object.entries(RESOLUTION_RANK)) {
    if (lower.includes(`/${key}/`)) return weight;
  }
  if (lower.includes('/project_modules/')) return 1;
  return 0;
}

function extractBehancePostersFromText(rawText: string): string[] {
  const decoded = decodeHtmlAndEscapes(rawText);
  const regex = /https?:\/\/mir-s3-cdn-cf\.behance\.net\/(?:project_modules|projects)\/[^\s"'<>\\)]+?\.(?:jpe?g|png|webp|gif)(?:\?[^\s"'<>\\)]*)?/gi;
  const matches = decoded.match(regex) || [];

  // Group by filename (asset hash) so we pick the highest-res version of each unique poster in original order
  const bestByAsset = new Map<string, { url: string; score: number }>();
  const orderedKeys: string[] = [];

  for (const rawCandidate of matches) {
    const clean = rawCandidate.replace(/[),.;]+$/, '');
    const lower = clean.toLowerCase();
    // Skip thumbnails too tiny, avatars, badges, icons
    if (
      lower.includes('/user/') ||
      lower.includes('/avatars/') ||
      lower.includes('max_384') ||
      lower.includes('/280/') ||
      lower.includes('/202/') ||
      lower.includes('/115/') ||
      lower.includes('behance.net/assets') ||
      lower.includes('captcha')
    ) {
      continue;
    }

    const fileMatch = clean.match(/\/([a-zA-Z0-9_-]+\.(?:jpe?g|png|webp|gif))(?:\?|$)/i);
    const assetKey = (fileMatch?.[1] || clean).toLowerCase();
    const score = scoreBehanceVariant(clean);

    const existing = bestByAsset.get(assetKey);
    if (!existing) {
      orderedKeys.push(assetKey);
      bestByAsset.set(assetKey, { url: clean, score });
    } else if (score > existing.score) {
      bestByAsset.set(assetKey, { url: clean, score });
    }
  }

  return orderedKeys.map((k) => bestByAsset.get(k)!.url);
}

function extractMetaContent(html: string, attrName: string, attrValue: string): string | undefined {
  const re1 = new RegExp(`<meta[^>]*${attrName}=["']${attrValue}["'][^>]*content=["']([^"']+)["']`, 'i');
  const re2 = new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*${attrName}=["']${attrValue}["']`, 'i');
  const match = html.match(re1) || html.match(re2);
  return match?.[1] ? decodeHtmlAndEscapes(match[1]).trim() : undefined;
}

async function resolveBehanceProject(targetUrl: string): Promise<{
  success: boolean;
  title?: string;
  description?: string;
  coverImage?: string;
  images: string[];
  source: string;
  message?: string;
}> {
  const cached = behanceCache.get(targetUrl);
  if (cached && Date.now() - cached.cachedAt < 3600000) {
    return cached;
  }

  let title = '';
  let description = '';
  let coverImage = '';
  let images: string[] = [];
  let source = 'direct';

  // 1. Direct fetch with browser headers
  try {
    const directRes = await fetch(targetUrl, {
      redirect: 'follow',
      signal: AbortSignal.timeout(9000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.behance.net/',
      },
    });
    const html = await directRes.text();
    const isChallenge = html.length < 3000 && /captcha|cloudflare|verify you are human|access denied/i.test(html);

    if (!isChallenge && html.length > 500) {
      title = (
        extractMetaContent(html, 'property', 'og:title') ||
        html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
        ''
      )
        .replace(/\s+on\s+Behance\s*$/i, '')
        .replace(/\s*::\s*Behance\s*$/i, '')
        .trim();
      description = extractMetaContent(html, 'property', 'og:description') || extractMetaContent(html, 'name', 'description') || '';
      const ogImg = extractMetaContent(html, 'property', 'og:image') || extractMetaContent(html, 'name', 'twitter:image');
      if (ogImg && !ogImg.includes('behance.net/assets')) {
        coverImage = ogImg;
      }
      images = extractBehancePostersFromText(html);
      if (images.length > 0 && !coverImage) {
        coverImage = images[0];
      }
    }
  } catch {
    // Continue to fallbacks
  }

  // 2. Fallback via Behance oEmbed (often bypasses gallery HTML scraping restrictions for title + cover)
  if (images.length === 0 || !title || !coverImage) {
    try {
      const oembedRes = await fetch(`https://www.behance.net/services/oembed?url=${encodeURIComponent(targetUrl)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortfolioExtractor/1.0)' },
        signal: AbortSignal.timeout(6000),
      });
      if (oembedRes.ok) {
        const oe = await oembedRes.json();
        if (!title && oe.title) title = String(oe.title).trim();
        if (!coverImage && oe.thumbnail_url && !String(oe.thumbnail_url).includes('behance.net/assets')) {
          coverImage = String(oe.thumbnail_url);
          if (!images.includes(coverImage)) images.unshift(coverImage);
          source = source === 'direct' ? 'oembed' : `${source}+oembed`;
        }
      }
    } catch {
      // Continue to Jina mirror
    }
  }

  // 3. Fallback via r.jina.ai readable extractor (extracts full Behance project markdown + all mir-s3-cdn-cf poster images)
  if (images.length <= 1) {
    try {
      const jinaUrl = `https://r.jina.ai/${targetUrl}`;
      const jinaRes = await fetch(jinaUrl, {
        signal: AbortSignal.timeout(10000),
        headers: {
          'Accept': 'text/plain, text/markdown;q=0.9',
          'User-Agent': 'Mozilla/5.0 (compatible; PortfolioExtractor/1.0)',
        },
      });
      if (jinaRes.ok) {
        const md = await jinaRes.text();
        const extractedFromJina = extractBehancePostersFromText(md);
        if (extractedFromJina.length > images.length) {
          images = extractedFromJina;
          source = 'jina';
        } else if (extractedFromJina.length > 0) {
          const merged = [...images];
          for (const u of extractedFromJina) {
            if (!merged.includes(u)) merged.push(u);
          }
          images = merged;
        }
        if (!title) {
          const titleLine = md.match(/^Title:\s*(.+)$/m)?.[1];
          if (titleLine) {
            title = titleLine.replace(/\s*::\s*Behance\s*$/i, '').replace(/\s+on\s+Behance\s*$/i, '').trim();
          }
        }
        if (!coverImage && images.length > 0) {
          coverImage = images[0];
        }
      }
    } catch {
      // Graceful fallback below
    }
  }

  // Deduplicate coverImage + images cleanly
  const uniqueImages: string[] = [];
  const seen = new Set<string>();
  for (const img of images) {
    if (img && !seen.has(img)) {
      seen.add(img);
      uniqueImages.push(img);
    }
  }
  if (!coverImage && uniqueImages.length > 0) {
    coverImage = uniqueImages[0];
  } else if (coverImage && uniqueImages.length === 0) {
    uniqueImages.push(coverImage);
  }

  const success = uniqueImages.length > 0;
  const result = {
    success,
    title: title || undefined,
    description: description || undefined,
    coverImage: coverImage || undefined,
    images: uniqueImages,
    source,
    cachedAt: Date.now(),
    message: success
      ? `Extracted ${uniqueImages.length} poster(s) from Behance.`
      : 'Behance temporarily shielded automated access on this project URL. You can still paste direct poster image URLs, paste page HTML source (Ctrl+U), or upload poster files.',
  };

  if (success) {
    behanceCache.set(targetUrl, result);
  }
  return result;
}

// Multi-poster Behance Project Extractor endpoint
app.get('/api/extract-behance', async (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({ success: false, error: 'URL query parameter is required', images: [] });
  }

  try {
    const parsed = new URL(targetUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ success: false, error: 'Invalid URL protocol', images: [] });
    }
    const result = await resolveBehanceProject(targetUrl);
    return res.json(result);
  } catch (err: any) {
    console.error('Behance extract error:', err);
    return res.status(500).json({
      success: false,
      images: [],
      error: err?.message || 'Failed to extract Behance project posters',
    });
  }
});

// API route to securely fetch Open Graph metadata from links (including Facebook & Behance)
app.get('/api/fetch-og', async (req, res) => {
  const targetUrl = req.query.url as string;

  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({ error: 'URL query parameter is required' });
  }

  try {
    const parsed = new URL(targetUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'Invalid URL protocol' });
    }

    // Check cache (valid for 1 hour)
    const cached = ogCache.get(targetUrl);
    if (cached && Date.now() - cached.cachedAt < 3600000) {
      return res.json({ success: true, ...cached, fromCache: true });
    }

    // Dedicated Behance project extraction support
    if (targetUrl.toLowerCase().includes('behance.net/')) {
      const beResult = await resolveBehanceProject(targetUrl);
      if (beResult.success && beResult.coverImage) {
        const payload = {
          success: true,
          ogImage: beResult.coverImage,
          ogTitle: beResult.title,
          images: beResult.images,
          cachedAt: Date.now(),
        };
        ogCache.set(targetUrl, payload);
        return res.json(payload);
      }
    }

    // Direct support for YouTube (try maxresdefault.jpg, fall back to hqdefault.jpg)
    const ytIdMatch = targetUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (ytIdMatch && ytIdMatch[1]) {
      const ytId = ytIdMatch[1];
      const highResThumb = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
      const fallbackThumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      let chosenThumb = fallbackThumb;

      try {
        const ytHead = await fetch(highResThumb, { 
          method: 'HEAD', 
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortfolioApp/1.0)' },
          signal: AbortSignal.timeout(3500) 
        });
        if (ytHead.ok) {
          chosenThumb = highResThumb;
        }
      } catch (headErr) {
        // Fall back to hqdefault
      }

      // Fetch official title from YouTube oEmbed
      let ogTitle = '';
      try {
        const oembedRes = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`,
          { signal: AbortSignal.timeout(4000) }
        );
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          ogTitle = oembedData.title || '';
        }
      } catch (oeErr) {
        // Ignore oembed failure
      }

      const payload = {
        success: true,
        ogImage: chosenThumb,
        thumbnailUrl: chosenThumb,
        fallbackThumb,
        ogTitle,
        platform: 'youtube',
        videoId: ytId,
        cachedAt: Date.now()
      };
      ogCache.set(targetUrl, payload);
      return res.json(payload);
    }

    // Direct support for Vimeo oEmbed API (fast, reliable, returns high-res thumbnails)
    if (targetUrl.toLowerCase().includes('vimeo.com')) {
      try {
        const vimeoOembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(targetUrl)}`;
        const vimeoRes = await fetch(vimeoOembedUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortfolioApp/1.0)' },
          signal: AbortSignal.timeout(6000),
        });
        if (vimeoRes.ok) {
          const vData = await vimeoRes.json();
          let ogImage = vData.thumbnail_url || '';
          if (ogImage) {
            // Request higher resolution thumbnail
            ogImage = ogImage.replace(/_\d+x\d+/, '_1280').replace(/_\d+\.jpg$/, '_1280.jpg');
          }
          const ogTitle = vData.title || '';
          const durSeconds = vData.duration ? parseInt(vData.duration, 10) : 0;
          const duration = durSeconds > 0 
            ? `${Math.floor(durSeconds / 60)}:${String(durSeconds % 60).padStart(2, '0')}`
            : undefined;

          const unlistedMatch = targetUrl.match(/vimeo\.com\/(\d+)\/([a-zA-Z0-9]+)/i);
          const qHashMatch = targetUrl.match(/[?&]h=([a-zA-Z0-9]+)/i);
          const videoId = String(vData.video_id || unlistedMatch?.[1] || '');
          const videoHash = unlistedMatch?.[2] || qHashMatch?.[1] || undefined;

          const payload = { 
            success: true,
            ogImage, 
            thumbnailUrl: ogImage, 
            ogTitle, 
            duration, 
            videoId, 
            videoHash, 
            platform: 'vimeo', 
            cachedAt: Date.now() 
          };
          ogCache.set(targetUrl, payload);
          return res.json(payload);
        }
      } catch (vErr) {
        console.warn('Vimeo oEmbed fetch attempt failed, falling back to HTML fetch:', vErr);
      }
    }

    // Direct support for Google Drive file links
    const driveFileMatch = targetUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      targetUrl.match(/drive\.google\.com\/(?:open|uc)\?.*id=([a-zA-Z0-9_-]+)/);
    if (driveFileMatch?.[1]) {
      const driveThumb = `https://drive.google.com/thumbnail?id=${driveFileMatch[1]}&sz=w1600`;
      const payload = { success: true, ogImage: driveThumb, ogTitle: 'Google Drive Image', cachedAt: Date.now() };
      ogCache.set(targetUrl, payload);
      return res.json(payload);
    }

    // Attempt fetch with facebookexternalhit User-Agent
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    clearTimeout(timeout);

    const html = await response.text();

    // Extract og:image or twitter:image
    const ogImageMatch =
      html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i) ||
      html.match(/<meta[^>]*name=["']twitter:image(?::src)?["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image(?::src)?["']/i);
    
    // Extract og:title
    const ogTitleMatch = 
      html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);

    let ogImage = ogImageMatch ? ogImageMatch[1].replace(/&amp;/g, '&') : undefined;
    if (ogImage && ogImage.startsWith('/')) {
      try {
        ogImage = new URL(ogImage, parsed.origin).toString();
      } catch {
        // leave as-is
      }
    }
    const ogTitle = ogTitleMatch ? ogTitleMatch[1].replace(/&amp;/g, '&') : undefined;

    if (ogImage && !ogImage.includes('behance.net/assets') && !ogImage.startsWith('data:')) {
      ogCache.set(targetUrl, { ogImage, ogTitle, cachedAt: Date.now() });
      return res.json({ success: true, ogImage, ogTitle });
    }

    // If login redirect or JS challenge blocked extraction
    return res.json({ 
      success: false, 
      message: 'No open graph image could be extracted automatically. Please paste the direct image URL or upload the image file.',
      ogTitle: ogTitle || ''
    });
  } catch (err: any) {
    console.error('Fetch OG error:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to fetch Open Graph metadata' 
    });
  }
});

// Portfolio AI Agent Server-Side Chat Endpoint
app.post('/api/agent/chat', async (req, res) => {
  const { message, language = 'en', history = [], portfolioSummary = '' } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const ai = getGenAIClient();
  if (!ai) {
    return res.status(503).json({ error: 'AI service key not configured on server' });
  }

  try {
    const systemInstruction = [
      'You are the dedicated, deeply knowledgeable AI Career Agent & Portfolio Research Assistant for Md. Jaber Hosain (মোঃ জাবের হোসাইন).',
      'Before answering, carefully analyze BOTH the FULL OFFICIAL CV DOCUMENT and the COMPLETE LIVE WEBSITE & PORTFOLIO DIGEST below—combining facts across projects, poster groups, video edits, tools, education, training, workflow steps, channels, 3D interactive site structure, and contact links.',
      'Speak warmly, thoughtfully, and naturally like an expert human talent representative—never robotic, never apologetic without cause, and NEVER default lazily to "দুঃখিত" or "জানি না" when the answer can be synthesized from his portfolio, CV, or closely adjacent skills.',
      '',
      'LANGUAGE & STYLE RULES:',
      '- Reply in the exact language the visitor uses (Bengali script if Bangla or Banglish; English if English; Arabic if Arabic).',
      `- UI fallback language hint: ${language}.`,
      '- Give substantive, well-structured, insightful replies (3 to 6 crisp sentences or clean bullet points when comparing projects/skills/CV records). Cite specific project titles, poster counts, software tools, GPA scores, or links when helpful.',
      '',
      'RESEARCH & REASONING RULES (CRITICAL):',
      '1. FULL WEBSITE + CV SYNTHESIS: Answer questions about his videos, graphic design groups, individual posters, Behance links, Best Works, Adobe tools (Premiere Pro, After Effects, Photoshop, Illustrator), AI workflow, services, creative process, education (Alim GPA 4.14, Dakhil GPA 3.94), Al Manar Hostel admin/finance experience, As-Sunnah Institute training, expected salary (Tk. 20,000), preferred locations, and contact info using exact data from both sections below.',
      '2. EXPLORATORY, HIRING & ADVISORY QUESTIONS: If a visitor asks broad/evaluative questions ("কেন জাবেরকে হায়ার করব?", "তাঁর কাজ কেমন?", "বাজেট/বেতন কেমন?", "একটা প্রজেক্টে কত সময় লাগে?", "কোন প্রজেক্টটা সবচেয়ে ভালো?", "ওয়েবসাইটে কী কী আছে?", "how can he help my business?"), analyze his real experience, workflow, project variety, and CV strengths to craft a convincing, grounded answer.',
      '3. RELATED / ADJACENT SKILLS (কাছাকাছি দক্ষতা): If asked about adjacent tools or services not literally named in the CV (e.g., CapCut/DaVinci Resolve, Figma, WordPress/web dev, YouTube SEO, social media management, remote/freelance work), clearly distinguish what is vs. isn’t explicitly on the CV while connecting his verified transferable skills (Premiere Pro/After Effects, Photoshop/Illustrator, Meta Marketing, AI-built portfolio website, MS Office/Linux/macOS/Windows).',
      '4. STRICT HONESTY WITHOUT LAZY APOLOGIES: Only state that you do not have a detail if it is genuinely private/off-domain (e.g., live breaking news, unrelated trivia, private secrets/exact unpublished price quote). State it calmly in one clear sentence and pivot naturally to relevant things you CAN answer from his site or CV—without repeating "দুঃখিত" every turn.',
      '',
      JABER_CV_SYSTEM_DOCUMENT,
      '',
      '=== COMPLETE LIVE WEBSITE & PORTFOLIO DIGEST (FIRESTORE) ===',
      portfolioSummary || 'Portfolio URL: https://jaberhosain.github.io/'
    ].join('\n');

    // Sanitize prior chat turns for Gemini multi-turn history (must start with user role and alternate cleanly)
    const rawTurns = Array.isArray(history) ? history.slice(-10) : [];
    const formattedHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    for (const turn of rawTurns) {
      if (!turn || typeof turn.text !== 'string' || !turn.text.trim()) continue;
      // Skip initial static welcome assistant greeting before first user message
      if (formattedHistory.length === 0 && turn.role !== 'user') continue;
      const role: 'user' | 'model' = turn.role === 'user' ? 'user' : 'model';
      const last = formattedHistory[formattedHistory.length - 1];
      if (last && last.role === role) {
        last.parts[0].text += `\n${turn.text.trim()}`;
      } else {
        formattedHistory.push({ role, parts: [{ text: turn.text.trim() }] });
      }
    }
    // Remove trailing user turn if caller included the current message in history
    if (
      formattedHistory.length > 0 &&
      formattedHistory[formattedHistory.length - 1].role === 'user' &&
      formattedHistory[formattedHistory.length - 1].parts[0].text === message.trim()
    ) {
      formattedHistory.pop();
    }

    let reply = '';
    let lastError: any = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const chat = ai.chats.create({
          model: 'gemini-4-hydrogen',
          history: formattedHistory,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          },
        });
        const response = await chat.sendMessage({ message });
        reply = (response.text ?? '').trim();
        if (reply) break;
      } catch (err) {
        lastError = err;
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 350));
        }
      }
    }

    if (!reply) {
      throw lastError || new Error('Empty response from Gemini model');
    }

    return res.json({ success: true, reply });
  } catch (err: any) {
    console.error('AI Agent error:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to generate AI response',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
