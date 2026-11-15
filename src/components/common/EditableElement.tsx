/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useDesignOverrides } from '../../context/DesignOverridesContext';

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
  const { isLiveEditMode, activeElementId, selectElement, getElementStyle } = useDesignOverrides();

  const overrideStyle = getElementStyle(id);
  const combinedStyle: React.CSSProperties = {
    ...style,
    ...overrideStyle
  };

  // On Public Site (or when Live Edit is inactive): 
  // Renders cleanly with zero outline, zero click captures, and zero visual artifacts.
  if (!isLiveEditMode) {
    return React.createElement(
      Component,
      {
        className,
        style: combinedStyle
      },
      children
    );
  }

  const isSelected = activeElementId === id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    selectElement(id, label);
  };

  return React.createElement(
    Component,
    {
      className: `relative transition-all duration-150 ${className} ${
        isSelected
          ? 'outline-2 outline-[#E4583B] outline-solid ring-4 ring-[#E4583B]/20 rounded-md z-20'
          : 'outline-1 outline-dashed outline-white/25 hover:outline-2 hover:outline-[#E4583B] hover:outline-dashed rounded-md cursor-pointer'
      }`,
      style: combinedStyle,
      onClick: handleClick,
      title: `Click to edit ${label}`
    },
    <>
      {children}
      {/* Small indicator badge visible only in Live Edit mode when selected */}
      {isSelected && (
        <span className="absolute -top-6 left-0 px-2 py-0.5 rounded text-[11px] font-sans font-semibold bg-[#E4583B] text-white shadow-md z-30 pointer-events-none select-none flex items-center space-x-1 whitespace-nowrap">
          <span>{label}</span>
        </span>
      )}
    </>
  );
};
