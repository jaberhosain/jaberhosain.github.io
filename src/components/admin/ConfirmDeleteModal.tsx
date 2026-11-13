import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title = 'Confirm Delete',
  itemName,
  message,
  onConfirm,
  onCancel
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#0F1419] border border-[#232B33] rounded-3xl p-6 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close icon button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-5 right-5 rtl:right-auto rtl:left-5 text-neutral-400 hover:text-white p-2 rounded-xl hover:bg-neutral-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start space-x-3.5 rtl:space-x-reverse">
          <div className="w-11 h-11 rounded-2xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              {title}
            </h3>
            {itemName && (
              <p className="text-xs font-mono text-[#FF5722] mt-0.5 line-clamp-1">
                "{itemName}"
              </p>
            )}
          </div>
        </div>

        {/* Modal Body / Explanation */}
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
          {message || 'Are you sure you want to delete this item? It will be removed from your draft. Changes will take effect on the live website when you click Publish.'}
        </p>

        {/* Confirmation Buttons */}
        <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white bg-[#141A20] hover:bg-[#1E2630] border border-[#232B33] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg hover:shadow-rose-600/30 transition-all flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Item</span>
          </button>
        </div>
      </div>
    </div>
  );
};
