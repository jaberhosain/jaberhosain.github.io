/**
 * MD. JABER HOSAIN — PUBLIC SITE LIVE FIRESTORE & TIMELINE INTERACTION SCRIPT (`script.js`)
 * - Connects to existing Firebase project (`feisty-aegis-148x0` / `ai-studio-a32c5f2f-be5a-4739-9992-ab7827b0449a`)
 * - Reads `siteSettings/published`, `works` (V1 & G1 timeline tiles), and `projects` live via `onSnapshot`
 * - Listens for instant `postMessage` updates when embedded inside the Admin Live Preview iframe
 * - Plays the once-only hero timeline playhead sweep (`00:00:00` -> `00:00:24`) respecting `prefers-reduced-motion`
 * - Falls back gracefully to safe default content if offline or if Firestore fails to load
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import {
  getFirestore,
  doc,
  collection,
  query,
  where,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

// <!-- EDIT HERE: Your existing Firebase configuration -->
export const FIREBASE_CONFIG = {
  projectId: 'feisty-aegis-148x0',
  appId: '1:142615067158:web:11dc09442f3e859efcd337',
  apiKey: 'AIzaSyDwtjih37v9c2fkvu4bYlp3KqJVICKbFuk',
  authDomain: 'feisty-aegis-148x0.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-a32c5f2f-be5a-4739-9992-ab7827b0449a',
  storageBucket: 'feisty-aegis-148x0.firebasestorage.app',
  messagingSenderId: '142615067158'
};

// SAFE DEFAULT CONTENT (Used immediately on boot and if Firestore fails to load)
export const DEFAULT_SITE_SETTINGS = {
  status: 'published',
  colors: {
    bgDeep: '#121217',
    bgPrimary: '#17171C',
    bgElevated: '#1E1E26',
    accent: '#FF4B5C',
    textPrimary: '#F3EFE6',
    textMuted: '#A9A7B3'
  },
  fonts: {
    display: "'Playfair Display', 'Bodoni Moda', Georgia, serif",
    sans: "'Inter', 'Plus Jakarta Sans', sans-serif",
    serif: "'Instrument Serif', Georgia, serif"
  },
  sectionOrder: ['hero', 'stats', 'works', 'about', 'trust', 'contact'],
  sectionVisibility: {
    hero: true,
    stats: true,
    works: true,
    about: true,
    trust: true,
    contact: true
  },
  texts: {
    navMonogram: 'MJ',
    navBrandName: 'MD. JABER HOSAIN',
    navCtaText: "Let's work together",
    /* <!-- EDIT HERE --> Two-line Hero Name, role, tagline & buttons */
    heroEyebrow: '',
    heroTitle: 'MD. JABER',
    heroTitleItalic: 'HOSAIN',
    heroRole: 'Video Editor & Graphic Designer.',
    heroSubline: 'CREATING IDEAS - EDITING STORIES - BUILDING BRANDS',
    heroBtnPrimary: 'View my work',
    heroBtnPrimaryUrl: '#works',
    heroBtnSecondary: "Let's work together",
    heroBtnSecondaryUrl: '#contact',
    heroPortraitUrl: './assets/jabir_profile.png',
    stat1Value: '50+',
    stat1Label: 'Projects Completed',
    stat2Value: '1.5+',
    stat2Label: 'Years of Experience',
    stat3Value: '30+',
    stat3Label: 'Happy Clients',
    aboutKicker: 'ABOUT ME',
    aboutTitle: 'Hi, I’m Md. Jaber Hosain — your creative visual partner.',
    aboutP1:
      'I’m a Video Editor, Graphic Designer, Digital Marketer, and AI Tools Specialist trained at the As-Sunnah Skill Development Institute. I love turning raw footage and brand concepts into clean, cinematic stories and high-converting visuals that make audiences stop and watch.',
    aboutP2:
      'Whether you need high-retention reels, YouTube edits, motion graphics, or a complete social media design system, I combine creative craft with modern AI workflows to deliver fast, reliable results.',
    aboutToolsCsv:
      'Adobe Premiere Pro, Adobe After Effects, Adobe Photoshop, Adobe Illustrator, AI Tools & Workflows, Meta Ads & Digital Marketing, Canva Pro',
    aboutPhotoUrl: './assets/jabir_profile.png',
    test1Quote:
      '“Jaber transformed our raw footage into crisp, high-retention reels. His pacing, sound design, and eye for detail made our brand look truly international.”',
    test1Name: 'Client / Agency Partner',
    test1Role: 'Content Director — Video Editing Project',
    test2Quote:
      '“The poster series and social media ad visuals Jaber designed gave our campaign a distinct, premium identity. Click-through rates improved immediately.”',
    test2Name: 'Brand Founder',
    test2Role: 'E-Commerce & Meta Ad Campaign',
    test3Quote:
      '“Fast communication, clean After Effects motion graphics, and scroll-stopping thumbnails. Jaber is our go-to creative specialist.”',
    test3Name: 'Digital Creator',
    test3Role: 'YouTube & Social Media Channel',
    contactTitle: 'Let’s work together.',
    contactSub:
      'Have a video editing, motion graphics, or graphic design project in mind? Reach out directly—I typically respond within 24 hours.',
    contactCtaText: 'Let’s Work Together',
    contactEmail: 'sbmc.3925@gmail.com',
    contactWhatsappDisplay: '+880 1904-621391',
    contactWhatsappUrl: 'https://wa.me/8801904621391',
    contactBehanceUrl: 'https://www.behance.net/jaberhosain',
    contactLinkedinUrl: 'https://www.linkedin.com/in/jaberhosainbd',
    footerWordmark: 'JABER HOSAIN'
  }
};

// <!-- EDIT HERE --> Default "Selected work" Timeline Strip Tiles (V1 = Video 16:9, G1 = Graphic Design 1:1)
export const DEFAULT_WORKS = [
  {
    id: 'work-v1-1',
    track: 'V1',
    label: 'Showreel',
    duration: '01:20',
    thumbnailUrl: './assets/jaber_hero.png',
    mediaUrl: 'https://www.facebook.com/share/p/1DNfXJTmTK/',
    order: 1,
    visible: true,
    status: 'published'
  },
  {
    id: 'work-v1-2',
    track: 'V1',
    label: 'YouTube edit',
    duration: '08:45',
    thumbnailUrl: './assets/jaber_about.png',
    mediaUrl: 'https://www.facebook.com/share/v/19XfdDJYTf/',
    order: 2,
    visible: true,
    status: 'published'
  },
  {
    id: 'work-v1-3',
    track: 'V1',
    label: 'Ad and promo',
    duration: '00:35',
    thumbnailUrl: './assets/jabir_profile.png',
    mediaUrl: 'https://www.facebook.com/share/v/1KVWkbFLLP/',
    order: 3,
    visible: true,
    status: 'published'
  },
  {
    id: 'work-g1-1',
    track: 'G1',
    label: 'Branding',
    duration: '',
    thumbnailUrl: './assets/jaber_hero.png',
    mediaUrl: './assets/jaber_hero.png',
    order: 4,
    visible: true,
    status: 'published'
  },
  {
    id: 'work-g1-2',
    track: 'G1',
    label: 'Social posts',
    duration: '',
    thumbnailUrl: './assets/jaber_about.png',
    mediaUrl: './assets/jaber_about.png',
    order: 5,
    visible: true,
    status: 'published'
  },
  {
    id: 'work-g1-3',
    track: 'G1',
    label: 'Posters',
    duration: '',
    thumbnailUrl: './assets/jabir_profile.png',
    mediaUrl: './assets/jabir_profile.png',
    order: 6,
    visible: true,
    status: 'published'
  },
  {
    id: 'work-g1-4',
    track: 'G1',
    label: 'Thumbnails',
    duration: '',
    thumbnailUrl: './assets/jaber_hero.png',
    mediaUrl: './assets/jaber_hero.png',
    order: 7,
    visible: true,
    status: 'published'
  }
];

export const DEFAULT_PROJECTS = [
  {
    id: 'proj-video-1',
    title: 'Documentary & Short-Form Narrative Reel',
    category: 'video-editing',
    thumbnailUrl: './assets/jaber_hero.png',
    videoUrl: 'https://www.facebook.com/share/p/1DNfXJTmTK/',
    behanceUrl: '',
    problem: 'Raw footage had slow pacing and flat audio, causing viewers to drop off in the first 3 seconds.',
    process: 'Cut tight narrative hooks in Premiere Pro, added layered sound design, and graded cinematic skin tones.',
    result: 'Delivered a high-retention social edit that increased average watch time and shares.',
    order: 1,
    visible: true,
    status: 'published'
  },
  {
    id: 'proj-motion-1',
    title: 'Kinetic Typography & 3D Camera Promo',
    category: 'motion-graphics',
    thumbnailUrl: './assets/jaber_about.png',
    videoUrl: 'https://www.facebook.com/share/v/19XfdDJYTf/',
    behanceUrl: '',
    problem: 'Static promotional graphics were blending into busy social feeds without capturing attention.',
    process: 'Built custom 3D camera depth, smooth speed-graph transitions, and animated typography in After Effects.',
    result: 'Elevated brand perception and boosted campaign click-through performance.',
    order: 2,
    visible: true,
    status: 'published'
  },
  {
    id: 'proj-video-2',
    title: 'Social Media Promo & Viral Pacing Cut',
    category: 'video-editing',
    thumbnailUrl: './assets/jabir_profile.png',
    videoUrl: 'https://www.facebook.com/share/v/1KVWkbFLLP/',
    behanceUrl: '',
    problem: 'Long-form promotional message needed to be condensed into a punchy 60-second vertical reel.',
    process: 'Combined rhythm-synced cuts, dynamic b-roll overlays, and bold bilingual captions in Premiere Pro.',
    result: 'Produced a scroll-stopping vertical video ready for Meta Ads and organic reels.',
    order: 3,
    visible: true,
    status: 'published'
  },
  {
    id: 'proj-graphic-1',
    title: 'Brand Identity & Visual Poster Series',
    category: 'graphic-design',
    thumbnailUrl: './assets/jaber_hero.png',
    videoUrl: '',
    behanceUrl: 'https://www.behance.net/jaberhosain',
    problem: 'Inconsistent colors and typography across social channels weakened brand recognition.',
    process: 'Created a modular grid system, custom vector typography, and lighting composites in Photoshop & Illustrator.',
    result: 'Delivered a cohesive visual identity and print/social poster suite showcased on Behance.',
    order: 4,
    visible: true,
    status: 'published'
  },
  {
    id: 'proj-graphic-2',
    title: 'Social Media Visuals & High-CTR Thumbnails',
    category: 'graphic-design',
    thumbnailUrl: './assets/jaber_about.png',
    videoUrl: '',
    behanceUrl: 'https://www.behance.net/jaberhosain',
    problem: 'Great videos and campaigns were getting low click-through rates due to cluttered thumbnails.',
    process: 'Applied focal-point contrast, expressive subject isolation, and AI-assisted visual polish in Photoshop.',
    result: 'Significantly stronger visual curiosity and higher click-through rates across campaigns.',
    order: 5,
    visible: true,
    status: 'published'
  }
];

let activeCategoryFilter = 'all';
let heroRevealHasPlayed = false;

// Helper to safely set textContent
function setText(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined && val !== null) {
    el.textContent = val;
  }
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Render two-line hero name without rotating or obscuring
function updateHeroNameText(line1, line2) {
  const titleEl = document.getElementById('txt-hero-title');
  const srEl = document.getElementById('txt-hero-sr-name');
  const l1El = document.getElementById('txt-hero-name-line1');
  const l2El = document.getElementById('txt-hero-name-line2');
  const d1El = document.getElementById('txt-hero-depth-line1');
  const d2El = document.getElementById('txt-hero-depth-line2');
  if (!titleEl || !l1El || !l2El) return;

  const clean1 = String(line1 || '').trim() || 'MD. JABER';
  const clean2 = String(line2 || '').trim() || 'HOSAIN';
  const fullName = `${clean1} ${clean2}`.trim();

  titleEl.setAttribute('aria-label', fullName);
  if (srEl) srEl.textContent = fullName;
  l1El.textContent = clean1;
  l2El.textContent = clean2;
  if (d1El) d1El.textContent = clean1;
  if (d2El) d2El.textContent = clean2;
}

// Render Role Line in clean flowing italic serif without red accent spans
function updateHeroRoleLine(roleText) {
  const roleEl = document.getElementById('txt-hero-role');
  if (!roleEl) return;
  const raw = String(roleText || '').trim() || DEFAULT_SITE_SETTINGS.texts.heroRole;
  roleEl.textContent = raw;
}

// Cubic-bezier helper matching CSS `cubic-bezier(0.7, 0, 0.2, 1)`
function sampleCubicBezierY(p1x, p1y, p2x, p2y, t) {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;

  const sampleX = (u) => ((ax * u + bx) * u + cx) * u;
  const sampleDX = (u) => (3 * ax * u + 2 * bx) * u + cx;
  const sampleY = (u) => ((ay * u + by) * u + cy) * u;

  let u = t;
  for (let i = 0; i < 6; i++) {
    const xErr = sampleX(u) - t;
    if (Math.abs(xErr) < 1e-4) break;
    const dx = sampleDX(u);
    if (Math.abs(dx) < 1e-6) break;
    u -= xErr / dx;
  }
  u = Math.max(0, Math.min(1, u));
  return sampleY(u);
}

// Once-only Hero Timeline Playhead Sweep (`00:00:00` -> `00:00:24` over 1.6s)
function runHeroTimelineRevealOnce() {
  if (heroRevealHasPlayed) return;
  heroRevealHasPlayed = true;

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const stage = document.getElementById('hero-name-stage');
  const heroCopy = document.querySelector('.hero-copy');
  const strip = document.getElementById('selected-work-strip');
  const timecodeEl = document.getElementById('hero-timecode');

  if (prefersReducedMotion || !stage) {
    return;
  }

  // Force clean initial paint then trigger synchronized playhead & sequential fade-ups
  void stage.offsetWidth;
  stage.classList.add('is-revealing');
  heroCopy?.classList.add('is-sequencing');
  strip?.classList.add('is-sequencing');

  const durationMs = 1600;
  const startTime = performance.now();

  function tickTimecode(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, Math.max(0, elapsed / durationMs));
    const eased = sampleCubicBezierY(0.7, 0, 0.2, 1, progress);
    const frame = Math.min(24, Math.max(0, Math.round(eased * 24)));

    if (timecodeEl) {
      timecodeEl.textContent = `00:00:${String(frame).padStart(2, '0')}`;
    }

    if (progress < 1) {
      requestAnimationFrame(tickTimecode);
    } else if (timecodeEl) {
      timecodeEl.textContent = '00:00:24';
    }
  }

  requestAnimationFrame(tickTimecode);
}

// Apply `siteSettings` to the DOM (Colors, Fonts, Texts, Links, Section Order & Visibility)
export function applySiteSettingsToDOM(settingsInput) {
  const settings = {
    ...DEFAULT_SITE_SETTINGS,
    ...(settingsInput || {}),
    colors: { ...DEFAULT_SITE_SETTINGS.colors, ...(settingsInput?.colors || {}) },
    fonts: { ...DEFAULT_SITE_SETTINGS.fonts, ...(settingsInput?.fonts || {}) },
    sectionVisibility: { ...DEFAULT_SITE_SETTINGS.sectionVisibility, ...(settingsInput?.sectionVisibility || {}) },
    texts: { ...DEFAULT_SITE_SETTINGS.texts, ...(settingsInput?.texts || {}) }
  };

  const root = document.documentElement;
  root.style.setProperty('--bg-deep', settings.colors.bgDeep);
  root.style.setProperty('--bg-primary', settings.colors.bgPrimary);
  root.style.setProperty('--bg-elevated', settings.colors.bgElevated);
  root.style.setProperty('--accent', settings.colors.accent);
  root.style.setProperty('--text-primary', settings.colors.textPrimary);
  root.style.setProperty('--text-muted', settings.colors.textMuted);

  root.style.setProperty('--font-display', settings.fonts.display);
  root.style.setProperty('--font-sans', settings.fonts.sans);
  root.style.setProperty('--font-serif', settings.fonts.serif);

  const t = settings.texts;
  setText('txt-nav-monogram', t.navMonogram || DEFAULT_SITE_SETTINGS.texts.navMonogram);
  setText('txt-nav-brand', t.navBrandName || DEFAULT_SITE_SETTINGS.texts.navBrandName);

  const line1Text = t.heroNameLine1 || t.heroTitle || DEFAULT_SITE_SETTINGS.texts.heroTitle;
  const line2Text = t.heroNameLine2 || t.heroTitleItalic || DEFAULT_SITE_SETTINGS.texts.heroTitleItalic;
  updateHeroNameText(line1Text, line2Text);

  updateHeroRoleLine(t.heroRole || DEFAULT_SITE_SETTINGS.texts.heroRole);
  setText('txt-hero-subline', t.heroSubtitle || t.heroSubline || DEFAULT_SITE_SETTINGS.texts.heroSubline);
  setText('txt-hero-btn-primary', t.heroBtnPrimary || DEFAULT_SITE_SETTINGS.texts.heroBtnPrimary);
  setText('txt-hero-btn-secondary', t.heroBtnSecondary || DEFAULT_SITE_SETTINGS.texts.heroBtnSecondary);

  const btnPrimary = document.getElementById('btn-hero-primary');
  if (btnPrimary && t.heroBtnPrimaryUrl) btnPrimary.setAttribute('href', t.heroBtnPrimaryUrl);
  const btnSecondary = document.getElementById('btn-hero-secondary');
  if (btnSecondary && t.heroBtnSecondaryUrl) btnSecondary.setAttribute('href', t.heroBtnSecondaryUrl);

  const heroImg = document.getElementById('img-hero-portrait');
  if (heroImg && t.heroPortraitUrl) heroImg.setAttribute('src', t.heroPortraitUrl);

  setText('txt-stat1-value', t.stat1Value);
  setText('txt-stat1-label', t.stat1Label);
  setText('txt-stat2-value', t.stat2Value);
  setText('txt-stat2-label', t.stat2Label);
  setText('txt-stat3-value', t.stat3Value);
  setText('txt-stat3-label', t.stat3Label);

  setText('txt-about-kicker', t.aboutKicker);
  setText('txt-about-title', t.aboutTitle);
  setText('txt-about-p1', t.aboutP1);
  setText('txt-about-p2', t.aboutP2);

  const aboutImg = document.getElementById('img-about-photo');
  if (aboutImg && t.aboutPhotoUrl) aboutImg.setAttribute('src', t.aboutPhotoUrl);

  const toolsList = document.getElementById('tools-list');
  if (toolsList && t.aboutToolsCsv) {
    const tools = String(t.aboutToolsCsv)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    toolsList.innerHTML = tools
      .map((tool) => `<span class="tool-badge" role="listitem">${escapeHtml(tool)}</span>`)
      .join('');
  }

  setText('txt-test1-quote', t.test1Quote);
  setText('txt-test1-name', t.test1Name);
  setText('txt-test1-role', t.test1Role);
  setText('txt-test2-quote', t.test2Quote);
  setText('txt-test2-name', t.test2Name);
  setText('txt-test2-role', t.test2Role);
  setText('txt-test3-quote', t.test3Quote);
  setText('txt-test3-name', t.test3Name);
  setText('txt-test3-role', t.test3Role);

  setText('txt-contact-title', t.contactTitle);
  setText('txt-contact-sub', t.contactSub);
  setText('txt-contact-cta', t.contactCtaText);
  setText('txt-email-value', t.contactEmail);
  setText('txt-whatsapp-value', t.contactWhatsappDisplay);
  setText('txt-footer-wordmark', t.footerWordmark);

  const emailLink = document.getElementById('card-email-link');
  const contactCta = document.getElementById('link-contact-cta');
  if (t.contactEmail) {
    if (emailLink) emailLink.setAttribute('href', `mailto:${t.contactEmail}`);
    if (contactCta) contactCta.setAttribute('href', `mailto:${t.contactEmail}`);
  }

  const waLink = document.getElementById('card-whatsapp-link');
  const waCta = document.getElementById('link-whatsapp-cta');
  if (t.contactWhatsappUrl) {
    if (waLink) waLink.setAttribute('href', t.contactWhatsappUrl);
    if (waCta) waCta.setAttribute('href', t.contactWhatsappUrl);
  }

  const beLink = document.getElementById('card-behance-link');
  const footerBe = document.getElementById('footer-behance');
  if (t.contactBehanceUrl) {
    if (beLink) beLink.setAttribute('href', t.contactBehanceUrl);
    if (footerBe) footerBe.setAttribute('href', t.contactBehanceUrl);
  }

  const liLink = document.getElementById('card-linkedin-link');
  const footerLi = document.getElementById('footer-linkedin');
  if (t.contactLinkedinUrl) {
    if (liLink) liLink.setAttribute('href', t.contactLinkedinUrl);
    if (footerLi) footerLi.setAttribute('href', t.contactLinkedinUrl);
  }

  // Reorder and toggle visibility of sections inside <main id="main-content">
  const mainEl = document.getElementById('main-content');
  if (mainEl && Array.isArray(settings.sectionOrder)) {
    settings.sectionOrder.forEach((secId) => {
      const sectionEl = mainEl.querySelector(`[data-section-id="${secId}"]`);
      if (sectionEl) {
        const isVisible = settings.sectionVisibility[secId] !== false;
        if (isVisible) {
          sectionEl.removeAttribute('hidden');
        } else {
          sectionEl.setAttribute('hidden', '');
        }
        mainEl.appendChild(sectionEl);
      }
    });
  }
}

// Render "Selected work" Timeline Strip (`works` collection -> V1 & G1 tracks)
export function renderWorksStripToDOM(worksList) {
  const v1El = document.getElementById('timeline-track-v1');
  const g1El = document.getElementById('timeline-track-g1');
  if (!v1El || !g1El) return;

  const list = Array.isArray(worksList) && worksList.length > 0 ? worksList : DEFAULT_WORKS;
  const visible = [...list]
    .filter((w) => w && w.visible !== false)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  const v1Items = visible.filter((w) => w.track === 'V1');
  const g1Items = visible.filter((w) => w.track === 'G1');

  v1El.innerHTML = v1Items
    .map((tile, i) => {
      const delayMs = 2050 + i * 80;
      const thumb = tile.thumbnailUrl || './assets/jaber_hero.png';
      const media = tile.mediaUrl || thumb;
      const dur = tile.duration || '00:45';
      return `
        <button
          type="button"
          class="timeline-tile timeline-tile-video open-strip-lightbox"
          data-lightbox-type="video"
          data-media-url="${escapeHtml(media)}"
          data-title="${escapeHtml(tile.label)}"
          style="--tile-delay: ${delayMs}ms;"
        >
          <img src="${escapeHtml(thumb)}" alt="${escapeHtml(tile.label)} video preview" loading="lazy" width="480" height="270" />
          <span class="tile-gradient" aria-hidden="true"></span>
          ${dur ? `<span class="tile-duration">${escapeHtml(dur)}</span>` : ''}
          <span class="tile-play-circle" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </span>
          <span class="tile-label">${escapeHtml(tile.label)}</span>
        </button>
      `;
    })
    .join('');

  g1El.innerHTML = g1Items
    .map((tile, i) => {
      const delayMs = 2290 + i * 70;
      const thumb = tile.thumbnailUrl || './assets/jaber_hero.png';
      const media = tile.mediaUrl || thumb;
      return `
        <button
          type="button"
          class="timeline-tile timeline-tile-graphic open-strip-lightbox"
          data-lightbox-type="image"
          data-media-url="${escapeHtml(media)}"
          data-title="${escapeHtml(tile.label)}"
          style="--tile-delay: ${delayMs}ms;"
        >
          <img src="${escapeHtml(thumb)}" alt="${escapeHtml(tile.label)} graphic design showcase" loading="lazy" width="360" height="360" />
          <span class="tile-gradient" aria-hidden="true"></span>
          <span class="tile-label">${escapeHtml(tile.label)}</span>
        </button>
      `;
    })
    .join('');

  bindLightboxButtons();
}

function formatCategoryBadge(cat) {
  if (cat === 'video-editing') return 'Video Editing';
  if (cat === 'motion-graphics') return 'Motion Graphics';
  return 'Graphic Design';
}

// Render `projects` collection into `#works-grid` (Section below hero remains intact)
export function renderProjectsToDOM(projectsList) {
  const grid = document.getElementById('works-grid');
  if (!grid) return;

  const list = Array.isArray(projectsList) && projectsList.length > 0 ? projectsList : DEFAULT_PROJECTS;
  const visibleProjects = [...list]
    .filter((p) => p && p.visible !== false)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  grid.innerHTML = visibleProjects
    .map((proj) => {
      const cat = proj.category || 'video-editing';
      const isHiddenByFilter = activeCategoryFilter !== 'all' && cat !== activeCategoryFilter;
      const hasVideo = Boolean(proj.videoUrl && proj.videoUrl.trim());
      const actionHtml = hasVideo
        ? `<button type="button" class="case-play-btn open-video-lightbox" data-video-url="${escapeHtml(proj.videoUrl)}" data-video-title="${escapeHtml(proj.title)}"><span>▶ Watch Video</span></button>`
        : `<a href="${escapeHtml(proj.behanceUrl || 'https://www.behance.net/jaberhosain')}" target="_blank" rel="noopener noreferrer" class="case-play-btn"><span>View on Behance ↗</span></a>`;

      return `
        <article class="case-card is-visible" data-category="${escapeHtml(cat)}" ${isHiddenByFilter ? 'hidden' : ''}>
          <div class="case-media">
            <img
              src="${escapeHtml(proj.thumbnailUrl || './assets/jaber_hero.png')}"
              alt="${escapeHtml(proj.title)}"
              loading="lazy"
              width="640"
              height="360"
            />
            <span class="case-badge">${escapeHtml(formatCategoryBadge(cat))}</span>
            ${actionHtml}
          </div>
          <div class="case-body">
            <h3 class="case-title">${escapeHtml(proj.title)}</h3>
            <ul class="case-points">
              <li><span class="point-label problem">Problem:</span> <span>${escapeHtml(proj.problem)}</span></li>
              <li><span class="point-label process">My Process:</span> <span>${escapeHtml(proj.process)}</span></li>
              <li><span class="point-label result">Result:</span> <span>${escapeHtml(proj.result)}</span></li>
            </ul>
          </div>
        </article>
      `;
    })
    .join('');

  bindLightboxButtons();
}

// Accessible Video & Image Lightbox
function buildVideoEmbedHtml(url, title) {
  const safeTitle = escapeHtml(title || 'Project Video');
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/);
  if (ytMatch && ytMatch[1]) {
    return `<iframe src="https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0" title="${safeTitle}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `<iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1" title="${safeTitle}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  }
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
    return `<video src="${escapeHtml(url)}" controls autoplay playsinline></video>`;
  }
  const encodedUrl = encodeURIComponent(url);
  return `<iframe src="https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&autoplay=true" title="${safeTitle}" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen></iframe>`;
}

function openLightboxModal(type, url, title) {
  const lightbox = document.getElementById('video-lightbox');
  const lightboxContent = document.getElementById('lightbox-content');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxClose = document.getElementById('lightbox-close');
  if (!url || !lightbox || !lightboxContent) return;

  if (lightboxTitle) lightboxTitle.textContent = title || 'Project Preview';

  if (type === 'image') {
    lightboxContent.classList.add('is-image-mode');
    lightboxContent.innerHTML = `<img src="${escapeHtml(url)}" alt="${escapeHtml(title || 'Graphic design preview')}" class="lightbox-image" />`;
  } else {
    lightboxContent.classList.remove('is-image-mode');
    lightboxContent.innerHTML = buildVideoEmbedHtml(url, title);
  }

  lightbox.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  lightboxClose?.focus();
}

function bindLightboxButtons() {
  document.querySelectorAll('.open-video-lightbox').forEach((btn) => {
    btn.onclick = () => {
      const url = btn.getAttribute('data-video-url');
      const title = btn.getAttribute('data-video-title');
      openLightboxModal('video', url, title);
    };
  });

  document.querySelectorAll('.open-strip-lightbox').forEach((btn) => {
    btn.onclick = () => {
      const type = btn.getAttribute('data-lightbox-type') || 'video';
      const url = btn.getAttribute('data-media-url');
      const title = btn.getAttribute('data-title');
      openLightboxModal(type, url, title);
    };
  });
}

// Boot Public Portfolio
function initPublicSite() {
  document.documentElement.classList.add('js-enabled');

  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Apply safe defaults immediately so page never flickers or breaks
  applySiteSettingsToDOM(DEFAULT_SITE_SETTINGS);
  renderWorksStripToDOM(DEFAULT_WORKS);
  renderProjectsToDOM(DEFAULT_PROJECTS);

  // Trigger once-only Hero Timeline Playhead Sweep
  runHeroTimelineRevealOnce();

  // Mobile Menu
  const menuBtn = document.getElementById('mobile-menu-btn');
  const primaryNav = document.getElementById('primary-nav');
  if (menuBtn && primaryNav) {
    menuBtn.addEventListener('click', () => {
      const isOpen = primaryNav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // Filter Tabs
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCategoryFilter = btn.getAttribute('data-filter') || 'all';
      filterButtons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      document.querySelectorAll('#works-grid .case-card').forEach((card) => {
        const cat = card.getAttribute('data-category');
        if (activeCategoryFilter === 'all' || cat === activeCategoryFilter) {
          card.removeAttribute('hidden');
        } else {
          card.setAttribute('hidden', '');
        }
      });
    });
  });

  // Lightbox Close Events
  const lightbox = document.getElementById('video-lightbox');
  const lightboxContent = document.getElementById('lightbox-content');
  const lightboxClose = document.getElementById('lightbox-close');
  const closeLightbox = () => {
    if (!lightbox || !lightboxContent) return;
    lightbox.setAttribute('hidden', '');
    lightboxContent.classList.remove('is-image-mode');
    lightboxContent.innerHTML = '';
    document.body.style.overflow = '';
  };
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && !lightbox.hasAttribute('hidden')) closeLightbox();
  });

  // Existing 3D Hero Portrait Tilt (Untouched)
  const tiltCard = document.getElementById('hero-tilt-card');
  const tiltGlare = document.getElementById('hero-tilt-glare');
  if (tiltCard && window.matchMedia('(pointer: fine)').matches) {
    tiltCard.addEventListener('mousemove', (e) => {
      const rect = tiltCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const normX = (x / rect.width) * 2 - 1;
      const normY = (y / rect.height) * 2 - 1;
      tiltCard.style.transform = `rotateX(${(-normY * 12).toFixed(2)}deg) rotateY(${(normX * 12).toFixed(2)}deg) scale3d(1.02,1.02,1)`;
      if (tiltGlare) tiltGlare.style.opacity = '1';
    });
    tiltCard.addEventListener('mouseleave', () => {
      tiltCard.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
      if (tiltGlare) tiltGlare.style.opacity = '0';
    });
  }

  // Scroll Reveal
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // Listen for instant draft preview messages when inside Admin Panel iframe
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || typeof data !== 'object') return;
    if (data.type === 'ADMIN_LIVE_PREVIEW_UPDATE') {
      if (data.siteSettings) applySiteSettingsToDOM(data.siteSettings);
      if (data.works) renderWorksStripToDOM(data.works);
      if (data.projects) renderProjectsToDOM(data.projects);
    }
  });

  // Connect to Firestore `onSnapshot` for live updates (`siteSettings/published`, `works`, & `projects`)
  try {
    const app = initializeApp(FIREBASE_CONFIG);
    const db = getFirestore(app, FIREBASE_CONFIG.firestoreDatabaseId);

    onSnapshot(
      doc(db, 'siteSettings', 'published'),
      (snap) => {
        if (snap.exists()) {
          applySiteSettingsToDOM(snap.data());
        }
      },
      (err) => {
        console.warn('Using safe default siteSettings fallback:', err.message);
      }
    );

    const publishedWorksQuery = query(collection(db, 'works'), where('status', '==', 'published'));
    onSnapshot(
      publishedWorksQuery,
      (snap) => {
        if (!snap.empty) {
          const tiles = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          renderWorksStripToDOM(tiles);
        }
      },
      (err) => {
        console.warn('Using safe default works timeline fallback:', err.message);
      }
    );

    const publishedProjectsQuery = query(collection(db, 'projects'), where('status', '==', 'published'));
    onSnapshot(
      publishedProjectsQuery,
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          renderProjectsToDOM(items);
        }
      },
      (err) => {
        console.warn('Using safe default projects fallback:', err.message);
      }
    );
  } catch (err) {
    console.warn('Firebase initialization skipped, using safe default content:', err);
  }

  // Existing Ambient 3D Perspective Studio Grid & Depth Particles (Untouched)
  initAmbient3DBackdrop();
}

function initAmbient3DBackdrop() {
  const canvas = document.getElementById('studio-3d-canvas');
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let pointerX = 0;
  let pointerY = 0;

  const particles = Array.from({ length: 42 }, (_, i) => ({
    x: (Math.sin(i * 12.9898) * 0.5) * 1800,
    y: (Math.cos(i * 78.233) * 0.5) * 1000,
    z: ((i * 37) % 800) + 120,
    speed: 0.35 + (i % 5) * 0.12
  }));

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    pointerX = (e.clientX / Math.max(width, 1) - 0.5) * 60;
    pointerY = (e.clientY / Math.max(height, 1) - 0.5) * 40;
  });

  function render() {
    ctx.clearRect(0, 0, width, height);
    const cx = width * 0.5 - pointerX;
    const cy = height * 0.5 - pointerY;
    const focal = 420;

    for (const p of particles) {
      p.z -= p.speed;
      if (p.z <= 20) p.z = 920;

      const scale = focal / p.z;
      const sx = cx + p.x * scale;
      const sy = cy + p.y * scale;
      const radius = Math.max(0.6, 2.2 * scale);
      const alpha = Math.min(0.42, (1 - p.z / 940) * 0.48);

      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(221, 209, 190, ${alpha.toFixed(3)})`;
      ctx.fill();
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

if (document.getElementById('main-content')) {
  initPublicSite();
}
