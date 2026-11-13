import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export const WelcomeSalamToast: React.FC = () => {
  const { portfolio, language, loc } = usePortfolio();
  const [visible, setVisible] = useState(false);
  const [progressActive, setProgressActive] = useState(false);
  const [exiting, setExiting] = useState(false);

  const ownerName = loc(portfolio.hero?.name) || 'MD. Jaber Hosain';

  useEffect(() => {
    const enterTimer = setTimeout(() => {
      setVisible(true);
    }, 200);

    const barTimer = setTimeout(() => {
      setProgressActive(true);
    }, 280);

    const exitTimer = setTimeout(() => {
      setExiting(true);
    }, 4800);

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 5200);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(barTimer);
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  const greetingTitle =
    language === 'en'
      ? 'Assalamu Alaikum wa Rahmatullah'
      : language === 'ar'
      ? 'السلام عليكم ورحمة الله وبركاته'
      : 'আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ';

  const subtitleText =
    language === 'en'
      ? `Welcome to ${ownerName}'s official portfolio.`
      : language === 'ar'
      ? `أهلاً بك في المعرض الرسمي لـ ${ownerName}.`
      : `${ownerName}-এর পোর্টফোলিও ওয়েবসাইটে আপনাকে স্বাগতম।`;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-[calc(100vw-2rem)] max-w-md transition-all duration-300 pointer-events-auto ${
        exiting
          ? 'opacity-0 -translate-y-3 scale-95'
          : 'opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-top-4 duration-300'
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#12161A]/95 backdrop-blur-xl border border-[#FF5722]/45 shadow-2xl px-4 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3.5 rtl:space-x-reverse min-w-0">
          {/* Emblem */}
          <div className="w-10 h-10 rounded-xl bg-[#FF5722]/15 border border-[#FF5722]/40 flex items-center justify-center text-[#FF5722] shrink-0 font-serif text-base font-bold">
            سلام
          </div>

          <div className="min-w-0">
            <p className="text-sm sm:text-base font-bold text-white leading-snug truncate">
              {greetingTitle}
            </p>
            <p className="text-xs text-neutral-300 mt-0.5 truncate">
              {subtitleText}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close greeting"
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Auto-hide progress indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1D232A] overflow-hidden">
          <div
            className="h-full bg-[#FF5722] transition-all ease-linear"
            style={{
              width: progressActive ? '0%' : '100%',
              transitionDuration: '4500ms'
            }}
          />
        </div>
      </div>
    </div>
  );
};
