import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Video,
  Palette,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { CaseStudyCategory, CaseStudyItem } from '../../types/portfolio';
import { ImageUploaderField } from './ImageUploaderField';
import { detectVideoType } from '../../lib/videoUtils';

interface CaseStudiesEditorProps {
  onNotify?: (msg: string, type?: 'success' | 'error') => void;
}

export const CaseStudiesEditor: React.FC<CaseStudiesEditorProps> = ({ onNotify }) => {
  const { draftPortfolio, updateDraft } = usePortfolio();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const section = draftPortfolio.caseStudiesSection || {
    tag: { en: 'Selected Case Studies', bn: 'নির্বাচিত কেস স্টাডি', ar: 'دراسات حالة مختارة' },
    titlePrefix: { en: 'Work That Delivers', bn: 'প্রজেক্ট ও ফলাফল', ar: 'أعمال تحقق' },
    titleItalic: { en: 'real results.', bn: 'কেস স্টাডি', ar: 'نتائج حقيقية.' },
    visible: true
  };

  const items = [...(draftPortfolio.caseStudies || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  const updateSection = (patch: Partial<typeof section>) => {
    updateDraft((prev) => ({
      ...prev,
      caseStudiesSection: {
        ...section,
        ...patch
      }
    }));
  };

  const handleAddCaseStudy = (category: CaseStudyCategory) => {
    const newItem: CaseStudyItem = {
      id: `cs-${category}-${Date.now()}`,
      category,
      categoryLabel:
        category === 'video'
          ? { en: 'Video Editing', bn: 'ভিডিও এডিটিং', ar: 'مونتاج الفيديو' }
          : category === 'motion'
          ? { en: 'Motion Graphics', bn: 'মোশন গ্রাফিক্স', ar: 'موشن جرافيك' }
          : { en: 'Graphic Design', bn: 'গ্রাফিক ডিজাইন', ar: 'التصميم الجرافيكي' },
      title: {
        en:
          category === 'video'
            ? 'New Video Editing Case Study'
            : category === 'motion'
            ? 'New Motion Graphics Project'
            : 'New Graphic Design Case Study',
        bn:
          category === 'video'
            ? 'নতুন ভিডিও এডিটিং কেস স্টাডি'
            : category === 'motion'
            ? 'নতুন মোশন গ্রাফিক্স প্রজেক্ট'
            : 'নতুন গ্রাফিক ডিজাইন কেস স্টাডি',
        ar: 'مشروع جديد'
      },
      thumbnail: '/assets/jaber_hero.png',
      problem: {
        en: 'Describe the client challenge or low retention / weak branding problem...',
        bn: 'ক্লায়েন্টের মূল সমস্যা বা চ্যালেঞ্জ এখানে লিখুন...',
        ar: ''
      },
      process: {
        en: 'Describe your editing / motion / design workflow & tools...',
        bn: 'আপনি কীভাবে কাজ করেছেন (সফটওয়্যার ও প্রক্রিয়া)...',
        ar: ''
      },
      result: {
        en: 'Share measurable outcome or engagement impact...',
        bn: 'কাজের চূড়ান্ত ফলাফল বা ইমপ্যাক্ট লিখুন...',
        ar: ''
      },
      videoType: category === 'graphic' ? undefined : 'youtube',
      videoUrl: category === 'graphic' ? '' : '',
      behanceUrl: category === 'graphic' ? 'https://www.behance.net/jaberhosain' : '',
      visible: true,
      order: items.length + 1
    };

    updateDraft((prev) => ({
      ...prev,
      caseStudies: [...(prev.caseStudies || []), newItem]
    }));
    onNotify?.(`Added new ${category} case study!`);
  };

  const updateItem = (id: string, updater: (item: CaseStudyItem) => CaseStudyItem) => {
    updateDraft((prev) => ({
      ...prev,
      caseStudies: (prev.caseStudies || []).map((cs) => (cs.id === id ? updater(cs) : cs))
    }));
  };

  const moveItem = (index: number, delta: -1 | 1) => {
    const targetIdx = index + delta;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const reordered = [...items];
    const [picked] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, picked);
    updateDraft((prev) => ({
      ...prev,
      caseStudies: reordered.map((cs, i) => ({ ...cs, order: i + 1 }))
    }));
  };

  const removeItem = (id: string) => {
    updateDraft((prev) => ({
      ...prev,
      caseStudies: (prev.caseStudies || []).filter((cs) => cs.id !== id)
    }));
    setConfirmDeleteId(null);
    onNotify?.('Case study deleted from draft');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="text-lg font-semibold text-[#F4F0E8]">
            Home Case Studies (&ldquo;Work That Delivers Real Results&rdquo;)
          </h2>
          <p className="text-xs text-[#8E8A82] mt-0.5">
            হোম পেজের প্রতিটি কেস স্টাডি কার্ড এডিট করুন — ভিডিও এডিটিং, মোশন গ্রাফিক্স নাকি গ্রাফিক ডিজাইন তা নির্ধারণ করুন।
          </p>
        </div>

        <label className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl bg-[#171A21] border border-white/[0.08] text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={section.visible !== false}
            onChange={(e) => updateSection({ visible: e.target.checked })}
            className="accent-[#E4583B]"
          />
          <span>Show Section on Home</span>
        </label>
      </div>

      {/* Section Title Editor */}
      <div className="p-5 rounded-2xl bg-[#171A21] border border-white/[0.08] space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#E4583B]">
          Section Heading &amp; Tag
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-[#8E8A82] mb-1">Eyebrow Tag (EN)</label>
            <input
              type="text"
              value={section.tag?.en || ''}
              onChange={(e) =>
                updateSection({ tag: { ...(section.tag || { en: '', bn: '', ar: '' }), en: e.target.value } })
              }
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8]"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#8E8A82] mb-1">Eyebrow Tag (বাংলা)</label>
            <input
              type="text"
              value={section.tag?.bn || ''}
              onChange={(e) =>
                updateSection({ tag: { ...(section.tag || { en: '', bn: '', ar: '' }), bn: e.target.value } })
              }
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8]"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#8E8A82] mb-1">Main Title (EN)</label>
            <input
              type="text"
              value={section.titlePrefix?.en || ''}
              onChange={(e) =>
                updateSection({
                  titlePrefix: { ...(section.titlePrefix || { en: '', bn: '', ar: '' }), en: e.target.value }
                })
              }
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8]"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#8E8A82] mb-1">Italic Accent Word (EN)</label>
            <input
              type="text"
              value={section.titleItalic?.en || ''}
              onChange={(e) =>
                updateSection({
                  titleItalic: { ...(section.titleItalic || { en: '', bn: '', ar: '' }), en: e.target.value }
                })
              }
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8]"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#8E8A82] mb-1">Main Title (বাংলা)</label>
            <input
              type="text"
              value={section.titlePrefix?.bn || ''}
              onChange={(e) =>
                updateSection({
                  titlePrefix: { ...(section.titlePrefix || { en: '', bn: '', ar: '' }), bn: e.target.value }
                })
              }
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8]"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#8E8A82] mb-1">Italic Accent Word (বাংলা)</label>
            <input
              type="text"
              value={section.titleItalic?.bn || ''}
              onChange={(e) =>
                updateSection({
                  titleItalic: { ...(section.titleItalic || { en: '', bn: '', ar: '' }), bn: e.target.value }
                })
              }
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8]"
            />
          </div>
        </div>
      </div>

      {/* Add Buttons by Discipline */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => handleAddCaseStudy('video')}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#E4583B] hover:bg-[#D0492D] text-white text-xs font-semibold cursor-pointer"
        >
          <Video className="w-3.5 h-3.5" />
          <span>+ Video Editing Case</span>
        </button>
        <button
          type="button"
          onClick={() => handleAddCaseStudy('motion')}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.1] text-[#F4F0E8] text-xs font-semibold cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E4583B]" />
          <span>+ Motion Graphics Case</span>
        </button>
        <button
          type="button"
          onClick={() => handleAddCaseStudy('graphic')}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.1] text-[#F4F0E8] text-xs font-semibold cursor-pointer"
        >
          <Palette className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>+ Graphic Design Case</span>
        </button>
      </div>

      {/* Case Studies Cards List */}
      <div className="space-y-5">
        {items.map((cs, idx) => {
          const isVideoOrMotion = cs.category === 'video' || cs.category === 'motion';
          return (
            <div
              key={cs.id}
              className={`p-5 rounded-2xl border space-y-4 ${
                cs.visible === false
                  ? 'bg-[#121419]/60 border-white/[0.05] opacity-65'
                  : 'bg-[#171A21] border-white/[0.08]'
              }`}
            >
              {/* Card Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.07]">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className="px-2.5 py-1 rounded-lg bg-[#E4583B]/15 text-[#F07C63] text-[11px] font-bold">
                    #{idx + 1}
                  </span>
                  <span className="text-sm font-semibold text-[#F4F0E8] truncate">
                    {cs.title?.en || 'Untitled Case Study'}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, -1)}
                    className="p-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-[#A7A298] hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === items.length - 1}
                    onClick={() => moveItem(idx, 1)}
                    className="p-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-[#A7A298] hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateItem(cs.id, (prev) => ({
                        ...prev,
                        visible: prev.visible === false ? true : false
                      }))
                    }
                    className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                      cs.visible === false
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    }`}
                    title={cs.visible === false ? 'Hidden — Click to Show' : 'Visible — Click to Hide'}
                  >
                    {cs.visible === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>

                  {confirmDeleteId === cs.id ? (
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => removeItem(cs.id)}
                        className="px-2 py-1 rounded bg-rose-600 text-white text-[11px] font-semibold cursor-pointer"
                      >
                        Confirm Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 rounded bg-[#0B0C0F] text-[#A7A298] text-[11px] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(cs.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/15 cursor-pointer"
                      title="Delete Case Study"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Discipline Selection + Custom Badge Label */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#A7A298] mb-1">
                    Work Discipline (ভিডিও / মোশন / গ্রাফিক্স)
                  </label>
                  <select
                    value={cs.category}
                    onChange={(e) => {
                      const nextCat = e.target.value as CaseStudyCategory;
                      updateItem(cs.id, (prev) => ({
                        ...prev,
                        category: nextCat,
                        categoryLabel:
                          nextCat === 'video'
                            ? { en: 'Video Editing', bn: 'ভিডিও এডিটিং', ar: 'مونتاج الفيديو' }
                            : nextCat === 'motion'
                            ? { en: 'Motion Graphics', bn: 'মোশন গ্রাফিক্স', ar: 'موشن جرافيك' }
                            : { en: 'Graphic Design', bn: 'গ্রাফিক ডিজাইন', ar: 'التصميم الجرافيكي' }
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-[#E4583B]/40 text-xs font-semibold text-[#F4F0E8]"
                  >
                    <option value="video">Video Editing</option>
                    <option value="motion">Motion Graphics</option>
                    <option value="graphic">Graphic Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#8E8A82] mb-1">
                    Badge Text (EN)
                  </label>
                  <input
                    type="text"
                    value={cs.categoryLabel?.en || ''}
                    onChange={(e) =>
                      updateItem(cs.id, (prev) => ({
                        ...prev,
                        categoryLabel: {
                          ...(prev.categoryLabel || { en: '', bn: '', ar: '' }),
                          en: e.target.value
                        }
                      }))
                    }
                    placeholder="e.g. Video Editing"
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#8E8A82] mb-1">
                    Badge Text (বাংলা)
                  </label>
                  <input
                    type="text"
                    value={cs.categoryLabel?.bn || ''}
                    onChange={(e) =>
                      updateItem(cs.id, (prev) => ({
                        ...prev,
                        categoryLabel: {
                          ...(prev.categoryLabel || { en: '', bn: '', ar: '' }),
                          bn: e.target.value
                        }
                      }))
                    }
                    placeholder="ভিডিও এডিটিং"
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8]"
                  />
                </div>
              </div>

              {/* Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#8E8A82] mb-1">Title (English)</label>
                  <input
                    type="text"
                    value={cs.title?.en || ''}
                    onChange={(e) =>
                      updateItem(cs.id, (prev) => ({
                        ...prev,
                        title: { ...(prev.title || { en: '', bn: '', ar: '' }), en: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8E8A82] mb-1">Title (বাংলা)</label>
                  <input
                    type="text"
                    value={cs.title?.bn || ''}
                    onChange={(e) =>
                      updateItem(cs.id, (prev) => ({
                        ...prev,
                        title: { ...(prev.title || { en: '', bn: '', ar: '' }), bn: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8]"
                  />
                </div>
              </div>

              {/* Thumbnail Image */}
              <ImageUploaderField
                label="Card Cover / Thumbnail Image"
                value={cs.thumbnail || ''}
                onChange={(url) =>
                  updateItem(cs.id, (prev) => ({
                    ...prev,
                    thumbnail: url
                  }))
                }
                defaultFallback="/assets/jaber_hero.png"
              />

              {/* Conditional Link Fields based on Video/Motion vs Graphic */}
              {isVideoOrMotion ? (
                <div className="p-3.5 rounded-xl bg-[#0B0C0F] border border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#E4583B] mb-1">Video Platform</label>
                    <select
                      value={cs.videoType || 'youtube'}
                      onChange={(e) =>
                        updateItem(cs.id, (prev) => ({
                          ...prev,
                          videoType: e.target.value as any
                        }))
                      }
                      className="w-full px-2.5 py-2 rounded-lg bg-[#121419] border border-white/[0.08] text-xs text-[#F4F0E8]"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="vimeo">Vimeo</option>
                      <option value="facebook">Facebook</option>
                      <option value="direct">Direct MP4</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-[#8E8A82] mb-1">
                      Video / YouTube / Facebook URL
                    </label>
                    <input
                      type="url"
                      value={cs.videoUrl || ''}
                      onChange={(e) => {
                        const url = e.target.value;
                        updateItem(cs.id, (prev) => ({
                          ...prev,
                          videoUrl: url,
                          videoType: url ? detectVideoType(url) : prev.videoType
                        }));
                      }}
                      placeholder="https://www.youtube.com/watch?v=... or Facebook video URL"
                      className="w-full px-3 py-2 rounded-lg bg-[#121419] border border-white/[0.08] text-xs font-mono text-[#F4F0E8]"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#0B0C0F] border border-white/[0.08] space-y-2">
                  <label className="block text-[11px] text-[#38BDF8] font-medium">
                    Behance Project URL (Graphic Design Link)
                  </label>
                  <input
                    type="url"
                    value={cs.behanceUrl || ''}
                    onChange={(e) =>
                      updateItem(cs.id, (prev) => ({
                        ...prev,
                        behanceUrl: e.target.value
                      }))
                    }
                    placeholder="https://www.behance.net/gallery/..."
                    className="w-full px-3 py-2 rounded-lg bg-[#121419] border border-white/[0.08] text-xs font-mono text-[#F4F0E8]"
                  />
                </div>
              )}

              {/* Problem / My Process / Result (Bilingual EN & BN) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-[#E4583B]">Problem (EN)</label>
                  <textarea
                    rows={2}
                    value={cs.problem?.en || ''}
                    onChange={(e) =>
                      updateItem(cs.id, (prev) => ({
                        ...prev,
                        problem: { ...(prev.problem || { en: '', bn: '', ar: '' }), en: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] resize-none"
                  />
                  <label className="block text-[11px] font-semibold text-[#E4583B]">সমস্যা (বাংলা)</label>
                  <textarea
                    rows={2}
                    value={cs.problem?.bn || ''}
                    onChange={(e) =>
                      updateItem(cs.id, (prev) => ({
                        ...prev,
                        problem: { ...(prev.problem || { en: '', bn: '', ar: '' }), bn: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-[#EAE5DC]">My Process (EN)</label>
                  <textarea
                    rows={2}
                    value={cs.process?.en || ''}
                    onChange={(e) =>
                      updateItem(cs.id, (prev) => ({
                        ...prev,
                        process: { ...(prev.process || { en: '', bn: '', ar: '' }), en: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] resize-none"
                  />
                  <label className="block text-[11px] font-semibold text-[#EAE5DC]">প্রক্রিয়া (বাংলা)</label>
                  <textarea
                    rows={2}
                    value={cs.process?.bn || ''}
                    onChange={(e) =>
                      updateItem(cs.id, (prev) => ({
                        ...prev,
                        process: { ...(prev.process || { en: '', bn: '', ar: '' }), bn: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-400 mb-1">Result (EN)</label>
                  <textarea
                    rows={2}
                    value={cs.result?.en || ''}
                    onChange={(e) =>
                      updateItem(cs.id, (prev) => ({
                        ...prev,
                        result: { ...(prev.result || { en: '', bn: '', ar: '' }), en: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-400 mb-1">ফলাফল (বাংলা)</label>
                  <textarea
                    rows={2}
                    value={cs.result?.bn || ''}
                    onChange={(e) =>
                      updateItem(cs.id, (prev) => ({
                        ...prev,
                        result: { ...(prev.result || { en: '', bn: '', ar: '' }), bn: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] resize-none"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 rounded-xl bg-emerald-950/25 border border-emerald-500/25 text-xs text-emerald-300 flex items-center space-x-2">
        <CheckCircle className="w-4 h-4 shrink-0" />
        <span>সব পরিবর্তন ড্রাফটে সেভ হয়। লাইভ সাইটে পাঠাতে উপরে &ldquo;Publish Live&rdquo; বাটনে ক্লিক করুন।</span>
      </div>
    </div>
  );
};
