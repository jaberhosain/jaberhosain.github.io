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

  const navLinks = pages.map((p) => ({
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
    { id: 'custom', label: 'Custom', dot: customAccentColor || '#E4583B' },
  ];
  const themeOptions = allThemes.filter((t) => availableThemeIds.includes(t.id));

  return (
    <>
      {isPreviewDraft && (
        <aside aria-label="Draft mode notice" className="sticky top-0 z-50 bg-[#E4583B] text-white text-xs font-semibold px-4 py-1.5 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2 rtl:space-x-reverse mx-auto">
            <Eye className="w-4 h-4" />
            <span>Previewing Draft Version — Changes are not yet published live to visitors.</span>
          </div>
          <button
            onClick={() => setIsPreviewDraft(false)}
            className="text-xs bg-black/20 hover:bg-black/30 px-2.5 py-0.5 rounded transition-colors"
          >
            Exit Preview
          </button>
        </aside>
      )}

      <header
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
          isPreviewDraft ? 'top-8' : 'top-0'
        } ${
          isScrolled
            ? 'studio-nav-scrolled bg-[#121419]/92 border-b border-[#2B303D] py-3.5 shadow-xl'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">

            {/* Zone 1: Editorial Monogram */}
            <a
              href="#/"
              onClick={(e) => {
                if (isMultiPageEnabled) {
                  e.preventDefault();
                  navigateTo('home');
                }
              }}
              className="flex items-center space-x-3 rtl:space-x-reverse group cursor-pointer focus:outline-none shrink-0"
            >
              <div className="w-9 h-9 rounded-lg bg-[#181B22] border border-[#2B303D] flex items-center justify-center font-bold text-sm text-[#F4F0E8] group-hover:border-[#E4583B] transition-colors font-display tracking-tight">
                <span>{portfolio.branding?.logoInitials?.[0] || 'M'}</span>
                <span className="text-[#E4583B]">{portfolio.branding?.logoInitials?.[1] || 'J'}</span>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-bold text-xs tracking-[0.14em] text-[#F4F0E8] group-hover:text-[#E4583B] transition-colors font-mono uppercase whitespace-nowrap">
                  {portfolio.branding?.logoText || 'MD JABER HOSAIN'}
                </span>
              </div>
            </a>

            {/* Zone 2: Clean Unboxed International Navigation */}
            <nav aria-label="Primary Navigation" className="hidden lg:flex items-center space-x-7 rtl:space-x-reverse">
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
                    className={`nav-pill-link editorial-link py-1 text-xs font-mono uppercase tracking-[0.15em] transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'text-[#E4583B] font-bold'
                        : 'text-[#A7A298] hover:text-[#F4F0E8]'
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
            </nav>

            {/* Zone 3: Theme, Language & Architectural Contact CTA */}
            <div className="hidden sm:flex items-center space-x-2.5 rtl:space-x-reverse shrink-0">
              {/* Theme Selector */}
              <div className="relative" ref={themeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                  className="flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-2 text-xs font-mono rounded-lg bg-[#181B22] border border-[#2B303D] text-[#DDD1BE] hover:border-[#E4583B] transition-colors cursor-pointer"
                  aria-label="Select Theme"
                  title="Color Grade Theme"
                >
                  <Palette className="w-3.5 h-3.5 text-[#E4583B]" />
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{
                      backgroundColor:
                        themeOptions.find((t) => t.id === activeThemeId)?.dot || '#E4583B',
                    }}
                  />
                </button>

                {themeDropdownOpen && (
                  <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-48 py-2 bg-[#181B22] border border-[#2B303D] rounded-xl shadow-2xl z-50">
                    <div className="px-3 py-1 text-[10px] font-mono uppercase text-[#A7A298] tracking-wider border-b border-[#2B303D] mb-1">
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
                            ? 'text-[#F4F0E8] font-bold bg-[#E4583B]/10'
                            : 'text-[#A7A298]'
                        }`}
                      >
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: t.dot }}
                          />
                          <span>{t.label}</span>
                        </div>
                        {activeThemeId === t.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E4583B]" />
                        )}
                      </button>
                    ))}

                    {activeThemeId === 'custom' && (
                      <div className="mt-2 pt-2 border-t border-[#2B303D] px-3.5 py-1.5 flex items-center justify-between">
                        <span className="text-[11px] text-[#A7A298] font-mono">Accent:</span>
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

              {/* Language Selector */}
              <div className="relative" ref={langDropdownRef}>
                <button
                  type="button"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-2 text-xs font-mono font-semibold rounded-lg bg-[#181B22] border border-[#2B303D] text-[#DDD1BE] hover:border-[#E4583B] transition-colors cursor-pointer"
                  aria-label="Select Language"
                >
                  <Globe className="w-3.5 h-3.5 text-[#E4583B]" />
                  <span className="uppercase">{language}</span>
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-36 py-1.5 bg-[#181B22] border border-[#2B303D] rounded-xl shadow-2xl z-50">
                    {languages.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => {
                          setLanguage(item.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left rtl:text-right px-4 py-2 text-xs flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer ${
                          language === item.code ? 'text-[#E4583B] font-bold bg-[#E4583B]/10' : 'text-[#A7A298]'
                        }`}
                      >
                        <span>{item.native}</span>
                        {language === item.code && <span className="w-1.5 h-1.5 rounded-full bg-[#E4583B]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Hire / Contact CTA */}
              <a
                href="#/contact"
                onClick={(e) => {
                  if (isMultiPageEnabled) {
                    e.preventDefault();
                    navigateTo('contact');
                  }
                }}
                className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 text-xs font-bold rounded-lg text-white bg-[#E4583B] hover:bg-[#D0492D] transition-colors uppercase font-mono tracking-wider whitespace-nowrap shrink-0"
              >
                <span>{ui.nav.hireMe}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse lg:hidden">
              <button
                type="button"
                onClick={() => {
                  const nextLang: Language = language === 'en' ? 'bn' : language === 'bn' ? 'ar' : 'en';
                  setLanguage(nextLang);
                }}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#181B22] border border-[#2B303D] text-[#DDD1BE] font-mono"
                aria-label="Toggle language"
              >
                {language.toUpperCase()}
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-[#181B22] border border-[#2B303D] text-[#F4F0E8]"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#121419]/98 border-b border-[#2B303D] px-4 pt-3 pb-6 space-y-2">
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
                    setMobileMenuOpen(false);
                  }}
                  className={`block px-4 py-2.5 text-sm font-semibold rounded-lg uppercase font-mono transition-colors ${
                    isActive
                      ? 'bg-[#E4583B]/15 text-[#E4583B] border border-[#E4583B]/40'
                      : 'text-[#DDD1BE] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
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
                className="w-full text-center block py-3 rounded-lg font-bold font-mono text-white bg-[#E4583B] hover:bg-[#D0492D] uppercase text-xs tracking-wider"
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
