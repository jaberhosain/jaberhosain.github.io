import React, { useState, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  ListChecks,
  Clock,
  Gift,
  ArrowRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
  Film,
  Palette,
  Headphones,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Reveal3D } from '../common/Reveal3D';

type QuizTopic = 'all' | 'purpose' | 'visual_color' | 'sound';
type ArenaState = 'MENU' | 'PLAYING' | 'RESULT';

interface McqQuestion {
  id: string;
  topic: Exclude<QuizTopic, 'all'>;
  topicLabel: { en: string; bn: string };
  question: { en: string; bn: string };
  options: { en: string; bn: string }[];
  correctIndex: number;
  explanation: { en: string; bn: string };
}

interface CreativeGameArenaProps {
  variant?: 'section' | 'page';
}

const MCQ_BANK: McqQuestion[] = [
  {
    id: 'mcq-1',
    topic: 'purpose',
    topicLabel: {
      bn: 'ভিডিও এডিটিং কেন শিখবেন',
      en: 'Why Learn Video Editing'
    },
    question: {
      bn: 'বর্তমান ডিজিটাল সময়ে ভিডিও এডিটিং শেখার সবচেয়ে বড় কারণ কোনটি?',
      en: 'What is the biggest reason to learn video editing in today’s digital economy?'
    },
    options: [
      {
        bn: 'শুধু নিজের ব্যক্তিগত শখের ভিডিও বানানোর জন্য',
        en: 'Only for making casual personal hobby clips'
      },
      {
        bn: 'গল্প বলা, গ্লোবাল ফ্রিল্যান্সিং, ব্র্যান্ড ও কনটেন্ট ক্রিয়েটরদের সাথে হাই-ডিমান্ড ক্যারিয়ার গড়ার জন্য',
        en: 'To master visual storytelling and build a high-demand career with brands, creators & global clients'
      },
      {
        bn: 'কেবল ভারী কম্পিউটার সফটওয়্যার ইনস্টল করে দেখার জন্য',
        en: 'Just to practice installing heavy desktop software'
      },
      {
        bn: 'শুধুমাত্র ফটোগ্রাফি করার বিকল্প হিসেবে',
        en: 'Only as a replacement for still photography'
      }
    ],
    correctIndex: 1,
    explanation: {
      bn: 'বর্তমানে ব্যবসা, শিক্ষা, ইউটিউব, মেটা অ্যাডস এবং ফ্রিল্যান্স মার্কেটপ্লেসে দক্ষ ভিডিও এডিটরের চাহিদা দ্রুত বাড়ছে।',
      en: 'Brands, educators, creators, and remote agencies constantly hire skilled editors who turn raw clips into engaging stories.'
    }
  },
  {
    id: 'mcq-2',
    topic: 'purpose',
    topicLabel: {
      bn: 'বর্তমান যুগে ভিডিও এডিটিংয়ের ব্যবহার',
      en: 'Modern Real-World Uses'
    },
    question: {
      bn: 'বর্তমান যুগে মানুষের দৈনন্দিন ও ব্যবসায়িক জীবনে ভিডিও এডিটিং কোন কাজে সবচেয়ে বেশি ব্যবহৃত হচ্ছে?',
      en: 'How is video editing actively helping people and businesses most right now?'
    },
    options: [
      {
        bn: 'ডিজিটাল মার্কেটিং রিলস, অনলাইন কোর্স, প্রোডাক্ট প্রমোশন ও ডকুমেন্টারি তৈরিতে',
        en: 'Short-form Reels marketing, online courses, product promos & documentary storytelling'
      },
      {
        bn: 'শুধুমাত্র প্রিন্ট করা বইয়ের পাতা সাজাতে',
        en: 'Only for laying out printed paper books'
      },
      {
        bn: 'কেবল ইমেইল পাসওয়ার্ড সংরক্ষণ করতে',
        en: 'Strictly for storing email passwords'
      },
      {
        bn: 'ইন্টারনেট স্পিড বাড়ানোর কাজে',
        en: 'For increasing home Wi-Fi internet bandwidth'
      }
    ],
    correctIndex: 0,
    explanation: {
      bn: 'ই-কমার্স পণ্য বিক্রি, শিক্ষামূলক ভিডিও, পডকাস্ট ক্লিপ ও ব্র্যান্ডের বিশ্বাসযোগ্যতা তৈরিতে ভিডিও এডিটিং এখন মূল চালিকাশক্তি।',
      en: 'From e-commerce conversion Reels to educational lectures and documentaries, edited video drives modern digital communication.'
    }
  },
  {
    id: 'mcq-3',
    topic: 'purpose',
    topicLabel: {
      bn: 'ভালো এডিটরের মূল দক্ষতা',
      en: 'Core Storytelling Craft'
    },
    question: {
      bn: 'একজন পেশাদার ভিডিও এডিটরের আসল কাজ শুধু ক্লিপ কাটা নয়—আরও কোনটি?',
      en: 'Beyond trimming clips, what truly defines a professional video editor?'
    },
    options: [
      {
        bn: 'প্রতি সেকেন্ডে অপ্রয়োজনীয় থ্রিডি ট্রানজিশন বসানো',
        en: 'Adding flashy transitions on every single second'
      },
      {
        bn: 'দর্শকের মনোযোগ ধরে রাখা (Retention), সঠিক রিদম, এবং স্পষ্ট গল্প ফুটিয়ে তোলা',
        en: 'Managing pacing, viewer retention, emotional timing, and clear story flow'
      },
      {
        bn: 'ভিডিওর রেজোলিউশন কমিয়ে ফাইল ছোট রাখা',
        en: 'Lowering video resolution to make files tiny'
      },
      {
        bn: 'কোনো মিউজিক বা টাইপোগ্রাফি ব্যবহার না করা',
        en: 'Avoiding music and typography altogether'
      }
    ],
    correctIndex: 1,
    explanation: {
      bn: 'অতিরিক্ত ইফেক্ট নয়—সঠিক সময়ে কাট, গল্পের ধারাবাহিকতা এবং দর্শকের আগ্রহ ধরে রাখাই দক্ষ এডিটরের পরিচয়।',
      en: 'Strong editors prioritize story clarity, narrative rhythm, and viewer engagement over distracting visual clutter.'
    }
  },
  {
    id: 'mcq-4',
    topic: 'purpose',
    topicLabel: {
      bn: 'আধুনিক কনটেন্ট ও হুক',
      en: 'Retention & Hook Strategy'
    },
    question: {
      bn: 'আধুনিক সোশ্যাল মিডিয়া রিলস বা ইউটিউব ভিডিওতে প্রথম ৩ থেকে ৫ সেকেন্ডের "Hook" কেন অত্যন্ত গুরুত্বপূর্ণ?',
      en: 'Why are the first 3–5 seconds ("The Hook") so critical in modern social video editing?'
    },
    options: [
      {
        bn: 'কারণ সফটওয়্যার রেন্ডার শুরুতেই বন্ধ হয়ে যায়',
        en: 'Because editing software stops rendering after 5 seconds'
      },
      {
        bn: 'দর্শক প্রথম কয়েক সেকেন্ডেই ঠিক করেন ভিডিওটি দেখবেন নাকি স্ক্রল করে চলে যাবেন',
        en: 'Viewers decide within seconds whether to keep watching or scroll past'
      },
      {
        bn: 'এটি কেবল ভিডিওর কপিরাইট লুকানোর জন্য ব্যবহৃত হয়',
        en: 'It is only used to hide copyright watermarks'
      },
      {
        bn: '৫ সেকেন্ড পর অডিও বন্ধ রাখতে হয়',
        en: 'Because audio must fade out after 5 seconds'
      }
    ],
    correctIndex: 1,
    explanation: {
      bn: 'শক্তিশালী ভিজ্যুয়াল হুক, ভয়েস পাঞ্চ ও কাইনেটিক টেক্সট শুরুতেই দর্শকের কৌতূহল তৈরি করে ওয়াচ-টাইম বাড়ায়।',
      en: 'A crisp visual + audio hook triggers curiosity right away, dramatically improving average watch time.'
    }
  },
  {
    id: 'mcq-5',
    topic: 'visual_color',
    topicLabel: {
      bn: 'ভিজ্যুয়াল ও কালার গ্রেডিং',
      en: 'Visuals & Color Grading'
    },
    question: {
      bn: 'ভিডিও এডিটিংয়ে "Color Correction" এবং "Color Grading"-এর মধ্যে মূল পার্থক্য কী?',
      en: 'What is the core difference between Color Correction and Color Grading?'
    },
    options: [
      {
        bn: 'দুটিই একদম একই কাজ, কেবল নাম আলাদা',
        en: 'Both terms mean the exact same step'
      },
      {
        bn: 'Correction ভিডিওর স্বাভাবিক আলো ও হোয়াইট ব্যালেন্স ঠিক করে; Grading সিনেমাটিক মুড ও কালার টোন তৈরি করে',
        en: 'Correction balances natural exposure & white balance; Grading builds cinematic mood and color tone'
      },
      {
        bn: 'Grading দিয়ে কেবল ভিডিওর ভলিউম বাড়ানো হয়',
        en: 'Grading is only used to increase audio volume'
      },
      {
        bn: 'Correction শুধু সাদা-কালো ভিডিওতে করা হয়',
        en: 'Correction is only applied to black-and-white footage'
      }
    ],
    correctIndex: 1,
    explanation: {
      bn: 'প্রথমে সঠিক এক্সপোজার ও স্কিন-টোন (Color Correction) ঠিক করে নিয়ে তারপর গল্পের মুড অনুযায়ী কালার স্টাইল (Color Grading) দেওয়া হয়।',
      en: 'Always fix exposure, contrast, and natural skin tones first (Correction), then apply stylistic mood (Grading).'
    }
  },
  {
    id: 'mcq-6',
    topic: 'visual_color',
    topicLabel: {
      bn: 'ভিজ্যুয়াল ও কালার গ্রেডিং',
      en: 'Color Scopes Precision'
    },
    question: {
      bn: 'শুধু চোখের ওপর নির্ভর না করে কালার গ্রেডিংয়ে "Lumetri Scopes / Waveform" দেখার সুবিধা কী?',
      en: 'Why do editors rely on Waveform & Vectorscope monitors instead of their eyes alone?'
    },
    options: [
      {
        bn: 'মনিটরের ব্রাইটনেস কম-বেশি হলেও স্কোপ দিয়ে এক্সপোজার ও রঙের নিখুঁত পরিমাপ বোঝা যায়',
        en: 'Scopes show objective exposure & color balance regardless of screen brightness differences'
      },
      {
        bn: 'এটি ভিডিওর টাইমলাইন দ্রুত ডিলিট করে দেয়',
        en: 'It deletes unused clips automatically'
      },
      {
        bn: 'এতে অডিও ফাইল mp3-তে রূপান্তরিত হয়',
        en: 'It converts video directly into MP3 audio'
      },
      {
        bn: 'এটি কেবল গেমিং ফ্রেম রেট বাড়ায়',
        en: 'It only boosts gaming monitor refresh rate'
      }
    ],
    correctIndex: 0,
    explanation: {
      bn: 'Waveform, Parade ও Vectorscope ব্যবহার করলে ভিডিও মোবাইল, টিভি বা প্রজেক্টর—সব ডিভাইসে সামঞ্জস্যপূর্ণ কালার ও ব্রাইটনেস বজায় রাখে।',
      en: 'Scopes reveal clipped highlights, crushed shadows, and accurate skin-tone lines across every viewer display.'
    }
  },
  {
    id: 'mcq-7',
    topic: 'visual_color',
    topicLabel: {
      bn: 'ভিজ্যুয়াল স্টোরিটেলিং',
      en: 'Visual Rhythm & B-Roll'
    },
    question: {
      bn: 'একজন মানুষ ক্যামেরার সামনে কথা বলছেন—সেই ভিডিওকে ভিজ্যুয়ালি আকর্ষণীয় ও জীবন্ত করতে "B-Roll" কেন ব্যবহার করা হয়?',
      en: 'Why do editors layer "B-Roll" footage over a talking-head video?'
    },
    options: [
      {
        bn: 'কথার বিষয়বস্তুকে চোখে দেখানো, ভিজ্যুয়াল একঘেয়েমি দূর করা ও কাট স্মুথ করার জন্য',
        en: 'To illustrate spoken points visually, break monotony, and mask jump cuts cleanly'
      },
      {
        bn: 'বক্তার মূল কথা মুছে দেওয়ার জন্য',
        en: 'To erase the speaker’s main voice track'
      },
      {
        bn: 'ভিডিওটি অকারণে বড় করার জন্য',
        en: 'Simply to make export file size larger'
      },
      {
        bn: 'শুধুমাত্র ফুটেজ ব্লার রাখার জন্য',
        en: 'Strictly to keep the screen blurry'
      }
    ],
    correctIndex: 0,
    explanation: {
      bn: 'কথার সাথে প্রাসঙ্গিক B-Roll, মোশন টেক্সট ও হালকা জুম দর্শকের মস্তিষ্কে ভিজ্যুয়াল গল্পটি স্পষ্টভাবে গেঁথে দেয়।',
      en: 'Relevant B-Roll reinforces spoken ideas visually and maintains continuous viewer curiosity.'
    }
  },
  {
    id: 'mcq-8',
    topic: 'visual_color',
    topicLabel: {
      bn: 'কালার ও কনট্রাস্ট',
      en: 'Visual Contrast & Skin Tone'
    },
    question: {
      bn: 'সিনেমাটিক ভিজ্যুয়ালে "Teal & Orange" কালার স্কিম এত জনপ্রিয় কেন?',
      en: 'Why is the "Teal & Orange" palette so widely used in cinema color grading?'
    },
    options: [
      {
        bn: 'মানুষের ত্বকের উষ্ণ রঙ (Orange/Warm) শীতল ব্যাকগ্রাউন্ডের (Teal/Cool) বিপরীতে স্পষ্টভাবে ফুটে ওঠে',
        en: 'Warm natural skin tones separate clearly against cool teal shadows & backgrounds'
      },
      {
        bn: 'কারণ অন্য কোনো রঙ কম্পিউটার সাপোর্ট করে না',
        en: 'Because monitors cannot display any other hues'
      },
      {
        bn: 'এটি ব্যবহার করলে সাউন্ড মিউট হয়ে যায়',
        en: 'Because it automatically mutes background noise'
      },
      {
        bn: 'শুধু কার্টুন এনিমেশনেই ব্যবহার করা যায় বলে',
        en: 'Because it is restricted exclusively to cartoons'
      }
    ],
    correctIndex: 0,
    explanation: {
      bn: 'কমপ্লিমেন্টারি কালার কনট্রাস্ট সাবজেক্টকে ব্যাকগ্রাউন্ড থেকে আলাদা করে গভীরতা (Depth) তৈরি করে।',
      en: 'Complementary warm-vs-cool separation adds immediate visual depth and keeps focus on the human subject.'
    }
  },
  {
    id: 'mcq-9',
    topic: 'sound',
    topicLabel: {
      bn: 'সাউন্ড ডিজাইন',
      en: 'Sound Design & Audio Power'
    },
    question: {
      bn: 'ভিডিও এডিটিংয়ে "Sound Design" (SFX, Whoosh, Ambience) কে ভিডিওর অর্ধেক প্রাণ বলা হয় কেন?',
      en: 'Why is thoughtful Sound Design often called 50% of the entire viewing experience?'
    },
    options: [
      {
        bn: 'কারণ সাউন্ড কেবল ফাইল নাম ঠিক রাখতে সাহায্য করে',
        en: 'Because audio tracks are only needed for file naming'
      },
      {
        bn: 'পরিষ্কার অডিও, অ্যাম্বিয়েন্স ও সঠিক SFX দর্শকের আবেগ তৈরি করে এবং দুর্বল কাটকেও বিশ্বাসযোগ্য করে তোলে',
        en: 'Clean dialogue, subtle ambience, and well-timed SFX drive emotion and make cuts feel seamless'
      },
      {
        bn: 'সাউন্ড থাকলে ভিডিও রেন্ডার করতে হয় না',
        en: 'Because adding SFX skips video exporting'
      },
      {
        bn: 'দর্শক সাধারণত ভিডিওর সাউন্ড একদমই শোনেন না',
        en: 'Because viewers never notice bad audio quality'
      }
    ],
    correctIndex: 1,
    explanation: {
      bn: 'দর্শক হালকা ঝাপসা ভিডিও সহ্য করতে পারেন, কিন্তু কর্কশ বা খারাপ অডিও থাকলে সাথে সাথেই ভিডিও বন্ধ করে দেন।',
      en: 'Audiences forgive minor camera flaws, but poor noisy audio causes viewers to click away immediately.'
    }
  },
  {
    id: 'mcq-10',
    topic: 'sound',
    topicLabel: {
      bn: 'সাউন্ড মিক্সিং ও ক্লিয়ারিটি',
      en: 'Audio Mixing & J/L-Cuts'
    },
    question: {
      bn: 'ভয়েসওভার বা বক্তার কথার নিচে ব্যাকগ্রাউন্ড মিউজিক রাখার সময় পেশাদার নিয়ম কী এবং "J-Cut" কী কাজে লাগে?',
      en: 'How should background music sit beneath dialogue, and why use a "J-Cut"?'
    },
    options: [
      {
        bn: 'মিউজিক ও ভয়েস দুটোই 0 dB-তে রাখলে সবচেয়ে ভালো শোনায়',
        en: 'Both music and voice should peak together at 0 dB'
      },
      {
        bn: 'মিউজিকের ভলিউম কমিয়ে (Ducking) ভয়েস স্পষ্ট রাখতে হয়, আর J-Cut-এ পরের দৃশ্যের সাউন্ড আগে এসে কাট স্মুথ করে',
        en: 'Duck music well below clear dialogue, and J-Cuts bring the next scene’s audio in early for smooth flow'
      },
      {
        bn: 'J-Cut মানে হলো ভিডিওর মাঝখান থেকে মিউজিক কেটে দেওয়া',
        en: 'J-Cut means deleting all music halfway through a clip'
      },
      {
        bn: 'ভয়েস সবসময় মিউজিকের চেয়ে নিচে রাখতে হয়',
        en: 'Dialogue should always stay quieter than background music'
      }
    ],
    correctIndex: 1,
    explanation: {
      bn: 'কথার স্পষ্টতা (-6dB থেকে -12dB) বজায় রেখে মিউজিক নিচে রাখা এবং J-Cut / L-Cut ব্যবহার করলে এডিটিং প্রফেশনাল ও সাবলীল মনে হয়।',
      en: 'Keeping dialogue clear while ducking music—and bridging scenes with J/L-Cuts—creates effortless cinema continuity.'
    }
  }
];

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const SCORE_STORAGE_KEY = 'jabir_mcq_best_score_v1';

function playQuizTone(
  enabled: boolean,
  freq: number,
  duration = 0.09,
  type: OscillatorType = 'sine',
  gainVal = 0.06
) {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.01);
    osc.onended = () => {
      ctx.close().catch(() => {});
    };
  } catch {
    // ignore
  }
}

export const CreativeGameArena: React.FC<CreativeGameArenaProps> = ({
  variant = 'section'
}) => {
  const { language } = usePortfolio();
  const isBn = language === 'bn';

  const [arenaState, setArenaState] = useState<ArenaState>('MENU');
  const [selectedTopic, setSelectedTopic] = useState<QuizTopic>('all');
  const [playerName, setPlayerName] = useState('');
  const [soundOn, setSoundOn] = useState(true);

  const [activeQuestions, setActiveQuestions] = useState<McqQuestion[]>(MCQ_BANK);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [topicTallies, setTopicTallies] = useState<
    Record<Exclude<QuizTopic, 'all'>, { correct: number; total: number }>
  >({
    purpose: { correct: 0, total: 0 },
    visual_color: { correct: 0, total: 0 },
    sound: { correct: 0, total: 0 }
  });

  const [bestPercent, setBestPercent] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const saved = Number(window.localStorage.getItem(SCORE_STORAGE_KEY) || '0');
      return Number.isFinite(saved) ? saved : 0;
    } catch {
      return 0;
    }
  });

  const startQuiz = useCallback(
    (topic: QuizTopic) => {
      const pool =
        topic === 'all' ? MCQ_BANK : MCQ_BANK.filter((q) => q.topic === topic);
      setActiveQuestions(pool.length > 0 ? pool : MCQ_BANK);
      setQuestionIdx(0);
      setSelectedOption(null);
      setCorrectCount(0);
      setTopicTallies({
        purpose: { correct: 0, total: 0 },
        visual_color: { correct: 0, total: 0 },
        sound: { correct: 0, total: 0 }
      });
      setArenaState('PLAYING');
      playQuizTone(soundOn, 540, 0.09, 'triangle');
    },
    [soundOn]
  );

  const handleSelectAnswer = (optionIdx: number) => {
    if (selectedOption !== null) return;
    const currentQ = activeQuestions[questionIdx];
    if (!currentQ) return;

    setSelectedOption(optionIdx);
    const isCorrect = optionIdx === currentQ.correctIndex;

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      playQuizTone(soundOn, 780, 0.12, 'triangle', 0.07);
    } else {
      playQuizTone(soundOn, 240, 0.13, 'sawtooth', 0.045);
    }

    setTopicTallies((prev) => ({
      ...prev,
      [currentQ.topic]: {
        correct: prev[currentQ.topic].correct + (isCorrect ? 1 : 0),
        total: prev[currentQ.topic].total + 1
      }
    }));
  };

  const handleNextQuestion = () => {
    if (questionIdx + 1 >= activeQuestions.length) {
      const pct = Math.round((correctCount / Math.max(1, activeQuestions.length)) * 100);
      if (pct > bestPercent) {
        setBestPercent(pct);
        try {
          window.localStorage.setItem(SCORE_STORAGE_KEY, String(pct));
        } catch {
          // ignore
        }
      }
      playQuizTone(soundOn, 880, 0.18, 'triangle', 0.07);
      setArenaState('RESULT');
    } else {
      setQuestionIdx((i) => i + 1);
      setSelectedOption(null);
      playQuizTone(soundOn, 500, 0.06, 'sine', 0.04);
    }
  };

  const currentQuestion = activeQuestions[questionIdx];
  const scorePercent = Math.round(
    (correctCount / Math.max(1, activeQuestions.length)) * 100
  );

  const getRankLabel = (pct: number) => {
    if (pct >= 85) {
      return isBn
        ? 'প্রো স্টোরিটেলার ও ভিজ্যুয়াল ডিরেক্টর'
        : 'Pro Visual & Sound Storyteller';
    }
    if (pct >= 60) {
      return isBn
        ? 'অগ্রসরমান ক্রিয়েটিভ এডিটর'
        : 'Rising Creative Video Editor';
    }
    return isBn
      ? 'উদীয়মান এডিটিং লার্নার'
      : 'Aspiring Video Creator';
  };

  const topicChoices: { id: QuizTopic; label: string; icon: React.ElementType }[] = [
    {
      id: 'all',
      label: isBn ? 'সম্পূর্ণ কুইজ (১০টি প্রশ্ন)' : 'Full Quiz (10 Questions)',
      icon: Sparkles
    },
    {
      id: 'purpose',
      label: isBn ? 'কেন শিখবেন ও ব্যবহার' : 'Why Editing & Uses',
      icon: Film
    },
    {
      id: 'visual_color',
      label: isBn ? 'ভিজ্যুয়াল ও কালার গ্রেডিং' : 'Visuals & Color Grading',
      icon: Palette
    },
    {
      id: 'sound',
      label: isBn ? 'সাউন্ড ডিজাইন' : 'Sound Design & Audio',
      icon: Headphones
    }
  ];

  return (
    <section
      id="game-zone"
      aria-label={isBn ? 'ভিডিও এডিটিং এমসিকিউ গেম' : 'Video Editor MCQ Challenge'}
      className={`${
        variant === 'page'
          ? 'pt-28 pb-16 sm:pt-34 sm:pb-24'
          : 'py-16 sm:py-24 border-t border-white/[0.07]'
      } bg-[#121419]/80 transition-colors`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* ====================================================================
            TOP WARM-SAND HEADER BANNER (Matched cleanly to User Reference)
            ==================================================================== */}
        <Reveal3D direction="up">
          <div className="editorial-sand-band border rounded-[24px] sm:rounded-[30px] px-6 sm:px-12 py-10 sm:py-14 text-center shadow-[0_18px_46px_-22px_rgba(20,22,26,0.16)]">
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#9A958C] block mb-2.5">
              {isBn ? 'ফ্রি ক্রিয়েটিভ এমসিকিউ গেম' : 'FREE INTERACTIVE MCQ GAME'}
            </span>
            <h2 className="font-display text-2xl sm:text-4xl lg:text-[42px] font-bold text-[#F4F0E8] tracking-tight leading-[1.16] max-w-2xl mx-auto">
              {isBn
                ? 'ভিডিও এডিটিং, কালার ও সাউন্ড কুইজ গেম খেলুন!'
                : 'Test Your Video Editing, Visual & Sound IQ!'}
            </h2>
            <p className="text-xs sm:text-[15px] text-[#9A958C] leading-relaxed max-w-xl mx-auto mt-3.5">
              {isBn
                ? 'ভিডিও এডিটিং কেন শিখবেন, বর্তমান যুগে এর ব্যবহার, ভিজ্যুয়াল-কালার গ্রেডিং এবং সাউন্ড ডিজাইনের ওপর মজাদার এমসিকিউ গেম খেলে নিজের জ্ঞান যাচাই করুন।'
                : 'Play this interactive multiple-choice challenge covering why video editing matters today, visual color grading, and cinematic sound design.'}
            </p>
          </div>
        </Reveal3D>

        {/* ====================================================================
            MAIN TWO-COLUMN SPLIT CARD (Left Checklist+Metrics / Right MCQ Arena)
            ==================================================================== */}
        <Reveal3D direction="up" delay={70}>
          <div className="editorial-card-surface rounded-[24px] sm:rounded-[30px] overflow-hidden shadow-[0_24px_60px_-24px_rgba(20,22,26,0.22)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              {/* LEFT COLUMN: Topics Overview Checklist & 3-Column Metrics */}
              <div className="lg:col-span-5 p-6 sm:p-8 lg:p-9 flex flex-col justify-between gap-7 border-b lg:border-b-0 lg:border-r border-black/[0.07] dark:border-white/[0.08]">
                <div className="space-y-5">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#9A958C] block mb-1.5">
                      {isBn ? 'যা জানতে ও খেলতে পারবেন' : 'TOPICS INSIDE THE GAME'}
                    </span>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-[#F4F0E8] leading-snug">
                      {isBn
                        ? 'প্রতিটি প্রশ্নে আপনার এডিটিং লেভেল, বিগিনার থেকে এক্সপার্ট'
                        : 'Master Real Studio Concepts While You Play'}
                    </h3>
                  </div>

                  <ul className="space-y-3">
                    {[
                      isBn
                        ? 'ভিডিও এডিটিং কেন শিখবেন ও ক্যারিয়ার সম্ভাবনা'
                        : 'Why Learn Video Editing & Career Value',
                      isBn
                        ? 'বর্তমান যুগে ব্যবসা, শিক্ষা ও মিডিয়ায় ব্যবহার'
                        : 'Modern Uses in Business, Media & Education',
                      isBn
                        ? 'ভিজ্যুয়াল স্টোরিটেলিং, B-Roll ও কালার গ্রেডিং'
                        : 'Visual Storytelling, B-Roll & Color Grading',
                      isBn
                        ? 'সাউন্ড ডিজাইন, অডিও ব্যালেন্স ও J/L-Cut'
                        : 'Sound Design, Dialogue Mixing & J/L-Cuts',
                      isBn
                        ? 'প্রতিটি উত্তরের সাথে তাৎক্ষণিক ব্যাখ্যা ও র‍্যাংক'
                        : 'Instant Explanation & Skill Rank on Finish'
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-[#DDD1BE]"
                      >
                        <CheckCircle2
                          className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
                          strokeWidth={1.85}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom 3-Column Stat Strip matching Reference */}
                <div className="editorial-sand-band border rounded-2xl p-4 grid grid-cols-3 divide-x rtl:divide-x-reverse divide-black/[0.07] dark:divide-white/[0.08] text-center">
                  <div className="px-2">
                    <ListChecks className="w-4 h-4 mx-auto text-[#9A958C] mb-1.5" strokeWidth={1.6} />
                    <div className="font-display text-base sm:text-lg font-extrabold text-[#F4F0E8] tabular-nums">
                      {isBn ? '১০টি' : '10'}
                    </div>
                    <div className="text-[11px] text-[#9A958C] mt-0.5">
                      {isBn ? 'প্রশ্ন' : 'Questions'}
                    </div>
                  </div>
                  <div className="px-2">
                    <Clock className="w-4 h-4 mx-auto text-[#9A958C] mb-1.5" strokeWidth={1.6} />
                    <div className="font-display text-base sm:text-lg font-extrabold text-[#F4F0E8] tabular-nums">
                      {isBn ? '~৪' : '~4'}
                    </div>
                    <div className="text-[11px] text-[#9A958C] mt-0.5">
                      {isBn ? 'মিনিট' : 'Minutes'}
                    </div>
                  </div>
                  <div className="px-2">
                    <Gift className="w-4 h-4 mx-auto text-[#E4583B] mb-1.5" strokeWidth={1.6} />
                    <div className="font-display text-base sm:text-lg font-extrabold text-[#F4F0E8]">
                      {isBn ? 'ফ্রি' : 'Free'}
                    </div>
                    <div className="text-[11px] text-[#9A958C] mt-0.5">
                      {isBn ? 'সম্পূর্ণ' : 'Unlimited'}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: MCQ LAUNCH PANEL / ACTIVE QUESTION ARENA / RESULT */}
              <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                {/* 1. PRE-GAME LAUNCH MENU */}
                {arenaState === 'MENU' && (
                  <div className="flex flex-col justify-between h-full gap-6">
                    <div className="space-y-5">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-display text-xl sm:text-2xl font-bold text-[#F4F0E8]">
                            {isBn ? 'শুরু করার আগে' : 'Before You Start'}
                          </h3>
                          <button
                            type="button"
                            onClick={() => setSoundOn((s) => !s)}
                            aria-label={soundOn ? 'Mute sound' : 'Enable sound'}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill-ghost text-[11px] font-medium cursor-pointer"
                          >
                            {soundOn ? (
                              <Volume2 className="w-3.5 h-3.5 text-[#E4583B]" />
                            ) : (
                              <VolumeX className="w-3.5 h-3.5" />
                            )}
                            <span>{soundOn ? (isBn ? 'সাউন্ড চালু' : 'SFX On') : isBn ? 'মিউট' : 'Muted'}</span>
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm text-[#9A958C] mt-1">
                          {isBn
                            ? 'প্রতিটি প্রশ্নের সাথে নিজের চিন্তা মিলিয়ে সঠিক উত্তর বেছে নিন।'
                            : 'Select a topic focus (or play all 10) and test your creative instincts.'}
                        </p>
                      </div>

                      {/* Optional Name Input */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="mcq-player-name"
                          className="block text-xs font-semibold text-[#DDD1BE]"
                        >
                          {isBn ? 'পুরো নাম (ঐচ্ছিক)' : 'Your Name (Optional)'}
                        </label>
                        <input
                          id="mcq-player-name"
                          type="text"
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          placeholder={isBn ? 'আপনার নাম লিখুন...' : 'Enter your name...'}
                          className="w-full px-4 py-3 rounded-xl editorial-sand-band border text-sm text-[#F4F0E8] placeholder-[#9A958C]/70 focus:outline-none focus:border-[#E4583B] transition-colors"
                        />
                      </div>

                      {/* Topic Selection Buttons */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#DDD1BE]">
                            {isBn ? 'প্রশ্নের বিষয় বেছে নিন' : 'Choose Quiz Topic'}
                          </span>
                          {bestPercent > 0 && (
                            <span className="font-mono text-[#E4583B] font-semibold tabular-nums">
                              {isBn ? `সেরা স্কোর: ${bestPercent}%` : `Best: ${bestPercent}%`}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {topicChoices.map((tp) => {
                            const TIcon = tp.icon;
                            const isSelected = selectedTopic === tp.id;
                            return (
                              <button
                                key={tp.id}
                                type="button"
                                onClick={() => setSelectedTopic(tp.id)}
                                className={`px-3.5 py-3 rounded-xl border text-left rtl:text-right flex items-center gap-2.5 transition-all cursor-pointer active:scale-[0.98] ${
                                  isSelected
                                    ? 'border-[#E4583B] bg-[#E4583B]/10 shadow-sm'
                                    : 'editorial-sand-band hover:border-[#E4583B]/40'
                                }`}
                              >
                                <span
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? 'bg-[#E4583B] text-white'
                                      : 'editorial-card-surface text-[#E4583B]'
                                  }`}
                                >
                                  <TIcon className="w-4 h-4" />
                                </span>
                                <span className="text-xs font-bold text-[#F4F0E8] leading-snug">
                                  {tp.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => startQuiz(selectedTopic)}
                        className="w-full min-h-[48px] px-6 py-3.5 rounded-xl glass-pill-cta text-sm font-bold flex items-center justify-between active:scale-[0.99] transition-all cursor-pointer shadow-lg"
                      >
                        <span>
                          {isBn ? 'কুইজ গেম শুরু করুন' : 'Start MCQ Quiz'}
                        </span>
                        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                      </button>
                      <p className="text-[11px] text-center text-[#9A958C]">
                        {isBn
                          ? 'আপনার তথ্য কারো সাথে শেয়ার করা হয় না · সরাসরি ব্রাউজারে খেলুন'
                          : 'Zero personal data stored · Play directly in your browser'}
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. ACTIVE MCQ GAMEPLAY */}
                {arenaState === 'PLAYING' && currentQuestion && (
                  <div className="flex flex-col justify-between h-full gap-5">
                    {/* Top Progress & Controls */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setArenaState('MENU')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full glass-pill-ghost text-xs font-semibold cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                          <span>{isBn ? 'মেনু' : 'Menu'}</span>
                        </button>

                        <div className="text-xs font-mono tabular-nums text-[#9A958C]">
                          <span className="text-[#F4F0E8] font-bold">
                            {String(questionIdx + 1).padStart(2, '0')} /{' '}
                            {String(activeQuestions.length).padStart(2, '0')}
                          </span>
                          <span className="mx-2">·</span>
                          <span className="text-[#E4583B] font-bold">
                            {isBn ? `সঠিক: ${correctCount}` : `Score: ${correctCount}`}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSoundOn((s) => !s)}
                          aria-label="Toggle Sound"
                          className="w-8 h-8 rounded-full glass-pill-ghost flex items-center justify-center cursor-pointer"
                        >
                          {soundOn ? (
                            <Volume2 className="w-3.5 h-3.5 text-[#E4583B]" />
                          ) : (
                            <VolumeX className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Thin Progress Bar */}
                      <div className="w-full h-1.5 rounded-full bg-black/[0.08] dark:bg-white/[0.08] overflow-hidden">
                        <div
                          className="h-full bg-[#E4583B] transition-all duration-300"
                          style={{
                            width: `${((questionIdx + (selectedOption !== null ? 1 : 0)) / activeQuestions.length) * 100}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Question & MCQ Options */}
                    <div className="space-y-4">
                      <div>
                        <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#E4583B] block mb-1">
                          {isBn ? currentQuestion.topicLabel.bn : currentQuestion.topicLabel.en}
                        </span>
                        <h4 className="font-display text-lg sm:text-xl font-bold text-[#F4F0E8] leading-snug">
                          {isBn ? currentQuestion.question.bn : currentQuestion.question.en}
                        </h4>
                      </div>

                      <div className="space-y-2.5">
                        {currentQuestion.options.map((opt, oIdx) => {
                          const hasAnswered = selectedOption !== null;
                          const isCorrectOption = oIdx === currentQuestion.correctIndex;
                          const isChosen = oIdx === selectedOption;

                          let btnStyle =
                            'editorial-sand-band hover:border-[#E4583B]/55 text-[#F4F0E8]';
                          if (hasAnswered) {
                            if (isCorrectOption) {
                              btnStyle =
                                'border-emerald-500 bg-emerald-500/12 text-[#F4F0E8]';
                            } else if (isChosen && !isCorrectOption) {
                              btnStyle =
                                'border-rose-500 bg-rose-500/12 text-[#F4F0E8]';
                            } else {
                              btnStyle = 'editorial-sand-band opacity-55 text-[#9A958C]';
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              disabled={hasAnswered}
                              onClick={() => handleSelectAnswer(oIdx)}
                              className={`w-full min-h-[46px] px-4 py-3 rounded-xl border text-left rtl:text-right flex items-center justify-between gap-3 transition-all ${btnStyle} ${
                                hasAnswered ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'
                              }`}
                            >
                              <div className="flex items-start gap-3 min-w-0">
                                <span
                                  className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                                    hasAnswered && isCorrectOption
                                      ? 'bg-emerald-500 text-white'
                                      : hasAnswered && isChosen
                                      ? 'bg-rose-500 text-white'
                                      : 'editorial-card-surface text-[#9A958C]'
                                  }`}
                                >
                                  {OPTION_LETTERS[oIdx]}
                                </span>
                                <span className="text-xs sm:text-sm font-medium leading-snug">
                                  {isBn ? opt.bn : opt.en}
                                </span>
                              </div>

                              {hasAnswered && isCorrectOption && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              )}
                              {hasAnswered && isChosen && !isCorrectOption && (
                                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Instant Educational Explanation Banner */}
                      {selectedOption !== null && (
                        <div className="p-4 rounded-xl editorial-sand-band border space-y-2 animate-in fade-in duration-200">
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            {selectedOption === currentQuestion.correctIndex ? (
                              <span className="text-emerald-500">
                                {isBn ? '✓ চমৎকার! উত্তর সঠিক হয়েছে' : '✓ Correct Answer!'}
                              </span>
                            ) : (
                              <span className="text-[#E4583B]">
                                {isBn
                                  ? `সঠিক উত্তর: ${OPTION_LETTERS[currentQuestion.correctIndex]}`
                                  : `Correct Answer: ${OPTION_LETTERS[currentQuestion.correctIndex]}`}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#DDD1BE] leading-relaxed">
                            {isBn
                              ? currentQuestion.explanation.bn
                              : currentQuestion.explanation.en}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Next Question CTA */}
                    <div className="pt-1 flex justify-end">
                      {selectedOption !== null && (
                        <button
                          type="button"
                          onClick={handleNextQuestion}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 min-h-[44px] py-2.5 rounded-full glass-pill-cta text-xs font-bold active:scale-95 transition-all cursor-pointer"
                        >
                          <span>
                            {questionIdx + 1 >= activeQuestions.length
                              ? isBn
                                ? 'ফলাফল দেখুন'
                                : 'See Final Score'
                              : isBn
                              ? 'পরবর্তী প্রশ্ন'
                              : 'Next Question'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. MCQ QUIZ RESULT BREAKDOWN */}
                {arenaState === 'RESULT' && (
                  <div className="flex flex-col justify-center items-center text-center h-full py-4 space-y-5">
                    <div className="w-16 h-16 rounded-2xl bg-[#E4583B]/12 border border-[#E4583B]/35 flex items-center justify-center text-[#E4583B]">
                      <Trophy className="w-8 h-8" strokeWidth={1.6} />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#E4583B]">
                        {playerName.trim()
                          ? isBn
                            ? `অভিনন্দন, ${playerName.trim()}!`
                            : `Great Effort, ${playerName.trim()}!`
                          : isBn
                          ? 'এমসিকিউ কুইজ সম্পন্ন!'
                          : 'QUIZ COMPLETE!'}
                      </span>
                      <div className="font-display text-4xl sm:text-5xl font-extrabold text-[#F4F0E8] tabular-nums">
                        {correctCount}{' '}
                        <span className="text-xl font-medium text-[#9A958C]">
                          / {activeQuestions.length}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-[#DDD1BE]">
                        {getRankLabel(scorePercent)} · {scorePercent}%
                      </div>
                    </div>

                    {/* Topic Breakdown Summary */}
                    <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left rtl:text-right">
                      {[
                        {
                          key: 'purpose' as const,
                          label: isBn ? 'উদ্দেশ্য ও ব্যবহার' : 'Purpose & Uses'
                        },
                        {
                          key: 'visual_color' as const,
                          label: isBn ? 'ভিজ্যুয়াল ও কালার' : 'Visual & Color'
                        },
                        {
                          key: 'sound' as const,
                          label: isBn ? 'সাউন্ড ডিজাইন' : 'Sound Design'
                        }
                      ]
                        .filter((cat) => topicTallies[cat.key].total > 0)
                        .map((cat) => (
                          <div
                            key={cat.key}
                            className="p-3.5 rounded-xl editorial-sand-band border"
                          >
                            <div className="text-[11px] text-[#9A958C]">{cat.label}</div>
                            <div className="font-display text-base font-bold text-[#F4F0E8] tabular-nums mt-0.5">
                              {topicTallies[cat.key].correct} / {topicTallies[cat.key].total}
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-1 w-full">
                      <button
                        type="button"
                        onClick={() => startQuiz(selectedTopic)}
                        className="inline-flex items-center gap-2 px-6 min-h-[44px] py-2.5 rounded-full glass-pill-cta text-xs font-bold active:scale-95 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{isBn ? 'আবার খেলুন' : 'Play Again'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setArenaState('MENU')}
                        className="inline-flex items-center gap-2 px-6 min-h-[44px] py-2.5 rounded-full glass-pill-ghost text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                      >
                        <span>{isBn ? 'বিষয় পরিবর্তন করুন' : 'Change Topic'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal3D>
      </div>
    </section>
  );
};
