import React, { useState } from 'react';
import { Mail, Facebook, Send, CheckCircle2, AlertCircle, MessageSquare, Youtube } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { EditableElement } from './common/EditableElement';
import { Reveal3D } from './common/Reveal3D';
import { StudioGlassIcon } from './common/StudioIcon';
import { RevealContactPill } from './common/RevealContactPill';

export const Contact: React.FC = () => {
  const { portfolio, ui, loc, language, submitContactLead } = usePortfolio();
  const contactForm = portfolio.contactForm;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    honeypot: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      return;
    }

    setSubmitting(true);
    setSubmitStatus('idle');

    try {
      const ok = await submitContactLead({
        name: formData.name,
        email: formData.email,
        message: formData.message,
        projectType: 'Advice / Suggestion',
        honeypot: formData.honeypot
      });

      if (ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '', honeypot: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="advice" className="py-24 bg-[#0D0E12]/70 border-t border-white/[0.08]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Quick Availability & Click-to-Reveal Email Capsule */}
        <Reveal3D direction="up">
          <div className="glass-showcase-card p-5 rounded-[22px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-[#DDD1BE]">
              <span className="text-[#E4583B] font-semibold tracking-wide">
                {loc(portfolio.hero.badge)}
              </span>
              <span className="mx-2.5 text-[#A7A298]" aria-hidden="true">·</span>
              <span className="text-[#A7A298]">
                {language === 'bn'
                  ? 'সরাসরি ইমেইল দেখতে পাশের বাটনে ক্লিক করুন'
                  : 'Click to reveal direct email'}
              </span>
            </div>

            {portfolio.contact?.email && (
              <RevealContactPill
                type="email"
                value={portfolio.contact.email}
                href={`mailto:${portfolio.contact.email}`}
                language={language}
                compact
              />
            )}
          </div>
        </Reveal3D>

        {/* 1. GIVE ME YOUR ADVICE FORM */}
        <Reveal3D direction="depth" delay={80}>
          <div>
            <div className="text-center mb-10">
              <EditableElement id="contact.title" label="Advice Form Title" as="h2" className="mb-3">
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#F4F0E8] tracking-tight">
                  {contactForm?.title ? loc(contactForm.title) : ui.feedback.title}
                </span>
              </EditableElement>
              <EditableElement id="contact.subtitle" label="Advice Form Subtitle" as="p" className="text-xs sm:text-sm text-[#A7A298] max-w-lg mx-auto leading-relaxed">
                {contactForm?.subtitle ? loc(contactForm.subtitle) : ui.feedback.subtitle}
              </EditableElement>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
              {/* Honeypot field */}
              <input
                type="text"
                name="honeypot"
                tabIndex={-1}
                value={formData.honeypot}
                onChange={handleChange}
                className="hidden"
                autoComplete="off"
              />

              <div>
                <label className="block text-xs font-medium text-[#A7A298] mb-1.5">
                  {contactForm?.nameLabel ? loc(contactForm.nameLabel) : ui.feedback.nameLabel}
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder={contactForm?.namePlaceholder ? loc(contactForm.namePlaceholder) : undefined}
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl glass-showcase-inner text-[#F4F0E8] placeholder-[#A7A298]/55 text-sm focus:border-white/30 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7A298] mb-1.5">
                  {contactForm?.emailLabel ? loc(contactForm.emailLabel) : ui.feedback.emailLabel}
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder={contactForm?.emailPlaceholder ? loc(contactForm.emailPlaceholder) : undefined}
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl glass-showcase-inner text-[#F4F0E8] placeholder-[#A7A298]/55 text-sm focus:border-white/30 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7A298] mb-1.5">
                  {contactForm?.messageLabel ? loc(contactForm.messageLabel) : ui.feedback.adviceLabel}
                </label>
                <textarea
                  name="message"
                  rows={4}
                  required
                  placeholder={contactForm?.messagePlaceholder ? loc(contactForm.messagePlaceholder) : undefined}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl glass-showcase-inner text-[#F4F0E8] placeholder-[#A7A298]/55 text-sm focus:border-white/30 focus:outline-none transition-colors resize-none"
                />
              </div>

              {submitStatus === 'success' && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/35 text-emerald-300 text-xs flex items-center space-x-2 rtl:space-x-reverse">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={1.5} />
                  <span>{contactForm?.successMessage ? loc(contactForm.successMessage) : ui.feedback.successMessage}</span>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/35 text-rose-300 text-xs flex items-center space-x-2 rtl:space-x-reverse">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" strokeWidth={1.5} />
                  <span>{contactForm?.errorMessage ? loc(contactForm.errorMessage) : ui.feedback.errorMessage}</span>
                </div>
              )}

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 rounded-full glass-pill-cta font-semibold text-xs sm:text-sm tracking-wide transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting
                    ? (contactForm?.submittingText ? loc(contactForm.submittingText) : ui.feedback.sending)
                    : (contactForm?.submitButtonText ? loc(contactForm.submitButtonText) : ui.feedback.sendButton)}
                </button>
              </div>
            </form>
          </div>
        </Reveal3D>

        {/* 2. HAVE A PROJECT IN MIND? */}
        <Reveal3D direction="up" delay={100}>
          <div className="glass-showcase-card relative text-center p-10 sm:p-14 rounded-[28px] overflow-hidden">
            <div className="relative z-10 max-w-xl mx-auto">
              {/* Studio Monogram Seal */}
              <div className="inline-flex flex-col items-center px-7 py-4 mb-7 rounded-2xl glass-showcase-inner">
                <span className="font-editorial italic text-3xl text-[#DDD1BE] leading-none tracking-tight">
                  MJ
                </span>
                <span className="w-8 h-px bg-[#E4583B]/60 my-2" />
                <span className="text-[10px] font-medium text-[#A7A298] tracking-[0.24em] uppercase">
                  MD. JABER HOSAIN STUDIO
                </span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#F4F0E8] tracking-tight mb-3">
                {contactForm?.projectPitchTitle ? loc(contactForm.projectPitchTitle) : ui.projectPitch.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#A7A298] mb-8 leading-relaxed">
                {contactForm?.projectPitchSubtitle ? loc(contactForm.projectPitchSubtitle) : ui.projectPitch.subtitle}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3.5">
                <a
                  href={`mailto:${portfolio.contact?.email || 'sbmc.3925@gmail.com'}`}
                  className="inline-flex items-center space-x-2 rtl:space-x-reverse px-7 py-3 rounded-full glass-pill-cta text-xs sm:text-sm font-semibold transition-all"
                >
                  <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                  <span>{contactForm?.projectPitchCta ? loc(contactForm.projectPitchCta) : ui.projectPitch.cta}</span>
                </a>
                {portfolio.contact?.telegramUrl && (
                  <a
                    href={portfolio.contact.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 rtl:space-x-reverse px-6 py-3 rounded-full glass-pill-ghost text-xs sm:text-sm font-medium transition-all"
                  >
                    <Send className="w-4 h-4 text-[#DDD1BE]" strokeWidth={1.35} />
                    <span>Telegram Quick Chat</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </Reveal3D>

        {/* 3. GET IN TOUCH */}
        <div id="contact">
          <div className="text-center mb-10">
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#F4F0E8] tracking-tight mb-2">
              {contactForm?.getInTouchTitle ? loc(contactForm.getInTouchTitle) : ui.getInTouch.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#A7A298]">
              {contactForm?.getInTouchSubtitle ? loc(contactForm.getInTouchSubtitle) : ui.getInTouch.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Email (Click-to-Reveal Capsule) */}
            {portfolio.contact?.email && (
              <div className="glass-showcase-card p-6 rounded-[22px] text-center flex flex-col items-center justify-center space-y-3">
                <StudioGlassIcon size="lg">
                  <Mail className="w-5 h-5 text-[#F4F0E8]" strokeWidth={1.35} />
                </StudioGlassIcon>
                <div className="text-sm font-semibold text-[#F4F0E8]">
                  {ui.getInTouch.emailTitle}
                </div>
                <RevealContactPill
                  type="email"
                  value={portfolio.contact.email}
                  href={`mailto:${portfolio.contact.email}`}
                  language={language}
                />
              </div>
            )}

            {/* WhatsApp (Click-to-Reveal Capsule) */}
            <div className="glass-showcase-card p-6 rounded-[22px] text-center flex flex-col items-center justify-center space-y-3">
              <StudioGlassIcon size="lg">
                <MessageSquare className="w-5 h-5 text-[#F4F0E8]" strokeWidth={1.35} />
              </StudioGlassIcon>
              <div className="text-sm font-semibold text-[#F4F0E8]">
                WhatsApp
              </div>
              <RevealContactPill
                type="whatsapp"
                value="+880 1904-621391"
                href="https://wa.me/8801904621391"
                language={language}
              />
            </div>

            {/* Behance */}
            <a
              href={portfolio.contact?.behanceUrl || 'https://www.behance.net/jaberhosain'}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-showcase-card p-6 rounded-[22px] hover:-translate-y-0.5 text-center flex flex-col items-center justify-center space-y-2.5 group transition-all"
            >
              <StudioGlassIcon size="lg" className="group-hover:scale-105">
                <span className="text-sm font-bold text-[#F4F0E8]">Bē</span>
              </StudioGlassIcon>
              <div className="text-sm font-semibold text-[#F4F0E8]">
                Behance Portfolio
              </div>
              <div className="text-xs text-[#A7A298]">
                behance.net/jaberhosain
              </div>
            </a>

            {/* Telegram */}
            {Boolean(portfolio.contact?.telegramUrl && portfolio.contact.telegramUrl.trim()) && (
              <a
                href={portfolio.contact?.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-showcase-card p-6 rounded-[22px] hover:-translate-y-0.5 text-center flex flex-col items-center justify-center space-y-2.5 group transition-all"
              >
                <StudioGlassIcon size="lg" className="group-hover:scale-105">
                  <Send className="w-5 h-5 text-[#F4F0E8]" strokeWidth={1.35} />
                </StudioGlassIcon>
                <div className="text-sm font-semibold text-[#F4F0E8]">
                  {ui.getInTouch.telegramTitle}
                </div>
                <div className="text-xs text-[#A7A298]">
                  {ui.getInTouch.telegramDesc}
                </div>
              </a>
            )}

            {/* Facebook */}
            {Boolean(portfolio.contact?.facebookUrl && portfolio.contact.facebookUrl.trim()) && (
              <a
                href={portfolio.contact?.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-showcase-card p-6 rounded-[22px] hover:-translate-y-0.5 text-center flex flex-col items-center justify-center space-y-2.5 group transition-all"
              >
                <StudioGlassIcon size="lg" className="group-hover:scale-105">
                  <Facebook className="w-5 h-5 text-[#F4F0E8]" strokeWidth={1.35} />
                </StudioGlassIcon>
                <div className="text-sm font-semibold text-[#F4F0E8]">
                  {ui.getInTouch.facebookTitle}
                </div>
                <div className="text-xs text-[#A7A298]">
                  {ui.getInTouch.facebookDesc}
                </div>
              </a>
            )}

            {/* YouTube */}
            {Boolean(portfolio.contact?.youtubeUrl && portfolio.contact.youtubeUrl.trim()) && (
              <a
                href={portfolio.contact?.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-showcase-card p-6 rounded-[22px] hover:-translate-y-0.5 text-center flex flex-col items-center justify-center space-y-2.5 group transition-all"
              >
                <StudioGlassIcon size="lg" className="group-hover:scale-105">
                  <Youtube className="w-5 h-5 text-[#F4F0E8]" strokeWidth={1.35} />
                </StudioGlassIcon>
                <div className="text-sm font-semibold text-[#F4F0E8]">
                  YouTube
                </div>
                <div className="text-xs text-[#A7A298]">
                  Channel &amp; Videos
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
