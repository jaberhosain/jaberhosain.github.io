import React, { useRef, useState } from 'react';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Link2,
  Image as ImageIcon,
  Star,
  ListPlus,
  Loader2,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { resolveAssetUrl } from '../../utils/assetUrl';
import {
  normalizeDirectImageUrl,
  resolveImageFromUrl,
  classifyImageUrl,
  resolveBehanceProjectFromUrl,
  extractImageUrlsFromRawTextOrHtml
} from '../../lib/imageUrlResolver';
import { uploadMediaToStorage } from '../../lib/mediaUpload';

interface ProjectGalleryManagerProps {
  galleryImages: string[];
  galleryCaptions?: string[];
  coverImage?: string;
  behanceUrl?: string;
  onChange: (nextImages: string[], nextCaptions?: string[], newCover?: string) => void;
  onBehanceImported?: (data: { title?: string; description?: string; images: string[] }) => void;
}

export const ProjectGalleryManager: React.FC<ProjectGalleryManagerProps> = ({
  galleryImages = [],
  galleryCaptions = [],
  coverImage = '',
  behanceUrl = '',
  onChange,
  onBehanceImported
}) => {
  const multiFileRef = useRef<HTMLInputElement>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [behanceInput, setBehanceInput] = useState('');
  const [importingBehance, setImportingBehance] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [resolvingIdx, setResolvingIdx] = useState<number | null>(null);
  const [inlineNotice, setInlineNotice] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const [brokenThumbs, setBrokenThumbs] = useState<Record<number, boolean>>({});

  const flashNotice = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setInlineNotice({ type, msg });
    setTimeout(() => setInlineNotice(null), 6500);
  };

  const syncCaptions = (len: number, baseCaptions: string[] = galleryCaptions) => {
    return Array.from({ length: len }, (_, i) => baseCaptions[i] || '');
  };

  const handleAddBlankPoster = () => {
    const nextImgs = [...galleryImages, ''];
    const nextCaps = syncCaptions(nextImgs.length);
    onChange(nextImgs, nextCaps);
  };

  const handleBehanceExtract = async (urlToFetch: string) => {
    const clean = urlToFetch.trim();
    if (!clean) {
      flashNotice('আগে একটি Behance প্রজেক্ট লিংক দিন।', 'err');
      return;
    }
    setImportingBehance(true);
    try {
      const res = await resolveBehanceProjectFromUrl(clean);
      if (res.success && res.images.length > 0) {
        const merged = [...galleryImages];
        for (const u of res.images) {
          if (u && !merged.includes(u)) merged.push(u);
        }
        const nextCaps = syncCaptions(merged.length);
        const autoCover = !coverImage ? res.coverImage || res.images[0] : undefined;
        onChange(merged, nextCaps, autoCover);
        onBehanceImported?.({
          title: res.title,
          description: res.description,
          images: res.images
        });
        setBehanceInput('');
        flashNotice(res.note || `Behance থেকে ${res.images.length}টি পোস্টার যোগ হয়েছে!`);
      } else {
        setBulkOpen(true);
        flashNotice(
          res.error || 'Behance থেকে স্বয়ংক্রিয়ভাবে ছবি পাওয়া যায়নি—নিচের Multi-URL বা Page Source বক্সে পেস্ট করুন।',
          'err'
        );
      }
    } finally {
      setImportingBehance(false);
    }
  };

  const handleBulkPasteAdd = async () => {
    if (!bulkText.trim()) return;

    // Smart parser handles both clean URL lists AND pasted Behance page HTML source (Ctrl+U)
    let extracted = extractImageUrlsFromRawTextOrHtml(bulkText);
    if (extracted.length === 0) {
      extracted = bulkText
        .split(/[\n\r,]+/)
        .map((l) => normalizeDirectImageUrl(l.trim()))
        .filter((u) => /^https?:\/\//i.test(u) || u.startsWith('/'));
    }

    if (extracted.length === 0) {
      flashNotice('কোনো ভ্যালিড ইমেজ লিংক পাওয়া যায়নি। ডিরেক্ট ইমেজ লিংক অথবা Behance পেজের HTML সোর্স পেস্ট করুন।', 'err');
      return;
    }

    const merged = [...galleryImages];
    let addedCount = 0;
    for (const u of extracted) {
      if (!merged.includes(u)) {
        merged.push(u);
        addedCount++;
      }
    }
    const nextCaps = syncCaptions(merged.length);
    const autoCover = !coverImage ? extracted[0] : undefined;

    onChange(merged, nextCaps, autoCover);
    setBulkText('');
    setBulkOpen(false);
    flashNotice(`গ্রুপে নতুন ${addedCount}টি পোস্টার লিংক যুক্ত হয়েছে।`);
  };

  const handleMultiFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingFiles(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const url = await uploadMediaToStorage(file);
        uploadedUrls.push(url);
      }
      const nextImgs = [...galleryImages, ...uploadedUrls];
      const nextCaps = syncCaptions(nextImgs.length);
      const autoCover = !coverImage && uploadedUrls[0] ? uploadedUrls[0] : undefined;
      onChange(nextImgs, nextCaps, autoCover);
      flashNotice(`${uploadedUrls.length}টি পোস্টার সফলভাবে আপলোড হয়েছে।`);
    } catch (err: any) {
      flashNotice(err?.message || 'Upload failed.', 'err');
    } finally {
      setUploadingFiles(false);
      if (multiFileRef.current) multiFileRef.current.value = '';
    }
  };

  const handleResolveItem = async (idx: number) => {
    const raw = galleryImages[idx];
    if (!raw?.trim()) return;
    setResolvingIdx(idx);
    try {
      const res = await resolveImageFromUrl(raw);
      if (res.error) {
        flashNotice(res.error, 'err');
      } else if (res.imageUrl) {
        const nextImgs = galleryImages.map((u, i) => (i === idx ? res.imageUrl : u));
        onChange(nextImgs, syncCaptions(nextImgs.length));
        setBrokenThumbs((prev) => ({ ...prev, [idx]: false }));
        flashNotice(res.note || 'Poster URL resolved!');
      }
    } finally {
      setResolvingIdx(null);
    }
  };

  const handleMove = (from: number, to: number) => {
    if (to < 0 || to >= galleryImages.length) return;
    const nextImgs = [...galleryImages];
    const nextCaps = syncCaptions(galleryImages.length);
    const [movedImg] = nextImgs.splice(from, 1);
    const [movedCap] = nextCaps.splice(from, 1);
    nextImgs.splice(to, 0, movedImg);
    nextCaps.splice(to, 0, movedCap);
    onChange(nextImgs, nextCaps);
  };

  const handleRemove = (idx: number) => {
    const nextImgs = galleryImages.filter((_, i) => i !== idx);
    const nextCaps = syncCaptions(galleryImages.length).filter((_, i) => i !== idx);
    onChange(nextImgs, nextCaps);
  };

  return (
    <div className="p-4 rounded-xl bg-[#0D0F13] border border-white/[0.08] space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/[0.06]">
        <div>
          <h4 className="text-xs font-semibold text-[#F4F0E8] flex items-center space-x-2">
            <ImageIcon className="w-3.5 h-3.5 text-[#E4583B]" />
            <span>Posters in Project Group</span>
            <span className="text-[#8E8A82] font-normal tabular-nums">({galleryImages.length})</span>
          </h4>
          <p className="text-[11px] text-[#8E8A82] mt-0.5 leading-relaxed">
            একটি প্রজেক্টে ২–৩টি বা তার বেশি পোস্টার থাকলে Behance প্রজেক্ট লিংক দিন, HTML সোর্স পেস্ট করুন, অথবা ফাইল আপলোড করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <input
            type="file"
            ref={multiFileRef}
            multiple
            accept="image/*"
            onChange={handleMultiFileUpload}
            className="hidden"
          />
          <button
            type="button"
            disabled={uploadingFiles}
            onClick={() => multiFileRef.current?.click()}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.09] text-xs font-medium text-[#F4F0E8] cursor-pointer disabled:opacity-50 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-[#E4583B]" />
            <span>{uploadingFiles ? 'Uploading...' : 'Upload Files'}</span>
          </button>

          <button
            type="button"
            onClick={() => setBulkOpen((v) => !v)}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.09] text-xs font-medium text-[#EAE5DC] cursor-pointer transition-colors"
          >
            <ListPlus className="w-3.5 h-3.5 text-[#A7A298]" />
            <span>Smart Import / URLs</span>
          </button>

          <button
            type="button"
            onClick={handleAddBlankPoster}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#E4583B] hover:bg-[#D0492D] text-xs font-semibold text-white cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Slot</span>
          </button>
        </div>
      </div>

      {/* Quick 1-click Behance link extractor row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-lg bg-[#121419] border border-white/[0.07]">
        <input
          type="url"
          value={behanceInput}
          onChange={(e) => setBehanceInput(e.target.value)}
          placeholder={
            behanceUrl
              ? `Paste Behance URL or extract linked: ${behanceUrl}`
              : 'Paste Behance gallery URL (https://www.behance.net/gallery/...) to pull all posters'
          }
          className="flex-1 px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs font-mono text-[#F4F0E8] placeholder-[#6F6B64] focus:border-[#E4583B] focus:outline-none"
        />
        <button
          type="button"
          disabled={importingBehance || (!behanceInput.trim() && !behanceUrl?.trim())}
          onClick={() => handleBehanceExtract(behanceInput.trim() || behanceUrl)}
          className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1C2029] hover:bg-[#252A36] border border-white/[0.1] text-xs font-medium text-[#F4F0E8] disabled:opacity-45 cursor-pointer shrink-0 transition-colors"
        >
          {importingBehance ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E4583B]" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-[#E4583B]" />
          )}
          <span>{importingBehance ? 'Extracting...' : 'Import from Behance'}</span>
        </button>
      </div>

      {/* Bulk multi-line URL or HTML Source paste drawer */}
      {bulkOpen && (
        <div className="p-3 rounded-xl bg-[#121419] border border-white/[0.1] space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <label className="block text-xs font-medium text-[#EAE5DC]">
              Paste Multiple Image URLs or Behance Page Source (<code className="font-mono text-[11px] text-[#A7A298]">Ctrl+U</code>)
            </label>
          </div>
          <p className="text-[11px] text-[#8E8A82] leading-relaxed">
            কয়েকটি ডিরেক্ট ইমেজ লিংক একসাথে দিন (প্রতি লাইনে একটি), অথবা Behance প্রজেক্ট পেজ খুলে <span className="text-[#EAE5DC]">Ctrl+U</span> করে পুরো সোর্স এখানে পেস্ট করুন—সবগুলো হাই-রেজোলিউশন পোস্টার অটোমেটিক বের হয়ে আসবে।
          </p>
          <textarea
            rows={4}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/...\nhttps://i.postimg.cc/...'}
            className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs font-mono text-[#F4F0E8] placeholder-[#6F6B64] focus:border-[#E4583B] focus:outline-none"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setBulkOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-[#A7A298] hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBulkPasteAdd}
              className="px-3.5 py-1.5 rounded-lg bg-[#E4583B] hover:bg-[#D0492D] text-xs font-semibold text-white cursor-pointer"
            >
              Extract & Add Posters
            </button>
          </div>
        </div>
      )}

      {inlineNotice && (
        <div
          className={`p-2.5 rounded-lg text-xs flex items-start space-x-2 border ${
            inlineNotice.type === 'ok'
              ? 'bg-emerald-950/35 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/45 border-rose-500/35 text-rose-200'
          }`}
        >
          {inlineNotice.type === 'ok' && <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />}
          <span>{inlineNotice.msg}</span>
        </div>
      )}

      {galleryImages.length === 0 ? (
        <div className="p-4 text-center rounded-lg bg-[#121419]/70 border border-dashed border-white/[0.08] text-xs text-[#8E8A82]">
          এই গ্রুপে এখনও অতিরিক্ত পোস্টার নেই। উপরের <span className="text-[#EAE5DC]">Import from Behance</span>, <span className="text-[#EAE5DC]">Upload Files</span> বা <span className="text-[#EAE5DC]">Add Slot</span> দিয়ে ২–৩+টি পোস্টার একসাথে যুক্ত করুন।
        </div>
      ) : (
        <div className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.07] bg-[#121419] overflow-hidden">
          {galleryImages.map((imgUrl, idx) => {
            const normalized = normalizeDirectImageUrl(imgUrl);
            const kind = classifyImageUrl(imgUrl);
            const needsResolve =
              kind === 'behance_page' ||
              kind === 'postimg_page' ||
              kind === 'imgbb_page' ||
              kind === 'webpage' ||
              brokenThumbs[idx];
            const isCover = Boolean(coverImage && normalized && normalizeDirectImageUrl(coverImage) === normalized);

            return (
              <div
                key={`poster-${idx}`}
                className="p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 hover:bg-white/[0.015] transition-colors"
              >
                {/* Poster Thumbnail */}
                <div className="w-14 h-14 rounded-lg bg-[#0B0C0F] border border-white/[0.08] overflow-hidden shrink-0 flex items-center justify-center">
                  {normalized && !brokenThumbs[idx] ? (
                    <img
                      src={resolveAssetUrl(normalized)}
                      alt={`Poster ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onLoad={() => setBrokenThumbs((prev) => ({ ...prev, [idx]: false }))}
                      onError={() => setBrokenThumbs((prev) => ({ ...prev, [idx]: true }))}
                    />
                  ) : (
                    <ImageIcon className={`w-5 h-5 ${brokenThumbs[idx] ? 'text-amber-400' : 'text-[#5A5750]'}`} />
                  )}
                </div>

                {/* URL + Optional Caption */}
                <div className="flex-1 w-full space-y-1.5 min-w-0">
                  <div className="flex flex-col sm:flex-row gap-1.5">
                    <input
                      type="text"
                      value={imgUrl}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const val = raw.includes('drive.google.com/') ? normalizeDirectImageUrl(raw) : raw;
                        const nextImgs = galleryImages.map((u, i) => (i === idx ? val : u));
                        setBrokenThumbs((prev) => ({ ...prev, [idx]: false }));
                        onChange(nextImgs, syncCaptions(nextImgs.length));
                      }}
                      placeholder={`Poster #${idx + 1} Direct Image URL`}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs font-mono text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                    />
                    {imgUrl && needsResolve && (
                      <button
                        type="button"
                        disabled={resolvingIdx === idx}
                        onClick={() => handleResolveItem(idx)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#1C2029] hover:bg-[#252A36] border border-white/[0.1] text-xs font-medium text-[#EAE5DC] shrink-0 cursor-pointer"
                      >
                        {resolvingIdx === idx ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Link2 className="w-3 h-3 text-[#E4583B]" />
                        )}
                        <span>Extract</span>
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={galleryCaptions[idx] || ''}
                    onChange={(e) => {
                      const nextCaps = syncCaptions(galleryImages.length);
                      nextCaps[idx] = e.target.value;
                      onChange(galleryImages, nextCaps);
                    }}
                    placeholder={`Poster #${idx + 1} label / caption (optional, e.g. Eid Campaign Poster)`}
                    className="w-full px-2.5 py-1 rounded-lg bg-[#0D0F13] border border-white/[0.06] text-xs text-[#D7D2C8] placeholder-[#6F6B64] focus:border-[#E4583B] focus:outline-none"
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-1 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    disabled={!normalized}
                    onClick={() => onChange(galleryImages, syncCaptions(galleryImages.length), normalized)}
                    title={isCover ? 'Current Cover Image' : 'Set as Project Cover'}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer disabled:opacity-30 ${
                      isCover
                        ? 'bg-[#E4583B]/15 border-[#E4583B]/60 text-[#F07C63]'
                        : 'bg-[#171A21] border-white/[0.08] text-[#A7A298] hover:text-white'
                    }`}
                  >
                    <Star className={`w-3 h-3 inline mr-1 ${isCover ? 'fill-current' : ''}`} />
                    {isCover ? 'Cover' : 'Set Cover'}
                  </button>
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, idx - 1)}
                    className="p-1.5 rounded-lg text-[#A7A298] hover:text-white hover:bg-white/[0.06] disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === galleryImages.length - 1}
                    onClick={() => handleMove(idx, idx + 1)}
                    className="p-1.5 rounded-lg text-[#A7A298] hover:text-white hover:bg-white/[0.06] disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 cursor-pointer"
                    title="Remove Poster"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

