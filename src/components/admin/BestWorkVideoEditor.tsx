import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Sparkles,
  Upload,
  Film,
  Layers,
  Youtube,
  Facebook,
  RotateCcw
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { BestWorkVideoItem, BestWorkSectionConfig } from '../../types/portfolio';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { extractYouTubeId } from '../VideoModal';
import { 
  extractVimeoInfo, 
  detectVideoType, 
  fetchVideoAutoMetadata, 
  VimeoIcon 
} from '../../lib/videoUtils';
import { uploadMediaToStorage } from '../../lib/mediaUpload';

interface BestWorkVideoEditorProps {
  onNotify?: (msg: string, type?: 'success' | 'error') => void;
}

export const BestWorkVideoEditor: React.FC<BestWorkVideoEditorProps> = ({ onNotify }) => {
  const { draftPortfolio, updateDraft } = usePortfolio();
  const items = draftPortfolio.bestVideoWorks || [];
  const sectionConfig: BestWorkSectionConfig = draftPortfolio.bestVideoSection || {
    sectionTag: { en: 'FEATURED SHOWCASE', bn: 'ফিচার্ড শোকেস', ar: 'معرض الأعمال المميزة' },
    title: { en: 'WATCH MY BEST WORK', bn: 'আমার সেরা ভিডিও কাজ দেখুন', ar: 'شاهد أفضل أعمالي في المونتاج' },
    subtitle: {
      en: 'Handpicked video edits, visual sequences, and creative projects crafted with Premiere Pro and After Effects.',
      bn: 'প্রিমিয়ার প্রো ও আফটার ইফেক্টসে তৈরি করা আমার নির্বাচিত সেরা ভিডিও এডিটিং কাজ।',
      ar: 'مجموعة منتقاة من أفضل أعمال المونتاج والمؤثرات البصرية المُنتجة ببرامج أدوبي.'
    }
  };

  const [fetchingOgId, setFetchingOgId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
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
      bestVideoSection: {
        ...(prev.bestVideoSection || sectionConfig),
        [field]: {
          ...((prev.bestVideoSection?.[field] || sectionConfig[field]) as any),
          [lang]: val
        }
      }
    }));
  };

  const handleAddItem = () => {
    const newItem: BestWorkVideoItem = {
      id: 'best-vid-' + Date.now(),
      title: { en: '', bn: '', ar: '' },
      videoUrl: '',
      videoType: 'vimeo',
      thumbnailUrl: '',
      customThumbnailUrl: '',
      order: items.length + 1,
      visible: true
    };
    updateDraft((prev) => ({
      ...prev,
      bestVideoWorks: [...(prev.bestVideoWorks || []), newItem]
    }));
    notify('New Best Work video added');
  };

  const handleMove = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= items.length) return;
    const nextList = [...items];
    const [moved] = nextList.splice(fromIdx, 1);
    nextList.splice(toIdx, 0, moved);
    updateDraft((prev) => ({
      ...prev,
      bestVideoWorks: nextList.map((item, i) => ({ ...item, order: i + 1 }))
    }));
  };

  const handleToggleVisible = (idx: number) => {
    updateDraft((prev) => ({
      ...prev,
      bestVideoWorks: (prev.bestVideoWorks || []).map((item, i) =>
        i === idx ? { ...item, visible: item.visible === false ? true : false } : item
      )
    }));
    notify('Visibility updated');
  };

  const handleConfirmDelete = () => {
    updateDraft((prev) => ({
      ...prev,
      bestVideoWorks: (prev.bestVideoWorks || []).filter((item) => item.id !== deleteModal.id)
    }));
    setDeleteModal({ isOpen: false, id: '', name: '' });
    notify('Item removed from Best Work');
  };

  const triggerAutoFetch = async (videoUrl: string, idx: number, forceAutoThumbnail = false) => {
    const cleanUrl = videoUrl.trim();
    if (!cleanUrl) return;
    const currentItem = (draftPortfolio.bestVideoWorks || [])[idx];
    if (!currentItem) return;

    // Detect platform
    const detected = detectVideoType(cleanUrl);
    const ytId = extractYouTubeId(cleanUrl);
    const vimeoInfo = extractVimeoInfo(cleanUrl);

    // YouTube quick local preview
    if (detected === 'youtube' && ytId) {
      const defaultYt = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
      updateDraft((prev) => ({
        ...prev,
        bestVideoWorks: (prev.bestVideoWorks || []).map((v, i) =>
          i === idx ? { ...v, thumbnailUrl: v.thumbnailUrl || defaultYt } : v
        )
      }));
    }

    setFetchingOgId(currentItem.id);
    try {
      const meta = await fetchVideoAutoMetadata(cleanUrl);
      if (meta && (meta.thumbnailUrl || meta.fallbackThumbnailUrl)) {
        const thumb = meta.thumbnailUrl || meta.fallbackThumbnailUrl || '';
        updateDraft((prev) => ({
          ...prev,
          bestVideoWorks: (prev.bestVideoWorks || []).map((v, i) =>
            i === idx
              ? {
                  ...v,
                  thumbnailUrl: thumb,
                  customThumbnailUrl: forceAutoThumbnail ? '' : v.customThumbnailUrl,
                  videoType: meta.videoType || v.videoType,
                  videoId: meta.videoId || v.videoId,
                  videoHash: meta.videoHash || v.videoHash,
                  title: !v.title?.en && meta.title ? { en: meta.title, bn: '', ar: '' } : v.title
                }
              : v
          )
        }));
      }
    } catch (err: any) {
      console.warn('Auto-fetch notice:', err);
    } finally {
      setFetchingOgId(null);
    }
  };

  const handleFetchOg = async (item: BestWorkVideoItem, idx: number) => {
    if (!item.videoUrl) {
      notify('Please enter a video URL first', 'error');
      return;
    }
    setFetchingOgId(item.id);
    try {
      const meta = await fetchVideoAutoMetadata(item.videoUrl);
      if (meta && (meta.thumbnailUrl || meta.fallbackThumbnailUrl)) {
        const thumb = meta.thumbnailUrl || meta.fallbackThumbnailUrl || '';
        updateDraft((prev) => ({
          ...prev,
          bestVideoWorks: (prev.bestVideoWorks || []).map((v, i) =>
            i === idx
              ? {
                  ...v,
                  thumbnailUrl: thumb,
                  videoType: meta.videoType || v.videoType,
                  videoId: meta.videoId || v.videoId,
                  videoHash: meta.videoHash || v.videoHash,
                  title: !v.title?.en && meta.title ? { en: meta.title, bn: '', ar: '' } : v.title
                }
              : v
          )
        }));
        notify('Thumbnail fetched successfully from video metadata!');
      } else {
        notify('Could not auto-fetch. Please upload custom thumbnail or use placeholder.', 'error');
      }
    } catch (err: any) {
      notify('Fetch failed: ' + (err.message || 'Network error'), 'error');
    } finally {
      setFetchingOgId(null);
    }
  };

  const handleCustomThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress((prev) => ({ ...prev, [idx]: 15 }));
    notify('Compressing & uploading thumbnail to Firebase Storage...');

    try {
      const downloadUrl = await uploadMediaToStorage(file, (pct) => {
        setUploadProgress((prev) => ({ ...prev, [idx]: pct }));
      });

      updateDraft((prev) => ({
        ...prev,
        bestVideoWorks: (prev.bestVideoWorks || []).map((v, i) =>
          i === idx ? { ...v, customThumbnailUrl: downloadUrl } : v
        )
      }));
      notify('Thumbnail uploaded to Firebase Storage successfully!');
    } catch (err: any) {
      notify('Upload failed: ' + (err.message || 'Storage upload error'), 'error');
    } finally {
      setUploadProgress((prev) => {
        const next = { ...prev };
        delete next[idx];
        return next;
      });
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232B33]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2 rtl:space-x-reverse">
            <Film className="w-5 h-5 text-[#FF5722]" />
            <span>Video Editing - Best Work</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#FF5722]/15 text-[#FF5722] border border-[#FF5722]/30">
              {items.length} Videos
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Connected to the public "Watch My Best Work" section. Supports Vimeo, YouTube and Facebook video embeds.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF5722] hover:bg-[#F4511E] shadow-lg shadow-orange-900/30 transition-all shrink-0 self-start sm:self-auto min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Best Video</span>
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
          const ytId = extractYouTubeId(item.videoUrl);
          const vimeoInfo = extractVimeoInfo(item.videoUrl);
          const isVimeo = item.videoType === 'vimeo' || Boolean(vimeoInfo.id);
          const isYouTube = !isVimeo && (item.videoType === 'youtube' || Boolean(ytId));
          const isFacebook = !isVimeo && !isYouTube && (item.videoType === 'facebook' || (item.videoUrl && (item.videoUrl.includes('facebook.com') || item.videoUrl.includes('fb.watch'))));
          const isVisible = item.visible !== false;

          const autoYtThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '';
          const activeThumb = item.customThumbnailUrl || item.thumbnailUrl || autoYtThumb;
          const isFetching = fetchingOgId === item.id;

          return (
            <div
              key={item.id || idx}
              className={`p-5 sm:p-6 rounded-3xl bg-[#141A20] border transition-all space-y-4 shadow-xl ${
                isVisible ? 'border-[#232B33] hover:border-neutral-700' : 'border-neutral-800 opacity-70'
              }`}
            >
              {/* Top Item Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#232B33]">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <span className="w-7 h-7 rounded-full bg-[#181E24] border border-[#232B33] flex items-center justify-center text-xs font-mono font-bold text-[#FF5722]">
                    #{idx + 1}
                  </span>

                  {/* Platform Selector */}
                  <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                    <label className="text-[11px] font-mono text-neutral-400">Platform:</label>
                    <select
                      value={item.videoType || 'vimeo'}
                      onChange={(e) => {
                        const val = e.target.value as 'vimeo' | 'youtube' | 'facebook' | 'direct';
                        updateDraft((prev) => ({
                          ...prev,
                          bestVideoWorks: (prev.bestVideoWorks || []).map((v, i) =>
                            i === idx ? { ...v, videoType: val } : v
                          )
                        }));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs font-mono text-[#FF5722] uppercase focus:outline-none"
                    >
                      <option value="vimeo">Vimeo</option>
                      <option value="youtube">YouTube</option>
                      <option value="facebook">Facebook</option>
                      <option value="direct">Direct Link</option>
                    </select>
                  </div>

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

                {/* Controls: Visibility, Reorder, Delete */}
                <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
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

                  <button
                    type="button"
                    onClick={() => handleMove(idx, idx - 1)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMove(idx, idx + 1)}
                    disabled={idx === items.length - 1}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
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
                        name: item.title?.en || `Video #${idx + 1}`
                      })
                    }
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Video URL Input with Auto-detection */}
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                  Video URL (Vimeo, YouTube or Facebook)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={item.videoUrl || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const detected = detectVideoType(val);
                      const vimeoMeta = detected === 'vimeo' ? extractVimeoInfo(val) : null;
                      updateDraft((prev) => ({
                        ...prev,
                        bestVideoWorks: (prev.bestVideoWorks || []).map((v, i) =>
                          i === idx
                            ? {
                                ...v,
                                videoUrl: val,
                                videoType: (detected || v.videoType) as any,
                                videoId: vimeoMeta?.id || v.videoId,
                                videoHash: vimeoMeta?.hash || v.videoHash
                              }
                            : v
                        )
                      }));
                    }}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val) {
                        triggerAutoFetch(val, idx);
                      }
                    }}
                    placeholder="https://vimeo.com/... or https://youtube.com/watch?v=... or FB video"
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] text-xs text-white font-mono focus:border-[#FF5722] focus:outline-none"
                  />
                  <div className="absolute right-3 top-2.5 flex items-center space-x-1 pointer-events-none">
                    {isVimeo && <VimeoIcon className="w-4 h-4 text-[#1AB7EA]" />}
                    {isYouTube && <Youtube className="w-4 h-4 text-[#FF0000]" />}
                    {isFacebook && <Facebook className="w-4 h-4 text-[#1877F2]" />}
                  </div>
                </div>
              </div>

              {/* Multilingual Titles (Leave empty if unknown) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                    Title (EN) <span className="text-neutral-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={item.title?.en || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => ({
                        ...prev,
                        bestVideoWorks: (prev.bestVideoWorks || []).map((v, i) =>
                          i === idx ? { ...v, title: { ...v.title, en: val } } : v
                        )
                      }));
                    }}
                    placeholder="Optional title"
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] text-xs text-white font-mono focus:border-[#FF5722] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                    Title (BN) <span className="text-neutral-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={item.title?.bn || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => ({
                        ...prev,
                        bestVideoWorks: (prev.bestVideoWorks || []).map((v, i) =>
                          i === idx ? { ...v, title: { ...v.title, bn: val } } : v
                        )
                      }));
                    }}
                    placeholder="ঐচ্ছিক শিরোনাম"
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] text-xs text-white font-mono focus:border-[#FF5722] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                    Title (AR) <span className="text-neutral-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={item.title?.ar || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => ({
                        ...prev,
                        bestVideoWorks: (prev.bestVideoWorks || []).map((v, i) =>
                          i === idx ? { ...v, title: { ...v.title, ar: val } } : v
                        )
                      }));
                    }}
                    placeholder="عنوان اختياري"
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] text-xs text-white font-mono focus:border-[#FF5722] focus:outline-none"
                  />
                </div>
              </div>

              {/* Thumbnail Display & Actions */}
              <div className="space-y-2">
                <label className="block text-[11px] font-mono text-neutral-400">
                  Video Thumbnail (Auto or Custom Upload)
                </label>

                {activeThumb && (
                  <div className="relative w-full max-w-sm aspect-video rounded-xl overflow-hidden bg-[#080B0D] border border-[#232B33] mb-3 flex items-center justify-center">
                    <img
                      src={activeThumb}
                      alt="Thumbnail preview"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 left-2 flex items-center space-x-1.5 bg-black/85 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono border border-[#232B33]">
                      {item.customThumbnailUrl ? (
                        <span className="text-emerald-400">Custom Upload Active</span>
                      ) : isVimeo ? (
                        <span className="text-[#1AB7EA] flex items-center gap-1">
                          <VimeoIcon className="w-3 h-3" /> Vimeo Auto Thumbnail
                        </span>
                      ) : (
                        <span className="text-neutral-300">Auto Thumbnail</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  {/* Reset to Automatic Thumbnail Button */}
                  {item.customThumbnailUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        updateDraft((prev) => ({
                          ...prev,
                          bestVideoWorks: (prev.bestVideoWorks || []).map((v, i) =>
                            i === idx ? { ...v, customThumbnailUrl: '' } : v
                          )
                        }));
                        if (item.videoUrl) {
                          triggerAutoFetch(item.videoUrl, idx, true);
                        }
                        notify('Reset to automatic thumbnail');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-950/40 hover:bg-amber-950/60 border border-amber-500/30 text-xs font-mono font-semibold text-amber-300 flex items-center space-x-1.5 transition-colors min-h-[44px]"
                      title="Remove custom thumbnail and restore automatic thumbnail"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Reset to automatic thumbnail</span>
                    </button>
                  )}

                  {/* Auto Fetch Thumbnail */}
                  <button
                    type="button"
                    disabled={isFetching || !item.videoUrl}
                    onClick={() => handleFetchOg(item, idx)}
                    className="px-3.5 py-2 rounded-xl bg-[#181E24] hover:bg-[#1E252D] border border-[#232B33] text-xs font-mono font-semibold text-neutral-200 flex items-center space-x-1.5 disabled:opacity-40 min-h-[44px]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
                    <span>{isFetching ? 'Fetching...' : 'Re-fetch Automatic Thumbnail'}</span>
                  </button>

                  {/* Custom Upload */}
                  <label className="px-3.5 py-2 rounded-xl bg-[#181E24] hover:bg-[#1E252D] border border-[#232B33] text-xs font-mono font-semibold text-neutral-200 flex items-center space-x-1.5 cursor-pointer min-h-[44px]">
                    <Upload className="w-3.5 h-3.5 text-[#FF5722]" />
                    <span>Upload Custom Thumbnail</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleCustomThumbnailUpload(e, idx)}
                    />
                  </label>

                  {uploadProgress[idx] && (
                    <span className="text-xs font-mono text-[#FF5722]">
                      Uploading: {uploadProgress[idx]}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="p-8 text-center rounded-3xl bg-[#141A20] border border-[#232B33] text-neutral-400 space-y-2">
            <p className="text-xs font-mono">No video best works added yet.</p>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-[#FF5722] bg-[#FF5722]/10 border border-[#FF5722]/30 hover:bg-[#FF5722]/20 transition-all inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Best Video</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="Delete Best Work Video?"
        itemName={deleteModal.name}
        message="Are you sure you want to delete this top video? It will be removed from your draft portfolio. Changes will take effect on the live website when you click Publish."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
      />
    </div>
  );
};
