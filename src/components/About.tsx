import React from 'react';
import { GraduationCap, Award, Video, Palette, Wrench } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useNavigation } from '../context/NavigationContext';
import { resolveAssetUrl } from '../utils/assetUrl';
import { normalizeDirectImageUrl } from '../lib/imageUrlResolver';
import { EditableElement } from './common/EditableElement';
import { Tilt3DImageStage } from './common/Tilt3DImageStage';

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
    <section id="about" className="py-24 bg-[#121419]/75 border-t border-[#2B303D] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main About Me Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">

          {/* Left: Authentic Portrait in 3D Stage */}
          <div className="lg:col-span-5 flex justify-center">
            <Tilt3DImageStage className="w-full max-w-sm aspect-[3/4]" maxTilt={14} scaleOnHover={1.02}>
              <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[#2B303D] bg-[#181B22] shadow-2xl">
                <img
                  src={resolveAssetUrl(normalizeDirectImageUrl(about.avatarUrl) || '/assets/jabir_profile.png')}
                  alt="MD. Jaber Hossain"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    const fallback = resolveAssetUrl('/assets/jaber_hero.png');
                    const secondFallback = resolveAssetUrl('/assets/jabir_profile.png');
                    if (img.dataset.fallbackStage === '2') return;
                    if (img.dataset.fallbackStage !== '1') {
                      img.dataset.fallbackStage = '1';
                      img.src = fallback;
                    } else {
                      img.dataset.fallbackStage = '2';
                      img.src = secondFallback;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121419]/60 via-transparent to-transparent" />
              </div>
            </Tilt3DImageStage>
          </div>

          {/* Right: Bio Text */}
          <div className="lg:col-span-7 flex flex-col items-start text-left rtl:items-start rtl:text-right">
            <div className="text-xs font-mono text-[#E4583B] uppercase tracking-[0.2em] mb-3">
              {ui.about.sectionTag}
            </div>

            <EditableElement id="about.title" label="About Section Title" as="h2" className="mb-6">
              <span className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F4F0E8] tracking-tight">
                {ui.about.title}
              </span>
            </EditableElement>

            <div className="p-8 rounded-2xl studio-card">
              <EditableElement id="about.bio" label="About Bio Paragraph" as="p" className="text-base sm:text-lg text-[#DDD1BE] leading-relaxed">
                {loc(about.bio)}
              </EditableElement>
            </div>
          </div>
        </div>

        {/* Section: WHAT YOU'LL FIND HERE */}
        <div className="pt-8 border-t border-[#2B303D]">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="text-xs font-mono text-[#E4583B] uppercase tracking-[0.2em] mb-2.5">
              EXPLORE MY WORK
            </div>
            <EditableElement id="about.whatYoullFindHere" label="Explore Work Heading" as="h3">
              <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#F4F0E8] tracking-tight">
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
                  className="group p-6 rounded-2xl studio-card hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-11 h-11 rounded-lg bg-[#20242E] border border-[#2B303D] flex items-center justify-center text-[#E4583B] mb-4 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-[#F4F0E8] mb-2 group-hover:text-[#E4583B] transition-colors">
                      {loc(card.title)}
                    </h4>

                    <p className="text-xs sm:text-sm text-[#A7A298] mb-6 leading-relaxed">
                      {loc(card.description)}
                    </p>
                  </div>

                  <div className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-xs font-semibold text-[#E4583B] group-hover:underline">
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
