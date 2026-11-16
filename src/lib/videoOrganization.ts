import {
  Language,
  VideoSectionFormat,
  VideoShowcaseItem,
  VideoSubSectionTier
} from '../types/portfolio';

export interface OrganizedVideoItem extends VideoShowcaseItem {
  resolvedSection: VideoSectionFormat;
  resolvedSubSection: VideoSubSectionTier;
  isBestWork?: boolean;
}

export const VIDEO_SECTION_META: {
  id: VideoSectionFormat;
  isVerticalReel: boolean;
  label: Record<Language, string>;
  shortDesc: Record<Language, string>;
}[] = [
  {
    id: 'reels',
    isVerticalReel: true,
    label: {
      en: 'Reels & Shorts',
      bn: 'রিলস ও শর্টস',
      ar: 'ريلز ومقاطع قصيرة'
    },
    shortDesc: {
      en: 'Vertical 9:16 retention-focused edits, social hooks & fast-paced storytelling.',
      bn: 'ভার্টিক্যাল ৯:১৬ হাই-রিটেনশন রিলস, হুক পেসিং ও সোশ্যাল স্টোরিটেলিং।',
      ar: 'مقاطع عمودية 9:16 مصممة لرفع التفاعل والاحتفاظ بالمشاهد.'
    }
  },
  {
    id: 'long_video',
    isVerticalReel: false,
    label: {
      en: 'Long Video',
      bn: 'লং ভিডিও',
      ar: 'فيديو طويل'
    },
    shortDesc: {
      en: 'Widescreen 16:9 YouTube essays, podcasts & narrative storytelling cuts.',
      bn: 'ওয়াইডস্ক্রিন ১৬:৯ ইউটিউব ভিডিও, পডকাস্ট ও ন্যারেটিভ স্টোরিটেলিং।',
      ar: 'مقاطع يوتيوب طويلة 16:9 وبرامج بودكاست بسرد احترافي.'
    }
  },
  {
    id: 'motion_graphics',
    isVerticalReel: false,
    label: {
      en: 'Motion Graphics',
      bn: 'মোশন গ্রাফিক্স',
      ar: 'موشن جرافيك'
    },
    shortDesc: {
      en: 'Kinetic typography, After Effects compositing & smooth frame animations.',
      bn: 'কাইনেটিক টাইপোগ্রাফি, আফটার ইফেক্টস কম্পোজিটিং ও মোশন অ্যানিমেশন।',
      ar: 'تايبوجرافي حركي ورسوم متحركة عبر برنامج أفتر إفكتس.'
    }
  },
  {
    id: 'documentary',
    isVerticalReel: false,
    label: {
      en: 'Documentary Video',
      bn: 'ডকুমেন্টারি ভিডিও',
      ar: 'أفلام وثائقية'
    },
    shortDesc: {
      en: 'Cinematic archival pacing, voiceover soundscapes & layered visual research.',
      bn: 'সিনেমাটিক পেসিং, সাউন্ড ডিজাইন ও তথ্যচিত্র ভিত্তিক এডিটিং।',
      ar: 'مونتاج وثائقي سينمائي مع تصميم صوتي متقن.'
    }
  },
  {
    id: 'full_production',
    isVerticalReel: false,
    label: {
      en: 'Full Production',
      bn: 'ফুল প্রোডাকশন',
      ar: 'إنتاج متكامل'
    },
    shortDesc: {
      en: 'End-to-end commercial campaigns from visual direction to color & final master.',
      bn: 'আইডিয়া থেকে শুরু করে কালার গ্রেডিং ও ফাইনাল মাস্টার পর্যন্ত পূর্ণাঙ্গ কাজ।',
      ar: 'حملات إعلانية متكاملة من الإخراج البصري حتى التصحيح اللوني.'
    }
  },
  {
    id: 'saas',
    isVerticalReel: false,
    label: {
      en: 'SaaS & Product',
      bn: 'সাস ও প্রোডাক্ট',
      ar: 'البرمجيات والمنتجات'
    },
    shortDesc: {
      en: 'Clean UI explainers, software launch demos & motion walkthroughs.',
      bn: 'সফটওয়্যার লঞ্চ ডেমো, ইউআই এক্সপ্লেইনার ও প্রোডাক্ট মোশন।',
      ar: 'فيديوهات شرح للمنتجات الرقمية وعروض إطلاق البرمجيات.'
    }
  },
  {
    id: 'cgi',
    isVerticalReel: false,
    label: {
      en: 'CGI & VFX',
      bn: 'সিজিআই ও ভিএফএক্স',
      ar: 'المؤثرات والـ CGI'
    },
    shortDesc: {
      en: '3D spatial integration, composite tracking & stylized visual effects.',
      bn: 'থ্রিডি স্পেশাল কম্পোজিটিং, ট্র্যাকিং ও ভিজ্যুয়াল ইফেক্টস।',
      ar: 'دمج ثلاثي الأبعاد وتتبع الكاميرا ومؤثرات بصرية متقدمة.'
    }
  }
];

export const VIDEO_SUBSECTION_META: {
  id: VideoSubSectionTier;
  label: Record<Language, string>;
}[] = [
  {
    id: 'premium',
    label: { en: 'Premium', bn: 'প্রিমিয়াম', ar: 'بريميوم' }
  },
  {
    id: 'standard',
    label: { en: 'Standard', bn: 'স্ট্যান্ডার্ড', ar: 'قياسي' }
  },
  {
    id: 'storytelling',
    label: { en: 'Storytelling', bn: 'স্টোরিটেলিং', ar: 'سرد قصصي' }
  },
  {
    id: 'commercial',
    label: { en: 'Commercial & Ads', bn: 'কমার্শিয়াল ও অ্যাড', ar: 'إعلاني وترويجي' }
  }
];

export function resolveVideoSection(
  video: Partial<VideoShowcaseItem>,
  localizedTitle = '',
  localizedDesc = ''
): VideoSectionFormat {
  if (video.videoSection) return video.videoSection;

  const url = (video.videoUrl || '').toLowerCase();
  const hay = `${localizedTitle} ${localizedDesc} ${url}`.toLowerCase();

  if (/\b(cgi|vfx|3d render|compositing|unreal)\b/.test(hay)) return 'cgi';
  if (/\b(saas|software|ui demo|app launch|explainer)\b/.test(hay)) return 'saas';
  if (/\b(full production|commercial film|brand campaign)\b/.test(hay)) return 'full_production';
  if (/\b(doc|documentary|archive|interview|storyfilm)\b/.test(hay)) return 'documentary';
  if (/\b(motion|kinetic|after effects|typography|animation)\b/.test(hay)) return 'motion_graphics';
  if (/\b(long|youtube\.com\/watch|podcast|vlog|episode|essay)\b/.test(hay) && !url.includes('/shorts/')) {
    return 'long_video';
  }
  if (
    url.includes('/reel') ||
    url.includes('/shorts/') ||
    url.includes('facebook.com/share/r/') ||
    url.includes('facebook.com/share/v/') ||
    url.includes('facebook.com/share/p/') ||
    video.videoType === 'facebook' ||
    /\b(reel|short|vertical|promo)\b/.test(hay)
  ) {
    return 'reels';
  }

  return 'long_video';
}

export function resolveVideoSubSection(
  video: Partial<VideoShowcaseItem>,
  isBestWork = false
): VideoSubSectionTier {
  if (video.subSection) return video.subSection;
  if (isBestWork || video.category === 'video_best') return 'premium';
  return 'standard';
}

export function getVideoSectionLabel(id: VideoSectionFormat, lang: Language): string {
  const found = VIDEO_SECTION_META.find((m) => m.id === id);
  return found ? found.label[lang] : id;
}

export function getVideoSubSectionLabel(id: VideoSubSectionTier, lang: Language): string {
  const found = VIDEO_SUBSECTION_META.find((m) => m.id === id);
  return found ? found.label[lang] : id;
}

/**
 * Combines main videos + bestVideoWorks cleanly without URL duplication while keeping
 * explicit videoSection & subSection classification metadata intact.
 */
export function mergeAndClassifyVideos(
  videos: VideoShowcaseItem[] = [],
  bestVideoWorks: any[] = [],
  locFn: (val: any) => string,
  platformFilter: 'all' | 'youtube' | 'vimeo' | 'facebook' = 'all'
): OrganizedVideoItem[] {
  const matchesPlatform = (v: any) => {
    if (platformFilter === 'all') return true;
    const url = (v.videoUrl || '').toLowerCase();
    const explicit = (v.videoType || '').toLowerCase();
    if (platformFilter === 'youtube') {
      return explicit === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be');
    }
    if (platformFilter === 'vimeo') {
      return explicit === 'vimeo' || url.includes('vimeo.com');
    }
    if (platformFilter === 'facebook') {
      return explicit === 'facebook' || url.includes('facebook.com') || url.includes('fb.watch');
    }
    return true;
  };

  const seenUrls = new Set<string>();
  const result: OrganizedVideoItem[] = [];

  const sortedVideos = [...videos]
    .filter((v: any) => v.visible !== false && !v.hidden && matchesPlatform(v))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  sortedVideos.forEach((v) => {
    const normUrl = (v.videoUrl || '').trim().toLowerCase();
    if (normUrl) seenUrls.add(normUrl);
    const titleStr = locFn(v.title);
    const descStr = locFn(v.description);
    result.push({
      ...v,
      resolvedSection: resolveVideoSection(v, titleStr, descStr),
      resolvedSubSection: resolveVideoSubSection(v, v.category === 'video_best'),
      isBestWork: v.category === 'video_best'
    });
  });

  const sortedBest = [...bestVideoWorks]
    .filter((v: any) => v.visible !== false && matchesPlatform(v))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  sortedBest.forEach((v) => {
    const normUrl = (v.videoUrl || '').trim().toLowerCase();
    if (normUrl && seenUrls.has(normUrl)) {
      // Promote matching entry to premium if already included without an explicit subSection
      const existing = result.find((item) => (item.videoUrl || '').trim().toLowerCase() === normUrl);
      if (existing && !existing.subSection) {
        existing.resolvedSubSection = 'premium';
        existing.isBestWork = true;
      }
      return;
    }
    if (normUrl) seenUrls.add(normUrl);
    const titleStr = locFn(v.title);
    const descStr = locFn(v.description);
    result.push({
      ...v,
      resolvedSection: resolveVideoSection(v, titleStr, descStr),
      resolvedSubSection: resolveVideoSubSection(v, true),
      isBestWork: true
    });
  });

  return result;
}
