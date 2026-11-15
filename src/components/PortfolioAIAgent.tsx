import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  RotateCcw,
  ArrowUpRight,
  ExternalLink,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useNavigation } from '../context/NavigationContext';
import { AIAgentEmblem } from './common/AIAgentEmblem';
import {
  AgentAction,
  buildPortfolioKnowledgeSummary,
  detectQueryLanguage,
  generateLocalPortfolioReply,
  inferAgentActions
} from '../lib/portfolioAgentEngine';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  actions?: AgentAction[];
}

function renderFormattedText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-[#FFFFFF]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export const PortfolioAIAgent: React.FC = () => {
  const { portfolio, language, loc } = usePortfolio();
  const { navigateTo } = useNavigation();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ownerName = loc(portfolio.hero?.name) || 'MD. Jaber Hosain';

  const getInitialGreeting = (lang: typeof language): ChatMessage => {
    const text =
      lang === 'bn'
        ? `আসসালামু আলাইকুম! আমি ${ownerName}-এর পার্সোনাল এআই এজেন্ট। তাঁর সিভি, শিক্ষাগত যোগ্যতা, কাজের অভিজ্ঞতা, ভিডিও এডিটিং, গ্রাফিক ডিজাইন বা কাজের অর্ডার—যেকোনো বিষয়ে আমাকে প্রশ্ন করতে পারেন।`
        : lang === 'ar'
        ? `مرحباً بك! أنا المساعد الشخصي لـ ${ownerName}. اسألني عن سيرته الذاتية، خبراته، مونتاج الفيديو، التصميم الجرافيكي، أو التواصل لبدء مشروع.`
        : `Hi! I'm ${ownerName}'s AI Agent. Ask me anything about his CV, education, work experience, Adobe skills, video editing, graphic design, or how to hire him.`;

    return {
      id: 'welcome-msg',
      role: 'assistant',
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
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [getInitialGreeting(language)]);

  // Update welcome greeting if user hasn't chatted yet and switches language
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome-msg') {
        return [getInitialGreeting(language)];
      }
      return prev;
    });
  }, [language, ownerName]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen]);

  const quickPrompts =
    language === 'bn'
      ? [
          'জাবেরের সিভি ও অভিজ্ঞতা',
          'শিক্ষাগত যোগ্যতা ও রেজাল্ট',
          'স্কিল, সফটওয়্যার ও এআই',
          'যোগাযোগ ও প্রত্যাশিত বেতন'
        ]
      : language === 'ar'
      ? [
          'السيرة الذاتية والخبرة',
          'المؤهل العلمي والدرجات',
          'المهارات والبرامج المستخدمة',
          'التواصل والراتب المتوقع'
        ]
      : [
          'CV & work experience',
          'Education & GPA results',
          'Software, skills & AI tools',
          'Contact info & expected salary'
        ];

  const sendMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput('');
    setIsLoading(true);

    const detectedLang = detectQueryLanguage(trimmed, language);

    try {
      const isStaticHost =
        typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');

      let replyText = '';

      if (!isStaticHost) {
        const res = await fetch('/api/agent/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            language: detectedLang,
            history: updatedHistory.slice(-10).map((m) => ({
              role: m.role,
              text: m.text
            })),
            portfolioSummary: buildPortfolioKnowledgeSummary(portfolio)
          }),
          signal: AbortSignal.timeout(18000)
        });

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data?.reply && typeof data.reply === 'string') {
            replyText = data.reply.trim();
          }
        }
      }

      if (replyText) {
        const actions = inferAgentActions(trimmed, replyText, portfolio, detectedLang);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            role: 'assistant',
            text: replyText,
            actions
          }
        ]);
      } else {
        // Seamless CV + Portfolio local intelligence (used on github.io & offline fallback)
        const fallback = generateLocalPortfolioReply(trimmed, portfolio, detectedLang, updatedHistory);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            role: 'assistant',
            text: fallback.text,
            actions: fallback.actions
          }
        ]);
      }
    } catch {
      // Never break — use local CV + portfolio intelligence engine
      const fallback = generateLocalPortfolioReply(trimmed, portfolio, detectedLang, updatedHistory);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          text: fallback.text,
          actions: fallback.actions
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([getInitialGreeting(language)]);
    setInput('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {/* Chat Drawer Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Portfolio AI Assistant"
          className="mb-3 w-[calc(100vw-2.5rem)] sm:w-[390px] max-h-[78vh] sm:max-h-[560px] rounded-[24px] glass-showcase-card shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-white/[0.08] flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5 rtl:space-x-reverse min-w-0">
              <div className="w-9 h-9 rounded-full glass-icon-disc flex items-center justify-center text-[#E4583B] shrink-0">
                <AIAgentEmblem className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                  <h3 className="text-xs sm:text-sm font-semibold text-[#F4F0E8] truncate">
                    {language === 'bn'
                      ? 'জাবের এআই এজেন্ট'
                      : language === 'ar'
                      ? 'مساعد جابر الذكي'
                      : 'Jaber AI Agent'}
                  </h3>
                </div>
                <p className="text-[11px] text-[#A7A298] truncate">
                  {language === 'bn'
                    ? 'সিভি · অভিজ্ঞতা · পোর্টফোলিও গাইড'
                    : language === 'ar'
                    ? 'السيرة الذاتية · الخبرة · معرض الأعمال'
                    : 'CV · Experience · Portfolio Guide'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 rtl:space-x-reverse shrink-0">
              <button
                type="button"
                onClick={handleReset}
                title={language === 'bn' ? 'নতুন চ্যাট' : 'Reset Chat'}
                className="w-8 h-8 rounded-full glass-icon-disc flex items-center justify-center transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.35} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title={language === 'bn' ? 'বন্ধ করুন' : 'Minimize'}
                className="w-8 h-8 rounded-full glass-icon-disc flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" strokeWidth={1.35} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[340px] sm:max-h-[370px] bg-black/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-[#E4583B] text-[#F4F0E8] rounded-br-sm font-medium'
                      : 'glass-showcase-inner text-[#F4F0E8] rounded-bl-sm'
                  }`}
                >
                  {renderFormattedText(msg.text)}
                </div>

                {/* Contextual Action Buttons */}
                {msg.role === 'assistant' && msg.actions && msg.actions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-[92%]">
                    {msg.actions.map((act, idx) =>
                      act.type === 'external' ? (
                        <a
                          key={`${msg.id}-act-${idx}`}
                          href={act.target}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 rtl:space-x-reverse px-3 py-1 rounded-full glass-pill-ghost text-[11px] font-medium text-[#EAE5DC] hover:text-white transition-colors cursor-pointer"
                        >
                          <span>{act.label}</span>
                          <ExternalLink className="w-3 h-3" strokeWidth={1.35} />
                        </a>
                      ) : (
                        <button
                          key={`${msg.id}-act-${idx}`}
                          type="button"
                          onClick={() => navigateTo(act.target)}
                          className="inline-flex items-center space-x-1 rtl:space-x-reverse px-3 py-1 rounded-full glass-pill-ghost text-[11px] font-medium text-[#EAE5DC] hover:text-white transition-colors cursor-pointer"
                        >
                          <span>{act.label}</span>
                          <ArrowUpRight className="w-3 h-3" strokeWidth={1.35} />
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start">
                <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm glass-showcase-inner text-xs text-[#A7A298] flex items-center space-x-2">
                  <Loader2 className="w-3.5 h-3.5 text-[#E4583B] animate-spin" strokeWidth={1.5} />
                  <span>{language === 'bn' ? 'উত্তর লিখছে...' : 'Thinking...'}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 border-t border-white/[0.08] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((qText, i) => (
              <button
                key={i}
                type="button"
                disabled={isLoading}
                onClick={() => sendMessage(qText)}
                className="px-3 py-1 rounded-full glass-pill-ghost text-[11px] text-[#DDD1BE] hover:text-white whitespace-nowrap shrink-0 transition-colors cursor-pointer disabled:opacity-50"
              >
                {qText}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="p-3 border-t border-white/[0.08] flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'আপনার প্রশ্ন লিখুন...'
                  : language === 'ar'
                  ? 'اكتب سؤالك هنا...'
                  : 'Ask about videos, designs, or hiring...'
              }
              className="flex-1 px-4 py-2.5 rounded-full glass-showcase-inner text-xs text-[#F4F0E8] placeholder-[#A7A298]/60 focus:border-white/30 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className="w-9 h-9 rounded-full glass-pill-cta flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </form>
        </div>
      )}

      {/* Signature Emblem Floating Launcher */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Close AI Agent' : 'Open Jaber AI Agent'}
        className="group relative inline-flex items-center space-x-2.5 rtl:space-x-reverse p-1.5 pr-4 rtl:pr-1.5 rtl:pl-4 rounded-full glass-showcase-card text-[#F4F0E8] text-xs font-semibold shadow-[0_18px_44px_-10px_rgba(0,0,0,0.8)] transition-all duration-250 hover:-translate-y-0.5 cursor-pointer"
      >
        <span className="w-9 h-9 rounded-full bg-[#E4583B] group-hover:bg-[#D0492D] text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:rotate-6 shrink-0">
          {isOpen ? <X className="w-4 h-4" strokeWidth={1.5} /> : <AIAgentEmblem className="w-5 h-5" />}
        </span>
        <span className="tracking-wide whitespace-nowrap">
          {isOpen
            ? language === 'bn'
              ? 'বন্ধ করুন'
              : language === 'ar'
              ? 'إغلاق'
              : 'Close'
            : language === 'bn'
            ? 'জাবের AI'
            : language === 'ar'
            ? 'مساعد جابر'
            : 'Jaber AI'}
        </span>
      </button>
    </div>
  );
};
