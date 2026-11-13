import express from 'express';
import path from 'path';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

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

// In-memory cache for Open Graph metadata
const ogCache = new Map<string, { ogImage?: string; ogTitle?: string; cachedAt: number }>();

// API route to securely fetch Open Graph metadata from links (including Facebook)
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
    const conversationContext = Array.isArray(history)
      ? history
          .slice(-6)
          .map((m: any) => `${m.role === 'user' ? 'Visitor' : 'Assistant'}: ${m.text}`)
          .join('\n')
      : '';

    const systemInstruction = [
      'You are the official Portfolio AI Agent for MD. Jaber Hosain (মোঃ জাবের হোসাইন), a Creative Video Editor, Graphic Designer, and Digital Marketer.',
      'Your role is to help visitors, clients, and recruiters explore his Video Editing portfolio, Graphic Design & Behance poster groups, Skills, Education, and Contact options.',
      'Guidelines:',
      '- Reply in the same language the visitor uses (Bangla, English, or Arabic). Keep responses concise (2 to 4 short sentences or clean bullet points), warm, and professional.',
      '- Base your answers strictly on the provided live portfolio summary below. Never invent fake projects or pricing numbers; for custom quotes, invite them to reach out via the Contact page, Email, or Telegram.',
      '',
      'LIVE PORTFOLIO DATA:',
      portfolioSummary,
    ].join('\n');

    const prompt = conversationContext
      ? `Recent conversation:\n${conversationContext}\n\nVisitor (${language}): ${message}`
      : message;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const reply = (response.text ?? '').trim();
    if (!reply) {
      return res.status(502).json({ error: 'Empty response from model' });
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
