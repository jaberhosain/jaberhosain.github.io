import React, { useState } from 'react';
import { Mail, MessageSquare, Copy, Check, ArrowDown, ExternalLink } from 'lucide-react';
import { Language } from '../../types/portfolio';

interface RevealContactPillProps {
  type: 'email' | 'whatsapp';
  value: string;
  href: string;
  language: Language;
  compact?: boolean;
  className?: string;
}

export const RevealContactPill: React.FC<RevealContactPillProps> = ({
  type,
  value,
  href,
  language,
  compact = false,
  className = ''
}) => {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const isEmail = type === 'email';

  const closedPrompt = isEmail
    ? language === 'bn'
      ? 'ইমেইল দেখতে এখানে ক্লিক করুন'
      : language === 'ar'
      ? 'انقر هنا لعرض البريد الإلكتروني'
      : 'Click here to view Email'
    : language === 'bn'
    ? 'হোয়াটসঅ্যাপ নাম্বারের জন্য ক্লিক করুন'
    : language === 'ar'
    ? 'انقر لعرض رقم واتساب'
    : 'Click for WhatsApp Number';

  const readyLabel = isEmail
    ? language === 'bn'
      ? 'আপনার ইমেইল প্রস্তুত'
      : language === 'ar'
      ? 'البريد الإلكتروني جاهز'
      : 'Your Email is Ready'
    : language === 'bn'
    ? 'হোয়াটসঅ্যাপ নাম্বার প্রস্তুত'
    : language === 'ar'
    ? 'رقم واتساب جاهز'
    : 'WhatsApp Number Ready';

  const copyLabel =
    language === 'bn' ? (copied ? 'কপিড' : 'কপি') : copied ? 'COPIED' : 'COPY';

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div
      className={`reveal-contact-stage relative inline-flex flex-col items-stretch select-none ${
        compact ? 'min-w-[260px] max-w-full' : 'w-full max-w-[340px]'
      } ${className}`}
      style={{ perspective: '900px' }}
    >
      {/* Top 3D Hinge Cover Lid (Closed prompt -> Flips upward smoothly on click) */}
      <button
        type="button"
        onClick={() => setRevealed((prev) => !prev)}
        aria-expanded={revealed}
        className={`reveal-contact-lid group relative z-20 flex items-center justify-between gap-3 rounded-full border transition-all duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E4583B] ${
          compact ? 'px-4 py-2.5 text-xs' : 'px-5 py-3 text-xs sm:text-[13px]'
        } ${
          revealed
            ? 'reveal-contact-lid-open shadow-[0_10px_22px_-8px_rgba(0,0,0,0.75)]'
            : 'shadow-[0_12px_26px_-10px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.12)] hover:-translate-y-0.5'
        }`}
      >
        <span className="flex items-center space-x-2.5 rtl:space-x-reverse min-w-0">
          <span
            className={`w-6 h-6 rounded-full inline-flex items-center justify-center shrink-0 transition-colors ${
              isEmail
                ? 'bg-[#E4583B]/18 text-[#F07C63]'
                : 'bg-emerald-500/18 text-emerald-400'
            }`}
          >
            {isEmail ? (
              <Mail className="w-3.5 h-3.5" strokeWidth={1.6} />
            ) : (
              <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.6} />
            )}
          </span>
          <span className="font-semibold tracking-tight truncate">
            {revealed ? readyLabel : closedPrompt}
          </span>
        </span>

        {/* Indicator disc (rotates smoothly when revealed, matching the video's circular arrow badge) */}
        <span
          className={`w-6 h-6 rounded-full inline-flex items-center justify-center shrink-0 transition-all duration-300 ${
            revealed
              ? 'bg-emerald-500 text-white rotate-0 shadow-[0_4px_12px_rgba(16,185,129,0.45)]'
              : 'bg-white/[0.08] text-[#A7A298] group-hover:text-white group-hover:bg-white/[0.14]'
          }`}
          aria-hidden="true"
        >
          <ArrowDown
            className={`w-3.5 h-3.5 transition-transform duration-300 ${
              revealed ? 'rotate-0' : '-rotate-90'
            }`}
            strokeWidth={1.9}
          />
        </span>
      </button>

      {/* Revealed Perforated Dotted Inner Capsule with Value + COPY pill button */}
      {revealed && (
        <div
          className={`reveal-contact-slot animate-reveal-slot relative z-10 mt-2 flex items-center justify-between gap-2.5 rounded-full border-2 border-dashed ${
            compact ? 'pl-4 pr-1.5 py-1.5' : 'pl-5 pr-2 py-2'
          }`}
        >
          <a
            href={href}
            target={isEmail ? undefined : '_blank'}
            rel={isEmail ? undefined : 'noopener noreferrer'}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center space-x-1.5 rtl:space-x-reverse min-w-0 font-bold text-xs sm:text-[13px] tracking-tight hover:text-emerald-400 transition-colors truncate"
            title={isEmail ? 'Open Email App' : 'Open WhatsApp Chat'}
          >
            <span className="truncate">{value}</span>
            <ExternalLink className="w-3 h-3 opacity-60 shrink-0" strokeWidth={1.6} />
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center space-x-1 rtl:space-x-reverse rounded-full px-3.5 py-1.5 text-[11px] font-bold tracking-wider text-white transition-all shrink-0 cursor-pointer ${
              copied
                ? 'bg-emerald-600 shadow-[0_6px_16px_-4px_rgba(16,185,129,0.65)]'
                : 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_6px_16px_-4px_rgba(16,185,129,0.5)]'
            }`}
          >
            {copied ? (
              <Check className="w-3 h-3" strokeWidth={2.2} />
            ) : (
              <Copy className="w-3 h-3" strokeWidth={1.9} />
            )}
            <span>{copyLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
};
