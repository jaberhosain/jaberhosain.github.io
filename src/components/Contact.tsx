import React, { useState } from 'react';
import { Mail, Facebook, Send, CheckCircle2, AlertCircle, MessageSquare, Youtube, Copy, Check } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { EditableElement } from './common/EditableElement';
import { Reveal3D } from './common/Reveal3D';

export const Contact: React.FC = () => {
  const { portfolio, ui, loc, language, submitContactLead } = usePortfolio();
  const contactForm = portfolio.contactForm;
  const [copiedEmail, setCopiedEmail] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    honeypot: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleCopyEmail = async () => {
    const email = portfolio.contact?.email || 'sbmc.3925@gmail.com';
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      // ignore
    }
  };

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
    <div id="advice" className="py-24 bg-[#121419]/80 border-t border-[#2B303D]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Quick Availability & Email Copy Strip (sourced from real portfolio hero/contact data) */}
        <Reveal3D direction="up">
          <div className="studio-card p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs font-mono text-[#DDD1BE]">
              <span className="text-[#E4583B] font-bold uppercase tracking-wider">
                {loc(portfolio.hero.badge)}
              </span>
              {portfolio.contact?.email && (
                <>
                  <span className="mx-2 text-[#A7A298]" aria-hidden="true">·</span>
                  <span className="text-[#A7A298] break-all">{portfolio.contact.email}</span>
                </>
              )}
            </div>

            {portfolio.contact?.email && (
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-xl bg-[#20242E] hover:bg-[#272C38] border border-[#2B303D] text-xs font-mono font-semibold text-[#F4F0E8] transition-colors self-start sm:self-auto shrink-0 cursor-pointer"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#E4583B]" />
                    <span>{language === 'bn' ? 'ইমেইল কপি করুন' : 'Copy Email'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </Reveal3D>

        {/* 1. GIVE ME YOUR ADVICE FORM */}
        <Reveal3D direction="depth" delay={80}>
          <div>
          <div className="text-center mb-10">
            <EditableElement id="contact.title" label="Advice Form Title" as="h2" className="mb-3">
              <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#F4F0E8] tracking-tight uppercase">
                {contactForm?.title ? loc(contactForm.title) : ui.feedback.title}
              </span>
            </EditableElement>
            <EditableElement id="contact.subtitle" label="Advice Form Subtitle" as="p" className="text-xs sm:text-sm text-[#A7A298] font-mono max-w-lg mx-auto leading-relaxed">
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
              <label className="block text-xs font-mono text-[#A7A298] mb-1.5 uppercase">
                {contactForm?.nameLabel ? loc(contactForm.nameLabel) : ui.feedback.nameLabel}
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder={contactForm?.namePlaceholder ? loc(contactForm.namePlaceholder) : undefined}
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#181B22] border border-[#2B303D] text-[#F4F0E8] placeholder-[#A7A298]/60 text-sm focus:border-[#E4583B] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#A7A298] mb-1.5 uppercase">
                {contactForm?.emailLabel ? loc(contactForm.emailLabel) : ui.feedback.emailLabel}
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder={contactForm?.emailPlaceholder ? loc(contactForm.emailPlaceholder) : undefined}
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#181B22] border border-[#2B303D] text-[#F4F0E8] placeholder-[#A7A298]/60 text-sm focus:border-[#E4583B] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#A7A298] mb-1.5 uppercase">
                {contactForm?.messageLabel ? loc(contactForm.messageLabel) : ui.feedback.adviceLabel}
              </label>
              <textarea
                name="message"
                rows={4}
                required
                placeholder={contactForm?.messagePlaceholder ? loc(contactForm.messagePlaceholder) : undefined}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#181B22] border border-[#2B303D] text-[#F4F0E8] placeholder-[#A7A298]/60 text-sm focus:border-[#E4583B] focus:outline-none transition-colors resize-none"
              />
            </div>

            {submitStatus === 'success' && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 rtl:space-x-reverse">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{contactForm?.successMessage ? loc(contactForm.successMessage) : ui.feedback.successMessage}</span>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2 rtl:space-x-reverse">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{contactForm?.errorMessage ? loc(contactForm.errorMessage) : ui.feedback.errorMessage}</span>
              </div>
            )}

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 rounded-xl font-bold font-mono text-xs uppercase tracking-wider text-[#F4F0E8] bg-[#E4583B] hover:bg-[#D1482D] transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting
                  ? (contactForm?.submittingText ? loc(contactForm.submittingText) : ui.feedback.sending)
                  : (contactForm?.submitButtonText ? loc(contactForm.submitButtonText) : ui.feedback.sendButton)}
              </button>
            </div>
          </form>
        </div>
        </Reveal3D>

        {/* 2. HAVE A PROJECT IN MIND? (Editorial Studio Seal) */}
        <Reveal3D direction="up" delay={100}>
          <div className="studio-card relative text-center p-10 sm:p-14 rounded-3xl overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto">
            {/* Architectural Studio Monogram Seal */}
            <div className="inline-flex flex-col items-center px-7 py-4 mb-7 rounded-2xl bg-[#14171E] border border-[#2B303D]">
              <span className="font-editorial italic text-3xl text-[#DDD1BE] leading-none tracking-tight">
                MJ
              </span>
              <span className="w-8 h-px bg-[#E4583B]/60 my-2" />
              <span className="text-[10px] font-mono font-semibold text-[#A7A298] tracking-[0.22em] uppercase">
                MD. JABER HOSAIN STUDIO
              </span>
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#F4F0E8] uppercase tracking-wide mb-3">
              {contactForm?.projectPitchTitle ? loc(contactForm.projectPitchTitle) : ui.projectPitch.title}
            </h3>
            <p className="text-xs sm:text-sm font-mono text-[#A7A298] mb-8 leading-relaxed">
              {contactForm?.projectPitchSubtitle ? loc(contactForm.projectPitchSubtitle) : ui.projectPitch.subtitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={`mailto:${portfolio.contact?.email || 'sbmc.3925@gmail.com'}`}
                className="inline-flex items-center space-x-2 rtl:space-x-reverse px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold font-mono text-[#F4F0E8] bg-[#E4583B] hover:bg-[#D1482D] transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{contactForm?.projectPitchCta ? loc(contactForm.projectPitchCta) : ui.projectPitch.cta}</span>
              </a>
              {portfolio.contact?.telegramUrl && (
                <a
                  href={portfolio.contact.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 rtl:space-x-reverse px-7 py-3.5 rounded-xl text-xs sm:text-sm font-bold font-mono text-[#F4F0E8] bg-[#1E222B] hover:bg-[#252A36] border border-[#2B303D] hover:border-[#229ED9] transition-all"
                >
                  <Send className="w-4 h-4 text-[#229ED9]" />
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
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#F4F0E8] tracking-tight uppercase mb-2">
              {contactForm?.getInTouchTitle ? loc(contactForm.getInTouchTitle) : ui.getInTouch.title}
            </h3>
            <p className="text-xs sm:text-sm font-mono text-[#A7A298]">
              {contactForm?.getInTouchSubtitle ? loc(contactForm.getInTouchSubtitle) : ui.getInTouch.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Email */}
            {portfolio.contact?.email && (
              <a
                href={`mailto:${portfolio.contact.email}`}
                className="studio-card p-6 rounded-2xl hover:border-[#E4583B]/55 text-center flex flex-col items-center justify-center space-y-2 group transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#20242E] border border-[#2B303D] flex items-center justify-center text-[#E4583B] group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-xs font-mono font-bold text-[#F4F0E8] uppercase">
                  {ui.getInTouch.emailTitle}
                </div>
                <div className="text-xs text-[#A7A298] font-mono break-all">
                  {portfolio.contact.email}
                </div>
              </a>
            )}

            {/* Telegram (Direct Contact) */}
            {Boolean(portfolio.contact?.telegramUrl && portfolio.contact.telegramUrl.trim()) && (
              <a
                href={portfolio.contact?.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="studio-card p-6 rounded-2xl hover:border-[#E4583B]/55 text-center flex flex-col items-center justify-center space-y-2 group transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#20242E] border border-[#2B303D] flex items-center justify-center text-[#229ED9] group-hover:scale-105 transition-transform">
                  <Send className="w-5 h-5" />
                </div>
                <div className="text-xs font-mono font-bold text-[#F4F0E8] uppercase">
                  {ui.getInTouch.telegramTitle}
                </div>
                <div className="text-xs text-[#A7A298] font-mono">
                  {ui.getInTouch.telegramDesc}
                </div>
              </a>
            )}

            {/* Facebook (only shown if configured) */}
            {Boolean(portfolio.contact?.facebookUrl && portfolio.contact.facebookUrl.trim()) && (
              <a
                href={portfolio.contact?.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="studio-card p-6 rounded-2xl hover:border-[#E4583B]/55 text-center flex flex-col items-center justify-center space-y-2 group transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#20242E] border border-[#2B303D] flex items-center justify-center text-[#1877F2] group-hover:scale-105 transition-transform">
                  <Facebook className="w-5 h-5" />
                </div>
                <div className="text-xs font-mono font-bold text-[#F4F0E8] uppercase">
                  {ui.getInTouch.facebookTitle}
                </div>
                <div className="text-xs text-[#A7A298] font-mono">
                  {ui.getInTouch.facebookDesc}
                </div>
              </a>
            )}

            {/* YouTube (only shown if configured) */}
            {Boolean(portfolio.contact?.youtubeUrl && portfolio.contact.youtubeUrl.trim()) && (
              <a
                href={portfolio.contact?.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="studio-card p-6 rounded-2xl hover:border-[#E4583B]/55 text-center flex flex-col items-center justify-center space-y-2 group transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#20242E] border border-[#2B303D] flex items-center justify-center text-[#FF0000] group-hover:scale-105 transition-transform">
                  <Youtube className="w-5 h-5" />
                </div>
                <div className="text-xs font-mono font-bold text-[#F4F0E8] uppercase">
                  YouTube
                </div>
                <div className="text-xs text-[#A7A298] font-mono">
                  Channel & Videos
                </div>
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
