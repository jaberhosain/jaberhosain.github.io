import React from 'react';
import { Video, Palette } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { EditableElement } from './common/EditableElement';
import { Reveal3D } from './common/Reveal3D';
import { StudioGlassIcon, StudioArrowRight } from './common/StudioIcon';

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
    <section id="services" className="py-24 bg-[#121419]/75 border-t border-white/[0.07] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <Reveal3D direction="up" className="flex flex-col items-center text-center mb-16">
          <p className="text-[11px] font-sans tracking-[0.22em] uppercase text-[#9A958C] mb-3">
            {ui.services.sectionTag}
          </p>
          <EditableElement id="services.title" label="Services Section Title" as="h2">
            <span className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F4F0E8] tracking-tight">
              {ui.services.title}
            </span>
          </EditableElement>
        </Reveal3D>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {services.map((service, idx) => {
            const Icon = serviceIcons[service.icon] || Video;
            return (
              <Reveal3D
                key={service.id}
                direction={idx % 2 === 0 ? 'tilt-left' : 'tilt-right'}
                delay={(idx % 2) * 95}
              >
                <div className="h-full glass-showcase-card relative flex flex-col justify-between p-8 sm:p-10 rounded-[24px] transition-all duration-300 hover:-translate-y-1 group overflow-hidden">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <StudioGlassIcon size="lg">
                        <Icon className="w-5 h-5" strokeWidth={1.35} />
                      </StudioGlassIcon>
                      <span className="text-xs font-medium text-[#8E8A82] tabular-nums tracking-widest group-hover:text-[#DDD1BE] transition-colors">
                        {String(idx + 1).padStart(2, '0')} / {String(services.length).padStart(2, '0')}
                      </span>
                    </div>

                    <h3 className="font-display text-xl sm:text-2xl font-bold text-[#F4F0E8] mb-3 group-hover:text-white transition-colors">
                      {loc(service.title)}
                    </h3>

                    <p className="text-sm sm:text-base text-[#A7A298] leading-relaxed mb-6">
                      {loc(service.description)}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#9A958C]">
                    <span className="text-[#DDD1BE] font-medium">Studio Craft</span>
                    <span className="inline-flex items-center gap-1.5 group-hover:text-white transition-colors">
                      <span>Bespoke Production</span>
                      <StudioArrowRight className="w-3.5 h-3.5" />
                    </span>
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
