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
    <div className="p-3.5 rounded-xl bg-[#121419] border border-white/[0.08] space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-[#EAE5DC]">
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
            className="inline-flex items-center space-x-1 text-xs text-[#E4583B] hover:text-[#F07C63] transition-colors cursor-pointer"
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

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
        {/* Preview Thumbnail — NEVER silently hijacked to profile pic */}
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#0B0C0F] border border-white/[0.08] shrink-0 flex items-center justify-center relative">
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
              <ImageIcon className={`w-6 h-6 ${previewError ? 'text-amber-400' : 'text-[#5A5750]'}`} />
              {previewError && (
                <span className="text-[10px] text-amber-400 mt-1 leading-tight">Check URL</span>
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
              placeholder="Paste direct image URL, Google Drive link, or Behance URL..."
              className="flex-1 px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] font-mono placeholder-[#6F6B64] focus:border-[#E4583B] focus:outline-none transition-colors"
            />
            {value && (isWrapperPage || previewError) && (
              <button
                type="button"
                disabled={resolving}
                onClick={handleResolveUrl}
                className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-[#1C2029] hover:bg-[#252A36] border border-white/[0.1] text-xs font-medium text-[#F4F0E8] transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              >
                {resolving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E4583B]" />
                ) : (
                  <Link2 className="w-3.5 h-3.5 text-[#E4583B]" />
                )}
                <span>{resolving ? 'Extracting...' : 'Extract Image'}</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
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
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.09] text-xs font-medium text-[#F4F0E8] transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#E4583B]" />
              <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
            </button>
            <span className="text-[11px] text-[#8E8A82]">
              Supports direct image links, Google Drive, Postimages, ImgBB, or Behance
            </span>
          </div>

          {/* Progress bar */}
          {uploading && (
            <div className="space-y-1 pt-1">
              <div className="w-full bg-[#0B0C0F] rounded-full h-1.5 overflow-hidden border border-white/[0.08]">
                <div
                  className="bg-[#E4583B] h-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {statusMessage && (
                <p className="text-[11px] text-[#F07C63]">{statusMessage}</p>
              )}
            </div>
          )}

          {/* Success status message */}
          {!uploading && statusMessage && (
            <p className="text-xs text-emerald-400 flex items-center space-x-1.5 pt-0.5">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{statusMessage}</span>
            </p>
          )}

          {/* Wrapper URL hint */}
          {!uploading && !uploadError && (previewError || isWrapperPage) && (
            <div className="p-2.5 rounded-lg bg-amber-950/35 border border-amber-500/30 text-amber-200 text-xs space-y-1">
              {urlKind === 'behance_page' ? (
                <p>
                  Behance পেজ লিংক দেওয়া হয়েছে—ডানদিকের <span className="text-white font-semibold">Extract Image</span> বাটনে ক্লিক করলে অটোমেটিক কভার ছবি চলে আসবে।
                </p>
              ) : urlKind === 'postimg_page' ? (
                <p>
                  Postimages-এর Direct link ব্যবহার করুন (<code className="font-mono text-amber-300">https://i.postimg.cc/...</code>) অথবা <span className="text-white font-semibold">Extract Image</span> চাপুন।
                </p>
              ) : (
                <p>
                  প্রিভিউ লোড হয়নি—<span className="text-white font-semibold">Extract Image</span> ক্লিক করুন অথবা ছবি ফাইল আপলোড করুন।
                </p>
              )}
            </div>
          )}

          {/* Clear Error notice */}
          {!uploading && uploadError && (
            <div className="p-2.5 rounded-lg bg-rose-950/45 border border-rose-500/35 text-rose-200 text-xs flex items-start space-x-2 mt-1">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-rose-100">Notice</p>
                <p className="text-xs text-rose-200/90 break-words mt-0.5">{uploadError}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {helperText && !uploading && (
        <p className="text-xs text-[#8E8A82]">{helperText}</p>
      )}
    </div>
  );
};
