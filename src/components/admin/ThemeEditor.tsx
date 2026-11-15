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
    if (themeId === 'dark') return;
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
    { id: 'Hind Siliguri', label: 'Hind Siliguri (হিন্দ শিলিগুড়ি)' },
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
    <div className="space-y-6 max-w-4xl">
      {/* SECTION: BRAND & THEME COLORS */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-9 h-9 rounded-lg bg-[#171A21] border border-white/[0.08] flex items-center justify-center text-[#E4583B]">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">Brand & Visual Colors</h3>
              <p className="text-xs text-neutral-400">
                Changes apply instantly via CSS variables and persist on Publish
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetColors}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.08] text-xs text-neutral-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#E4583B]" />
            <span>Reset Colors to Default</span>
          </button>
        </div>

        {/* Color Pickers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: 'background' as const, label: 'Background Color', value: colors.background },
            { key: 'surface' as const, label: 'Surface & Card Color', value: colors.surface },
            { key: 'primary' as const, label: 'Primary Brand Accent', value: colors.primary },
            { key: 'secondary' as const, label: 'Secondary Surface (Badges)', value: colors.secondary },
            { key: 'text' as const, label: 'Main Text Color', value: colors.text },
            { key: 'border' as const, label: 'Border Color', value: colors.border }
          ].map((item) => (
            <div key={item.key} className="p-3.5 rounded-xl bg-[#171A21] border border-white/[0.08] space-y-2">
              <label className="block text-xs font-medium text-neutral-300">
                {item.label}
              </label>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="color"
                  value={item.value}
                  onChange={(e) => updateColor(item.key, e.target.value)}
                  className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => updateColor(item.key, e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white font-mono"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION: FONTS BY LANGUAGE */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-9 h-9 rounded-lg bg-[#171A21] border border-white/[0.08] flex items-center justify-center text-[#E4583B]">
              <Type className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">Language Typography & Fonts</h3>
              <p className="text-xs text-neutral-400">
                Dedicated font selection for Bangla, English, and Arabic
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetFonts}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.08] text-xs text-neutral-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#E4583B]" />
            <span>Reset Fonts to Default</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Bangla Font */}
          <div className="p-4 rounded-xl bg-[#171A21] border border-white/[0.08] space-y-3">
            <label className="block text-xs font-medium text-neutral-300">
              বাংলা ফন্ট (Bangla Font)
            </label>
            <select
              value={fonts.bangla}
              onChange={(e) => updateFont('bangla', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-white focus:border-[#E4583B] focus:outline-none"
            >
              {banglaFonts.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
            <div className="p-3 rounded-lg bg-[#0B0C0F] border border-white/[0.06]">
              <p className="text-sm text-neutral-200" style={{ fontFamily: fonts.bangla }}>
                আমার নাম মো. জাবির হোসেন। আমি ক্রিয়েটিভ গ্রাফিক ডিজাইন এবং ভিডিও এডিটিং করি।
              </p>
            </div>
          </div>

          {/* English Font */}
          <div className="p-4 rounded-xl bg-[#171A21] border border-white/[0.08] space-y-3">
            <label className="block text-xs font-medium text-neutral-300">
              English Font
            </label>
            <select
              value={fonts.english}
              onChange={(e) => updateFont('english', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-white focus:border-[#E4583B] focus:outline-none"
            >
              {englishFonts.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
            <div className="p-3 rounded-lg bg-[#0B0C0F] border border-white/[0.06]">
              <p className="text-sm text-neutral-200" style={{ fontFamily: fonts.english }}>
                MD JABER HOSAIN — Creating ideas, editing stories, and building brands.
              </p>
            </div>
          </div>

          {/* Arabic Font */}
          <div className="p-4 rounded-xl bg-[#171A21] border border-white/[0.08] space-y-3">
            <label className="block text-xs font-medium text-neutral-300">
              الخط العربي (Arabic Font)
            </label>
            <select
              value={fonts.arabic}
              onChange={(e) => updateFont('arabic', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-white focus:border-[#E4583B] focus:outline-none"
            >
              {arabicFonts.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
            <div className="p-3 rounded-lg bg-[#0B0C0F] border border-white/[0.06]" dir="rtl">
              <p className="text-sm text-neutral-200" style={{ fontFamily: fonts.arabic }}>
                محمد جابر حسين — متخصص إبداعي في التصميم الجرافيكي ومونتاج الفيديو.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: VISITOR THEME SELECTOR OPTIONS */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-9 h-9 rounded-lg bg-[#171A21] border border-white/[0.08] flex items-center justify-center text-[#E4583B]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">Visitor Theme Selector</h3>
              <p className="text-xs text-neutral-400">
                Choose which themes visitors are allowed to preview and switch between on the website
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[
            { id: 'dark' as ThemeId, label: 'Dark Theme (Default Locked)', dot: '#E4583B', locked: true, desc: 'Original charcoal & coral-orange design' },
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
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isEnabled
                    ? 'bg-[#171A21] border-[#E4583B]/40'
                    : 'bg-[#0B0C0F]/70 border-white/[0.06] opacity-60'
                } ${theme.locked ? 'cursor-not-allowed' : 'hover:border-[#E4583B]/70'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                    <span
                      className="w-3.5 h-3.5 rounded border border-black/40 flex-shrink-0"
                      style={{ backgroundColor: theme.dot }}
                    />
                    <div>
                      <h4 className="text-sm font-medium text-white leading-tight">{theme.label}</h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5">{theme.desc}</p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                      isEnabled
                        ? 'bg-[#E4583B] border-[#E4583B] text-white'
                        : 'border-white/15 bg-transparent'
                    }`}
                  >
                    {isEnabled && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>

                {theme.locked && (
                  <span className="text-[10px] text-[#E4583B] uppercase tracking-wider font-medium">
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
