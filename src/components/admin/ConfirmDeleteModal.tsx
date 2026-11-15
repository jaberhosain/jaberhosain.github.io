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
        className="w-full max-w-md bg-[#121419] border border-white/[0.1] rounded-2xl p-6 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close icon button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-[#8E8A82] hover:text-white p-2 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start space-x-3.5 rtl:space-x-reverse">
          <div className="w-10 h-10 rounded-xl bg-rose-950/50 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 pr-6">
            <h3 className="text-base font-semibold text-[#F4F0E8]">
              {title}
            </h3>
            {itemName && (
              <p className="text-xs text-[#E4583B] mt-0.5 line-clamp-1 font-medium">
                &ldquo;{itemName}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Modal Body / Explanation */}
        <p className="text-xs sm:text-sm text-[#A7A298] leading-relaxed">
          {message || 'Are you sure you want to delete this item? It will be removed from your draft. Changes will take effect on the live website when you click Publish.'}
        </p>

        {/* Confirmation Buttons */}
        <div className="flex items-center justify-end space-x-2.5 rtl:space-x-reverse pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-medium text-[#D7D2C8] hover:text-white bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.09] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors flex items-center space-x-2 rtl:space-x-reverse cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Item</span>
          </button>
        </div>
      </div>
    </div>
  );
};
