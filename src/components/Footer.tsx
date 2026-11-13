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

  // Resolve active social links (only enabled ones with non-empty URLs)
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
    <footer className="bg-[#070A0C] border-t border-[#1D232A] text-neutral-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-6">

        {/* Page Directory Links */}
        {isMultiPageEnabled && (
          <nav aria-label="Footer Pages" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pb-4 border-b border-[#1D232A]/70 w-full max-w-2xl">
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
                  className={`text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap ${
                    active ? 'text-[#FF5722] font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {p.label[language] || p.label.en}
                </a>
              );
            })}
          </nav>
        )}
        
        {/* Connect Title */}
        <div className="text-xs font-mono uppercase tracking-widest text-neutral-400">
          {footerConfig?.connectTitle ? loc(footerConfig.connectTitle) : ui.footer.connect}
        </div>

        {/* Social Icons with theme-aware hover glow and accent fill */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {activeSocialLinks.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn w-10 h-10 rounded-xl bg-[#12161A] border border-[#232B33] flex items-center justify-center text-neutral-300"
              title={item.name || item.platform}
              aria-label={item.name || item.platform}
            >
              {renderSocialIcon(item.icon || item.platform)}
            </a>
          ))}
        </div>

        {/* Language switch */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs">
          <Globe className="w-3.5 h-3.5 text-[#FF5722]" />
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded ${language === 'en' ? 'bg-[#FF5722] text-white font-bold' : 'hover:text-white'}`}
          >
            English
          </button>
          <span>•</span>
          <button
            onClick={() => setLanguage('bn')}
            className={`px-2 py-0.5 rounded ${language === 'bn' ? 'bg-[#FF5722] text-white font-bold' : 'hover:text-white'}`}
          >
            বাংলা
          </button>
          <span>•</span>
          <button
            onClick={() => setLanguage('ar')}
            className={`px-2 py-0.5 rounded ${language === 'ar' ? 'bg-[#FF5722] text-white font-bold' : 'hover:text-white'}`}
          >
            العربية
          </button>
        </div>

        {/* Copyright matching screenshot */}
        <div className="text-xs font-mono text-neutral-500 pt-4 border-t border-[#1D232A] w-full flex flex-col sm:flex-row items-center justify-between gap-4">
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
              className="text-neutral-700 hover:text-[#FF5722] transition-colors p-1 rounded inline-flex items-center"
              aria-label="Admin Login"
            >
              <Lock className="w-3 h-3" />
            </a>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-neutral-400 hover:text-[#FF5722] transition-colors"
          >
            <span>{footerConfig?.backToTopText ? loc(footerConfig.backToTopText) : 'Back to top'}</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
