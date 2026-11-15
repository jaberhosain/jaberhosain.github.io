import React from 'react';
import { GraduationCap, Award, Video, Palette, Wrench } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useNavigation } from '../context/NavigationContext';
import { resolveAssetUrl } from '../utils/assetUrl';
import { normalizeDirectImageUrl } from '../lib/imageUrlResolver';
import { EditableElement } from './common/EditableElement';
import { Tilt3DImageStage } from './common/Tilt3DImageStage';
import { Reveal3D } from './common/Reveal3D';
import { StudioGlassIcon, StudioArrowRight } from './common/StudioIcon';

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
    <section id="about" className="py-24 bg-[#121419]/75 border-t border-white/[0.07] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main About Me Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">

          {/* Left: Authentic Portrait in 3D Stage */}
          <Reveal3D direction="left" className="lg:col-span-5 flex justify-center">
            <Tilt3DImageStage className="w-full max-w-sm aspect-[3/4]" maxTilt={14} scaleOnHover={1.02}>
              <div className="relative w-full h-full rounded-[24px] overflow-hidden glass-showcase-card p-2">
                <div className="relative w-full h-full rounded-[18px] overflow-hidden bg-[#121419]">
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
              </div>
            </Tilt3DImageStage>
          </Reveal3D>

          {/* Right: Bio Text */}
          <Reveal3D direction="right" delay={110} className="lg:col-span-7 flex flex-col items-start text-left rtl:items-start rtl:text-right">
            <div className="text-[11px] font-sans text-[#9A958C] uppercase tracking-[0.22em] mb-3">
              {ui.about.sectionTag}
            </div>

            <EditableElement id="about.title" label="About Section Title" as="h2" className="mb-6">
              <span className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F4F0E8] tracking-tight">
                {ui.about.title}
              </span>
            </EditableElement>

            <div className="p-8 rounded-[24px] glass-showcase-card">
              <EditableElement id="about.bio" label="About Bio Paragraph" as="p" className="text-base sm:text-lg text-[#DDD1BE] leading-relaxed">
                {loc(about.bio)}
              </EditableElement>
            </div>
          </Reveal3D>
        </div>

        {/* Section: WHAT YOU'LL FIND HERE */}
        <div className="pt-8 border-t border-white/[0.07]">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="text-[11px] font-sans text-[#9A958C] uppercase tracking-[0.22em] mb-2.5">
              EXPLORE MY WORK
            </div>
            <EditableElement id="about.whatYoullFindHere" label="Explore Work Heading" as="h3">
              <span className="font-display text-2xl sm:text-3xl font-bold text-[#F4F0E8] tracking-tight">
                {ui.about.whatYoullFindHere}
              </span>
            </EditableElement>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {overviewCards?.map((card, idx) => {
              const Icon = iconMap[card.icon] || Award;
              const col = idx % 3;
              const dir = col === 0 ? 'tilt-left' : col === 2 ? 'tilt-right' : 'up';
              return (
                <Reveal3D key={card.id} direction={dir} delay={col * 85}>
                  <a
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
                    className="h-full group p-6 rounded-[22px] glass-showcase-card-muted hover:-translate-y-1 flex flex-col justify-between transition-all duration-300"
                  >
                    <div>
                      <StudioGlassIcon size="md" className="mb-4">
                        <Icon className="w-4 h-4" strokeWidth={1.35} />
                      </StudioGlassIcon>

                      <h4 className="text-base sm:text-lg font-semibold text-[#F4F0E8] mb-2 group-hover:text-white transition-colors">
                        {loc(card.title)}
                      </h4>

                      <p className="text-xs sm:text-sm text-[#A7A298] mb-6 leading-relaxed">
                        {loc(card.description)}
                      </p>
                    </div>

                    <div className="inline-flex items-center space-x-2 rtl:space-x-reverse text-xs font-medium text-[#EAE5DC] group-hover:text-white">
                      <span>{loc(card.linkText)}</span>
                      <StudioArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </a>
                </Reveal3D>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
