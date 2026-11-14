import React from 'react';
import {
  Facebook,
  Send,
  Globe,
  ArrowUp,
  Youtube,
  Instagram,
  Linkedin,
  MessageCircle,
  Twitter,
  Github,
  Lock
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useNavigation } from '../context/NavigationContext';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const { portfolio, ui, loc, language, setLanguage } = usePortfolio();
  const { currentPage, navigateTo, pages, isMultiPageEnabled } = useNavigation();
  const footerConfig = portfolio.footerConfig;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeSocialLinks = (portfolio.socialLinks && portfolio.socialLinks.length > 0)
    ? portfolio.socialLinks.filter(s => s.enabled !== false && Boolean(s.url && s.url.trim()))
    : [
        {
          id: 'soc-tg-contact',
          platform: 'telegram',
          name: 'Telegram (Contact)',
          url: portfolio.contact?.telegramUrl || 'https://t.me/sbmc3925',
          icon: 'telegram'
        },
        {
          id: 'soc-tg-channel',
          platform: 'telegram',
          name: 'Telegram (Channel)',
          url: 'https://t.me/jaberhosain',
          icon: 'telegram'
        },
        {
          id: 'soc-be',
          platform: 'behance',
          name: 'Behance',
          url: portfolio.contact?.behanceUrl || 'https://www.behance.net/jaberhosain',
          icon: 'behance'
        }
      ].filter(s => Boolean(s.url && s.url.trim()));

  const renderSocialIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'facebook':
        return <Facebook className="w-4 h-4" />;
      case 'telegram':
        return <Send className="w-4 h-4" />;
      case 'behance':
        return <span className="font-bold text-sm">Bē</span>;
      case 'youtube':
        return <Youtube className="w-4 h-4" />;
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4" />;
      case 'twitter':
        return <Twitter className="w-4 h-4" />;
      case 'github':
        return <Github className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <footer className="bg-[#121419]/92 border-t border-[#2B303D] text-[#A7A298] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-6">

        {/* Page Directory Links */}
        {isMultiPageEnabled && (
          <nav aria-label="Footer Pages" className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 pb-5 border-b border-[#2B303D]/80 w-full max-w-2xl">
            {pages.map((p) => {
              const active = currentPage === p.id;
              return (
                <a
                  key={p.id}
                  href={p.hash}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo(p.id);
                  }}
                  className={`text-xs font-mono uppercase tracking-[0.15em] transition-colors whitespace-nowrap ${
                    active ? 'text-[#E4583B] font-bold' : 'text-[#A7A298] hover:text-[#F4F0E8]'
                  }`}
                >
                  {p.label[language] || p.label.en}
                </a>
              );
            })}
          </nav>
        )}

        {/* Connect Title */}
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#A7A298]">
          {footerConfig?.connectTitle ? loc(footerConfig.connectTitle) : ui.footer.connect}
        </div>

        {/* Social Icons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {activeSocialLinks.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn w-10 h-10 rounded-lg bg-[#181B22] border border-[#2B303D] flex items-center justify-center text-[#DDD1BE]"
              title={item.name || item.platform}
              aria-label={item.name || item.platform}
            >
              {renderSocialIcon(item.icon || item.platform)}
            </a>
          ))}
        </div>

        {/* Language switch */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs">
          <Globe className="w-3.5 h-3.5 text-[#E4583B]" />
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${language === 'en' ? 'bg-[#E4583B] text-white font-bold' : 'hover:text-[#F4F0E8]'}`}
          >
            English
          </button>
          <span aria-hidden="true">·</span>
          <button
            onClick={() => setLanguage('bn')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${language === 'bn' ? 'bg-[#E4583B] text-white font-bold' : 'hover:text-[#F4F0E8]'}`}
          >
            বাংলা
          </button>
          <span aria-hidden="true">·</span>
          <button
            onClick={() => setLanguage('ar')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${language === 'ar' ? 'bg-[#E4583B] text-white font-bold' : 'hover:text-[#F4F0E8]'}`}
          >
            العربية
          </button>
        </div>

        {/* Copyright */}
        <div className="text-xs font-mono text-[#A7A298] pt-5 border-t border-[#2B303D]/80 w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span>© 2026 MD JABER HOSAIN. {footerConfig?.copyrightText ? loc(footerConfig.copyrightText) : ui.footer.rights}</span>
            <a
              href="#admin"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = 'admin';
                onOpenAdmin?.();
              }}
              title="Admin Panel"
              className="text-neutral-600 hover:text-[#E4583B] transition-colors p-1 rounded inline-flex items-center"
              aria-label="Admin Login"
            >
              <Lock className="w-3 h-3" />
            </a>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-[#A7A298] hover:text-[#E4583B] transition-colors cursor-pointer"
          >
            <span>{footerConfig?.backToTopText ? loc(footerConfig.backToTopText) : 'Back to top'}</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
