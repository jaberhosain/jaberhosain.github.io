import React, { useState } from 'react';
import {
  Sliders,
  ArrowUpRight,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Hash,
  Link as LinkIcon
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { HeroCounterItem } from '../../types/portfolio';
import { ImageUploaderField } from './ImageUploaderField';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export const HeroEditor: React.FC = () => {
  const { draftPortfolio, updateDraft } = usePortfolio();
  const { hero } = draftPortfolio;

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  const counters: HeroCounterItem[] = hero.counters || [];

  const handleAddCounter = () => {
    const newCounter: HeroCounterItem = {
      id: 'cnt-' + Date.now(),
      value: '10+',
      label: {
        en: 'New Metric',
        bn: 'নতুন মেট্রিক',
        ar: 'مؤشر جديد'
      },
      order: counters.length + 1
    };

    updateDraft(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        counters: [...(prev.hero.counters || []), newCounter],
        showCounters: true
      }
    }));
  };

  const handleRemoveCounter = (id: string) => {
    updateDraft(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        counters: (prev.hero.counters || []).filter(c => c.id !== id)
      }
    }));
  };

  const handleMoveCounter = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= counters.length) return;

    const nextList = [...counters];
    const temp = nextList[idx];
    nextList[idx] = nextList[targetIdx];
    nextList[targetIdx] = temp;

    const reordered = nextList.map((item, i) => ({ ...item, order: i + 1 }));

    updateDraft(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        counters: reordered
      }
    }));
  };

  const handleUpdateCounter = (id: string, updater: (item: HeroCounterItem) => HeroCounterItem) => {
    updateDraft(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        counters: (prev.hero.counters || []).map(c => c.id === id ? updater(c) : c)
      }
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 1. Header & Identity */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse pb-4 border-b border-white/[0.06]">
          <div className="w-9 h-9 rounded-lg bg-[#171A21] border border-white/[0.08] flex items-center justify-center text-[#E4583B]">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">Hero & Identity</h3>
            <p className="text-xs text-neutral-400">
              Manage availability badge, main name, tagline, and portrait
            </p>
          </div>
        </div>

        {/* Availability Badge */}
        <div className="p-4 rounded-xl bg-[#171A21] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-200 uppercase tracking-wider">
              Availability Badge
            </span>

            <label className="flex items-center space-x-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={hero.showBadge !== false}
                onChange={(e) => {
                  const val = e.target.checked;
                  updateDraft(prev => ({
                    ...prev,
                    hero: { ...prev.hero, showBadge: val }
                  }));
                }}
                className="rounded border-white/15 bg-[#0B0C0F] text-[#E4583B] focus:ring-0"
              />
              <span className={hero.showBadge !== false ? 'text-emerald-400 font-medium' : 'text-neutral-500'}>
                {hero.showBadge !== false ? 'Visible' : 'Hidden'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">Badge Text (English)</label>
              <input
                type="text"
                value={hero.badge?.en || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateDraft(prev => ({
                    ...prev,
                    hero: { ...prev.hero, badge: { ...(prev.hero.badge || { en: '', bn: '', ar: '' }), en: val } }
                  }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">Badge Text (বাংলা)</label>
              <input
                type="text"
                value={hero.badge?.bn || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateDraft(prev => ({
                    ...prev,
                    hero: { ...prev.hero, badge: { ...(prev.hero.badge || { en: '', bn: '', ar: '' }), bn: val } }
                  }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">Badge Text (العربية)</label>
              <input
                type="text"
                dir="rtl"
                value={hero.badge?.ar || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateDraft(prev => ({
                    ...prev,
                    hero: { ...prev.hero, badge: { ...(prev.hero.badge || { en: '', bn: '', ar: '' }), ar: val } }
                  }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Hero Name (3 Languages) */}
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1.5 uppercase tracking-wider">
            Hero Main Name (English, বাংলা, العربية)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="English Name"
              value={hero.name?.en || ''}
              onChange={(e) => {
                const val = e.target.value;
                updateDraft(prev => ({
                  ...prev,
                  hero: { ...prev.hero, name: { ...(prev.hero.name || { en: '', bn: '', ar: '' }), en: val } }
                }));
              }}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-sm text-white"
            />
            <input
              type="text"
              placeholder="বাংলা নাম"
              value={hero.name?.bn || ''}
              onChange={(e) => {
                const val = e.target.value;
                updateDraft(prev => ({
                  ...prev,
                  hero: { ...prev.hero, name: { ...(prev.hero.name || { en: '', bn: '', ar: '' }), bn: val } }
                }));
              }}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-sm text-white"
            />
            <input
              type="text"
              dir="rtl"
              placeholder="الاسم بالعربية"
              value={hero.name?.ar || ''}
              onChange={(e) => {
                const val = e.target.value;
                updateDraft(prev => ({
                  ...prev,
                  hero: { ...prev.hero, name: { ...(prev.hero.name || { en: '', bn: '', ar: '' }), ar: val } }
                }));
              }}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-sm text-white"
            />
          </div>
        </div>

        {/* Tagline (3 Languages) */}
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1.5 uppercase tracking-wider">
            Tagline Subheading (English, বাংলা, العربية)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Tagline (English)"
              value={hero.tagline?.en || ''}
              onChange={(e) => {
                const val = e.target.value;
                updateDraft(prev => ({
                  ...prev,
                  hero: { ...prev.hero, tagline: { ...(prev.hero.tagline || { en: '', bn: '', ar: '' }), en: val } }
                }));
              }}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
            />
            <input
              type="text"
              placeholder="ট্যাগলাইন (বাংলা)"
              value={hero.tagline?.bn || ''}
              onChange={(e) => {
                const val = e.target.value;
                updateDraft(prev => ({
                  ...prev,
                  hero: { ...prev.hero, tagline: { ...(prev.hero.tagline || { en: '', bn: '', ar: '' }), bn: val } }
                }));
              }}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
            />
            <input
              type="text"
              dir="rtl"
              placeholder="الشعار (العربية)"
              value={hero.tagline?.ar || ''}
              onChange={(e) => {
                const val = e.target.value;
                updateDraft(prev => ({
                  ...prev,
                  hero: { ...prev.hero, tagline: { ...(prev.hero.tagline || { en: '', bn: '', ar: '' }), ar: val } }
                }));
              }}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
            />
          </div>
        </div>

        {/* Portrait Upload & Floating Verified Label */}
        <div className="space-y-4 pt-4 border-t border-white/[0.06]">
          <ImageUploaderField
            label="Hero Portrait Photo (Verified Authentic Image)"
            value={hero.avatarUrl}
            onChange={(val) => updateDraft(prev => ({
              ...prev,
              hero: { ...prev.hero, avatarUrl: val }
            }))}
            defaultFallback="/assets/jabir_profile.png"
            helperText="Upload image file or paste direct image link (Postimages Direct Link, Drive, Firebase)."
          />
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => updateDraft(prev => ({
                ...prev,
                about: { ...prev.about, avatarUrl: prev.hero.avatarUrl }
              }))}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.08] text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5 text-[#E4583B]" />
              <span>Also use this photo for About section</span>
            </button>
          </div>

          {/* Floating Badge on Portrait */}
          <div className="p-4 rounded-xl bg-[#171A21] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-300 uppercase tracking-wider flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#E4583B]" />
                <span>Verified Floating Badge (on Portrait)</span>
              </span>

              <label className="flex items-center space-x-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={hero.showFloatingBadge !== false}
                  onChange={(e) => {
                    const val = e.target.checked;
                    updateDraft(prev => ({
                      ...prev,
                      hero: { ...prev.hero, showFloatingBadge: val }
                    }));
                  }}
                  className="rounded border-white/15 bg-[#0B0C0F] text-[#E4583B] focus:ring-0"
                />
                <span className={hero.showFloatingBadge !== false ? 'text-emerald-400 font-medium' : 'text-neutral-500'}>
                  {hero.showFloatingBadge !== false ? 'Visible' : 'Hidden'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Badge Text (English)"
                value={hero.floatingBadgeText?.en || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateDraft(prev => ({
                    ...prev,
                    hero: { ...prev.hero, floatingBadgeText: { ...(prev.hero.floatingBadgeText || { en: '', bn: '', ar: '' }), en: val } }
                  }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
              />
              <input
                type="text"
                placeholder="বাংলা"
                value={hero.floatingBadgeText?.bn || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateDraft(prev => ({
                    ...prev,
                    hero: { ...prev.hero, floatingBadgeText: { ...(prev.hero.floatingBadgeText || { en: '', bn: '', ar: '' }), bn: val } }
                  }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
              />
              <input
                type="text"
                dir="rtl"
                placeholder="العربية"
                value={hero.floatingBadgeText?.ar || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateDraft(prev => ({
                    ...prev,
                    hero: { ...prev.hero, floatingBadgeText: { ...(prev.hero.floatingBadgeText || { en: '', bn: '', ar: '' }), ar: val } }
                  }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hero Action Buttons */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse pb-4 border-b border-white/[0.06]">
          <div className="w-9 h-9 rounded-lg bg-[#171A21] border border-white/[0.08] flex items-center justify-center text-[#E4583B]">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">Hero Action Buttons</h3>
            <p className="text-xs text-neutral-400">
              Configure button labels in 3 languages, destination links, and visibility
            </p>
          </div>
        </div>

        {/* Primary CTA (View My Work) */}
        <div className="p-4 rounded-xl bg-[#171A21] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#E4583B] uppercase tracking-wider">
              Primary Button (Brand Accent)
            </span>

            <label className="flex items-center space-x-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={hero.showCtaWork !== false}
                onChange={(e) => {
                  const val = e.target.checked;
                  updateDraft(prev => ({
                    ...prev,
                    hero: { ...prev.hero, showCtaWork: val }
                  }));
                }}
                className="rounded border-white/15 bg-[#0B0C0F] text-[#E4583B] focus:ring-0"
              />
              <span className={hero.showCtaWork !== false ? 'text-emerald-400 font-medium' : 'text-neutral-500'}>
                {hero.showCtaWork !== false ? 'Visible' : 'Hidden'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">Button Label (English)</label>
              <input
                type="text"
                value={hero.ctaWork?.en || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateDraft(prev => ({
                    ...prev,
                    hero: { ...prev.hero, ctaWork: { ...(prev.hero.ctaWork || { en: '', bn: '', ar: '' }), en: val } }
                  }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">বাটন লেবেল (বাংলা)</label>
              <input
                type="text"
                value={hero.ctaWork?.bn || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateDraft(prev => ({
                    ...prev,
                    hero: { ...prev.hero, ctaWork: { ...(prev.hero.ctaWork || { en: '', bn: '', ar: '' }), bn: val } }
                  }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">عنوان الزر (العربية)</label>
              <input
                type="text"
                dir="rtl"
                value={hero.ctaWork?.ar || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateDraft(prev => ({
                    ...prev,
                    hero: { ...prev.hero, ctaWork: { ...(prev.hero.ctaWork || { en: '', bn: '', ar: '' }), ar: val } }
                  }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1 flex items-center space-x-1.5">
              <LinkIcon className="w-3 h-3 text-[#E4583B]" />
              <span>Target Link / Section Anchor</span>
            </label>
            <input
              type="text"
              placeholder="#projects or https://..."
              value={hero.ctaWorkUrl || '#projects'}
              onChange={(e) => {
                const val = e.target.value;
                updateDraft(prev => ({
                  ...prev,
                  hero: { ...prev.hero, ctaWorkUrl: val }
                }));
              }}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white font-mono"
            />
          </div>
        </div>

        {/* Secondary CTA (Let's Work Together) */}
        <div className="p-4 rounded-xl bg-[#171A21] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-300 uppercase tracking-wider">
              Secondary Button (Bordered Surface)
            </span>

            <label className="flex items-center space-x-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={hero.showCtaContact !== false}
                onChange={(e) => {
                  const val = e.target.checked;
                  updateDraft(prev => ({
                    ...prev,
                    hero: { ...prev.hero, showCtaContact: val }
                  }));
                }}
                className="rounded border-white/15 bg-[#0B0C0F] text-[#E4583B] focus:ring-0"
              />
              <span className={hero.showCtaContact !== false ? 'text-emerald-400 font-medium' : 'text-neutral-500'}>
                {hero.showCtaContact !== false ? 'Visible' : 'Hidden'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">Button Label (English)</label>
              <input
                type="text"
                value={hero.ctaContact?.en || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateDraft(prev => ({
                    ...prev,
                    hero: { ...prev.hero, ctaContact: { ...(prev.hero.ctaContact || { en: '', bn: '', ar: '' }), en: val } }
                  }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">বাটন লেবেল (বাংলা)</label>
              <input
                type="text"
                value={hero.ctaContact?.bn || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateDraft(prev => ({
                    ...prev,
                    hero: { ...prev.hero, ctaContact: { ...(prev.hero.ctaContact || { en: '', bn: '', ar: '' }), bn: val } }
                  }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">عنوان الزر (العربية)</label>
              <input
                type="text"
                dir="rtl"
                value={hero.ctaContact?.ar || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateDraft(prev => ({
                    ...prev,
                    hero: { ...prev.hero, ctaContact: { ...(prev.hero.ctaContact || { en: '', bn: '', ar: '' }), ar: val } }
                  }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1 flex items-center space-x-1.5">
              <LinkIcon className="w-3 h-3 text-[#E4583B]" />
              <span>Target Link / Section Anchor</span>
            </label>
            <input
              type="text"
              placeholder="#advice or https://..."
              value={hero.ctaContactUrl || '#advice'}
              onChange={(e) => {
                const val = e.target.value;
                updateDraft(prev => ({
                  ...prev,
                  hero: { ...prev.hero, ctaContactUrl: val }
                }));
              }}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* 3. Hero Counters & Stats */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-9 h-9 rounded-lg bg-[#171A21] border border-white/[0.08] flex items-center justify-center text-[#E4583B]">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">Hero Counters & Stats</h3>
              <p className="text-xs text-neutral-400">
                Highlight completed projects, client satisfaction, or custom creative stats
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={Boolean(hero.showCounters)}
                onChange={(e) => {
                  const val = e.target.checked;
                  updateDraft(prev => ({
                    ...prev,
                    hero: { ...prev.hero, showCounters: val }
                  }));
                }}
                className="rounded border-white/15 bg-[#0B0C0F] text-[#E4583B] focus:ring-0"
              />
              <span className={hero.showCounters ? 'text-emerald-400 font-medium' : 'text-neutral-500'}>
                {hero.showCounters ? 'Counters Enabled' : 'Disabled'}
              </span>
            </label>

            <button
              type="button"
              onClick={handleAddCounter}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#E4583B] hover:bg-[#D0492D] text-xs font-medium text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Counter</span>
            </button>
          </div>
        </div>

        {counters.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[#171A21] border border-dashed border-white/[0.09] text-neutral-400 text-xs">
            No counters configured. Click &quot;Add Counter&quot; above to create one.
          </div>
        ) : (
          <div className="space-y-4">
            {counters.map((c, idx) => (
              <div key={c.id || idx} className="p-4 rounded-xl bg-[#171A21] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#E4583B] tabular-nums">
                    Counter #{idx + 1}
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveCounter(idx, 'up')}
                      className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-[#1E222B] transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === counters.length - 1}
                      onClick={() => handleMoveCounter(idx, 'down')}
                      className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-[#1E222B] transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ id: c.id, label: c.label?.en || c.value })}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors ml-1"
                      title="Delete Counter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Display Value (e.g. 50+)
                    </label>
                    <input
                      type="text"
                      value={c.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleUpdateCounter(c.id, current => ({ ...current, value: val }));
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs font-semibold text-[#E4583B] tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Label (English)
                    </label>
                    <input
                      type="text"
                      value={c.label?.en || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleUpdateCounter(c.id, current => ({
                          ...current,
                          label: { ...(current.label || { en: '', bn: '', ar: '' }), en: val }
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Label (বাংলা)
                    </label>
                    <input
                      type="text"
                      value={c.label?.bn || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleUpdateCounter(c.id, current => ({
                          ...current,
                          label: { ...(current.label || { en: '', bn: '', ar: '' }), bn: val }
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Label (العربية)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={c.label?.ar || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleUpdateCounter(c.id, current => ({
                          ...current,
                          label: { ...(current.label || { en: '', bn: '', ar: '' }), ar: val }
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        title="Delete Counter Metric?"
        itemName={deleteTarget?.label}
        message="Are you sure you want to delete this stat counter from your hero section? It will be removed from your draft portfolio. Changes take effect on the live website when you click Publish."
        onConfirm={() => {
          if (deleteTarget) {
            handleRemoveCounter(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
