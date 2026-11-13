import React, { useState, useMemo } from 'react';
import { Video, Palette, Sparkles, TrendingUp, Layers, PenTool } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

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
    <section id="skills" className="py-24 bg-[#0B0F12] border-t border-[#1D232A] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-md bg-[#181E24] border border-[#232B33] text-xs font-mono text-[#FF5722] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722]" />
            <span>{ui.skills.sectionTag}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight uppercase">
            {ui.skills.title}
          </h2>
        </div>

        {/* Interactive Tool Filter Bar (computed strictly from real skills[].tools) */}
        {uniqueTools.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            <button
              type="button"
              onClick={() => setSelectedTool('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                selectedTool === 'ALL'
                  ? 'bg-[#FF5722] text-white'
                  : 'bg-[#12161A] border border-[#232B33] text-neutral-400 hover:text-white'
              }`}
            >
              {language === 'bn' ? 'সব টুলস' : language === 'ar' ? 'كل الأدوات' : 'All Tools'} ({skills.length})
            </button>
            {uniqueTools.map((tool) => (
              <button
                key={tool}
                type="button"
                onClick={() => setSelectedTool((prev) => (prev === tool ? 'ALL' : tool))}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedTool === tool
                    ? 'bg-[#FF5722] text-white'
                    : 'bg-[#12161A] border border-[#232B33] text-neutral-400 hover:text-white'
                }`}
              >
                {tool}
              </button>
            ))}
          </div>
        )}

        {/* Skill Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          {filteredSkills.map((skill) => {
            const Icon = iconMap[skill.icon] || Sparkles;
            return (
              <div
                key={skill.id}
                className="p-6 rounded-2xl bg-[#12161A] border border-[#232B33] hover:border-[#FF5722]/60 transition-all duration-300 hover:shadow-xl group"
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#181E24] border border-[#232B33] flex items-center justify-center text-[#FF5722] group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide">
                    {loc(skill.title)}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-neutral-400 mb-5 leading-relaxed">
                  {loc(skill.description)}
                </p>

                {/* Tool Badges */}
                <div className="flex flex-wrap gap-2">
                  {skill.tools.map((tool, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setSelectedTool((prev) => (prev === tool ? 'ALL' : tool))}
                      className={`px-3 py-1 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
                        selectedTool === tool
                          ? 'bg-[#FF5722]/20 text-[#FF5722] border-[#FF5722]'
                          : 'bg-[#181E24] text-neutral-200 border-[#232B33] group-hover:border-[#FF5722]/30'
                      }`}
                    >
                      {tool}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Section: MY CREATIVE WORKFLOW */}
        {showWorkflow !== false && workflow.length > 0 && (
          <div className="pt-8 border-t border-[#1D232A]">
            <div className="flex flex-col items-center text-center mb-12">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-wider">
                {ui.workflow.title}
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {workflow.map((item, idx) => (
                <div
                  key={item.id || item.step || idx}
                  className="flex flex-col items-center text-center p-5 rounded-2xl bg-[#12161A] border border-[#232B33] hover:border-[#FF5722] transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-[#181E24] border-2 border-[#FF5722] flex items-center justify-center text-sm font-mono font-bold text-[#FF5722] mb-3 shadow-md">
                    {item.step}
                  </div>
                  <div className="font-bold text-sm text-white">
                    {loc(item.title)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
