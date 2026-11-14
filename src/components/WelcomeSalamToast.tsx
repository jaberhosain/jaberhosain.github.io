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
          : 'bg-black/65 backdrop-blur-md opacity-100'
      }`}
    >
      {/* Centered Salam Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md overflow-hidden rounded-3xl bg-[#12161A]/95 border border-[#FF5722]/45 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9),0_0_40px_-10px_rgba(255,87,34,0.28)] px-6 py-7 text-center transition-all duration-500 cursor-default ${
          exiting
            ? 'opacity-0 scale-95 -translate-y-3'
            : 'opacity-100 scale-100 translate-y-0 animate-in fade-in zoom-in-95 duration-300'
        }`}
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-32 bg-[#FF5722]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close greeting"
          className="absolute top-3.5 right-3.5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Arabic Calligraphy Greeting Emblem */}
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-2xl bg-[#FF5722]/15 border border-[#FF5722]/35 text-[#FF7043] font-serif text-base sm:text-lg font-bold tracking-wide mb-4">
          السلام عليكم ورحمة الله
        </div>

        {/* Main Salam Headline */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug tracking-tight mb-2">
          {greetingTitle}
        </h2>

        {/* Welcome Subtitle */}
        <p className="text-xs sm:text-sm font-mono text-neutral-300 leading-relaxed">
          {subtitleText}
        </p>

        {/* Auto-hide countdown progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1D232A] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FF5722] to-[#FF7043] transition-all ease-linear"
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
