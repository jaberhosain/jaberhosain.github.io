/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Undo2, 
  Redo2, 
  Save, 
  UploadCloud, 
  RotateCcw, 
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useDesignOverrides } from '../../../context/DesignOverridesContext';

interface LiveEditHeaderProps {
  onExit: () => void;
}

export const LiveEditHeader: React.FC<LiveEditHeaderProps> = ({ onExit }) => {
  const {
    saveDraftDesign,
    publishDesign,
    isSavingDraft,
    isPublishing,
    hasUnsavedChanges,
    canUndo,
    canRedo,
    undo,
    redo,
    resetAllOverrides,
    overrides
  } = useDesignOverrides();

  const [confirmResetAllOpen, setConfirmResetAllOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSaveDraft = async () => {
    const success = await saveDraftDesign();
    if (success) {
      showToast('Draft design saved successfully! (Visible in Live Edit)', 'success');
    } else {
      showToast('Failed to save draft design. Please check connection.', 'error');
    }
  };

  const handlePublish = async () => {
    const success = await publishDesign();
    if (success) {
      showToast('Live design published! Public visitors now see your updated styling.', 'success');
    } else {
      showToast('Failed to publish design. Please check connection.', 'error');
    }
  };

  const handleConfirmResetAll = () => {
    resetAllOverrides();
    setConfirmResetAllOpen(false);
    showToast('All custom design overrides reset to default theme.', 'success');
  };

  const overriddenCount = Object.keys(overrides).length;

  return (
    <>
      <header className="h-16 bg-[#0B0F12] border-b border-[#232B33] px-4 sm:px-6 flex items-center justify-between z-50 shrink-0">
        
        {/* Left: Exit and Title */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button
            type="button"
            onClick={onExit}
            className="px-3 py-1.5 rounded-xl bg-[#141A20] hover:bg-[#1E2732] border border-[#232B33] text-neutral-300 hover:text-white text-xs font-mono font-medium flex items-center space-x-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit Live Edit</span>
          </button>

          <div className="h-5 w-px bg-[#232B33] hidden sm:block" />

          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-[#FF5722]/15 text-[#FF5722]">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-sm font-bold text-white tracking-wide">Theme Live Edit</span>
            <span className="text-[10px] font-mono uppercase bg-[#141A20] text-neutral-400 px-2 py-0.5 rounded-full border border-[#232B33]">
              {overriddenCount} {overriddenCount === 1 ? 'override' : 'overrides'}
            </span>
          </div>
        </div>

        {/* Center: Undo / Redo controls */}
        <div className="flex items-center space-x-1 bg-[#12161A] border border-[#232B33] p-1 rounded-xl">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className={`p-2 rounded-lg text-xs font-mono transition-colors ${
              canUndo
                ? 'text-neutral-200 hover:text-white hover:bg-[#1C232B]'
                : 'text-neutral-600 cursor-not-allowed'
            }`}
            title="Undo last change (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className={`p-2 rounded-lg text-xs font-mono transition-colors ${
              canRedo
                ? 'text-neutral-200 hover:text-white hover:bg-[#1C232B]'
                : 'text-neutral-600 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-[#232B33] mx-1" />

          <button
            type="button"
            onClick={() => setConfirmResetAllOpen(true)}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center space-x-1"
            title="Reset all customized design elements back to original default"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset All</span>
          </button>
        </div>

        {/* Right: Save Draft & Publish Design */}
        <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
          {hasUnsavedChanges && (
            <span className="hidden lg:inline-flex items-center space-x-1 text-[11px] font-mono text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Unsaved Changes</span>
            </span>
          )}

          {/* Save Draft */}
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
            className="px-3.5 py-2 rounded-xl bg-[#141A20] hover:bg-[#1E2732] border border-[#232B33] text-white text-xs font-mono font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            {isSavingDraft ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF5722]" />
            ) : (
              <Save className="w-3.5 h-3.5 text-neutral-400" />
            )}
            <span>Save Draft</span>
          </button>

          {/* Publish Design */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-4 py-2 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-lg glow-orange-sm"
          >
            {isPublishing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5 text-white" />
            )}
            <span>Publish Design</span>
          </button>
        </div>
      </header>

      {/* Floating Status Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className={`px-4 py-3 rounded-2xl border shadow-2xl flex items-center space-x-2 text-xs font-mono ${
            toastMsg.type === 'success'
              ? 'bg-[#0F1419] border-emerald-500/50 text-emerald-400'
              : 'bg-[#0F1419] border-red-500/50 text-red-400'
          }`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg.text}</span>
          </div>
        </div>
      )}

      {/* Reset All Confirmation Modal */}
      {confirmResetAllOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F1419] border border-[#232B33] rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset ALL Design Overrides?</h3>
                <p className="text-xs text-neutral-400">This will remove all custom color, size and font overrides.</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed bg-[#141A20] p-3.5 rounded-2xl border border-[#232B33]">
              Your website will immediately return to the clean default design styling. Your content data (texts, videos, images) will NOT be affected.
            </p>

            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmResetAllOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#141A20] hover:bg-[#1C232B] text-neutral-300 text-xs font-mono transition-colors border border-[#232B33]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResetAll}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold transition-colors shadow-lg"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
