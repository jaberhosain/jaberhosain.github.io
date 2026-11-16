import React from 'react';
import { GraduationCap, Award, CheckCircle, Sparkles } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { EditableElement } from './common/EditableElement';
import { Reveal3D } from './common/Reveal3D';
import { StudioGlassIcon } from './common/StudioIcon';
import { AsSunnahFoundationLogo, AsSunnahSkillInstituteLogo } from './common/OrganizationLogos';

export const Experience: React.FC = () => {
  const { portfolio, ui, loc } = usePortfolio();
  const { academicRecords, professionalInstitute, professionalInstitutes } = portfolio;
  const institutes = (professionalInstitutes && professionalInstitutes.length > 0)
    ? professionalInstitutes
    : (professionalInstitute ? [professionalInstitute] : []);

  return (
    <section id="education" className="py-24 bg-[#14171E]/80 border-t border-white/[0.07] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <Reveal3D direction="up" className="flex flex-col items-center text-center mb-16">
          <div className="text-[11px] font-sans text-[#9A958C] uppercase tracking-[0.22em] mb-2.5">
            {ui.education.sectionTag}
          </div>
          <EditableElement id="education.title" label="Education Section Title" as="h2">
            <span className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F4F0E8] tracking-tight">
              {ui.education.title}
            </span>
          </EditableElement>
        </Reveal3D>

        {/* 1. Academic Background */}
        <div className="mb-16">
          <h3 className="text-base sm:text-lg font-semibold text-[#F4F0E8] mb-8 flex items-center space-x-3 rtl:space-x-reverse">
            <StudioGlassIcon size="sm">
              <GraduationCap className="w-4 h-4" strokeWidth={1.35} />
            </StudioGlassIcon>
            <EditableElement id="education.academicTitle" label="Academic Background Heading" as="span">
              {ui.education.academicTitle}
            </EditableElement>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {academicRecords?.map((record, recIdx) => (
              <Reveal3D key={record.id} direction={recIdx % 2 === 0 ? 'left' : 'right'} delay={(recIdx % 2) * 90}>
                <div className="h-full p-7 rounded-[22px] glass-showcase-card-muted flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3.5 text-xs text-[#9A958C]">
                      <span className="font-medium text-[#EAE5DC] tabular-nums">
                        {record.year}
                      </span>
                      <span className={`font-medium px-2.5 py-0.5 rounded-full text-[11px] ${
                        !/studying|present|ongoing/i.test(record.status?.en || '')
                          ? 'status-badge-completed text-emerald-300 bg-emerald-950/40 border border-emerald-500/20'
                          : 'status-badge-studying text-amber-300 bg-amber-950/40 border border-amber-500/20'
                      }`}>
                        {loc(record.status)}
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-semibold text-[#F4F0E8] mb-2">
                      {loc(record.title)}
                    </h4>

                    <p className="text-xs sm:text-sm text-[#A7A298] leading-relaxed">
                      {loc(record.description)}
                    </p>
                  </div>
                </div>
              </Reveal3D>
            ))}
          </div>
        </div>

        {/* 2. Professional Skill Development */}
        {institutes.length > 0 && (
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-[#F4F0E8] mb-8 flex items-center space-x-3 rtl:space-x-reverse">
              <StudioGlassIcon size="sm">
                <Award className="w-4 h-4" strokeWidth={1.35} />
              </StudioGlassIcon>
              <EditableElement id="education.professionalTitle" label="Professional Training Heading" as="span">
                {ui.education.professionalTitle}
              </EditableElement>
            </h3>

            <div className="space-y-8">
              {institutes.map((inst, instIdx) => {
                const instText = `${inst.institution?.en || ''} ${inst.institution?.bn || ''}`.toLowerCase();
                const isAsSunnah = instText.includes('sunnah') || instText.includes('সুন্নাহ');

                return (
                <Reveal3D key={inst.id || instIdx} direction="depth" delay={instIdx * 100}>
                  <div className="p-8 rounded-[24px] glass-showcase-card">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/[0.08] gap-4 mb-6">
                    <div>
                      {isAsSunnah && (
                        <div className="flex flex-wrap items-center gap-3 mb-3.5">
                          <AsSunnahSkillInstituteLogo variant="card" />
                          <AsSunnahFoundationLogo variant="card" />
                        </div>
                      )}
                      <span className="text-[11px] text-[#9A958C] uppercase tracking-[0.2em] block mb-1">
                        Skill Training Institution
                      </span>
                      <h4 className="text-xl sm:text-2xl font-bold text-[#F4F0E8]">
                        {loc(inst.institution)}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-medium glass-pill-ghost">
                        {loc(inst.course)}
                      </span>
                      {inst.batch && (
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold glass-pill-cta">
                          {inst.batch}
                        </span>
                      )}
                    </div>
                  </div>

                  {inst.competencies && inst.competencies.length > 0 && (
                    <div className="mb-8">
                      <span className="text-xs uppercase tracking-[0.18em] text-[#9A958C] block mb-4">
                        {ui.education.competenciesTitle}
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {inst.competencies.map((comp, idx) => (
                          <div key={comp.id || idx} className="p-4 rounded-2xl glass-showcase-inner">
                            <div className="flex items-center space-x-2.5 rtl:space-x-reverse mb-1">
                              <CheckCircle className="w-4 h-4 text-[#EAE5DC]" strokeWidth={1.35} />
                              <span className="font-semibold text-sm text-[#F4F0E8]">{loc(comp.category)}</span>
                            </div>
                            <div className="text-xs text-[#A7A298] pl-6 rtl:pl-0 rtl:pr-6">
                              {comp.tools}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(inst.footerTag1 || inst.footerTag2) && (
                    <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-xs text-[#A7A298]">
                      {inst.footerTag1 && (
                        <span className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Sparkles className="w-3.5 h-3.5 text-[#EAE5DC]" strokeWidth={1.35} />
                          <span>{loc(inst.footerTag1)}</span>
                        </span>
                      )}
                      {inst.footerTag2 && (
                        <span className="text-xs font-medium text-[#EAE5DC]">
                          {loc(inst.footerTag2)}
                        </span>
                      )}
                    </div>
                  )}
                  </div>
                </Reveal3D>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
