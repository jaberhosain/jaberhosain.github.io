/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Move, Trash2, RotateCcw, Type } from 'lucide-react';
import { useDesignOverrides } from '../../context/DesignOverridesContext';
import { usePortfolio } from '../../context/PortfolioContext';

interface EditableElementProps {
  id: string;
  label: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const EditableElement: React.FC<EditableElementProps> = ({
  id,
  label,
  as: Component = 'div',
  className = '',
  style = {},
  children
}) => {
  const {
    isLiveEditMode,
    activeElementId,
    selectElement,
    getElementStyle,
    getElementText,
    isElementHidden,
    updateElementOverride,
    hideElement,
    resetElementOverride,
    overrides,
    showHiddenInLiveEdit
  } = useDesignOverrides();
  const { language } = usePortfolio();

  const elRef = useRef<HTMLElement | null>(null);
  const [inlineEditing, setInlineEditing] = useState(false);
  const [inlineValue, setInlineValue] = useState('');

  const hidden = isElementHidden(id);
  const overrideStyle = getElementStyle(id);
  const currentOverride = overrides[id] || {};
  const textOverride = getElementText(id, language);

  // If element is deleted/hidden:
  // On Public site: do not render at all
  // On Live Edit: only show translucent stub when showHiddenInLiveEdit is toggled on
  if (hidden && (!isLiveEditMode || !showHiddenInLiveEdit)) {
    return null;
  }

  const motionClass =
    currentOverride.motionMode === 'slide-up'
      ? 'animate-studio-slide-up'
      : currentOverride.motionMode === 'slide-left'
      ? 'animate-studio-slide-left'
      : currentOverride.motionMode === 'slide-right'
      ? 'animate-studio-slide-right'
      : currentOverride.motionMode === 'float'
      ? 'animate-studio-float'
      : '';

  const combinedStyle: React.CSSProperties = {
    ...style,
    ...overrideStyle,
    ...(hidden && isLiveEditMode ? { opacity: 0.28, filter: 'grayscale(0.9)' } : {})
  };

  const renderedChildren =
    textOverride !== undefined && textOverride !== '' ? textOverride : children;

  // On Public Site (or when Live Edit is inactive):
  if (!isLiveEditMode) {
    return React.createElement(
      Component,
      {
        className: `${className} ${motionClass}`.trim(),
        style: combinedStyle
      },
      renderedChildren
    );
  }

  const isSelected = activeElementId === id;

  const extractVisibleText = (): string => {
    if (textOverride !== undefined) return textOverride;
    if (typeof children === 'string' || typeof children === 'number') {
      return String(children);
    }
    return elRef.current?.innerText?.trim() || '';
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    selectElement(id, label);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    selectElement(id, label);
    setInlineValue(extractVisibleText());
    setInlineEditing(true);
  };

  const commitInlineText = () => {
    setInlineEditing(false);
    const trimmed = inlineValue;
    if (trimmed === '' && textOverride === undefined) return;
    updateElementOverride(id, {
      textOverride: {
        ...(currentOverride.textOverride || {}),
        [language]: trimmed,
        default: currentOverride.textOverride?.default ?? trimmed
      }
    });
  };

  // Drag to move (offsetX, offsetY)
  const handleStartDragMove = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const baseOX = currentOverride.offsetX || 0;
    const baseOY = currentOverride.offsetY || 0;

    const onMove = (ev: PointerEvent) => {
      const dx = Math.round(ev.clientX - startX);
      const dy = Math.round(ev.clientY - startY);
      updateElementOverride(id, {
        offsetX: baseOX + dx,
        offsetY: baseOY + dy
      });
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // Drag corner handle to resize frame width / height
  const handleStartResize = (e: React.PointerEvent, axis: 'both' | 'x' | 'y') => {
    e.stopPropagation();
    e.preventDefault();
    const rect = elRef.current?.getBoundingClientRect();
    const startW =
      typeof currentOverride.width === 'number'
        ? currentOverride.width
        : Math.round(rect?.width || 220);
    const startH =
      typeof currentOverride.height === 'number'
        ? currentOverride.height
        : Math.round(rect?.height || 48);
    const startX = e.clientX;
    const startY = e.clientY;

    const onMove = (ev: PointerEvent) => {
      const patch: Partial<typeof currentOverride> = {};
      if (axis === 'both' || axis === 'x') {
        patch.width = Math.max(40, Math.round(startW + (ev.clientX - startX)));
      }
      if (axis === 'both' || axis === 'y') {
        patch.height = Math.max(24, Math.round(startH + (ev.clientY - startY)));
      }
      updateElementOverride(id, patch);
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return React.createElement(
    Component,
    {
      ref: elRef,
      className: `relative transition-shadow duration-150 ${className} ${motionClass} ${
        isSelected
          ? 'outline-2 outline-[#E4583B] outline-solid ring-4 ring-[#E4583B]/20 rounded-md z-30'
          : 'outline-1 outline-dashed outline-white/25 hover:outline-2 hover:outline-[#E4583B] hover:outline-dashed rounded-md cursor-pointer'
      }`.trim(),
      style: combinedStyle,
      onClick: handleClick,
      onDoubleClick: handleDoubleClick,
      title: `Click to customize "${label}" · Double-click to edit text`
    },
    <>
      {inlineEditing ? (
        <span
          className="inline-block w-full min-w-[140px]"
          onClick={(e) => e.stopPropagation()}
        >
          <textarea
            autoFocus
            rows={2}
            value={inlineValue}
            onChange={(e) => setInlineValue(e.target.value)}
            onBlur={commitInlineText}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                commitInlineText();
              } else if (e.key === 'Escape') {
                setInlineEditing(false);
              }
            }}
            className="w-full px-2 py-1 rounded bg-[#0B0C0F]/95 border border-[#E4583B] text-sm font-sans text-[#F4F0E8] focus:outline-none resize-y"
          />
        </span>
      ) : (
        renderedChildren
      )}

      {/* Selected Floating Action Toolbar & Photoshop Resize Handles */}
      {isSelected && (
        <>
          <span
            onClick={(e) => e.stopPropagation()}
            className="absolute -top-8 left-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-sans font-semibold bg-[#121419] border border-[#E4583B] text-white shadow-xl z-40 select-none whitespace-nowrap"
          >
            <button
              type="button"
              onPointerDown={handleStartDragMove}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#E4583B] text-white cursor-grab active:cursor-grabbing"
              title="Drag to move position freely"
            >
              <Move className="w-3 h-3" />
              <span>{label}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setInlineValue(extractVisibleText());
                setInlineEditing(true);
              }}
              className="p-1 rounded hover:bg-white/10 text-[#F4F0E8] cursor-pointer"
              title="Edit text inline"
            >
              <Type className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resetElementOverride(id);
              }}
              className="p-1 rounded hover:bg-white/10 text-[#A7A298] hover:text-white cursor-pointer"
              title="Reset element overrides"
            >
              <RotateCcw className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                hideElement(id);
              }}
              className="p-1 rounded hover:bg-rose-500/20 text-rose-400 cursor-pointer"
              title="Delete / Hide element"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </span>

          {/* Right edge resize handle */}
          <span
            onPointerDown={(e) => handleStartResize(e, 'x')}
            title="Drag horizontally to resize width"
            className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-5 rounded-sm bg-[#E4583B] border border-white cursor-ew-resize z-40"
          />
          {/* Bottom edge resize handle */}
          <span
            onPointerDown={(e) => handleStartResize(e, 'y')}
            title="Drag vertically to resize height"
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-2.5 rounded-sm bg-[#E4583B] border border-white cursor-ns-resize z-40"
          />
          {/* Bottom-right corner resize handle */}
          <span
            onPointerDown={(e) => handleStartResize(e, 'both')}
            title="Drag corner to resize width & height"
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-sm bg-white border-2 border-[#E4583B] cursor-nwse-resize z-40 shadow"
          />
        </>
      )}
    </>
  );
};
