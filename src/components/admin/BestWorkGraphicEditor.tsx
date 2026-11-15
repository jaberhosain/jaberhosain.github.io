import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  Layers,
  Loader2,
  Wand2
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { BestWorkGraphicItem, BestWorkSectionConfig } from '../../types/portfolio';
import { ImageUploaderField } from './ImageUploaderField';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { resolveBehanceProjectFromUrl } from '../../lib/imageUrlResolver';

interface BestWorkGraphicEditorProps {
  onNotify?: (msg: string, type?: 'success' | 'error') => void;
}

export const BestWorkGraphicEditor: React.FC<BestWorkGraphicEditorProps> = ({ onNotify }) => {
  const { draftPortfolio, updateDraft } = usePortfolio();
  const items = draftPortfolio.bestGraphicWorks || [];
  const sectionConfig: BestWorkSectionConfig = draftPortfolio.bestGraphicSection || {
    sectionTag: { en: 'TOP GRAPHIC DESIGN', bn: 'সেরা গ্রাফিক্স ডিজাইন', ar: 'أفضل تصاميم الجرافيك' },
    title: { en: 'GRAPHIC DESIGN - BEST WORK', bn: 'গ্রাফিক ডিজাইন - সেরা কাজ', ar: 'التصميم الجرافيكي - أفضل الأعمال' },
    subtitle: {
      en: 'Curated selection of my top graphic design projects, brand visuals, and creative posters.',
      bn: 'আমার নির্বাচিত সেরা গ্রাফিক্স ডিজাইন প্রজেক্ট, ব্র্যান্ড ভিজ্যুয়াল ও পোস্টার।',
      ar: 'مجموعة مختارة من أفضل تصاميم الجرافيك والهويات البصرية والبوسترات الإبداعية.'
    }
  };

  const [extractingId, setExtractingId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
  }>({
    isOpen: false,
    id: '',
    name: ''
  });

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    if (onNotify) onNotify(msg, type);
  };

  const updateSectionField = (
    field: 'sectionTag' | 'title' | 'subtitle',
    lang: 'en' | 'bn' | 'ar',
    val: string
  ) => {
    updateDraft((prev) => ({
      ...prev,
      bestGraphicSection: {
        ...(prev.bestGraphicSection || sectionConfig),
        [field]: {
          ...((prev.bestGraphicSection?.[field] || sectionConfig[field]) as any),
          [lang]: val
        }
      }
    }));
  };

  const handleAddItem = () => {
    const newItem: BestWorkGraphicItem = {
      id: 'best-graphic-' + Date.now(),
      title: { en: 'Top Graphic Artwork', bn: 'সেরা গ্রাফিক্স ডিজাইন', ar: 'عمل جرافيك مميز' },
      imageUrl: '',
      behanceUrl: 'https://www.behance.net/jaberhosain',
      order: items.length + 1,
      visible: true
    };
    updateDraft((prev) => ({
      ...prev,
      bestGraphicWorks: [...(prev.bestGraphicWorks || []), newItem]
    }));
    notify('New Best Work item added');
  };

  const handleMove = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= items.length) return;
    const nextList = [...items];
    const [moved] = nextList.splice(fromIdx, 1);
    nextList.splice(toIdx, 0, moved);
    updateDraft((prev) => ({
      ...prev,
      bestGraphicWorks: nextList.map((item, i) => ({ ...item, order: i + 1 }))
    }));
  };

  const handleToggleVisible = (idx: number) => {
    updateDraft((prev) => ({
      ...prev,
      bestGraphicWorks: (prev.bestGraphicWorks || []).map((item, i) =>
        i === idx ? { ...item, visible: item.visible === false ? true : false } : item
      )
    }));
    notify('Visibility updated');
  };

  const handleConfirmDelete = () => {
    updateDraft((prev) => ({
      ...prev,
      bestGraphicWorks: (prev.bestGraphicWorks || []).filter((item) => item.id !== deleteModal.id)
    }));
    setDeleteModal({ isOpen: false, id: '', name: '' });
    notify('Item removed from Best Work');
  };

  const handleExtractFromBehance = async (item: BestWorkGraphicItem, idx: number) => {
    const url = (item.behanceUrl || '').trim();
    if (!url || !url.toLowerCase().includes('behance.net')) {
      notify('Please paste a valid Behance project link first', 'error');
      return;
    }

    setExtractingId(item.id);
    try {
      const result = await resolveBehanceProjectFromUrl(url);
      if (result.images.length > 0 || result.coverImage) {
        const chosenImage = result.coverImage || result.images[0];
        updateDraft((prev) => ({
          ...prev,
          bestGraphicWorks: (prev.bestGraphicWorks || []).map((w, i) =>
            i === idx
              ? {
                  ...w,
                  imageUrl: chosenImage || w.imageUrl,
                  title:
                    result.title && (!w.title?.en || w.title.en === 'Top Graphic Artwork')
                      ? { ...w.title, en: result.title }
                      : w.title
                }
              : w
          )
        }));
        notify(`Extracted artwork from Behance (${result.images.length || 1} found)`);
      } else {
        notify(
          result.error || 'Could not extract artwork automatically. Please paste a direct image URL or upload a file.',
          'error'
        );
      }
    } catch (err: any) {
      notify(err?.message || 'Failed to fetch Behance project', 'error');
    } finally {
      setExtractingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center space-x-2.5 rtl:space-x-reverse">
            <Sparkles className="w-4 h-4 text-[#E4583B]" />
            <span>Graphic Design — Best Work</span>
            <span className="text-xs text-neutral-400 tabular-nums font-normal">
              ({items.length} works)
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Curate top graphic works shown in the dedicated Best Work block with high-res lightbox and Behance links.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-lg text-xs font-medium text-white bg-[#E4583B] hover:bg-[#D0492D] transition-colors shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Best Work</span>
        </button>
      </div>

      {/* Section Headings in 3 Languages */}
      <div className="p-5 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-4">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Layers className="w-4 h-4 text-[#E4583B]" />
          <h3 className="text-xs font-medium text-white uppercase tracking-wider">
            Public Section Headings & Description (Multilingual)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1">Section Title (EN)</label>
            <input
              type="text"
              value={sectionConfig.title?.en || ''}
              onChange={(e) => updateSectionField('title', 'en', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-white focus:border-[#E4583B] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1">Section Title (BN)</label>
            <input
              type="text"
              value={sectionConfig.title?.bn || ''}
              onChange={(e) => updateSectionField('title', 'bn', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-white focus:border-[#E4583B] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1">Section Title (AR)</label>
            <input
              type="text"
              dir="rtl"
              value={sectionConfig.title?.ar || ''}
              onChange={(e) => updateSectionField('title', 'ar', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-white focus:border-[#E4583B] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1">Subtitle / Description (EN)</label>
            <textarea
              rows={2}
              value={sectionConfig.subtitle?.en || ''}
              onChange={(e) => updateSectionField('subtitle', 'en', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-white focus:border-[#E4583B] focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1">Subtitle / Description (BN)</label>
            <textarea
              rows={2}
              value={sectionConfig.subtitle?.bn || ''}
              onChange={(e) => updateSectionField('subtitle', 'bn', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-white focus:border-[#E4583B] focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1">Subtitle / Description (AR)</label>
            <textarea
              rows={2}
              dir="rtl"
              value={sectionConfig.subtitle?.ar || ''}
              onChange={(e) => updateSectionField('subtitle', 'ar', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-white focus:border-[#E4583B] focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-5">
        {items.map((item, idx) => {
          const isVisible = item.visible !== false;
          const isExtracting = extractingId === item.id;

          return (
            <div
              key={item.id || idx}
              className={`p-5 rounded-2xl bg-[#121419] border transition-colors space-y-4 ${
                isVisible ? 'border-white/[0.08] hover:border-white/[0.14]' : 'border-white/[0.05] opacity-70'
              }`}
            >
              {/* Item Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <span className="w-7 h-7 rounded-lg bg-[#171A21] border border-white/[0.08] flex items-center justify-center text-xs font-semibold text-[#E4583B] tabular-nums">
                    #{idx + 1}
                  </span>
                  <span className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
                    {item.title?.en || 'Untitled Artwork'}
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded border font-medium ${
                      isVisible
                        ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30'
                        : 'bg-[#171A21] text-neutral-500 border-white/[0.08]'
                    }`}
                  >
                    {isVisible ? 'Visible' : 'Hidden'}
                  </span>
                </div>

                {/* Action Controls */}
                <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                  <button
                    type="button"
                    onClick={() => handleToggleVisible(idx)}
                    className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      isVisible
                        ? 'bg-[#171A21] text-neutral-300 hover:text-white border border-white/[0.08]'
                        : 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
                    }`}
                    title={isVisible ? 'Hide from public site' : 'Show on public site'}
                  >
                    {isVisible ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
                    <span className="hidden sm:inline">{isVisible ? 'Visible' : 'Hidden'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMove(idx, idx - 1)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#171A21] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMove(idx, idx + 1)}
                    disabled={idx === items.length - 1}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#171A21] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setDeleteModal({
                        isOpen: true,
                        id: item.id,
                        name: item.title?.en || `Artwork #${idx + 1}`
                      })
                    }
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Multilingual Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Title (EN)</label>
                  <input
                    type="text"
                    value={item.title?.en || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => ({
                        ...prev,
                        bestGraphicWorks: (prev.bestGraphicWorks || []).map((w, i) =>
                          i === idx ? { ...w, title: { ...w.title, en: val } } : w
                        )
                      }));
                    }}
                    placeholder="Poster or Artwork Title"
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-white focus:border-[#E4583B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Title (BN)</label>
                  <input
                    type="text"
                    value={item.title?.bn || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => ({
                        ...prev,
                        bestGraphicWorks: (prev.bestGraphicWorks || []).map((w, i) =>
                          i === idx ? { ...w, title: { ...w.title, bn: val } } : w
                        )
                      }));
                    }}
                    placeholder="পোস্টার বা আর্টওয়ার্কের নাম"
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-white focus:border-[#E4583B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Title (AR)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={item.title?.ar || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => ({
                        ...prev,
                        bestGraphicWorks: (prev.bestGraphicWorks || []).map((w, i) =>
                          i === idx ? { ...w, title: { ...w.title, ar: val } } : w
                        )
                      }));
                    }}
                    placeholder="عنوان العمل الفني"
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-white focus:border-[#E4583B] focus:outline-none"
                  />
                </div>
              </div>

              {/* Optional Behance URL with 1-Click Extract */}
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1 flex items-center space-x-1.5 rtl:space-x-reverse">
                  <span>Behance Project URL (Optional)</span>
                  <ExternalLink className="w-3 h-3 text-[#3B82F6]" />
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={item.behanceUrl || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => ({
                        ...prev,
                        bestGraphicWorks: (prev.bestGraphicWorks || []).map((w, i) =>
                          i === idx ? { ...w, behanceUrl: val } : w
                        )
                      }));
                    }}
                    placeholder="https://www.behance.net/gallery/..."
                    className="flex-1 px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-white font-mono focus:border-[#E4583B] focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={isExtracting || !item.behanceUrl}
                    onClick={() => handleExtractFromBehance(item, idx)}
                    className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.08] text-xs font-medium text-neutral-200 disabled:opacity-40 transition-colors shrink-0"
                  >
                    {isExtracting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E4583B]" />
                    ) : (
                      <Wand2 className="w-3.5 h-3.5 text-[#E4583B]" />
                    )}
                    <span>{isExtracting ? 'Extracting...' : 'Extract Artwork'}</span>
                  </button>
                </div>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Clicking the artwork on the public site opens the high-res lightbox with a direct &quot;View on Behance&quot; button.
                </span>
              </div>

              {/* Image Upload */}
              <ImageUploaderField
                label="Artwork Image (High Resolution)"
                value={item.imageUrl || ''}
                onChange={(downloadUrl) => {
                  updateDraft((prev) => ({
                    ...prev,
                    bestGraphicWorks: (prev.bestGraphicWorks || []).map((w, i) =>
                      i === idx ? { ...w, imageUrl: downloadUrl } : w
                    )
                  }));
                }}
                defaultFallback=""
                helperText="Upload from device OR paste a Behance project / direct image URL."
              />
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-[#121419] border border-dashed border-white/[0.09] text-neutral-400 space-y-3">
            <p className="text-xs">No graphic best works added yet.</p>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-[#E4583B] hover:bg-[#D0492D] transition-colors inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Best Work</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="Delete Best Work Item?"
        itemName={deleteModal.name}
        message="Are you sure you want to delete this top graphic work? It will be removed from your draft portfolio. Changes will take effect on the live website when you click Publish."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
      />
    </div>
  );
};
