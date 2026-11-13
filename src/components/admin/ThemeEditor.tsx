import React from 'react';
import { Palette, Type, RotateCcw, Sliders, Check } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { defaultThemeColors, defaultThemeFonts } from '../../data/initialPortfolio';
import { ThemeId } from '../../types/portfolio';

export const ThemeEditor: React.FC = () => {
  const { draftPortfolio, updateDraft } = usePortfolio();

  const colors = draftPortfolio.theme?.colors || defaultThemeColors;
  const fonts = draftPortfolio.theme?.fonts || defaultThemeFonts;
  const availableThemes: ThemeId[] = draftPortfolio.theme?.availableThemes || [
    'dark',
    'light',
    'blue',
    'green',
    'purple',
    'warm',
    'custom'
  ];

  const updateColor = (key: keyof typeof defaultThemeColors, value: string) => {
    updateDraft(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        colors: {
          ...(prev.theme?.colors || defaultThemeColors),
          [key]: value
        },
        fonts: prev.theme?.fonts || defaultThemeFonts
      }
    }));
  };

  const updateFont = (key: keyof typeof defaultThemeFonts, value: string) => {
    updateDraft(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        colors: prev.theme?.colors || defaultThemeColors,
        fonts: {
          ...(prev.theme?.fonts || defaultThemeFonts),
          [key]: value
        }
      }
    }));
  };

  const toggleAvailableTheme = (themeId: ThemeId) => {
    if (themeId === 'dark') return; // Dark is the locked default and must remain available
    updateDraft(prev => {
      const current = prev.theme?.availableThemes || [
        'dark',
        'light',
        'blue',
        'green',
        'purple',
        'warm',
        'custom'
      ];
      const next = current.includes(themeId)
        ? current.filter(id => id !== themeId)
        : [...current, themeId];
      return {
        ...prev,
        theme: {
          ...prev.theme,
          colors: prev.theme?.colors || defaultThemeColors,
          fonts: prev.theme?.fonts || defaultThemeFonts,
          availableThemes: next
        }
      };
    });
  };

  const resetColors = () => {
    updateDraft(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        colors: { ...defaultThemeColors },
        fonts: prev.theme?.fonts || defaultThemeFonts
      }
    }));
  };

  const resetFonts = () => {
    updateDraft(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        colors: prev.theme?.colors || defaultThemeColors,
        fonts: { ...defaultThemeFonts }
      }
    }));
  };

  const banglaFonts = [
    { id: 'Li Ador Noirrit', label: 'Li Ador Noirrit (আদর নৈঋত - Default Locked)' },
    { id: 'Hind Siliguri', label: 'Hind Siliguri (হিন্দ শিলিগুড়ি)' },
    { id: 'Noto Sans Bengali', label: 'Noto Sans Bengali' },
    { id: 'Tiro Bangla', label: 'Tiro Bangla' }
  ];

  const englishFonts = [
    { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Default Locked)' },
    { id: 'Space Grotesk', label: 'Space Grotesk' },
    { id: 'Inter', label: 'Inter' },
    { id: 'Outfit', label: 'Outfit' },
    { id: 'Poppins', label: 'Poppins' }
  ];

  const arabicFonts = [
    { id: 'Cairo', label: 'Cairo (القاهرة - Default Locked)' },
    { id: 'Amiri', label: 'Amiri (أميري)' },
    { id: 'Noto Sans Arabic', label: 'Noto Sans Arabic' }
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      {/* SECTION: BRAND & THEME COLORS */}
      <div className="p-6 rounded-3xl bg-[#12161A] border border-[#232B33] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1D232A]">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-[#181E24] border border-[#232B33] flex items-center justify-center text-[#FF5722]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">Brand & Visual Colors</h3>
              <p className="text-xs text-neutral-400 font-mono">
                Changes apply instantly via CSS variables and persist on Publish
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetColors}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#181E24] hover:bg-[#232B33] border border-[#232B33] text-xs font-mono text-neutral-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#FF5722]" />
            <span>Reset Colors to Default</span>
          </button>
        </div>

        {/* Color Pickers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Background */}
          <div className="p-3.5 rounded-2xl bg-[#181E24] border border-[#232B33] space-y-2">
            <label className="block text-xs font-mono text-neutral-300 font-semibold">
              Background Color
            </label>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <input
                type="color"
                value={colors.background}
                onChange={(e) => updateColor('background', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={colors.background}
                onChange={(e) => updateColor('background', e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Surface / Cards */}
          <div className="p-3.5 rounded-2xl bg-[#181E24] border border-[#232B33] space-y-2">
            <label className="block text-xs font-mono text-neutral-300 font-semibold">
              Surface & Card Color
            </label>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <input
                type="color"
                value={colors.surface}
                onChange={(e) => updateColor('surface', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={colors.surface}
                onChange={(e) => updateColor('surface', e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Primary Brand (Orange) */}
          <div className="p-3.5 rounded-2xl bg-[#181E24] border border-[#232B33] space-y-2">
            <label className="block text-xs font-mono text-neutral-300 font-semibold">
              Primary Brand Accent
            </label>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <input
                type="color"
                value={colors.primary}
                onChange={(e) => updateColor('primary', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={colors.primary}
                onChange={(e) => updateColor('primary', e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Secondary Surfaces */}
          <div className="p-3.5 rounded-2xl bg-[#181E24] border border-[#232B33] space-y-2">
            <label className="block text-xs font-mono text-neutral-300 font-semibold">
              Secondary Surface (Badges)
            </label>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <input
                type="color"
                value={colors.secondary}
                onChange={(e) => updateColor('secondary', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={colors.secondary}
                onChange={(e) => updateColor('secondary', e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Main Text */}
          <div className="p-3.5 rounded-2xl bg-[#181E24] border border-[#232B33] space-y-2">
            <label className="block text-xs font-mono text-neutral-300 font-semibold">
              Main Text Color
            </label>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <input
                type="color"
                value={colors.text}
                onChange={(e) => updateColor('text', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={colors.text}
                onChange={(e) => updateColor('text', e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Border */}
          <div className="p-3.5 rounded-2xl bg-[#181E24] border border-[#232B33] space-y-2">
            <label className="block text-xs font-mono text-neutral-300 font-semibold">
              Border Color
            </label>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <input
                type="color"
                value={colors.border}
                onChange={(e) => updateColor('border', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={colors.border}
                onChange={(e) => updateColor('border', e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: FONTS BY LANGUAGE */}
      <div className="p-6 rounded-3xl bg-[#12161A] border border-[#232B33] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1D232A]">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-[#181E24] border border-[#232B33] flex items-center justify-center text-[#FF5722]">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">Language Typography & Fonts</h3>
              <p className="text-xs text-neutral-400 font-mono">
                Dedicated Google Fonts selection for Bangla, English, and Arabic
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetFonts}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#181E24] hover:bg-[#232B33] border border-[#232B33] text-xs font-mono text-neutral-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#FF5722]" />
            <span>Reset Fonts to Default</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Bangla Font */}
          <div className="p-4 rounded-2xl bg-[#181E24] border border-[#232B33] space-y-3">
            <label className="block text-xs font-mono text-neutral-300 font-semibold">
              বাংলা ফন্ট (Bangla Font)
            </label>
            <select
              value={fonts.bangla}
              onChange={(e) => updateFont('bangla', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0F1419] border border-[#232B33] text-sm text-white font-mono focus:border-[#FF5722] focus:outline-none"
            >
              {banglaFonts.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
            <div className="p-3 rounded-xl bg-[#0F1419] border border-[#232B33]">
              <p className="text-sm text-neutral-200" style={{ fontFamily: fonts.bangla }}>
                আমার নাম মো. জাবির হোসেন। আমি ক্রিয়েটিভ গ্রাফিক ডিজাইন এবং ভিডিও এডিটিং করি।
              </p>
            </div>
          </div>

          {/* English Font */}
          <div className="p-4 rounded-2xl bg-[#181E24] border border-[#232B33] space-y-3">
            <label className="block text-xs font-mono text-neutral-300 font-semibold">
              English Font
            </label>
            <select
              value={fonts.english}
              onChange={(e) => updateFont('english', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0F1419] border border-[#232B33] text-sm text-white font-mono focus:border-[#FF5722] focus:outline-none"
            >
              {englishFonts.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
            <div className="p-3 rounded-xl bg-[#0F1419] border border-[#232B33]">
              <p className="text-sm text-neutral-200" style={{ fontFamily: fonts.english }}>
                MD JABER HOSAIN — Creating ideas, editing stories, and building brands.
              </p>
            </div>
          </div>

          {/* Arabic Font */}
          <div className="p-4 rounded-2xl bg-[#181E24] border border-[#232B33] space-y-3">
            <label className="block text-xs font-mono text-neutral-300 font-semibold">
              الخط العربي (Arabic Font)
            </label>
            <select
              value={fonts.arabic}
              onChange={(e) => updateFont('arabic', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0F1419] border border-[#232B33] text-sm text-white font-mono focus:border-[#FF5722] focus:outline-none"
            >
              {arabicFonts.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
            <div className="p-3 rounded-xl bg-[#0F1419] border border-[#232B33]" dir="rtl">
              <p className="text-sm text-neutral-200" style={{ fontFamily: fonts.arabic }}>
                محمد جابر حسين — متخصص إبداعي في التصميم الجرافيكي ومونتاج الفيديو.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: VISITOR THEME SELECTOR OPTIONS */}
      <div className="p-6 rounded-3xl bg-[#12161A] border border-[#232B33] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1D232A]">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-[#181E24] border border-[#232B33] flex items-center justify-center text-[#FF5722]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">Visitor Theme Selector</h3>
              <p className="text-xs text-neutral-400 font-mono">
                Choose which themes visitors are allowed to preview and switch between on the website
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[
            { id: 'dark' as ThemeId, label: 'Dark Theme (Default Locked)', dot: '#FF5722', locked: true, desc: 'Original charcoal & orange design' },
            { id: 'light' as ThemeId, label: 'Light Theme', dot: '#EA580C', locked: false, desc: 'Clean, high-contrast light mode' },
            { id: 'blue' as ThemeId, label: 'Blue Ocean', dot: '#38BDF8', locked: false, desc: 'Deep navy background with sapphire glow' },
            { id: 'green' as ThemeId, label: 'Emerald Green', dot: '#10B981', locked: false, desc: 'Forest tone with emerald accent' },
            { id: 'purple' as ThemeId, label: 'Royal Purple', dot: '#A855F7', locked: false, desc: 'Deep violet with amethyst glow' },
            { id: 'warm' as ThemeId, label: 'Warm / Golden', dot: '#F59E0B', locked: false, desc: 'Espresso warmth with golden amber' },
            { id: 'custom' as ThemeId, label: 'Custom Color Picker', dot: '#EC4899', locked: false, desc: 'Allows visitor to choose their own accent' }
          ].map((theme) => {
            const isEnabled = availableThemes.includes(theme.id);
            return (
              <div
                key={theme.id}
                onClick={() => !theme.locked && toggleAvailableTheme(theme.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isEnabled
                    ? 'bg-[#181E24] border-[#FF5722]/40 shadow-sm'
                    : 'bg-[#141A20]/60 border-[#232B33] opacity-60'
                } ${theme.locked ? 'cursor-not-allowed' : 'hover:border-[#FF5722]'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                    <span
                      className="w-4 h-4 rounded-full border border-black/30 shadow-sm flex-shrink-0"
                      style={{ backgroundColor: theme.dot }}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">{theme.label}</h4>
                      <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{theme.desc}</p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      isEnabled
                        ? 'bg-[#FF5722] border-[#FF5722] text-white'
                        : 'border-[#333D48] bg-transparent'
                    }`}
                  >
                    {isEnabled && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>

                {theme.locked && (
                  <span className="text-[10px] text-[#FF5722] font-mono uppercase tracking-wider font-semibold">
                    Always Enabled (Locked Default)
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
