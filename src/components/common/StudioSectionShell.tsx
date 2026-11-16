/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useDesignOverrides } from '../../context/DesignOverridesContext';
import { CustomLayerSectionTarget } from '../../types/designOverrides';
import { CustomLayersRenderer } from './CustomLayersRenderer';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { normalizeDirectImageUrl } from '../../lib/imageUrlResolver';

interface StudioSectionShellProps {
  id?: string;
  sectionBgKey: string;
  customLayerTarget?: CustomLayerSectionTarget;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const StudioSectionShell: React.FC<StudioSectionShellProps> = ({
  id,
  sectionBgKey,
  customLayerTarget,
  className = '',
  style = {},
  children
}) => {
  const { sectionBackgrounds } = useDesignOverrides();
  const bg = sectionBackgrounds?.[sectionBgKey];

  const resolvedImg = bg?.imageUrl
    ? resolveAssetUrl(normalizeDirectImageUrl(bg.imageUrl) || bg.imageUrl)
    : '';

  const sectionStyle: React.CSSProperties = {
    ...style,
    ...(bg?.bgColor ? { backgroundColor: bg.bgColor } : {})
  };

  return (
    <section
      id={id}
      className={`relative overflow-x-clip ${className}`.trim()}
      style={sectionStyle}
    >
      {/* Custom Uploaded / Linked Section Background Layer */}
      {resolvedImg && bg?.visible !== false && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <img
            src={resolvedImg}
            alt=""
            className="w-full h-full object-cover object-center transition-all duration-300"
            referrerPolicy="no-referrer"
            style={{
              opacity: bg?.opacity ?? 0.45,
              filter: (bg?.blur ?? 0) > 0 ? `blur(${bg?.blur}px)` : undefined,
              transform: `scale(${bg?.scale ?? 1})`
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: `rgba(11, 12, 15, ${bg?.overlayOpacity ?? 0.52})`
            }}
          />
        </div>
      )}

      {/* Custom Photoshop/Illustrator Canvas Layers scoped to this section */}
      {customLayerTarget && <CustomLayersRenderer sectionTarget={customLayerTarget} />}

      {/* Section Foreground Content */}
      <div className="relative z-10">{children}</div>
    </section>
  );
};
