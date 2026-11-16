/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Palette,
  Type,
  RotateCcw,
  MousePointerClick,
  Sparkles,
  Check,
  X,
  Move,
  Layers,
  Image as ImageIcon,
  Box,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  Loader2,
  Wand2
} from 'lucide-react';
import { useDesignOverrides } from '../../../context/DesignOverridesContext';
import { usePortfolio } from '../../../context/PortfolioContext';
import {
  CustomCanvasLayer,
  CustomLayerSectionTarget,
  ElementMotionMode,
  LIVE_EDIT_FONT_OPTIONS,
  Studio3DPreset
} from '../../../types/designOverrides';
import { BUILTIN_LAYER_ICONS } from '../../common/CustomLayersRenderer';
import { uploadStudioAsset } from '../../../lib/mediaUpload';

const COLOR_PRESETS = [
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Warm Cream', hex: '#F3EFE6' },
  { name: 'Signature Orange', hex: '#FF5722' },
  { name: 'Crimson Red', hex: '#FF4B5C' },
  { name: 'Warm Amber', hex: '#F59E0B' },
  { name: 'Cyber Cyan', hex: '#06B6D4' },
  { name: 'Neon Emerald', hex: '#10B981' },
  { name: 'Royal Purple', hex: '#8B5CF6' }
];

const STUDIO_3D_PRESETS: { id: Studio3DPreset; label: string; desc: string }[] = [
  { id: 'liquid-wave', label: 'Liquid Ribbon Wave', desc: 'Original signature 3D ribbon + bokeh' },
  { id: 'cyber-grid', label: 'Perspective Cyber Grid', desc: 'Crisp studio wireframe plane' },
  { id: 'orbital-rings', label: 'Orbital Wire Rings', desc: 'Gyroscope glowing 3D rings' },
  { id: 'starfield-nebula', label: 'Deep Starfield Nebula', desc: 'Expanded starry cinema particles' },
  { id: 'minimal-void', label: 'Clean Minimal Void', desc: 'Subtle ambient particle glow only' }
];

const SECTION_BG_TARGETS: { id: string; label: string }[] = [
  { id: 'hero', label: 'Hero Section (Top)' },
  { id: 'case-studies', label: 'Selected Results / Case Studies' },
  { id: 'video-showcase', label: 'Video & Motion Reel' },
  { id: 'graphic-showcase', label: 'Graphic Posters Showcase' },
  { id: 'about-preview', label: 'About & Toolkit' },
  { id: 'trust-testimonials', label: 'Trust Stats & Testimonials' },
  { id: 'overview-directory', label: 'Explore Portfolio Directory' },
  { id: 'contact-cta', label: 'Contact CTA Banner' },
  { id: 'channels', label: 'Connected Channels' }
];

const LAYER_TARGETS: { id: CustomLayerSectionTarget; label: string }[] = [
  { id: 'hero', label: 'Hero Section' },
  { id: 'case-studies', label: 'Case Studies' },
  { id: 'about-preview', label: 'About & Toolkit' },
  { id: 'trust-testimonials', label: 'Stats & Testimonials' },
  { id: 'global', label: 'Floating Screen Overlay (Global)' }
];

const SECTION_ORDER_LABELS: Record<string, string> = {
  caseStudies: 'Work That Delivers Real Results (Case Studies)',
  videoShowcase: 'Video & Motion Showcase',
  graphicShowcase: 'Graphic Poster Showcase',
  aboutPreview: 'About & Editing Toolkit',
  trustTestimonials: 'Trust Stats & Testimonials',
  overviewDirectory: 'Explore Portfolio Directory'
};

type InspectorTab = 'element' | 'scene' | 'canvas' | 'sections';

export const LiveEditSidePanel: React.FC = () => {
  const { language } = usePortfolio();
  const {
    activeElementId,
    activeElementLabel,
    selectElement,
    activeLayerId,
    selectLayer,
    overrides,
    studio3D,
    sectionBackgrounds,
    customLayers,
    sectionOrder,
    showHiddenInLiveEdit,
    setShowHiddenInLiveEdit,
    updateElementOverride,
    resetElementOverride,
    hideElement,
    restoreElement,
    updateStudio3D,
    updateSectionBackground,
    resetSectionBackground,
    addCustomLayer,
    updateCustomLayer,
    removeCustomLayer,
    duplicateCustomLayer,
    setSectionOrder
  } = useDesignOverrides();

  const [tab, setTab] = useState<InspectorTab>('element');
  const [selectedBgSection, setSelectedBgSection] = useState<string>('hero');
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  useEffect(() => {
    if (activeLayerId) {
      setTab('canvas');
    } else if (activeElementId) {
      setTab('element');
    }
  }, [activeElementId, activeLayerId]);

  const handleAssetUpload = async (
    file: File,
    key: string,
    onUrl: (url: string) => void
  ) => {
    setUploadingKey(key);
    setUploadStatus(null);
    try {
      const url = await uploadStudioAsset(file);
      onUrl(url);
      setUploadStatus('Uploaded & applied');
      setTimeout(() => setUploadStatus(null), 2500);
    } catch (err: any) {
      setUploadStatus(err?.message || 'Upload failed');
    } finally {
      setUploadingKey(null);
    }
  };

  const handleAddLayer = (type: CustomCanvasLayer['type']) => {
    const id = 'layer-' + Date.now();
    const base: CustomCanvasLayer = {
      id,
      name:
        type === 'rectangle'
          ? 'Glass Card'
          : type === 'text'
          ? 'Floating Text'
          : 'Icon Emblem',
      type,
      sectionTarget: 'hero',
      x: 12,
      y: 80,
      width: type === 'icon' ? 96 : type === 'text' ? 240 : 260,
      height: type === 'icon' ? 96 : type === 'text' ? 68 : 130,
      text:
        type === 'text'
          ? 'Custom Studio Headline'
          : type === 'rectangle'
          ? 'Highlight Box'
          : '',
      textAlign: 'center',
      verticalAlign: 'center',
      fontSize: 15,
      textColor: '#F3EFE6',
      bgColor: type === 'text' ? '' : 'rgba(20, 23, 30, 0.72)',
      borderColor: 'rgba(255,255,255,0.16)',
      borderWidth: type === 'text' ? 0 : 1,
      borderRadius: 16,
      padding: 14,
      opacity: 1,
      glassBlur: 12,
      glassOpacity: 0.72,
      shadowIntensity: 24,
      scale: 1,
      rotate: 0,
      zIndex: 35,
      iconName: type === 'icon' ? 'Sparkles' : '',
      iconSize: type === 'icon' ? 34 : 22,
      iconColor: '#E4583B',
      iconPosition: 'top',
      slideAnimation: 'slide-up',
      visible: true
    };
    addCustomLayer(base);
    setTab('canvas');
  };

  const moveSectionOrder = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= sectionOrder.length) return;
    const next = [...sectionOrder];
    const [item] = next.splice(idx, 1);
    next.splice(target, 0, item);
    setSectionOrder(next);
  };

  const currentEl = activeElementId ? overrides[activeElementId] || {} : {};
  const currentLayer = customLayers.find((l) => l.id === activeLayerId) || null;
  const hiddenElements = Object.entries(overrides).filter(([, v]) => Boolean(v.hidden));
  const currentSecBg = sectionBackgrounds[selectedBgSection] || {};

  return (
    <div className="w-80 sm:w-[400px] bg-[#121419] border-l border-white/[0.08] flex flex-col h-full text-[#EAE5DC] shadow-2xl z-40 font-sans">
      {/* Top 4-Tab Pro Studio Switcher */}
      <div className="p-2 border-b border-white/[0.08] bg-[#0B0C0F]/80 grid grid-cols-4 gap-1 shrink-0">
        {[
          { id: 'element' as const, label: 'Element', icon: MousePointerClick },
          { id: 'scene' as const, label: '3D & Bg', icon: Box },
          { id: 'canvas' as const, label: 'Canvas', icon: Layers },
          { id: 'sections' as const, label: 'Sections', icon: Wand2 }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`py-2 px-1.5 rounded-lg text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#E4583B] text-white shadow'
                  : 'bg-[#171A21] text-[#A7A298] hover:text-white border border-white/[0.06]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {uploadStatus && (
        <div className="px-4 py-1.5 bg-[#E4583B]/15 border-b border-[#E4583B]/30 text-[11px] text-[#F4F0E8] flex items-center justify-between">
          <span>{uploadStatus}</span>
          <button type="button" onClick={() => setUploadStatus(null)} className="text-[#A7A298] hover:text-white">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Workspace Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        {/* ============================================================
            TAB 1: ELEMENT INSPECTOR
           ============================================================ */}
        {tab === 'element' && (
          <>
            {!activeElementId ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#171A21] border border-white/[0.09] flex items-center justify-center text-[#E4583B]">
                  <MousePointerClick className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-[#F4F0E8]">
                    Select Any Element
                  </h3>
                  <p className="text-xs text-[#A7A298] leading-relaxed max-w-xs">
                    Click any dashed element on the website to edit its text live, drag to move/resize, change font/color, apply glassmorphism &amp; blur, or toggle motion.
                  </p>
                </div>
                <p className="text-[11px] text-[#6F6B64]">
                  Double-click any text element directly on canvas for fast inline typing.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Element Header */}
                <div className="p-3 rounded-xl bg-[#0B0C0F] border border-white/[0.08] flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[#E4583B] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Selected Element</span>
                    </div>
                    <h3 className="text-xs font-semibold text-[#F4F0E8] truncate mt-0.5">
                      {activeElementLabel || activeElementId}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        currentEl.hidden
                          ? restoreElement(activeElementId)
                          : hideElement(activeElementId)
                      }
                      className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                        currentEl.hidden
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/25 text-rose-300 hover:bg-rose-500/20'
                      }`}
                      title={currentEl.hidden ? 'Restore element' : 'Delete / Hide element'}
                    >
                      {currentEl.hidden ? <Eye className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => selectElement(null)}
                      className="p-1.5 rounded-lg text-[#A7A298] hover:text-white hover:bg-white/[0.06] cursor-pointer"
                      title="Deselect"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 1. Live Inline Text Override */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#F4F0E8]">Live Text Override ({language.toUpperCase()})</span>
                    {currentEl.textOverride && (
                      <button
                        type="button"
                        onClick={() => updateElementOverride(activeElementId, { textOverride: undefined })}
                        className="text-[11px] text-[#E4583B] hover:underline cursor-pointer"
                      >
                        Clear text
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    value={currentEl.textOverride?.[language] ?? currentEl.textOverride?.default ?? ''}
                    onChange={(e) =>
                      updateElementOverride(activeElementId, {
                        textOverride: {
                          ...(currentEl.textOverride || {}),
                          [language]: e.target.value,
                          default: e.target.value
                        }
                      })
                    }
                    placeholder="Type custom replacement text here (or double-click on preview)..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] placeholder-[#6F6B64] focus:border-[#E4583B] focus:outline-none"
                  />
                </div>

                {/* 2. Text Color & Font Size */}
                <div className="space-y-3 pt-4 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-[#F4F0E8]">
                      <Palette className="w-3.5 h-3.5 text-[#E4583B]" />
                      <span>Color &amp; Typography</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {(['left', 'center', 'right'] as const).map((align) => (
                        <button
                          key={align}
                          type="button"
                          onClick={() => updateElementOverride(activeElementId, { textAlign: align })}
                          className={`p-1 rounded cursor-pointer ${
                            currentEl.textAlign === align
                              ? 'bg-[#E4583B] text-white'
                              : 'bg-[#171A21] text-[#A7A298] hover:text-white'
                          }`}
                          title={`Align ${align}`}
                        >
                          {align === 'left' ? (
                            <AlignLeft className="w-3 h-3" />
                          ) : align === 'center' ? (
                            <AlignCenter className="w-3 h-3" />
                          ) : (
                            <AlignRight className="w-3 h-3" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-white/[0.1] shrink-0">
                      <input
                        type="color"
                        value={
                          currentEl.color?.startsWith('#') && currentEl.color.length === 7
                            ? currentEl.color
                            : '#FFFFFF'
                        }
                        onChange={(e) => updateElementOverride(activeElementId, { color: e.target.value })}
                        className="absolute -inset-2 w-14 h-14 cursor-pointer bg-transparent border-0"
                      />
                    </div>
                    <input
                      type="text"
                      value={currentEl.color || ''}
                      placeholder="#FFFFFF"
                      onChange={(e) => updateElementOverride(activeElementId, { color: e.target.value })}
                      className="flex-1 px-2.5 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs font-mono text-[#F4F0E8]"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={10}
                        max={120}
                        value={currentEl.fontSize ?? ''}
                        placeholder="px"
                        onChange={(e) =>
                          updateElementOverride(activeElementId, {
                            fontSize: e.target.value ? Number(e.target.value) : undefined
                          })
                        }
                        className="w-16 px-2 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-right text-[#F4F0E8]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {COLOR_PRESETS.map((p) => {
                      const isSel = currentEl.color?.toLowerCase() === p.hex.toLowerCase();
                      return (
                        <button
                          key={p.hex}
                          type="button"
                          onClick={() => updateElementOverride(activeElementId, { color: p.hex })}
                          className={`p-1.5 rounded-lg border flex items-center justify-center gap-1 text-[10px] cursor-pointer ${
                            isSel
                              ? 'border-[#E4583B] bg-[#E4583B]/15 text-white'
                              : 'border-white/[0.08] bg-[#171A21] text-[#A7A298]'
                          }`}
                          title={p.name}
                        >
                          <span className="w-3.5 h-3.5 rounded-full border border-black/30" style={{ backgroundColor: p.hex }} />
                          {isSel && <Check className="w-3 h-3 text-[#E4583B]" />}
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="range"
                    min={10}
                    max={96}
                    value={currentEl.fontSize ?? 16}
                    onChange={(e) => updateElementOverride(activeElementId, { fontSize: Number(e.target.value) })}
                    className="w-full accent-[#E4583B] cursor-pointer"
                  />

                  <select
                    value={currentEl.fontFamily || ''}
                    onChange={(e) => updateElementOverride(activeElementId, { fontFamily: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                  >
                    <option value="">Default Font</option>
                    {LIVE_EDIT_FONT_OPTIONS.map((f) => (
                      <option key={f.id} value={f.fontFamily}>
                        {f.label} ({f.languageSupport})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Position & Frame Resize */}
                <div className="space-y-3 pt-4 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-[#F4F0E8]">
                      <Move className="w-3.5 h-3.5 text-[#E4583B]" />
                      <span>Position, Frame &amp; Z-Index</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateElementOverride(activeElementId, {
                          offsetX: 0,
                          offsetY: 0,
                          width: undefined,
                          height: undefined,
                          scale: 1,
                          rotate: 0
                        })
                      }
                      className="text-[11px] text-[#E4583B] hover:underline cursor-pointer"
                    >
                      Reset Box
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] text-[#8E8A82] mb-1">Offset X (px)</label>
                      <input
                        type="number"
                        value={currentEl.offsetX ?? 0}
                        onChange={(e) => updateElementOverride(activeElementId, { offsetX: Number(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#8E8A82] mb-1">Offset Y (px)</label>
                      <input
                        type="number"
                        value={currentEl.offsetY ?? 0}
                        onChange={(e) => updateElementOverride(activeElementId, { offsetY: Number(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#8E8A82] mb-1">Width (px)</label>
                      <input
                        type="number"
                        placeholder="Auto"
                        value={typeof currentEl.width === 'number' ? currentEl.width : ''}
                        onChange={(e) =>
                          updateElementOverride(activeElementId, {
                            width: e.target.value ? Number(e.target.value) : undefined
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#8E8A82] mb-1">Min Height (px)</label>
                      <input
                        type="number"
                        placeholder="Auto"
                        value={typeof currentEl.height === 'number' ? currentEl.height : ''}
                        onChange={(e) =>
                          updateElementOverride(activeElementId, {
                            height: e.target.value ? Number(e.target.value) : undefined
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Transform, Opacity, Blur & Shadow */}
                <div className="space-y-3 pt-4 border-t border-white/[0.08]">
                  <span className="text-xs font-medium text-[#F4F0E8] block">
                    Zoom, Rotate, Opacity, Blur &amp; Shadow
                  </span>

                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#A7A298]">Zoom Scale</span>
                      <span className="font-mono text-[#F4F0E8]">{(currentEl.scale ?? 1).toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={2.2}
                      step={0.05}
                      value={currentEl.scale ?? 1}
                      onChange={(e) => updateElementOverride(activeElementId, { scale: Number(e.target.value) })}
                      className="w-full accent-[#E4583B]"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-[#A7A298]">Rotation</span>
                      <span className="font-mono text-[#F4F0E8]">{currentEl.rotate ?? 0}&deg;</span>
                    </div>
                    <input
                      type="range"
                      min={-45}
                      max={45}
                      step={1}
                      value={currentEl.rotate ?? 0}
                      onChange={(e) => updateElementOverride(activeElementId, { rotate: Number(e.target.value) })}
                      className="w-full accent-[#E4583B]"
                    />

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[#A7A298]">Opacity</span>
                          <span>{Math.round((currentEl.opacity ?? 1) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min={0.1}
                          max={1}
                          step={0.05}
                          value={currentEl.opacity ?? 1}
                          onChange={(e) => updateElementOverride(activeElementId, { opacity: Number(e.target.value) })}
                          className="w-full accent-[#E4583B]"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[#A7A298]">Soft Blur</span>
                          <span>{currentEl.blur ?? 0}px</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={16}
                          step={1}
                          value={currentEl.blur ?? 0}
                          onChange={(e) => updateElementOverride(activeElementId, { blur: Number(e.target.value) })}
                          className="w-full accent-[#E4583B]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[#A7A298]">Shadow Depth ({currentEl.shadowIntensity ?? 0}px)</span>
                      <input
                        type="color"
                        value={currentEl.shadowColor || '#000000'}
                        onChange={(e) => updateElementOverride(activeElementId, { shadowColor: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                        title="Shadow color"
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={60}
                      step={2}
                      value={currentEl.shadowIntensity ?? 0}
                      onChange={(e) => updateElementOverride(activeElementId, { shadowIntensity: Number(e.target.value) })}
                      className="w-full accent-[#E4583B]"
                    />
                  </div>
                </div>

                {/* 5. Surface / Glassmorphism */}
                <div className="space-y-2.5 pt-4 border-t border-white/[0.08] text-[11px]">
                  <span className="text-xs font-medium text-[#F4F0E8] block">
                    Surface &amp; Glassmorphism
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-[#8E8A82] mb-1">Box Background</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={currentEl.bgColor?.startsWith('#') ? currentEl.bgColor : '#181C24'}
                          onChange={(e) => updateElementOverride(activeElementId, { bgColor: e.target.value })}
                          className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={currentEl.bgColor || ''}
                          placeholder="None"
                          onChange={(e) => updateElementOverride(activeElementId, { bgColor: e.target.value })}
                          className="w-full px-2 py-1 rounded bg-[#0B0C0F] border border-white/[0.08] text-[11px] font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#8E8A82] mb-1">Padding &amp; Radius</label>
                      <div className="grid grid-cols-2 gap-1">
                        <input
                          type="number"
                          placeholder="Pad"
                          value={currentEl.padding ?? ''}
                          onChange={(e) =>
                            updateElementOverride(activeElementId, {
                              padding: e.target.value ? Number(e.target.value) : undefined
                            })
                          }
                          className="w-full px-2 py-1 rounded bg-[#0B0C0F] border border-white/[0.08] text-[11px]"
                        />
                        <input
                          type="number"
                          placeholder="Rad"
                          value={currentEl.borderRadius ?? ''}
                          onChange={(e) =>
                            updateElementOverride(activeElementId, {
                              borderRadius: e.target.value ? Number(e.target.value) : undefined
                            })
                          }
                          className="w-full px-2 py-1 rounded bg-[#0B0C0F] border border-white/[0.08] text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[#A7A298]">Glass Blur</span>
                        <span>{currentEl.glassBlur ?? 0}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={28}
                        value={currentEl.glassBlur ?? 0}
                        onChange={(e) => updateElementOverride(activeElementId, { glassBlur: Number(e.target.value) })}
                        className="w-full accent-[#E4583B]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[#A7A298]">Glass Fill</span>
                        <span>{Math.round((currentEl.glassOpacity ?? 0) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={0.85}
                        step={0.05}
                        value={currentEl.glassOpacity ?? 0}
                        onChange={(e) => updateElementOverride(activeElementId, { glassOpacity: Number(e.target.value) })}
                        className="w-full accent-[#E4583B]"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Motion / Slide Toggle */}
                <div className="space-y-2 pt-4 border-t border-white/[0.08]">
                  <span className="text-xs font-medium text-[#F4F0E8] block">
                    Element Slide &amp; Motion Effect
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: 'default', label: 'Default' },
                        { id: 'none', label: 'Static (Off)' },
                        { id: 'slide-up', label: 'Slide Up' },
                        { id: 'slide-left', label: 'Slide Left' },
                        { id: 'slide-right', label: 'Slide Right' },
                        { id: 'float', label: '3D Float' }
                      ] as { id: ElementMotionMode; label: string }[]
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => updateElementOverride(activeElementId, { motionMode: m.id })}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border cursor-pointer ${
                          (currentEl.motionMode || 'default') === m.id
                            ? 'bg-[#E4583B]/15 border-[#E4583B] text-white'
                            : 'bg-[#171A21] border-white/[0.07] text-[#A7A298] hover:text-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 7. Reset */}
                <div className="pt-3 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => resetElementOverride(activeElementId)}
                    className="w-full py-2 px-3 rounded-lg border border-white/[0.09] bg-[#171A21] hover:bg-[#1E222B] text-xs font-medium text-[#EAE5DC] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#A7A298]" />
                    <span>Reset element overrides</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ============================================================
            TAB 2: 3D SCENE & SECTION BACKGROUND DESIGNER
           ============================================================ */}
        {tab === 'scene' && (
          <div className="space-y-5">
            {/* 3D Preset Switcher */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#F4F0E8] flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-[#E4583B]" />
                  <span>3D Background Scene Preset</span>
                </span>
              </div>
              <div className="space-y-1.5">
                {STUDIO_3D_PRESETS.map((preset) => {
                  const active = studio3D.preset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => updateStudio3D({ preset: preset.id })}
                      className={`w-full p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#E4583B]/15 border-[#E4583B] text-white'
                          : 'bg-[#171A21] border-white/[0.07] text-[#D7D2C8] hover:border-white/20'
                      }`}
                    >
                      <div className="text-xs font-semibold">{preset.label}</div>
                      <div className="text-[11px] text-[#8E8A82]">{preset.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3D Tuning Sliders */}
            <div className="space-y-2.5 pt-4 border-t border-white/[0.08] text-[11px]">
              <span className="text-xs font-semibold text-[#F4F0E8] block">3D Physics &amp; Glow</span>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#A7A298]">Wave / Structure Intensity</span>
                  <span>{(studio3D.waveIntensity ?? 1).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={2.2}
                  step={0.1}
                  value={studio3D.waveIntensity ?? 1}
                  onChange={(e) => updateStudio3D({ waveIntensity: Number(e.target.value) })}
                  className="w-full accent-[#E4583B]"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#A7A298]">Motion Speed</span>
                  <span>{(studio3D.motionSpeed ?? 1).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={2.5}
                  step={0.1}
                  value={studio3D.motionSpeed ?? 1}
                  onChange={(e) => updateStudio3D({ motionSpeed: Number(e.target.value) })}
                  className="w-full accent-[#E4583B]"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#A7A298]">Bokeh Particle Density</span>
                  <span>{Math.round((studio3D.bokehDensity ?? 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1.5}
                  step={0.1}
                  value={studio3D.bokehDensity ?? 1}
                  onChange={(e) => updateStudio3D({ bokehDensity: Number(e.target.value) })}
                  className="w-full accent-[#E4583B]"
                />
              </div>
            </div>

            {/* Custom Image into 3D Scene / Backdrop */}
            <div className="space-y-3 pt-4 border-t border-white/[0.08]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#F4F0E8] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#E4583B]" />
                  <span>Custom 3D / Global Backdrop</span>
                </span>
                {studio3D.customBgUrl && (
                  <button
                    type="button"
                    onClick={() => updateStudio3D({ customBgUrl: '' })}
                    className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {(['3d-plane', 'backdrop-parallax'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => updateStudio3D({ customBgMode: m })}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border cursor-pointer ${
                      (studio3D.customBgMode || '3d-plane') === m
                        ? 'bg-[#E4583B]/15 border-[#E4583B] text-white'
                        : 'bg-[#171A21] border-white/[0.07] text-[#A7A298]'
                    }`}
                  >
                    {m === '3d-plane' ? 'Curved 3D Mesh' : 'Full Parallax Layer'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <label className="px-3 py-2 rounded-xl bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.09] text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0">
                  {uploadingKey === 'studio3d' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E4583B]" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-[#E4583B]" />
                  )}
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleAssetUpload(f, 'studio3d', (url) => updateStudio3D({ customBgUrl: url }));
                      e.target.value = '';
                    }}
                  />
                </label>
                <input
                  type="url"
                  value={studio3D.customBgUrl || ''}
                  onChange={(e) => updateStudio3D({ customBgUrl: e.target.value })}
                  placeholder="Or paste image URL..."
                  className="flex-1 px-2.5 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-[11px] font-mono"
                />
              </div>

              {studio3D.customBgUrl && (
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#A7A298]">Bg Opacity</span>
                      <span>{Math.round((studio3D.customBgOpacity ?? 0.55) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={studio3D.customBgOpacity ?? 0.55}
                      onChange={(e) => updateStudio3D({ customBgOpacity: Number(e.target.value) })}
                      className="w-full accent-[#E4583B]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#A7A298]">Bg Scale</span>
                      <span>{(studio3D.customBgScale ?? 1).toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.7}
                      max={1.8}
                      step={0.05}
                      value={studio3D.customBgScale ?? 1}
                      onChange={(e) => updateStudio3D({ customBgScale: Number(e.target.value) })}
                      className="w-full accent-[#E4583B]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Per-Section Background Designer */}
            <div className="space-y-3 pt-4 border-t border-white/[0.08]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#F4F0E8]">
                  Per-Section Background
                </span>
                <button
                  type="button"
                  onClick={() => resetSectionBackground(selectedBgSection)}
                  className="text-[11px] text-[#E4583B] hover:underline cursor-pointer"
                >
                  Reset section
                </button>
              </div>

              <select
                value={selectedBgSection}
                onChange={(e) => setSelectedBgSection(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8]"
              >
                {SECTION_BG_TARGETS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <label className="px-3 py-2 rounded-xl bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.09] text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0">
                  {uploadingKey === `sec-${selectedBgSection}` ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E4583B]" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-[#E4583B]" />
                  )}
                  <span>Upload Bg</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        handleAssetUpload(f, `sec-${selectedBgSection}`, (url) =>
                          updateSectionBackground(selectedBgSection, { imageUrl: url })
                        );
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
                <input
                  type="color"
                  value={currentSecBg.bgColor?.startsWith('#') ? currentSecBg.bgColor : '#0B0E14'}
                  onChange={(e) => updateSectionBackground(selectedBgSection, { bgColor: e.target.value })}
                  className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer shrink-0"
                  title="Section tint color"
                />
                <input
                  type="url"
                  value={currentSecBg.imageUrl || ''}
                  onChange={(e) => updateSectionBackground(selectedBgSection, { imageUrl: e.target.value })}
                  placeholder="Section image URL..."
                  className="flex-1 px-2.5 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-[11px] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#A7A298]">Image Opacity</span>
                    <span>{Math.round((currentSecBg.opacity ?? 0.45) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={currentSecBg.opacity ?? 0.45}
                    onChange={(e) => updateSectionBackground(selectedBgSection, { opacity: Number(e.target.value) })}
                    className="w-full accent-[#E4583B]"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#A7A298]">Dark Overlay</span>
                    <span>{Math.round((currentSecBg.overlayOpacity ?? 0.45) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={0.95}
                    step={0.05}
                    value={currentSecBg.overlayOpacity ?? 0.45}
                    onChange={(e) => updateSectionBackground(selectedBgSection, { overlayOpacity: Number(e.target.value) })}
                    className="w-full accent-[#E4583B]"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#A7A298]">Blur</span>
                    <span>{currentSecBg.blur ?? 0}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={24}
                    step={1}
                    value={currentSecBg.blur ?? 0}
                    onChange={(e) => updateSectionBackground(selectedBgSection, { blur: Number(e.target.value) })}
                    className="w-full accent-[#E4583B]"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#A7A298]">Zoom Scale</span>
                    <span>{(currentSecBg.scale ?? 1).toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.8}
                    max={1.8}
                    step={0.05}
                    value={currentSecBg.scale ?? 1}
                    onChange={(e) => updateSectionBackground(selectedBgSection, { scale: Number(e.target.value) })}
                    className="w-full accent-[#E4583B]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 3: PHOTOSHOP / ILLUSTRATOR CUSTOM CANVAS LAYERS
           ============================================================ */}
        {tab === 'canvas' && (
          <div className="space-y-4">
            {/* Add New Layer Toolbar */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#F4F0E8] block">
                Add New Canvas Object
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddLayer('rectangle')}
                  className="py-2 px-2 rounded-xl bg-[#E4583B] hover:bg-[#D0492D] text-white text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Box / Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddLayer('text')}
                  className="py-2 px-2 rounded-xl bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.09] text-white text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Type className="w-3.5 h-3.5 text-[#E4583B]" />
                  <span>Text Box</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddLayer('icon')}
                  className="py-2 px-2 rounded-xl bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.09] text-white text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E4583B]" />
                  <span>Icon / Img</span>
                </button>
              </div>
            </div>

            {/* Layer Stack */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-[#8E8A82] block">
                Layers ({customLayers.length})
              </span>
              {customLayers.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#0B0C0F] border border-dashed border-white/[0.1] text-center text-xs text-[#8E8A82]">
                  Add a Rectangle Box, Text, or Custom PNG/SVG Icon to place &amp; drag freely anywhere on the canvas.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {customLayers.map((layer) => {
                    const isSel = activeLayerId === layer.id;
                    return (
                      <div
                        key={layer.id}
                        onClick={() => selectLayer(layer.id)}
                        className={`px-2.5 py-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer ${
                          isSel
                            ? 'bg-[#E4583B]/15 border-[#E4583B] text-white'
                            : 'bg-[#171A21] border-white/[0.07] text-[#D7D2C8]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate">{layer.name}</div>
                          <div className="text-[10px] text-[#8E8A82] uppercase">
                            {layer.type} &middot; {layer.sectionTarget}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => updateCustomLayer(layer.id, { visible: layer.visible === false })}
                            className="p-1 rounded hover:bg-white/10 text-[#A7A298] cursor-pointer"
                            title={layer.visible === false ? 'Show layer' : 'Hide layer'}
                          >
                            {layer.visible === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => duplicateCustomLayer(layer.id)}
                            className="p-1 rounded hover:bg-white/10 text-[#A7A298] cursor-pointer"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCustomLayer(layer.id)}
                            className="p-1 rounded hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Active Layer Inspector */}
            {currentLayer && (
              <div className="space-y-4 pt-3 border-t border-white/[0.08]">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#8E8A82] mb-1">Layer Name</label>
                    <input
                      type="text"
                      value={currentLayer.name}
                      onChange={(e) => updateCustomLayer(currentLayer.id, { name: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8E8A82] mb-1">Target Section</label>
                    <select
                      value={currentLayer.sectionTarget}
                      onChange={(e) =>
                        updateCustomLayer(currentLayer.id, {
                          sectionTarget: e.target.value as CustomLayerSectionTarget
                        })
                      }
                      className="w-full px-2 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs"
                    >
                      {LAYER_TARGETS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Inner Text */}
                <div>
                  <label className="block text-[10px] text-[#8E8A82] mb-1">Text Inside Box</label>
                  <textarea
                    rows={2}
                    value={currentLayer.text || ''}
                    onChange={(e) => updateCustomLayer(currentLayer.id, { text: e.target.value })}
                    placeholder="Optional text inside layer..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs"
                  />
                </div>

                {/* Text Alignment & Vertical Alignment */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="block text-[10px] text-[#8E8A82] mb-1">Horizontal Align</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['left', 'center', 'right'] as const).map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => updateCustomLayer(currentLayer.id, { textAlign: a })}
                          className={`py-1 rounded border text-[10px] capitalize cursor-pointer ${
                            (currentLayer.textAlign || 'center') === a
                              ? 'bg-[#E4583B] border-[#E4583B] text-white'
                              : 'bg-[#171A21] border-white/[0.08] text-[#A7A298]'
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8E8A82] mb-1">Vertical Align</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['top', 'center', 'bottom'] as const).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => updateCustomLayer(currentLayer.id, { verticalAlign: v })}
                          className={`py-1 rounded border text-[10px] capitalize cursor-pointer ${
                            (currentLayer.verticalAlign || 'center') === v
                              ? 'bg-[#E4583B] border-[#E4583B] text-white'
                              : 'bg-[#171A21] border-white/[0.08] text-[#A7A298]'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Icon / Custom Uploaded Icon Picker */}
                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium text-[#F4F0E8]">
                      Icon / Custom Emblem (PNG / SVG / JPG)
                    </label>
                    {(currentLayer.iconName || currentLayer.customIconUrl) && (
                      <button
                        type="button"
                        onClick={() => updateCustomLayer(currentLayer.id, { iconName: '', customIconUrl: '' })}
                        className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                      >
                        Clear Icon
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {Object.entries(BUILTIN_LAYER_ICONS).map(([key, IconComp]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          updateCustomLayer(currentLayer.id, { iconName: key, customIconUrl: '' })
                        }
                        className={`p-1.5 rounded-lg border cursor-pointer ${
                          currentLayer.iconName === key && !currentLayer.customIconUrl
                            ? 'bg-[#E4583B]/20 border-[#E4583B] text-[#E4583B]'
                            : 'bg-[#171A21] border-white/[0.08] text-[#A7A298] hover:text-white'
                        }`}
                        title={key}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="px-2.5 py-1.5 rounded-lg bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.09] text-[11px] font-medium flex items-center gap-1 cursor-pointer shrink-0">
                      {uploadingKey === `icon-${currentLayer.id}` ? (
                        <Loader2 className="w-3 h-3 animate-spin text-[#E4583B]" />
                      ) : (
                        <Upload className="w-3 h-3 text-[#E4583B]" />
                      )}
                      <span>Upload Icon</span>
                      <input
                        type="file"
                        accept="image/*,.svg"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            handleAssetUpload(f, `icon-${currentLayer.id}`, (url) =>
                              updateCustomLayer(currentLayer.id, { customIconUrl: url, iconName: '' })
                            );
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <input
                      type="url"
                      value={currentLayer.customIconUrl || ''}
                      onChange={(e) =>
                        updateCustomLayer(currentLayer.id, { customIconUrl: e.target.value })
                      }
                      placeholder="Custom icon URL..."
                      className="flex-1 px-2 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-[11px] font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <label className="block text-[#8E8A82] mb-1">Icon Size</label>
                      <input
                        type="number"
                        value={currentLayer.iconSize ?? 28}
                        onChange={(e) =>
                          updateCustomLayer(currentLayer.id, { iconSize: Number(e.target.value) || 24 })
                        }
                        className="w-full px-2 py-1 rounded bg-[#0B0C0F] border border-white/[0.08] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[#8E8A82] mb-1">Icon Color</label>
                      <input
                        type="color"
                        value={currentLayer.iconColor || '#E4583B'}
                        onChange={(e) => updateCustomLayer(currentLayer.id, { iconColor: e.target.value })}
                        className="w-full h-7 rounded bg-transparent border-0 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[#8E8A82] mb-1">Icon Side</label>
                      <select
                        value={currentLayer.iconPosition || 'top'}
                        onChange={(e) =>
                          updateCustomLayer(currentLayer.id, {
                            iconPosition: e.target.value as 'top' | 'left' | 'right'
                          })
                        }
                        className="w-full px-1.5 py-1 rounded bg-[#0B0C0F] border border-white/[0.08] text-xs"
                      >
                        <option value="top">Top</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Dimensions, Typography & Effects */}
                <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-white/[0.06]">
                  <div>
                    <label className="block text-[#8E8A82] mb-1">Font</label>
                    <select
                      value={currentLayer.fontFamily || ''}
                      onChange={(e) => updateCustomLayer(currentLayer.id, { fontFamily: e.target.value })}
                      className="w-full px-2 py-1.5 rounded bg-[#0B0C0F] border border-white/[0.08] text-xs"
                    >
                      <option value="">Default</option>
                      {LIVE_EDIT_FONT_OPTIONS.map((f) => (
                        <option key={f.id} value={f.fontFamily}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#8E8A82] mb-1">Font Size / Color</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={currentLayer.fontSize ?? 14}
                        onChange={(e) =>
                          updateCustomLayer(currentLayer.id, { fontSize: Number(e.target.value) || 14 })
                        }
                        className="w-16 px-2 py-1 rounded bg-[#0B0C0F] border border-white/[0.08] text-xs"
                      />
                      <input
                        type="color"
                        value={currentLayer.textColor || '#F4F0E8'}
                        onChange={(e) => updateCustomLayer(currentLayer.id, { textColor: e.target.value })}
                        className="w-8 h-7 rounded border-0 bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[#8E8A82] mb-1">X (%) &amp; Y (px)</label>
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="number"
                        value={currentLayer.x}
                        onChange={(e) => updateCustomLayer(currentLayer.id, { x: Number(e.target.value) || 0 })}
                        className="w-full px-2 py-1 rounded bg-[#0B0C0F] border border-white/[0.08] text-xs"
                      />
                      <input
                        type="number"
                        value={currentLayer.y}
                        onChange={(e) => updateCustomLayer(currentLayer.id, { y: Number(e.target.value) || 0 })}
                        className="w-full px-2 py-1 rounded bg-[#0B0C0F] border border-white/[0.08] text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[#8E8A82] mb-1">Width &times; Height</label>
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="number"
                        value={currentLayer.width}
                        onChange={(e) =>
                          updateCustomLayer(currentLayer.id, { width: Number(e.target.value) || 120 })
                        }
                        className="w-full px-2 py-1 rounded bg-[#0B0C0F] border border-white/[0.08] text-xs"
                      />
                      <input
                        type="number"
                        value={currentLayer.height}
                        onChange={(e) =>
                          updateCustomLayer(currentLayer.id, { height: Number(e.target.value) || 60 })
                        }
                        className="w-full px-2 py-1 rounded bg-[#0B0C0F] border border-white/[0.08] text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[#8E8A82] mb-1">Glass Blur ({currentLayer.glassBlur ?? 10}px)</label>
                    <input
                      type="range"
                      min={0}
                      max={28}
                      value={currentLayer.glassBlur ?? 10}
                      onChange={(e) =>
                        updateCustomLayer(currentLayer.id, { glassBlur: Number(e.target.value) })
                      }
                      className="w-full accent-[#E4583B]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8E8A82] mb-1">Radius ({currentLayer.borderRadius ?? 16}px)</label>
                    <input
                      type="range"
                      min={0}
                      max={48}
                      value={currentLayer.borderRadius ?? 16}
                      onChange={(e) =>
                        updateCustomLayer(currentLayer.id, { borderRadius: Number(e.target.value) })
                      }
                      className="w-full accent-[#E4583B]"
                    />
                  </div>
                </div>

                {/* Box Fill, Slide Animation */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <label className="block text-[#8E8A82] mb-1">Box Fill Color</label>
                    <input
                      type="text"
                      value={currentLayer.bgColor || ''}
                      placeholder="rgba(24,27,34,0.72)"
                      onChange={(e) => updateCustomLayer(currentLayer.id, { bgColor: e.target.value })}
                      className="w-full px-2 py-1.5 rounded bg-[#0B0C0F] border border-white/[0.08] text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8E8A82] mb-1">Slide Animation</label>
                    <select
                      value={currentLayer.slideAnimation || 'none'}
                      onChange={(e) =>
                        updateCustomLayer(currentLayer.id, {
                          slideAnimation: e.target.value as CustomCanvasLayer['slideAnimation']
                        })
                      }
                      className="w-full px-2 py-1.5 rounded bg-[#0B0C0F] border border-white/[0.08] text-xs"
                    >
                      <option value="none">No Motion</option>
                      <option value="slide-up">Slide Up</option>
                      <option value="slide-left">Slide Left</option>
                      <option value="slide-right">Slide Right</option>
                      <option value="float">Continuous 3D Float</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 4: HOME SECTION ORDER & HIDDEN RECOVERY
           ============================================================ */}
        {tab === 'sections' && (
          <div className="space-y-5">
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-[#F4F0E8] block">
                Home Section Reorder (Live Visual Layout)
              </span>
              <p className="text-[11px] text-[#8E8A82]">
                Move sections up or down. Click Save Draft or Publish Design in top bar to apply.
              </p>

              <div className="space-y-1.5">
                {sectionOrder.map((secId, idx) => (
                  <div
                    key={secId}
                    className="p-2.5 rounded-xl bg-[#171A21] border border-white/[0.08] flex items-center justify-between gap-2"
                  >
                    <span className="text-xs font-medium text-[#F4F0E8] truncate">
                      {idx + 1}. {SECTION_ORDER_LABELS[secId] || secId}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveSectionOrder(idx, -1)}
                        className="p-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-[#D7D2C8] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === sectionOrder.length - 1}
                        onClick={() => moveSectionOrder(idx, 1)}
                        className="p-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-[#D7D2C8] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hidden Elements Recovery */}
            <div className="space-y-2.5 pt-4 border-t border-white/[0.08]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#F4F0E8]">
                  Deleted / Hidden Elements ({hiddenElements.length})
                </span>
                <label className="flex items-center gap-1.5 text-[11px] text-[#A7A298] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showHiddenInLiveEdit}
                    onChange={(e) => setShowHiddenInLiveEdit(e.target.checked)}
                    className="accent-[#E4583B]"
                  />
                  <span>Show placeholders</span>
                </label>
              </div>

              {hiddenElements.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-[#0B0C0F] border border-white/[0.07] text-xs text-[#8E8A82]">
                  No hidden elements. Select any element and press the Trash icon to hide it cleanly.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {hiddenElements.map(([elId]) => (
                    <div
                      key={elId}
                      className="px-3 py-2 rounded-xl bg-[#171A21] border border-rose-500/30 flex items-center justify-between gap-2"
                    >
                      <span className="text-xs font-mono text-[#D7D2C8] truncate">{elId}</span>
                      <button
                        type="button"
                        onClick={() => restoreElement(elId)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold cursor-pointer shrink-0"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2.5 border-t border-white/[0.08] bg-[#0B0C0F]/60 flex items-center justify-between text-[11px] text-[#8E8A82] shrink-0">
        <span className="font-mono truncate">
          {activeLayerId || activeElementId || 'Studio Pro Mode'}
        </span>
        <span className="text-[#E4583B] font-medium shrink-0">Instant Live Preview</span>
      </div>
    </div>
  );
};
