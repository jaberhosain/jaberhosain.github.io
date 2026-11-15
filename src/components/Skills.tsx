import React, { useState, useMemo } from 'react';
import { Video, Palette, Sparkles, TrendingUp, Layers, PenTool } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Reveal3D } from './common/Reveal3D';
import { StudioGlassIcon } from './common/StudioIcon';

const iconMap: Record<string, React.ElementType> = {
  Video,
  Palette,
  Sparkles,
  TrendingUp,
  Layers,
  PenTool
};

export const Skills: React.FC = () => {
  const { portfolio, ui, loc, language } = usePortfolio();
  const { skills = [], workflow = [], showWorkflow } = portfolio;
  const [selectedTool, setSelectedTool] = useState<string>('ALL');

  const uniqueTools = useMemo(() => {
    const set = new Set<string>();
    skills.forEach((s) => (s.tools || []).forEach((t) => t && set.add(t)));
    return Array.from(set);
  }, [skills]);

  const filteredSkills = useMemo(() => {
    if (selectedTool === 'ALL') return skills;
    return skills.filter((s) => (s.tools || []).includes(selectedTool));
  }, [skills, selectedTool]);

  return (
    <section id="skills" className="py-24 bg-[#14171E]/80 border-t border-white/[0.07] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <p className="text-[11px] font-sans tracking-[0.22em] uppercase text-[#9A958C] mb-3">
            {ui.skills.sectionTag}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F4F0E8] tracking-tight">
            {ui.skills.title}
          </h2>
        </div>

        {/* Interactive Tool Filter Bar */}
        {uniqueTools.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            <button
              type="button"
              onClick={() => setSelectedTool('ALL')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedTool === 'ALL'
                  ? 'glass-pill-cta font-semibold'
                  : 'glass-pill-ghost'
              }`}
            >
              {language === 'bn' ? 'সব টুলস' : language === 'ar' ? 'كل الأدوات' : 'All Tools'} ({skills.length})
            </button>
            {uniqueTools.map((tool) => (
              <button
                key={tool}
                type="button"
                onClick={() => setSelectedTool((prev) => (prev === tool ? 'ALL' : tool))}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  selectedTool === tool
                    ? 'glass-pill-cta font-semibold'
                    : 'glass-pill-ghost'
                }`}
              >
                {tool}
              </button>
            ))}
          </div>
        )}

        {/* Skill Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          {filteredSkills.map((skill, sIdx) => {
            const Icon = iconMap[skill.icon] || Sparkles;
            return (
              <Reveal3D key={skill.id} direction={sIdx % 2 === 0 ? 'left' : 'right'} delay={(sIdx % 2) * 85}>
                <div className="h-full glass-showcase-card-muted p-7 rounded-[22px] transition-all duration-300 group">
                  <div className="flex items-center space-x-3.5 rtl:space-x-reverse mb-3.5">
                    <StudioGlassIcon size="md">
                      <Icon className="w-4 h-4" strokeWidth={1.35} />
                    </StudioGlassIcon>
                    <h3 className="font-display text-base sm:text-lg font-semibold text-[#F4F0E8] tracking-tight">
                      {loc(skill.title)}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-[#A7A298] mb-5 leading-relaxed">
                    {loc(skill.description)}
                  </p>

                  {/* Interactive Tool Filters */}
                  <div className="flex flex-wrap gap-2">
                    {skill.tools.map((tool, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setSelectedTool((prev) => (prev === tool ? 'ALL' : tool))}
                        className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                          selectedTool === tool
                            ? 'glass-pill-cta font-semibold'
                            : 'glass-pill-ghost'
                        }`}
                      >
                        {tool}
                      </button>
                    ))}
                  </div>
                </div>
              </Reveal3D>
            );
          })}
        </div>

        {/* Section: MY CREATIVE WORKFLOW */}
        {showWorkflow !== false && workflow.length > 0 && (
          <div className="pt-8 border-t border-white/[0.07]">
            <Reveal3D direction="up" className="flex flex-col items-center text-center mb-12">
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F0E8] tracking-tight">
                {ui.workflow.title}
              </h3>
            </Reveal3D>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {workflow.map((item, idx) => (
                <Reveal3D key={item.id || item.step || idx} direction="up" delay={idx * 65}>
                  <div className="h-full glass-showcase-card-muted flex flex-col items-center text-center p-5 rounded-[20px] transition-colors group">
                    <div className="w-11 h-11 rounded-full glass-icon-disc flex items-center justify-center text-xs font-medium mb-3 tabular-nums">
                      {item.step}
                    </div>
                    <div className="font-medium text-sm text-[#F4F0E8]">
                      {loc(item.title)}
                    </div>
                  </div>
                </Reveal3D>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
