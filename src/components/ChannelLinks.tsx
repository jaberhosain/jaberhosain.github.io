import React from 'react';
import { Youtube, ExternalLink, Folder, Send, Facebook, CheckCircle2 } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export const ChannelLinks: React.FC = () => {
  const { portfolio, ui, loc } = usePortfolio();
  const { channelLinks } = portfolio;

  const renderIcon = (id: string) => {
    switch (id) {
      case 'ch-youtube':
        return <Youtube className="w-5 h-5 text-[#FF0000]" />;
      case 'ch-behance':
        return <span className="font-bold text-sm text-[#0057FF]">Bē</span>;
      case 'ch-facebook':
        return <Facebook className="w-5 h-5 text-[#1877F2]" />;
      case 'ch-drive':
        return <Folder className="w-5 h-5 text-amber-400" />;
      case 'ch-telegram':
        return <Send className="w-5 h-5 text-[#229ED9]" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-[#FF5722]" />;
    }
  };

  return (
    <section id="channels" className="py-24 bg-[#0B0F12] border-t border-[#1D232A] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight uppercase mb-3">
            {ui.channels.title}
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm max-w-2xl font-mono">
            {ui.channels.subtitle}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {channelLinks.map((item) => {
            const isLinked = item.status === 'LINKED' && Boolean(item.url);
            return (
              <div
                key={item.id}
                className={`p-6 rounded-2xl bg-[#12161A] border transition-all ${
                  isLinked
                    ? 'border-[#232B33] hover:border-[#FF5722]/60 hover:shadow-xl'
                    : 'border-[#1D232A] opacity-80'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-10 h-10 rounded-xl bg-[#181E24] border border-[#232B33] flex items-center justify-center">
                      {renderIcon(item.id)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">{item.platform}</h3>
                      <span className="text-[10px] font-mono font-bold tracking-wider text-[#FF5722] uppercase">
                        {loc(item.badge)}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                      item.status === 'LINKED'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                        : 'bg-[#181E24] text-neutral-500 border border-[#232B33]'
                    }`}
                  >
                    {item.status === 'LINKED' ? ui.channels.linked : ui.channels.unlinked}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-4">
                  {loc(item.description)}
                </p>

                {isLinked && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-xs font-semibold text-[#FF5722] hover:underline"
                  >
                    <span>Visit {item.platform}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
