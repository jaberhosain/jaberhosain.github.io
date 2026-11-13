import React from 'react';
import { GraduationCap, Award, Video, Palette, Wrench } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useNavigation } from '../context/NavigationContext';
import { resolveAssetUrl } from '../utils/assetUrl';
import { EditableElement } from './common/EditableElement';

const iconMap: Record<string, React.ElementType> = {
  GraduationCap,
  Award,
  Video,
  Palette,
  Wrench
};

export const About: React.FC = () => {
  const { portfolio, ui, loc } = usePortfolio();
  const { navigateTo, isMultiPageEnabled } = useNavigation();
  const { about, overviewCards } = portfolio;

  return (
    <section id="about" className="py-24 bg-[#0B0F12] border-t border-[#1D232A] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main About Me Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          
          {/* Left: Authentic Portrait */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden border border-[#232B33] bg-[#12161A] shadow-xl">
              <img
                src={resolveAssetUrl(about.avatarUrl)}
                alt="MD. Jaber Hossain"
                className="w-full h-full object-cover object-top"
                loading="lazy"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  const fallback = resolveAssetUrl('/assets/jaber_about.png');
                  const secondFallback = resolveAssetUrl('/assets/jabir_profile.png');
                  if (img.src !== fallback && !img.src.endsWith('/assets/jaber_about.png')) {
                    img.src = fallback;
                  } else if (img.src !== secondFallback) {
                    img.src = secondFallback;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F12] via-transparent to-transparent opacity-40" />
            </div>
          </div>

          {/* Right: Bio Text from Website */}
          <div className="lg:col-span-7 flex flex-col items-start text-left rtl:items-start rtl:text-right">
            <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-md bg-[#181E24] border border-[#232B33] text-xs font-mono text-[#FF5722] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722]" />
              <span>{ui.about.sectionTag}</span>
            </div>

            <EditableElement id="about.title" label="About Section Title" as="h2" className="mb-6">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight uppercase font-sans">
                {ui.about.title}
              </span>
            </EditableElement>

            <div className="p-8 rounded-3xl bg-[#12161A] border border-[#232B33] shadow-lg">
              <EditableElement id="about.bio" label="About Bio Paragraph" as="p" className="text-base sm:text-lg text-neutral-300 leading-relaxed">
                {loc(about.bio)}
              </EditableElement>
            </div>
          </div>
        </div>

        {/* Section: WHAT YOU'LL FIND HERE */}
        <div className="pt-8 border-t border-[#1D232A]">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-md bg-[#181E24] border border-[#232B33] text-xs font-mono text-[#FF5722] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722]" />
              <span>EXPLORE MY WORK</span>
            </div>
            <EditableElement id="about.whatYoullFindHere" label="Explore Work Heading" as="h3">
              <span className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-wider">
                {ui.about.whatYoullFindHere}
              </span>
            </EditableElement>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {overviewCards?.map((card) => {
              const Icon = iconMap[card.icon] || Award;
              return (
                <a
                  key={card.id}
                  href={card.linkTarget}
                  onClick={(e) => {
                    if (isMultiPageEnabled) {
                      e.preventDefault();
                      if (card.icon === 'Palette' || card.id === 'ov-4') {
                        navigateTo('design');
                      } else if (card.icon === 'Video' || card.id === 'ov-3') {
                        navigateTo('videos');
                      } else {
                        navigateTo(card.linkTarget);
                      }
                    }
                  }}
                  className="group p-6 rounded-2xl bg-[#12161A] border border-[#232B33] hover:border-[#FF5722]/60 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#181E24] border border-[#232B33] flex items-center justify-center text-[#FF5722] mb-4 group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-white mb-2 group-hover:text-[#FF5722] transition-colors">
                      {loc(card.title)}
                    </h4>

                    <p className="text-xs sm:text-sm text-neutral-400 mb-6 leading-relaxed">
                      {loc(card.description)}
                    </p>
                  </div>

                  <div className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-xs font-semibold text-[#FF5722] group-hover:underline">
                    <span>{loc(card.linkText)}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
