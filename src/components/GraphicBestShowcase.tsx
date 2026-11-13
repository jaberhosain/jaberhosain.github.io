import React, { useState } from 'react';
import { Eye, ExternalLink, Palette } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { ProjectItem } from '../types/portfolio';
import { resolveAssetUrl } from '../utils/assetUrl';
import { normalizeDirectImageUrl } from '../lib/imageUrlResolver';
import { Tilt3DImageStage } from './common/Tilt3DImageStage';

interface GraphicBestShowcaseProps {
  onOpenLightbox?: (project: ProjectItem, initialIndex?: number) => void;
  behanceOnly?: boolean;
}

export const GraphicBestShowcase: React.FC<GraphicBestShowcaseProps> = ({
  onOpenLightbox,
  behanceOnly = false
}) => {
  const { portfolio, loc } = usePortfolio();
  const [brokenIds, setBrokenIds] = useState<Record<string, boolean>>({});
  const rawItems = portfolio.bestGraphicWorks || [];
  const sectionConfig = portfolio.bestGraphicSection;

  // Filter only visible items (default to true if undefined)
  const visibleItems = rawItems
    .filter((item) => item.visible !== false && (!behanceOnly || Boolean(item.behanceUrl)))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (visibleItems.length === 0) {
    return null;
  }

  const sectionTag = loc(sectionConfig?.sectionTag) || 'TOP GRAPHIC DESIGN';
  const sectionTitle = loc(sectionConfig?.title) || 'GRAPHIC DESIGN - BEST WORK';
  const sectionSubtitle = loc(sectionConfig?.subtitle);

  return (
    <section id="graphic-best-work" className="py-20 bg-[#0B0F12] border-t border-[#1D232A] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-14">
          <span className="text-xs font-mono text-[#FF5722] uppercase tracking-widest mb-2.5">
            {sectionTag}
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight uppercase">
            {sectionTitle}
          </h2>

          {sectionSubtitle && (
            <p className="mt-3 text-xs sm:text-sm text-neutral-400 max-w-2xl font-mono leading-relaxed">
              {sectionSubtitle}
            </p>
          )}
        </div>

        {/* Works Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleItems.map((item, idx) => {
            const keyId = item.id || `best-graphic-${idx}`;
            const cleanUrl = normalizeDirectImageUrl(item.imageUrl);
            const isBroken = brokenIds[keyId];

            const projectItem: ProjectItem = {
              id: keyId,
              title: item.title,
              category: 'graphic_best',
              description: { en: '', bn: '', ar: '' },
              coverImage: cleanUrl,
              behanceUrl: item.behanceUrl,
              order: item.order
            };

            return (
              <div
                key={keyId}
                onClick={() => onOpenLightbox?.(projectItem, 0)}
                className="group relative rounded-3xl bg-[#12161A] border border-[#232B33] hover:border-[#FF5722]/60 overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between cursor-pointer hover:-translate-y-1"
              >
                {/* Visual Stage with 3D Cursor-Responsive Tilt */}
                <div className="p-2.5 bg-[#0D1115] border-b border-[#232B33]">
                  <Tilt3DImageStage className="aspect-[16/10] w-full" maxTilt={14} scaleOnHover={1.03}>
                    <div className="relative w-full h-full rounded-2xl bg-[#181E24] flex items-center justify-center border border-[#232B33]/80 overflow-hidden shadow-xl">
                      {cleanUrl && !isBroken ? (
                        <img
                          src={resolveAssetUrl(cleanUrl)}
                          alt={loc(item.title)}
                          referrerPolicy="no-referrer"
                          onError={() => setBrokenIds((prev) => ({ ...prev, [keyId]: true }))}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#141A20] via-[#12161A] to-[#0B0F12] flex flex-col items-center justify-center p-5 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-[#181E24] border border-[#232B33] flex items-center justify-center text-[#FF5722] mb-2">
                            <Palette className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-mono text-neutral-300 font-semibold line-clamp-1">
                            {loc(item.title) || `Top Graphic Work #${idx + 1}`}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500 mt-0.5">
                            {item.behanceUrl ? 'Open on Behance' : 'Graphic Design'}
                          </span>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 pointer-events-none">
                        <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-xl bg-black/85 border border-[#FF5722]/60 text-white text-xs font-mono font-medium shadow-xl">
                          <Eye className="w-4 h-4 text-[#FF5722]" />
                          <span>Preview in Lightbox</span>
                        </span>
                      </div>
                    </div>
                  </Tilt3DImageStage>
                </div>

                {/* Card Body */}
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <div className="text-[11px] font-mono text-neutral-400 mb-1.5 flex items-center gap-2">
                      <span className="text-[#FF7043] uppercase tracking-wider font-semibold">Best Work</span>
                      {item.behanceUrl && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Behance</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#FF5722] transition-colors">
                      {loc(item.title) || `Top Graphic Work #${idx + 1}`}
                    </h3>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-[#1D232A] flex items-center justify-between text-xs font-mono">
                    {item.behanceUrl ? (
                      <a
                        href={item.behanceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-[#60A5FA] hover:text-white font-semibold transition-colors"
                      >
                        <span className="font-bold">Bē</span>
                        <span>Behance</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-neutral-500">Visual Design</span>
                    )}

                    <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-neutral-400 group-hover:text-[#FF5722] transition-colors font-semibold">
                      <span>Preview</span>
                      <Eye className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
