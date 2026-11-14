import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export const WelcomeSalamToast: React.FC = () => {
  const { portfolio, language, loc } = usePortfolio();
  const [visible, setVisible] = useState(true);
  const [progressActive, setProgressActive] = useState(false);
  const [exiting, setExiting] = useState(false);

  const ownerName = loc(portfolio.hero?.name) || 'MD. Jaber Hosain';

  useEffect(() => {
    const barTimer = setTimeout(() => {
      setProgressActive(true);
    }, 80);

    const exitTimer = setTimeout(() => {
      setExiting(true);
    }, 3600);

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 4100);

    return () => {
      clearTimeout(barTimer);
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleDismiss = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => setVisible(false), 450);
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
      ? `Welcome to ${ownerName}'s official portfolio`
      : language === 'ar'
      ? `أهلاً بك في المعرض الرسمي لـ ${ownerName}`
      : `${ownerName}-এর পোর্টফোলিও ওয়েবসাইটে আপনাকে স্বাগতম`;

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={handleDismiss}
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 cursor-pointer ${
        exiting
          ? 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'
          : 'bg-[#121419]/70 backdrop-blur-md opacity-100'
      }`}
    >
      {/* Centered Salam Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md overflow-hidden rounded-2xl bg-[#181B22] border border-[#E4583B]/45 shadow-[0_28px_72px_-16px_rgba(0,0,0,0.8)] px-6 py-7 text-center transition-all duration-500 cursor-default ${
          exiting
            ? 'opacity-0 scale-95 -translate-y-3'
            : 'opacity-100 scale-100 translate-y-0 animate-in fade-in zoom-in-95 duration-300'
        }`}
      >
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close greeting"
          className="absolute top-3.5 right-3.5 p-2 rounded-lg text-[#A7A298] hover:text-[#F4F0E8] hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Arabic Calligraphy Greeting Emblem */}
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-[#E4583B]/12 border border-[#E4583B]/35 text-[#F07C63] font-serif text-base sm:text-lg font-bold tracking-wide mb-4">
          السلام عليكم ورحمة الله
        </div>

        {/* Main Salam Headline */}
        <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#F4F0E8] leading-snug tracking-tight mb-2">
          {greetingTitle}
        </h2>

        {/* Welcome Subtitle */}
        <p className="text-xs sm:text-sm font-mono text-[#DDD1BE] leading-relaxed">
          {subtitleText}
        </p>

        {/* Auto-hide countdown progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2B303D] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#E4583B] to-[#F07C63] transition-all ease-linear"
            style={{
              width: progressActive ? '0%' : '100%',
              transitionDuration: '3500ms'
            }}
          />
        </div>
      </div>
    </div>
  );
};
