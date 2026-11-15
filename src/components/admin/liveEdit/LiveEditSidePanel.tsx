/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Palette, 
  Type, 
  RotateCcw, 
  MousePointerClick, 
  Sparkles,
  Check,
  X
} from 'lucide-react';
import { useDesignOverrides } from '../../../context/DesignOverridesContext';
import { LIVE_EDIT_FONT_OPTIONS } from '../../../types/designOverrides';

const COLOR_PRESETS = [
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Signature Orange', hex: '#FF5722' },
  { name: 'Warm Amber', hex: '#F59E0B' },
  { name: 'Cyber Cyan', hex: '#06B6D4' },
  { name: 'Neon Emerald', hex: '#10B981' },
  { name: 'Royal Purple', hex: '#8B5CF6' },
  { name: 'Rose Red', hex: '#F43F5E' },
  { name: 'Neutral Gray', hex: '#9CA3AF' },
];

export const LiveEditSidePanel: React.FC = () => {
  const {
    activeElementId,
    activeElementLabel,
    selectElement,
    overrides,
    updateElementOverride,
    resetElementOverride
  } = useDesignOverrides();

  if (!activeElementId) {
    return (
      <div className="w-80 sm:w-96 bg-[#121419] border-l border-white/[0.08] flex flex-col h-full p-6 text-[#A7A298] select-none font-sans">
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#171A21] border border-white/[0.09] flex items-center justify-center text-[#E4583B]">
            <MousePointerClick className="w-7 h-7" strokeWidth={1.5} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-[#F4F0E8]">
              Select An Element
            </h3>
            <p className="text-xs text-[#A7A298] leading-relaxed max-w-xs">
              Click any text with a dashed outline on the website preview to customize its color, font size, and font family in real time.
            </p>
          </div>
          <div className="pt-1 text-xs text-[#8E8A82]">
            Color &middot; Font Size &middot; Typography
          </div>
        </div>
      </div>
    );
  }

  const current = overrides[activeElementId] || {};
  const currentColor = current.color || '#FFFFFF';
  const currentFontSize = current.fontSize ?? 16;
  const currentFontFamily = current.fontFamily || '';

  return (
    <div className="w-80 sm:w-96 bg-[#121419] border-l border-white/[0.08] flex flex-col h-full text-[#EAE5DC] shadow-2xl z-40 font-sans">
      
      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#0B0C0F]/60">
        <div className="min-w-0 pr-2">
          <div className="text-[11px] font-medium text-[#E4583B] flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>Element Inspector</span>
          </div>
          <h3 className="text-sm font-semibold text-[#F4F0E8] truncate mt-0.5" title={activeElementLabel || activeElementId}>
            {activeElementLabel || activeElementId}
          </h3>
        </div>
        
        <button
          type="button"
          onClick={() => selectElement(null)}
          className="p-1.5 rounded-lg text-[#A7A298] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          title="Deselect element"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Controls Workspace */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">

        {/* 1. Text Color Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center space-x-1.5 text-[#F4F0E8] font-medium">
              <Palette className="w-3.5 h-3.5 text-[#E4583B]" />
              <span>Text Color</span>
            </span>
            <span className="text-[11px] font-mono text-[#8E8A82] uppercase">
              {current.color || 'Default'}
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-white/[0.1] shrink-0">
              <input
                type="color"
                value={currentColor.startsWith('#') && currentColor.length === 7 ? currentColor : '#FFFFFF'}
                onChange={(e) => updateElementOverride(activeElementId, { color: e.target.value })}
                className="absolute -inset-2 w-14 h-14 cursor-pointer bg-transparent border-0"
                title="Custom color picker"
              />
            </div>
            <input
              type="text"
              value={current.color || ''}
              placeholder="#FFFFFF or rgba(...)"
              onChange={(e) => updateElementOverride(activeElementId, { color: e.target.value })}
              className="flex-1 px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs font-mono text-[#F4F0E8] placeholder-[#6F6B64] focus:outline-none focus:border-[#E4583B]"
            />
          </div>

          {/* Color Presets */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {COLOR_PRESETS.map((p) => {
              const isSelected = current.color?.toLowerCase() === p.hex.toLowerCase();
              return (
                <button
                  key={p.hex}
                  type="button"
                  onClick={() => updateElementOverride(activeElementId, { color: p.hex })}
                  className={`p-1.5 rounded-lg border flex items-center justify-center space-x-1 text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[#E4583B] bg-[#E4583B]/15 text-white font-semibold'
                      : 'border-white/[0.08] bg-[#171A21] text-[#A7A298] hover:border-white/25'
                  }`}
                  title={p.name}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/30 shrink-0"
                    style={{ backgroundColor: p.hex }}
                  />
                  {isSelected && <Check className="w-3 h-3 text-[#E4583B]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Font Size Control (Slider + Number input) */}
        <div className="space-y-3 pt-4 border-t border-white/[0.08]">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center space-x-1.5 text-[#F4F0E8] font-medium">
              <Type className="w-3.5 h-3.5 text-[#E4583B]" />
              <span>Font Size</span>
            </span>
            <div className="flex items-center space-x-1.5">
              <input
                type="number"
                min={10}
                max={96}
                value={current.fontSize ?? ''}
                placeholder="Default"
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                  updateElementOverride(activeElementId, { fontSize: val });
                }}
                className="w-16 px-2 py-1 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-right text-xs tabular-nums text-[#F4F0E8] focus:outline-none focus:border-[#E4583B]"
              />
              <span className="text-[11px] text-[#8E8A82]">px</span>
            </div>
          </div>

          <div className="space-y-1">
            <input
              type="range"
              min={12}
              max={84}
              step={1}
              value={currentFontSize}
              onChange={(e) => updateElementOverride(activeElementId, { fontSize: parseInt(e.target.value, 10) })}
              className="w-full accent-[#E4583B] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#8E8A82] tabular-nums">
              <span>12px</span>
              <span>Default</span>
              <span>84px</span>
            </div>
          </div>
        </div>

        {/* 3. Font Family Selector (Bangla, English & Arabic) */}
        <div className="space-y-3 pt-4 border-t border-white/[0.08]">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center space-x-1.5 text-[#F4F0E8] font-medium">
              <Type className="w-3.5 h-3.5 text-[#E4583B]" />
              <span>Font Family</span>
            </span>
            <span className="text-[11px] text-[#8E8A82]">
              {currentFontFamily || 'Default'}
            </span>
          </div>

          <div className="space-y-1.5">
            {LIVE_EDIT_FONT_OPTIONS.map((f) => {
              const isSelected = currentFontFamily === f.fontFamily;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => updateElementOverride(activeElementId, { fontFamily: f.fontFamily })}
                  className={`w-full px-3 py-2 rounded-lg border flex items-center justify-between text-xs transition-colors text-left cursor-pointer ${
                    isSelected
                      ? 'border-[#E4583B] bg-[#E4583B]/15 text-white font-semibold'
                      : 'border-white/[0.08] bg-[#171A21] text-[#D7D2C8] hover:border-white/20 hover:text-white'
                  }`}
                  style={{ fontFamily: f.fontFamily }}
                >
                  <div className="flex items-center space-x-2">
                    <span>{f.label}</span>
                    <span className="text-[10px] text-[#8E8A82]">
                      {f.languageSupport}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#E4583B]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Reset Element */}
        <div className="pt-4 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => resetElementOverride(activeElementId)}
            className="w-full py-2.5 px-3 rounded-lg border border-white/[0.09] bg-[#171A21] hover:bg-[#1E222B] text-[#EAE5DC] hover:text-white text-xs font-medium flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#A7A298]" />
            <span>Reset this element to default</span>
          </button>
        </div>

      </div>

      {/* Footer Info */}
      <div className="px-5 py-3 border-t border-white/[0.08] bg-[#0B0C0F]/60 flex items-center justify-between text-[11px] text-[#8E8A82]">
        <span className="font-mono truncate">{activeElementId}</span>
        <span className="text-[#E4583B] font-medium shrink-0">Instant Live Preview</span>
      </div>

    </div>
  );
};
