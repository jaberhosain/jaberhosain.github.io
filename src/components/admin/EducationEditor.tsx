import React, { useState } from 'react';
import { GraduationCap, Award, Plus, Trash2, ArrowUp, ArrowDown, Sparkles, CheckCircle } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { AcademicRecord, ProfessionalInstitute, InstituteCompetency } from '../../types/portfolio';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface EducationEditorProps {
  activeSection?: 'all' | 'academic' | 'professional';
}

export const EducationEditor: React.FC<EducationEditorProps> = ({ activeSection = 'all' }) => {
  const { draftPortfolio, updateDraft } = usePortfolio();
  const { academicRecords = [] } = draftPortfolio;

  const institutes: ProfessionalInstitute[] = (draftPortfolio.professionalInstitutes && draftPortfolio.professionalInstitutes.length > 0)
    ? draftPortfolio.professionalInstitutes
    : (draftPortfolio.professionalInstitute ? [draftPortfolio.professionalInstitute] : []);

  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'academic' | 'institute';
    id: string;
    title: string;
  } | null>(null);

  const handleAddAcademic = () => {
    const newRecord: AcademicRecord = {
      id: 'acad-' + Date.now(),
      title: { en: 'New Academic Qualification', bn: 'নতুন শিক্ষাগত যোগ্যতা', ar: 'مؤهل أكاديمي جديد' },
      year: '2024',
      status: { en: 'Completed', bn: 'সম্পন্ন', ar: 'مكتمل' },
      description: { en: 'Institution and group / major details', bn: 'প্রতিষ্ঠান এবং বিভাগ বিবরণ', ar: 'تفاصيل المؤسسة والتخصص' }
    };
    updateDraft(prev => ({
      ...prev,
      academicRecords: [...(prev.academicRecords || []), newRecord]
    }));
  };

  const handleRemoveAcademic = (id: string) => {
    updateDraft(prev => ({
      ...prev,
      academicRecords: (prev.academicRecords || []).filter(r => r.id !== id)
    }));
  };

  const handleAddInstitute = () => {
    const newInst: ProfessionalInstitute = {
      id: 'inst-' + Date.now(),
      institution: {
        en: 'New Training Institute',
        bn: 'নতুন ট্রেনিং ইনস্টিটিউট',
        ar: 'معهد تدريب جديد'
      },
      course: {
        en: 'Professional Course Name',
        bn: 'প্রফেশনাল কোর্স নাম',
        ar: 'اسم الدورة التدريبية'
      },
      batch: 'Batch 01',
      competencies: [
        {
          id: 'comp-' + Date.now(),
          category: { en: 'Core Skill', bn: 'মূল দক্ষতা', ar: 'المهارة الأساسية' },
          tools: 'Software & Tools'
        }
      ],
      footerTag1: {
        en: 'Hands-on Real Project Execution',
        bn: 'হাতে-কলমে বাস্তব প্রজেক্ট সম্পাদন',
        ar: 'تنفيذ عملي لمشاريع حقيقية'
      },
      footerTag2: {
        en: 'Industry Ready',
        bn: 'ইন্ডাস্ট্রি রেডি',
        ar: 'جاهزية لسوق العمل'
      },
      order: institutes.length + 1
    };

    const nextInstitutes = [...institutes, newInst];
    updateDraft(prev => ({
      ...prev,
      professionalInstitutes: nextInstitutes,
      professionalInstitute: nextInstitutes[0]
    }));
  };

  const handleRemoveInstitute = (id: string) => {
    const nextInstitutes = institutes.filter(inst => inst.id !== id);
    updateDraft(prev => ({
      ...prev,
      professionalInstitutes: nextInstitutes,
      professionalInstitute: nextInstitutes[0] || undefined
    }));
  };

  const handleMoveInstitute = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= institutes.length) return;

    const nextInstitutes = [...institutes];
    const temp = nextInstitutes[idx];
    nextInstitutes[idx] = nextInstitutes[targetIdx];
    nextInstitutes[targetIdx] = temp;

    updateDraft(prev => ({
      ...prev,
      professionalInstitutes: nextInstitutes,
      professionalInstitute: nextInstitutes[0]
    }));
  };

  const handleUpdateInstitute = (id: string, updater: (inst: ProfessionalInstitute) => ProfessionalInstitute) => {
    const nextInstitutes = institutes.map(inst => (inst.id === id ? updater(inst) : inst));
    updateDraft(prev => ({
      ...prev,
      professionalInstitutes: nextInstitutes,
      professionalInstitute: nextInstitutes[0]
    }));
  };

  const handleAddCompetency = (instId: string) => {
    handleUpdateInstitute(instId, inst => ({
      ...inst,
      competencies: [
        ...(inst.competencies || []),
        {
          id: 'comp-' + Date.now(),
          category: { en: 'New Competency', bn: 'নতুন দক্ষতা', ar: 'مهارة جديدة' },
          tools: 'Tool 1, Tool 2'
        }
      ]
    }));
  };

  const handleRemoveCompetency = (instId: string, compIdx: number) => {
    handleUpdateInstitute(instId, inst => ({
      ...inst,
      competencies: (inst.competencies || []).filter((_, i) => i !== compIdx)
    }));
  };

  const handleMoveCompetency = (instId: string, compIdx: number, direction: 'up' | 'down') => {
    handleUpdateInstitute(instId, inst => {
      const targetIdx = direction === 'up' ? compIdx - 1 : compIdx + 1;
      if (targetIdx < 0 || targetIdx >= (inst.competencies || []).length) return inst;
      const comps = [...inst.competencies];
      const temp = comps[compIdx];
      comps[compIdx] = comps[targetIdx];
      comps[targetIdx] = temp;
      return { ...inst, competencies: comps };
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 1. Academic Background */}
      {(activeSection === 'all' || activeSection === 'academic') && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-9 h-9 rounded-lg bg-[#171A21] border border-white/[0.08] flex items-center justify-center text-[#E4583B]">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white tracking-tight">Academic Records</h3>
                <p className="text-xs text-neutral-400">
                  Manage academic qualifications, board examinations, and years
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddAcademic}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#E4583B] hover:bg-[#D0492D] text-xs font-medium text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Record</span>
            </button>
          </div>

          <div className="space-y-4">
            {academicRecords.map((rec, idx) => (
              <div key={rec.id || idx} className="p-4 sm:p-5 rounded-xl bg-[#171A21] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#E4583B] tabular-nums">Record #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ type: 'academic', id: rec.id, title: rec.title?.en || `Record #${idx + 1}` })}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors"
                    title="Delete Academic Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">Year / Session</label>
                    <input
                      type="text"
                      value={rec.year}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          academicRecords: (prev.academicRecords || []).map(r => r.id === rec.id ? { ...r, year: val } : r)
                        }));
                      }}
                      placeholder="e.g. 2021 - 2022"
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">Status (English)</label>
                    <input
                      type="text"
                      value={rec.status?.en || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          academicRecords: (prev.academicRecords || []).map(r => r.id === rec.id ? { ...r, status: { ...(r.status || { en: '', bn: '', ar: '' }), en: val } } : r)
                        }));
                      }}
                      placeholder="e.g. Completed"
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
                    />
                  </div>
                </div>

                {/* Title Translations */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">Title (English)</label>
                    <input
                      type="text"
                      value={rec.title?.en || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          academicRecords: (prev.academicRecords || []).map(r => r.id === rec.id ? { ...r, title: { ...(r.title || { en: '', bn: '', ar: '' }), en: val } } : r)
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">Title (বাংলা)</label>
                    <input
                      type="text"
                      value={rec.title?.bn || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          academicRecords: (prev.academicRecords || []).map(r => r.id === rec.id ? { ...r, title: { ...(r.title || { en: '', bn: '', ar: '' }), bn: val } } : r)
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">Title (العربية)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={rec.title?.ar || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          academicRecords: (prev.academicRecords || []).map(r => r.id === rec.id ? { ...r, title: { ...(r.title || { en: '', bn: '', ar: '' }), ar: val } } : r)
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
                    />
                  </div>
                </div>

                {/* Description Translations */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">Description (English)</label>
                    <textarea
                      rows={2}
                      value={rec.description?.en || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          academicRecords: (prev.academicRecords || []).map(r => r.id === rec.id ? { ...r, description: { ...(r.description || { en: '', bn: '', ar: '' }), en: val } } : r)
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">Description (বাংলা)</label>
                    <textarea
                      rows={2}
                      value={rec.description?.bn || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          academicRecords: (prev.academicRecords || []).map(r => r.id === rec.id ? { ...r, description: { ...(r.description || { en: '', bn: '', ar: '' }), bn: val } } : r)
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">Description (العربية)</label>
                    <textarea
                      rows={2}
                      dir="rtl"
                      value={rec.description?.ar || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          academicRecords: (prev.academicRecords || []).map(r => r.id === rec.id ? { ...r, description: { ...(r.description || { en: '', bn: '', ar: '' }), ar: val } } : r)
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Professional Courses & Institutes */}
      {(activeSection === 'all' || activeSection === 'professional') && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-9 h-9 rounded-lg bg-[#171A21] border border-white/[0.08] flex items-center justify-center text-[#E4583B]">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white tracking-tight">Professional Courses & Institutes</h3>
                <p className="text-xs text-neutral-400">
                  Manage skill training institutes, courses, batches, and competencies
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddInstitute}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#E4583B] hover:bg-[#D0492D] text-xs font-medium text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Institute</span>
            </button>
          </div>

          {institutes.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-[#171A21] border border-dashed border-white/[0.09] text-neutral-400 text-xs">
              No institutes currently listed. Click &quot;Add Institute&quot; above to create one.
            </div>
          ) : (
            <div className="space-y-6">
              {institutes.map((inst, idx) => (
                <div key={inst.id || idx} className="p-5 rounded-xl bg-[#171A21] border border-white/[0.08] space-y-5">
                  {/* Institute Header with Reorder and Delete */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs font-semibold text-[#E4583B] tabular-nums">
                        Institute #{idx + 1}
                      </span>
                      <span className="text-xs text-white font-medium truncate max-w-[200px] sm:max-w-xs">
                        {inst.institution?.en || 'Untitled'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveInstitute(idx, 'up')}
                        className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-[#1E222B] transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === institutes.length - 1}
                        onClick={() => handleMoveInstitute(idx, 'down')}
                        className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-[#1E222B] transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({
                          type: 'institute',
                          id: inst.id,
                          title: inst.institution?.en || `Institute #${idx + 1}`
                        })}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors ml-1"
                        title="Delete Institute"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Institution Name */}
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">
                      Institution Name (English, বাংলা, العربية)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="English name"
                        value={inst.institution?.en || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleUpdateInstitute(inst.id, current => ({
                            ...current,
                            institution: { ...(current.institution || { en: '', bn: '', ar: '' }), en: val }
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="বাংলা নাম"
                        value={inst.institution?.bn || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleUpdateInstitute(inst.id, current => ({
                            ...current,
                            institution: { ...(current.institution || { en: '', bn: '', ar: '' }), bn: val }
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="الاسم بالعربية"
                        value={inst.institution?.ar || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleUpdateInstitute(inst.id, current => ({
                            ...current,
                            institution: { ...(current.institution || { en: '', bn: '', ar: '' }), ar: val }
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Course Name & Batch */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">
                        Course Name (English, বাংলা, العربية)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Course (English)"
                          value={inst.course?.en || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleUpdateInstitute(inst.id, current => ({
                              ...current,
                              course: { ...(current.course || { en: '', bn: '', ar: '' }), en: val }
                            }));
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="কোর্স (বাংলা)"
                          value={inst.course?.bn || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleUpdateInstitute(inst.id, current => ({
                              ...current,
                              course: { ...(current.course || { en: '', bn: '', ar: '' }), bn: val }
                            }));
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
                        />
                        <input
                          type="text"
                          dir="rtl"
                          placeholder="الدورة (العربية)"
                          value={inst.course?.ar || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleUpdateInstitute(inst.id, current => ({
                              ...current,
                              course: { ...(current.course || { en: '', bn: '', ar: '' }), ar: val }
                            }));
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">
                        Batch Info
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Batch 08"
                        value={inst.batch || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleUpdateInstitute(inst.id, current => ({
                            ...current,
                            batch: val
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Footer Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-400 mb-1 flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#E4583B]" />
                        <span>Footer Tag 1 (English, বাংলা)</span>
                      </label>
                      <div className="grid grid-cols-1 gap-1.5">
                        <input
                          type="text"
                          placeholder="English: Hands-on Real Project Execution"
                          value={inst.footerTag1?.en || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleUpdateInstitute(inst.id, current => ({
                              ...current,
                              footerTag1: { ...(current.footerTag1 || { en: '', bn: '', ar: '' }), en: val }
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="বাংলা: হাতে-কলমে বাস্তব প্রজেক্ট সম্পাদন"
                          value={inst.footerTag1?.bn || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleUpdateInstitute(inst.id, current => ({
                              ...current,
                              footerTag1: { ...(current.footerTag1 || { en: '', bn: '', ar: '' }), bn: val }
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-400 mb-1 flex items-center space-x-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-[#E4583B]" />
                        <span>Footer Tag 2 (Badge)</span>
                      </label>
                      <div className="grid grid-cols-1 gap-1.5">
                        <input
                          type="text"
                          placeholder="English: Industry Ready"
                          value={inst.footerTag2?.en || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleUpdateInstitute(inst.id, current => ({
                              ...current,
                              footerTag2: { ...(current.footerTag2 || { en: '', bn: '', ar: '' }), en: val }
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="বাংলা: ইন্ডাস্ট্রি রেডি"
                          value={inst.footerTag2?.bn || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleUpdateInstitute(inst.id, current => ({
                              ...current,
                              footerTag2: { ...(current.footerTag2 || { en: '', bn: '', ar: '' }), bn: val }
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Competencies Sub-list */}
                  <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-neutral-300 uppercase tracking-wider tabular-nums">
                        Competencies Acquired ({inst.competencies?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddCompetency(inst.id)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#121419] hover:bg-[#1E222B] border border-white/[0.08] text-xs font-medium text-[#E4583B] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Competency</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {(inst.competencies || []).map((comp: InstituteCompetency, cIdx: number) => (
                        <div key={comp.id || cIdx} className="p-3.5 rounded-lg bg-[#0B0C0F] border border-white/[0.06] space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-[#E4583B] tabular-nums">
                              Skill #{cIdx + 1}
                            </span>
                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                disabled={cIdx === 0}
                                onClick={() => handleMoveCompetency(inst.id, cIdx, 'up')}
                                className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 rounded hover:bg-[#171A21]"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={cIdx === (inst.competencies || []).length - 1}
                                onClick={() => handleMoveCompetency(inst.id, cIdx, 'down')}
                                className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 rounded hover:bg-[#171A21]"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveCompetency(inst.id, cIdx)}
                                className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/30 ml-1"
                                title="Delete Competency"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[11px] font-medium text-neutral-400 mb-0.5">Category (English)</label>
                              <input
                                type="text"
                                value={comp.category?.en || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleUpdateInstitute(inst.id, current => ({
                                    ...current,
                                    competencies: current.competencies.map((c, i) => i === cIdx ? {
                                      ...c,
                                      category: { ...(c.category || { en: '', bn: '', ar: '' }), en: val }
                                    } : c)
                                  }));
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[#171A21] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-neutral-400 mb-0.5">Category (বাংলা)</label>
                              <input
                                type="text"
                                value={comp.category?.bn || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleUpdateInstitute(inst.id, current => ({
                                    ...current,
                                    competencies: current.competencies.map((c, i) => i === cIdx ? {
                                      ...c,
                                      category: { ...(c.category || { en: '', bn: '', ar: '' }), bn: val }
                                    } : c)
                                  }));
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[#171A21] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-neutral-400 mb-0.5">Category (العربية)</label>
                              <input
                                type="text"
                                dir="rtl"
                                value={comp.category?.ar || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleUpdateInstitute(inst.id, current => ({
                                    ...current,
                                    competencies: current.competencies.map((c, i) => i === cIdx ? {
                                      ...c,
                                      category: { ...(c.category || { en: '', bn: '', ar: '' }), ar: val }
                                    } : c)
                                  }));
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[#171A21] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-neutral-400 mb-0.5">Tools & Software (e.g. Premiere Pro & After Effects)</label>
                            <input
                              type="text"
                              value={comp.tools || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleUpdateInstitute(inst.id, current => ({
                                  ...current,
                                  competencies: current.competencies.map((c, i) => i === cIdx ? {
                                    ...c,
                                    tools: val
                                  } : c)
                                }));
                              }}
                              placeholder="e.g. Photoshop, Illustrator & Canva Pro"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#171A21] border border-white/[0.08] focus:border-[#E4583B] outline-none text-xs text-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        title={deleteTarget?.type === 'institute' ? 'Delete Professional Institute?' : 'Delete Academic Record?'}
        itemName={deleteTarget?.title}
        message={
          deleteTarget?.type === 'institute'
            ? 'Are you sure you want to delete this institute and its competencies? It will be removed from your draft portfolio. Changes take effect on the live website when you click Publish.'
            : 'Are you sure you want to delete this qualification record? It will be removed from your draft portfolio. Changes take effect on the live website when you click Publish.'
        }
        onConfirm={() => {
          if (deleteTarget) {
            if (deleteTarget.type === 'institute') {
              handleRemoveInstitute(deleteTarget.id);
            } else {
              handleRemoveAcademic(deleteTarget.id);
            }
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
