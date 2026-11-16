import React from 'react';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Layers,
  Video,
  Palette,
  MessageSquareQuote,
  BarChart3,
  Wrench
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  HeroCounterItem,
  HomeSectionId,
  StudioFocusMode,
  TestimonialItem
} from '../../types/portfolio';

interface StatsTestimonialsEditorProps {
  onNotify?: (msg: string, type?: 'success' | 'error') => void;
}

const HOME_SECTION_LABELS: Record<HomeSectionId, { title: string; subtitle: string }> = {
  caseStudies: { title: 'Work That Delivers Real Results (Case Studies)', subtitle: 'Problem / Process / Result cards' },
  videoShowcase: { title: 'Selected Reels Showcase (Video Carousel)', subtitle: 'Video editing & motion reels' },
  graphicShowcase: { title: 'Graphic Design Archive (Spotlight)', subtitle: 'Featured posters & Behance series' },
  aboutPreview: { title: 'About Me Preview & Core Toolkit', subtitle: 'Bio, photo & software tags' },
  trustTestimonials: { title: 'Trust Stats & Client Testimonials', subtitle: 'Projects count, experience & reviews' },
  overviewDirectory: { title: 'Navigate Dedicated Pages', subtitle: 'Overview gateway cards' }
};

export const StatsTestimonialsEditor: React.FC<StatsTestimonialsEditorProps> = ({ onNotify }) => {
  const { draftPortfolio, updateDraft } = usePortfolio();

  const stats = [...(draftPortfolio.homeStats || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const tools = draftPortfolio.homeTools || [];
  const testimonials = [...(draftPortfolio.testimonials || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const sectionOrder: HomeSectionId[] =
    draftPortfolio.homeSectionOrder && draftPortfolio.homeSectionOrder.length > 0
      ? draftPortfolio.homeSectionOrder
      : [
          'caseStudies',
          'videoShowcase',
          'graphicShowcase',
          'aboutPreview',
          'trustTestimonials',
          'overviewDirectory'
        ];
  const visibility = draftPortfolio.homeSectionVisibility || {};

  const testimonialsHeader = draftPortfolio.testimonialsSection || {
    tag: { en: 'Client Trust & Feedback', bn: 'ক্লায়েন্টদের মতামত', ar: 'ثقة وآراء العملاء' },
    title: { en: 'What Clients & Collaborators Say', bn: 'ক্লায়েন্টরা যা বলেন', ar: 'ماذا يقول العملاء والشركاء' },
    visible: true
  };

  // Home Stats CRUD
  const addStat = () => {
    const newStat: HeroCounterItem = {
      id: 'stat-' + Date.now(),
      value: '10+',
      label: { en: 'New Metric', bn: 'নতুন পরিসংখ্যান', ar: 'إحصائية' },
      order: stats.length + 1
    };
    updateDraft((prev) => ({
      ...prev,
      homeStats: [...(prev.homeStats || []), newStat]
    }));
    onNotify?.('Added new stat card');
  };

  const updateStat = (id: string, updater: (s: HeroCounterItem) => HeroCounterItem) => {
    updateDraft((prev) => ({
      ...prev,
      homeStats: (prev.homeStats || []).map((s) => (s.id === id ? updater(s) : s))
    }));
  };

  const removeStat = (id: string) => {
    updateDraft((prev) => ({
      ...prev,
      homeStats: (prev.homeStats || []).filter((s) => s.id !== id)
    }));
    onNotify?.('Stat removed');
  };

  // Testimonials CRUD
  const addTestimonial = () => {
    const newItem: TestimonialItem = {
      id: 'test-' + Date.now(),
      clientName: 'Client Name',
      clientRole: { en: 'Brand Founder', bn: 'ব্র্যান্ড ফাউন্ডার', ar: 'مؤسس' },
      rating: 5,
      quote: {
        en: 'Excellent video editing and design quality delivered on schedule.',
        bn: 'সময়মতো চমৎকার ভিডিও এডিটিং এবং ডিজাইন ডেলিভারি পেয়েছি।',
        ar: ''
      },
      visible: true,
      order: testimonials.length + 1
    };
    updateDraft((prev) => ({
      ...prev,
      testimonials: [...(prev.testimonials || []), newItem]
    }));
    onNotify?.('Added new client testimonial');
  };

  const updateTestimonial = (id: string, updater: (t: TestimonialItem) => TestimonialItem) => {
    updateDraft((prev) => ({
      ...prev,
      testimonials: (prev.testimonials || []).map((t) => (t.id === id ? updater(t) : t))
    }));
  };

  const removeTestimonial = (id: string) => {
    updateDraft((prev) => ({
      ...prev,
      testimonials: (prev.testimonials || []).filter((t) => t.id !== id)
    }));
    onNotify?.('Testimonial removed');
  };

  // Section reorder
  const moveHomeSection = (idx: number, delta: -1 | 1) => {
    const target = idx + delta;
    if (target < 0 || target >= sectionOrder.length) return;
    const nextOrder = [...sectionOrder];
    const [moved] = nextOrder.splice(idx, 1);
    nextOrder.splice(target, 0, moved);
    updateDraft((prev) => ({
      ...prev,
      homeSectionOrder: nextOrder
    }));
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* 1. Studio Focus Mode Control */}
      <section className="p-5 rounded-2xl bg-[#171A21] border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#F4F0E8] flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#E4583B]" />
              <span>Studio Focus Mode (Video Editing vs Graphic Design)</span>
            </h3>
            <p className="text-xs text-[#8E8A82] mt-0.5">
              নির্ধারণ করুন ভিজিটর প্রথমে কী দেখবেন — শুধু ভিডিও (YouTube &amp; Reels), শুধু গ্রাফিক্স (Behance &amp; Posters), নাকি সব কাজ একসাথে।
            </p>
          </div>
          <label className="inline-flex items-center space-x-2 text-xs text-[#D7D2C8] cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={draftPortfolio.showFocusSwitcher !== false}
              onChange={(e) =>
                updateDraft((prev) => ({ ...prev, showFocusSwitcher: e.target.checked }))
              }
              className="accent-[#E4583B]"
            />
            <span>Show Switcher on Hero</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { id: 'all' as StudioFocusMode, label: 'All Studio (Both)', desc: 'Shows both Video & Graphic links & sections', icon: Layers },
            { id: 'video' as StudioFocusMode, label: 'Video & Motion Only', desc: 'Highlights YouTube, Reels & Video cases', icon: Video },
            { id: 'graphic' as StudioFocusMode, label: 'Graphic Design Only', desc: 'Highlights Behance, Posters & Graphic cases', icon: Palette }
          ].map((opt) => {
            const Icon = opt.icon;
            const active = (draftPortfolio.defaultFocusMode || 'all') === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  updateDraft((prev) => ({
                    ...prev,
                    defaultFocusMode: opt.id
                  }))
                }
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  active
                    ? 'bg-[#E4583B]/15 border-[#E4583B] text-white'
                    : 'bg-[#0B0C0F] border-white/[0.08] text-[#A7A298] hover:border-white/25'
                }`}
              >
                <div className="flex items-center space-x-2 text-xs font-semibold">
                  <Icon className={`w-4 h-4 ${active ? 'text-[#E4583B]' : 'text-[#8E8A82]'}`} />
                  <span>{opt.label}</span>
                </div>
                <p className="text-[11px] text-[#8E8A82] mt-1">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Home Stats Row */}
      <section className="p-5 rounded-2xl bg-[#171A21] border border-white/[0.08] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#F4F0E8] flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-[#E4583B]" />
              <span>Home Stats Cards (50+ Projects, 1.5+ Years, 30+ Clients)</span>
            </h3>
            <p className="text-xs text-[#8E8A82] mt-0.5">Edit numbers, labels, or add/remove counters.</p>
          </div>
          <div className="flex items-center space-x-3">
            <label className="inline-flex items-center space-x-1.5 text-xs text-[#D7D2C8] cursor-pointer">
              <input
                type="checkbox"
                checked={draftPortfolio.showHomeStats !== false}
                onChange={(e) =>
                  updateDraft((prev) => ({ ...prev, showHomeStats: e.target.checked }))
                }
                className="accent-[#E4583B]"
              />
              <span>Visible</span>
            </label>
            <button
              type="button"
              onClick={addStat}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#E4583B] hover:bg-[#D0492D] text-white text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stat</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {stats.map((st) => (
            <div
              key={st.id}
              className="p-3.5 rounded-xl bg-[#0B0C0F] border border-white/[0.08] grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
            >
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-[#8E8A82] mb-1">Value</label>
                <input
                  type="text"
                  value={st.value}
                  onChange={(e) =>
                    updateStat(st.id, (prev) => ({ ...prev, value: e.target.value }))
                  }
                  className="w-full px-2.5 py-2 rounded-lg bg-[#121419] border border-white/[0.08] text-xs font-bold text-[#F4F0E8]"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-[11px] text-[#8E8A82] mb-1">Label (EN)</label>
                <input
                  type="text"
                  value={st.label?.en || ''}
                  onChange={(e) =>
                    updateStat(st.id, (prev) => ({
                      ...prev,
                      label: { ...(prev.label || { en: '', bn: '', ar: '' }), en: e.target.value }
                    }))
                  }
                  className="w-full px-2.5 py-2 rounded-lg bg-[#121419] border border-white/[0.08] text-xs text-[#F4F0E8]"
                />
              </div>
              <div className="sm:col-span-5">
                <label className="block text-[11px] text-[#8E8A82] mb-1">Label (বাংলা)</label>
                <input
                  type="text"
                  value={st.label?.bn || ''}
                  onChange={(e) =>
                    updateStat(st.id, (prev) => ({
                      ...prev,
                      label: { ...(prev.label || { en: '', bn: '', ar: '' }), bn: e.target.value }
                    }))
                  }
                  className="w-full px-2.5 py-2 rounded-lg bg-[#121419] border border-white/[0.08] text-xs text-[#F4F0E8]"
                />
              </div>
              <div className="sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeStat(st.id)}
                  className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/15 cursor-pointer"
                  title="Remove stat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Home Toolkit Pills */}
      <section className="p-5 rounded-2xl bg-[#171A21] border border-white/[0.08] space-y-3">
        <h3 className="text-sm font-semibold text-[#F4F0E8] flex items-center space-x-2">
          <Wrench className="w-4 h-4 text-[#E4583B]" />
          <span>Home &ldquo;About Me&rdquo; Toolkit Software Pills</span>
        </h3>
        <input
          type="text"
          value={tools.join(', ')}
          onChange={(e) => {
            const list = e.target.value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
            updateDraft((prev) => ({ ...prev, homeTools: list }));
          }}
          placeholder="Adobe Premiere Pro, Adobe After Effects, Adobe Photoshop..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8]"
        />
        <p className="text-[11px] text-[#8E8A82]">Comma-separated list of software badges shown on Home About preview.</p>
      </section>

      {/* 4. Home Section Order & Visibility */}
      <section className="p-5 rounded-2xl bg-[#171A21] border border-white/[0.08] space-y-3">
        <h3 className="text-sm font-semibold text-[#F4F0E8]">
          Home Page Section Order &amp; Visibility
        </h3>
        <div className="space-y-2">
          {sectionOrder.map((secId, idx) => {
            const meta = HOME_SECTION_LABELS[secId];
            const isVis = visibility[secId] !== false;
            return (
              <div
                key={secId}
                className="p-3 rounded-xl bg-[#0B0C0F] border border-white/[0.08] flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#F4F0E8] truncate">
                    {idx + 1}. {meta?.title || secId}
                  </div>
                  <div className="text-[11px] text-[#8E8A82] truncate">{meta?.subtitle}</div>
                </div>
                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveHomeSection(idx, -1)}
                    className="p-1.5 rounded-lg bg-[#121419] border border-white/[0.08] text-[#A7A298] hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sectionOrder.length - 1}
                    onClick={() => moveHomeSection(idx, 1)}
                    className="p-1.5 rounded-lg bg-[#121419] border border-white/[0.08] text-[#A7A298] hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateDraft((prev) => ({
                        ...prev,
                        homeSectionVisibility: {
                          ...(prev.homeSectionVisibility || {}),
                          [secId]: !isVis
                        }
                      }))
                    }
                    className={`p-1.5 rounded-lg border cursor-pointer ${
                      isVis
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {isVis ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Client Testimonials */}
      <section className="p-5 rounded-2xl bg-[#171A21] border border-white/[0.08] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#F4F0E8] flex items-center space-x-2">
              <MessageSquareQuote className="w-4 h-4 text-[#E4583B]" />
              <span>Client Testimonials</span>
            </h3>
            <p className="text-xs text-[#8E8A82] mt-0.5">Add, edit, hide or delete client reviews.</p>
          </div>
          <div className="flex items-center space-x-3">
            <label className="inline-flex items-center space-x-1.5 text-xs text-[#D7D2C8] cursor-pointer">
              <input
                type="checkbox"
                checked={testimonialsHeader.visible !== false}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    testimonialsSection: {
                      ...testimonialsHeader,
                      visible: e.target.checked
                    }
                  }))
                }
                className="accent-[#E4583B]"
              />
              <span>Visible</span>
            </label>
            <button
              type="button"
              onClick={addTestimonial}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#E4583B] hover:bg-[#D0492D] text-white text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Testimonial</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-white/[0.06]">
          <div>
            <label className="block text-[11px] text-[#8E8A82] mb-1">Section Title (EN)</label>
            <input
              type="text"
              value={testimonialsHeader.title?.en || ''}
              onChange={(e) =>
                updateDraft((prev) => ({
                  ...prev,
                  testimonialsSection: {
                    ...testimonialsHeader,
                    title: { ...(testimonialsHeader.title || { en: '', bn: '', ar: '' }), en: e.target.value }
                  }
                }))
              }
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8]"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#8E8A82] mb-1">Section Title (বাংলা)</label>
            <input
              type="text"
              value={testimonialsHeader.title?.bn || ''}
              onChange={(e) =>
                updateDraft((prev) => ({
                  ...prev,
                  testimonialsSection: {
                    ...testimonialsHeader,
                    title: { ...(testimonialsHeader.title || { en: '', bn: '', ar: '' }), bn: e.target.value }
                  }
                }))
              }
              className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8]"
            />
          </div>
        </div>

        <div className="space-y-4">
          {testimonials.map((t, idx) => (
            <div key={t.id} className="p-4 rounded-xl bg-[#0B0C0F] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#E4583B]">#{idx + 1} · {t.clientName}</span>
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      updateTestimonial(t.id, (prev) => ({
                        ...prev,
                        visible: prev.visible === false ? true : false
                      }))
                    }
                    className="p-1.5 rounded bg-[#121419] border border-white/[0.08] text-xs text-[#A7A298] cursor-pointer"
                  >
                    {t.visible === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTestimonial(t.id)}
                    className="p-1.5 rounded text-rose-400 hover:bg-rose-500/15 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] text-[#8E8A82] mb-1">Client Name</label>
                  <input
                    type="text"
                    value={t.clientName}
                    onChange={(e) =>
                      updateTestimonial(t.id, (prev) => ({ ...prev, clientName: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#121419] border border-white/[0.08] text-xs text-[#F4F0E8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8E8A82] mb-1">Role (EN)</label>
                  <input
                    type="text"
                    value={t.clientRole?.en || ''}
                    onChange={(e) =>
                      updateTestimonial(t.id, (prev) => ({
                        ...prev,
                        clientRole: { ...(prev.clientRole || { en: '', bn: '', ar: '' }), en: e.target.value }
                      }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#121419] border border-white/[0.08] text-xs text-[#F4F0E8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8E8A82] mb-1">Role (বাংলা)</label>
                  <input
                    type="text"
                    value={t.clientRole?.bn || ''}
                    onChange={(e) =>
                      updateTestimonial(t.id, (prev) => ({
                        ...prev,
                        clientRole: { ...(prev.clientRole || { en: '', bn: '', ar: '' }), bn: e.target.value }
                      }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#121419] border border-white/[0.08] text-xs text-[#F4F0E8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-[#8E8A82] mb-1">Quote (English)</label>
                  <textarea
                    rows={2}
                    value={t.quote?.en || ''}
                    onChange={(e) =>
                      updateTestimonial(t.id, (prev) => ({
                        ...prev,
                        quote: { ...(prev.quote || { en: '', bn: '', ar: '' }), en: e.target.value }
                      }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#121419] border border-white/[0.08] text-xs text-[#F4F0E8] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8E8A82] mb-1">Quote (বাংলা)</label>
                  <textarea
                    rows={2}
                    value={t.quote?.bn || ''}
                    onChange={(e) =>
                      updateTestimonial(t.id, (prev) => ({
                        ...prev,
                        quote: { ...(prev.quote || { en: '', bn: '', ar: '' }), bn: e.target.value }
                      }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#121419] border border-white/[0.08] text-xs text-[#F4F0E8] resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
