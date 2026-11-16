/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import {
  Move,
  Trash2,
  Copy,
  Sparkles,
  Film,
  Palette,
  Award,
  Star,
  Zap,
  Play,
  Layers,
  Shield,
  Camera,
  Heart,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import { useDesignOverrides } from '../../context/DesignOverridesContext';
import { CustomCanvasLayer, CustomLayerSectionTarget } from '../../types/designOverrides';

export const BUILTIN_LAYER_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Sparkles,
  Film,
  Palette,
  Award,
  Star,
  Zap,
  Play,
  Layers,
  Shield,
  Camera,
  Heart,
  CheckCircle2,
  ArrowUpRight
};

interface CustomLayersRendererProps {
  sectionTarget: CustomLayerSectionTarget;
}

export const CustomLayersRenderer: React.FC<CustomLayersRendererProps> = ({ sectionTarget }) => {
  const {
    customLayers,
    isLiveEditMode,
    activeLayerId,
    selectLayer,
    updateCustomLayer,
    removeCustomLayer,
    duplicateCustomLayer
  } = useDesignOverrides();

  const containerRef = useRef<HTMLDivElement>(null);

  const layers = (customLayers || []).filter(
    (l) => l.sectionTarget === sectionTarget && l.visible !== false
  );

  if (layers.length === 0) return null;

  const handleDragLayer = (e: React.PointerEvent, layer: CustomCanvasLayer) => {
    if (!isLiveEditMode) return;
    e.stopPropagation();
    e.preventDefault();
    selectLayer(layer.id);

    const parentRect = containerRef.current?.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = layer.x;
    const origY = layer.y;

    const onMove = (ev: PointerEvent) => {
      const w = Math.max(320, parentRect?.width || 1200);
      const dxPct = ((ev.clientX - startX) / w) * 100;
      const dyPx = ev.clientY - startY;
      updateCustomLayer(layer.id, {
        x: Math.max(0, Math.min(92, Number((origX + dxPct).toFixed(1)))),
        y: Math.max(-40, Math.round(origY + dyPx))
      });
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const handleResizeLayer = (e: React.PointerEvent, layer: CustomCanvasLayer) => {
    if (!isLiveEditMode) return;
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const origW = layer.width;
    const origH = layer.height;

    const onMove = (ev: PointerEvent) => {
      updateCustomLayer(layer.id, {
        width: Math.max(48, Math.round(origW + (ev.clientX - startX))),
        height: Math.max(36, Math.round(origH + (ev.clientY - startY)))
      });
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none ${
        sectionTarget === 'global' ? 'fixed inset-0 z-30' : 'absolute inset-0 z-30 overflow-visible'
      }`}
    >
      {layers.map((layer) => {
        const isSelected = isLiveEditMode && activeLayerId === layer.id;
        const BuiltinIcon = layer.iconName ? BUILTIN_LAYER_ICONS[layer.iconName] : null;

        const justifyMap = {
          top: 'flex-start',
          center: 'center',
          bottom: 'flex-end'
        } as const;

        const alignTextMap = {
          left: 'flex-start',
          center: 'center',
          right: 'flex-end'
        } as const;

        const slideClass =
          layer.slideAnimation === 'slide-up'
            ? 'animate-studio-slide-up'
            : layer.slideAnimation === 'slide-left'
            ? 'animate-studio-slide-left'
            : layer.slideAnimation === 'slide-right'
            ? 'animate-studio-slide-right'
            : layer.slideAnimation === 'float'
            ? 'animate-studio-float'
            : '';

        const flexDir =
          layer.iconPosition === 'left'
            ? 'row'
            : layer.iconPosition === 'right'
            ? 'row-reverse'
            : 'column';

        const glassBg =
          layer.bgColor ||
          `rgba(24, 27, 34, ${layer.glassOpacity !== undefined ? layer.glassOpacity : 0.72})`;

        const boxStyle: React.CSSProperties = {
          left: `${layer.x}%`,
          top: `${layer.y}px`,
          width: `${layer.width}px`,
          minHeight: `${layer.height}px`,
          padding: `${layer.padding ?? 14}px`,
          backgroundColor: layer.type === 'text' && !layer.bgColor ? 'transparent' : glassBg,
          border:
            (layer.borderWidth ?? 1) > 0
              ? `${layer.borderWidth ?? 1}px solid ${layer.borderColor || 'rgba(255,255,255,0.16)'}`
              : 'none',
          borderRadius: `${layer.borderRadius ?? 16}px`,
          opacity: layer.opacity ?? 1,
          zIndex: layer.zIndex ?? 30,
          backdropFilter: (layer.glassBlur ?? 10) > 0 ? `blur(${layer.glassBlur ?? 10}px)` : undefined,
          WebkitBackdropFilter: (layer.glassBlur ?? 10) > 0 ? `blur(${layer.glassBlur ?? 10}px)` : undefined,
          filter: (layer.blur ?? 0) > 0 ? `blur(${layer.blur}px)` : undefined,
          boxShadow:
            (layer.shadowIntensity ?? 20) > 0
              ? `0 ${Math.round((layer.shadowIntensity ?? 20) * 0.4)}px ${layer.shadowIntensity ?? 20}px ${layer.shadowColor || 'rgba(0,0,0,0.55)'}`
              : undefined,
          transform: `scale(${layer.scale ?? 1}) rotate(${layer.rotate ?? 0}deg)`,
          display: 'flex',
          flexDirection: flexDir,
          alignItems:
            flexDir === 'column'
              ? alignTextMap[layer.textAlign || 'center']
              : 'center',
          justifyContent:
            flexDir === 'column'
              ? justifyMap[layer.verticalAlign || 'center']
              : alignTextMap[layer.textAlign || 'center'],
          gap: '8px',
          textAlign: layer.textAlign || 'center',
          color: layer.textColor || '#F4F0E8',
          fontFamily: layer.fontFamily ? `"${layer.fontFamily}", sans-serif` : undefined,
          fontSize: layer.fontSize ? `${layer.fontSize}px` : '14px'
        };

        return (
          <div
            key={layer.id}
            style={boxStyle}
            onClick={(e) => {
              if (!isLiveEditMode) return;
              e.stopPropagation();
              selectLayer(layer.id);
            }}
            className={`absolute transition-shadow ${slideClass} ${
              isLiveEditMode
                ? `pointer-events-auto cursor-move ${
                    isSelected
                      ? 'ring-2 ring-[#E4583B] shadow-2xl'
                      : 'outline-1 outline-dashed outline-white/30 hover:outline-[#E4583B]'
                  }`
                : 'pointer-events-auto'
            }`}
            onPointerDown={(e) => {
              if (isLiveEditMode) handleDragLayer(e, layer);
            }}
          >
            {/* Custom uploaded icon OR built-in Lucide icon */}
            {layer.customIconUrl ? (
              <img
                src={layer.customIconUrl}
                alt={layer.name || 'Custom icon'}
                style={{
                  width: `${layer.iconSize ?? 32}px`,
                  height: `${layer.iconSize ?? 32}px`,
                  objectFit: 'contain'
                }}
                className="shrink-0 pointer-events-none select-none"
                referrerPolicy="no-referrer"
              />
            ) : BuiltinIcon ? (
              <BuiltinIcon
                className="shrink-0 pointer-events-none"
                style={{
                  width: `${layer.iconSize ?? 24}px`,
                  height: `${layer.iconSize ?? 24}px`,
                  color: layer.iconColor || '#E4583B'
                }}
              />
            ) : null}

            {/* Layer inner text */}
            {layer.text && (
              <div className="whitespace-pre-wrap leading-snug break-words w-full pointer-events-none select-none">
                {layer.text}
              </div>
            )}

            {/* Live Edit Selection Handles */}
            {isSelected && (
              <>
                <div
                  onPointerDown={(e) => e.stopPropagation()}
                  className="absolute -top-8 left-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[#121419] border border-[#E4583B] text-[10px] font-semibold text-white shadow-xl whitespace-nowrap"
                >
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#E4583B]">
                    <Move className="w-3 h-3" />
                    <span>{layer.name}</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateCustomLayer(layer.id);
                    }}
                    className="p-1 rounded hover:bg-white/10 text-[#EAE5DC] cursor-pointer"
                    title="Duplicate layer"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCustomLayer(layer.id);
                    }}
                    className="p-1 rounded hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                    title="Delete layer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <span
                  onPointerDown={(e) => handleResizeLayer(e, layer)}
                  title="Drag corner to resize box"
                  className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 rounded-sm bg-white border-2 border-[#E4583B] cursor-nwse-resize shadow"
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
