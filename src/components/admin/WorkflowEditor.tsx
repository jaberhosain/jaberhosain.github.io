import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle,
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

  // Toggle workflow section visibility on public site
  const handleToggleVisibility = () => {
    updateDraft(prev => ({
      ...prev,
      showWorkflow: !showWorkflow
    }));
  };

  // Add a new workflow step
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

  // Move step up in sequence
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

  // Move step down in sequence
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

  // Remove confirmed step
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
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1419] border border-[#232B33] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
            <Layers className="w-5 h-5 text-[#FF5722]" />
            <h3 className="text-base font-bold text-white">Creative Workflow Steps</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/30">
              {workflow.length} {workflow.length === 1 ? 'Step' : 'Steps'}
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            Control the step-by-step creative process shown in the Skills & Workflow section of your portfolio.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 rtl:space-x-reverse shrink-0">
          {/* Section Visibility Toggle */}
          <button
            type="button"
            onClick={handleToggleVisibility}
            className={`inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              showWorkflow
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/40'
                : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-neutral-200'
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

          {/* Add Step Button */}
          <button
            type="button"
            onClick={handleAddStep}
            className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#FF5722] hover:bg-[#F4511E] glow-orange-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Step</span>
          </button>
        </div>
      </div>

      {/* Workflow Steps List */}
      {workflow.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#0F1419] border border-dashed border-[#232B33] text-center space-y-3">
          <p className="text-sm text-neutral-400">No workflow steps currently defined.</p>
          <button
            type="button"
            onClick={handleAddStep}
            className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF5722] hover:bg-[#F4511E]"
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
                className="p-4 sm:p-5 rounded-2xl bg-[#141A20] border border-[#232B33] hover:border-[#2F3B47] transition-all space-y-4"
              >
                {/* Step Top Bar */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#1E2630]">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#181E24] border-2 border-[#FF5722] flex items-center justify-center text-xs font-mono font-bold text-[#FF5722] shrink-0 shadow-sm">
                      {item.step || String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {stepLabel}
                      </div>
                      <div className="text-[10px] font-mono text-neutral-400">
                        Position: #{index + 1} of {workflow.length}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Reorder & Delete */}
                  <div className="flex items-center space-x-1 rtl:space-x-reverse shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1E2630] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === workflow.length - 1}
                      onClick={() => handleMoveDown(index)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1E2630] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
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
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors ml-1"
                      title="Delete Step"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Step Number / Tag */}
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-mono text-neutral-400 mb-1 flex items-center space-x-1 rtl:space-x-reverse">
                      <Hash className="w-3 h-3 text-[#FF5722]" />
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
                      className="w-full px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] focus:border-[#FF5722] text-xs text-white font-mono outline-none"
                    />
                  </div>

                  {/* Title (English) */}
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-mono text-neutral-400 mb-1">
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
                      className="w-full px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] focus:border-[#FF5722] text-xs text-white outline-none"
                    />
                  </div>

                  {/* Title (Bengali) */}
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-mono text-neutral-400 mb-1">
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
                      className="w-full px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] focus:border-[#FF5722] text-xs text-white outline-none"
                    />
                  </div>

                  {/* Title (Arabic) */}
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-mono text-neutral-400 mb-1">
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
                      className="w-full px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] focus:border-[#FF5722] text-xs text-white outline-none"
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
