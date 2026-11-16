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
  Lock,
  MapPin
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useNavigation } from '../context/NavigationContext';
import { FooterWordmark3D } from './common/FooterWordmark3D';
import { RevealContactPill } from './common/RevealContactPill';

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

  const activeSocialLinks =
    portfolio.socialLinks && portfolio.socialLinks.length > 0
      ? portfolio.socialLinks.filter((s) => s.enabled !== false && Boolean(s.url && s.url.trim()))
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
        ].filter((s) => Boolean(s.url && s.url.trim()));

  const renderSocialIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'facebook':
        return <Facebook className="w-4 h-4" strokeWidth={1.35} />;
      case 'telegram':
        return <Send className="w-4 h-4" strokeWidth={1.35} />;
      case 'behance':
        return <span className="font-semibold text-xs tracking-tight">Bē</span>;
      case 'youtube':
        return <Youtube className="w-4 h-4" strokeWidth={1.35} />;
      case 'instagram':
        return <Instagram className="w-4 h-4" strokeWidth={1.35} />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" strokeWidth={1.35} />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4" strokeWidth={1.35} />;
      case 'twitter':
        return <Twitter className="w-4 h-4" strokeWidth={1.35} />;
      case 'github':
        return <Github className="w-4 h-4" strokeWidth={1.35} />;
      default:
        return <Globe className="w-4 h-4" strokeWidth={1.35} />;
    }
  };

  return (
    <footer className="bg-[#121419] border-t border-white/[0.08] text-[#A7A298] pt-14 pb-3 overflow-hidden transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Multi-Column Studio Footer Grid (Modeled on Clean Editorial Footer Reference) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Col 1: Brand Positioning */}
          <div className="lg:col-span-4 space-y-4">
            <a
              href="#/"
              onClick={(e) => {
                if (isMultiPageEnabled) {
                  e.preventDefault();
                  navigateTo('home');
                }
              }}
              className="inline-flex items-center space-x-2.5 rtl:space-x-reverse"
            >
              <span className="font-display text-lg font-bold tracking-tight text-[#F4F0E8] lowercase">
                {(portfolio.branding?.logoText || 'md. jaber').toLowerCase()}
              </span>
            </a>

            <p className="text-xs leading-relaxed text-[#9A958C] max-w-xs">
              {language === 'bn'
                ? 'ভিডিও এডিটিং, মোশন গ্রাফিক্স, গ্রাফিক ডিজাইন, AI ওয়ার্কফ্লো, সোশ্যাল মিডিয়া এবং আইটি ও কম্পিউটার অপারেশনে মানসম্মত ক্রিয়েটিভ সলিউশন।'
                : 'Independent Creative Studio — delivering Video Editing, Graphic Design, AI Workflows, Social Media Growth & IT Operations.'}
            </p>

            <div className="flex items-start gap-2 text-xs text-[#9A958C]">
              <MapPin className="w-3.5 h-3.5 text-[#E4583B] shrink-0 mt-0.5" />
              <span>
                {language === 'bn'
                  ? "তা'মীরুল মিল্লাত কামিল মাদরাসা, টঙ্গী, গাজীপুর · ঢাকা, বাংলাদেশ"
                  : "Ta'mirul Millat Area, Tongi, Gazipur · Dhaka, Bangladesh"}
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Pages */}
          <div className="lg:col-span-2 space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#F4F0E8]">
              {language === 'bn' ? 'পেজসমূহ' : 'Explore'}
            </div>
            {isMultiPageEnabled && (
              <nav aria-label="Footer Pages" className="flex flex-col space-y-2">
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
                      className={`text-xs transition-colors w-fit ${
                        active
                          ? 'text-[#E4583B] font-semibold'
                          : 'text-[#9A958C] hover:text-[#F4F0E8]'
                      }`}
                    >
                      {p.label[language] || p.label.en}
                    </a>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Col 3: Disciplines */}
          <div className="lg:col-span-2 space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#F4F0E8]">
              {language === 'bn' ? 'কাজের ক্ষেত্র' : 'Disciplines'}
            </div>
            <ul className="space-y-2 text-xs text-[#9A958C]">
              <li>{language === 'bn' ? 'ভিডিও এডিটিং ও রিলস' : 'Video & Motion Cuts'}</li>
              <li>{language === 'bn' ? 'গ্রাফিক ও পোস্টার ডিজাইন' : 'Graphic & Brand Design'}</li>
              <li>{language === 'bn' ? 'AI ওয়ার্কফ্লো ও সোশ্যাল' : 'AI & Social Campaigns'}</li>
              <li>{language === 'bn' ? 'কম্পিউটার অপারেটর ও IT' : 'Computer & IT Operations'}</li>
            </ul>
          </div>

          {/* Col 4: Click-to-Reveal Direct Contact + Social Discs */}
          <div className="lg:col-span-4 space-y-3.5">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#F4F0E8]">
              {footerConfig?.connectTitle ? loc(footerConfig.connectTitle) : ui.footer.connect}
            </div>

            <div className="flex flex-col gap-2.5">
              <RevealContactPill
                type="email"
                value={portfolio.contact?.email || 'sbmc.3925@gmail.com'}
                href={`mailto:${portfolio.contact?.email || 'sbmc.3925@gmail.com'}`}
                language={language}
                compact
              />
              <RevealContactPill
                type="whatsapp"
                value="+880 1904-621391"
                href="https://wa.me/8801904621391"
                language={language}
                compact
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {activeSocialLinks.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full glass-icon-disc flex items-center justify-center hover:scale-105"
                  title={item.name || item.platform}
                  aria-label={item.name || item.platform}
                >
                  {renderSocialIcon(item.icon || item.platform)}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Language + Copyright + Admin Lock + Back to Top Bar */}
        <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9A958C]">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span>
              © 2026 MD JABER HOSAIN.{' '}
              {footerConfig?.copyrightText ? loc(footerConfig.copyrightText) : ui.footer.rights}
            </span>
            <a
              href="#admin"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = 'admin';
                onOpenAdmin?.();
              }}
              title="Admin Panel"
              className="text-neutral-500 hover:text-[#E4583B] transition-colors p-1 rounded-full inline-flex items-center"
              aria-label="Admin Login"
            >
              <Lock className="w-3 h-3" strokeWidth={1.35} />
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Globe className="w-3.5 h-3.5 text-[#9A958C]" strokeWidth={1.35} />
            {(['en', 'bn', 'ar'] as const).map((langCode) => (
              <button
                key={langCode}
                type="button"
                onClick={() => setLanguage(langCode)}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                  language === langCode ? 'glass-pill-cta font-semibold' : 'hover:text-[#F4F0E8]'
                }`}
              >
                {langCode === 'en' ? 'English' : langCode === 'bn' ? 'বাংলা' : 'العربية'}
              </button>
            ))}

            <button
              type="button"
              onClick={scrollToTop}
              className="ml-2 inline-flex items-center space-x-1.5 rtl:space-x-reverse text-[#9A958C] hover:text-[#F4F0E8] transition-colors cursor-pointer"
            >
              <span>
                {footerConfig?.backToTopText ? loc(footerConfig.backToTopText) : 'Back to top'}
              </span>
              <span className="w-7 h-7 rounded-full glass-icon-disc inline-flex items-center justify-center">
                <ArrowUp className="w-3.5 h-3.5" strokeWidth={1.35} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Monumental 3D Sculpted Name Signature Blended Into Floor (Preserved Across All Pages) */}
      <FooterWordmark3D />
    </footer>
  );
};
