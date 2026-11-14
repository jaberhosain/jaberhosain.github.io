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
    <section id="services" className="py-24 bg-[#121419]/75 border-t border-[#2B303D] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <p className="text-[11px] font-mono tracking-[0.22em] uppercase text-[#E4583B] mb-3">
            {ui.services.sectionTag}
          </p>
          <EditableElement id="services.title" label="Services Section Title" as="h2">
            <span className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F4F0E8] tracking-tight uppercase">
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
                className="studio-card relative flex flex-col justify-between p-8 sm:p-10 rounded-3xl hover:border-[#E4583B]/55 transition-all duration-300 hover:-translate-y-1 group overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#20242E] border border-[#2B303D] flex items-center justify-center text-[#E4583B] group-hover:scale-105 group-hover:border-[#E4583B]/45 transition-all">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#A7A298] uppercase tracking-widest group-hover:text-[#DDD1BE] transition-colors">
                      {String(idx + 1).padStart(2, '0')} / {String(services.length).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#F4F0E8] mb-3 group-hover:text-[#E4583B] transition-colors">
                    {loc(service.title)}
                  </h3>

                  <p className="text-sm sm:text-base text-[#A7A298] leading-relaxed mb-6">
                    {loc(service.description)}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#2B303D] flex items-center justify-between text-[11px] font-mono text-[#A7A298] uppercase tracking-wider">
                  <span className="text-[#DDD1BE] font-semibold">Studio Craft</span>
                  <span className="group-hover:text-[#F4F0E8] transition-colors">Bespoke Production →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
