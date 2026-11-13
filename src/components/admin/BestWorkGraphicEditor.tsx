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
  Layers
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { BestWorkGraphicItem, BestWorkSectionConfig } from '../../types/portfolio';
import { ImageUploaderField } from './ImageUploaderField';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

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
      imageUrl: '/assets/jabir_profile.png',
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

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232B33]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2 rtl:space-x-reverse">
            <Sparkles className="w-5 h-5 text-[#FF5722]" />
            <span>Graphic Design - Best Work</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#FF5722]/15 text-[#FF5722] border border-[#FF5722]/30">
              {items.length} Works
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Curate top graphic works shown in the dedicated Best Work block with high-res lightbox and Behance links.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF5722] hover:bg-[#F4511E] shadow-lg shadow-orange-900/30 transition-all shrink-0 self-start sm:self-auto min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Best Work</span>
        </button>
      </div>

      {/* Section Headings in 3 Languages */}
      <div className="p-5 rounded-3xl bg-[#141A20] border border-[#232B33] space-y-4 shadow-lg">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Layers className="w-4 h-4 text-[#FF5722]" />
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Public Section Headings & Description (Multilingual)
          </h3>
        </div>

        {/* Section Title */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-neutral-400 mb-1">Section Title (EN)</label>
            <input
              type="text"
              value={sectionConfig.title?.en || ''}
              onChange={(e) => updateSectionField('title', 'en', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] text-xs text-white font-mono focus:border-[#FF5722] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-neutral-400 mb-1">Section Title (BN)</label>
            <input
              type="text"
              value={sectionConfig.title?.bn || ''}
              onChange={(e) => updateSectionField('title', 'bn', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] text-xs text-white font-mono focus:border-[#FF5722] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-neutral-400 mb-1">Section Title (AR)</label>
            <input
              type="text"
              value={sectionConfig.title?.ar || ''}
              onChange={(e) => updateSectionField('title', 'ar', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] text-xs text-white font-mono focus:border-[#FF5722] focus:outline-none"
            />
          </div>
        </div>

        {/* Section Subtitle */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-neutral-400 mb-1">Subtitle / Description (EN)</label>
            <textarea
              rows={2}
              value={sectionConfig.subtitle?.en || ''}
              onChange={(e) => updateSectionField('subtitle', 'en', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] text-xs text-white font-mono focus:border-[#FF5722] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-neutral-400 mb-1">Subtitle / Description (BN)</label>
            <textarea
              rows={2}
              value={sectionConfig.subtitle?.bn || ''}
              onChange={(e) => updateSectionField('subtitle', 'bn', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] text-xs text-white font-mono focus:border-[#FF5722] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-neutral-400 mb-1">Subtitle / Description (AR)</label>
            <textarea
              rows={2}
              value={sectionConfig.subtitle?.ar || ''}
              onChange={(e) => updateSectionField('subtitle', 'ar', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] text-xs text-white font-mono focus:border-[#FF5722] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-6">
        {items.map((item, idx) => {
          const isVisible = item.visible !== false;
          return (
            <div
              key={item.id || idx}
              className={`p-5 sm:p-6 rounded-3xl bg-[#141A20] border transition-all space-y-4 shadow-xl ${
                isVisible ? 'border-[#232B33] hover:border-neutral-700' : 'border-neutral-800 opacity-70'
              }`}
            >
              {/* Item Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#232B33]">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <span className="w-7 h-7 rounded-full bg-[#181E24] border border-[#232B33] flex items-center justify-center text-xs font-mono font-bold text-[#FF5722]">
                    #{idx + 1}
                  </span>
                  <span className="text-sm font-bold text-white font-mono truncate max-w-[200px] sm:max-w-xs">
                    {item.title?.en || 'Untitled Artwork'}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      isVisible
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                        : 'bg-neutral-900 text-neutral-500 border-neutral-700'
                    }`}
                  >
                    {isVisible ? 'Visible' : 'Hidden'}
                  </span>
                </div>

                {/* Action Controls: Show/Hide, Up, Down, Delete */}
                <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                  {/* Show/Hide Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleVisible(idx)}
                    className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                      isVisible
                        ? 'bg-[#181E24] text-neutral-300 hover:text-white border border-[#232B33]'
                        : 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
                    }`}
                    title={isVisible ? 'Hide from public site' : 'Show on public site'}
                  >
                    {isVisible ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
                    <span className="hidden sm:inline">{isVisible ? 'Visible' : 'Hidden'}</span>
                  </button>

                  {/* Reorder Up */}
                  <button
                    type="button"
                    onClick={() => handleMove(idx, idx - 1)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  {/* Reorder Down */}
                  <button
                    type="button"
                    onClick={() => handleMove(idx, idx + 1)}
                    disabled={idx === items.length - 1}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  {/* Delete Item */}
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteModal({
                        isOpen: true,
                        id: item.id,
                        name: item.title?.en || `Artwork #${idx + 1}`
                      })
                    }
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Multilingual Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">Title (EN)</label>
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
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] text-xs text-white font-mono focus:border-[#FF5722] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">Title (BN)</label>
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
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] text-xs text-white font-mono focus:border-[#FF5722] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">Title (AR)</label>
                  <input
                    type="text"
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
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] text-xs text-white font-mono focus:border-[#FF5722] focus:outline-none"
                  />
                </div>
              </div>

              {/* Optional Behance URL */}
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 mb-1 flex items-center space-x-1.5 rtl:space-x-reverse">
                  <span>Behance Project URL (Optional)</span>
                  <ExternalLink className="w-3 h-3 text-[#0057FF]" />
                </label>
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
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] text-xs text-white font-mono focus:border-[#FF5722] focus:outline-none"
                />
                <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                  Clicking the artwork on the public site opens the high-res lightbox with a direct "View on Behance" button.
                </span>
              </div>

              {/* Image Upload using ImageUploaderField (Compresses and stores in Firebase Storage) */}
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
                defaultFallback="/assets/jabir_profile.png"
                helperText="Upload image file from device. It is automatically compressed to 1600px and stored in Firebase Storage."
              />
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="p-8 text-center rounded-3xl bg-[#141A20] border border-[#232B33] text-neutral-400 space-y-2">
            <p className="text-xs font-mono">No graphic best works added yet.</p>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-[#FF5722] bg-[#FF5722]/10 border border-[#FF5722]/30 hover:bg-[#FF5722]/20 transition-all inline-flex items-center space-x-1.5"
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
