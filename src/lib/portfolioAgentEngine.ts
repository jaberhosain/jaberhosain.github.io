import { PortfolioConfig, Language, LocalizedText } from '../types/portfolio';

export interface AgentAction {
  label: string;
  type: 'navigate' | 'external';
  target: string;
}

export interface AgentReply {
  text: string;
  actions?: AgentAction[];
}

function pickLoc(text: LocalizedText | string | undefined, lang: Language): string {
  if (!text) return '';
  if (typeof text === 'string') return text;
  return text[lang] || text.en || text.bn || text.ar || '';
}

export function detectQueryLanguage(query: string, fallback: Language): Language {
  if (/[\u0980-\u09FF]/.test(query)) return 'bn';
  if (/[\u0600-\u06FF]/.test(query)) return 'ar';
  if (/[a-zA-Z]/.test(query)) {
    // Check common Banglish words
    const lower = query.toLowerCase();
    const banglishHints = [
      'kemon', 'kivabe', 'koto', 'ache', 'korbo', 'koren', 'dekhao', 'chobi',
      'kaj', 'jogajog', 'thikana', 'ke', 'tumi', 'apni', 'vai', 'bhai'
    ];
    if (banglishHints.some((w) => new RegExp(`\\b${w}\\b`, 'i').test(lower))) {
      return fallback === 'bn' ? 'bn' : 'en';
    }
    return 'en';
  }
  return fallback;
}

/**
 * Builds a concise portfolio context summary to send to the server-side Gemini model
 * so it always reflects the live Firestore portfolio state.
 */
export function buildPortfolioKnowledgeSummary(portfolio: PortfolioConfig): string {
  const name = portfolio.hero?.name?.en || 'MD. Jaber Hosain';
  const tagline = portfolio.hero?.tagline?.en || 'Creative Video Editor & Graphic Designer';
  const bioEn = portfolio.about?.bio?.en || '';
  const bioBn = portfolio.about?.bio?.bn || '';

  const services = (portfolio.services || [])
    .map((s) => `- ${s.title?.en} (${s.title?.bn}): ${s.description?.en}`)
    .join('\n');

  const skills = (portfolio.skills || [])
    .map((sk) => `- ${sk.title?.en}: ${(sk.tools || []).join(', ')}`)
    .join('\n');

  const institutes = (portfolio.professionalInstitutes || [])
    .map((inst) => `- ${inst.institution?.en} | ${inst.course?.en} (${inst.batch})`)
    .join('\n');

  const academics = (portfolio.academicRecords || [])
    .map((ac) => `- ${ac.title?.en} (${ac.year}): ${ac.status?.en}`)
    .join('\n');

  const graphicProjects = (portfolio.projects || [])
    .filter((p: any) => p.category === 'graphic' && p.visible !== false && !p.hidden)
    .map((p) => {
      const group = p.groupName?.en ? `[Group: ${p.groupName.en}] ` : '';
      const posterCount = (p.galleryImages?.length || 0) + (p.coverImage ? 1 : 0);
      return `- ${group}${p.title?.en || 'Graphic Work'} (${posterCount} poster(s)) ${p.behanceUrl ? `| Behance: ${p.behanceUrl}` : ''}`;
    })
    .join('\n');

  const bestGraphics = (portfolio.bestGraphicWorks || [])
    .filter((g) => g.visible !== false)
    .map((g) => `- ${g.title?.en}`)
    .join('\n');

  const videoCount =
    (portfolio.videos || []).filter((v: any) => v.visible !== false && !v.hidden).length +
    (portfolio.bestVideoWorks || []).filter((v: any) => v.visible !== false).length;

  const email = portfolio.contact?.email || 'sbmc.3925@gmail.com';
  const telegram = portfolio.contact?.telegramUrl || 'https://t.me/sbmc3925';
  const behance = portfolio.contact?.behanceUrl || 'https://www.behance.net/jaberhosain';

  return [
    `Owner Name: ${name}`,
    `Role / Tagline: ${tagline}`,
    `About (EN): ${bioEn}`,
    `About (BN): ${bioBn}`,
    `Services:\n${services}`,
    `Skills & Tools:\n${skills}`,
    `Professional Training:\n${institutes}`,
    `Academic Education:\n${academics}`,
    `Video Portfolio Count: ${videoCount} published videos (Reels, Documentary, Motion Graphics, Commercial edits)`,
    `Graphic Design Projects:\n${graphicProjects || 'Brand Identity, Social Media Visuals, Posters & Thumbnails'}`,
    `Best Graphic Works:\n${bestGraphics}`,
    `Contact Info: Email: ${email} | Telegram: ${telegram} | Behance: ${behance}`
  ].join('\n\n');
}

/**
 * Infers contextual action buttons based on the user's question and assistant reply.
 */
export function inferAgentActions(userQuery: string, replyText: string, portfolio: PortfolioConfig, lang: Language): AgentAction[] {
  const combined = `${userQuery} ${replyText}`.toLowerCase();
  const actions: AgentAction[] = [];

  const isVideo = /video|edit|premiere|after effects|reel|vimeo|youtube|ভিডিও|এডিটিং|مونتاج|فيديو/.test(combined);
  const isGraphic = /graphic|design|poster|behance|thumbnail|logo|brand|photoshop|illustrator|গ্রাফিক|ডিজাইন|পোস্টার|বিহান্স|বিহ্যান্স|تصميم|جرافيك|بوستر/.test(combined);
  const isContact = /contact|hire|email|telegram|price|cost|work together|message|যোগাযোগ|হায়ার|ইমেইল|টেলিগ্রাম|কাজ|প্রজেক্ট|تواصل|عمل/.test(combined);
  const isSkill = /skill|tool|software|workflow|service|দক্ষতা|স্কিল|টুল|সেবা|مهارات|أدوات/.test(combined);
  const isEdu = /education|study|institute|course|sbmc|sunnah|about|who|শিক্ষা|কোর্স|সম্পর্কে|কে|تعليم|من هو/.test(combined);

  if (isVideo) {
    actions.push({
      label: lang === 'bn' ? 'ভিডিও পোর্টফোলিও দেখুন' : lang === 'ar' ? 'معرض الفيديو' : 'Open Video Portfolio',
      type: 'navigate',
      target: 'videos'
    });
  }

  if (isGraphic) {
    actions.push({
      label: lang === 'bn' ? 'গ্রাফিক ডিজাইন গ্যালারি' : lang === 'ar' ? 'معرض التصميم' : 'Open Design Gallery',
      type: 'navigate',
      target: 'design'
    });
    const behanceUrl = portfolio.contact?.behanceUrl || 'https://www.behance.net/jaberhosain';
    actions.push({
      label: lang === 'bn' ? 'Behance প্রোফাইল' : 'Behance Profile',
      type: 'external',
      target: behanceUrl
    });
  }

  if (isSkill && actions.length < 3) {
    actions.push({
      label: lang === 'bn' ? 'দক্ষতা ও টুলস দেখুন' : lang === 'ar' ? 'المهارات والأدوات' : 'View Skills & Tools',
      type: 'navigate',
      target: 'skills'
    });
  }

  if (isEdu && actions.length < 3) {
    actions.push({
      label: lang === 'bn' ? 'শিক্ষা ও পরিচিতি' : lang === 'ar' ? 'نبذة وتعليم' : 'About & Education',
      type: 'navigate',
      target: 'about'
    });
  }

  if (isContact || actions.length === 0) {
    actions.push({
      label: lang === 'bn' ? 'যোগাযোগ পেজ' : lang === 'ar' ? 'صفحة التواصل' : 'Contact Page',
      type: 'navigate',
      target: 'contact'
    });
    const tg = portfolio.contact?.telegramUrl || 'https://t.me/sbmc3925';
    actions.push({
      label: lang === 'bn' ? 'টেলিগ্রামে মেসেজ দিন' : 'Message on Telegram',
      type: 'external',
      target: tg
    });
  }

  return actions.slice(0, 3);
}

/**
 * Built-in local portfolio intelligence fallback so the AI Agent works 100% reliably
 * even on static GitHub Pages (jaberhosain.github.io) or when offline/serverless.
 */
export function generateLocalPortfolioReply(
  query: string,
  portfolio: PortfolioConfig,
  siteLang: Language
): AgentReply {
  const lang = detectQueryLanguage(query, siteLang);
  const q = query.toLowerCase();

  const name = pickLoc(portfolio.hero?.name, lang) || 'MD. Jaber Hosain';
  const email = portfolio.contact?.email || 'sbmc.3925@gmail.com';
  const tg = portfolio.contact?.telegramUrl || 'https://t.me/sbmc3925';
  const behance = portfolio.contact?.behanceUrl || 'https://www.behance.net/jaberhosain';

  const graphicProjects = (portfolio.projects || []).filter(
    (p: any) => p.category === 'graphic' && p.visible !== false && !p.hidden
  );
  const bestGraphics = (portfolio.bestGraphicWorks || []).filter((g) => g.visible !== false);
  const videoCount =
    (portfolio.videos || []).filter((v: any) => v.visible !== false && !v.hidden).length +
    (portfolio.bestVideoWorks || []).filter((v: any) => v.visible !== false).length;

  // 1. Video Editing query
  if (/video|edit|premiere|after effects|reel|short|documentary|ভিডিও|এডিট|রিল|مونتاج|فيديو/.test(q)) {
    const text =
      lang === 'bn'
        ? `${name} পেশাদার ভিডিও এডিটিং এবং মোশন গ্রাফিক্স নিয়ে কাজ করেন। তিনি Adobe Premiere Pro ও After Effects ব্যবহার করে রিলস, ডকুমেন্টারি, প্রমোশনাল ভিডিও এবং স্টোরিটেলিং সিকোয়েন্স তৈরি করেন। বর্তমানে পোর্টফোলিওতে ${videoCount}টি ভিডিও যুক্ত আছে—আপনি নিচের বাটনে ক্লিক করে সরাসরি ভিডিও পোর্টফোলিও দেখতে পারেন।`
        : lang === 'ar'
        ? `يعمل ${name} في مونتاج الفيديو الاحترافي والموشن جرافيك باستخدام Adobe Premiere Pro و After Effects. يمكنك تصفح ${videoCount} أعمال فيديو مباشرة من معرض الفيديو.`
        : `${name} specializes in professional video editing, motion graphics, reels, and cinematic storytelling using Adobe Premiere Pro and After Effects. There are currently ${videoCount} curated videos in the portfolio—click below to watch them.`;
    return {
      text,
      actions: inferAgentActions(query, text, portfolio, lang)
    };
  }

  // 2. Graphic Design / Behance / Poster query
  if (/graphic|design|poster|behance|thumbnail|brand|logo|photoshop|illustrator|গ্রাফিক|ডিজাইন|পোস্টার|বিহান্স|বিহ্যান্স|থাম্বনেইল|تصميم|جرافيك|بوستر/.test(q)) {
    const projectNames = graphicProjects
      .slice(0, 4)
      .map((p) => pickLoc(p.groupName, lang) || pickLoc(p.title, lang))
      .filter(Boolean)
      .join(', ');

    const text =
      lang === 'bn'
        ? `${name} Adobe Photoshop, Illustrator ও Canva Pro ব্যবহার করে ক্রিয়েটিভ পোস্টার, ব্র্যান্ড আইডেন্টিটি, সোশ্যাল মিডিয়া ভিজ্যুয়াল এবং ইউটিউব থাম্বনেইল ডিজাইন করেন।${
            projectNames ? ` উল্লেখযোগ্য প্রজেক্ট গ্রুপ: ${projectNames}।` : ''
          } আপনি গ্যালারিতে গ্রুপ অনুযায়ী বা সব পোস্টার একসাথে দেখতে পারেন এবং Behance প্রোফাইলও ভিজিট করতে পারেন।`
        : lang === 'ar'
        ? `يصمم ${name} البوسترات الإبداعية، الهويات البصرية، ومصغرات اليوتيوب عبر Photoshop و Illustrator و Canva Pro. يمكنك استكشاف المجموعات في معرض التصميم أو عبر Behance.`
        : `${name} crafts high-impact posters, brand identities, social media campaigns, and YouTube thumbnails using Photoshop, Illustrator, and Canva Pro.${
            projectNames ? ` Featured groups include: ${projectNames}.` : ''
          } You can browse works group-wise or inspect individual posters in the Design Gallery.`;
    return {
      text,
      actions: inferAgentActions(query, text, portfolio, lang)
    };
  }

  // 3. Contact / Hiring / Pricing query
  if (/contact|hire|price|rate|cost|project|email|telegram|phone|reach|যোগাযোগ|হায়ার|কাজ|অর্ডার|ইমেইল|টেলিগ্রাম|প্রাইস|কত|تواصل|سعر|عمل/.test(q)) {
    const text =
      lang === 'bn'
        ? `${name}-এর সাথে প্রজেক্ট বা কাজের বিষয়ে সরাসরি যোগাযোগ করতে পারেন:\n• ইমেইল: ${email}\n• টেলিগ্রাম: ${tg}\n• অথবা ওয়েবসাইটের Contact পেজের ফর্ম পূরণ করে আপনার প্রজেক্টের বিস্তারিত পাঠাতে পারেন।`
        : lang === 'ar'
        ? `يمكنك التواصل مباشرة مع ${name} لمناقشة مشروعك عبر:\n• البريد الإلكتروني: ${email}\n• تيليجرام: ${tg}\n• أو عبر نموذج صفحة التواصل في الموقع.`
        : `You can reach ${name} directly for video editing or graphic design projects:\n• Email: ${email}\n• Telegram: ${tg}\n• Or send a direct inquiry through the Contact page form.`;
    return {
      text,
      actions: inferAgentActions(query, text, portfolio, lang)
    };
  }

  // 4. Skills / Software / Tools query
  if (/skill|tool|software|ai|marketing|দক্ষতা|স্কিল|টুল|সফটওয়্যার|মার্কেটিং|مهارات|أدوات/.test(q)) {
    const skillSummary = (portfolio.skills || [])
      .map((s) => `${pickLoc(s.title, lang)} (${(s.tools || []).join(', ')})`)
      .join(' · ');

    const text =
      lang === 'bn'
        ? `${name}-এর মূল দক্ষতা ও টুলস:\n${skillSummary || 'Video Editing (Premiere Pro, After Effects), Graphic Design (Photoshop, Illustrator, Canva Pro), Meta Marketing ও AI Operations'}।`
        : lang === 'ar'
        ? `المهارات والأدوات الرئيسية لـ ${name}:\n${skillSummary}`
        : `${name}'s core skills and software stack include:\n${skillSummary || 'Video Editing (Premiere Pro, After Effects), Graphic Design (Photoshop, Illustrator, Canva Pro), Digital Marketing, and AI Operations'}.`;
    return {
      text,
      actions: inferAgentActions(query, text, portfolio, lang)
    };
  }

  // 5. Education / Institute / Bio query
  if (/education|study|institute|course|sbmc|sunnah|about|who|bio|শিক্ষা|পড়াশোনা|কোর্স|আস-সুন্নাহ|সম্পর্কে|কে আপনি|তুমি কে|تعليم|من هو|نبذة/.test(q)) {
    const bio = pickLoc(portfolio.about?.bio, lang);
    const inst = portfolio.professionalInstitutes?.[0] || portfolio.professionalInstitute;
    const instText = inst
      ? `${pickLoc(inst.institution, lang)} — ${pickLoc(inst.course, lang)} (${inst.batch})`
      : '';

    const text =
      lang === 'bn'
        ? `${bio}${instText ? `\n\nপ্রফেশনাল প্রশিক্ষণ: ${instText}।` : ''}`
        : lang === 'ar'
        ? `${bio}${instText ? `\n\nالتدريب المهني: ${instText}.` : ''}`
        : `${bio}${instText ? `\n\nProfessional Training: ${instText}.` : ''}`;
    return {
      text,
      actions: inferAgentActions(query, text, portfolio, lang)
    };
  }

  // 6. General Greeting / Default helpful overview
  const text =
    lang === 'bn'
      ? `আসসালামু আলাইকুম! আমি ${name}-এর পোর্টফোলিও এআই এজেন্ট। আমি আপনাকে তাঁর **ভিডিও এডিটিং**, **গ্রাফিক ডিজাইন ও বিহ্যান্স পোস্টার গ্রুপ**, **দক্ষতা ও টুলস**, অথবা **নতুন প্রজেক্টের জন্য যোগাযোগ** করার বিষয়ে সাহায্য করতে পারি। আপনি কোন বিষয়ে জানতে চান?`
      : lang === 'ar'
      ? `أهلاً بك! أنا المساعد الذكي لمعرض أعمال ${name}. يمكنني مساعدتك في استكشاف أعمال مونتاج الفيديو، التصميم الجرافيكي على Behance، المهارات، أو التواصل لبدء مشروع جديد.`
      : `Hello! I'm ${name}'s Portfolio AI Agent. I can help you explore his **Video Editing** work, **Graphic Design & Behance Poster Groups**, **Skills & Training**, or help you **get in touch** for a project. What would you like to see?`;

  return {
    text,
    actions: [
      {
        label: lang === 'bn' ? 'ভিডিও পোর্টফোলিও' : lang === 'ar' ? 'معرض الفيديو' : 'Video Portfolio',
        type: 'navigate',
        target: 'videos'
      },
      {
        label: lang === 'bn' ? 'গ্রাফিক ডিজাইন' : lang === 'ar' ? 'معرض التصميم' : 'Graphic Design',
        type: 'navigate',
        target: 'design'
      },
      {
        label: lang === 'bn' ? 'যোগাযোগ করুন' : lang === 'ar' ? 'تواصل معنا' : 'Contact & Hire',
        type: 'navigate',
        target: 'contact'
      }
    ]
  };
}
