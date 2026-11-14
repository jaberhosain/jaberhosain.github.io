import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  RotateCcw,
  ArrowUpRight,
  ExternalLink,
  MessageSquare,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useNavigation } from '../context/NavigationContext';
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
        ? `আসসালামু আলাইকুম! আমি ${ownerName}-এর এআই অ্যাসিস্ট্যান্ট। ভিডিও এডিটিং, গ্রাফিক ডিজাইন, বিহ্যান্স প্রজেক্ট বা কাজের অর্ডারের বিষয়ে যেকোনো প্রশ্ন করতে পারেন।`
        : lang === 'ar'
        ? `مرحباً بك! أنا المساعد الذكي لـ ${ownerName}. اسألني عن مونتاج الفيديو، التصميم الجرافيكي، أو كيفية التواصل لبدء مشروع.`
        : `Hi! I'm ${ownerName}'s AI Assistant. Ask me anything about his video editing, graphic design & Behance poster series, skills, or how to collaborate.`;

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
          'ভিডিও এডিটিং কাজগুলো দেখাও',
          'গ্রাফিক ডিজাইন ও বিহ্যান্স কাজ',
          'কীভাবে কাজ অর্ডার বা যোগাযোগ করব?',
          'দক্ষতা ও শিক্ষাগত যোগ্যতা কী?'
        ]
      : language === 'ar'
      ? [
          'أعمال مونتاج الفيديو',
          'تصاميم الجرافيك و Behance',
          'كيف يمكنني التواصل لطلب عمل؟',
          'المهارات والبرامج المستخدمة'
        ]
      : [
          'Show video editing work',
          'Graphic design & Behance projects',
          'How can I hire or contact Jaber?',
          'What software & skills do you use?'
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
            history: updatedHistory.slice(-6).map((m) => ({
              role: m.role,
              text: m.text
            })),
            portfolioSummary: buildPortfolioKnowledgeSummary(portfolio)
          }),
          signal: AbortSignal.timeout(12000)
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
        // Seamless smart fallback (works on static github.io and offline)
        const fallback = generateLocalPortfolioReply(trimmed, portfolio, detectedLang);
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
      // Never break — use local portfolio intelligence engine
      const fallback = generateLocalPortfolioReply(trimmed, portfolio, detectedLang);
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

  const handleActionClick = (action: AgentAction) => {
    if (action.type === 'navigate') {
      navigateTo(action.target);
    } else if (action.type === 'external' && action.target) {
      window.open(action.target, '_blank', 'noopener,noreferrer');
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
          className="mb-3 w-[calc(100vw-2.5rem)] sm:w-[390px] max-h-[78vh] sm:max-h-[560px] rounded-2xl bg-[#161920] border border-[#2B303D] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-[#181B22] border-b border-[#2B303D] flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5 rtl:space-x-reverse min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#E4583B]/15 border border-[#E4583B]/40 flex items-center justify-center text-[#E4583B] shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                  <h3 className="text-xs sm:text-sm font-bold text-[#F4F0E8] truncate">
                    {language === 'bn'
                      ? 'জাবের এআই এজেন্ট'
                      : language === 'ar'
                      ? 'مساعد جابر الذكي'
                      : 'Jaber AI Agent'}
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                </div>
                <p className="text-[11px] font-mono text-[#A7A298] truncate">
                  {language === 'bn'
                    ? 'ভিডিও · গ্রাফিক ডিজাইন · প্রজেক্ট গাইড'
                    : language === 'ar'
                    ? 'فيديو · جرافيك · استفسارات المشاريع'
                    : 'Video · Graphic Design · Project Guide'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 rtl:space-x-reverse shrink-0">
              <button
                type="button"
                onClick={handleReset}
                title={language === 'bn' ? 'নতুন চ্যাট' : 'Reset Chat'}
                className="p-2 rounded-lg text-[#A7A298] hover:text-[#F4F0E8] hover:bg-[#20242E] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title={language === 'bn' ? 'বন্ধ করুন' : 'Minimize'}
                className="p-2 rounded-lg text-[#A7A298] hover:text-[#F4F0E8] hover:bg-[#20242E] transition-colors cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[340px] sm:max-h-[370px] bg-[#121419]">
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
                      : 'bg-[#1E222B] text-[#F4F0E8] border border-[#2B303D] rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Contextual Action Buttons */}
                {msg.role === 'assistant' && msg.actions && msg.actions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-[92%]">
                    {msg.actions.map((act, idx) => (
                      <button
                        key={`${msg.id}-act-${idx}`}
                        type="button"
                        onClick={() => handleActionClick(act)}
                        className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1.5 rounded-lg bg-[#181B22] hover:bg-[#20242E] border border-[#2B303D] hover:border-[#E4583B]/60 text-[11px] font-mono font-semibold text-[#F07C63] hover:text-[#F4F0E8] transition-colors cursor-pointer"
                      >
                        <span>{act.label}</span>
                        {act.type === 'external' ? (
                          <ExternalLink className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start">
                <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-[#1E222B] border border-[#2B303D] text-xs font-mono text-[#A7A298] flex items-center space-x-2">
                  <Loader2 className="w-3.5 h-3.5 text-[#E4583B] animate-spin" />
                  <span>{language === 'bn' ? 'উত্তর লিখছে...' : 'Thinking...'}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-[#161920] border-t border-[#2B303D] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((qText, i) => (
              <button
                key={i}
                type="button"
                disabled={isLoading}
                onClick={() => sendMessage(qText)}
                className="px-2.5 py-1 rounded-lg bg-[#1E222B] hover:bg-[#262B36] border border-[#2B303D] text-[11px] font-mono text-[#DDD1BE] hover:text-[#F4F0E8] whitespace-nowrap shrink-0 transition-colors cursor-pointer disabled:opacity-50"
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
            className="p-3 bg-[#181B22] border-t border-[#2B303D] flex items-center gap-2"
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
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#121419] border border-[#2B303D] text-xs text-[#F4F0E8] placeholder-[#A7A298]/60 focus:border-[#E4583B] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className="p-2.5 rounded-xl bg-[#E4583B] hover:bg-[#D1482D] text-[#F4F0E8] transition-colors disabled:opacity-40 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Close AI Agent' : 'Open AI Agent'}
        className="group inline-flex items-center space-x-2.5 rtl:space-x-reverse px-4 py-3 rounded-2xl bg-[#E4583B] hover:bg-[#D1482D] text-[#F4F0E8] font-mono text-xs font-bold shadow-2xl border border-white/15 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
      >
        {isOpen ? (
          <>
            <X className="w-4 h-4" />
            <span>{language === 'bn' ? 'বন্ধ করুন' : 'Close AI'}</span>
          </>
        ) : (
          <>
            <MessageSquare className="w-4 h-4" />
            <span>
              {language === 'bn'
                ? 'এআই এজেন্ট'
                : language === 'ar'
                ? 'المساعد الذكي'
                : 'Ask AI Agent'}
            </span>
          </>
        )}
      </button>
    </div>
  );
};
