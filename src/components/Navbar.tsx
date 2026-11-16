import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Globe, ArrowUpRight, Eye, Palette } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useNavigation } from '../context/NavigationContext';
import { Language, ThemeId } from '../types/portfolio';

export const Navbar: React.FC = () => {
  const {
    portfolio,
    ui,
    language,
    setLanguage,
    isPreviewDraft,
    setIsPreviewDraft,
    activeThemeId,
    setActiveThemeId,
    customAccentColor,
    setCustomAccentColor
  } = usePortfolio();
  const { currentPage, navigateTo, pages, isMultiPageEnabled } = useNavigation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target as Node)) {
        setThemeDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = pages
    .filter((p) => p.id !== 'contact')
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      href: p.hash,
      label: p.label[language] || p.label.en
    }));

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'bn', label: 'Bangla', native: 'বাংলা' },
    { code: 'ar', label: 'Arabic', native: 'العربية' }
  ];

  const availableThemeIds: ThemeId[] = portfolio.theme?.availableThemes || [
    'dark',
    'light',
    'blue',
    'green',
    'purple',
    'warm',
    'custom'
  ];

  const allThemes: { id: ThemeId; label: string; dot: string }[] = [
    { id: 'dark', label: 'Studio Obsidian', dot: '#E4583B' },
    { id: 'light', label: 'Museum Paper', dot: '#C94426' },
    { id: 'blue', label: 'Nordic Slate', dot: '#38BDF8' },
    { id: 'green', label: 'Botanical Green', dot: '#34D399' },
    { id: 'purple', label: 'Aubergine', dot: '#C084FC' },
    { id: 'warm', label: 'Smoked Amber', dot: '#E6A23C' },
    { id: 'custom', label: 'Custom', dot: customAccentColor || '#E4583B' }
  ];
  const themeOptions = allThemes.filter((t) => availableThemeIds.includes(t.id));

  return (
    <>
      {isPreviewDraft && (
        <aside
          aria-label="Draft mode notice"
          className="sticky top-0 z-50 bg-[#E4583B] text-white text-xs font-semibold px-4 py-1.5 flex items-center justify-between shadow-md"
        >
          <div className="flex items-center space-x-2 rtl:space-x-reverse mx-auto">
            <Eye className="w-4 h-4" />
            <span>Previewing Draft Version — Changes are not yet published live to visitors.</span>
          </div>
          <button
            type="button"
            onClick={() => setIsPreviewDraft(false)}
            className="text-xs bg-black/20 hover:bg-black/30 px-2.5 py-0.5 rounded transition-colors cursor-pointer"
          >
            Exit Preview
          </button>
        </aside>
      )}

      <header
        className={`fixed left-0 right-0 z-40 px-3 sm:px-6 transition-all duration-300 ${
          isPreviewDraft ? 'top-10' : 'top-3.5 sm:top-5'
        }`}
      >
        <div
          className={`studio-nav-pill max-w-[1060px] mx-auto rounded-full border transition-all duration-300 ${
            isScrolled
              ? 'studio-nav-scrolled bg-[#13151B]/95 border-white/[0.12] shadow-[0_20px_50px_-14px_rgba(0,0,0,0.9)]'
              : 'bg-[#13151B]/82 border-white/[0.09] shadow-[0_18px_46px_-16px_rgba(0,0,0,0.82)]'
          } backdrop-blur-xl px-4 sm:px-5 py-2`}
        >
          <div className="flex items-center justify-between gap-6">
            {/* Zone 1: Single-line Wordmark */}
            <a
              href="#/"
              onClick={(e) => {
                if (isMultiPageEnabled) {
                  e.preventDefault();
                  navigateTo('home');
                }
              }}
              className="inline-flex items-center space-x-2.5 rtl:space-x-reverse group cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E4583B] rounded-full whitespace-nowrap shrink-0"
            >
              <span className="font-display font-bold text-sm sm:text-[15px] tracking-tight text-[#F4F0E8] transition-colors lowercase">
                {(portfolio.branding?.logoText || 'md. jaber').toLowerCase()}
              </span>
            </a>

            {/* Zone 2: Concise Single-Line Navigation Links */}
            <nav
              aria-label="Primary Navigation"
              className="hidden lg:flex items-center gap-7"
            >
              {navLinks.map((link) => {
                const isActive = isMultiPageEnabled && currentPage === link.id;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={(e) => {
                      if (isMultiPageEnabled) {
                        e.preventDefault();
                        navigateTo(link.id);
                      }
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    className={`nav-pill-link editorial-link py-1 text-xs font-medium tracking-wide transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'text-[#F4F0E8] font-semibold'
                        : 'text-[#9A958C] hover:text-[#F4F0E8]'
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
            </nav>

            {/* Zone 3: Language / Color Grade Controls + Primary Action */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              {/* Inline Language Switch */}
              <div className="relative" ref={langDropdownRef}>
                <button
                  type="button"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="inline-flex items-center space-x-1 rtl:space-x-reverse h-8 px-2.5 text-[11px] font-semibold rounded-full text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  aria-label="Select Language"
                >
                  <Globe className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.5} />
                  <span className="uppercase">{language}</span>
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-3 w-36 py-1.5 glass-showcase-inner rounded-2xl shadow-2xl z-50">
                    {languages.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => {
                          setLanguage(item.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left rtl:text-right px-4 py-2 text-xs flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer ${
                          language === item.code
                            ? 'text-[#F4F0E8] font-semibold bg-white/[0.06]'
                            : 'text-[#A7A298]'
                        }`}
                      >
                        <span>{item.native}</span>
                        {language === item.code && (
                          <span className="text-[10px] text-[#E4583B]">Active</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme Color Grade Picker */}
              <div className="relative" ref={themeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0"
                  aria-label="Select Color Grade Theme"
                  title="Color Grade"
                >
                  <Palette className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>

                {themeDropdownOpen && (
                  <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-3 w-48 py-2 glass-showcase-inner rounded-2xl shadow-2xl z-50">
                    <div className="px-3.5 py-1 text-[10px] uppercase text-[#8E8A82] tracking-wider border-b border-white/[0.08] mb-1">
                      Color Grade
                    </div>
                    {themeOptions.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setActiveThemeId(t.id);
                          if (t.id !== 'custom') setThemeDropdownOpen(false);
                        }}
                        className={`w-full text-left rtl:text-right px-3.5 py-1.5 text-xs flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer ${
                          activeThemeId === t.id
                            ? 'text-[#F4F0E8] font-semibold bg-white/[0.06]'
                            : 'text-[#A7A298]'
                        }`}
                      >
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white/20"
                            style={{ backgroundColor: t.dot }}
                          />
                          <span>{t.label}</span>
                        </div>
                      </button>
                    ))}

                    {activeThemeId === 'custom' && (
                      <div className="mt-2 pt-2 border-t border-white/[0.08] px-3.5 py-1.5 flex items-center justify-between">
                        <span className="text-[11px] text-[#A7A298]">Accent:</span>
                        <input
                          type="color"
                          value={customAccentColor}
                          onChange={(e) => setCustomAccentColor(e.target.value)}
                          className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                          title="Pick custom accent color"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Primary CTA Button */}
              <a
                href="#/contact"
                onClick={(e) => {
                  if (isMultiPageEnabled) {
                    e.preventDefault();
                    navigateTo('contact');
                  }
                }}
                className="glass-pill-ghost inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 whitespace-nowrap shrink-0"
              >
                <span>{ui.nav.hireMe}</span>
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.6} />
              </a>
            </div>

            {/* Mobile Controls */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse lg:hidden shrink-0">
              <button
                type="button"
                onClick={() => {
                  const nextLang: Language =
                    language === 'en' ? 'bn' : language === 'bn' ? 'ar' : 'en';
                  setLanguage(nextLang);
                }}
                className="glass-pill-ghost px-3 h-8 text-[11px] font-semibold rounded-full"
                aria-label="Toggle language"
              >
                {language.toUpperCase()}
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="glass-pill-ghost w-8 h-8 rounded-full flex items-center justify-center"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-4 h-4" strokeWidth={1.5} />
                ) : (
                  <Menu className="w-4 h-4" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="studio-nav-drawer lg:hidden mt-2 max-w-[1060px] mx-auto rounded-2xl bg-[#13151B]/98 border border-white/[0.1] px-4 pt-3 pb-5 space-y-2 shadow-2xl backdrop-blur-xl">
            <div className="p-3 rounded-xl bg-[#181B22] border border-[#2B303D] space-y-2 mb-2">
              <div className="flex items-center justify-between text-xs text-[#A7A298] font-mono">
                <span className="flex items-center space-x-1.5 rtl:space-x-reverse">
                  <Palette className="w-3.5 h-3.5 text-[#E4583B]" />
                  <span>Color Grade</span>
                </span>
                <span className="text-[10px] uppercase text-[#A7A298]">{activeThemeId}</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {themeOptions.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveThemeId(t.id)}
                    className={`px-2.5 py-1 text-xs rounded-lg flex items-center space-x-1.5 rtl:space-x-reverse border transition-all ${
                      activeThemeId === t.id
                        ? 'border-[#E4583B] bg-[#E4583B]/15 text-[#F4F0E8] font-bold'
                        : 'border-[#2B303D] bg-[#121419] text-[#A7A298]'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: t.dot }}
                    />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
              {activeThemeId === 'custom' && (
                <div className="flex items-center justify-between pt-2 border-t border-[#2B303D]">
                  <span className="text-xs text-[#A7A298] font-mono">Accent:</span>
                  <input
                    type="color"
                    value={customAccentColor}
                    onChange={(e) => setCustomAccentColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  />
                </div>
              )}
            </div>

            {pages.map((p) => {
              const isActive = isMultiPageEnabled && currentPage === p.id;
              return (
                <a
                  key={p.id}
                  href={p.hash}
                  onClick={(e) => {
                    if (isMultiPageEnabled) {
                      e.preventDefault();
                      navigateTo(p.id);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`block px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                    isActive
                      ? 'bg-[#E4583B]/15 text-[#E4583B] border border-[#E4583B]/40'
                      : 'text-[#DDD1BE] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {p.label[language] || p.label.en}
                </a>
              );
            })}

            <div className="pt-2 border-t border-[#2B303D]">
              <a
                href="#/contact"
                onClick={(e) => {
                  if (isMultiPageEnabled) {
                    e.preventDefault();
                    navigateTo('contact');
                  }
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center block py-3 rounded-xl font-semibold text-white bg-[#E4583B] hover:bg-[#D0492D] text-xs tracking-wider"
              >
                {ui.nav.hireMe}
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
