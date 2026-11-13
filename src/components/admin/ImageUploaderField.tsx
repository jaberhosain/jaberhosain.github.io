import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadMediaToStorage } from '../../lib/mediaUpload';
import { resolveAssetUrl } from '../../utils/assetUrl';

interface ImageUploaderFieldProps {
  label: string;
  value: string;
  onChange: (newVal: string) => void;
  defaultFallback?: string;
  helperText?: string;
}

export const ImageUploaderField: React.FC<ImageUploaderFieldProps> = ({
  label,
  value,
  onChange,
  defaultFallback = '/assets/jabir_profile.png',
  helperText
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Resize to max 1600px at 0.8 quality and upload directly to Firebase Storage
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(15);
    setUploadError(null);
    setStatusMessage('Compressing image (max 1600px, 0.8 quality)...');

    try {
      const downloadUrl = await uploadMediaToStorage(file, (pct) => {
        setProgress(pct);
        if (pct < 100) {
          setStatusMessage(`Uploading to Firebase Storage (${pct}%)...`);
        } else {
          setStatusMessage('Finalizing...');
        }
      });

      onChange(downloadUrl);
      setStatusMessage('Uploaded successfully to Firebase Storage!');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      const msg = err.message || 'Firebase Storage upload failed.';
      setUploadError(msg);
      setStatusMessage(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-[#141A20] border border-[#232B33] space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono text-neutral-300 font-semibold tracking-wide">
          {label}
        </label>
        {value && value !== defaultFallback && (
          <button
            type="button"
            onClick={() => onChange(defaultFallback)}
            className="inline-flex items-center space-x-1 text-[11px] font-mono text-[#FF5722] hover:text-[#FF7043] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Default</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Preview Thumbnail */}
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#0B0F12] border border-[#232B33] shrink-0 flex items-center justify-center relative group">
          {value ? (
            <img
              src={resolveAssetUrl(value)}
              alt="Preview"
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = resolveAssetUrl(defaultFallback);
              }}
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-neutral-600" />
          )}
        </div>

        {/* Input & Controls */}
        <div className="flex-1 w-full space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Firebase Storage URL or local path (/assets/...)"
            className="w-full px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] text-xs text-white font-mono focus:border-[#FF5722] focus:outline-none transition-colors"
          />

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#232B33] hover:bg-[#2F3A45] text-xs font-semibold text-white transition-all hover:border-[#FF5722] disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5 text-[#FF5722]" />
              <span>{uploading ? 'Processing & Uploading...' : 'Upload Image File'}</span>
            </button>
            <span className="text-[11px] text-neutral-500 font-mono">
              Auto-resized (max 1600px, 0.8 quality) &rarr; Firebase Storage
            </span>
          </div>

          {/* Progress bar */}
          {uploading && (
            <div className="space-y-1 pt-1">
              <div className="w-full bg-[#0B0F12] rounded-full h-1.5 overflow-hidden border border-[#232B33]">
                <div
                  className="bg-[#FF5722] h-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {statusMessage && (
                <p className="text-[10px] font-mono text-[#FF5722]">{statusMessage}</p>
              )}
            </div>
          )}

          {/* Success status message */}
          {!uploading && statusMessage && (
            <p className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1 pt-1">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{statusMessage}</span>
            </p>
          )}

          {/* Clear Upload Error notice */}
          {!uploading && uploadError && (
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2 mt-1">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-bold font-mono">Upload Failed</p>
                <p className="text-[11px] text-rose-300/90 font-mono break-words">{uploadError}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {helperText && !uploading && (
        <p className="text-[11px] text-neutral-400 font-mono">{helperText}</p>
      )}
    </div>
  );
};
