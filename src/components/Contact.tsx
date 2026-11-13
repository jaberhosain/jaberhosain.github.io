import React, { useState } from 'react';
import { Mail, Facebook, Send, CheckCircle2, AlertCircle, MessageSquare, Youtube, Copy, Check } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { EditableElement } from './common/EditableElement';

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
    <div id="advice" className="py-24 bg-[#0B0F12] border-t border-[#1D232A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Quick Availability & Email Copy Strip (sourced from real portfolio hero/contact data) */}
        <div className="p-5 rounded-2xl bg-[#12161A] border border-[#232B33] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs font-mono text-neutral-300">
            <span className="text-[#FF5722] font-bold uppercase tracking-wider">
              {loc(portfolio.hero.badge)}
            </span>
            {portfolio.contact?.email && (
              <>
                <span className="mx-2 text-neutral-600" aria-hidden="true">·</span>
                <span className="text-neutral-400 break-all">{portfolio.contact.email}</span>
              </>
            )}
          </div>

          {portfolio.contact?.email && (
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-xl bg-[#181E24] hover:bg-[#1E252D] border border-[#232B33] text-xs font-mono font-semibold text-white transition-colors self-start sm:self-auto shrink-0 cursor-pointer"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span>{language === 'bn' ? 'ইমেইল কপি করুন' : 'Copy Email'}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* 1. GIVE ME YOUR ADVICE FORM */}
        <div>
          <div className="text-center mb-10">
            <EditableElement id="contact.title" label="Advice Form Title" as="h2" className="mb-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
                {contactForm?.title ? loc(contactForm.title) : ui.feedback.title}
              </span>
            </EditableElement>
            <EditableElement id="contact.subtitle" label="Advice Form Subtitle" as="p" className="text-xs sm:text-sm text-neutral-400 font-mono max-w-lg mx-auto leading-relaxed">
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
              <label className="block text-xs font-mono text-neutral-400 mb-1.5 uppercase">
                {contactForm?.nameLabel ? loc(contactForm.nameLabel) : ui.feedback.nameLabel}
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder={contactForm?.namePlaceholder ? loc(contactForm.namePlaceholder) : undefined}
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#12161A] border border-[#232B33] text-white text-sm focus:border-[#FF5722] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1.5 uppercase">
                {contactForm?.emailLabel ? loc(contactForm.emailLabel) : ui.feedback.emailLabel}
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder={contactForm?.emailPlaceholder ? loc(contactForm.emailPlaceholder) : undefined}
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#12161A] border border-[#232B33] text-white text-sm focus:border-[#FF5722] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1.5 uppercase">
                {contactForm?.messageLabel ? loc(contactForm.messageLabel) : ui.feedback.adviceLabel}
              </label>
              <textarea
                name="message"
                rows={4}
                required
                placeholder={contactForm?.messagePlaceholder ? loc(contactForm.messagePlaceholder) : undefined}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#12161A] border border-[#232B33] text-white text-sm focus:border-[#FF5722] focus:outline-none transition-colors resize-none"
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
                className="px-8 py-3 rounded-xl font-bold font-mono text-xs uppercase tracking-wider text-white bg-[#FF5722] hover:bg-[#F4511E] glow-orange transition-all disabled:opacity-50"
              >
                {submitting 
                  ? (contactForm?.submittingText ? loc(contactForm.submittingText) : ui.feedback.sending) 
                  : (contactForm?.submitButtonText ? loc(contactForm.submitButtonText) : ui.feedback.sendButton)}
              </button>
            </div>
          </form>
        </div>

        {/* 2. HAVE A PROJECT IN MIND? (Equinox Signature Style) */}
        <div className="relative text-center p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-[#141A20] via-[#101418] to-[#0D1013] border border-[#232B33] shadow-2xl overflow-hidden">
          {/* Subtle giant background text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl sm:text-9xl font-black font-sans text-white/[0.02] uppercase pointer-events-none select-none">
            JABER
          </div>

          <div className="relative z-10 max-w-xl mx-auto">
            {/* Signature Preview Card */}
            <div className="inline-block px-8 py-4 mb-6 rounded-2xl bg-[#090C0F] border border-[#232B33] shadow-inner">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-1">
                Verified Signature:
              </span>
              <svg className="w-48 sm:w-56 h-12 text-[#FF5722] mx-auto" viewBox="0 0 200 60" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M10,45 C20,15 35,20 40,40 C45,60 55,10 65,30 C75,50 85,35 95,40 C105,45 120,25 135,38 C150,50 165,30 180,45" />
                <path d="M45,25 L85,25" strokeWidth="1.5" />
                <path d="M130,22 Q145,15 160,25" strokeWidth="1.5" />
              </svg>
              <span className="text-xs font-mono font-bold text-white tracking-widest uppercase block mt-1">
                MD. JABER HOSAIN
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-wider mb-3">
              {contactForm?.projectPitchTitle ? loc(contactForm.projectPitchTitle) : ui.projectPitch.title}
            </h3>
            <p className="text-xs sm:text-sm font-mono text-neutral-400 mb-8 leading-relaxed">
              {contactForm?.projectPitchSubtitle ? loc(contactForm.projectPitchSubtitle) : ui.projectPitch.subtitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={`mailto:${portfolio.contact?.email || 'sbmc.3925@gmail.com'}`}
                className="inline-flex items-center space-x-2 rtl:space-x-reverse px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold font-mono text-white bg-[#FF5722] hover:bg-[#F4511E] glow-orange transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{contactForm?.projectPitchCta ? loc(contactForm.projectPitchCta) : ui.projectPitch.cta}</span>
              </a>
              {portfolio.contact?.telegramUrl && (
                <a
                  href={portfolio.contact.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 rtl:space-x-reverse px-7 py-3.5 rounded-xl text-xs sm:text-sm font-bold font-mono text-neutral-200 bg-[#141A20] hover:bg-[#1A222B] border border-[#232B33] hover:border-[#229ED9] transition-all"
                >
                  <Send className="w-4 h-4 text-[#229ED9]" />
                  <span>Telegram Quick Chat</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 3. GET IN TOUCH */}
        <div id="contact">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase mb-2">
              {contactForm?.getInTouchTitle ? loc(contactForm.getInTouchTitle) : ui.getInTouch.title}
            </h3>
            <p className="text-xs sm:text-sm font-mono text-neutral-400">
              {contactForm?.getInTouchSubtitle ? loc(contactForm.getInTouchSubtitle) : ui.getInTouch.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Email */}
            {portfolio.contact?.email && (
              <a
                href={`mailto:${portfolio.contact.email}`}
                className="p-6 rounded-2xl bg-[#12161A] border border-[#232B33] hover:border-[#FF5722]/50 text-center flex flex-col items-center justify-center space-y-2 group transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#181E24] border border-[#232B33] flex items-center justify-center text-[#FF5722] group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-xs font-mono font-bold text-white uppercase">
                  {ui.getInTouch.emailTitle}
                </div>
                <div className="text-xs text-neutral-400 font-mono break-all">
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
                className="p-6 rounded-2xl bg-[#12161A] border border-[#232B33] hover:border-[#FF5722]/50 text-center flex flex-col items-center justify-center space-y-2 group transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#181E24] border border-[#232B33] flex items-center justify-center text-[#229ED9] group-hover:scale-105 transition-transform">
                  <Send className="w-5 h-5" />
                </div>
                <div className="text-xs font-mono font-bold text-white uppercase">
                  {ui.getInTouch.telegramTitle}
                </div>
                <div className="text-xs text-neutral-400 font-mono">
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
                className="p-6 rounded-2xl bg-[#12161A] border border-[#232B33] hover:border-[#FF5722]/50 text-center flex flex-col items-center justify-center space-y-2 group transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#181E24] border border-[#232B33] flex items-center justify-center text-[#1877F2] group-hover:scale-105 transition-transform">
                  <Facebook className="w-5 h-5" />
                </div>
                <div className="text-xs font-mono font-bold text-white uppercase">
                  {ui.getInTouch.facebookTitle}
                </div>
                <div className="text-xs text-neutral-400 font-mono">
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
                className="p-6 rounded-2xl bg-[#12161A] border border-[#232B33] hover:border-[#FF5722]/50 text-center flex flex-col items-center justify-center space-y-2 group transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#181E24] border border-[#232B33] flex items-center justify-center text-[#FF0000] group-hover:scale-105 transition-transform">
                  <Youtube className="w-5 h-5" />
                </div>
                <div className="text-xs font-mono font-bold text-white uppercase">
                  YouTube
                </div>
                <div className="text-xs text-neutral-400 font-mono">
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
