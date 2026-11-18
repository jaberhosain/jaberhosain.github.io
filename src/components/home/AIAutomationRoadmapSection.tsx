import React, { useState } from 'react';
import {
  BrainCircuit,
  Workflow,
  Compass,
  TrendingUp,
  Layers,
  CheckCircle2,
  ArrowRight,
  Cpu,
  Video,
  FileSpreadsheet,
  Megaphone,
  ShieldCheck
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Reveal3D } from '../common/Reveal3D';

type RoadmapStepId = 'foundations' | 'prompting' | 'automation' | 'ai-ops' | 'research-ethics';
type ImpactSectorId = 'creative' | 'operations' | 'marketing' | 'knowledge';

interface RoadmapStage {
  id: RoadmapStepId;
  stepNo: string;
  title: string;
  subtitle: string;
  summary: string;
  keyTopics: string[];
  toolsStack: string[];
  realOutput: string;
  researchTask: string;
}

interface ImpactSector {
  id: ImpactSectorId;
  label: string;
  icon: React.ElementType;
  headline: string;
  shiftSummary: string;
  beforeAfter: {
    beforeLabel: string;
    afterLabel: string;
  };
  useCases: string[];
  humanEdge: string;
}

/**
 * Educational Research Hub & Interactive Roadmap on AI, AI Automation & AI Operations.
 * Helps visitors understand core concepts, explore modern industry impact,
 * and follow a structured 5-stage research roadmap right on the site.
 */
export const AIAutomationRoadmapSection: React.FC = () => {
  const { language } = usePortfolio();
  const isBn = language === 'bn';

  const [activeStep, setActiveStep] = useState<RoadmapStepId>('foundations');
  const [activeSector, setActiveSector] = useState<ImpactSectorId>('creative');

  const roadmapStages: RoadmapStage[] = [
    {
      id: 'foundations',
      stepNo: '01',
      title: isBn ? 'AI ও LLM মৌলিক ধারণা' : 'AI & LLM Foundations',
      subtitle: isBn ? 'কৃত্রিম বুদ্ধিমত্তা আসলে কীভাবে কাজ করে' : 'How Artificial Intelligence Reasons',
      summary: isBn
        ? 'AI মানে কেবল একটি চ্যাটবট নয়—এটি ডেটা প্যাটার্ন, ভাষা মডেল (LLM), ভিশন ও অডিও মডেল ব্যবহার করে মানুষের চিন্তার মতো বিশ্লেষণ ও ড্রাফট তৈরির ক্ষমতা।'
        : 'AI goes far beyond simple chatbots—it combines Large Language Models, vision, and audio reasoning to analyze context and generate structured outputs.',
      keyTopics: isBn
        ? [
            'Generative AI বনাম Traditional Software লজিক',
            'টোকেন, কনটেক্সট উইন্ডো ও হ্যালুসিনেশন যাচাই',
            'সঠিক ও ভুল তথ্য যাচাইয়ের গবেষণা পদ্ধতি'
          ]
        : [
            'Generative AI vs rule-based software logic',
            'Context windows, tokens & accuracy verification',
            'Fact-checking & structured research methodology'
          ],
      toolsStack: ['ChatGPT', 'Gemini', 'Claude', 'Perplexity Research'],
      realOutput: isBn
        ? 'যেকোনো জটিল বিষয়, স্ক্রিপ্ট বা ক্লায়েন্ট ব্রিফকে ২ মিনিটে পরিচ্ছন্ন গবেষণা সামারিতে রূপান্তর।'
        : 'Turn dense client briefs or technical topics into verified research briefs in minutes.',
      researchTask: isBn
        ? 'গবেষণা কাজ: একটি নির্দিষ্ট বিষয়ে একই প্রশ্ন ২টি ভিন্ন AI মডেলে করে তথ্যের নির্ভুলতা ও পার্থক্য নোট করুন।'
        : 'Research Task: Test the same analytical prompt across two models and compare factual precision.'
    },
    {
      id: 'prompting',
      stepNo: '02',
      title: isBn ? 'স্ট্রাকচার্ড প্রম্পট ও ক্রিয়েটিভ AI' : 'Prompt Architecture & Media AI',
      subtitle: isBn ? 'সঠিক নির্দেশনা দিয়ে মানসম্মত আউটপুট নেওয়া' : 'Precision Prompting for Real Studio Output',
      summary: isBn
        ? 'সাধারণ প্রম্পটে সাধারণ উত্তর আসে। রোল, কনটেক্সট, টোন এবং ফরম্যাট নির্দিষ্ট করে দিলে AI ভিডিও স্ক্রিপ্ট, ডিজাইন কনসেপ্ট ও সাউন্ড আইডিয়া নির্ভুলভাবে দিতে পারে।'
        : 'Generic prompts produce generic drafts. Assigning clear role, audience context, constraints, and format turns AI into a sharp studio collaborator.',
      keyTopics: isBn
        ? [
            'Role + Context + Constraint ফ্রেমওয়ার্ক',
            'ভিডিও হুক, স্টোরিবোর্ড ও বাংলা/ইংরেজি ভয়েসওভার স্ক্রিপ্ট',
            'AI অডিও ক্লিনআপ, অটো-সাবটাইটেল ও রেফারেন্স জেনারেশন'
          ]
        : [
            'Role + Context + Constraint prompting framework',
            'Retention hooks, storyboards & multilingual scripts',
            'AI audio cleanup, auto-captions & visual ideation'
          ],
      toolsStack: ['ElevenLabs Voice', 'Adobe Enhance', 'Premiere Text Cut', 'Structured Prompts'],
      realOutput: isBn
        ? 'একটি র ফুটেজ বা পণ্যের বিবরণ থেকে ১০টি আলাদা রিলস হুক, ক্যাপশন এবং ভিজ্যুয়াল শট লিস্ট তৈরি।'
        : 'Generate 10 tested hook variations, visual shot lists, and timed captions from one brief.',
      researchTask: isBn
        ? 'গবেষণা কাজ: আপনার পছন্দের একটি ভিডিওর জন্য “Role + Target Audience + 3 Constraints” দিয়ে একটি স্ক্রিপ্ট লিখুন।'
        : 'Research Task: Write a script prompt specifying audience age, retention hook constraint, and tone.'
    },
    {
      id: 'automation',
      stepNo: '03',
      title: isBn ? 'AI ওয়ার্কফ্লো অটোমেশন' : 'AI Workflow Automation',
      subtitle: isBn ? 'এক অ্যাপ থেকে অন্য অ্যাপে স্বয়ংক্রিয় কাজ' : 'Connecting Apps Without Repetitive Manual Work',
      summary: isBn
        ? 'এআই অটোমেশন হলো “Trigger → AI Brain → Action”। যেমন: কেউ ফর্ম পূরণ করলে বা নতুন ফাইল এলে AI নিজেই সেটি পড়ে সামারি বানিয়ে Google Sheet ও মেসেজে পাঠিয়ে দেবে।'
        : 'AI Automation links Triggers, an AI reasoning step, and Actions—so incoming forms, files, or messages are automatically categorized, summarized, and routed.',
      keyTopics: isBn
        ? [
            'Trigger, Webhook ও API সংযোগের মৌলিক ধারণা',
            'Gmail / Form → AI Summary → Google Sheets পাইপলাইন',
            'পুনরাবৃত্তিমূলক ডেটা এন্ট্রি সময় ৭০%+ কমানো'
          ]
        : [
            'Triggers, Webhooks & clean API logic basics',
            'Form / Email → AI Analysis → Google Sheets routing',
            'Eliminating repetitive manual copy-paste tasks'
          ],
      toolsStack: ['Make (Integromat)', 'n8n Workflows', 'Zapier', 'Google Apps Script'],
      realOutput: isBn
        ? 'ক্লায়েন্ট অর্ডার বা ইনকোয়ারি আসার সাথে সাথে স্বয়ংক্রিয়ভাবে প্রজেক্ট ফোল্ডার, প্রাইস এস্টিমেট ও টাস্ক কার্ড তৈরি।'
        : 'Automatically create organized client briefs, spreadsheet logs, and project folders on inquiry.',
      researchTask: isBn
        ? 'গবেষণা কাজ: আপনার দৈনন্দিন ৩টি পুনরাবৃত্ত কাজ চিহ্নিত করে “Trigger → Process → Output” ফ্লোচার্ট আঁকুন।'
        : 'Research Task: Map 3 weekly repetitive tasks into a Trigger → AI Step → Action diagram.'
    },
    {
      id: 'ai-ops',
      stepNo: '04',
      title: isBn ? 'AI অপারেশনস (AIOps / Business Ops)' : 'AI Operations & Systems',
      subtitle: isBn ? 'পুরো অফিস, মিডিয়া ও আইটি সিস্টেম পরিচালনা' : 'Scaling Entire Creative & IT Operations',
      summary: isBn
        ? 'AI Operations বা এআই অপারেশন মানে শুধু একটি টুল চালানো নয়—বরং পুরো ব্যবসা বা স্টুডিওর কনটেন্ট ক্যালেন্ডার, ডেটাবেস, কাস্টমার সাপোর্ট ও আইটি সিস্টেমকে একটি সুশৃঙ্খল অটোমেটেড কাঠামোতে পরিচালনা করা।'
        : 'AI Operations integrates content calendars, spreadsheets, customer knowledge bases, and IT monitoring into one reliable, human-supervised operating system.',
      keyTopics: isBn
        ? [
            'সেন্ট্রাল নলেজ বেস ও কাস্টম AI অ্যাসিস্ট্যান্ট',
            'ভিডিও/ডিজাইন প্রজেক্ট ট্র্যাকিং ও ক্লায়েন্ট আপডেট সিস্টেম',
            'Error হ্যান্ডলিং, ব্যাকআপ ও হিউম্যান কোয়ালিটি চেক'
          ]
        : [
            'Central knowledge bases & custom studio agents',
            'Automated asset tracking & client status reporting',
            'Fallback handling, backups & human QA checkpoints'
          ],
      toolsStack: ['Custom AI Agents', 'Google Workspace Ops', 'Notion / Sheets DB', 'API Bridges'],
      realOutput: isBn
        ? 'একা মানুষই একজন ছোট এজেন্সির সমান কনটেন্ট, অ্যাকাউন্টস এবং ক্লায়েন্ট অপারেশন নির্ভুলভাবে সামলাতে পারা।'
        : 'One organized operator managing multi-channel output with agency-grade consistency.',
      researchTask: isBn
        ? 'গবেষণা কাজ: একটি ভিডিও বা অফিস প্রজেক্টের ফোল্ডার নাম, স্ট্যাটাস এবং অটোমেটেড ক্লায়েন্ট আপডেট সিস্টেম ডিজাইন করুন।'
        : 'Research Task: Design a folder naming & spreadsheet tracking schema ready for automation.'
    },
    {
      id: 'research-ethics',
      stepNo: '05',
      title: isBn ? 'গবেষণা, নীতি ও মানবিক সৃজনশীলতা' : 'Research, Ethics & Human Taste',
      subtitle: isBn ? 'এআই যুগে মানুষ কীভাবে এগিয়ে থাকবে' : 'Where Human Judgment Always Wins',
      summary: isBn
        ? 'AI দ্রুত খসড়া তৈরি করে, কিন্তু দর্শকের আবেগ, সাংস্কৃতিক বোধ, নৈতিকতা এবং প্রিমিয়াম ডিজাইন রুচি একমাত্র মানুষের হাতেই থাকে। সঠিক গবেষণা ও মানবিক ছোঁয়াই আসল পার্থক্য গড়ে দেয়।'
        : 'AI accelerates execution speed, yet cultural nuance, ethics, storytelling empathy, and visual taste remain distinctly human advantages.',
      keyTopics: isBn
        ? [
            'কপিরাইট, প্রাইভেসি ও নিরাপদ ডেটা ব্যবহার',
            'AI-generated একঘেয়েমি এড়িয়ে মৌলিক ভিজ্যুয়াল স্টাইল গড়া',
            'ক্রমাগত শেখা ও নতুন টুলস মূল্যায়নের গবেষণামুখী অভ্যাস'
          ]
        : [
            'Data privacy, copyright & responsible AI usage',
            'Avoiding generic AI aesthetics with original craft',
            'Continuous benchmarking & real tool evaluation'
          ],
      toolsStack: ['Human Direction', 'Source Verification', 'Brand Guidelines', 'Portfolio Proof'],
      realOutput: isBn
        ? 'প্রযুক্তিগত গতি + মানুষের রুচিশীল ভিজ্যুয়াল ডিরেকশনের মাধ্যমে প্রিমিয়াম মার্কেট ভ্যালু তৈরি।'
        : 'High-trust creative work blending AI efficiency with unmistakable human craft.',
      researchTask: isBn
        ? 'গবেষণা কাজ: প্রতিদিন ১৫ মিনিট নতুন ১টি AI কেস স্টাডি পড়ে নিজের কাজের একটি অংশ উন্নত করার নোট তৈরি করুন।'
        : 'Research Task: Review one real AI workflow case study daily and document one practical takeaway.'
    }
  ];

  const impactSectors: ImpactSector[] = [
    {
      id: 'creative',
      label: isBn ? 'ভিডিও এডিটিং ও ডিজাইন' : 'Video & Graphic Craft',
      icon: Video,
      headline: isBn
        ? 'রাফ-কাট, সাবটাইটেল ও কনসেপ্টের গতি কয়েক গুণ বেড়েছে'
        : 'Rough-Cut Prep, Audio Cleanup & Concept Speed Multiplied',
      shiftSummary: isBn
        ? 'আগে একটি ভিডিওর অডিও পরিষ্কার করা, বাংলা-ইংরেজি সাবটাইটেল টাইপ করা বা ব্যাকগ্রাউন্ড রিমুভ করতে ঘণ্টার পর ঘণ্টা লাগত। এখন AI সেগুলো মিনিটে করে দেয়—যাতে এডিটর পুরো মনোযোগ গল্প ও কালার গ্রেডিংয়ে দিতে পারেন।'
        : 'Tasks like voice denoising, transcript cutting, rotoscoping, and initial color matching now take minutes instead of hours—freeing editors to focus on pacing, emotion, and visual craft.',
      beforeAfter: {
        beforeLabel: isBn ? 'আগে: ৬০% সময় যেত ম্যানুয়াল ক্লিনিং ও ক্যাপশনে' : 'Before: 60% time spent on manual cleanup & captions',
        afterLabel: isBn ? 'এখন: মূল ফোকাস স্টোরিটেলিং, কালার ও সাউন্ড ডিজাইনে' : 'Today: Focus shifts to story pacing, color & sound taste'
      },
      useCases: isBn
        ? [
            'ভয়েস এনহ্যান্স ও নয়েজ রিমুভাল',
            'টেক্সট-বেজড ভিডিও রাফ-কাট',
            'থাম্বনেইল ও কালার মুডবোর্ড আইডিয়েশন'
          ]
        : ['Studio-grade voice isolation', 'Transcript-driven rough cuts', 'Moodboard & thumbnail prototyping'],
      humanEdge: isBn
        ? 'হিউম্যান এজ: কোন ফ্রেমে দর্শক থামবে এবং কোন মিউজিক আবেগ তৈরি করবে—তা কেবল একজন দক্ষ এডিটরই বোঝেন।'
        : 'Human Edge: Pacing tension, humor timing, and emotional restraint still belong 100% to human editors.'
    },
    {
      id: 'operations',
      label: isBn ? 'অফিস, ডেটা ও আইটি' : 'Office, Data & IT Ops',
      icon: FileSpreadsheet,
      headline: isBn
        ? 'রিপোর্টিং, ফাইল ম্যানেজমেন্ট ও ডকুমেন্টেশন এখন অটোমেটেড'
        : 'Spreadsheets, Documentation & IT Workflows Automated',
      shiftSummary: isBn
        ? 'কম্পিউটার অপারেশন ও অফিসে আগে শত শত মেইল পড়া, Excel ফর্মুলা খোঁজা বা ডকুমেন্ট ফরম্যাট করতে প্রচুর শ্রম লাগত। AI ওয়ার্কফ্লো এখন নির্ভুল ফর্মুলা, ডেটা সামারি ও অটো-রিপোর্ট তৈরি করে দিচ্ছে।'
        : 'Office teams and IT operators now use AI to generate Excel formulas, audit logs, summarize long PDFs, draft clean correspondence, and automate repetitive sheet updates.',
      beforeAfter: {
        beforeLabel: isBn ? 'আগে: প্রতিটি শীট ও মেইল হাতে মিলিয়ে লেখা' : 'Before: Manual formulas, sorting & repetitive typing',
        afterLabel: isBn ? 'এখন: স্মার্ট টেমপ্লেট, ভ্যালিডেশন ও তাৎক্ষণিক সামারি' : 'Today: Automated routing, validation & instant briefs'
      },
      useCases: isBn
        ? [
            'Google Sheets ও Excel অটো-রিপোর্ট',
            'বাংলা-ইংরেজি প্রফেশনাল ডকুমেন্ট ড্রাফট',
            'IT সিস্টেম ও সফটওয়্যার ট্রাবলশুটিং'
          ]
        : ['Automated Sheet formulas & summaries', 'Clean bilingual document drafting', 'Faster IT diagnostics & documentation'],
      humanEdge: isBn
        ? 'হিউম্যান এজ: তথ্যের নিরাপত্তা, আর্থিক হিসাবের চূড়ান্ত যাচাই এবং প্রাতিষ্ঠানিক দায়িত্বশীলতা।'
        : 'Human Edge: Data privacy governance, final financial verification, and accountable decision-making.'
    },
    {
      id: 'marketing',
      label: isBn ? 'সোশ্যাল মিডিয়া ও ব্যবসা' : 'Social Media & Marketing',
      icon: Megaphone,
      headline: isBn
        ? 'ডাটা-নির্ভর কনটেন্ট ও দ্রুত অ্যাড ভ্যারিয়েশন টেস্টিং'
        : 'Audience Research & Rapid Campaign Creative Testing',
      shiftSummary: isBn
        ? 'বর্তমান মেটা ও ডিজিটাল মার্কেটিংয়ে দর্শকের আচরণ বিশ্লেষণ করে দ্রুত একাধিক অ্যাড কপি, রিলস হুক এবং ল্যান্ডিং মেসেজ তৈরি করতে AI সরাসরি ব্যবহৃত হচ্ছে।'
        : 'Modern brands leverage AI to analyze audience objections, localize ad angles, and test multiple hook creatives faster without burning out creative teams.',
      beforeAfter: {
        beforeLabel: isBn ? 'আগে: একটি ক্যাম্পেইনের আইডিয়া ও কপি বানাতে কয়েক দিন' : 'Before: Days to brainstorm & adapt ad variations',
        afterLabel: isBn ? 'এখন: কয়েক ঘণ্টায় রিসার্চ-ভিত্তিক ভিজ্যুয়াল ও অ্যাড সেট' : 'Today: Data-backed angles tested in hours'
      },
      useCases: isBn
        ? [
            'টার্গেট অডিয়েন্স পেইন-পয়েন্ট বিশ্লেষণ',
            'মেটা অ্যাডস হুক ও ক্যাপশন ভ্যারিয়েশন',
            'কাস্টমার FAQ ও তাৎক্ষণিক রেসপন্স গাইড'
          ]
        : ['Audience pain-point clustering', 'Meta Ads hook & copy matrices', 'Smart FAQ assistant responses'],
      humanEdge: isBn
        ? 'হিউম্যান এজ: স্থানীয় সংস্কৃতি, মানুষের বিশ্বাস অর্জন ও ব্র্যান্ডের নিজস্ব কণ্ঠস্বর ধরে রাখা।'
        : 'Human Edge: Cultural empathy, genuine community trust, and memorable brand voice.'
    },
    {
      id: 'knowledge',
      label: isBn ? 'শিক্ষা ও নিজের গবেষণা' : 'Learning & Research',
      icon: BrainCircuit,
      headline: isBn
        ? 'যেকোনো নতুন স্কিল শেখার ব্যক্তিগত টিউটর এখন হাতের মুঠোয়'
        : 'Interactive Personal Research Tutor in Every Language',
      shiftSummary: isBn
        ? 'গবেষণা ও পড়াশোনার জগতে AI সবচেয়ে বড় বিপ্লব এনেছে। জটিল ইংরেজি ডকুমেন্টেশন, কোডিং বা টেকনিক্যাল বিষয়কে সহজ বাংলায় উদাহরণসহ ধাপে ধাপে বোঝা এখন সবার জন্য উন্মুক্ত।'
        : 'Students and creators can now break down complex documentation, practice interview/viva questions, and explore new disciplines with step-by-step bilingual clarity.',
      beforeAfter: {
        beforeLabel: isBn ? 'আগে: সঠিক গাইডলাইন খুঁজতে মাসের পর মাস ব্যয়' : 'Before: Scattered tutorials without clear sequence',
        afterLabel: isBn ? 'এখন: সুনির্দিষ্ট রোডম্যাপ ও তাৎক্ষণিক প্র্যাকটিস ফিডব্যাক' : 'Today: Structured roadmaps & instant Q&A practice'
      },
      useCases: isBn
        ? [
            'সফটওয়্যার ও এডিটিং ভাইভা প্রস্তুতি',
            'বিদেশি রিসার্চ পেপার ও আর্টিকেল অনুবাদ-বিশ্লেষণ',
            'ধাপে ধাপে প্রজেক্ট-ভিত্তিক অনুশীলন'
          ]
        : ['Technical viva & portfolio prep', 'Deep synthesis of articles & docs', 'Step-by-step project exercises'],
      humanEdge: isBn
        ? 'হিউম্যান এজ: কৌতূহল, নিয়মিত প্র্যাকটিস এবং অর্জিত জ্ঞানকে বাস্তব প্রজেক্টে রূপ দেওয়ার মানসিকতা।'
        : 'Human Edge: Curiosity, disciplined daily practice, and real-world execution.'
    }
  ];

  const currentStage = roadmapStages.find((s) => s.id === activeStep) || roadmapStages[0];
  const currentSector = impactSectors.find((s) => s.id === activeSector) || impactSectors[0];
  const currentStageIndex = roadmapStages.findIndex((s) => s.id === activeStep);

  return (
    <section
      id="ai-roadmap"
      aria-label={isBn ? 'এআই ও অটোমেশন গবেষণা রোডম্যাপ' : 'AI & Automation Research Roadmap'}
      className="py-16 sm:py-24 bg-[#121419]/85 border-t border-white/[0.07] transition-colors"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-14">
        {/* 1. SECTION HEADER + CORE DEFINITION CARDS (What is AI vs AI Automation/Operations) */}
        <div className="space-y-8">
          <Reveal3D direction="left" className="max-w-3xl space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#E4583B] block">
              {isBn
                ? 'এআই রিসার্চ ল্যাব · অটোমেশন ও অপারেশন'
                : 'AI RESEARCH HUB · AUTOMATION & OPERATIONS'}
            </span>
            <h2 className="font-display text-2xl sm:text-4xl lg:text-[42px] font-bold text-[#F4F0E8] tracking-tight leading-[1.12]">
              {isBn
                ? 'AI ও AI অটোমেশন আসলে কী — এবং এটি কীভাবে পৃথিবী বদলে দিচ্ছে?'
                : 'What Are AI & AI Operations — And How Do They Work Today?'}
            </h2>
            <p className="text-xs sm:text-[15px] text-[#9A958C] leading-relaxed">
              {isBn
                ? 'কৃত্রিম বুদ্ধিমত্তা (AI) শুধু চ্যাট করার মাধ্যম নয়; এটি বোঝা, গবেষণা করা এবং কাজকে অটোমেট করার সম্পূর্ণ নতুন এক প্রযুক্তি। নিচের গাইড ও রোডম্যাপ থেকে সহজ ভাষায় জেনে নিন এবং নিজেও গবেষণা শুরু করুন।'
                : 'Explore the practical difference between AI, AI Workflow Automation, and AI Operations—plus a 5-stage research roadmap you can study step by step.'}
            </p>
          </Reveal3D>

          {/* 3 Editorial Concept Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            <Reveal3D direction="up" delay={0}>
              <div className="h-full p-6 rounded-[22px] editorial-card-surface space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl editorial-sand-band border flex items-center justify-center text-[#E4583B]">
                    <BrainCircuit className="w-5 h-5" strokeWidth={1.7} />
                  </span>
                  <span className="text-[11px] font-mono text-[#9A958C]">01 · CONCEPT</span>
                </div>
                <h3 className="font-display text-lg font-bold text-[#F4F0E8]">
                  {isBn ? 'কৃত্রিম বুদ্ধিমত্তা (AI) কী?' : 'What is AI?'}
                </h3>
                <p className="text-xs sm:text-sm text-[#9A958C] leading-relaxed">
                  {isBn
                    ? 'এমন সফটওয়্যার মস্তিষ্ক যা বিশাল তথ্য বিশ্লেষণ করে মানুষের ভাষা বুঝতে, প্রশ্নের যুক্তিসঙ্গত উত্তর দিতে, লেখা তৈরি করতে এবং ছবি, ভিডিও ও অডিও প্রক্রিয়াজাত করতে পারে।'
                    : 'Intelligent models trained on vast knowledge that understand language, context, audio, and visuals—acting like a tireless analytical assistant.'}
                </p>
              </div>
            </Reveal3D>

            <Reveal3D direction="up" delay={75}>
              <div className="h-full p-6 rounded-[22px] editorial-card-surface space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl editorial-sand-band border flex items-center justify-center text-[#E4583B]">
                    <Workflow className="w-5 h-5" strokeWidth={1.7} />
                  </span>
                  <span className="text-[11px] font-mono text-[#9A958C]">02 · MECHANISM</span>
                </div>
                <h3 className="font-display text-lg font-bold text-[#F4F0E8]">
                  {isBn ? 'AI অটোমেশন কী?' : 'What is AI Automation?'}
                </h3>
                <p className="text-xs sm:text-sm text-[#9A958C] leading-relaxed">
                  {isBn
                    ? 'একের পর এক আলাদা সফটওয়্যারকে (যেমন ফর্ম, ইমেইল, Google Sheet, ভিডিও টুল) AI-এর সাথে সংযুক্ত করে দেওয়া—যাতে একটি কাজ শেষ হলেই পরের ধাপ স্বয়ংক্রিয়ভাবে সম্পন্ন হয়।'
                    : 'Connecting apps together with an AI reasoning step in the middle—so emails, leads, sheets, and media prep run automatically on triggers.'}
                </p>
              </div>
            </Reveal3D>

            <Reveal3D direction="up" delay={150}>
              <div className="h-full p-6 rounded-[22px] editorial-card-surface space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl editorial-sand-band border flex items-center justify-center text-[#E4583B]">
                    <Layers className="w-5 h-5" strokeWidth={1.7} />
                  </span>
                  <span className="text-[11px] font-mono text-[#9A958C]">03 · OPERATIONS</span>
                </div>
                <h3 className="font-display text-lg font-bold text-[#F4F0E8]">
                  {isBn ? 'AI অপারেশন (AIOps) কী?' : 'What is AI Operations?'}
                </h3>
                <p className="text-xs sm:text-sm text-[#9A958C] leading-relaxed">
                  {isBn
                    ? 'ব্যক্তিগত বা প্রতিষ্ঠানের দৈনন্দিন পুরো কাজের কাঠামো (কনটেন্ট প্রোডাকশন, ডেটাবেস, ক্লায়েন্ট সাপোর্ট ও আইটি মেইনটেন্যান্স) নিরাপদ নিয়মে AI সিস্টেম দিয়ে পরিচালনা করার বিজ্ঞান।'
                    : 'Organizing an entire studio, office, or IT pipeline—knowledge base, backups, reporting, and delivery—to run reliably with human oversight.'}
                </p>
              </div>
            </Reveal3D>
          </div>
        </div>

        {/* 2. INTERACTIVE 5-STAGE AI RESEARCH ROADMAP (Two-Zone Sandbox Pattern) */}
        <Reveal3D direction="up">
          <div className="editorial-card-surface rounded-[24px] sm:rounded-[30px] overflow-hidden">
            <div className="px-6 sm:px-8 py-5 border-b border-black/[0.07] dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-[#E4583B]" />
                <h3 className="font-display text-lg sm:text-xl font-bold text-[#F4F0E8]">
                  {isBn
                    ? 'AI ও অটোমেশন গবেষণার ৫ ধাপের রোডম্যাপ'
                    : '5-Stage AI & Automation Research Roadmap'}
                </h3>
              </div>
              <span className="text-xs font-mono text-[#9A958C]">
                {isBn ? 'প্রতিটি ধাপে ক্লিক করে গবেষণা শুরু করুন' : 'Select any stage to inspect research plan'}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              {/* Left Stage List */}
              <div className="lg:col-span-5 p-4 sm:p-6 space-y-2 border-b lg:border-b-0 lg:border-r border-black/[0.07] dark:border-white/[0.08]">
                {roadmapStages.map((stage) => {
                  const isActive = stage.id === activeStep;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => setActiveStep(stage.id)}
                      className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left rtl:text-right flex items-start gap-3.5 transition-all cursor-pointer active:scale-[0.99] ${
                        isActive
                          ? 'obsidian-island border-[#E4583B] shadow-md'
                          : 'editorial-sand-band hover:border-[#E4583B]/45'
                      }`}
                    >
                      <span
                        className={`font-mono text-xs font-bold px-2 py-1 rounded-lg shrink-0 ${
                          isActive
                            ? 'bg-[#E4583B] text-white'
                            : 'editorial-card-surface text-[#9A958C]'
                        }`}
                      >
                        {stage.stepNo}
                      </span>
                      <div className="min-w-0">
                        <div
                          className={`text-sm font-bold leading-snug ${
                            isActive ? 'text-[#F4F0E8]' : 'text-[#F4F0E8]'
                          }`}
                        >
                          {stage.title}
                        </div>
                        <div className="text-[11px] text-[#9A958C] mt-0.5 leading-snug">
                          {stage.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Deep-Dive Research Pane */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#9A958C]">
                    <span>
                      {isBn
                        ? `ধাপ ${currentStage.stepNo} / ০৫`
                        : `Stage ${currentStage.stepNo} of 05`}
                    </span>
                    <span className="text-[#E4583B] font-semibold">
                      {currentStage.subtitle}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-display text-xl sm:text-2xl font-bold text-[#F4F0E8] mb-2">
                      {currentStage.title}
                    </h4>
                    <p className="text-xs sm:text-[15px] text-[#DDD1BE] leading-relaxed">
                      {currentStage.summary}
                    </p>
                  </div>

                  {/* Key Study Topics */}
                  <div className="space-y-2.5 pt-1">
                    <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#9A958C]">
                      {isBn ? 'যে বিষয়গুলো নিয়ে গবেষণা করবেন' : 'CORE STUDY TOPICS'}
                    </div>
                    <ul className="space-y-2">
                      {currentStage.keyTopics.map((topic, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-[#F4F0E8]"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Unboxed Tools Metadata */}
                  <div className="pt-2 border-t border-black/[0.07] dark:border-white/[0.08] flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#9A958C]">
                    <span className="font-semibold text-[#F4F0E8]">
                      {isBn ? 'টুলস ও প্ল্যাটফর্ম:' : 'Research Stack:'}
                    </span>
                    {currentStage.toolsStack.map((tool, tIdx) => (
                      <React.Fragment key={tool}>
                        <span>{tool}</span>
                        {tIdx < currentStage.toolsStack.length - 1 && (
                          <span aria-hidden="true">·</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Practical Output & Actionable Task Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-4 rounded-2xl editorial-sand-band border space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#E4583B] block">
                        {isBn ? 'বাস্তব আউটপুট' : 'REAL OUTPUT'}
                      </span>
                      <p className="text-xs text-[#DDD1BE] leading-relaxed">
                        {currentStage.realOutput}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl editorial-sand-band border space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500 block">
                        {isBn ? 'আপনার অনুশীলন' : 'RESEARCH EXERCISE'}
                      </span>
                      <p className="text-xs text-[#DDD1BE] leading-relaxed">
                        {currentStage.researchTask}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Step Navigation */}
                <div className="flex items-center justify-between pt-3 border-t border-black/[0.07] dark:border-white/[0.08]">
                  <span className="text-xs text-[#9A958C]">
                    {isBn
                      ? 'ক্রম অনুযায়ী ধাপগুলো অনুসরণ করুন'
                      : 'Progress sequentially for full mastery'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const nextStage =
                        roadmapStages[(currentStageIndex + 1) % roadmapStages.length];
                      setActiveStep(nextStage.id);
                    }}
                    className="inline-flex items-center gap-2 px-5 min-h-[40px] py-2 rounded-full glass-pill-cta text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                  >
                    <span>
                      {currentStageIndex === roadmapStages.length - 1
                        ? isBn
                          ? 'প্রথম ধাপে যান'
                          : 'Restart Roadmap'
                        : isBn
                        ? 'পরবর্তী ধাপ'
                        : 'Next Stage'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Reveal3D>

        {/* 3. MODERN WORLD AI IMPACT EXPLORER */}
        <Reveal3D direction="up" delay={60}>
          <div className="obsidian-island rounded-[24px] sm:rounded-[30px] border border-white/10 p-6 sm:p-9 space-y-6 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)]">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#E4583B] mb-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>
                    {isBn
                      ? 'বর্তমান সময়ে এআই-এর বাস্তব ইমপ্যাক্ট'
                      : 'REAL-WORLD AI IMPACT TODAY'}
                  </span>
                </div>
                <h3 className="font-display text-xl sm:text-3xl font-bold text-[#F4F0E8] tracking-tight">
                  {isBn
                    ? 'বর্তমানে কোন কোন খাতে এআই কতটা প্রভাব ফেলছে?'
                    : 'How AI Reshapes Daily Workflows Across Industries'}
                </h3>
              </div>

              {/* Interactive Sector Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                {impactSectors.map((sec) => {
                  const SIcon = sec.icon;
                  const active = sec.id === activeSector;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setActiveSector(sec.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 min-h-[38px] py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        active ? 'glass-pill-cta' : 'glass-pill-ghost'
                      }`}
                    >
                      <SIcon className="w-3.5 h-3.5" />
                      <span>{sec.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Sector Reality Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 items-stretch">
              <div className="lg:col-span-7 space-y-4">
                <h4 className="font-display text-lg sm:text-2xl font-bold text-[#F4F0E8]">
                  {currentSector.headline}
                </h4>
                <p className="text-xs sm:text-sm text-[#DDD1BE] leading-relaxed">
                  {currentSector.shiftSummary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#9A958C] block mb-1">
                      {isBn ? 'পুরোনো ধারা' : 'LEGACY PACE'}
                    </span>
                    <p className="text-xs text-[#DDD1BE] leading-snug">
                      {currentSector.beforeAfter.beforeLabel}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#E4583B]/12 border border-[#E4583B]/35">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#F07C63] block mb-1">
                      {isBn ? 'এআই-সমর্থিত বর্তমান' : 'AI-ASSISTED REALITY'}
                    </span>
                    <p className="text-xs text-[#F4F0E8] font-medium leading-snug">
                      {currentSector.beforeAfter.afterLabel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 p-5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#A7A298] flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#E4583B]" />
                    <span>{isBn ? 'বাস্তব প্রয়োগসমূহ' : 'PRACTICAL USE CASES'}</span>
                  </div>
                  <ul className="space-y-2">
                    {currentSector.useCases.map((uc, uIdx) => (
                      <li
                        key={uIdx}
                        className="flex items-start gap-2 text-xs sm:text-sm text-[#F4F0E8]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{uc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-start gap-2.5 text-xs text-[#DDD1BE] leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-[#E4583B] shrink-0 mt-0.5" />
                  <span>{currentSector.humanEdge}</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal3D>
      </div>
    </section>
  );
};
