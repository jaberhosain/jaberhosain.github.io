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
    overrides,
    customLayers
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
  const layersCount = customLayers.length;

  return (
    <>
      <header className="h-16 bg-[#0B0C0F] border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between z-50 shrink-0 font-sans">
        
        {/* Left: Exit and Title */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button
            type="button"
            onClick={onExit}
            className="px-3 py-1.5 rounded-lg bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.09] text-[#EAE5DC] hover:text-white text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit Live Edit</span>
          </button>

          <div className="h-5 w-px bg-white/[0.08] hidden sm:block" />

          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-[#E4583B]/15 text-[#E4583B]">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-sm font-semibold text-[#F4F0E8]">Theme Live Edit</span>
            <span className="text-xs text-[#8E8A82] tabular-nums hidden sm:inline">
              &middot; {overriddenCount} {overriddenCount === 1 ? 'override' : 'overrides'}
              {layersCount > 0 ? ` · ${layersCount} ${layersCount === 1 ? 'layer' : 'layers'}` : ''}
            </span>
          </div>
        </div>

        {/* Center: Undo / Redo controls */}
        <div className="flex items-center space-x-1 bg-[#121419] border border-white/[0.08] p-1 rounded-xl">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className={`p-2 rounded-lg text-xs transition-colors ${
              canUndo
                ? 'text-[#EAE5DC] hover:text-white hover:bg-white/[0.06] cursor-pointer'
                : 'text-[#5A5750] cursor-not-allowed'
            }`}
            title="Undo last change"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className={`p-2 rounded-lg text-xs transition-colors ${
              canRedo
                ? 'text-[#EAE5DC] hover:text-white hover:bg-white/[0.06] cursor-pointer'
                : 'text-[#5A5750] cursor-not-allowed'
            }`}
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-white/[0.08] mx-1" />

          <button
            type="button"
            onClick={() => setConfirmResetAllOpen(true)}
            className="px-2.5 py-1.5 rounded-lg text-xs text-[#A7A298] hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center space-x-1 cursor-pointer"
            title="Reset all customized design elements back to original default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset All</span>
          </button>
        </div>

        {/* Right: Save Draft & Publish Design */}
        <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
          {hasUnsavedChanges && (
            <span className="hidden lg:inline-block text-xs text-amber-300 font-medium">
              Unsaved changes
            </span>
          )}

          {/* Save Draft */}
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
            className="px-3.5 py-2 rounded-lg bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.09] text-[#F4F0E8] text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            {isSavingDraft ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E4583B]" />
            ) : (
              <Save className="w-3.5 h-3.5 text-[#A7A298]" />
            )}
            <span>Save Draft</span>
          </button>

          {/* Publish Design */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-4 py-2 rounded-lg bg-[#E4583B] hover:bg-[#D0492D] text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
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
          <div className={`px-4 py-3 rounded-xl border shadow-2xl flex items-center space-x-2 text-xs font-medium ${
            toastMsg.type === 'success'
              ? 'bg-[#121419] border-emerald-500/40 text-emerald-300'
              : 'bg-[#121419] border-rose-500/40 text-rose-300'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg.text}</span>
          </div>
        </div>
      )}

      {/* Reset All Confirmation Modal */}
      {confirmResetAllOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121419] border border-white/[0.1] rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#F4F0E8]">Reset ALL Design Overrides?</h3>
                <p className="text-xs text-[#A7A298]">This will remove all custom color, size and font overrides.</p>
              </div>
            </div>

            <p className="text-xs text-[#D7D2C8] leading-relaxed bg-[#0B0C0F] p-3.5 rounded-xl border border-white/[0.08]">
              Your website will immediately return to the clean default design styling. Your content data (texts, videos, images) will NOT be affected.
            </p>

            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmResetAllOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#171A21] hover:bg-[#1E222B] text-[#D7D2C8] text-xs font-medium transition-colors border border-white/[0.09] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResetAll}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors cursor-pointer"
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
