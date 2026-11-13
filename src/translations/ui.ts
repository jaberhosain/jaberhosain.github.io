import { Language } from '../types/portfolio';

export interface UITranslations {
  nav: {
    home: string;
    about: string;
    education: string;
    skills: string;
    services: string;
    projects: string;
    videos: string;
    channels: string;
    contact: string;
    hireMe: string;
    admin: string;
  };
  hero: {
    badge: string;
    viewWork: string;
    contactMe: string;
    scrollDown: string;
  };
  about: {
    sectionTag: string;
    title: string;
    whatYoullFindHere: string;
  };
  education: {
    sectionTag: string;
    title: string;
    academicTitle: string;
    professionalTitle: string;
    courseLabel: string;
    batchLabel: string;
    competenciesTitle: string;
  };
  skills: {
    sectionTag: string;
    title: string;
    toolsTitle: string;
  };
  workflow: {
    title: string;
  };
  services: {
    sectionTag: string;
    title: string;
  };
  projects: {
    sectionTag: string;
    title: string;
    tabAll?: string;
    tabVideo: string;
    tabVideoBest?: string;
    tabGraphic: string;
    tabGraphicBest?: string;
    watchOnYouTube: string;
    watchOnVimeo?: string;
    emptyPlaceholder: string;
  };
  videos: {
    sectionTag: string;
    title: string;
    tabVideoBest?: string;
    tabGraphicBest?: string;
    emptyPlaceholder: string;
  };
  channels: {
    title: string;
    subtitle: string;
    linked: string;
    unlinked: string;
  };
  feedback: {
    title: string;
    subtitle: string;
    nameLabel: string;
    emailLabel: string;
    adviceLabel: string;
    sendButton: string;
    sending: string;
    successMessage: string;
    errorMessage: string;
  };
  projectPitch: {
    title: string;
    subtitle: string;
    cta: string;
  };
  getInTouch: {
    title: string;
    subtitle: string;
    emailTitle: string;
    emailDesc: string;
    facebookTitle: string;
    facebookDesc: string;
    telegramTitle: string;
    telegramDesc: string;
  };
  footer: {
    connect: string;
    rights: string;
  };
  admin: {
    title: string;
    subtitle: string;
    loginTitle: string;
    loginDesc: string;
    signInWithGoogle: string;
    signOut: string;
    publishLive: string;
    saveDraft: string;
    publishing: string;
    savedDraftSuccess: string;
    publishedSuccess: string;
    previewDraft: string;
    previewLive: string;
  };
  lightbox: {
    close: string;
    next: string;
    prev: string;
    viewBehance: string;
    imageCount: string;
  };
}

export const translations: Record<Language, UITranslations> = {
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      education: 'Education',
      skills: 'Skills',
      services: 'Services',
      projects: 'Projects',
      videos: 'Showcase',
      channels: 'Proof',
      contact: 'Advice & Contact',
      hireMe: "Let's Talk",
      admin: 'Admin'
    },
    hero: {
      badge: 'AVAILABLE FOR CREATIVE PROJECTS',
      viewWork: 'View My Work',
      contactMe: "Let's Work Together",
      scrollDown: 'Scroll to explore'
    },
    about: {
      sectionTag: 'ABOUT ME',
      title: 'About Me',
      whatYoullFindHere: "WHAT YOU'LL FIND HERE"
    },
    education: {
      sectionTag: 'EDUCATION & PROFESSIONAL TRAINING',
      title: 'MY EDUCATION & CREATIVE LEARNING',
      academicTitle: 'Academic Background',
      professionalTitle: 'Professional Skill Development',
      courseLabel: 'Course',
      batchLabel: 'Batch',
      competenciesTitle: 'CORE COMPETENCIES ACQUIRED'
    },
    skills: {
      sectionTag: 'MY SKILLS',
      title: 'SKILLS & EXPERTISE',
      toolsTitle: 'Tools & Technologies'
    },
    workflow: {
      title: 'MY CREATIVE WORKFLOW'
    },
    services: {
      sectionTag: 'SERVICES',
      title: 'WHAT I OFFER'
    },
    projects: {
      sectionTag: 'MY PROJECTS',
      title: 'MY PROJECTS',
      tabAll: 'All Works',
      tabGraphic: 'Graphic Design',
      tabGraphicBest: 'Graphic Design Best Work',
      tabVideo: 'Video Editing',
      tabVideoBest: 'Video Editing Best Work',
      watchOnYouTube: 'WATCH ON YOUTUBE',
      watchOnVimeo: 'WATCH ON VIMEO',
      emptyPlaceholder: 'Add project from admin panel'
    },
    videos: {
      sectionTag: 'FEATURED SHOWCASE',
      title: 'MY BEST WORK',
      tabVideoBest: 'Video Editing Best Work',
      tabGraphicBest: 'Graphic Design Best Work',
      emptyPlaceholder: '[ADD VIDEO TITLE - Add video from admin panel]'
    },
    channels: {
      title: 'SKILL PROOF & CHANNEL LINKS',
      subtitle: 'Live channels, portfolio hubs, and drive folders showcasing video cuts, graphic files, and creative updates.',
      linked: 'LINKED',
      unlinked: 'UNLINKED'
    },
    feedback: {
      title: 'GIVE ME YOUR ADVICE',
      subtitle: "Have a suggestion or feedback for me? I'd love to hear it — your message stays private and is visible only to me.",
      nameLabel: 'Your Name *',
      emailLabel: 'Your Email *',
      adviceLabel: 'Your Advice / Suggestion *',
      sendButton: 'SEND MESSAGE',
      sending: 'TRANSMITTING...',
      successMessage: 'Thank you! Your advice has been received.',
      errorMessage: 'Failed to send advice. Please try again.'
    },
    projectPitch: {
      title: 'HAVE A PROJECT IN MIND?',
      subtitle: "Let's turn your idea into something visual.",
      cta: 'Start a Conversation'
    },
    getInTouch: {
      title: 'GET IN TOUCH',
      subtitle: 'Open to projects, collaborations and creative opportunities.',
      emailTitle: 'EMAIL',
      emailDesc: 'Drop me an email',
      facebookTitle: 'FACEBOOK',
      facebookDesc: 'Connect with me',
      telegramTitle: 'TELEGRAM',
      telegramDesc: 'Join my channel'
    },
    footer: {
      connect: 'CONNECT WITH ME',
      rights: 'All rights reserved.'
    },
    admin: {
      title: 'Portfolio Control Center',
      subtitle: 'Manage draft & live website state, showcase items, leads, and integrations.',
      loginTitle: 'Admin Authentication',
      loginDesc: 'Sign in to access your portfolio control center and edit draft/live content.',
      signInWithGoogle: 'Sign In with Google (Owner)',
      signOut: 'Sign Out',
      publishLive: 'Publish to Live Website',
      saveDraft: 'Save Changes to Draft',
      publishing: 'Publishing live...',
      savedDraftSuccess: 'Draft saved to database successfully!',
      publishedSuccess: 'Website published live for all visitors worldwide!',
      previewDraft: 'Draft Preview Mode',
      previewLive: 'Live Mode'
    },
    lightbox: {
      close: 'Close (Esc)',
      next: 'Next image',
      prev: 'Previous image',
      viewBehance: 'View on Behance',
      imageCount: 'Image'
    }
  },
  bn: {
    nav: {
      home: 'হোম',
      about: 'পরিচিতি',
      education: 'শিক্ষা',
      skills: 'দক্ষতা',
      services: 'সেবাসমূহ',
      projects: 'প্রজেক্টস',
      videos: 'ভিডিও',
      channels: 'প্রুফ',
      contact: 'পরামর্শ ও যোগাযোগ',
      hireMe: 'কথা বলুন',
      admin: 'অ্যাডমিন'
    },
    hero: {
      badge: 'ক্রিয়েটিভ প্রজেক্টের জন্য উন্মুক্ত',
      viewWork: 'আমার কাজ দেখুন',
      contactMe: 'একসাথে কাজ করি',
      scrollDown: 'নিচে স্ক্রল করুন'
    },
    about: {
      sectionTag: 'আমার সম্পর্কে',
      title: 'আমার সম্পর্কে',
      whatYoullFindHere: 'এখানে যা পাবেন'
    },
    education: {
      sectionTag: 'শিক্ষা ও পেশাদার প্রশিক্ষণ',
      title: 'আমার শিক্ষা ও ক্রিয়েটিভ শিখন',
      academicTitle: 'শিক্ষাগত পটভূমি',
      professionalTitle: 'পেশাদার দক্ষতা উন্নয়ন',
      courseLabel: 'কোর্স',
      batchLabel: 'ব্যাচ',
      competenciesTitle: 'অর্জিত মূল দক্ষতাসমূহ'
    },
    skills: {
      sectionTag: 'আমার দক্ষতা',
      title: 'দক্ষতা ও পারদর্শিতা',
      toolsTitle: 'টুলস ও প্রযুক্তি'
    },
    workflow: {
      title: 'আমার কাজের ধাপ (ওয়ার্কফ্লো)'
    },
    services: {
      sectionTag: 'সেবাসমূহ',
      title: 'আমি যা অফার করি'
    },
    projects: {
      sectionTag: 'আমার প্রজেক্টস',
      title: 'আমার প্রজেক্টস',
      tabAll: 'সকল কাজ',
      tabGraphic: 'গ্রাফিক ডিজাইন',
      tabGraphicBest: 'গ্রাফিক ডিজাইন বেস্ট ওয়ার্ক',
      tabVideo: 'ভিডিও এডিটিং',
      tabVideoBest: 'ভিডিও এডিটিং বেস্ট ওয়ার্ক',
      watchOnYouTube: 'ইউটিউবে দেখুন',
      watchOnVimeo: 'ভিমিওতে দেখুন',
      emptyPlaceholder: 'অ্যাডমিন প্যানেল থেকে প্রজেক্ট যুক্ত করুন'
    },
    videos: {
      sectionTag: 'সেরা কাজ',
      title: 'আমার সেরা কাজসমূহ',
      tabVideoBest: 'ভিডিও এডিটিং বেস্ট ওয়ার্ক',
      tabGraphicBest: 'গ্রাফিক ডিজাইন বেস্ট ওয়ার্ক',
      emptyPlaceholder: '[ভিডিওর শিরোনাম যুক্ত করুন — অ্যাডমিন প্যানেল থেকে]'
    },
    channels: {
      title: 'দক্ষতার প্রমাণ ও চ্যানেল লিংক',
      subtitle: 'লাইভ চ্যানেল, পোর্টফোলিও হাব এবং ড্রাইভ ফোল্ডার।',
      linked: 'সংযুক্ত',
      unlinked: 'অসংযুক্ত'
    },
    feedback: {
      title: 'আপনার পরামর্শ দিন',
      subtitle: 'আমার জন্য কোনো পরামর্শ বা ফিডব্যাক থাকলে জানান — আপনার বার্তা সম্পূর্ণ গোপন থাকবে।',
      nameLabel: 'আপনার নাম *',
      emailLabel: 'আপনার ইমেইল *',
      adviceLabel: 'আপনার পরামর্শ / মতামত *',
      sendButton: 'বার্তা পাঠান',
      sending: 'প্রেরণ করা হচ্ছে...',
      successMessage: 'ধন্যবাদ! আপনার পরামর্শ সফলভাবে পৌঁছেছে।',
      errorMessage: 'বার্তা পাঠাতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।'
    },
    projectPitch: {
      title: 'কোনো প্রজেক্টের পরিকল্পনা আছে?',
      subtitle: 'চলুন আপনার ধারণাকে দৃষ্টিনন্দন ভিজ্যুয়ালে রূপান্তর করি।',
      cta: 'আলোচনা শুরু করুন'
    },
    getInTouch: {
      title: 'যোগাযোগ করুন',
      subtitle: 'প্রজেক্ট, কোলাবোরেশন ও নতুন সুযোগের জন্য প্রস্তুত।',
      emailTitle: 'ইমেইল',
      emailDesc: 'একটি ইমেইল পাঠান',
      facebookTitle: 'ফেসবুক',
      facebookDesc: 'যুক্ত হোন',
      telegramTitle: 'টেলিগ্রাম',
      telegramDesc: 'চ্যানেলে যুক্ত হোন'
    },
    footer: {
      connect: 'সোশ্যাল মিডিয়ায় যুক্ত হোন',
      rights: 'সর্বস্বত্ব সংরক্ষিত।'
    },
    admin: {
      title: 'পোর্টফোলিও কন্ট্রোল সেন্টার',
      subtitle: 'ড্রাফট এবং লাইভ ওয়েবসাইটের কনটেন্ট পরিচালনা করুন।',
      loginTitle: 'অ্যাডমিন লগইন',
      loginDesc: 'আপনার কন্ট্রোল সেন্টারে প্রবেশ করতে গুগল অ্যাকাউন্ট দিয়ে সাইন ইন করুন।',
      signInWithGoogle: 'গুগল দিয়ে সাইন ইন (মালিক)',
      signOut: 'লগআউট',
      publishLive: 'ওয়েবসাইটে লাইভ পাবলিশ করুন',
      saveDraft: 'ড্রাফট হিসেবে সংরক্ষণ করুন',
      publishing: 'পাবলিশ হচ্ছে...',
      savedDraftSuccess: 'ড্রাফট সফলভাবে সংরক্ষিত হয়েছে!',
      publishedSuccess: 'ওয়েবসাইটটি লাইভ পাবলিশ হয়েছে!',
      previewDraft: 'ড্রাফট প্রিভিউ মোড',
      previewLive: 'লাইভ মোড'
    },
    lightbox: {
      close: 'বন্ধ করুন (Esc)',
      next: 'পরবর্তী ছবি',
      prev: 'পূর্ববর্তী ছবি',
      viewBehance: 'বিহ্যান্সে দেখুন',
      imageCount: 'ছবি'
    }
  },
  ar: {
    nav: {
      home: 'الرئيسية',
      about: 'نبذة عني',
      education: 'التعليم',
      skills: 'المهارات',
      services: 'الخدمات',
      projects: 'المشاريع',
      videos: 'الفيديوهات',
      channels: 'الإثباتات',
      contact: 'نصيحة وتواصل',
      hireMe: 'تواصل معي',
      admin: 'الإدارة'
    },
    hero: {
      badge: 'متاح للمشاريع الإبداعية',
      viewWork: 'شاهد أعمالي',
      contactMe: 'لنعمل معاً',
      scrollDown: 'مرر للأسفل'
    },
    about: {
      sectionTag: 'نبذة عني',
      title: 'نبذة عني',
      whatYoullFindHere: 'ما ستجده هنا'
    },
    education: {
      sectionTag: 'التعليم والتدريب المهني',
      title: 'تعليمي والمسيرة الإبداعية',
      academicTitle: 'المسيرة الأكاديمية',
      professionalTitle: 'تطوير المهارات المهنية',
      courseLabel: 'الدورة',
      batchLabel: 'الدفعة',
      competenciesTitle: 'الكفاءات الأساسية المكتسبة'
    },
    skills: {
      sectionTag: 'مهاراتي',
      title: 'المهارات والخبرات',
      toolsTitle: 'الأدوات والتقنيات'
    },
    workflow: {
      title: 'خطوات العمل الإبداعي'
    },
    services: {
      sectionTag: 'الخدمات',
      title: 'ما أقدمه'
    },
    projects: {
      sectionTag: 'مشاريعي',
      title: 'مشاريعي',
      tabAll: 'جميع الأعمال',
      tabGraphic: 'التصميم الجرافيكي',
      tabGraphicBest: 'أفضل أعمال الجرافيك',
      tabVideo: 'مونتاج الفيديو',
      tabVideoBest: 'أفضل أعمال المونتاج',
      watchOnYouTube: 'مشاهدة على يوتيوب',
      watchOnVimeo: 'مشاهدة على فيميو',
      emptyPlaceholder: 'أضف المشروع من لوحة التحكم'
    },
    videos: {
      sectionTag: 'أفضل الأعمال',
      title: 'شاهد أفضل أعمالي',
      tabVideoBest: 'أفضل أعمال المونتاج',
      tabGraphicBest: 'أفضل أعمال الجرافيك',
      emptyPlaceholder: '[أضف عنوان الفيديو من لوحة التحكم]'
    },
    channels: {
      title: 'إثباتات المهارة وروابط القنوات',
      subtitle: 'قنوات حية، معارض الأعمال ومجلدات الدرايف التي تستعرض المقاطع وملفات التصميم.',
      linked: 'مرتبط',
      unlinked: 'غير مرتبط'
    },
    feedback: {
      title: 'شاركني نصيحتك واقتراحك',
      subtitle: 'هل لديك اقتراح أو رأي؟ يسعدني سماعه — رسالتك خاصة تماماً ولا يراها أحد غيري.',
      nameLabel: 'اسمك الكريم *',
      emailLabel: 'بريدك الإلكتروني *',
      adviceLabel: 'نصيحتك / اقتراحك *',
      sendButton: 'إرسال الرسالة',
      sending: 'جارٍ الإرسال...',
      successMessage: 'شكراً جزيلاً! تم استلام نصيحتك بنجاح.',
      errorMessage: 'فشل إرسال الرسالة. يرجى المحاولة ثانية.'
    },
    projectPitch: {
      title: 'هل يدور ببالك مشروع؟',
      subtitle: 'دعنا نحول فكرتك إلى واقع بصري مبهر.',
      cta: 'ابدأ المحادثة الآن'
    },
    getInTouch: {
      title: 'تواصل معي',
      subtitle: 'متاح للمشاريع والتعاون والفرص الإبداعية الجديدة.',
      emailTitle: 'البريد الإلكتروني',
      emailDesc: 'أرسل لي رسالة',
      facebookTitle: 'فيسبوك',
      facebookDesc: 'تواصل معي',
      telegramTitle: 'تيليجرام',
      telegramDesc: 'انضم إلى قناتي'
    },
    footer: {
      connect: 'تواصل عبر المنصات',
      rights: 'جميع الحقوق محفوظة.'
    },
    admin: {
      title: 'لوحة التحكم للموقع',
      subtitle: 'إدارة المسودات والموقع المباشر، المعرض، والرسائل الواردة.',
      loginTitle: 'تسجيل دخول المشرف',
      loginDesc: 'سجل الدخول بحساب جوجل للوصول إلى لوحة الإدارة وتعديل المحتوى.',
      signInWithGoogle: 'تسجيل الدخول عبر جوجل (المالك)',
      signOut: 'تسجيل الخروج',
      publishLive: 'نشر فوري على الموقع المباشর',
      saveDraft: 'حفظ التعديلات كمسودة',
      publishing: 'جارٍ النشر...',
      savedDraftSuccess: 'تم حفظ المسودة في قاعدة البيانات بنجاح!',
      publishedSuccess: 'تم نشر الموقع مباشرة لكافة الزوار!',
      previewDraft: 'وضع معاينة المسودة',
      previewLive: 'الوضع المباشر'
    },
    lightbox: {
      close: 'إغلاق (Esc)',
      next: 'الصورة التالية',
      prev: 'الصورة السابقة',
      viewBehance: 'عرض على بيهانس',
      imageCount: 'صورة'
    }
  }
};
