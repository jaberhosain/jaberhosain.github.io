import React from 'react';
import { GraduationCap, Award, CheckCircle, Calendar, Sparkles } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { EditableElement } from './common/EditableElement';

export const Experience: React.FC = () => {
  const { portfolio, ui, loc } = usePortfolio();
  const { academicRecords, professionalInstitute, professionalInstitutes } = portfolio;
  const institutes = (professionalInstitutes && professionalInstitutes.length > 0)
    ? professionalInstitutes
    : (professionalInstitute ? [professionalInstitute] : []);

  return (
    <section id="education" className="py-24 bg-[#0B0F12] border-t border-[#1D232A] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-md bg-[#181E24] border border-[#232B33] text-xs font-mono text-[#FF5722] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722]" />
            <span>{ui.education.sectionTag}</span>
          </div>
          <EditableElement id="education.title" label="Education Section Title" as="h2">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight uppercase">
              {ui.education.title}
            </span>
          </EditableElement>
        </div>

        {/* 1. Academic Background */}
        <div className="mb-16">
          <h3 className="text-lg font-mono font-bold text-white uppercase tracking-wider mb-8 flex items-center space-x-2.5 rtl:space-x-reverse">
            <GraduationCap className="w-5 h-5 text-[#FF5722]" />
            <EditableElement id="education.academicTitle" label="Academic Background Heading" as="span">
              {ui.education.academicTitle}
            </EditableElement>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {academicRecords?.map((record) => (
              <div
                key={record.id}
                className="p-6 rounded-2xl bg-[#12161A] border border-[#232B33] hover:border-[#FF5722]/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="year-badge px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/30">
                      {record.year}
                    </span>
                    <span className={`status-badge text-[11px] font-mono font-medium px-2 py-0.5 rounded ${
                      record.status.en === 'Completed'
                        ? 'status-badge-completed text-emerald-400 bg-emerald-950/40 border border-emerald-500/20'
                        : 'status-badge-studying text-amber-400 bg-amber-950/40 border border-amber-500/20'
                    }`}>
                      {loc(record.status)}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-white mb-2">
                    {loc(record.title)}
                  </h4>

                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    {loc(record.description)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Professional Skill Development */}
        {institutes.length > 0 && (
          <div>
            <h3 className="text-lg font-mono font-bold text-white uppercase tracking-wider mb-8 flex items-center space-x-2.5 rtl:space-x-reverse">
              <Award className="w-5 h-5 text-[#FF5722]" />
              <EditableElement id="education.professionalTitle" label="Professional Training Heading" as="span">
                {ui.education.professionalTitle}
              </EditableElement>
            </h3>

            <div className="space-y-8">
              {institutes.map((inst, instIdx) => (
                <div key={inst.id || instIdx} className="p-8 rounded-3xl bg-[#12161A] border border-[#232B33] shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#232B33] gap-4 mb-6">
                    <div>
                      <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                        SKILL TRAINING INSTITUTION
                      </span>
                      <h4 className="text-xl sm:text-2xl font-bold text-white">
                        {loc(inst.institution)}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#181E24] text-neutral-200 border border-[#232B33]">
                        {loc(inst.course)}
                      </span>
                      {inst.batch && (
                        <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#FF5722] text-white">
                          {inst.batch}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Core Competencies Acquired */}
                  {inst.competencies && inst.competencies.length > 0 && (
                    <div className="mb-8">
                      <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block mb-4">
                        {ui.education.competenciesTitle}
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {inst.competencies.map((comp, idx) => (
                          <div key={comp.id || idx} className="p-4 rounded-xl bg-[#181E24] border border-[#232B33]">
                            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                              <CheckCircle className="w-4 h-4 text-[#FF5722]" />
                              <span className="font-bold text-sm text-white">{loc(comp.category)}</span>
                            </div>
                            <div className="text-xs text-neutral-400 pl-6 rtl:pl-0 rtl:pr-6 font-mono">
                              {comp.tools}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom tags */}
                  {(inst.footerTag1 || inst.footerTag2) && (
                    <div className="pt-4 border-t border-[#232B33] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-neutral-400">
                      {inst.footerTag1 && (
                        <span className="flex items-center space-x-1.5 rtl:space-x-reverse">
                          <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
                          <span>{loc(inst.footerTag1)}</span>
                        </span>
                      )}
                      {inst.footerTag2 && (
                        <span className="px-2.5 py-0.5 rounded bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/30 font-semibold">
                          {loc(inst.footerTag2)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
