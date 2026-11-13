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
      <div className="w-80 sm:w-96 bg-[#0F1419]/95 backdrop-blur-xl border-l border-[#232B33] flex flex-col h-full p-6 text-neutral-400 select-none">
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#141A20] border border-[#232B33] flex items-center justify-center text-[#FF5722] shadow-xl animate-pulse">
            <MousePointerClick className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Select An Element
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
              Hover over and click any text with a dashed outline on the page to customize its color, font size, and typography in real time.
            </p>
          </div>
          <div className="pt-2 text-[11px] font-mono text-neutral-500 bg-[#12161A] px-3 py-1.5 rounded-xl border border-[#232B33]">
            Step 1: Color, Size & Font Family
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
    <div className="w-80 sm:w-96 bg-[#0F1419]/95 backdrop-blur-xl border-l border-[#232B33] flex flex-col h-full text-neutral-200 shadow-2xl z-40">
      
      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-[#232B33] flex items-center justify-between bg-[#12161A]/80">
        <div className="min-w-0 pr-2">
          <div className="text-[10px] font-mono uppercase text-[#FF5722] font-bold flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>Element Inspector</span>
          </div>
          <h3 className="text-sm font-bold text-white truncate font-sans" title={activeElementLabel || activeElementId}>
            {activeElementLabel || activeElementId}
          </h3>
        </div>
        
        <button
          type="button"
          onClick={() => selectElement(null)}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1E2732] transition-colors"
          title="Deselect element"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Controls Workspace */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">

        {/* 1. Text Color Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center space-x-1.5 text-neutral-300 font-bold">
              <Palette className="w-3.5 h-3.5 text-[#FF5722]" />
              <span>Text Color</span>
            </span>
            <span className="text-[11px] font-mono text-neutral-400 uppercase">
              {current.color || 'Default'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[#232B33] shadow-inner shrink-0">
              <input
                type="color"
                value={currentColor.startsWith('#') && currentColor.length === 7 ? currentColor : '#FFFFFF'}
                onChange={(e) => updateElementOverride(activeElementId, { color: e.target.value })}
                className="absolute -inset-2 w-16 h-16 cursor-pointer bg-transparent border-0"
                title="Custom color picker"
              />
            </div>
            <input
              type="text"
              value={current.color || ''}
              placeholder="e.g. #FF5722 or rgba(...)"
              onChange={(e) => updateElementOverride(activeElementId, { color: e.target.value })}
              className="flex-1 px-3 py-2 rounded-xl bg-[#141A20] border border-[#232B33] text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-[#FF5722]"
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
                  className={`p-1.5 rounded-xl border flex items-center justify-center space-x-1 text-[11px] font-mono transition-all ${
                    isSelected
                      ? 'border-[#FF5722] bg-[#FF5722]/15 text-white font-bold'
                      : 'border-[#232B33] bg-[#12161A] text-neutral-400 hover:border-neutral-500'
                  }`}
                  title={p.name}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/30 shrink-0"
                    style={{ backgroundColor: p.hex }}
                  />
                  {isSelected && <Check className="w-2.5 h-2.5 text-[#FF5722]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Font Size Control (Slider + Number input) */}
        <div className="space-y-3 pt-4 border-t border-[#232B33]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center space-x-1.5 text-neutral-300 font-bold">
              <Type className="w-3.5 h-3.5 text-[#FF5722]" />
              <span>Font Size (px)</span>
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
                className="w-16 px-2 py-1 rounded-lg bg-[#141A20] border border-[#232B33] text-right text-xs font-mono text-white focus:outline-none focus:border-[#FF5722]"
              />
              <span className="text-[10px] text-neutral-500 font-mono">px</span>
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
              className="w-full accent-[#FF5722] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-neutral-500">
              <span>12px</span>
              <span>Default</span>
              <span>84px</span>
            </div>
          </div>
        </div>

        {/* 3. Font Family Selector (Bangla, English & Arabic) */}
        <div className="space-y-3 pt-4 border-t border-[#232B33]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center space-x-1.5 text-neutral-300 font-bold">
              <Type className="w-3.5 h-3.5 text-[#FF5722]" />
              <span>Font Family</span>
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
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
                  className={`w-full px-3 py-2 rounded-xl border flex items-center justify-between text-xs transition-all text-left ${
                    isSelected
                      ? 'border-[#FF5722] bg-[#FF5722]/15 text-white font-bold'
                      : 'border-[#232B33] bg-[#12161A] text-neutral-300 hover:border-neutral-500 hover:text-white'
                  }`}
                  style={{ fontFamily: f.fontFamily }}
                >
                  <div className="flex items-center space-x-2">
                    <span>{f.label}</span>
                    <span className="text-[10px] font-mono text-neutral-500 bg-[#161C22] px-1.5 py-0.5 rounded border border-[#232B33]">
                      {f.languageSupport}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#FF5722]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Reset Element */}
        <div className="pt-4 border-t border-[#232B33]">
          <button
            type="button"
            onClick={() => resetElementOverride(activeElementId)}
            className="w-full py-2.5 px-3 rounded-xl border border-[#232B33] bg-[#12161A] hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-mono font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
            <span>Reset this element to default</span>
          </button>
        </div>

      </div>

      {/* Footer Info */}
      <div className="px-5 py-3 border-t border-[#232B33] bg-[#12161A]/60 flex items-center justify-between text-[11px] font-mono text-neutral-500">
        <span>Target: {activeElementId}</span>
        <span className="text-[#FF5722]">Instant Live Preview</span>
      </div>

    </div>
  );
};
