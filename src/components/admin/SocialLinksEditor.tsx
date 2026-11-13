import React, { useState } from 'react';
import { 
  Share2, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink,
  Facebook,
  Send,
  Youtube,
  Instagram,
  Linkedin,
  MessageCircle,
  Twitter,
  Github,
  Globe,
  Check
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { SocialLinkItem } from '../../types/portfolio';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { defaultSocialLinks } from '../../data/initialPortfolio';

const PLATFORM_PRESETS: { platform: string; name: string; icon: string; defaultUrl: string }[] = [
  { platform: 'facebook', name: 'Facebook', icon: 'facebook', defaultUrl: 'https://www.facebook.com/' },
  { platform: 'telegram', name: 'Telegram', icon: 'telegram', defaultUrl: 'https://t.me/' },
  { platform: 'behance', name: 'Behance', icon: 'behance', defaultUrl: 'https://www.behance.net/' },
  { platform: 'youtube', name: 'YouTube', icon: 'youtube', defaultUrl: 'https://www.youtube.com/' },
  { platform: 'instagram', name: 'Instagram', icon: 'instagram', defaultUrl: 'https://www.instagram.com/' },
  { platform: 'linkedin', name: 'LinkedIn', icon: 'linkedin', defaultUrl: 'https://www.linkedin.com/in/' },
  { platform: 'whatsapp', name: 'WhatsApp', icon: 'whatsapp', defaultUrl: 'https://wa.me/' },
  { platform: 'twitter', name: 'X (Twitter)', icon: 'twitter', defaultUrl: 'https://x.com/' },
  { platform: 'github', name: 'GitHub', icon: 'github', defaultUrl: 'https://github.com/' },
  { platform: 'custom', name: 'Custom Website', icon: 'globe', defaultUrl: 'https://' }
];

export const SocialLinksEditor: React.FC = () => {
  const { draftPortfolio, updateDraft } = usePortfolio();
  
  // Resolve socialLinks safely with fallback
  const socialLinks: SocialLinkItem[] = Array.isArray(draftPortfolio.socialLinks) && draftPortfolio.socialLinks.length > 0
    ? draftPortfolio.socialLinks
    : (defaultSocialLinks || []);

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const renderPlatformIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'facebook':
        return <Facebook className="w-4 h-4 text-[#1877F2]" />;
      case 'telegram':
        return <Send className="w-4 h-4 text-[#229ED9]" />;
      case 'behance':
        return <span className="font-bold text-xs text-[#0057FF]">Bē</span>;
      case 'youtube':
        return <Youtube className="w-4 h-4 text-[#FF0000]" />;
      case 'instagram':
        return <Instagram className="w-4 h-4 text-[#E4405F]" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4 text-[#0A66C2]" />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-[#25D366]" />;
      case 'twitter':
        return <Twitter className="w-4 h-4 text-[#1DA1F2]" />;
      case 'github':
        return <Github className="w-4 h-4 text-white" />;
      default:
        return <Globe className="w-4 h-4 text-[#FF5722]" />;
    }
  };

  const handleAddSocialLink = (preset = PLATFORM_PRESETS[0]) => {
    const newItem: SocialLinkItem = {
      id: 'soc-' + Date.now(),
      platform: preset.platform,
      name: preset.name,
      url: preset.defaultUrl,
      icon: preset.icon,
      enabled: true,
      order: socialLinks.length + 1
    };

    updateDraft(prev => ({
      ...prev,
      socialLinks: [...(prev.socialLinks || socialLinks), newItem]
    }));
  };

  const handleUpdateItem = (id: string, updater: (item: SocialLinkItem) => SocialLinkItem) => {
    updateDraft(prev => ({
      ...prev,
      socialLinks: (prev.socialLinks || socialLinks).map(s => s.id === id ? updater(s) : s)
    }));
  };

  const handleRemoveItem = (id: string) => {
    updateDraft(prev => ({
      ...prev,
      socialLinks: (prev.socialLinks || socialLinks).filter(s => s.id !== id)
    }));
  };

  const handleMove = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= socialLinks.length) return;

    const nextList = [...socialLinks];
    const temp = nextList[idx];
    nextList[idx] = nextList[targetIdx];
    nextList[targetIdx] = temp;

    // re-assign order property
    const reordered = nextList.map((item, i) => ({ ...item, order: i + 1 }));

    updateDraft(prev => ({
      ...prev,
      socialLinks: reordered
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="p-6 rounded-3xl bg-[#12161A] border border-[#232B33] space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1D232A]">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-[#181E24] border border-[#232B33] flex items-center justify-center text-[#FF5722]">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                Connect With Me — Footer Social Links
              </h3>
              <p className="text-xs text-neutral-400 font-mono">
                Manage icons, links, and visibility in the footer &quot;Connect With Me&quot; section
              </p>
            </div>
          </div>

          {/* Quick Add Presets */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleAddSocialLink(PLATFORM_PRESETS[3])} // YouTube
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-xs font-bold text-white transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Platform</span>
            </button>
          </div>
        </div>

        {/* Presets Bar */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase text-neutral-400 block tracking-wider">
            Quick Add Platform:
          </span>
          <div className="flex flex-wrap gap-2">
            {PLATFORM_PRESETS.map((p) => {
              const alreadyExists = socialLinks.some(s => s.platform.toLowerCase() === p.platform.toLowerCase());
              return (
                <button
                  key={p.platform}
                  type="button"
                  onClick={() => handleAddSocialLink(p)}
                  className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                    alreadyExists
                      ? 'bg-[#181E24] text-neutral-400 border-[#232B33] hover:border-neutral-500'
                      : 'bg-[#181E24] text-white border-[#232B33] hover:border-[#FF5722] hover:text-[#FF5722]'
                  }`}
                  title={`Add ${p.name}`}
                >
                  {renderPlatformIcon(p.icon)}
                  <span>{p.name}</span>
                  {alreadyExists && <Check className="w-3 h-3 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Social Links List */}
        <div className="space-y-4 pt-2">
          {socialLinks.map((item, idx) => (
            <div
              key={item.id || idx}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                item.enabled
                  ? 'bg-[#181E24] border-[#232B33]'
                  : 'bg-[#12161A]/60 border-[#1D232A] opacity-75'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-8 h-8 rounded-lg bg-[#0F1419] border border-[#232B33] flex items-center justify-center">
                    {renderPlatformIcon(item.icon || item.platform)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {item.name || item.platform}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                      Slot #{idx + 1}
                    </span>
                  </div>
                </div>

                {/* Controls: Enable toggle, Reorder, Delete */}
                <div className="flex items-center space-x-2">
                  {/* Enable / Disable toggle */}
                  <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-mono text-neutral-300 mr-2">
                    <input
                      type="checkbox"
                      checked={item.enabled !== false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        handleUpdateItem(item.id, current => ({ ...current, enabled: checked }));
                      }}
                      className="rounded border-[#232B33] bg-[#0F1419] text-[#FF5722] focus:ring-0 focus:ring-offset-0"
                    />
                    <span className={item.enabled !== false ? 'text-emerald-400' : 'text-neutral-500'}>
                      {item.enabled !== false ? 'Visible' : 'Hidden'}
                    </span>
                  </label>

                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-[#232B33] transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === socialLinks.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-[#232B33] transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ id: item.id, name: item.name || item.platform })}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors ml-1"
                    title="Delete Social Icon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-mono text-neutral-400 mb-1">
                    Platform / Display Name
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleUpdateItem(item.id, current => ({ ...current, name: val }));
                    }}
                    placeholder="e.g. Facebook"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-mono text-neutral-400 mb-1">
                    Profile / Direct URL
                  </label>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="url"
                      value={item.url}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleUpdateItem(item.id, current => ({ ...current, url: val }));
                      }}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white font-mono"
                    />
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-neutral-400 hover:text-[#FF5722] hover:bg-[#0F1419] rounded-lg transition-colors"
                        title="Open Link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        title="Delete Social Link?"
        itemName={deleteTarget?.name}
        message="Are you sure you want to remove this social platform from your 'Connect With Me' section? It will be removed from your draft portfolio. Changes take effect on the live website when you click Publish."
        onConfirm={() => {
          if (deleteTarget) {
            handleRemoveItem(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
