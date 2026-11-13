import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Globe, MessageSquare, Eye, Palette } from 'lucide-react';
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
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
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
    { id: 'dark', label: 'Dark (Default)', dot: '#FF5722' },
    { id: 'light', label: 'Light', dot: '#EA580C' },
    { id: 'blue', label: 'Blue', dot: '#38BDF8' },
    { id: 'green', label: 'Green', dot: '#10B981' },
    { id: 'purple', label: 'Purple', dot: '#A855F7' },
    { id: 'warm', label: 'Warm / Gold', dot: '#F59E0B' },
    { id: 'custom', label: 'Custom', dot: customAccentColor || '#FF5722' },
  ];
  const themeOptions = allThemes.filter((t) => availableThemeIds.includes(t.id));

  return (
    <>
      {/* Draft Mode Notification Bar if active (visible only during admin preview) */}
      {isPreviewDraft && (
        <aside aria-label="Draft mode notice" className="sticky top-0 z-50 bg-[#FF5722] text-white text-xs font-semibold px-4 py-1.5 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2 rtl:space-x-reverse mx-auto">
            <Eye className="w-4 h-4 animate-pulse" />
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
            ? 'bg-[#0B0F12]/85 backdrop-blur-xl border-b border-[#1A222B] py-3.5 shadow-2xl'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Brand Monogram: MJ (Matching User Website) */}
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
              <div className="w-10 h-10 rounded-xl bg-[#141A20] border border-[#232B33] flex items-center justify-center font-bold text-lg text-white group-hover:border-[#FF5722] group-hover:glow-orange-sm transition-all duration-300 font-mono">
                <span className="text-white">{portfolio.branding?.logoInitials?.[0] || 'M'}</span>
                <span className="text-[#FF5722]">{portfolio.branding?.logoInitials?.[1] || 'J'}</span>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-bold text-sm tracking-tight text-white group-hover:text-[#FF5722] transition-colors font-mono whitespace-nowrap">
                  {portfolio.branding?.logoText || 'MD JABER HOSAIN'}
                </span>
              </div>
            </a>

            {/* Desktop Navigation with active page state */}
            <nav className="nav-pill-container hidden lg:flex items-center space-x-1 rtl:space-x-reverse px-3 py-1.5 rounded-full bg-[#12161A]/80 border border-[#232B33] backdrop-blur-md">
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
                    className={`nav-pill-link px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all uppercase font-mono tracking-wider whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#FF5722] text-white shadow-sm'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
            </nav>

            {/* Right Action: Theme Selector + Language switcher + Let's Talk CTA */}
            <div className="hidden sm:flex items-center space-x-2.5 rtl:space-x-reverse">
              {/* Theme Selector Dropdown */}
              <div className="relative" ref={themeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                  className="flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-2 text-xs font-mono font-bold rounded-xl bg-[#141A20] border border-[#232B33] text-neutral-200 hover:border-[#FF5722] transition-colors"
                  aria-label="Select Theme"
                  title="Theme Preview"
                >
                  <Palette className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block border border-black/30"
                    style={{
                      backgroundColor:
                        themeOptions.find((t) => t.id === activeThemeId)?.dot || '#FF5722',
                    }}
                  />
                </button>

                {themeDropdownOpen && (
                  <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-48 py-2 bg-[#141A20] border border-[#232B33] rounded-2xl shadow-2xl z-50 backdrop-blur-xl animate-in fade-in-50 duration-150">
                    <div className="px-3 py-1 text-[10px] font-mono uppercase text-neutral-400 tracking-wider border-b border-[#232B33] mb-1">
                      Theme Preview
                    </div>
                    {themeOptions.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setActiveThemeId(t.id);
                          if (t.id !== 'custom') setThemeDropdownOpen(false);
                        }}
                        className={`w-full text-left rtl:text-right px-3.5 py-1.5 text-xs flex items-center justify-between hover:bg-white/5 transition-colors ${
                          activeThemeId === t.id
                            ? 'text-white font-bold bg-[#FF5722]/10'
                            : 'text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <span
                            className="w-3 h-3 rounded-full border border-black/30 shadow-sm"
                            style={{ backgroundColor: t.dot }}
                          />
                          <span>{t.label}</span>
                        </div>
                        {activeThemeId === t.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722]" />
                        )}
                      </button>
                    ))}

                    {/* Inline custom color picker when custom is selected */}
                    {activeThemeId === 'custom' && (
                      <div className="mt-2 pt-2 border-t border-[#232B33] px-3.5 py-1.5 flex items-center justify-between">
                        <span className="text-[11px] text-neutral-400 font-mono">Accent Color:</span>
                        <input
                          type="color"
                          value={customAccentColor}
                          onChange={(e) => setCustomAccentColor(e.target.value)}
                          className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                          title="Pick custom accent color"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Language Selector Dropdown */}
              <div className="relative" ref={langDropdownRef}>
                <button
                  type="button"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-2 text-xs font-mono font-bold rounded-xl bg-[#141A20] border border-[#232B33] text-neutral-200 hover:border-[#FF5722] transition-colors"
                  aria-label="Select Language"
                >
                  <Globe className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span className="uppercase">{language}</span>
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-36 py-1.5 bg-[#141A20] border border-[#232B33] rounded-xl shadow-2xl z-50 backdrop-blur-xl">
                    {languages.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => {
                          setLanguage(item.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left rtl:text-right px-4 py-2 text-xs flex items-center justify-between hover:bg-neutral-800/80 transition-colors ${
                          language === item.code ? 'text-[#FF5722] font-bold bg-[#FF5722]/10' : 'text-neutral-300'
                        }`}
                      >
                        <span>{item.native}</span>
                        {language === item.code && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Let's Talk CTA */}
              <a
                href="#/contact"
                onClick={(e) => {
                  if (isMultiPageEnabled) {
                    e.preventDefault();
                    navigateTo('contact');
                  }
                }}
                className="inline-flex items-center space-x-2 rtl:space-x-reverse px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-[#FF5722] hover:bg-[#F4511E] glow-orange-sm hover:glow-orange transition-all duration-200 uppercase font-mono tracking-wider whitespace-nowrap shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{ui.nav.hireMe}</span>
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
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#141A20] border border-[#232B33] text-neutral-200 font-mono"
                aria-label="Toggle language"
              >
                {language.toUpperCase()}
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-[#141A20] border border-[#232B33] text-neutral-300 hover:text-white"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown without any admin links */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0B0F12]/98 border-b border-[#232B33] px-4 pt-3 pb-6 space-y-2 backdrop-blur-2xl animate-in slide-in-from-top duration-200">
            {/* Mobile Theme Selector */}
            <div className="p-3 rounded-2xl bg-[#141A20] border border-[#232B33] space-y-2 mb-2">
              <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                <span className="flex items-center space-x-1.5 rtl:space-x-reverse">
                  <Palette className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span>Color Theme</span>
                </span>
                <span className="text-[10px] uppercase text-neutral-500">{activeThemeId}</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {themeOptions.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveThemeId(t.id)}
                    className={`px-2.5 py-1 text-xs rounded-lg flex items-center space-x-1.5 rtl:space-x-reverse border transition-all ${
                      activeThemeId === t.id
                        ? 'border-[#FF5722] bg-[#FF5722]/15 text-white font-bold'
                        : 'border-[#232B33] bg-[#0F1419] text-neutral-300'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block border border-black/30"
                      style={{ backgroundColor: t.dot }}
                    />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
              {activeThemeId === 'custom' && (
                <div className="flex items-center justify-between pt-2 border-t border-[#232B33]">
                  <span className="text-xs text-neutral-400 font-mono">Pick Custom Color:</span>
                  <input
                    type="color"
                    value={customAccentColor}
                    onChange={(e) => setCustomAccentColor(e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
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
                  className={`block px-4 py-2.5 text-sm font-semibold rounded-xl uppercase font-mono transition-colors ${
                    isActive
                      ? 'bg-[#FF5722]/15 text-[#FF5722] border border-[#FF5722]/40'
                      : 'text-neutral-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}

            <div className="pt-2 border-t border-[#232B33]">
              <a
                href="#/contact"
                onClick={(e) => {
                  if (isMultiPageEnabled) {
                    e.preventDefault();
                    navigateTo('contact');
                  }
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center block py-3 rounded-xl font-bold font-mono text-white bg-[#FF5722] hover:bg-[#F4511E] glow-orange-sm uppercase text-xs tracking-wider"
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
