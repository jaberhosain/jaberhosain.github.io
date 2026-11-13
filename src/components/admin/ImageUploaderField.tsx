import React, { useRef, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, RotateCcw, CheckCircle, AlertCircle, Link2, Loader2, X } from 'lucide-react';
import { uploadMediaToStorage } from '../../lib/mediaUpload';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { classifyImageUrl, normalizeDirectImageUrl, resolveImageFromUrl } from '../../lib/imageUrlResolver';

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
  const [resolving, setResolving] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<boolean>(false);

  useEffect(() => {
    setPreviewError(false);
  }, [value]);

  const urlKind = classifyImageUrl(value);
  const isWrapperPage =
    urlKind === 'behance_page' ||
    urlKind === 'postimg_page' ||
    urlKind === 'imgbb_page' ||
    urlKind === 'webpage';

  // Resize to max 1600px at 0.8 quality and upload directly to Firebase Storage
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(15);
    setUploadError(null);
    setPreviewError(false);
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

  const handleResolveUrl = async () => {
    if (!value?.trim()) return;
    setResolving(true);
    setUploadError(null);
    setStatusMessage('Checking link & extracting direct image...');

    try {
      const result = await resolveImageFromUrl(value);
      if (result.error) {
        setUploadError(result.error);
        setStatusMessage(null);
      } else if (result.imageUrl) {
        setPreviewError(false);
        onChange(result.imageUrl);
        setStatusMessage(result.note || 'Direct image link verified!');
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to resolve image link.');
      setStatusMessage(null);
    } finally {
      setResolving(false);
    }
  };

  const handleUrlInputChange = (raw: string) => {
    setUploadError(null);
    setPreviewError(false);
    // Auto-normalize Google Drive share links on paste cleanly
    if (raw.includes('drive.google.com/')) {
      const normalized = normalizeDirectImageUrl(raw);
      onChange(normalized);
      return;
    }
    onChange(raw);
  };

  const previewSrc = value ? resolveAssetUrl(normalizeDirectImageUrl(value)) : '';

  return (
    <div className="p-4 rounded-2xl bg-[#141A20] border border-[#232B33] space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-mono text-neutral-300 font-semibold tracking-wide">
          {label}
        </label>
        {value && value !== defaultFallback && (
          <button
            type="button"
            onClick={() => {
              setUploadError(null);
              setPreviewError(false);
              onChange(defaultFallback);
            }}
            className="inline-flex items-center space-x-1 text-[11px] font-mono text-[#FF5722] hover:text-[#FF7043] transition-colors cursor-pointer"
          >
            {defaultFallback ? (
              <>
                <RotateCcw className="w-3 h-3" />
                <span>Reset Default</span>
              </>
            ) : (
              <>
                <X className="w-3 h-3" />
                <span>Clear Image</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Preview Thumbnail — NEVER silently hijacked to profile pic */}
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#0B0F12] border border-[#232B33] shrink-0 flex items-center justify-center relative">
          {previewSrc && !previewError ? (
            <img
              src={previewSrc}
              alt="Preview"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
              onLoad={() => setPreviewError(false)}
              onError={() => setPreviewError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-1">
              <ImageIcon className={`w-6 h-6 ${previewError ? 'text-amber-400' : 'text-neutral-600'}`} />
              {previewError && (
                <span className="text-[9px] font-mono text-amber-400 mt-1 leading-tight">Invalid URL</span>
              )}
            </div>
          )}
        </div>

        {/* Input & Controls */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => handleUrlInputChange(e.target.value)}
              placeholder="Paste direct image URL (i.postimg.cc / mir-s3-cdn-cf.behance.net / Firebase)..."
              className="flex-1 px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] text-xs text-white font-mono focus:border-[#FF5722] focus:outline-none transition-colors"
            />
            {value && (isWrapperPage || previewError) && (
              <button
                type="button"
                disabled={resolving}
                onClick={handleResolveUrl}
                className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-[#0057FF]/20 hover:bg-[#0057FF]/30 border border-[#0057FF]/40 text-xs font-mono font-semibold text-[#60A5FA] transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              >
                {resolving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Link2 className="w-3.5 h-3.5" />
                )}
                <span>{resolving ? 'Checking...' : 'Extract Image'}</span>
              </button>
            )}
          </div>

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
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#232B33] hover:bg-[#2F3A45] text-xs font-semibold text-white transition-all hover:border-[#FF5722] disabled:opacity-50 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#FF5722]" />
              <span>{uploading ? 'Processing & Uploading...' : 'Upload Image File'}</span>
            </button>
            <span className="text-[11px] text-neutral-500 font-mono">
              Or paste Direct Image URL (Postimages, Behance CDN, ImgBB, Drive)
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

          {/* Wrapper URL / Broken Image Warning (Only when user hasn't already hit Extract Error) */}
          {!uploading && !uploadError && (previewError || isWrapperPage) && (
            <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-[11px] font-mono space-y-1">
              {urlKind === 'behance_page' ? (
                <p>
                  Note: <span className="text-white font-semibold">behance.net/gallery/...</span> is a project webpage, not a direct image file. Open the poster on Behance, right-click the image &rarr; <span className="text-white font-semibold">&ldquo;Copy image address&rdquo;</span> (<code className="text-amber-300">mir-s3-cdn-cf.behance.net/...</code>), or click <span className="text-white font-semibold">Extract Image</span>.
                </p>
              ) : urlKind === 'postimg_page' ? (
                <p>
                  Note: On Postimages, copy the <span className="text-white font-semibold">&ldquo;Direct link&rdquo;</span> (<code className="text-amber-300">https://i.postimg.cc/...</code>) instead of the page share URL, or click <span className="text-white font-semibold">Extract Image</span>.
                </p>
              ) : (
                <p>
                  This link could not render as an image preview. Click <span className="text-white font-semibold">Extract Image</span>, paste the direct image address (<code className="text-amber-300">.jpg / .png / .webp</code>), or upload the image file.
                </p>
              )}
            </div>
          )}

          {/* Clear Error notice */}
          {!uploading && uploadError && (
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2 mt-1">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-bold font-mono">Notice</p>
                <p className="text-[11px] text-rose-200/90 font-mono break-words">{uploadError}</p>
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
