import React from 'react';
import { Video, Palette } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { EditableElement } from './common/EditableElement';

const serviceIcons: Record<string, React.ElementType> = {
  Video,
  Palette
};

export const Services: React.FC = () => {
  const { portfolio, ui, loc } = usePortfolio();
  const services = portfolio.services || [];

  if (services.length === 0) {
    return null;
  }

  return (
    <section id="services" className="py-24 bg-[#0B0F12] border-t border-[#1D232A] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-md bg-[#181E24] border border-[#232B33] text-xs font-mono text-[#FF5722] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722]" />
            <span>{ui.services.sectionTag}</span>
          </div>
          <EditableElement id="services.title" label="Services Section Title" as="h2">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight uppercase">
              {ui.services.title}
            </span>
          </EditableElement>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {services.map((service, idx) => {
            const Icon = serviceIcons[service.icon] || Video;
            return (
              <div
                key={service.id}
                className="relative flex flex-col justify-between p-8 sm:p-10 rounded-3xl bg-[#12161A] border border-[#232B33] hover:border-[#FF5722]/60 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group overflow-hidden"
              >
                {/* Background ambient number watermark */}
                <div className="absolute top-4 right-6 text-6xl font-black font-mono text-white/[0.03] select-none pointer-events-none group-hover:text-[#FF5722]/[0.08] transition-colors">
                  {String(idx + 1).padStart(2, '0')}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#181E24] border border-[#232B33] flex items-center justify-center text-[#FF5722] shadow-md group-hover:scale-105 group-hover:border-[#FF5722]/40 transition-all">
                      <Icon className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-widest group-hover:text-[#FF7043] transition-colors">
                      {String(idx + 1).padStart(2, '0')} / {String(services.length).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-[#FF5722] transition-colors">
                    {loc(service.title)}
                  </h3>

                  <p className="text-sm sm:text-base text-neutral-300 leading-relaxed mb-6">
                    {loc(service.description)}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#1D232A] flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span className="text-[#FF7043] font-semibold">CUSTOM CRAFTED</span>
                  <span className="text-neutral-500 group-hover:text-white transition-colors">NO TEMPLATES →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
