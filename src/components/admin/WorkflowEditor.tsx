import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Hash
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { WorkflowStep } from '../../types/portfolio';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export const WorkflowEditor: React.FC = () => {
  const { draftPortfolio, updateDraft } = usePortfolio();
  const workflow: WorkflowStep[] = draftPortfolio.workflow || [];
  const showWorkflow = draftPortfolio.showWorkflow !== false;

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; step: string; title: string } | null>(null);

  const handleToggleVisibility = () => {
    updateDraft(prev => ({
      ...prev,
      showWorkflow: !showWorkflow
    }));
  };

  const handleAddStep = () => {
    const nextNum = workflow.length + 1;
    const formattedStep = String(nextNum).padStart(2, '0');
    const newStep: WorkflowStep = {
      id: 'wf-' + Date.now(),
      step: formattedStep,
      title: {
        en: `Step ${nextNum}`,
        bn: `ধাপ ${nextNum}`,
        ar: `الخطوة ${nextNum}`
      },
      order: nextNum
    };

    updateDraft(prev => ({
      ...prev,
      workflow: [...(prev.workflow || []), newStep]
    }));
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const nextList = [...workflow];
    const temp = nextList[index];
    nextList[index] = nextList[index - 1];
    nextList[index - 1] = temp;
    updateDraft(prev => ({
      ...prev,
      workflow: nextList
    }));
  };

  const handleMoveDown = (index: number) => {
    if (index >= workflow.length - 1) return;
    const nextList = [...workflow];
    const temp = nextList[index];
    nextList[index] = nextList[index + 1];
    nextList[index + 1] = temp;
    updateDraft(prev => ({
      ...prev,
      workflow: nextList
    }));
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    updateDraft(prev => ({
      ...prev,
      workflow: (prev.workflow || []).filter(item => {
        if (deleteTarget.id && item.id) {
          return item.id !== deleteTarget.id;
        }
        return item.step !== deleteTarget.step;
      })
    }));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#121419] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse mb-1">
            <Layers className="w-4 h-4 text-[#E4583B]" />
            <h3 className="text-base font-semibold text-white">Creative Workflow Steps</h3>
            <span className="text-xs text-neutral-400 tabular-nums">
              ({workflow.length} {workflow.length === 1 ? 'step' : 'steps'})
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            Control the step-by-step creative process shown in the Skills & Workflow section of your portfolio.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 rtl:space-x-reverse shrink-0">
          <button
            type="button"
            onClick={handleToggleVisibility}
            className={`inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              showWorkflow
                ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30 hover:bg-emerald-950/50'
                : 'bg-[#171A21] text-neutral-400 border-white/[0.08] hover:text-neutral-200'
            }`}
            title="Toggle section visibility on the live website"
          >
            {showWorkflow ? (
              <>
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Section Visible</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 text-neutral-400" />
                <span>Section Hidden</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleAddStep}
            className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3.5 py-2 rounded-lg text-xs font-medium text-white bg-[#E4583B] hover:bg-[#D0492D] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Step</span>
          </button>
        </div>
      </div>

      {/* Workflow Steps List */}
      {workflow.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#121419] border border-dashed border-white/[0.09] text-center space-y-3">
          <p className="text-sm text-neutral-400">No workflow steps currently defined.</p>
          <button
            type="button"
            onClick={handleAddStep}
            className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-lg text-xs font-medium text-white bg-[#E4583B] hover:bg-[#D0492D] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Step</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {workflow.map((item, index) => {
            const stepId = item.id || `wf-step-${index}`;
            const stepLabel = item.title?.en || item.title?.bn || `Step #${index + 1}`;

            return (
              <div
                key={stepId}
                className="p-4 sm:p-5 rounded-2xl bg-[#121419] border border-white/[0.08] hover:border-white/[0.12] transition-colors space-y-4"
              >
                {/* Step Top Bar */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#171A21] border border-[#E4583B]/40 flex items-center justify-center text-xs font-semibold text-[#E4583B] shrink-0 tabular-nums">
                      {item.step || String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">
                        {stepLabel}
                      </div>
                      <div className="text-[11px] text-neutral-400 tabular-nums">
                        Position #{index + 1} of {workflow.length}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Reorder & Delete */}
                  <div className="flex items-center space-x-1 rtl:space-x-reverse shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#171A21] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === workflow.length - 1}
                      onClick={() => handleMoveDown(index)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#171A21] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTarget({
                          id: stepId,
                          step: item.step,
                          title: stepLabel
                        });
                      }}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors ml-1"
                      title="Delete Step"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1 flex items-center space-x-1 rtl:space-x-reverse">
                      <Hash className="w-3 h-3 text-[#E4583B]" />
                      <span>Step Badge / No.</span>
                    </label>
                    <input
                      type="text"
                      value={item.step || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          workflow: (prev.workflow || []).map((st, i) =>
                            i === index ? { ...st, step: val } : st
                          )
                        }));
                      }}
                      placeholder="e.g. 01"
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white tabular-nums outline-none"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Title (English)
                    </label>
                    <input
                      type="text"
                      value={item.title?.en || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          workflow: (prev.workflow || []).map((st, i) =>
                            i === index ? { ...st, title: { ...st.title, en: val } } : st
                          )
                        }));
                      }}
                      placeholder="e.g. Discovery & Vision"
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Title (বাংলা)
                    </label>
                    <input
                      type="text"
                      value={item.title?.bn || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          workflow: (prev.workflow || []).map((st, i) =>
                            i === index ? { ...st, title: { ...st.title, bn: val } } : st
                          )
                        }));
                      }}
                      placeholder="e.g. ধারণা ও লক্ষ্য নির্ধারণ"
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Title (العربية)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={item.title?.ar || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          workflow: (prev.workflow || []).map((st, i) =>
                            i === index ? { ...st, title: { ...st.title, ar: val } } : st
                          )
                        }));
                      }}
                      placeholder="e.g. الاستكشاف وتحديد الرؤية"
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Delete Workflow Step?"
        itemName={deleteTarget?.title || `Step ${deleteTarget?.step}`}
        message="Are you sure you want to delete this workflow step? It will be removed from your draft portfolio. Changes take effect on the live website when you click Publish."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
