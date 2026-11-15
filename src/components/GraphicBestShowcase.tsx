import React, { useState } from 'react';
import { Eye, ExternalLink, Palette } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { ProjectItem } from '../types/portfolio';
import { resolveAssetUrl } from '../utils/assetUrl';
import { normalizeDirectImageUrl } from '../lib/imageUrlResolver';
import { Tilt3DImageStage } from './common/Tilt3DImageStage';
import { Reveal3D } from './common/Reveal3D';
import { StudioGlassIcon } from './common/StudioIcon';

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
    <section id="graphic-best-work" className="py-20 bg-[#121419]/75 border-t border-white/[0.07] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal3D direction="up" className="flex flex-col items-center text-center mb-14">
          <span className="text-[11px] font-sans text-[#9A958C] uppercase tracking-[0.22em] mb-2.5">
            {sectionTag}
          </span>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F4F0E8] tracking-tight">
            {sectionTitle}
          </h2>

          {sectionSubtitle && (
            <p className="mt-3 text-xs sm:text-sm text-[#A7A298] max-w-2xl leading-relaxed">
              {sectionSubtitle}
            </p>
          )}
        </Reveal3D>

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

            const col = idx % 3;
            const dir = col === 0 ? 'tilt-left' : col === 2 ? 'tilt-right' : 'up';

            return (
              <Reveal3D key={keyId} direction={dir} delay={col * 90}>
                <div
                  onClick={() => onOpenLightbox?.(projectItem, 0)}
                  data-cursor="view"
                  className="h-full group relative rounded-[22px] glass-showcase-card overflow-hidden flex flex-col justify-between cursor-pointer hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className="p-2.5 bg-[#0D0E12]/70 border-b border-white/[0.07]">
                    <Tilt3DImageStage className="aspect-[16/10] w-full" maxTilt={13} scaleOnHover={1.03}>
                      <div className="relative w-full h-full rounded-[14px] bg-[#14171E] flex items-center justify-center border border-white/[0.07] overflow-hidden">
                        {cleanUrl && !isBroken ? (
                          <img
                            src={resolveAssetUrl(cleanUrl)}
                            alt={loc(item.title)}
                            referrerPolicy="no-referrer"
                            onError={() => setBrokenIds((prev) => ({ ...prev, [keyId]: true }))}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#14171E] flex flex-col items-center justify-center p-5 text-center">
                            <StudioGlassIcon size="md" className="mb-2">
                              <Palette className="w-4 h-4" strokeWidth={1.35} />
                            </StudioGlassIcon>
                            <span className="text-xs text-[#DDD1BE] font-medium line-clamp-1">
                              {loc(item.title) || `Top Graphic Work #${idx + 1}`}
                            </span>
                            <span className="text-[10px] text-[#8E8A82] mt-0.5">
                              {item.behanceUrl ? 'Open on Behance' : 'Graphic Design'}
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 pointer-events-none">
                          <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-1.5 rounded-full glass-pill-ghost text-xs font-medium">
                            <Eye className="w-3.5 h-3.5" strokeWidth={1.4} />
                            <span>Preview</span>
                          </span>
                        </div>
                      </div>
                    </Tilt3DImageStage>
                  </div>

                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <div className="text-[11px] text-[#8E8A82] mb-1.5 flex items-center gap-2">
                        <span className="text-[#EAE5DC] font-medium">Best Work</span>
                        {item.behanceUrl && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>Behance</span>
                          </>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-[#F4F0E8] group-hover:text-white transition-colors">
                        {loc(item.title) || `Top Graphic Work #${idx + 1}`}
                      </h3>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs">
                      {item.behanceUrl ? (
                        <a
                          href={item.behanceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-[#DDD1BE] hover:text-white font-medium transition-colors"
                        >
                          <span className="font-bold">Bē</span>
                          <span>Behance</span>
                          <ExternalLink className="w-3 h-3" strokeWidth={1.35} />
                        </a>
                      ) : (
                        <span className="text-[#8E8A82]">Visual Design</span>
                      )}

                      <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-[#A7A298] group-hover:text-white transition-colors font-medium">
                        <span>Preview</span>
                        <Eye className="w-3.5 h-3.5" strokeWidth={1.35} />
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal3D>
            );
          })}
        </div>
      </div>
    </section>
  );
};
