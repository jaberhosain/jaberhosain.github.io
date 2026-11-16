import { PortfolioConfig, SocialLinkItem, ContactFormConfig, FooterConfig } from '../types/portfolio';

export const defaultContactForm: ContactFormConfig = {
  title: {
    en: 'GIVE ME YOUR ADVICE',
    bn: 'আপনার পরামর্শ দিন',
    ar: 'شاركني نصيحتك واقتراحك'
  },
  subtitle: {
    en: "Have a suggestion or feedback for me? I'd love to hear it — your message stays private and is visible only to me.",
    bn: 'আমার জন্য কোনো পরামর্শ বা ফিডব্যাক থাকলে জানান — আপনার বার্তা সম্পূর্ণ গোপন থাকবে।',
    ar: 'هل لديك اقتراح أو رأي؟ يسعدني سماعه — رسالتك خاصة تماماً ولا يراها أحد غيري.'
  },
  nameLabel: {
    en: 'Your Name *',
    bn: 'আপনার নাম *',
    ar: 'اسمك الكريم *'
  },
  namePlaceholder: {
    en: 'e.g. John Doe',
    bn: 'যেমন: আপনার নাম',
    ar: 'مثال: اسمك الكريم'
  },
  emailLabel: {
    en: 'Your Email *',
    bn: 'আপনার ইমেইল *',
    ar: 'بريدك الإلكتروني *'
  },
  emailPlaceholder: {
    en: 'e.g. name@example.com',
    bn: 'যেমন: name@example.com',
    ar: 'مثال: name@example.com'
  },
  messageLabel: {
    en: 'Your Advice / Suggestion *',
    bn: 'আপনার পরামর্শ / মতামত *',
    ar: 'نصيحتك / اقتراحك *'
  },
  messagePlaceholder: {
    en: 'Write your thoughts, suggestions, or advice here...',
    bn: 'আপনার মতামত বা পরামর্শ এখানে লিখুন...',
    ar: 'اكتب نصيحتك أو اقتراحك هنا...'
  },
  submitButtonText: {
    en: 'SEND MESSAGE',
    bn: 'বার্তা পাঠান',
    ar: 'إرسال الرسالة'
  },
  submittingText: {
    en: 'TRANSMITTING...',
    bn: 'প্রেরণ করা হচ্ছে...',
    ar: 'جارٍ الإرسال...'
  },
  successMessage: {
    en: 'Thank you! Your advice has been received.',
    bn: 'ধন্যবাদ! আপনার পরামর্শ সফলভাবে পৌঁছেছে।',
    ar: 'شكراً جزيلاً! تم استلام نصيحتك بنجاح.'
  },
  errorMessage: {
    en: 'Failed to send advice. Please try again.',
    bn: 'বার্তা পাঠাতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।',
    ar: 'فشل إرسال الرسالة. يرجى المحاولة ثانية.'
  },
  projectPitchTitle: {
    en: 'HAVE A PROJECT IN MIND?',
    bn: 'কোনো প্রজেক্টের পরিকল্পনা আছে?',
    ar: 'هل يدور ببالك مشروع؟'
  },
  projectPitchSubtitle: {
    en: "Let's turn your idea into something visual.",
    bn: 'চলুন আপনার ধারণাকে দৃষ্টিনন্দন ভিজ্যুয়ালে রূপান্তর করি।',
    ar: 'دعنا نحول فكرتك إلى واقع بصري مبهر.'
  },
  projectPitchCta: {
    en: 'Start a Conversation',
    bn: 'আলোচনা শুরু করুন',
    ar: 'ابدأ المحادثة الآن'
  },
  getInTouchTitle: {
    en: 'GET IN TOUCH',
    bn: 'যোগাযোগ করুন',
    ar: 'تواصل معي'
  },
  getInTouchSubtitle: {
    en: 'Open to projects, collaborations and creative opportunities.',
    bn: 'প্রজেক্ট, কোলাবোরেশন ও নতুন সুযোগের জন্য প্রস্তুত।',
    ar: 'متاح للمشاريع والتعاون والفرص الإبداعية الجديدة.'
  }
};

export const defaultFooterConfig: FooterConfig = {
  connectTitle: {
    en: 'CONNECT WITH ME',
    bn: 'সোশ্যাল মিডিয়ায় যুক্ত হোন',
    ar: 'تواصل عبر المنصات'
  },
  copyrightText: {
    en: 'All rights reserved.',
    bn: 'সর্বস্বত্ব সংরক্ষিত।',
    ar: 'جميع الحقوق محفوظة.'
  },
  backToTopText: {
    en: 'Back to top',
    bn: 'উপরে ফিরে যান',
    ar: 'العودة للأعلى'
  }
};

export const initialPortfolioData: PortfolioConfig = {
  status: 'published',
  defaultFocusMode: 'all',
  showFocusSwitcher: true,
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString(),
  contactForm: defaultContactForm,
  footerConfig: defaultFooterConfig,
  caseStudiesSection: {
    tag: {
      en: 'Selected Case Studies',
      bn: 'নির্বাচিত কেস স্টাডি',
      ar: 'دراسات حالة مختارة'
    },
    titlePrefix: {
      en: 'Work That Delivers',
      bn: 'প্রজেক্ট ও ফলাফল',
      ar: 'أعمال تحقق'
    },
    titleItalic: {
      en: 'real results.',
      bn: 'কেস স্টাডি',
      ar: 'نتائج حقيقية.'
    },
    visible: true
  },
  caseStudies: [
    {
      id: 'cs-video-1',
      category: 'video',
      categoryLabel: { en: 'Video Editing', bn: 'ভিডিও এডিটিং', ar: 'مونتاج الفيديو' },
      title: {
        en: 'Documentary & Short-Form Reel Editing',
        bn: 'ডকুমেন্টারি ও সোশ্যাল রিলস এডিটিং (প্যারালাক্স স্টোরিটেলিং)',
        ar: 'مونتاج الأفلام الوثائقية والريلز'
      },
      thumbnail: '/assets/jaber_hero.png',
      problem: {
        en: 'Raw talking-head and documentary footage was losing viewer retention within the first 3 seconds.',
        bn: 'সাধারণ কাটিং ও ধীর পেসিংয়ের কারণে দর্শক প্রথম ৩ সেকেন্ডের মধ্যেই ভিডিও স্কিপ করছিল।',
        ar: 'كانت اللقطات الخام تفقد انتباه المشاهدين خلال أول ٣ ثوانٍ.'
      },
      process: {
        en: 'Structured hook pacing in Premiere Pro, layered kinetic captions in After Effects, and applied rich sound design.',
        bn: 'Premiere Pro ও After Effects দিয়ে টাইট পেসিং, সাউন্ড ডিজাইন, সাবটাইটেল হুক ও সিনেমাটিক কালার গ্রেডিং যুক্ত করা হয়।',
        ar: 'تنسيق الإيقاع السريع في Premiere Pro وإضافة نصوص حركية وتصميم صوتي احترافي.'
      },
      result: {
        en: 'Delivered a crisp, broadcast-ready cut that boosted watch-through retention and audience shares.',
        bn: 'দর্শকের ওয়াচ-টাইম ও সোশ্যাল মিডিয়া শেয়ার উল্লেখযোগ্যভাবে বৃদ্ধি পায়।',
        ar: 'مقطع احترافي جاهز للبث عزز نسبة المشاهدة والمشاركات.'
      },
      videoType: 'facebook',
      videoUrl: 'https://www.facebook.com/share/p/1DNfXJTmTK/',
      visible: true,
      order: 1
    },
    {
      id: 'cs-motion-1',
      category: 'motion',
      categoryLabel: { en: 'Motion Graphics', bn: 'মোশন গ্রাফিক্স', ar: 'موشن جرافيك' },
      title: {
        en: 'Kinetic Typography & Brand Promo Motion',
        bn: 'কাইনেটিক টাইপোগ্রাফি ও প্রোমো মোশন ভিজ্যুয়াল',
        ar: 'تايبوجرافي حركي وإعلان موشن للعلامات'
      },
      thumbnail: '/assets/jaber_about.png',
      problem: {
        en: 'Static promotional announcements were blending into crowded feeds without stopping the scroll.',
        bn: 'স্ট্যাটিক প্রমোশনাল পোস্টার সোশ্যাল ফিডে স্ক্রল থামাতে পারছিল না।',
        ar: 'كانت الإعلانات الثابتة تضيع وسط المنشورات دون لفت الانتباه.'
      },
      process: {
        en: 'Built multi-layer 3D camera rigs, smooth speed-graph transitions, and typography motion in After Effects.',
        bn: 'After Effects-এ কাস্টম ক্যামেরা মুভমেন্ট, ৩ডি লেয়ার ডেপথ এবং স্মুথ কি-ফ্রেম অ্যানিমেশন তৈরি করা হয়।',
        ar: 'بناء كاميرا ثلاثية الأبعاد متعددة الطبقات وانتقالات سلسة في After Effects.'
      },
      result: {
        en: 'Created high-impact motion promos that elevated brand authority and campaign click-through rates.',
        bn: 'ব্র্যান্ডের প্রমোশনাল ক্যাম্পেইনে উচ্চ ক্লিক-থ্রু ও এনগেজমেন্ট অর্জিত হয়।',
        ar: 'إعلانات موشن عالية التأثير رفعت من قوة العلامة ومعدل النقر.'
      },
      videoType: 'facebook',
      videoUrl: 'https://www.facebook.com/share/v/19XfdDJYTf/',
      visible: true,
      order: 2
    },
    {
      id: 'cs-graphic-1',
      category: 'graphic',
      categoryLabel: { en: 'Graphic Design', bn: 'গ্রাফিক ডিজাইন', ar: 'التصميم الجرافيكي' },
      title: {
        en: 'Brand Identity & Visual Poster System',
        bn: 'ব্র্যান্ড আইডেন্টিটি ও ভিজ্যুয়াল পোস্টার সিরিজ',
        ar: 'الهوية البصرية ونظام البوسترات'
      },
      thumbnail: '/assets/jabir_profile.png',
      problem: {
        en: 'Inconsistent typography and visual hierarchy made the brand look amateur across digital touchpoints.',
        bn: 'ব্র্যান্ডের সোশ্যাল মিডিয়া ও প্রিন্ট ম্যাটেরিয়ালে একীভূত ভিজ্যুয়াল ল্যাঙ্গুয়েজের অভাব ছিল।',
        ar: 'أدى تشتت الخطوط والتسلسل البصري إلى إضعاف مظهر العلامة التجارية.'
      },
      process: {
        en: 'Crafted a cohesive poster grid, custom vector accents, and high-contrast color grading in Photoshop & Illustrator.',
        bn: 'Photoshop ও Illustrator ব্যবহার করে গ্রিড-ভিত্তিক টাইপোগ্রাফি, কালার সিস্টেম ও পোস্টার সিরিজ ডিজাইন করা হয়।',
        ar: 'تصميم شبكة بوسترات متناسقة وعناصر فيكتور وتنسيق ألوان متباين.'
      },
      result: {
        en: 'Established an unmistakable visual identity featured on Behance with strong client recognition.',
        bn: 'একটি প্রিমিয়াম ও আন্তর্জাতিক মানের ব্র্যান্ড পরিচিতি প্রতিষ্ঠিত হয়।',
        ar: 'تأسيس هوية بصرية مميزة حظيت بإشادة العملاء على Behance.'
      },
      behanceUrl: 'https://www.behance.net/jaberhosain',
      visible: true,
      order: 3
    },
    {
      id: 'cs-graphic-2',
      category: 'graphic',
      categoryLabel: { en: 'Graphic Design', bn: 'গ্রাফিক ডিজাইন', ar: 'التصميم الجرافيكي' },
      title: {
        en: 'High-CTR Social Media & YouTube Thumbnails',
        bn: 'হাই-কনভার্টিং সোশ্যাল মিডিয়া ক্যাম্পেইন ও থাম্বনেইল',
        ar: 'تصاميم السوشيال ميديا والصور المصغرة ليوتيوب'
      },
      thumbnail: '/assets/jaber_hero.png',
      problem: {
        en: 'Strong video content and Meta ad campaigns were underperforming due to cluttered, low-contrast thumbnails.',
        bn: 'ভালো কনটেন্ট থাকা সত্ত্বেও আকর্ষণীয় থাম্বনেইল ও অ্যাড ক্রিয়েটিভের অভাবে ভিউ কম হচ্ছিল।',
        ar: 'ضعف أداء الحملات الإعلانية والمقاطع بسبب الصور المصغرة المزدحمة.'
      },
      process: {
        en: 'Designed focal-point lighting, bold readable typography, and AI-enhanced compositing in Photoshop.',
        bn: 'ফোকাল পয়েন্ট লাইটিং, এক্সপ্রেসিভ কম্পোজিশন ও এআই-সহায়ক ভিজ্যুয়াল ওয়ার্কফ্লো দিয়ে ক্রিয়েটিভ তৈরি করা হয়।',
        ar: 'تصميم إضاءة بؤرية وخطوط واضحة ودمج إبداعي مدعوم بالذكاء الاصطناعي.'
      },
      result: {
        en: 'Significantly improved organic click-through rate (CTR) and Meta ad conversion performance.',
        bn: 'ক্যাম্পেইনের ইমপ্রেশন ও অর্গানিক ক্লিক রেট (CTR) দ্রুত বৃদ্ধি পায়।',
        ar: 'تحسن ملحوظ في معدل النقر والتحويلات الإعلانية.'
      },
      behanceUrl: 'https://www.behance.net/jaberhosain',
      visible: true,
      order: 4
    }
  ],
  homeStats: [
    {
      id: 'stat-1',
      value: '50+',
      label: { en: 'Projects Completed', bn: 'সম্পন্ন প্রজেক্ট', ar: 'مشاريع مكتملة' },
      order: 1
    },
    {
      id: 'stat-2',
      value: '1.5+',
      label: { en: 'Years of Experience', bn: 'বছরের অভিজ্ঞতা', ar: 'سنوات الخبرة' },
      order: 2
    },
    {
      id: 'stat-3',
      value: '30+',
      label: { en: 'Happy Clients & Collaborations', bn: 'সন্তুষ্ট ক্লায়েন্ট ও প্রজেক্ট', ar: 'عملاء وشركاء سعداء' },
      order: 3
    }
  ],
  showHomeStats: true,
  homeTools: [
    'Adobe Premiere Pro',
    'Adobe After Effects',
    'Adobe Photoshop',
    'Adobe Illustrator',
    'AI Tools & Workflows',
    'Meta Ads Creative'
  ],
  testimonialsSection: {
    tag: {
      en: 'Client Trust & Feedback',
      bn: 'ক্লায়েন্টদের মতামত',
      ar: 'ثقة وآراء العملاء'
    },
    title: {
      en: 'What Clients & Collaborators Say',
      bn: 'ক্লায়েন্টরা যা বলেন',
      ar: 'ماذا يقول العملاء والشركاء'
    },
    visible: true
  },
  homeSectionOrder: [
    'caseStudies',
    'videoShowcase',
    'graphicShowcase',
    'aboutPreview',
    'trustTestimonials',
    'overviewDirectory'
  ],
  homeSectionVisibility: {
    caseStudies: true,
    videoShowcase: true,
    graphicShowcase: true,
    aboutPreview: true,
    trustTestimonials: true,
    overviewDirectory: true
  },
  hero: {
    name: {
      en: 'MD. JABER HOSAIN',
      bn: 'মো. জাবির হোসেন',
      ar: 'محمد جابر حسين'
    },
    badge: {
      en: '',
      bn: '',
      ar: ''
    },
    showBadge: false,
    tagline: {
      en: 'Video Editor · Graphic Designer · Motion Designer',
      bn: 'ভিডিও এডিটর · গ্রাফিক ডিজাইনার · মোশন ডিজাইনার',
      ar: 'مونتير فيديو · مصمم جرافيك · مصمم موشن'
    },
    avatarUrl: '/assets/jabir_profile.png',
    ctaWork: {
      en: 'View My Work',
      bn: 'আমার কাজ দেখুন',
      ar: 'شاهد أعمالي'
    },
    ctaWorkUrl: '#projects',
    showCtaWork: true,
    ctaContact: {
      en: 'Hire Me',
      bn: 'হায়ার করুন',
      ar: 'وظفني الآن'
    },
    ctaContactUrl: '#contact',
    showCtaContact: true,
    floatingBadgeText: {
      en: 'MD JABER HOSAIN',
      bn: 'মো. জাবির হোসেন',
      ar: 'محمد جابر حسين'
    },
    showFloatingBadge: true,
    counters: [
      {
        id: 'cnt-1',
        value: '50+',
        label: { en: 'Projects Completed', bn: 'সম্পন্ন প্রজেক্ট', ar: 'مشاريع مكتملة' },
        order: 1
      },
      {
        id: 'cnt-2',
        value: '1.5+',
        label: { en: 'Years of Experience', bn: 'বছরের অভিজ্ঞতা', ar: 'سنوات الخبرة' },
        order: 2
      },
      {
        id: 'cnt-3',
        value: '30+',
        label: { en: 'Happy Clients', bn: 'সন্তুষ্ট ক্লায়েন্ট', ar: 'عملاء سعداء' },
        order: 3
      }
    ],
    showCounters: true
  },
  about: {
    bio: {
      en: "I'm MD. Jaber Hossain, a creative professional specializing in Graphic Design, Video Editing, Meta Marketing, and Generative AI. I turn ideas into engaging visual content while continuously learning, experimenting, and building real-world creative projects.",
      bn: 'আমি মো. জাবির হোসেন, গ্রাফিক ডিজাইন, ভিডিও এডিটিং, মেটা মার্কেটিং এবং জেনারেটিভ এআই-এ বিশেষজ্ঞ একজন ক্রিয়েটিভ প্রফেশনাল। আমি নতুন বিষয় শেখা, পরীক্ষণ এবং বাস্তব জীবনের প্রজেক্ট তৈরির মাধ্যমে যেকোনো ধারণাকে আকর্ষণীয় ভিজ্যুয়াল কনটেন্টে রূপান্তর করি।',
      ar: 'أنا محمد جابر حسين، متخصص إبداعي في التصميم الجرافيكي، ومونتاج الفيديو، والتسويق عبر منصات ميتا، والذكاء الاصطناعي التوليدي. أحوّل الأفكار إلى محتوى بصري جذاب بالتزامن مع التعلم المستمر والتجربة وبناء مشاريع واقعية.'
    },
    avatarUrl: '/assets/jabir_profile.png'
  },
  overviewCards: [
    {
      id: 'ov-1',
      title: { en: 'Academic Background', bn: 'শিক্ষাগত পটভূমি', ar: 'المسيرة الأكاديمية' },
      description: { en: 'My education, institutions, courses and training.', bn: 'আমার শিক্ষা, প্রতিষ্ঠান, কোর্স এবং প্রশিক্ষণ।', ar: 'تعليمي، والمؤسسات، والدورات التدريبية.' },
      linkText: { en: 'View More →', bn: 'আরও দেখুন →', ar: 'عرض المزيد ←' },
      linkTarget: '#education',
      icon: 'GraduationCap'
    },
    {
      id: 'ov-2',
      title: { en: 'Professional Skills', bn: 'পেশাদার দক্ষতা', ar: 'المهارات المهنية' },
      description: { en: 'Creative and digital skills I bring to every project.', bn: 'প্রতিটি কাজে প্রয়োগ করা ক্রিয়েটিভ ও ডিজিটাল দক্ষতা।', ar: 'المهارات الإبداعية والرقمية التي أقدمها في كل مشروع.' },
      linkText: { en: 'View More →', bn: 'আরও দেখুন →', ar: 'عرض المزيد ←' },
      linkTarget: '#skills',
      icon: 'Award'
    },
    {
      id: 'ov-3',
      title: { en: 'Video Editing', bn: 'ভিডিও এডিটিং', ar: 'مونتاج الفيديو' },
      description: { en: 'My video editing portfolio, projects and tools used.', bn: 'আমার ভিডিও এডিটিং পোর্টফোলিও, প্রজেক্ট এবং ব্যবহৃত টুলস।', ar: 'معرض أعمال الفيديو والمشاريع والأدوات المستخدمة.' },
      linkText: { en: 'View Portfolio →', bn: 'পোর্টফোলিও দেখুন →', ar: 'عرض الأعمال ←' },
      linkTarget: '#projects',
      icon: 'Video'
    },
    {
      id: 'ov-4',
      title: { en: 'Graphic Design', bn: 'গ্রাফিক ডিজাইন', ar: 'التصميم الجرافيكي' },
      description: { en: 'My design portfolio — posters, socials and more.', bn: 'আমার ডিজাইন পোর্টফোলিও — পোস্টার, সোশ্যাল এবং আরও অনেক কিছু।', ar: 'معرض التصاميم — بوسترات، تصاميم سوشيال ميديا والمزيد.' },
      linkText: { en: 'View Portfolio →', bn: 'পোর্টফোলিও দেখুন →', ar: 'عرض الأعمال ←' },
      linkTarget: '#projects',
      icon: 'Palette'
    },
    {
      id: 'ov-5',
      title: { en: 'Creative Tools & Skills', bn: 'টুলস ও সফটওয়্যার', ar: 'الأدوات الإبداعية' },
      description: { en: 'The software and tools I use to bring ideas to life.', bn: 'আইডিয়া বাস্তবায়নে ব্যবহৃত সফটওয়্যার এবং টুলস।', ar: 'البرمجيات والأدوات التي أعتمد عليها لتحويل الأفكار إلى واقع.' },
      linkText: { en: 'View More →', bn: 'আরও দেখুন →', ar: 'عرض المزيد ←' },
      linkTarget: '#skills',
      icon: 'Wrench'
    }
  ],
  academicRecords: [
    {
      id: 'acad-1',
      title: {
        en: 'Junior Dakhil Certificate (JDC)',
        bn: 'জুনিয়র দাখিল সার্টিফিকেট (জেডিসি)',
        ar: 'شهادة الداخيل المتوسطة (JDC)'
      },
      year: '2020',
      description: {
        en: 'Successfully completed the Junior Dakhil Certificate (JDC) examination — equivalent to Class 8 public examination in Bangladesh.',
        bn: 'জুনিয়র দাখিল সার্টিফিকেট (জেডিসি) পরীক্ষা সফলভাবে সম্পন্ন করেছেন — যা বাংলাদেশে ৮ম শ্রেণির পাবলিক পরীক্ষার সমমান।',
        ar: 'إتمام اختبار شهادة الداخيل المتوسطة بنجاح — المعادل لاختبار الصف الثامن العام في بنغلاديش.'
      },
      status: { en: 'Completed', bn: 'সম্পন্ন', ar: 'مكتمل' }
    },
    {
      id: 'acad-2',
      title: {
        en: 'Dakhil (SSC Equivalent) — Arts',
        bn: 'দাখিল (এসএসসি সমমান) — মানবিক',
        ar: 'الداخيل (معادل للثانوية العامة SSC)'
      },
      year: '2023',
      description: {
        en: 'Successfully completed Dakhil from Khilbaisa Rahmania Fazil Madrasah, Lakshmipur with GPA 3.94 out of 5.00.',
        bn: 'খিলবাইছা রহমানিয়া ফাজিল মাদরাসা, লক্ষ্মীপুর থেকে GPA 3.94 (৫.০০-এর মধ্যে) অর্জন করে দাখিল সম্পন্ন।',
        ar: 'إتمام الداخيل (المعادل لشهادة SSC) من مدرسة خيلبايسا الرحمانية بمعدل 3.94 من 5.00.'
      },
      status: { en: 'GPA 3.94 / 5.00', bn: 'GPA 3.94 / 5.00', ar: '3.94 / 5.00' }
    },
    {
      id: 'acad-3',
      title: {
        en: 'Alim (HSC Equivalent) — Arts',
        bn: 'আলিম (এইচএসসি সমমান) — মানবিক',
        ar: 'العالمية (معادل للثانوية العليا HSC)'
      },
      year: '2025',
      description: {
        en: "Completed Higher Secondary (Alim) from Ta'mirul Millat Kamil Madrasah, Tongi with GPA 4.14 out of 5.00.",
        bn: "তা'মীরুল মিল্লাত কামিল মাদরাসা, টঙ্গী থেকে GPA 4.14 (৫.০০-এর মধ্যে) অর্জন করে আলিম (এইচএসসি সমমান) সম্পন্ন।",
        ar: 'إتمام شهادة العالمية (المعادل لشهادة HSC) من مدرسة تامير الملة بتونجي بمعدل 4.14 من 5.00.'
      },
      status: { en: 'GPA 4.14 / 5.00', bn: 'GPA 4.14 / 5.00', ar: '4.14 / 5.00' }
    },
    {
      id: 'acad-4',
      title: {
        en: 'Fazil (Honours)',
        bn: 'ফাযিল (অনার্স)',
        ar: 'الفاضل (درجة البكالوريوس مع مرتبة الشرف)'
      },
      year: '2026 - Present',
      description: {
        en: 'Currently pursuing Fazil (Honours), enrolled in 2026, under the Islamic education system.',
        bn: 'বর্তমানে ইসলামি শিক্ষা ব্যবস্থার অধীনে ২০২৬ শিক্ষাবর্ষে ফাযিল (অনার্স) অধ্যয়নরত।',
        ar: 'ملتحق حالياً بدراسة الفاضل (البكالوريوس مع مرتبة الشرف) لعام 2026 تحت مظلة التعليم الإسلامي.'
      },
      status: { en: 'Currently Studying', bn: 'অধ্যয়নরত', ar: 'قيد الدراسة' }
    }
  ],
  professionalInstitute: {
    id: 'inst-1',
    institution: {
      en: 'As-Sunnah Skill Development Institute',
      bn: 'আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট',
      ar: 'معهد السُنّة لتطوير المهارات'
    },
    course: {
      en: 'SBMC (Small Business Management Course)',
      bn: 'এসবিএমসি (স্মল বিজনেস ম্যানেজমেন্ট কোর্স)',
      ar: 'دورة إدارة المشاريع الصغيرة (SBMC)'
    },
    batch: 'Batch 08',
    competencies: [
      {
        id: 'comp-1',
        category: { en: 'Video Editing', bn: 'ভিডিও এডিটিং', ar: 'مونتاج الفيديو' },
        tools: 'Premiere Pro & After Effects'
      },
      {
        id: 'comp-2',
        category: { en: 'Graphic Design', bn: 'গ্রাফিক ডিজাইন', ar: 'التصميم الجرافيكي' },
        tools: 'Photoshop, Illustrator & Canva Pro'
      },
      {
        id: 'comp-3',
        category: { en: 'Meta Marketing', bn: 'মেটা মার্কেটিং', ar: 'تسويق ميتا' },
        tools: 'Facebook & Instagram Ads Strategy'
      },
      {
        id: 'comp-4',
        category: { en: 'Generative AI Tools', bn: 'জেনারেটিভ এআই টুলস', ar: 'أدوات الذكاء الاصطناعي' },
        tools: 'Prompt Engineering, AI Visuals & Workflows'
      }
    ],
    footerTag1: { en: 'Hands-on Real Project Execution', bn: 'হাতে-কলমে বাস্তব প্রজেক্ট সম্পাদন', ar: 'تنفيذ عملي لمشاريع حقيقية' },
    footerTag2: { en: 'Industry Ready', bn: 'ইন্ডাস্ট্রি রেডি', ar: 'جاهزية لسوق العمل' },
    order: 1
  },
  professionalInstitutes: [
    {
      id: 'inst-1',
      institution: {
        en: 'As-Sunnah Skill Development Institute',
        bn: 'আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট',
        ar: 'معهد السُنّة لتطوير المهارات'
      },
      course: {
        en: 'SBMC (Small Business Management Course)',
        bn: 'এসবিএমসি (স্মল বিজনেস ম্যানেজমেন্ট কোর্স)',
        ar: 'دورة إدارة المشاريع الصغيرة (SBMC)'
      },
      batch: 'Batch 08',
      competencies: [
        {
          id: 'comp-1',
          category: { en: 'Video Editing', bn: 'ভিডিও এডিটিং', ar: 'مونتاج الفيديو' },
          tools: 'Premiere Pro & After Effects'
        },
        {
          id: 'comp-2',
          category: { en: 'Graphic Design', bn: 'গ্রাফিক ডিজাইন', ar: 'التصميم الجرافيكي' },
          tools: 'Photoshop, Illustrator & Canva Pro'
        },
        {
          id: 'comp-3',
          category: { en: 'Meta Marketing', bn: 'মেটা মার্কেটিং', ar: 'تسويق ميتا' },
          tools: 'Facebook & Instagram Ads Strategy'
        },
        {
          id: 'comp-4',
          category: { en: 'Generative AI Tools', bn: 'জেনারেটিভ এআই টুলস', ar: 'أدوات الذকاء الاصطناعي' },
          tools: 'Prompt Engineering, AI Visuals & Workflows'
        }
      ],
      footerTag1: { en: 'Hands-on Real Project Execution', bn: 'হাতে-কলমে বাস্তব প্রজেক্ট সম্পাদন', ar: 'تنفيذ عملي لمشاريع حقيقية' },
      footerTag2: { en: 'Industry Ready', bn: 'ইন্ডাস্ট্রি রেডি', ar: 'جاهزية لسوق العمل' },
      order: 1
    },
    {
      id: 'inst-2',
      institution: {
        en: 'Bismillah Computer and Training Center',
        bn: 'বিসমিল্লাহ কম্পিউটার অ্যান্ড ট্রেনিং সেন্টার',
        ar: 'مركز بسم الله للحاسوب والتدريب'
      },
      course: {
        en: 'Basic Computer & Microsoft Office Training',
        bn: 'বেসিক কম্পিউটার ও মাইক্রোসফট অফিস প্রশিক্ষণ',
        ar: 'دورة الحاسوب الأساسي ومايكروسوفت أوفيس'
      },
      batch: '2023 (3 Months)',
      competencies: [
        {
          id: 'comp-2-1',
          category: { en: 'Microsoft Office Suite', bn: 'মাইক্রোসফট অফিস সুইট', ar: 'مجموعة مايكروسوفت أوفيس' },
          tools: 'MS Word, Excel, PowerPoint, Typing & Formatting'
        },
        {
          id: 'comp-2-2',
          category: { en: 'Operating Systems & Hardware', bn: 'অপারেটিং সিস্টেম ও হার্ডওয়্যার', ar: 'أنظمة التشغيل والعتاد' },
          tools: 'Windows, macOS, Linux, File Management & Internet'
        }
      ],
      footerTag1: { en: 'Uttar Station, Lakshmipur, Bangladesh', bn: 'উত্তর স্টেশন, লক্ষ্মীপুর, বাংলাদেশ', ar: 'لاكشميبور، بنغلاديش' },
      footerTag2: { en: '25 May – 03 Aug 2023', bn: '২৫ মে – ০৩ আগস্ট ২০২৩', ar: 'مايو – أغسطس 2023' },
      order: 2
    }
  ],
  services: [
    {
      id: 'srv-1',
      title: {
        en: 'Video Editing',
        bn: 'ভিডিও এডিটিং',
        ar: 'مونتاج الفيديو'
      },
      description: {
        en: 'From raw footage to cinematic sequences — motion, storytelling, reels and more.',
        bn: 'র ফুটেজ থেকে সিনেমাটিক সিকোয়েন্স — মোশন, স্টোরিটেলিং, রিলস এবং আরও অনেক কিছু।',
        ar: 'من اللقطات الخام إلى تسلسلات سينمائية مبهرة — موشن، سرد قصصي، ريلز والمزيد.'
      },
      icon: 'Video'
    },
    {
      id: 'srv-2',
      title: {
        en: 'Graphic Design',
        bn: 'গ্রাফিক ডিজাইন',
        ar: 'التصميم الجرافيكي'
      },
      description: {
        en: 'Posters, thumbnails, calligraphy and social media visuals that stand out.',
        bn: 'পোস্টার, থাম্বনেইল, ক্যালিগ্রাফি এবং সোশ্যাল মিডিয়া ভিজ্যুয়াল যা নজর কাড়ে।',
        ar: 'بوسترات، مصغرات يوتيوب، خط عربي وتصاميم سوشيال ميديا فريدة.'
      },
      icon: 'Palette'
    }
  ],
  skills: [
    {
      id: 'sk-1',
      title: { en: 'VIDEO EDITING', bn: 'ভিডিও এডিটিং', ar: 'مونتاج الفيديو' },
      description: {
        en: 'Professional video editing, storytelling, motion graphics and post-production.',
        bn: 'পেশাদার ভিডিও সম্পাদনা, স্টোরিটেলিং, মোশন গ্রাফিক্স এবং পোস্ট-প্রোডাকশন।',
        ar: 'مونتاج فيديو احترافي، سرد قصصي، موشن جرافيك وما بعد الإنتاج.'
      },
      tools: ['Premiere Pro', 'After Effects'],
      icon: 'Video'
    },
    {
      id: 'sk-2',
      title: { en: 'GRAPHIC DESIGN', bn: 'গ্রাফিক ডিজাইন', ar: 'التصميم الجرافيكي' },
      description: {
        en: 'Creative visual design, branding, social media and promotional materials.',
        bn: 'সৃজনশীল ভিজ্যুয়াল ডিজাইন, ব্র্যান্ডিং, সোশ্যাল মিডিয়া ও বিজ্ঞাপনী সামগ্রী।',
        ar: 'تصميم بصري إبداعي، هويات بصرية، ومواد ترويجية للسوشيال ميديا.'
      },
      tools: ['Photoshop', 'Illustrator', 'Canva Pro'],
      icon: 'Palette'
    },
    {
      id: 'sk-3',
      title: { en: 'AI OPERATIONS', bn: 'এআই অপারেশন্স', ar: 'تطبيقات الذكاء الاصطناعي' },
      description: {
        en: 'AI-powered creative workflows, automation, productivity and modern AI tools.',
        bn: 'এআই চালিত ক্রিয়েটিভ ওয়ার্কফ্লো, অটোমেশন, প্রোডাক্টিভিটি ও আধুনিক এআই টুলস।',
        ar: 'سير عمل إبداعي معزز بالذكاء الاصطناعي، أتمتة، وإنتاجية عبر أحدث الأدوات.'
      },
      tools: ['AI Tools', 'Prompt Engineering', 'AI Workflows'],
      icon: 'Sparkles'
    },
    {
      id: 'sk-4',
      title: { en: 'DIGITAL MARKETING', bn: 'ডিজিটাল মার্কেটিং', ar: 'التسويق الرقمي' },
      description: {
        en: 'Digital marketing strategy, online promotion, audience growth and campaign management.',
        bn: 'ডিজিটাল মার্কেটিং স্ট্র্যাটেজি, অনলাইন প্রমোশন, অডিয়েন্স গ্রোথ ও ক্যাম্পেইন পরিচালনা।',
        ar: 'استراتيجيات التسويق الرقمي، الترويج الإلكتروني، زيادة الجمهور وإدارة الحملات.'
      },
      tools: ['Facebook Ads', 'Instagram Ads', 'Digital Strategy'],
      icon: 'TrendingUp'
    },
    {
      id: 'sk-5',
      title: { en: 'CREATIVE VISUALIZATION', bn: 'ক্রিয়েটিভ ভিজ্যুয়ালাইজেশন', ar: 'التصور البصري الإبداعي' },
      description: {
        en: 'Concept development, visual storytelling and information visualization.',
        bn: 'কনসেপ্ট ডেভেলপমেন্ট, ভিজ্যুয়াল স্টোরিটেলিং এবং ইনফরমেশন ভিজ্যুয়ালাইজেশন।',
        ar: 'تطوير المفاهيم، السرد القصصي البصري، وتنظيم وتصوير المعلومات.'
      },
      tools: ['Concept Art', 'Visual Pacing'],
      icon: 'Layers'
    },
    {
      id: 'sk-6',
      title: { en: 'SCRIPT WRITING', bn: 'স্ক্রিপ্ট রাইটিং', ar: 'كتابة السيناريو' },
      description: {
        en: 'Video scripts, promotional content, storytelling and voice-over scripts.',
        bn: 'ভিডিও স্ক্রিপ্ট, প্রমোশনাল কনটেন্ট, স্টোরিটেলিং ও ভয়েস-ওভার স্ক্রিপ্ট।',
        ar: 'سيناريوهات الفيديو، المحتوى الترويجي، السرد القصصي ونصوص التعليق الصوتي.'
      },
      tools: ['Storyboards', 'Voiceover Scripts'],
      icon: 'PenTool'
    },
    {
      id: 'sk-7',
      title: { en: 'OFFICE, DATA ENTRY & OS', bn: 'অফিস ম্যানেজমেন্ট, ডেটা এন্ট্রি ও ওএস', ar: 'إدارة المكاتب وإدخال البيانات' },
      description: {
        en: 'Administrative documentation, report preparation, basic accounts management, and multi-OS operation.',
        bn: 'অফিস ডকুমেন্টেশন, রিপোর্ট তৈরি, দৈনিক আর্থিক হিসাব ও একাধিক অপারেটিং সিস্টেমে দক্ষ পরিচালনা।',
        ar: 'التوثيق الإداري، إعداد التقارير، الحسابات الأساسية، والعمل على أنظمة التشغيل المتعددة.'
      },
      tools: ['Microsoft Office', 'Google Sheets', 'Data Entry', 'Windows / macOS / Linux'],
      icon: 'Layers'
    }
  ],
  workflow: [
    { id: 'wf-1', step: '01', title: { en: 'Idea', bn: 'আইডিয়া', ar: 'الفكرة' }, order: 1 },
    { id: 'wf-2', step: '02', title: { en: 'Design', bn: 'ডিজাইন', ar: 'التصميم' }, order: 2 },
    { id: 'wf-3', step: '03', title: { en: 'Edit', bn: 'এডিট', ar: 'المونتاج' }, order: 3 },
    { id: 'wf-4', step: '04', title: { en: 'Motion', bn: 'মোশন', ar: 'التحريك' }, order: 4 },
    { id: 'wf-5', step: '05', title: { en: 'Marketing', bn: 'মার্কেটিং', ar: 'التسويق' }, order: 5 },
    { id: 'wf-6', step: '06', title: { en: 'Final Content', bn: 'চূড়ান্ত কনটেন্ট', ar: 'المخرج النهائي' }, order: 6 }
  ],
  showWorkflow: true,
  projects: [
    {
      id: 'proj-graphic-1',
      groupName: {
        en: 'Brand Identity',
        bn: 'ব্র্যান্ড আইডেন্টিটি',
        ar: 'الهوية البصرية'
      },
      title: {
        en: 'Brand Identity & Visual Poster Series',
        bn: 'ব্র্যান্ড আইডেন্টিটি এবং ভিজ্যুয়াল পোস্টার সিরিজ',
        ar: 'الهوية البصرية وسلسلة البوسترات الاحترافية'
      },
      category: 'graphic',
      description: {
        en: 'Modern typography, vector compositions, and brand identity design crafted in Photoshop and Illustrator.',
        bn: 'আধুনিক টাইপোগ্রাফি, ভেক্টর কম্পোজিশন এবং ফটোশপ ও ইলাস্ট্রেটরে তৈরি ব্র্যান্ড আইডেন্টিটি ডিজাইন।',
        ar: 'تصميم هوية بصرية متميزة مع طباعة حديثة وتكوينات فكتور مصممة عبر فوتوشوب وإليستريتور.'
      },
      coverImage: '',
      galleryImages: [],
      behanceUrl: 'https://www.behance.net/jaberhosain',
      externalUrl: 'https://www.behance.net/jaberhosain',
      tags: ['Graphic Design', 'Branding', 'Photoshop'],
      order: 1,
      isPlaceholder: false
    },
    {
      id: 'proj-graphic-2',
      groupName: {
        en: 'Social Media & Posters',
        bn: 'সোশ্যাল মিডিয়া ও পোস্টার',
        ar: 'السوشيال ميديا والبوسترات'
      },
      title: {
        en: 'Social Media Visuals & Creative Thumbnails',
        bn: 'সোশ্যাল মিডিয়া ভিজ্যুয়ালস এবং ক্রিয়েটিভ থাম্বনেইল',
        ar: 'تصاميم السوشيال ميديا والمصغرات الإبداعية'
      },
      category: 'graphic',
      description: {
        en: 'High-converting YouTube thumbnails, event flyers, and campaign graphics optimized for audience engagement.',
        bn: 'হাই-কনভার্টিং ইউটিউব থাম্বনেইল, ইভেন্ট ফ্লায়ার এবং অডিয়েন্স এনগেজমেন্টের জন্য প্রস্তুত ক্যাম্পেইন গ্রাফিক্স।',
        ar: 'تصاميم مصغرات يوتيوب ومنشورات ترويجية عالية الجاذبية لزيادة التفاعل والمشاهدات.'
      },
      coverImage: '',
      galleryImages: [],
      behanceUrl: 'https://www.behance.net/jaberhosain',
      externalUrl: 'https://www.behance.net/jaberhosain',
      tags: ['Social Media', 'Thumbnails', 'Illustrator'],
      order: 2,
      isPlaceholder: false
    },
    {
      id: 'proj-placeholder-1',
      title: {
        en: 'Video Project 1',
        bn: 'ভিডিও প্রজেক্ট ১',
        ar: 'مشروع فيديو 1'
      },
      category: 'video',
      description: {
        en: 'Client details — Watch on Vimeo / YouTube [Add details from admin panel]',
        bn: 'ক্লায়েন্ট বিবরণ — ভিমিও / ইউটিউবে দেখুন [অ্যাডমিন প্যানেল থেকে তথ্য যুক্ত করুন]',
        ar: 'تفاصيل العميل — مشاهدة على يوتيوب / فيميو [أضف التفاصيل من لوحة التحكم]'
      },
      coverImage: '',
      behanceUrl: 'https://www.behance.net/jaberhosain',
      videoUrl: '',
      tags: ['Video Editing', 'Premiere Pro'],
      order: 1,
      isPlaceholder: true
    },
    {
      id: 'proj-placeholder-2',
      title: {
        en: 'Video Project 2',
        bn: 'ভিডিও প্রজেক্ট ২',
        ar: 'مشروع فيديو ২'
      },
      category: 'video',
      description: {
        en: 'Client details — Watch on Vimeo / YouTube [Add details from admin panel]',
        bn: 'ক্লায়েন্ট বিবরণ — ভিমিও / ইউটিউবে দেখুন [অ্যাডমিন প্যানেল থেকে তথ্য যুক্ত করুন]',
        ar: 'تفاصيل العميل — مشاهدة على يوتيوب / فيميو [أضف التفاصيل من لوحة التحكم]'
      },
      coverImage: '',
      behanceUrl: 'https://www.behance.net/jaberhosain',
      videoUrl: '',
      tags: ['Video Editing'],
      order: 2,
      isPlaceholder: true
    }
  ],
  videos: [
    {
      id: 'fb-vid-1',
      title: {
        en: '',
        bn: '',
        ar: ''
      },
      description: {
        en: '',
        bn: '',
        ar: ''
      },
      videoType: 'facebook',
      videoUrl: 'https://www.facebook.com/share/p/1DNfXJTmTK/',
      thumbnailUrl: '',
      customThumbnailUrl: '',
      order: 1
    },
    {
      id: 'fb-vid-2',
      title: {
        en: '',
        bn: '',
        ar: ''
      },
      description: {
        en: '',
        bn: '',
        ar: ''
      },
      videoType: 'facebook',
      videoUrl: 'https://www.facebook.com/share/v/19XfdDJYTf/',
      thumbnailUrl: '',
      customThumbnailUrl: '',
      order: 2
    },
    {
      id: 'fb-vid-3',
      title: {
        en: '',
        bn: '',
        ar: ''
      },
      description: {
        en: '',
        bn: '',
        ar: ''
      },
      videoType: 'facebook',
      videoUrl: 'https://www.facebook.com/share/v/1KVWkbFLLP/',
      thumbnailUrl: '',
      customThumbnailUrl: '',
      order: 3
    }
  ],
  bestGraphicWorks: [
    {
      id: 'best-graphic-1',
      title: {
        en: 'Brand Identity & Visual Poster Series',
        bn: 'ব্র্যান্ড আইডেন্টিটি এবং ভিজ্যুয়াল পোস্টার সিরিজ',
        ar: 'الهوية البصرية وسلسلة البوسترات الاحترافية'
      },
      imageUrl: '',
      behanceUrl: 'https://www.behance.net/jaberhosain',
      order: 1,
      visible: true
    },
    {
      id: 'best-graphic-2',
      title: {
        en: 'Social Media Visuals & Creative Thumbnails',
        bn: 'সোশ্যাল মিডিয়া ভিজ্যুয়ালস এবং ক্রিয়েটিভ থাম্বনেইল',
        ar: 'تصاميم السوشيال ميديا والمصغرات الإبداعية'
      },
      imageUrl: '',
      behanceUrl: 'https://www.behance.net/jaberhosain',
      order: 2,
      visible: true
    }
  ],
  bestVideoWorks: [
    {
      id: 'best-vid-1',
      title: { en: '', bn: '', ar: '' },
      videoType: 'facebook',
      videoUrl: 'https://www.facebook.com/share/p/1DNfXJTmTK/',
      thumbnailUrl: '',
      customThumbnailUrl: '',
      order: 1,
      visible: true
    },
    {
      id: 'best-vid-2',
      title: { en: '', bn: '', ar: '' },
      videoType: 'facebook',
      videoUrl: 'https://www.facebook.com/share/v/19XfdDJYTf/',
      thumbnailUrl: '',
      customThumbnailUrl: '',
      order: 2,
      visible: true
    },
    {
      id: 'best-vid-3',
      title: { en: '', bn: '', ar: '' },
      videoType: 'facebook',
      videoUrl: 'https://www.facebook.com/share/v/1KVWkbFLLP/',
      thumbnailUrl: '',
      customThumbnailUrl: '',
      order: 3,
      visible: true
    }
  ],
  bestGraphicSection: {
    sectionTag: { en: 'TOP GRAPHIC DESIGN', bn: 'সেরা গ্রাফিক্স ডিজাইন', ar: 'أفضل تصاميم الجرافيك' },
    title: { en: 'GRAPHIC DESIGN - BEST WORK', bn: 'গ্রাফিক ডিজাইন - সেরা কাজ', ar: 'التصميم الجرافيكي - أفضل الأعمال' },
    subtitle: {
      en: 'Curated selection of my top graphic design projects, brand visuals, and creative posters.',
      bn: 'আমার নির্বাচিত সেরা গ্রাফিক্স ডিজাইন প্রজেক্ট, ব্র্যান্ড ভিজ্যুয়াল ও পোস্টার।',
      ar: 'مجموعة مختارة من أفضل تصاميم الجرافيك والهويات البصرية والبوسترات الإبداعية.'
    }
  },
  bestVideoSection: {
    sectionTag: { en: 'FEATURED SHOWCASE', bn: 'ফিচার্ড শোকেস', ar: 'معرض الأعمال المميزة' },
    title: { en: 'WATCH MY BEST WORK', bn: 'আমার সেরা ভিডিও কাজ দেখুন', ar: 'شاهد أفضل أعمالي في المونتاج' },
    subtitle: {
      en: 'Handpicked video edits, visual sequences, and creative projects crafted with Premiere Pro and After Effects.',
      bn: 'প্রিমিয়ার প্রো ও আফটার ইফেক্টসে তৈরি করা আমার নির্বাচিত সেরা ভিডিও এডিটিং কাজ।',
      ar: 'مجموعة منتقاة من أفضل أعمال المونتاج والمؤثرات البصرية المُنتجة ببرامج أدوبي.'
    }
  },
  channelLinks: [
    {
      id: 'ch-youtube',
      platform: 'YouTube',
      badge: { en: 'VIDEO EDITING PROOF', bn: 'ভিডিও এডিটিং প্রুফ', ar: 'إثبات أعمال المونتاج' },
      description: {
        en: 'Video editing projects, visual cuts, sequence pacing, and video tutorials.',
        bn: 'ভিডিও এডিটিং প্রজেক্ট, ভিজ্যুয়াল কাট, সিকোয়েন্স পেসিং ও ভিডিও টিউটোরিয়াল।',
        ar: 'مشاريع مونتاج الفيديو، القطعات البصرية، الإيقاع وشروحات الفيديو.'
      },
      status: 'UNLINKED',
      url: '',
      icon: 'Youtube'
    },
    {
      id: 'ch-behance',
      platform: 'Behance',
      badge: { en: 'GRAPHIC DESIGN SHOWCASE', bn: 'গ্রাফিক ডিজাইন শোকেস', ar: 'معرض التصميم الجرافيكي' },
      description: {
        en: 'Graphic design showcase, poster layouts, visual branding, and social posts.',
        bn: 'গ্রাফিক ডিজাইন শোকেস, পোস্টার লেআউট, ভিজ্যুয়াল ব্র্যান্ডিং ও সোশ্যাল পোস্ট।',
        ar: 'معرض تصاميم الجرافيك، تخطيط البوسترات، الهويات البصرية ومنشورات السوشيال.'
      },
      status: 'LINKED',
      url: 'https://www.behance.net/jaberhosain',
      icon: 'Behance'
    },
    {
      id: 'ch-facebook',
      platform: 'Facebook',
      badge: { en: 'SOCIAL COMMUNITY', bn: 'সোশ্যাল কমিউনিটি', ar: 'المجتمع الرقمي' },
      description: {
        en: 'Creative project updates, social media posts, design previews, and outreach.',
        bn: 'ক্রিয়েটিভ প্রজেক্ট আপডেট, সোশ্যাল মিডিয়া পোস্ট, ডিজাইন প্রিভিউ ও যোগাযোগ।',
        ar: 'تحديثات المشاريع الإبداعية، منشورات السوشيال ميديا، ومعاينات التصاميم.'
      },
      status: 'UNLINKED',
      url: '',
      icon: 'Facebook'
    },
    {
      id: 'ch-drive',
      platform: 'Google Drive',
      badge: { en: 'SOURCE FILES & VAULT', bn: 'সোর্স ফাইলস ও ভল্ট', ar: 'ملفات المصدر والمجلد السحابي' },
      description: {
        en: 'Direct link to raw video render samples, PSD/AI design sources, work archives.',
        bn: 'র ভিডিও রেন্ডার স্যাম্পল, পিএসডি/এআই ডিজাইন সোর্স এবং কাজের আর্কাইভ।',
        ar: 'رابط مباشر لعينات الفيديو الخام، ملفات المصدر المفتوحة وأرشيف الأعمال.'
      },
      status: 'UNLINKED',
      url: '',
      icon: 'Folder'
    },
    {
      id: 'ch-telegram',
      platform: 'Telegram',
      badge: { en: 'CHANNEL & RESOURCES', bn: 'চ্যানেল ও রিসোর্সেস', ar: 'القناة والمصادر' },
      description: {
        en: 'Announcements, creative asset shares, video editing packs, and updates.',
        bn: 'ঘোষণা, ক্রিয়েটিভ অ্যাসেট শেয়ার, ভিডিও এডিটিং প্যাক এবং নিয়মিত আপডেট।',
        ar: 'الإعلانات، مشاركة الملحقات الإبداعية، حزم المونتاج وأحدث التحديثات.'
      },
      status: 'LINKED',
      url: 'https://t.me/jaberhosain',
      icon: 'Send'
    }
  ],
  testimonials: [
    {
      id: 't-1',
      clientName: 'Creative Agency Partner',
      clientRole: { en: 'Content Director', bn: 'কনটেন্ট ডিরেক্টর', ar: 'مدير محتوى' },
      rating: 5,
      quote: {
        en: 'Jaber transformed our raw footage into crisp, high-retention reels. His pacing, sound design, and attention to detail made our brand look truly international.',
        bn: 'জাবিরের ভিডিও এডিটিং পেসিং এবং সাউন্ড ডিজাইন আমাদের রিলস ও প্রোমো ভিডিওর রিটেনশন সম্পূর্ণ বদলে দিয়েছে। সময়মতো ডেলিভারি ও চমৎকার কমিউনিকেশন।',
        ar: 'حوّل جابر لقطاتنا الخام إلى مقاطع ريلز احترافية عالية الجاذبية، مع التزام تام بالمواعيد وتواصل رائع.'
      },
      visible: true,
      order: 1
    },
    {
      id: 't-2',
      clientName: 'Brand Founder',
      clientRole: { en: 'E-Commerce & Meta Campaigns', bn: 'ই-কমার্স ও মেটা ক্যাম্পেইন', ar: 'التجارة الإلكترونية وحملات ميتا' },
      rating: 5,
      quote: {
        en: 'The poster series and ad visuals Jaber designed gave our campaign a distinct, premium look. Click-through rates improved immediately after launch.',
        bn: 'আমাদের ব্র্যান্ডের পোস্টার সিরিজ এবং সোশ্যাল মিডিয়া অ্যাড ক্রিয়েটিভগুলো দর্শকদের নজর কেড়েছে। ডিজাইনের কালার ও টাইপোগ্রাফি ছিল একদম প্রিমিয়াম।',
        ar: 'أعطت تصاميم البوسترات والإعلانات التي صممها جابر لحملتنا مظهراً مميزاً، مما رفع معدل النقر فوراً.'
      },
      visible: true,
      order: 2
    },
    {
      id: 't-3',
      clientName: 'Digital Creator',
      clientRole: { en: 'YouTube & Social Media', bn: 'ইউটিউব ও সোশ্যাল মিডিয়া', ar: 'يوتيوب ومنصات التواصل' },
      rating: 5,
      quote: {
        en: 'Reliable, creative, and fast. Whether it is After Effects motion graphics or scroll-stopping thumbnails, Jaber consistently delivers beyond expectations.',
        bn: 'থাম্বনেইল ডিজাইন থেকে শুরু করে মোশন গ্রাফিক্স—প্রতিটি কাজে জাবিরের সৃজনশীলতা এবং প্রফেশনালিজম প্রশংসনীয়।',
        ar: 'موثوق ومبدع وسريع في الإنجاز، سواء في الموشن جرافيك أو الصور المصغرة الاحترافية.'
      },
      visible: true,
      order: 3
    }
  ],
  googleSheetWebhookUrl: '',
  socialLinks: [
    {
      id: 'soc-tg-contact',
      platform: 'telegram',
      name: 'Telegram (Contact)',
      url: 'https://t.me/sbmc3925',
      icon: 'telegram',
      enabled: true,
      order: 1
    },
    {
      id: 'soc-tg-channel',
      platform: 'telegram',
      name: 'Telegram (Channel)',
      url: 'https://t.me/jaberhosain',
      icon: 'telegram',
      enabled: true,
      order: 2
    },
    {
      id: 'soc-be',
      platform: 'behance',
      name: 'Behance',
      url: 'https://www.behance.net/jaberhosain',
      icon: 'behance',
      enabled: true,
      order: 3
    },
    {
      id: 'soc-fb',
      platform: 'facebook',
      name: 'Facebook',
      url: '',
      icon: 'facebook',
      enabled: false,
      order: 4
    },
    {
      id: 'soc-yt',
      platform: 'youtube',
      name: 'YouTube',
      url: '',
      icon: 'youtube',
      enabled: false,
      order: 5
    }
  ],
  theme: {
    colors: {
      background: '#0B0F12',
      surface: '#12161A',
      primary: '#FF5722',
      secondary: '#181E24',
      accent: '#FF5722',
      text: '#F3F4F6',
      textMuted: '#9CA3AF',
      border: '#232B33'
    },
    fonts: {
      bangla: 'Li Ador Noirrit',
      english: 'Plus Jakarta Sans',
      arabic: 'Cairo'
    },
    availableThemes: ['dark', 'light', 'blue', 'green', 'purple', 'warm', 'custom']
  },
  branding: {
    title: 'MD JABER HOSAIN | Creative Portfolio',
    logoText: 'MD JABER HOSAIN',
    logoInitials: 'MJ'
  },
  contact: {
    email: 'sbmc.3925@gmail.com',
    facebookUrl: '',
    telegramUrl: 'https://t.me/sbmc3925',
    behanceUrl: 'https://www.behance.net/jaberhosain',
    youtubeUrl: ''
  }
};

export const defaultThemeColors = {
  background: '#121419',
  surface: '#181B22',
  primary: '#E4583B',
  secondary: '#20242E',
  accent: '#F07C63',
  text: '#F4F0E8',
  textMuted: '#A7A298',
  border: '#2B303D'
};

export const defaultThemeFonts = {
  bangla: 'Li Ador Noirrit',
  english: 'Plus Jakarta Sans',
  arabic: 'Cairo'
};

export const defaultSocialLinks: SocialLinkItem[] = initialPortfolioData.socialLinks || [];

