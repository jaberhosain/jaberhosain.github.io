import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Minimalist paper-and-ember confirmation dialog with a tactile "Hold to delete"
 * molten fill button inspired by burn-away destructive actions.
 */
export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title = 'Delete this item?',
  itemName,
  message,
  onConfirm,
  onCancel
}) => {
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [ignited, setIgnited] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const resetHold = useCallback(() => {
    setIsHolding(false);
    setHoldProgress(0);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetHold();
      setIgnited(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      resetHold();
    };
  }, [isOpen, onCancel, resetHold]);

  const startHold = useCallback(() => {
    if (ignited) return;
    setIsHolding(true);
    startRef.current = performance.now();

    const DURATION = 800;
    const step = (now: number) => {
      const pct = Math.min(1, (now - startRef.current) / DURATION);
      setHoldProgress(pct);
      if (pct >= 1) {
        rafRef.current = null;
        setIsHolding(false);
        setIgnited(true);
        setTimeout(() => {
          onConfirm();
          onCancel();
        }, 260);
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
  }, [ignited, onConfirm, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className={`relative w-full max-w-[440px] rounded-[28px] bg-[#FFFFFF] text-[#141416] px-8 py-10 sm:px-10 sm:py-12 text-center shadow-[0_32px_90px_-16px_rgba(0,0,0,0.65)] transition-all duration-300 ${
          ignited ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Close icon button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-[#9A9AA0] hover:text-[#141416] p-2 rounded-full hover:bg-black/[0.05] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Quiet Top Context Label */}
        <p className="text-xs font-medium text-[#8E8E94] mb-2 truncate px-4">
          {itemName ? itemName : 'Md. Jaber Hosain, @jabirbd'}
        </p>

        {/* Crisp Bold Headline */}
        <h3 className="font-display text-2xl sm:text-[28px] font-bold tracking-tight text-[#111113] leading-tight">
          {title}
        </h3>

        {/* Clean Explanation */}
        <p className="text-xs sm:text-sm text-[#6E6E74] leading-relaxed mt-3 max-w-xs mx-auto">
          {message ||
            'This item will be removed from your draft immediately. Publish when ready to sync live.'}
        </p>

        {/* Molten "Hold to delete" Pill Button */}
        <div className="mt-7 flex flex-col items-center gap-3.5">
          <button
            type="button"
            onPointerDown={startHold}
            onPointerUp={resetHold}
            onPointerLeave={resetHold}
            onPointerCancel={resetHold}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !isHolding) {
                e.preventDefault();
                startHold();
              }
            }}
            onKeyUp={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                resetHold();
              }
            }}
            style={{
              boxShadow:
                holdProgress > 0
                  ? `0 0 ${16 + holdProgress * 36}px rgba(249, 107, 39, ${(0.38 + holdProgress * 0.5).toFixed(2)}), 0 0 ${8 + holdProgress * 16}px rgba(255, 198, 112, ${(0.25 + holdProgress * 0.45).toFixed(2)})`
                  : '0 10px 24px -10px rgba(0, 0, 0, 0.35)'
            }}
            className="relative overflow-hidden min-w-[196px] min-h-[48px] px-7 py-3 rounded-full bg-[#161618] text-white font-medium text-sm tracking-tight transition-transform duration-150 active:scale-[0.98] touch-none select-none cursor-pointer"
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 pointer-events-none"
              style={{
                width: `${Math.max(0, holdProgress * 100)}%`,
                opacity: holdProgress > 0 ? 1 : 0,
                background:
                  'linear-gradient(90deg, #7C190B 0%, #D9461A 42%, #FA8C32 78%, #FFF1D0 100%)'
              }}
            />
            {holdProgress > 0.02 && (
              <span
                aria-hidden="true"
                className="absolute inset-y-0 w-3.5 pointer-events-none blur-[4px]"
                style={{
                  left: `calc(${holdProgress * 100}% - 7px)`,
                  background: 'rgba(255, 246, 224, 0.95)'
                }}
              />
            )}
            <span className="relative z-10">
              {ignited ? 'Deleted' : isHolding ? 'Deleting...' : 'Hold to delete'}
            </span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-medium text-[#7A7A82] hover:text-[#141416] transition-colors py-1.5 px-3 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
