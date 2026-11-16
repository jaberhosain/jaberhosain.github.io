import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Language, StudioFocusMode } from '../types/portfolio';

export type PageId = 'home' | 'about' | 'videos' | 'design' | 'skills' | 'contact';

export interface PageMeta {
  id: PageId;
  index: string;
  hash: string;
  label: Record<Language, string>;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
}

export const PORTFOLIO_PAGES: PageMeta[] = [
  {
    id: 'home',
    index: '01',
    hash: '#/',
    label: { en: 'Home', bn: 'হোম', ar: 'الرئيسية' },
    title: { en: 'Creative Portfolio', bn: 'ক্রিয়েটিভ পোর্টফোলিও', ar: 'معرض الأعمال الإبداعي' },
    subtitle: {
      en: 'Video Editing, Motion Graphics & Graphic Design',
      bn: 'ভিডিও এডিটিং, মোশন গ্রাফিক্স এবং গ্রাফিক ডিজাইন',
      ar: 'مونتاج الفيديو، الموشن جرافيك والتصميم الجرافيكي'
    }
  },
  {
    id: 'about',
    index: '02',
    hash: '#/about',
    label: { en: 'About', bn: 'পরিচিতি', ar: 'نبذة عني' },
    title: { en: 'About & Education', bn: 'পরিচিতি ও শিক্ষাগত যোগ্যতা', ar: 'نبذة عني والتعليم' },
    subtitle: {
      en: 'Creative background, academic journey, and professional studio training.',
      bn: 'আমার সৃজনশীল পথচলা, শিক্ষাগত পটভূমি এবং পেশাদার প্রশিক্ষণ।',
      ar: 'خلفيتي الإبداعية، مسيرتي الأكاديمية، والتدريب المهني المتخصص.'
    }
  },
  {
    id: 'videos',
    index: '03',
    hash: '#/videos',
    label: { en: 'Videos', bn: 'ভিডিও', ar: 'الفيديوهات' },
    title: { en: 'Video Editing & Motion', bn: 'ভিডিও এডিটিং ও মোশন স্টুডিও', ar: 'مونتاج الفيديو والموشن' },
    subtitle: {
      en: '3D parallax reels, timeline architecture, and layered visual storytelling.',
      bn: 'থ্রিডি প্যারালাক্স ভিডিও শো-রিল, টাইমলাইন ক্রাফট এবং লেয়ার্ড ভিজ্যুয়াল স্টোরিটেলিং।',
      ar: 'عروض فيديو ثلاثية الأبعاد، هندسة التايم لاين، والسرد البصري المتكامل.'
    }
  },
  {
    id: 'design',
    index: '04',
    hash: '#/design',
    label: { en: 'Design', bn: 'ডিজাইন', ar: 'التصميم' },
    title: { en: 'Graphic Design Gallery', bn: 'গ্রাফিক ডিজাইন গ্যালারি', ar: 'معرض التصميم الجرافيكي' },
    subtitle: {
      en: 'Posters, social media visuals, brand creatives, and high-resolution showcases.',
      bn: 'পোস্টার, সোশ্যাল মিডিয়া ভিজ্যুয়াল, ব্র্যান্ড ডিজাইন এবং সেরা কাজের সংগ্রহ।',
      ar: 'البوسترات، تصاميم السوشيال ميديا، الهويات البصرية وأبرز الأعمال.'
    }
  },
  {
    id: 'skills',
    index: '05',
    hash: '#/skills',
    label: { en: 'Skills', bn: 'দক্ষতা', ar: 'المهارات' },
    title: { en: 'Services, Skills & Proof', bn: 'সেবা, দক্ষতা ও প্রমাণ', ar: 'الخدمات، المهارات والإثباتات' },
    subtitle: {
      en: 'Specialized creative services, software stack, production workflow, and verified channels.',
      bn: 'পেশাদার সেবাসমূহ, সফটওয়্যার দক্ষতা, কাজের ধাপ এবং ভেরিফায়েড চ্যানেল লিংক।',
      ar: 'الخدمات الإبداعية، الأدوات الاحترافية، سير العمل، والقنوات الموثقة.'
    }
  },
  {
    id: 'contact',
    index: '06',
    hash: '#/contact',
    label: { en: 'Contact', bn: 'যোগাযোগ', ar: 'تواصل' },
    title: { en: 'Contact & Advice', bn: 'পরামর্শ ও যোগাযোগ', ar: 'النصيحة والتواصل' },
    subtitle: {
      en: 'Send private feedback, pitch your next visual project, or connect directly.',
      bn: 'গোপন পরামর্শ পাঠান, প্রজেক্ট নিয়ে আলোচনা করুন অথবা সরাসরি যোগাযোগ করুন।',
      ar: 'أرسل اقتراحك بخصوصية، شارك فكرة مشروعك، أو تواصل معي مباشرة.'
    }
  }
];

interface ResolvedRoute {
  page: PageId;
  sectionAnchor?: string;
}

const VALID_PAGES: PageId[] = ['home', 'about', 'videos', 'design', 'skills', 'contact'];

export function resolveTargetToPage(target: string): ResolvedRoute {
  const clean = (target || '').trim().toLowerCase();

  // Never override admin routes
  if (clean.startsWith('#admin') || clean === '/admin') {
    return { page: 'home' };
  }

  // Direct hash page routes (#/about, #/videos, etc.)
  const stripped = clean.replace(/^#\/?/, '').replace(/\/+$/, '');
  const [segment, subAnchor] = stripped.split('#');

  if (segment === '' || segment === 'home') {
    return { page: 'home', sectionAnchor: subAnchor };
  }
  if (VALID_PAGES.includes(segment as PageId)) {
    return { page: segment as PageId, sectionAnchor: subAnchor };
  }

  // Legacy single-page section anchors mapped cleanly to dedicated pages
  switch (segment) {
    case 'about':
      return { page: 'about' };
    case 'education':
      return { page: 'about', sectionAnchor: 'education' };
    case 'videos':
    case 'video-projects':
    case 'craft-timeline':
      return { page: 'videos', sectionAnchor: segment === 'videos' ? undefined : segment };
    case 'projects':
      return { page: 'videos' };
    case 'design':
    case 'graphic-best-work':
    case 'graphic-projects':
      return { page: 'design', sectionAnchor: segment === 'design' ? undefined : segment };
    case 'services':
    case 'skills':
    case 'channels':
      return { page: 'skills', sectionAnchor: segment === 'skills' ? undefined : segment };
    case 'advice':
    case 'contact':
      return { page: 'contact', sectionAnchor: segment === 'advice' ? undefined : segment };
    default:
      return { page: 'home' };
  }
}

interface NavigationContextType {
  currentPage: PageId;
  navigateTo: (target: PageId | string, options?: { sectionAnchor?: string }) => void;
  goNextPage: () => void;
  goPrevPage: () => void;
  pages: PageMeta[];
  currentMeta: PageMeta;
  isMultiPageEnabled: boolean;
  focusMode: StudioFocusMode;
  setFocusMode: (mode: StudioFocusMode) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const NavigationProvider: React.FC<{ children: ReactNode; initialFocusMode?: StudioFocusMode }> = ({
  children,
  initialFocusMode = 'all'
}) => {
  const [focusMode, setFocusMode] = useState<StudioFocusMode>(initialFocusMode);
  const [currentPage, setCurrentPage] = useState<PageId>(() => {
    if (typeof window === 'undefined') return 'home';
    const hash = window.location.hash;
    if (hash.toLowerCase().startsWith('#admin')) return 'home';
    return resolveTargetToPage(hash).page;
  });

  useEffect(() => {
    setFocusMode(initialFocusMode);
  }, [initialFocusMode]);

  const scrollToSectionOrTop = useCallback((sectionAnchor?: string) => {
    if (typeof window === 'undefined') return;
    if (sectionAnchor) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const el = document.getElementById(sectionAnchor);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 60);
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash;
      if (hash.toLowerCase().startsWith('#admin')) return;
      const resolved = resolveTargetToPage(hash);
      setCurrentPage(resolved.page);
      scrollToSectionOrTop(resolved.sectionAnchor);
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [scrollToSectionOrTop]);

  const navigateTo = useCallback(
    (target: PageId | string, options?: { sectionAnchor?: string }) => {
      // Allow external URLs directly
      if (typeof target === 'string' && (target.startsWith('http://') || target.startsWith('https://') || target.startsWith('mailto:'))) {
        window.open(target, target.startsWith('mailto:') ? '_self' : '_blank', 'noopener,noreferrer');
        return;
      }

      const resolved = VALID_PAGES.includes(target as PageId)
        ? { page: target as PageId, sectionAnchor: options?.sectionAnchor }
        : resolveTargetToPage(target);

      const finalAnchor = options?.sectionAnchor || resolved.sectionAnchor;
      const targetMeta = PORTFOLIO_PAGES.find((p) => p.id === resolved.page) || PORTFOLIO_PAGES[0];

      setCurrentPage(resolved.page);

      if (typeof window !== 'undefined') {
        const nextHash = finalAnchor ? `${targetMeta.hash}#${finalAnchor}` : targetMeta.hash;
        if (window.location.hash !== nextHash) {
          window.location.hash = nextHash;
        }
      }

      scrollToSectionOrTop(finalAnchor);
    },
    [scrollToSectionOrTop]
  );

  const goNextPage = useCallback(() => {
    const idx = PORTFOLIO_PAGES.findIndex((p) => p.id === currentPage);
    const next = PORTFOLIO_PAGES[(idx + 1) % PORTFOLIO_PAGES.length];
    navigateTo(next.id);
  }, [currentPage, navigateTo]);

  const goPrevPage = useCallback(() => {
    const idx = PORTFOLIO_PAGES.findIndex((p) => p.id === currentPage);
    const prev = PORTFOLIO_PAGES[(idx - 1 + PORTFOLIO_PAGES.length) % PORTFOLIO_PAGES.length];
    navigateTo(prev.id);
  }, [currentPage, navigateTo]);

  const currentMeta = PORTFOLIO_PAGES.find((p) => p.id === currentPage) || PORTFOLIO_PAGES[0];

  return (
    <NavigationContext.Provider
      value={{
        currentPage,
        navigateTo,
        goNextPage,
        goPrevPage,
        pages: PORTFOLIO_PAGES,
        currentMeta,
        isMultiPageEnabled: true,
        focusMode,
        setFocusMode
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

// Safe hook: returns fallback when rendered standalone inside ThemeLiveEditView
export const useNavigation = (): NavigationContextType => {
  const ctx = useContext(NavigationContext);
  if (ctx) return ctx;

  return {
    currentPage: 'home',
    navigateTo: (target: PageId | string) => {
      if (typeof window === 'undefined') return;
      if (typeof target === 'string' && target.startsWith('#')) {
        const id = target.replace(/^#\/?/, '');
        const el = id ? document.getElementById(id) : null;
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    goNextPage: () => {},
    goPrevPage: () => {},
    pages: PORTFOLIO_PAGES,
    currentMeta: PORTFOLIO_PAGES[0],
    isMultiPageEnabled: false,
    focusMode: 'all',
    setFocusMode: () => {}
  };
};
