import React from 'react';
import { Eye, ExternalLink, Sparkles } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { ProjectItem } from '../types/portfolio';
import { resolveAssetUrl } from '../utils/assetUrl';
import { Tilt3DImageStage } from './common/Tilt3DImageStage';

interface GraphicBestShowcaseProps {
  onOpenLightbox?: (project: ProjectItem) => void;
  behanceOnly?: boolean;
}

export const GraphicBestShowcase: React.FC<GraphicBestShowcaseProps> = ({
  onOpenLightbox,
  behanceOnly = false
}) => {
  const { portfolio, loc } = usePortfolio();
  const rawItems = portfolio.bestGraphicWorks || [];
  const sectionConfig = portfolio.bestGraphicSection;

  // Filter only visible items (default to true if undefined)
  const visibleItems = rawItems
    .filter((item) => item.visible !== false && (!behanceOnly || Boolean(item.behanceUrl)))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Per rule: "Show each Best Work section on the public website only if it has at least one visible item."
  if (visibleItems.length === 0) {
    return null;
  }

  const sectionTag = loc(sectionConfig?.sectionTag) || 'TOP GRAPHIC DESIGN';
  const sectionTitle = loc(sectionConfig?.title) || 'GRAPHIC DESIGN - BEST WORK';
  const sectionSubtitle = loc(sectionConfig?.subtitle);

  return (
    <section id="graphic-best-work" className="py-24 bg-[#0B0F12] border-t border-[#1D232A] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-md bg-[#181E24] border border-[#232B33] text-xs font-mono text-[#FF5722] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
            <span>{sectionTag}</span>
          </div>

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
            const projectItem: ProjectItem = {
              id: item.id || `best-graphic-${idx}`,
              title: item.title,
              category: 'graphic_best',
              description: { en: '', bn: '', ar: '' },
              coverImage: item.imageUrl,
              behanceUrl: item.behanceUrl,
              order: item.order
            };

            return (
              <div
                key={item.id || idx}
                onClick={() => onOpenLightbox?.(projectItem)}
                className="group relative rounded-3xl bg-[#12161A] border border-[#232B33] hover:border-[#FF5722]/60 overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between cursor-pointer hover:-translate-y-1 hover:shadow-2xl"
              >
                {/* Visual Stage with 3D Cursor-Responsive Tilt */}
                <div className="p-2.5 bg-[#0D1115] border-b border-[#232B33]">
                  <Tilt3DImageStage className="aspect-[16/10] w-full" maxTilt={15} scaleOnHover={1.03}>
                    <div className="relative w-full h-full rounded-2xl bg-[#181E24] flex items-center justify-center border border-[#232B33]/80 overflow-hidden shadow-xl">
                      {item.imageUrl ? (
                        <img
                          src={resolveAssetUrl(item.imageUrl)}
                          alt={loc(item.title)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#141A20] flex items-center justify-center text-neutral-500 text-xs font-mono">
                          No Image Provided
                        </div>
                      )}

                      {/* Badge */}
                      <div className="absolute top-3.5 left-3.5 rtl:left-auto rtl:right-3.5 px-3 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-black/80 text-[#FF5722] border border-[#232B33] z-10 flex items-center space-x-1.5 rtl:space-x-reverse">
                        <Sparkles className="w-3 h-3 text-[#FF5722]" />
                        <span>BEST WORK</span>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2 rtl:space-x-reverse z-10 pointer-events-none">
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
                    <h3 className="text-base sm:text-lg font-bold text-white mb-2 group-hover:text-[#FF5722] transition-colors">
                      {loc(item.title) || `Top Graphic Work #${idx + 1}`}
                    </h3>
                  </div>

                  {/* Action & Metadata Footer */}
                  <div className="mt-4 pt-4 border-t border-[#1D232A] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      {item.behanceUrl && (
                        <span className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 rounded-md bg-[#0057FF]/15 text-[#388BFD] border border-[#0057FF]/30 text-[11px] font-bold">
                          <span>Bē</span>
                          <span>Behance</span>
                        </span>
                      )}
                    </div>

                    <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-neutral-400 group-hover:text-[#FF5722] transition-colors text-xs font-semibold">
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
