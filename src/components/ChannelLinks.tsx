import React from 'react';
import { Youtube, ExternalLink, Folder, Send, Facebook, CheckCircle2 } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Reveal3D } from './common/Reveal3D';
import { StudioGlassIcon } from './common/StudioIcon';

export const ChannelLinks: React.FC = () => {
  const { portfolio, ui, loc } = usePortfolio();
  const { channelLinks } = portfolio;

  const renderIcon = (id: string) => {
    switch (id) {
      case 'ch-youtube':
        return <Youtube className="w-4 h-4" strokeWidth={1.35} />;
      case 'ch-behance':
        return <span className="font-semibold text-xs">Bē</span>;
      case 'ch-facebook':
        return <Facebook className="w-4 h-4" strokeWidth={1.35} />;
      case 'ch-drive':
        return <Folder className="w-4 h-4" strokeWidth={1.35} />;
      case 'ch-telegram':
        return <Send className="w-4 h-4" strokeWidth={1.35} />;
      default:
        return <CheckCircle2 className="w-4 h-4" strokeWidth={1.35} />;
    }
  };

  return (
    <section id="channels" className="py-24 bg-[#121419]/75 border-t border-white/[0.07] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <Reveal3D direction="up" className="flex flex-col items-center text-center mb-16">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F4F0E8] tracking-tight mb-3">
            {ui.channels.title}
          </h2>
          <p className="text-[#A7A298] text-xs sm:text-sm max-w-2xl">
            {ui.channels.subtitle}
          </p>
        </Reveal3D>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {channelLinks.map((item, idx) => {
            const isLinked = item.status === 'LINKED' && Boolean(item.url);
            return (
              <Reveal3D
                key={item.id}
                direction={idx % 2 === 0 ? 'left' : 'right'}
                delay={(idx % 2) * 85}
              >
                <div
                  className={`h-full group glass-showcase-card-muted p-6 rounded-[22px] transition-all ${
                    isLinked
                      ? 'hover:-translate-y-0.5'
                      : 'opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <StudioGlassIcon size="md">
                        {renderIcon(item.id)}
                      </StudioGlassIcon>
                      <div>
                        <h3 className="font-semibold text-base text-[#F4F0E8]">{item.platform}</h3>
                        <span className="text-[11px] text-[#9A958C]">
                          {loc(item.badge)}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-medium ${
                        item.status === 'LINKED'
                          ? 'text-emerald-400'
                          : 'text-[#8E8A82]'
                      }`}
                    >
                      {item.status === 'LINKED' ? ui.channels.linked : ui.channels.unlinked}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#A7A298] leading-relaxed mb-4">
                    {loc(item.description)}
                  </p>

                  {isLinked && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-xs font-medium text-[#EAE5DC] hover:text-white transition-colors"
                    >
                      <span>Visit {item.platform}</span>
                      <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.35} />
                    </a>
                  )}
                </div>
              </Reveal3D>
            );
          })}
        </div>

      </div>
    </section>
  );
};
