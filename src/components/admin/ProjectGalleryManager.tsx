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
  CheckCircle
} from 'lucide-react';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { normalizeDirectImageUrl, resolveImageFromUrl, classifyImageUrl } from '../../lib/imageUrlResolver';
import { uploadMediaToStorage } from '../../lib/mediaUpload';

interface ProjectGalleryManagerProps {
  galleryImages: string[];
  galleryCaptions?: string[];
  coverImage?: string;
  onChange: (nextImages: string[], nextCaptions?: string[], newCover?: string) => void;
}

export const ProjectGalleryManager: React.FC<ProjectGalleryManagerProps> = ({
  galleryImages = [],
  galleryCaptions = [],
  coverImage = '',
  onChange
}) => {
  const multiFileRef = useRef<HTMLInputElement>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [resolvingIdx, setResolvingIdx] = useState<number | null>(null);
  const [inlineNotice, setInlineNotice] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const [brokenThumbs, setBrokenThumbs] = useState<Record<number, boolean>>({});

  const flashNotice = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setInlineNotice({ type, msg });
    setTimeout(() => setInlineNotice(null), 5000);
  };

  const syncCaptions = (len: number, baseCaptions: string[] = galleryCaptions) => {
    return Array.from({ length: len }, (_, i) => baseCaptions[i] || '');
  };

  const handleAddBlankPoster = () => {
    const nextImgs = [...galleryImages, ''];
    const nextCaps = syncCaptions(nextImgs.length);
    onChange(nextImgs, nextCaps);
  };

  const handleBulkPasteAdd = async () => {
    const rawLines = bulkText
      .split(/[\n\r]+/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (rawLines.length === 0) return;

    const normalized = rawLines.map((line) => normalizeDirectImageUrl(line));
    const nextImgs = [...galleryImages, ...normalized];
    const nextCaps = syncCaptions(nextImgs.length);
    const autoCover = !coverImage ? normalized[0] : undefined;

    onChange(nextImgs, nextCaps, autoCover);
    setBulkText('');
    setBulkOpen(false);
    flashNotice(`Added ${normalized.length} poster link${normalized.length > 1 ? 's' : ''} to this project group.`);
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
      flashNotice(`Uploaded ${uploadedUrls.length} poster image${uploadedUrls.length > 1 ? 's' : ''}!`);
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
    <div className="p-4 rounded-2xl bg-[#0F1419] border border-[#232B33] space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1D232A]">
        <div>
          <h4 className="text-xs font-mono font-bold text-white flex items-center space-x-2">
            <ImageIcon className="w-3.5 h-3.5 text-[#FF5722]" />
            <span>Posters Inside This Project Group ({galleryImages.length})</span>
          </h4>
          <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
            On Behance: open a project &rarr; right-click any poster &rarr; <span className="text-neutral-200">&ldquo;Copy image address&rdquo;</span> (<code className="text-[#60A5FA]">mir-s3-cdn-cf.behance.net/...</code>) and paste below.
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
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#181E24] hover:bg-[#232B33] border border-[#232B33] text-[11px] font-mono text-white cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-3 h-3 text-[#FF5722]" />
            <span>{uploadingFiles ? 'Uploading...' : 'Upload Posters'}</span>
          </button>

          <button
            type="button"
            onClick={() => setBulkOpen((v) => !v)}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#0057FF]/15 hover:bg-[#0057FF]/25 border border-[#0057FF]/35 text-[11px] font-mono text-[#60A5FA] cursor-pointer"
          >
            <ListPlus className="w-3 h-3" />
            <span>Bulk Paste URLs</span>
          </button>

          <button
            type="button"
            onClick={handleAddBlankPoster}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#FF5722] hover:bg-[#F4511E] text-[11px] font-mono font-bold text-white cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Poster</span>
          </button>
        </div>
      </div>

      {/* Bulk multi-line URL paste drawer */}
      {bulkOpen && (
        <div className="p-3 rounded-xl bg-[#0B0F12] border border-[#0057FF]/40 space-y-2">
          <label className="block text-[11px] font-mono text-neutral-300">
            Paste multiple Behance / Postimages / Drive direct image URLs (one link per line):
          </label>
          <textarea
            rows={4}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={'https://mir-s3-cdn-cf.behance.net/project_modules/...\nhttps://i.postimg.cc/...'}
            className="w-full px-3 py-2 rounded-xl bg-[#12161A] border border-[#232B33] text-xs font-mono text-white focus:border-[#0057FF] focus:outline-none"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setBulkOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-neutral-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBulkPasteAdd}
              className="px-3.5 py-1.5 rounded-lg bg-[#0057FF] hover:bg-[#0047D4] text-xs font-mono font-bold text-white cursor-pointer"
            >
              Add All Links
            </button>
          </div>
        </div>
      )}

      {inlineNotice && (
        <div
          className={`p-2.5 rounded-xl text-[11px] font-mono flex items-start space-x-2 border ${
            inlineNotice.type === 'ok'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
          }`}
        >
          {inlineNotice.type === 'ok' && <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
          <span>{inlineNotice.msg}</span>
        </div>
      )}

      {galleryImages.length === 0 ? (
        <div className="p-4 text-center rounded-xl bg-[#0B0F12]/70 border border-dashed border-[#232B33] text-[11px] font-mono text-neutral-500">
          No extra posters in this group yet. Click <span className="text-neutral-300">&ldquo;Add Poster&rdquo;</span>, <span className="text-neutral-300">&ldquo;Bulk Paste URLs&rdquo;</span>, or <span className="text-neutral-300">&ldquo;Upload Posters&rdquo;</span> to group multiple designs under this project.
        </div>
      ) : (
        <div className="space-y-2.5">
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
                className="p-3 rounded-xl bg-[#0B0F12] border border-[#232B33] flex flex-col sm:flex-row items-start sm:items-center gap-3"
              >
                {/* Poster Thumbnail */}
                <div className="w-14 h-14 rounded-lg bg-[#141A20] border border-[#232B33] overflow-hidden shrink-0 flex items-center justify-center">
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
                    <ImageIcon className={`w-5 h-5 ${brokenThumbs[idx] ? 'text-amber-400' : 'text-neutral-600'}`} />
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
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#141A20] border border-[#232B33] text-xs font-mono text-white focus:border-[#FF5722] focus:outline-none"
                    />
                    {imgUrl && needsResolve && (
                      <button
                        type="button"
                        disabled={resolvingIdx === idx}
                        onClick={() => handleResolveItem(idx)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#0057FF]/20 hover:bg-[#0057FF]/30 border border-[#0057FF]/40 text-[11px] font-mono text-[#60A5FA] shrink-0 cursor-pointer"
                      >
                        {resolvingIdx === idx ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Link2 className="w-3 h-3" />
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
                    className="w-full px-2.5 py-1 rounded-lg bg-[#12161A] border border-[#1D232A] text-[11px] font-mono text-neutral-300 focus:border-[#FF5722] focus:outline-none"
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-1 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    disabled={!normalized}
                    onClick={() => onChange(galleryImages, syncCaptions(galleryImages.length), normalized)}
                    title={isCover ? 'Current Cover Image' : 'Set as Project Cover'}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-mono border transition-colors cursor-pointer disabled:opacity-30 ${
                      isCover
                        ? 'bg-[#FF5722]/20 border-[#FF5722] text-[#FF5722]'
                        : 'bg-[#141A20] border-[#232B33] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Star className={`w-3 h-3 inline mr-1 ${isCover ? 'fill-current' : ''}`} />
                    {isCover ? 'Cover' : 'Set Cover'}
                  </button>
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, idx - 1)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#181E24] disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === galleryImages.length - 1}
                    onClick={() => handleMove(idx, idx + 1)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#181E24] disabled:opacity-30 cursor-pointer"
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
