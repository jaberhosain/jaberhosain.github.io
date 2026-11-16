import React from 'react';
import { Sparkles, Share2, Monitor, Cpu } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { AsSunnahSkillInstituteLogo } from './OrganizationLogos';

interface ToolMarqueeItem {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

/**
 * Floating 3D horizontal marquee strip directly below the Hero stage.
 * Showcases core creative software, AI tools, social media, IT & computer operations.
 */
export const StudioSkillMarquee3D: React.FC = () => {
  const { language } = usePortfolio();

  const items: ToolMarqueeItem[] = [
    {
      id: 'premiere',
      label: 'Premiere Pro',
      sublabel: language === 'bn' ? 'ভিডিও এডিটিং' : 'Video Editing',
      icon: (
        <span className="w-8 h-8 rounded-lg bg-[#00005B] border border-[#9999FF]/50 text-[#9999FF] font-display font-extrabold text-xs flex items-center justify-center shadow-[0_6px_14px_-4px_rgba(0,0,91,0.55)]">
          Pr
        </span>
      )
    },
    {
      id: 'after-effects',
      label: 'After Effects',
      sublabel: language === 'bn' ? 'মোশন গ্রাফিক্স' : 'Motion Graphics',
      icon: (
        <span className="w-8 h-8 rounded-lg bg-[#00005B] border border-[#C084FC]/50 text-[#C084FC] font-display font-extrabold text-xs flex items-center justify-center shadow-[0_6px_14px_-4px_rgba(88,28,135,0.45)]">
          Ae
        </span>
      )
    },
    {
      id: 'photoshop',
      label: 'Photoshop',
      sublabel: language === 'bn' ? 'কম্পোজিটিং ও থাম্বনেইল' : 'Visual Compositing',
      icon: (
        <span className="w-8 h-8 rounded-lg bg-[#001E36] border border-[#31A8FF]/50 text-[#31A8FF] font-display font-extrabold text-xs flex items-center justify-center shadow-[0_6px_14px_-4px_rgba(0,30,54,0.5)]">
          Ps
        </span>
      )
    },
    {
      id: 'illustrator',
      label: 'Illustrator',
      sublabel: language === 'bn' ? 'ব্র্যান্ড ও ভেক্টর' : 'Vector & Brand',
      icon: (
        <span className="w-8 h-8 rounded-lg bg-[#330000] border border-[#FF9A00]/55 text-[#FF9A00] font-display font-extrabold text-xs flex items-center justify-center shadow-[0_6px_14px_-4px_rgba(124,45,18,0.45)]">
          Ai
        </span>
      )
    },
    {
      id: 'ai-tools',
      label: language === 'bn' ? 'এআই ওয়ার্কফ্লো' : 'AI Workflows',
      sublabel: language === 'bn' ? 'জেনারেটিভ এআই' : 'Smart Automation',
      icon: (
        <span className="w-8 h-8 rounded-lg bg-[#102A2E] border border-emerald-400/40 text-emerald-400 flex items-center justify-center shadow-[0_6px_14px_-4px_rgba(16,185,129,0.35)]">
          <Sparkles className="w-4 h-4" strokeWidth={1.75} />
        </span>
      )
    },
    {
      id: 'social-media',
      label: language === 'bn' ? 'সোশ্যাল মিডিয়া' : 'Social Media',
      sublabel: language === 'bn' ? 'মেটা অ্যাডস ও ব্র্যান্ডিং' : 'Meta Ads & Growth',
      icon: (
        <span className="w-8 h-8 rounded-lg bg-[#0F294A] border border-sky-400/45 text-sky-400 flex items-center justify-center shadow-[0_6px_14px_-4px_rgba(14,165,233,0.35)]">
          <Share2 className="w-4 h-4" strokeWidth={1.75} />
        </span>
      )
    },
    {
      id: 'computer-op',
      label: language === 'bn' ? 'কম্পিউটার অপারেটর' : 'Computer Operator',
      sublabel: language === 'bn' ? 'MS অফিস ও ডেটা' : 'MS Office & Data',
      icon: (
        <span className="w-8 h-8 rounded-lg bg-[#2A1B12] border border-orange-400/45 text-orange-400 flex items-center justify-center shadow-[0_6px_14px_-4px_rgba(234,88,12,0.35)]">
          <Monitor className="w-4 h-4" strokeWidth={1.75} />
        </span>
      )
    },
    {
      id: 'it-systems',
      label: language === 'bn' ? 'আইটি ও টেক সাপোর্ট' : 'IT & Tech Ops',
      sublabel: language === 'bn' ? 'উইন্ডোজ · ম্যাক · লিনাক্স' : 'Win · macOS · Linux',
      icon: (
        <span className="w-8 h-8 rounded-lg bg-[#1E222B] border border-slate-400/35 text-slate-200 flex items-center justify-center shadow-[0_6px_14px_-4px_rgba(15,23,42,0.45)]">
          <Cpu className="w-4 h-4" strokeWidth={1.75} />
        </span>
      )
    },
    {
      id: 'assunnah-skill',
      label: 'As-Sunnah Skill Dev.',
      sublabel: language === 'bn' ? 'প্র্যাকটিক্যাল ট্রেনিং' : 'Certified Institute',
      icon: <AsSunnahSkillInstituteLogo variant="compact" />
    }
  ];

  return (
    <section
      aria-label={language === 'bn' ? 'কাজের ক্ষেত্র ও টুলস' : 'Core Tools & Creative Stack'}
      className="studio-marquee-bar relative z-20 border-y py-5 overflow-hidden select-none"
    >
      <div className="max-w-[1440px] mx-auto relative">
        {/* Soft left & right edge fade */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 z-10 bg-gradient-to-r from-[var(--brand-black)] to-transparent opacity-80"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 z-10 bg-gradient-to-l from-[var(--brand-black)] to-transparent opacity-80"
        />

        <div className="animate-marquee flex items-center gap-4 sm:gap-6 px-3">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-4 sm:gap-6">
              {items.map((item, idx) => (
                <div
                  key={`${dup}-${item.id}`}
                  className="animate-float-3d editorial-card-surface group inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-transform duration-300 hover:-translate-y-1 shrink-0"
                  style={{
                    animationDelay: `${(idx % 5) * 0.45}s`
                  }}
                >
                  <div className="transition-transform duration-300 group-hover:scale-110">
                    {item.icon}
                  </div>
                  <div className="text-left rtl:text-right">
                    <div className="text-xs sm:text-[13px] font-bold text-[#F4F0E8] leading-tight whitespace-nowrap">
                      {item.label}
                    </div>
                    <div className="text-[10px] font-medium text-[#9A958C] leading-tight mt-0.5 whitespace-nowrap">
                      {item.sublabel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
