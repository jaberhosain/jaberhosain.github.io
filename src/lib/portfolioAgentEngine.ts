import { PortfolioConfig, Language, LocalizedText } from '../types/portfolio';
import { JABER_CV_DATA } from '../data/jaberCvData';
import { resolveAssetUrl } from '../utils/assetUrl';

export interface AgentAction {
  label: string;
  type: 'navigate' | 'external';
  target: string;
}

export interface AgentReply {
  text: string;
  actions?: AgentAction[];
}

export interface ConversationTurn {
  role: 'assistant' | 'user';
  text: string;
}

function pickLoc(text: LocalizedText | string | undefined, lang: Language): string {
  if (!text) return '';
  if (typeof text === 'string') return text;
  return text[lang] || text.en || text.bn || text.ar || '';
}

const BANGLISH_REGEX =
  /\b(kemon|kivabe|koto|ache|korbo|koren|dekhao|chobi|kaj|jogajog|thikana|basha|bari|tumi|apni|vai|bhai|beton|porashona|baba|ma|boyos|namber|number|parbe|parbo|jani|janina|ki|keno|kothay|kobe|kon|amar|tomar|apnar|tar|onar|shomporke|somporke|dhonnobad|salam|assalamu|alo|bhalo|valo|lagbe|chai|chao|dao|bolo|bolen)\b/i;

export function detectQueryLanguage(query: string, fallback: Language): Language {
  if (/[\u0980-\u09FF]/.test(query)) return 'bn';
  if (/[\u0600-\u06FF]/.test(query)) return 'ar';
  if (/[a-zA-Z]/.test(query)) {
    if (BANGLISH_REGEX.test(query)) {
      return 'bn';
    }
    return 'en';
  }
  return fallback;
}

/**
 * Builds a concise portfolio context summary to send to the server-side Gemini model
 * so it always reflects the live Firestore portfolio state alongside Jaber's CV.
 */
export function buildPortfolioKnowledgeSummary(portfolio: PortfolioConfig): string {
  const name = portfolio.hero?.name?.en || JABER_CV_DATA.fullName;
  const tagline = portfolio.hero?.tagline?.en || JABER_CV_DATA.headline;
  const badge = portfolio.hero?.badge?.en || '';
  const bioEn = portfolio.about?.bio?.en || '';
  const bioBn = portfolio.about?.bio?.bn || '';

  const counters = (portfolio.hero?.counters || [])
    .map((c) => `- ${c.value} (${c.label?.en} / ${c.label?.bn})`)
    .join('\n');

  const services = (portfolio.services || [])
    .map((s) => `- ${s.title?.en} (${s.title?.bn}): ${s.description?.en}`)
    .join('\n');

  const skills = (portfolio.skills || [])
    .map((sk) => `- ${sk.title?.en} (${sk.description?.en}): ${(sk.tools || []).join(', ')}`)
    .join('\n');

  const institutes = (portfolio.professionalInstitutes || [])
    .map((inst) => `- ${inst.institution?.en} | ${inst.course?.en} (${inst.batch})`)
    .join('\n');

  const academics = (portfolio.academicRecords || [])
    .map((ac) => `- ${ac.title?.en} (${ac.year}): ${ac.status?.en} — ${ac.description?.en}`)
    .join('\n');

  const workflow = (portfolio.workflow || [])
    .map((w) => `- Step ${w.step}: ${w.title?.en} (${w.title?.bn})${w.description?.en ? ` — ${w.description.en}` : ''}`)
    .join('\n');

  const overviewCards = (portfolio.overviewCards || [])
    .map((o) => `- ${o.title?.en}: ${o.description?.en}`)
    .join('\n');

  const graphicProjects = (portfolio.projects || [])
    .filter((p: any) => p.category === 'graphic' && p.visible !== false && !p.hidden)
    .map((p) => {
      const group = p.groupName?.en ? `[Group: ${p.groupName.en}] ` : '';
      const posterSet = new Set<string>();
      if (p.coverImage) posterSet.add(p.coverImage);
      (p.galleryImages || []).forEach((u: string) => u && posterSet.add(u));
      const posterCaptions = (p.galleryCaptions || []).filter(Boolean).join(', ');
      return `- ${group}${p.title?.en || 'Graphic Work'} (${posterSet.size} poster(s))${p.description?.en ? ` — ${p.description.en}` : ''}${posterCaptions ? ` | Posters: ${posterCaptions}` : ''}${p.behanceUrl ? ` | Behance: ${p.behanceUrl}` : ''}`;
    })
    .join('\n');

  const bestGraphics = (portfolio.bestGraphicWorks || [])
    .filter((g) => g.visible !== false)
    .map((g) => `- ${g.title?.en}${g.behanceUrl ? ` (${g.behanceUrl})` : ''}`)
    .join('\n');

  const allVideos = [
    ...(portfolio.bestVideoWorks || [])
      .filter((v: any) => v.visible !== false)
      .map((v: any) => ({ ...v, groupLabel: 'Featured/Best Video' })),
    ...(portfolio.videos || [])
      .filter((v: any) => v.visible !== false && !v.hidden)
      .map((v: any) => ({ ...v, groupLabel: 'Portfolio Video' }))
  ];
  const videoTitles = allVideos
    .map(
      (v: any) =>
        `- [${v.groupLabel}] ${v.title?.en || v.title?.bn || 'Video Project'} (${v.videoType || 'video'}${v.duration ? `, ${v.duration}` : ''})${v.description?.en ? ` — ${v.description.en}` : ''}${v.videoUrl ? ` | ${v.videoUrl}` : ''}`
    )
    .join('\n');

  const channels = (portfolio.channelLinks || [])
    .map((ch) => `- ${ch.platform} (${ch.status}): ${ch.description?.en}${ch.url ? ` | ${ch.url}` : ''}`)
    .join('\n');

  const socials = (portfolio.socialLinks || [])
    .filter((s) => s.enabled !== false)
    .map((s) => `- ${s.name}: ${s.url}`)
    .join('\n');

  const email = portfolio.contact?.email || JABER_CV_DATA.contact.emails[2];
  const telegram = portfolio.contact?.telegramUrl || 'https://t.me/sbmc3925';
  const behance = portfolio.contact?.behanceUrl || 'https://www.behance.net/jaberhosain';

  return [
    `Website Architecture: Interactive 3D WebGL Portfolio across 6 dedicated pages (Home, About & CV, Video Edits, Graphic Design & Posters Gallery, Skills & Workflow, Contact). Supports Bangla, English, and Arabic.`,
    `Owner Name: ${name}`,
    badge ? `Hero Headline Badge: ${badge}` : '',
    `Role / Tagline: ${tagline}`,
    counters ? `Hero Key Metrics:\n${counters}` : '',
    `About (EN): ${bioEn}`,
    `About (BN): ${bioBn}`,
    overviewCards ? `Site Overview Pillars:\n${overviewCards}` : '',
    `Services:\n${services}`,
    workflow ? `Creative Workflow Steps:\n${workflow}` : '',
    `Skills & Tools:\n${skills}`,
    `Professional Training:\n${institutes}`,
    `Academic Education:\n${academics}`,
    `Video Portfolio Count: ${allVideos.length} published videos`,
    videoTitles ? `All Videos:\n${videoTitles}` : '',
    `Graphic Design Project Groups:\n${graphicProjects || 'Brand Identity, Social Media Visuals, Posters & Thumbnails'}`,
    bestGraphics ? `Best Graphic Works:\n${bestGraphics}` : '',
    channels ? `Channels & Links:\n${channels}` : '',
    socials ? `Social Profiles:\n${socials}` : '',
    `Live Contact Links: Email: ${email} | Telegram: ${telegram} | Behance: ${behance}`
  ]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Infers contextual action buttons based on the user's question and assistant reply.
 */
export function inferAgentActions(
  userQuery: string,
  replyText: string,
  portfolio: PortfolioConfig,
  lang: Language
): AgentAction[] {
  const combined = `${userQuery} ${replyText}`.toLowerCase();
  const actions: AgentAction[] = [];

  const isCVOrEduOrExp =
    /\bcv\b|resume|biodata|experience|alim|dakhil|gpa|salary|training|hostel|manar|sunnah|সিভি|বায়োডাটা|অভিজ্ঞতা|আলিম|দাখিল|শিক্ষা|ট্রেনিং|বেতন|স্যালারি/.test(
      combined
    );
  const isVideo =
    /video|edit|premiere|after effects|reel|vimeo|youtube|motion|ভিডিও|এডিটিং|মোশন|مونتاج|فيديو/.test(combined);
  const isGraphic =
    /graphic|design|poster|behance|thumbnail|logo|brand|photoshop|illustrator|canva|গ্রাফিক|ডিজাইন|পোস্টার|বিহান্স|বিহ্যান্স|تصميم|جرافيك|بوستر/.test(
      combined
    );
  const isContact =
    /contact|hire|email|telegram|phone|call|facebook|linkedin|number|address|reach|যোগাযোগ|হায়ার|ইমেইল|টেলিগ্রাম|ফোন|নাম্বার|ঠিকানা|কাজ|تواصل|عمل/.test(
      combined
    );
  const isSkill =
    /skill|tool|software|office|excel|word|data entry|linux|mac|windows|ai tool|দক্ষতা|স্কিল|টুল|সফটওয়্যার|কম্পিউটার|مهارات|أدوات/.test(
      combined
    );
  const isUnknown =
    /আপাতত আমি জানি না|don't currently know|don't know about that|لا أعرف حالياً/.test(replyText.toLowerCase());

  if (isUnknown) {
    return [
      {
        label: lang === 'bn' ? 'সিভি দেখুন (PDF)' : lang === 'ar' ? 'عرض السيرة الذاتية' : 'View CV (PDF)',
        type: 'external',
        target: resolveAssetUrl(JABER_CV_DATA.pdfPath)
      },
      {
        label: lang === 'bn' ? 'দক্ষতা ও অভিজ্ঞতা' : lang === 'ar' ? 'المهارات' : 'About & Experience',
        type: 'navigate',
        target: 'about'
      },
      {
        label: lang === 'bn' ? 'যোগাযোগ করুন' : lang === 'ar' ? 'تواصل معنا' : 'Contact Page',
        type: 'navigate',
        target: 'contact'
      }
    ];
  }

  if (isCVOrEduOrExp) {
    actions.push({
      label: lang === 'bn' ? 'মূল সিভি দেখুন (PDF)' : lang === 'ar' ? 'السيرة الذاتية PDF' : 'View Full CV (PDF)',
      type: 'external',
      target: resolveAssetUrl(JABER_CV_DATA.pdfPath)
    });
  }

  if (isVideo && actions.length < 3) {
    actions.push({
      label: lang === 'bn' ? 'ভিডিও পোর্টফোলিও' : lang === 'ar' ? 'معرض الفيديو' : 'Video Portfolio',
      type: 'navigate',
      target: 'videos'
    });
  }

  if (isGraphic && actions.length < 3) {
    actions.push({
      label: lang === 'bn' ? 'ডিজাইন গ্যালারি' : lang === 'ar' ? 'معرض التصميم' : 'Design Gallery',
      type: 'navigate',
      target: 'design'
    });
    if (actions.length < 3) {
      actions.push({
        label: lang === 'bn' ? 'Behance প্রোফাইল' : 'Behance',
        type: 'external',
        target: portfolio.contact?.behanceUrl || 'https://www.behance.net/jaberhosain'
      });
    }
  }

  if (isSkill && actions.length < 3) {
    actions.push({
      label: lang === 'bn' ? 'দক্ষতা ও টুলস' : lang === 'ar' ? 'المهارات والأدوات' : 'Skills & Tools',
      type: 'navigate',
      target: 'skills'
    });
  }

  if (isContact && actions.length < 3) {
    actions.push({
      label: lang === 'bn' ? 'যোগাযোগ পেজ' : lang === 'ar' ? 'صفحة التواصل' : 'Contact Page',
      type: 'navigate',
      target: 'contact'
    });
    if (actions.length < 3) {
      actions.push({
        label: lang === 'bn' ? 'টেলিগ্রামে মেসেজ' : 'Telegram',
        type: 'external',
        target: portfolio.contact?.telegramUrl || 'https://t.me/sbmc3925'
      });
    }
  }

  if (actions.length === 0) {
    actions.push({
      label: lang === 'bn' ? 'সম্পূর্ণ পরিচিতি' : lang === 'ar' ? 'نبذة عني' : 'About Jaber',
      type: 'navigate',
      target: 'about'
    });
    actions.push({
      label: lang === 'bn' ? 'সিভি দেখুন (PDF)' : lang === 'ar' ? 'السيرة الذاتية' : 'CV (PDF)',
      type: 'external',
      target: resolveAssetUrl(JABER_CV_DATA.pdfPath)
    });
  }

  return actions.slice(0, 3);
}

type TopicId =
  | 'greeting'
  | 'cv_overview'
  | 'why_hire'
  | 'website_overview'
  | 'workflow_process'
  | 'experience'
  | 'education'
  | 'training'
  | 'career_salary'
  | 'video'
  | 'graphic'
  | 'marketing'
  | 'ai_tools'
  | 'office_computer'
  | 'contact'
  | 'address'
  | 'personal'
  | 'languages'
  | 'portfolio_extra'
  | 'thanks';

function detectMatchingTopics(q: string): TopicId[] {
  const topics: TopicId[] = [];

  if (/^(hi|hello|hey|salam|assalam|yo|hola|হ্যালো|হাই|সালাম|আসসালামু|কেমন আছো|kemon acho|مرحبا|السلام)\b/.test(q)) {
    topics.push('greeting');
  }
  if (/thanks|thank you|thx|dhonnobad|ধন্যবাদ|শুকরিয়া|থ্যাংকস|شكرا/.test(q)) {
    topics.push('thanks');
  }
  if (/why hire|keno hire|কেন নিব|কেন হায়ার|কেন নেব|কেমন কাজ|quality|কাজের মান|ভালো|যোগ্যতা|fit|strength|সুবিধা|help my|কীভাবে সাহায্য/.test(q)) {
    topics.push('why_hire');
  }
  if (/website|site|পেইজ|পেজ|কি কি আছে|কী কী আছে|features|3d|থ্রিডি|section|সেকশন|সর্বমোট|কয়টা প্রজেক্ট|কয়টা কাজ/.test(q)) {
    topics.push('website_overview');
  }
  if (/workflow|process|how.*work|কীভাবে কাজ করে|ধাপ|প্রসেস|সময় লাগে|turnaround|delivery/.test(q)) {
    topics.push('workflow_process');
  }
  if (/\bcv\b|resume|biodata|profile|overview|who is|about jaber|জাবের কে|সম্পর্কে|বায়োডাটা|সিভি|পরিচিতি|من هو|سيرة/.test(q)) {
    topics.push('cv_overview');
  }
  if (/experience|work history|job history|hostel|al manar|as-sunnah|sunnah|year|অভিজ্ঞতা|কোথায় কাজ|চাকরি|হোস্টেল|মানার|সুন্নাহ|خبرة/.test(q)) {
    topics.push('experience');
  }
  if (/education|academic|study|school|madrasah|alim|dakhil|hsc|ssc|gpa|result|pass|পড়াশোনা|শিক্ষা|মাদরাসা|আলিম|দাখিল|রেজাল্ট|জিপিএ|কোন ক্লাস|কত সাল|تعليم/.test(q)) {
    topics.push('education');
  }
  if (/training|course|certificate|certification|bismillah|satarkul|small business|ট্রেনিং|প্রশিক্ষণ|কোর্স|সার্টিফিকেট|বিসমিল্লাহ|تدريب/.test(q)) {
    topics.push('training');
  }
  if (/salary|expected|beton|tk|taka|district|country|abroad|prefer|job category|hire|looking for|price|pricing|budget|charge|rate|খরচ|বাজেট|চার্জ|চাকরি চায়|বেতন|স্যালারি|কত টাকা|জেলা|দেশ|কোম্পানি|পছন্দ|বেতন কত|راتب/.test(q)) {
    topics.push('career_salary');
  }
  if (/video|edit|premiere|after effects|motion|reel|short|documentary|vimeo|youtube|ভিডিও|এডিট|প্রিমিয়ার|আফটার ইফেক্ট|মোশন|রিল|فيديو|مونتاج/.test(q)) {
    topics.push('video');
  }
  if (/graphic|design|poster|behance|thumbnail|brand|logo|photoshop|illustrator|canva|banner|creative|গ্রাফিক|ডিজাইন|পোস্টার|বিহান্স|বিহ্যান্স|ফটোশপ|ইলাস্ট্রেটর|ব্যানার|লোগো|تصميم|جرافيك/.test(q)) {
    topics.push('graphic');
  }
  if (/marketing|meta|facebook ads|ad creative|digital market|e-?commerce|মার্কেটিং|মেটা|ফেসবুক অ্যাড|বিজ্ঞাপন|تسويق/.test(q)) {
    topics.push('marketing');
  }
  if (/\bai\b|artificial intelligence|chatgpt|gemini|prompt|script|এআই|কৃত্রিম বুদ্ধিমত্তা|ذكاء/.test(q)) {
    topics.push('ai_tools');
  }
  if (/office|word|excel|powerpoint|google sheet|workspace|data entry|computer|operator|typing|windows|mac|linux|accounts|অফিস|ওয়ার্ড|এক্সেল|পাওয়ারপয়েন্ট|ডেটা এন্ট্রি|কম্পিউটার|টাইপিং|হিসাব|লিনাক্স|ম্যাক|حاسوب/.test(q)) {
    topics.push('office_computer');
  }
  if (/contact|phone|mobile|call|email|mail|gmail|facebook|linkedin|telegram|reach|order|অর্ডার|ফোন|মোবাইল|নাম্বার|ইমেইল|জিমেইল|ফেসবুক|লিঙ্কডইন|টেলিগ্রাম|যোগাযোগ|নাম্বার কত|تواصل|هاتف/.test(q)) {
    topics.push('contact');
  }
  if (/address|location|where|live|home|district|tongi|gazipur|lakshmipur|raypur|kerowa|thikana|basha|bari|ঠিকানা|বাসা|বাড়ি|কোথায় থাকে|টঙ্গী|গাজীপুর|লক্ষ্মীপুর|রায়পুর|عنوان/.test(q)) {
    topics.push('address');
  }
  if (/father|mother|parent|dob|birth|age|boyos|baba|ma|blood|height|weight|married|marital|religion|nationality|বাবার নাম|মায়ের নাম|পিতা|মাতা|জন্ম|বয়স|রক্ত|ব্লাড|উচ্চতা|ওজন|বিবাহ|ধর্ম|জাতীয়তা|عمر|فصيلة/.test(q)) {
    topics.push('personal');
  }
  if (/language|bangla|english|speak|read|write|ভাষা|বাংলা|ইংরেজি|لغة/.test(q)) {
    topics.push('languages');
  }
  if (/portfolio|website|github|extra|curricular|accomplish|পোর্টফোলিও|ওয়েবসাইট|এক্সট্রা|অর্জন|أعمال/.test(q)) {
    topics.push('portfolio_extra');
  }

  return topics;
}

/**
 * Checks if the query asks about a tool/topic adjacent or close to Jaber's CV so
 * we give a realistic, honest approximation instead of saying complete "I don't know".
 */
function checkCloseRelatedTopic(q: string, lang: Language): string | null {
  // Other video editors (CapCut, DaVinci Resolve, Filmora, Final Cut)
  if (/capcut|davinci|resolve|filmora|final cut|vegas|kdenlive|ভিন্সি|ক্যাপকাট|ফিল্মোরা/.test(q)) {
    return lang === 'bn'
      ? 'সিভিতে আলাদাভাবে CapCut বা DaVinci Resolve উল্লেখ নেই—জাবের মূলত পেশাদারভাবে **Adobe Premiere Pro** ও **After Effects** দিয়ে ভিডিও এডিটিং, কাটিং, ট্রানজিশন, টেক্সট অ্যানিমেশন ও মোশন গ্রাফিক্সের কাজ করেন। তবে এই পেশাদার সফটওয়্যারগুলোতে দক্ষ থাকায় কাছাকাছি যেকোনো এডিটিং প্ল্যাটফর্মেও দ্রুত কাজ মানিয়ে নিতে পারবেন।'
      : lang === 'ar'
      ? 'لم تُذكر هذه البرامج تحديداً في السيرة الذاتية؛ يعتمد جابر أساساً على Adobe Premiere Pro و After Effects، وبفضل خبرته فيهما يمكنه التكيف بسهولة مع أي أداة مونتاج قريبة.'
      : "Those specific tools aren't explicitly listed in Jaber's CV—he primarily edits professionally using **Adobe Premiere Pro** and **After Effects**. Because of his strong foundation in timeline editing, transitions, and motion graphics, he can adapt easily to similar editing suites if needed.";
  }

  // Other graphic tools (Figma, CorelDraw, InDesign, UI/UX)
  if (/figma|corel|indesign|ui\/?ux|sketch|ফিগমা|কোরেল/.test(q)) {
    return lang === 'bn'
      ? 'তাঁর সিভিতে Figma বা CorelDraw সরাসরি উল্লেখ নেই। তবে তিনি **Adobe Photoshop**, **Illustrator** ও **Canva Pro**-তে সোশ্যাল মিডিয়া ক্রিয়েটিভ, ব্যানার, পোস্টার ও প্রমোশনাল ডিজাইনে অভিজ্ঞ, যা কাছাকাছি ভিজ্যুয়াল ডিজাইনের কাজের সাথে খুব সামঞ্জস্যপূর্ণ।'
      : lang === 'ar'
      ? 'لا يذكر في السيرة الذاتية Figma أو CorelDraw بشكل مباشر، لكنه متمرس في Adobe Photoshop و Illustrator و Canva Pro لتصميم المنشورات والهوية البصرية.'
      : "Figma or CorelDraw aren't listed directly on his CV, though Jaber is proficient in **Adobe Photoshop**, **Illustrator**, and **Canva Pro** for banners, posters, and social media creatives, which translates closely to visual design workflows.";
  }

  // Web development / coding / WordPress / software dev
  if (/web\s?dev|coding|programming|react|javascript|python|wordpress|html|css|developer|app dev|ওয়েব ডেভ|কোডিং|প্রোগ্রামিং|ওয়ার্ডপ্রেস/.test(q)) {
    return lang === 'bn'
      ? 'জাবের মূলত সফটওয়্যার ডেভেলপার নন—তাঁর মূল ক্ষেত্র হলো **ভিডিও এডিটিং, গ্রাফিক ডিজাইন ও ডিজিটাল মার্কেটিং**। তবে কাছাকাছি একটি দিক হলো: তিনি **AI টুলস** ব্যবহার করে নিজের পার্সোনাল পোর্টফোলিও ওয়েবসাইট (`https://jaberhosain.github.io/`) তৈরি ও পরিচালনা করেছেন এবং কম্পিউটার অপারেশনে Windows, macOS ও Linux ব্যবহারে দক্ষ।'
      : lang === 'ar'
      ? 'جابر ليس مبرمجاً بالأساس؛ تخصصه الرئيسي هو المونتاج والتصميم الجرافيكي، لكنه أنشأ موقع معرض أعماله الشخصي مستفيداً من أدوات الذكاء الاصطناعي.'
      : "Jaber isn't primarily a software programmer—his core specialty is **Video Editing, Graphic Design & Digital Marketing**. However, on a closely related note, he built and maintains his personal portfolio website (`https://jaberhosain.github.io/`) leveraging AI-assisted workflows and works comfortably across Windows, macOS, and Linux.";
  }

  // Freelance, remote, part-time, full-time, notice period, availability
  if (/freelance|remote|part[- ]?time|full[- ]?time|available|join|notice|ফ্রিল্যান্স|রিমোট|পার্ট টাইম|ফুল টাইম|কবে জয়েন|অ্যাভেইলেবল/.test(q)) {
    return lang === 'bn'
      ? 'সিভিতে নির্দিষ্ট নোটিশ পিরিয়ড বা ফ্রিল্যান্সিং রেট লেখা না থাকলেও, জাবের বর্তমানে **Entry-Level চাকরি** (প্রত্যাশিত বেতন **Tk. 20,000**) এবং প্রজেক্ট-ভিত্তিক ভিডিও এডিটিং ও গ্রাফিক ডিজাইনের কাজের জন্য উন্মুক্ত। ঢাকা, গাজীপুর, চট্টগ্রাম বা নোয়াখালীর পাশাপাশি প্রয়োজনে দূরবর্তী প্রজেক্টেও কাজ করতে আগ্রহী—সরাসরি নিশ্চিত হতে যোগাযোগ পেজ বা ফোন/ইমেইলে কথা বলতে পারেন।'
      : lang === 'ar'
      ? 'يبحث جابر حالياً عن فرصة عمل للمبتدئين (الراتب المتوقع 20,000 تاكا) كما يتعاون في مشاريع المونتاج والتصميم. يمكنك التواصل معه مباشرة لتأكيد المواعيد.'
      : "While exact notice periods or freelance hourly rates aren't fixed on his CV, Jaber is actively looking for an **Entry-Level role** (expected salary **Tk. 20,000**) as well as creative project collaborations. Feel free to reach out directly via phone, email, or Telegram to confirm availability.";
  }

  // YouTube / Social Media / Content creation / Copywriting / SEO
  if (/seo|copywrit|content|youtube channel|instagram|tiktok|কনটেন্ট|ইউটিউব|টিকটক|ইনস্টাগ্রাম/.test(q)) {
    return lang === 'bn'
      ? 'আলাদাভাবে YouTube SEO লেখা না থাকলেও, তাঁর সিভি অনুযায়ী তিনি **Meta Marketing (ফেসবুক পেজ কনটেন্ট ও অ্যাড ক্রিয়েটিভ)**, সোশ্যাল মিডিয়া ডিজাইন, রিলস/শর্টস ভিডিও এডিটিং এবং AI-ভিত্তিক স্ক্রিপ্টিংয়ের কাজ করেন—যা ডিজিটাল কনটেন্ট ও সোশ্যাল মিডিয়া গ্রোথের সাথে সরাসরি সম্পর্কিত।'
      : lang === 'ar'
      ? 'على الرغم من عدم ذكر SEO بشكل منفرد، يمتلك جابر خبرة عملية في التسويق عبر Meta وتصميم محتوى السوشيال ميديا ومونتاج الفيديوهات القصيرة وكتابة النصوص بالذكاء الاصطناعي.'
      : "While SEO isn't listed separately, Jaber works with **Meta Marketing** (Facebook page content & ad creatives), social media visuals, short-form reels editing, and AI-assisted scripting—which closely supports digital content growth.";
  }

  // Accounting / Tally / QuickBooks / Finance
  if (/accounting|tally|quickbooks|finance|অ্যাকাউন্টিং|ট্যালি|ফাইন্যান্স/.test(q)) {
    return lang === 'bn'
      ? 'Tally বা QuickBooks-এর মতো বিশেষ সফটওয়্যার সিভিতে নেই, তবে কাছাকাছি বাস্তব অভিজ্ঞতা হিসেবে তিনি **আল মানার হোস্টেলে প্রায় ১০ মাস (০.৯ বছর)** দৈনিক আর্থিক লেনদেন, ভাড়া ও ফি সংগ্রহ এবং **Microsoft Excel ও Google Sheets**-এর মাধ্যমে হিসাব ও রিপোর্ট পরিচালনার কাজ করেছেন।'
      : lang === 'ar'
      ? 'لا يذكر برامج محاسبة مثل Tally، لكن لديه خبرة عملية لمدة 10 أشهر في إدارة الحسابات اليومية وتقارير السكن باستخدام Microsoft Excel و Google Sheets.'
      : "Dedicated ERP software like Tally isn't listed, but closely related to finance/accounts, Jaber handled **0.9 years (10 months)** of daily financial records, fee collection, and reporting at Al Manar Hostel using **Microsoft Excel and Google Sheets**.";
  }

  return null;
}

/**
 * Built-in local portfolio & CV intelligence engine so the AI Agent works
 * accurately, warmly, and contextually everywhere — including static GitHub Pages.
 */
export function generateLocalPortfolioReply(
  query: string,
  portfolio: PortfolioConfig,
  siteLang: Language,
  history: ConversationTurn[] = []
): AgentReply {
  const lang = detectQueryLanguage(query, siteLang);
  const q = query.trim().toLowerCase();

  const name = pickLoc(portfolio.hero?.name, lang) || (lang === 'bn' ? JABER_CV_DATA.fullNameBn : JABER_CV_DATA.fullName);
  const email = portfolio.contact?.email || JABER_CV_DATA.contact.emails[0];
  const tg = portfolio.contact?.telegramUrl || 'https://t.me/sbmc3925';

  const graphicProjects = (portfolio.projects || []).filter(
    (p: any) => p.category === 'graphic' && p.visible !== false && !p.hidden
  );
  const videoCount =
    (portfolio.videos || []).filter((v: any) => v.visible !== false && !v.hidden).length +
    (portfolio.bestVideoWorks || []).filter((v: any) => v.visible !== false).length;

  let matched = detectMatchingTopics(q);

  // Check short follow-up context against previous turns (e.g. "আর?", "কত টাকা?", "কোন বছর?", "তার নাম্বার?")
  if (matched.length === 0 && history.length >= 2) {
    const isShortFollowUp = q.split(/\s+/).length <= 5 && /কত|কোন|আর|কবে|কোথায়|নাম্বার|লিংক|বিস্তারিত|more|details|which|when|what about|salary|year|result/.test(q);
    if (isShortFollowUp) {
      const prevContextText = history
        .slice(-4, -1)
        .map((m) => m.text.toLowerCase())
        .join(' ');
      if (/alim|dakhil|gpa|আলিম|দাখিল|শিক্ষা/.test(prevContextText)) matched.push('education');
      else if (/hostel|sunnah|অভিজ্ঞতা|experience/.test(prevContextText)) matched.push('experience');
      else if (/20,000|২০,০০০|salary|বেতন/.test(prevContextText)) matched.push('career_salary');
      else if (/ফোন|ইমেইল|phone|email|যোগাযোগ/.test(prevContextText)) matched.push('contact');
    }
  }

  // Pure greeting or thanks with no other topic
  if (matched.length === 1 && matched[0] === 'greeting') {
    const text =
      lang === 'bn'
        ? `ওয়ালাইকুমুস সালাম / হ্যালো! আমি ${name}-এর এআই অ্যাসিস্ট্যান্ট। তাঁর সিভি, শিক্ষাগত যোগ্যতা (আলিম ও দাখিল), কাজের অভিজ্ঞতা, ভিডিও এডিটিং ও গ্রাফিক ডিজাইন কাজ, বা যোগাযোগ সম্পর্কে যা জানতে চান নির্দ্বিধায় জিজ্ঞাসা করতে পারেন।`
        : lang === 'ar'
        ? `وعليكم السلام وأهلاً بك! أنا المساعد الشخصي لـ ${name}. يمكنك سؤالي عن سيرته الذاتية، خبراته، أعمال المونتاج والتصميم، أو كيفية التواصل معه.`
        : `Hello! I'm ${name}'s AI Assistant. You can ask me anything from his CV—education, 1.1 years of experience, software skills, expected salary, contact details—or explore his Video Editing and Graphic Design portfolio!`;
    return {
      text,
      actions: inferAgentActions(query, text, portfolio, lang)
    };
  }

  if (matched.length === 1 && matched[0] === 'thanks') {
    const text =
      lang === 'bn'
        ? `আপনাকেও অসংখ্য ধন্যবাদ! ${name}-এর কাজের পোর্টফোলিও বা সিভি নিয়ে ভবিষ্যতে যেকোনো প্রশ্ন থাকলে জানাবেন।`
        : lang === 'ar'
        ? `شكراً جزيلاً لك! يسعدني دائماً مساعدتك في أي استفسار حول أعمال أو سيرة ${name}.`
        : `You're very welcome! Feel free to reach out anytime if you'd like more details about ${name}'s CV or portfolio.`;
    return {
      text,
      actions: inferAgentActions(query, text, portfolio, lang)
    };
  }

  // Filter out greeting/thanks if combined with substantive topics
  const substantiveTopics = matched.filter((t) => t !== 'greeting' && t !== 'thanks');

  if (substantiveTopics.length > 0) {
    const parts: string[] = [];

    for (const topic of substantiveTopics.slice(0, 3)) {
      switch (topic) {
        case 'cv_overview':
          parts.push(
            lang === 'bn'
              ? `**${JABER_CV_DATA.fullNameBn} (${JABER_CV_DATA.fullName})** একজন ভিডিও এডিটর, গ্রাফিক ডিজাইনার, ডিজিটাল মার্কেটার ও AI টুলস বিশেষজ্ঞ। তাঁর মোট **১.১ বছরের অভিজ্ঞতা** রয়েছে (আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট ও আল মানার হোস্টেল), ২০২৫ সালে আলিম (GPA 4.14) সম্পন্ন করেছেন এবং বর্তমানে টঙ্গী, গাজীপুরে অবস্থান করছেন।`
              : lang === 'ar'
              ? `**${JABER_CV_DATA.fullName}** هو مونتير فيديو، مصمم جرافيك، ومسوق رقمي بخبرة إجمالية 1.1 سنة، حاصل على شهادة عليم (معدل 4.14/5) عام 2025، ويبحث عن فرصة عمل في المونتاج والتصميم.`
              : `**${JABER_CV_DATA.fullName}** is a Video Editor, Graphic Designer, Digital Marketer, and AI Tools practitioner with **1.1 years of total experience**. He completed his Alim (HSC equivalent) in 2025 with GPA 4.14/5.00 and seeks an entry-level creative role applying Premiere Pro, After Effects, Photoshop, Illustrator, and AI workflows.`
          );
          break;

        case 'why_hire':
          parts.push(
            lang === 'bn'
              ? `**কেন জাবেরকে হায়ার করবেন?**\n• **অল-ইন-ওয়ান ক্রিয়েটিভ স্কিল:** একসাথে ভিডিও এডিটিং (Premiere Pro, After Effects), গ্রাফিক ডিজাইন (Photoshop, Illustrator, Canva), Meta মার্কেটিং এবং AI ওয়ার্কফ্লো পারেন—তাই টিমের আলাদা কাজের খরচ ও সময় বাঁচে।\n• **বাস্তব অফিস ও দায়িত্বশীলতার প্রমাণ:** আল মানার হোস্টেলে ১০ মাস দৈনিক হিসাব ও ডকুমেন্টেশন সামলানোর পাশাপাশি আস-সুন্নাহ ইনস্টিটিউট থেকে প্র্যাকটিক্যাল প্রোডাকশন ট্রেনিং সম্পন্ন করেছেন।\n• **ওয়েবসাইটেই কাজের প্রমাণ:** বর্তমানে সাইটে **${videoCount}টি ভিডিও এডিট** এবং **${graphicProjects.length}টি গ্রাফিক ডিজাইন প্রজেক্ট গ্রুপ** লাইভ রয়েছে।`
              : `**Why Work With Jaber?**\n• **Multi-Disciplinary Production:** Combines Video Editing (Premiere Pro, After Effects), Graphic Design (Photoshop, Illustrator), Meta Marketing, and modern AI tools in one streamlined workflow.\n• **Verified Discipline & Operations:** Backed by 10 months of financial/office management at Al Manar Hostel plus practical production training at As-Sunnah Skill Development Institute.\n• **Live Portfolio Proof:** Showcasing **${videoCount} video edits** and **${graphicProjects.length} graphic design groups** directly on this website.`
          );
          break;

        case 'website_overview': {
          const totalPosters = graphicProjects.reduce((acc, p) => {
            const gCount = (p.galleryImages?.length || 0) + (p.coverImage && !(p.galleryImages || []).includes(p.coverImage) ? 1 : 0);
            return acc + Math.max(1, gCount);
          }, 0);
          parts.push(
            lang === 'bn'
              ? `**এই ওয়েবসাইটে কী কী রয়েছে:**\n• **ভিডিও পোর্টফোলিও:** ${videoCount}টি প্রকাশিত ভিডিও এডিট (YouTube, Vimeo, Facebook ও মোশন রিলস)।\n• **গ্রাফিক ডিজাইন ও পোস্টার গ্যালারি:** ${graphicProjects.length}টি প্রজেক্ট গ্রুপের অধীনে মোট **${totalPosters}+টি পোস্টার** এবং সেরা কাজের শোক্যাস (Behance লিংকসহ)।\n• **সিভি, দক্ষতা ও যোগাযোগ:** ৬টি ডেডিকেটেড ৩ডি পেজ—হোম, অ্যাবাউট ও সিভি, ভিডিও, ডিজাইন, স্কিলস ও কন্টাক্ট পেজ (বাংলা, ইংরেজি ও আরবি সাপোর্টসহ)।`
              : `**What's Inside This Portfolio Website:**\n• **Video Showcase:** ${videoCount} published video projects spanning reels, commercials, and motion graphics.\n• **Graphic Design Gallery:** ${graphicProjects.length} project groups containing **${totalPosters}+ posters** plus Best Work highlights linked to Behance.\n• **Complete Interactive CV & Skills:** 6 3D-animated pages covering About/CV, Videos, Design, Skills & Workflow, and Contact in English, Bangla, and Arabic.`
          );
          break;
        }

        case 'workflow_process': {
          const steps = (portfolio.workflow || [])
            .slice(0, 5)
            .map((w) => `${w.step}. **${pickLoc(w.title, lang)}**${w.description ? ` — ${pickLoc(w.description, lang)}` : ''}`)
            .join('\n');
          parts.push(
            lang === 'bn'
              ? `**জাবেরের কাজের ধাপ (Creative Workflow):**\n${steps || '১. ব্রিফ ও রিসার্চ → ২. কনসেপ্ট ও স্ক্রিপ্ট → ৩. এডিটিং ও ডিজাইন → ৪. রিভিশন ও ফাইনাল ডেলিভারি।'}\nসাধারণ সোশ্যাল মিডিয়া পোস্টার বা শর্ট রিলস সাধারণত কাজের জটিলতা অনুযায়ী ১–৩ দিনের মধ্যে ডেলিভারি দেওয়া হয়।`
              : `**Creative Workflow:**\n${steps || '1. Brief & Research → 2. Concept → 3. Editing & Design → 4. Review & Delivery.'}\nStandard posters or short-form reels typically take 1–3 days depending on brief complexity.`
          );
          break;
        }

        case 'experience':
          parts.push(
            lang === 'bn'
              ? `**কাজের অভিজ্ঞতা (মোট: ১.১ বছর):**\n• **আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট** (৩ মাস: ১৪ আগস্ট – ২০ নভেম্বর ২০২৬): ভিডিও এডিটিং (Premiere Pro, After Effects), গ্রাফিক ডিজাইন (Photoshop, Illustrator), Meta মার্কেটিং ও AI টুলস-সহ ব্যক্তিগত পোর্টফোলিও ওয়েবসাইট নির্মাণ।\n• **আল মানার হোস্টেল — তা'মীরুল মিল্লাত কামিল মাদরাসা, টঙ্গী** (১০ মাস / ০.৯ বছর: ০৩ জানুয়ারি – ০৫ নভেম্বর ২০২৫): অফিস ম্যানেজমেন্ট, ডেটা এন্ট্রি, MS Office ও Google Workspace ব্যবহার করে শিক্ষার্থী রেকর্ড, হোস্টেল ফি সংগ্রহ ও দৈনিক আর্থিক হিসাব পরিচালনা।`
              : lang === 'ar'
              ? `**الخبرة العملية (الإجمالي: 1.1 سنة):**\n• معهد السنة لتطوير المهارات (3 أشهر، 2026): مونتاج فيديو، تصميم جرافيك، تسويق Meta وأدوات الذكاء الاصطناعي.\n• سكن المنار — مدرسة تامير الملة، تونجي (10 أشهر / 0.9 سنة، 2025): إدارة المكتب، إدخال البيانات، والإدارة المالية عبر MS Office و Google Workspace.`
              : `**Work Experience (Total: 1.1 yrs):**\n• **As-Sunnah Skill Development Institute** (3 months, 14 Aug – 20 Nov 2026): Practical training & execution in Premiere Pro, After Effects, Photoshop, Illustrator, Meta Marketing, AI workflows, and building his personal portfolio.\n• **Al Manar Hostel — Ta'mirul Millat Kamil Madrasah, Tongi** (10 months / 0.9 yrs, 03 Jan – 05 Nov 2025): Office management, data entry, student records, hostel fee collection, and daily financial reporting using MS Office & Google Workspace.`
          );
          break;

        case 'education':
          parts.push(
            lang === 'bn'
              ? `**শিক্ষাগত যোগ্যতা (মাদরাসা শিক্ষাবোর্ড):**\n• **আলিম (HSC সমমান — মানবিক/আর্টস):** তা'মীরুল মিল্লাত কামিল মাদরাসা, টঙ্গী | ফলাফল: **GPA 4.14 (৫.০০-এর মধ্যে)** | পাসের বছর: **২০২৫**।\n• **দাখিল (SSC সমমান — মানবিক/আর্টস):** খিলবাইছা রহমানিয়া ফাজিল মাদরাসা, লক্ষ্মীপুর | ফলাফল: **GPA 3.94 (৫.০০-এর মধ্যে)** | পাসের বছর: **২০২৩**।`
              : lang === 'ar'
              ? `**المؤهل الأكاديمي:**\n• **عليم (ثانوية، تخصص آداب):** مدرسة تامير الملة، تونجي — المعدل: **4.14 من 5** (سنة التخرج: 2025).\n• **داخل (إعدادية، تخصص آداب):** مدرسة خيلبايسا الرحمانية، لاكشميبور — المعدل: **3.94 من 5** (سنة التخرج: 2023).`
              : `**Academic Education:**\n• **Alim (HSC equiv. — Arts):** Ta'mirul Millat Kamil Madrasah, Tongi | Result: **GPA 4.14 / 5.00** | Passing Year: **2025**.\n• **Dakhil (SSC equiv. — Arts):** Khilbaisa Rahmania Fazil Madrasah, Lakshmipur | Result: **GPA 3.94 / 5.00** | Passing Year: **2023**.`
          );
          break;

        case 'training':
          parts.push(
            lang === 'bn'
              ? `**প্রশিক্ষণ ও সার্টিফিকেশন:**\n• **Small Business Management Course** (৩ মাস, ১৪ আগস্ট – ২০ নভেম্বর ২০২৬) — আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট, সাঁতারকুল, ঢাকা (ভিডিও এডিটিং, গ্রাফিক ডিজাইন, মেটা মার্কেটিং, AI টুলস, লিডারশিপ ও এন্টারপ্রেনারশিপ)।\n• **Basic Computer & Microsoft Office Training** (৩ মাস, ২৫ মে – ০৩ আগস্ট ২০২৩) — বিসমিল্লাহ কম্পিউটার অ্যান্ড ট্রেনিং সেন্টার, লক্ষ্মীপুর (MS Word, Excel, PowerPoint, Windows/macOS/Linux ও হার্ডওয়্যার)।`
              : `**Professional Trainings:**\n• **Small Business Management Course** (3 Months, 2026) — As-Sunnah Skill Development Institute, Satarkul, Dhaka (Video Editing, Graphic Design, Meta Marketing, AI Tools, Leadership, Business Operations).\n• **Basic Computer & Microsoft Office Training** (3 Months, 2023) — Bismillah Computer & Training Center, Lakshmipur (MS Office, Windows/macOS/Linux, Typing & File Management).`
          );
          break;

        case 'career_salary':
          parts.push(
            lang === 'bn'
              ? `**চাকরির পছন্দ ও প্রত্যাশিত বেতন:**\n• **পছন্দের পদ:** Video Editor, Graphic Designer, Design/Creative, Digital Marketing, Data Entry / Computer Operator (Entry-Level)।\n• **প্রত্যাশিত বেতন:** **২০,০০০ টাকা (Tk. 20,000)**।\n• **পছন্দের জেলা:** ঢাকা, গাজীপুর, চট্টগ্রাম, নোয়াখালী।\n• **বিদেশে কাজের আগ্রহ:** মালয়েশিয়া, সৌদি আরব, সিঙ্গাপুর, চীন।\n• **পছন্দের প্রতিষ্ঠান:** অ্যাডভার্টাইজিং এজেন্সি, ট্রেনিং ইনস্টিটিউট, ই-কমার্স, ওয়েব মিডিয়া বা টেলিকমিউনিকেশন।`
              : lang === 'ar'
              ? `**تفضيلات الوظيفة والراتب:**\n• يبحث عن وظيفة مبتدئة كمونتير فيديو، مصمم جرافيك، أو مسوق رقمي.\n• **الراتب المتوقع:** 20,000 تاكا بنجلاديشي.\n• **المناطق المفضلة:** دكا، غازيبور، شاتوغرام، نواخالي (وأيضاً ماليزيا، السعودية، سنغافورة، الصين).`
              : `**Career Preferences & Salary:**\n• **Target Roles (Entry Level):** Video Editor, Graphic Designer, E-commerce / Digital Marketing, or Data Entry / Computer Operator.\n• **Expected Salary:** **Tk. 20,000**.\n• **Preferred Districts:** Dhaka, Gazipur, Chattogram, Noakhali.\n• **Preferred Countries:** Malaysia, Saudi Arabia, Singapore, China.\n• **Organization Types:** Advertising Agencies, Training Institutes, E-commerce, Development Agencies, Web Media, Telecom.`
          );
          break;

        case 'video':
          parts.push(
            lang === 'bn'
              ? `জাবের **Adobe Premiere Pro** ও **After Effects** ব্যবহার করে পেশাদার ভিডিও এডিটিং, কাটিং, ট্রানজিশন, টেক্সট অ্যানিমেশন, রিলস ও মোশন গ্রাফিক্স তৈরি করেন। আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউটে এ বিষয়ে তাঁর প্র্যাকটিক্যাল প্রশিক্ষণ ও অভিজ্ঞতা রয়েছে এবং ওয়েবসাইটে বর্তমানে **${videoCount}টি ভিডিও** যুক্ত আছে।`
              : `Jaber edits reels, documentaries, and promotional videos in **Adobe Premiere Pro** and **After Effects** (cutting, transitions, text animation, motion graphics), backed by practical training at As-Sunnah Skill Development Institute and **${videoCount} published videos** in the portfolio.`
          );
          break;

        case 'graphic': {
          const projectNames = graphicProjects
            .slice(0, 4)
            .map((p) => pickLoc(p.groupName, lang) || pickLoc(p.title, lang))
            .filter(Boolean)
            .join(', ');
          parts.push(
            lang === 'bn'
              ? `জাবের **Adobe Photoshop**, **Illustrator** ও **Canva Pro** ব্যবহার করে সোশ্যাল মিডিয়া পোস্টার, ব্যানার, ব্র্যান্ড ক্রিয়েটিভ এবং প্রমোশনাল ম্যাটেরিয়াল ডিজাইন করেন।${
                  projectNames ? ` উল্লেখযোগ্য প্রজেক্ট গ্রুপ: ${projectNames}।` : ''
                } ডিজাইন গ্যালারিতে গ্রুপ অনুযায়ী বা সব পোস্টার একসাথে দেখতে পারবেন।`
              : `Jaber creates social media creatives, posters, banners, and promotional graphics using **Adobe Photoshop**, **Illustrator**, and **Canva Pro**.${
                  projectNames ? ` Featured groups: ${projectNames}.` : ''
                }`
          );
          break;
        }

        case 'marketing':
          parts.push(
            lang === 'bn'
              ? `ডিজিটাল মার্কেটিং ও **Meta Marketing**-এ তাঁর প্র্যাকটিক্যাল দক্ষতা রয়েছে—যেমন ফেসবুক পেজের জন্য কন্টেন্ট পরিকল্পনা ও আকর্ষণীয় অ্যাড ক্রিয়েটিভ তৈরি, যা তিনি আস-সুন্নাহ ইনস্টিটিউটের কোর্স ও প্রজেক্টে প্রয়োগ করেছেন।`
              : `Jaber has practical experience in **Digital Marketing & Meta Marketing**, including preparing Facebook page content and high-converting ad creatives.`
          );
          break;

        case 'ai_tools':
          parts.push(
            lang === 'bn'
              ? `জাবের ডিজাইন আইডিয়া, ভিডিও স্ক্রিপ্টিং এবং দ্রুত প্রোডাকশন ওয়ার্কফ্লোর জন্য আধুনিক **AI টুলস** দক্ষতার সাথে ব্যবহার করেন। এমনকি AI টুলসের সহায়তায় তিনি নিজের পার্সোনাল পোর্টফোলিও ওয়েবসাইটও তৈরি করেছেন।`
              : `Jaber actively uses **AI Tools** to streamline graphic design ideation, video scripting, and production workflows—and leveraged AI tools while building his own creative portfolio website.`
          );
          break;

        case 'office_computer':
          parts.push(
            lang === 'bn'
              ? `**কম্পিউটার অপারেটর ও অফিস দক্ষতা:**\n• সফটওয়্যার: MS Word, Excel, PowerPoint, Google Sheets ও Google Workspace।\n• অভিজ্ঞতা: আল মানার হোস্টেলে ১০ মাস ডেটা এন্ট্রি, নথিপত্র সংরক্ষণ, নোটিশ তৈরি ও দৈনিক আর্থিক হিসাব পরিচালনা।\n• অপারেটিং সিস্টেম: **Windows, macOS এবং Linux**—তিনটি সিস্টেমেই কাজ করতে সক্ষম।`
              : `**Office & Computer Skills:**\n• Proficient in Microsoft Word, Excel, PowerPoint, Google Sheets, Data Entry, Documentation, and Basic Accounts Management (backed by 10 months at Al Manar Hostel).\n• Comfortable operating across **Windows, macOS, and Linux**.`
          );
          break;

        case 'contact':
          parts.push(
            lang === 'bn'
              ? `**সরাসরি যোগাযোগের তথ্য:**\n• **ফোন:** ${JABER_CV_DATA.contact.phones.join(', ')}\n• **ইমেইল:** ${JABER_CV_DATA.contact.emails.slice(0, 2).join(', ')} (বা ${email})\n• **ফেসবুক:** ${JABER_CV_DATA.contact.facebook}\n• **লিঙ্কডইন:** ${JABER_CV_DATA.contact.linkedin}\n• **টেলিগ্রাম:** ${tg}`
              : lang === 'ar'
              ? `**معلومات التواصل المباشر:**\n• الهاتف: ${JABER_CV_DATA.contact.phones.join(', ')}\n• البريد الإلكتروني: ${JABER_CV_DATA.contact.emails.slice(0, 2).join(', ')}\n• تيليجرام: ${tg}`
              : `**Direct Contact Details:**\n• **Phone:** ${JABER_CV_DATA.contact.phones.join(', ')}\n• **Email:** ${JABER_CV_DATA.contact.emails.slice(0, 2).join(', ')} (or ${email})\n• **LinkedIn:** ${JABER_CV_DATA.contact.linkedin}\n• **Facebook:** ${JABER_CV_DATA.contact.facebook}\n• **Telegram:** ${tg}`
          );
          break;

        case 'address':
          parts.push(
            lang === 'bn'
              ? `**ঠিকানা:**\n• **বর্তমান ঠিকানা:** ${JABER_CV_DATA.contact.currentAddressBn}।\n• **স্থায়ী ঠিকানা:** ${JABER_CV_DATA.contact.permanentAddressBn}।`
              : `**Addresses:**\n• **Current Location:** ${JABER_CV_DATA.contact.currentAddress}\n• **Permanent Address:** ${JABER_CV_DATA.contact.permanentAddress}`
          );
          break;

        case 'personal': {
          const p = JABER_CV_DATA.personalDetails;
          parts.push(
            lang === 'bn'
              ? `**ব্যক্তিগত তথ্য:**\n• **পিতার নাম:** ${p.fatherNameBn} | **মাতার নাম:** ${p.motherNameBn}\n• **জন্ম তারিখ:** ${p.dateOfBirthBn} | **বৈবাহিক অবস্থা:** ${p.maritalStatusBn}\n• **রক্তের গ্রুপ:** ${p.bloodGroup} | **উচ্চতা:** ${p.height} | **ওজন:** ${p.weight}\n• **জাতীয়তা:** ${p.nationalityBn} | **ধর্ম:** ${p.religionBn}`
              : `**Personal Details:**\n• **Father:** ${p.fatherName} | **Mother:** ${p.motherName}\n• **Date of Birth:** ${p.dateOfBirth} | **Marital Status:** ${p.maritalStatus}\n• **Blood Group:** ${p.bloodGroup} | **Height:** ${p.height} | **Weight:** ${p.weight}\n• **Nationality:** ${p.nationality} | **Religion:** ${p.religion}`
          );
          break;
        }

        case 'languages':
          parts.push(
            lang === 'bn'
              ? `**ভাষাগত দক্ষতা:**\n• **বাংলা:** পড়া, লেখা ও বলা — তিনটিতেই **উচ্চ (High)** দক্ষতা।\n• **ইংরেজি:** পড়া, লেখা ও বলা — তিনটিতেই **মধ্যম (Medium)** দক্ষতা।`
              : `**Language Proficiency:**\n• **Bangla:** Reading High, Writing High, Speaking High.\n• **English:** Reading Medium, Writing Medium, Speaking Medium.`
          );
          break;

        case 'portfolio_extra':
          parts.push(
            lang === 'bn'
              ? `**পোর্টফোলিও ও সহশিক্ষা কার্যক্রম:**\nতাঁর ভিডিও এডিটিং ও গ্রাফিক ডিজাইনের অফিসিয়াল পোর্টফোলিও ঠিকানা হলো **https://jaberhosain.github.io/**। পাশাপাশি তিনি ডিজিটাল কন্টেন্ট তৈরি, সোশ্যাল মিডিয়া কার্যক্রম ও কমিউনিটি/ট্রেনিং প্রোগ্রামে সক্রিয়ভাবে সহায়তা করেন।`
              : `**Portfolio & Activities:**\nJaber's official portfolio website is **https://jaberhosain.github.io/**, showcasing his Video Editing, Graphic Design, Marketing, and AI projects. Beyond client/studio work, he actively supports training and community-based digital content initiatives.`
          );
          break;
      }
    }

    const text = parts.join('\n\n');
    return {
      text,
      actions: inferAgentActions(query, text, portfolio, lang)
    };
  }

  // Check if the query is close/related to Jaber's domain so we give an approximate idea
  const closeReply = checkCloseRelatedTopic(q, lang);
  if (closeReply) {
    return {
      text: closeReply,
      actions: inferAgentActions(query, closeReply, portfolio, lang)
    };
  }

  // Strictly out-of-scope query fallback — calm, helpful, never repetitive "দুঃখিত"
  const unknownText =
    lang === 'bn'
      ? `আপনি সম্ভবত পোর্টফোলিওর বাইরের একটি নির্দিষ্ট বিষয় জানতে চেয়েছেন—এই মুহূর্তে আমার কাছে এই নির্দিষ্ট তথ্যটি সংরক্ষিত নেই।\n\nতবে ওয়েবসাইট ও সিভি বিশ্লেষণ করে আমি জাবেরের **${videoCount}টি ভিডিও প্রজেক্ট**, **${graphicProjects.length}টি গ্রাফিক ডিজাইন গ্রুপ**, **১.১ বছরের কাজের অভিজ্ঞতা**, **আলিম/দাখিল রেজাল্ট**, **সফটওয়্যার ও AI স্কিল** কিংবা **যোগাযোগ ও বেতন** নিয়ে বিস্তারিত তথ্য দিতে পারব—কোনটি জানতে চান?`
      : lang === 'ar'
      ? `هذه المعلومة المحددة غير متوفرة لدي حالياً خارج نطاق السيرة الذاتية ومعرض الأعمال. يمكنني تزويدك بتفاصيل دقيقة حول **${videoCount} فيديو** و **${graphicProjects.length} مشاريع تصميم** وخبرات جابر العملية ومؤهلاته وكيفية التواصل معه.`
      : `I don't have that exact external detail stored here right now. Based on Jaber's live website and CV, I can give you deep details on his **${videoCount} video edits**, **${graphicProjects.length} graphic design groups**, **1.1 years of experience**, **education results**, **Adobe & AI tools**, or **hiring/contact details**—what would you like to explore?`;

  return {
    text: unknownText,
    actions: inferAgentActions(query, unknownText, portfolio, lang)
  };
}
