import React, { useState } from 'react';
import {
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { defaultContactForm, defaultFooterConfig } from '../../data/initialPortfolio';
import { ContactFormConfig, FooterConfig, LocalizedText } from '../../types/portfolio';

interface ContactFooterEditorProps {
  activeSection?: 'all' | 'form' | 'footer';
}

export const ContactFooterEditor: React.FC<ContactFooterEditorProps> = ({ activeSection = 'all' }) => {
  const { draftPortfolio, updateDraft } = usePortfolio();

  const [openSections, setOpenSections] = useState<{
    adviceForm: boolean;
    pitchTouch: boolean;
    footer: boolean;
  }>({
    adviceForm: true,
    pitchTouch: false,
    footer: true
  });

  const toggleSection = (sec: 'adviceForm' | 'pitchTouch' | 'footer') => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const contactForm: ContactFormConfig = draftPortfolio.contactForm || defaultContactForm;
  const footerConfig: FooterConfig = draftPortfolio.footerConfig || defaultFooterConfig;

  const updateContactFormField = (field: keyof ContactFormConfig, lang: 'en' | 'bn' | 'ar', value: string) => {
    updateDraft(prev => {
      const curForm = prev.contactForm || defaultContactForm;
      const curVal = curForm[field] as LocalizedText | undefined;
      const updatedVal: LocalizedText = {
        en: curVal?.en || '',
        bn: curVal?.bn || '',
        ar: curVal?.ar || '',
        [lang]: value
      };
      return {
        ...prev,
        contactForm: {
          ...curForm,
          [field]: updatedVal
        }
      };
    });
  };

  const updateFooterConfigField = (field: keyof FooterConfig, lang: 'en' | 'bn' | 'ar', value: string) => {
    updateDraft(prev => {
      const curFooter = prev.footerConfig || defaultFooterConfig;
      const curVal = curFooter[field] as LocalizedText | undefined;
      const updatedVal: LocalizedText = {
        en: curVal?.en || '',
        bn: curVal?.bn || '',
        ar: curVal?.ar || '',
        [lang]: value
      };
      return {
        ...prev,
        footerConfig: {
          ...curFooter,
          [field]: updatedVal
        }
      };
    });
  };

  return (
    <div className="space-y-6">
      {(activeSection === 'all' || activeSection === 'form') && (
        <>
          <div className="rounded-2xl bg-[#121419] border border-white/[0.08] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('adviceForm')}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#171A21] transition-colors"
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-9 h-9 rounded-lg bg-[#171A21] border border-white/[0.08] flex items-center justify-center text-[#E4583B]">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-white">Advice Form Content & Placeholders</h3>
                  <p className="text-xs text-neutral-400">Headings, descriptions, input placeholders, submit button & alert messages (3 languages)</p>
                </div>
              </div>
              {openSections.adviceForm ? (
                <ChevronUp className="w-5 h-5 text-neutral-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              )}
            </button>

            {openSections.adviceForm && (
              <div className="p-4 sm:p-5 border-t border-white/[0.06] space-y-5 bg-[#121419]">
                {/* Form Title */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider">
                    Form Heading / Title
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="block text-[11px] font-medium text-neutral-400 mb-1">English</span>
                      <input
                        type="text"
                        value={contactForm.title?.en || ''}
                        onChange={(e) => updateContactFormField('title', 'en', e.target.value)}
                        placeholder="GIVE ME YOUR ADVICE"
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-white outline-none focus:border-[#E4583B]"
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] font-medium text-neutral-400 mb-1">বাংলা</span>
                      <input
                        type="text"
                        value={contactForm.title?.bn || ''}
                        onChange={(e) => updateContactFormField('title', 'bn', e.target.value)}
                        placeholder="আপনার পরামর্শ দিন"
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-white outline-none focus:border-[#E4583B]"
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] font-medium text-neutral-400 mb-1">العربية</span>
                      <input
                        type="text"
                        dir="rtl"
                        value={contactForm.title?.ar || ''}
                        onChange={(e) => updateContactFormField('title', 'ar', e.target.value)}
                        placeholder="شاركني نصيحتك واقتراحك"
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-white outline-none focus:border-[#E4583B]"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Subtitle */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider">
                    Form Description / Subtitle
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="block text-[11px] font-medium text-neutral-400 mb-1">English</span>
                      <textarea
                        rows={2}
                        value={contactForm.subtitle?.en || ''}
                        onChange={(e) => updateContactFormField('subtitle', 'en', e.target.value)}
                        placeholder="Have a suggestion or feedback for me?..."
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-white outline-none focus:border-[#E4583B] resize-none"
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] font-medium text-neutral-400 mb-1">বাংলা</span>
                      <textarea
                        rows={2}
                        value={contactForm.subtitle?.bn || ''}
                        onChange={(e) => updateContactFormField('subtitle', 'bn', e.target.value)}
                        placeholder="আমার জন্য কোনো পরামর্শ বা ফিডব্যাক থাকলে জানান..."
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-white outline-none focus:border-[#E4583B] resize-none"
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] font-medium text-neutral-400 mb-1">العربية</span>
                      <textarea
                        rows={2}
                        dir="rtl"
                        value={contactForm.subtitle?.ar || ''}
                        onChange={(e) => updateContactFormField('subtitle', 'ar', e.target.value)}
                        placeholder="هل لديك اقتراح أو رأي؟ يسعدني سماعه..."
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-white outline-none focus:border-[#E4583B] resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Field Placeholders */}
                <div className="p-4 rounded-xl bg-[#171A21] border border-white/[0.08] space-y-4">
                  <span className="block text-xs font-medium text-[#E4583B] uppercase tracking-wider">
                    Input Field Placeholders
                  </span>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">Name Field Placeholder</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={contactForm.namePlaceholder?.en || ''}
                        onChange={(e) => updateContactFormField('namePlaceholder', 'en', e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        value={contactForm.namePlaceholder?.bn || ''}
                        onChange={(e) => updateContactFormField('namePlaceholder', 'bn', e.target.value)}
                        placeholder="যেমন: আপনার নাম"
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        value={contactForm.namePlaceholder?.ar || ''}
                        onChange={(e) => updateContactFormField('namePlaceholder', 'ar', e.target.value)}
                        placeholder="مثال: اسمك الكريم"
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">Email Field Placeholder</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={contactForm.emailPlaceholder?.en || ''}
                        onChange={(e) => updateContactFormField('emailPlaceholder', 'en', e.target.value)}
                        placeholder="e.g. name@example.com"
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        value={contactForm.emailPlaceholder?.bn || ''}
                        onChange={(e) => updateContactFormField('emailPlaceholder', 'bn', e.target.value)}
                        placeholder="যেমন: name@example.com"
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        value={contactForm.emailPlaceholder?.ar || ''}
                        onChange={(e) => updateContactFormField('emailPlaceholder', 'ar', e.target.value)}
                        placeholder="مثال: name@example.com"
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">Advice/Message Field Placeholder</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={contactForm.messagePlaceholder?.en || ''}
                        onChange={(e) => updateContactFormField('messagePlaceholder', 'en', e.target.value)}
                        placeholder="Write your thoughts, suggestions, or advice..."
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        value={contactForm.messagePlaceholder?.bn || ''}
                        onChange={(e) => updateContactFormField('messagePlaceholder', 'bn', e.target.value)}
                        placeholder="আপনার মতামত বা পরামর্শ এখানে লিখুন..."
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        value={contactForm.messagePlaceholder?.ar || ''}
                        onChange={(e) => updateContactFormField('messagePlaceholder', 'ar', e.target.value)}
                        placeholder="اكتب نصيحتك أو اقتراحك هنا..."
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button Labels */}
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider">
                    Submit Button Labels
                  </label>

                  <div>
                    <span className="block text-[11px] font-medium text-neutral-400 mb-1">Default Button Text</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={contactForm.submitButtonText?.en || ''}
                        onChange={(e) => updateContactFormField('submitButtonText', 'en', e.target.value)}
                        placeholder="SEND MESSAGE"
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        value={contactForm.submitButtonText?.bn || ''}
                        onChange={(e) => updateContactFormField('submitButtonText', 'bn', e.target.value)}
                        placeholder="বার্তা পাঠান"
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        value={contactForm.submitButtonText?.ar || ''}
                        onChange={(e) => updateContactFormField('submitButtonText', 'ar', e.target.value)}
                        placeholder="إرسال الرسالة"
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-medium text-neutral-400 mb-1">Sending / Transmitting State Text</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={contactForm.submittingText?.en || ''}
                        onChange={(e) => updateContactFormField('submittingText', 'en', e.target.value)}
                        placeholder="TRANSMITTING..."
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        value={contactForm.submittingText?.bn || ''}
                        onChange={(e) => updateContactFormField('submittingText', 'bn', e.target.value)}
                        placeholder="প্রেরণ করা হচ্ছে..."
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        value={contactForm.submittingText?.ar || ''}
                        onChange={(e) => updateContactFormField('submittingText', 'ar', e.target.value)}
                        placeholder="جارٍ الإرسال..."
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Success & Error Alert Messages */}
                <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                  <div>
                    <label className="block text-xs font-medium text-emerald-400 mb-1 flex items-center space-x-1.5 rtl:space-x-reverse">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Success Alert Message</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={contactForm.successMessage?.en || ''}
                        onChange={(e) => updateContactFormField('successMessage', 'en', e.target.value)}
                        placeholder="Thank you! Your advice has been received."
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        value={contactForm.successMessage?.bn || ''}
                        onChange={(e) => updateContactFormField('successMessage', 'bn', e.target.value)}
                        placeholder="ধন্যবাদ! আপনার পরামর্শ সফলভাবে পৌঁছেছে।"
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        value={contactForm.successMessage?.ar || ''}
                        onChange={(e) => updateContactFormField('successMessage', 'ar', e.target.value)}
                        placeholder="شكراً جزيلاً! تم استلام نصيحتك بنجاح."
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-rose-400 mb-1 flex items-center space-x-1.5 rtl:space-x-reverse">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Error Alert Message</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={contactForm.errorMessage?.en || ''}
                        onChange={(e) => updateContactFormField('errorMessage', 'en', e.target.value)}
                        placeholder="Failed to send advice. Please try again."
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        value={contactForm.errorMessage?.bn || ''}
                        onChange={(e) => updateContactFormField('errorMessage', 'bn', e.target.value)}
                        placeholder="বার্তা পাঠাতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।"
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        value={contactForm.errorMessage?.ar || ''}
                        onChange={(e) => updateContactFormField('errorMessage', 'ar', e.target.value)}
                        placeholder="فشل إرسال الرسالة. يرجى المحاولة ثانية."
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: PROJECT PITCH & GET IN TOUCH TEXTS */}
          <div className="rounded-2xl bg-[#121419] border border-white/[0.08] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('pitchTouch')}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#171A21] transition-colors"
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-9 h-9 rounded-lg bg-[#171A21] border border-white/[0.08] flex items-center justify-center text-[#E4583B]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-white">Project Pitch & Get In Touch Banners</h3>
                  <p className="text-xs text-neutral-400">Headings, CTA button text and subtitles for the conversation sections</p>
                </div>
              </div>
              {openSections.pitchTouch ? (
                <ChevronUp className="w-5 h-5 text-neutral-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              )}
            </button>

            {openSections.pitchTouch && (
              <div className="p-4 sm:p-5 border-t border-white/[0.06] space-y-5 bg-[#121419]">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 uppercase mb-1">
                    Project Pitch Title
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={contactForm.projectPitchTitle?.en || ''}
                      onChange={(e) => updateContactFormField('projectPitchTitle', 'en', e.target.value)}
                      placeholder="HAVE A PROJECT IN MIND?"
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                    />
                    <input
                      type="text"
                      value={contactForm.projectPitchTitle?.bn || ''}
                      onChange={(e) => updateContactFormField('projectPitchTitle', 'bn', e.target.value)}
                      placeholder="কোনো প্রজেক্টের পরিকল্পনা আছে?"
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                    />
                    <input
                      type="text"
                      dir="rtl"
                      value={contactForm.projectPitchTitle?.ar || ''}
                      onChange={(e) => updateContactFormField('projectPitchTitle', 'ar', e.target.value)}
                      placeholder="هل يدور ببالك مشروع؟"
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 uppercase mb-1">
                    Project Pitch Subtitle
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={contactForm.projectPitchSubtitle?.en || ''}
                      onChange={(e) => updateContactFormField('projectPitchSubtitle', 'en', e.target.value)}
                      placeholder="Let's turn your idea into something visual."
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                    />
                    <input
                      type="text"
                      value={contactForm.projectPitchSubtitle?.bn || ''}
                      onChange={(e) => updateContactFormField('projectPitchSubtitle', 'bn', e.target.value)}
                      placeholder="চলুন আপনার ধারণাকে দৃষ্টিনন্দন ভিজ্যুয়ালে রূপান্তর করি।"
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                    />
                    <input
                      type="text"
                      dir="rtl"
                      value={contactForm.projectPitchSubtitle?.ar || ''}
                      onChange={(e) => updateContactFormField('projectPitchSubtitle', 'ar', e.target.value)}
                      placeholder="دعنا نحول فكرتك إلى واقع بصري مبهر."
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 uppercase mb-1">
                    Project Pitch CTA Button Label
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={contactForm.projectPitchCta?.en || ''}
                      onChange={(e) => updateContactFormField('projectPitchCta', 'en', e.target.value)}
                      placeholder="Start a Conversation"
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                    />
                    <input
                      type="text"
                      value={contactForm.projectPitchCta?.bn || ''}
                      onChange={(e) => updateContactFormField('projectPitchCta', 'bn', e.target.value)}
                      placeholder="আলোচনা শুরু করুন"
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                    />
                    <input
                      type="text"
                      dir="rtl"
                      value={contactForm.projectPitchCta?.ar || ''}
                      onChange={(e) => updateContactFormField('projectPitchCta', 'ar', e.target.value)}
                      placeholder="ابدأ المحادثة الآن"
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 uppercase mb-1">
                      Get In Touch Heading
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={contactForm.getInTouchTitle?.en || ''}
                        onChange={(e) => updateContactFormField('getInTouchTitle', 'en', e.target.value)}
                        placeholder="GET IN TOUCH"
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        value={contactForm.getInTouchTitle?.bn || ''}
                        onChange={(e) => updateContactFormField('getInTouchTitle', 'bn', e.target.value)}
                        placeholder="যোগাযোগ করুন"
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        value={contactForm.getInTouchTitle?.ar || ''}
                        onChange={(e) => updateContactFormField('getInTouchTitle', 'ar', e.target.value)}
                        placeholder="تواصل معي"
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 uppercase mb-1">
                      Get In Touch Subtitle
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={contactForm.getInTouchSubtitle?.en || ''}
                        onChange={(e) => updateContactFormField('getInTouchSubtitle', 'en', e.target.value)}
                        placeholder="Open to projects, collaborations and creative opportunities."
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        value={contactForm.getInTouchSubtitle?.bn || ''}
                        onChange={(e) => updateContactFormField('getInTouchSubtitle', 'bn', e.target.value)}
                        placeholder="প্রজেক্ট, কোলাবোরেশন ও নতুন সুযোগের জন্য প্রস্তুত।"
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        value={contactForm.getInTouchSubtitle?.ar || ''}
                        onChange={(e) => updateContactFormField('getInTouchSubtitle', 'ar', e.target.value)}
                        placeholder="متاح للمشاريع والتعاون والفرص الإبداعية الجديدة."
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* SECTION 3: FOOTER COPYRIGHT & LABELS */}
      {(activeSection === 'all' || activeSection === 'footer') && (
        <div className="rounded-2xl bg-[#121419] border border-white/[0.08] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('footer')}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#171A21] transition-colors"
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-9 h-9 rounded-lg bg-[#171A21] border border-white/[0.08] flex items-center justify-center text-[#E4583B]">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white">Footer Copyright & Navigation Text</h3>
                <p className="text-xs text-neutral-400">Social section heading, copyright rights notice, and back to top button text</p>
              </div>
            </div>
            {openSections.footer ? (
              <ChevronUp className="w-5 h-5 text-neutral-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-neutral-400" />
            )}
          </button>

          {openSections.footer && (
            <div className="p-4 sm:p-5 border-t border-white/[0.06] space-y-5 bg-[#121419]">
              <div>
                <label className="block text-xs font-medium text-neutral-300 uppercase mb-1">
                  Footer Social Heading
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={footerConfig.connectTitle?.en || ''}
                    onChange={(e) => updateFooterConfigField('connectTitle', 'en', e.target.value)}
                    placeholder="CONNECT WITH ME"
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                  />
                  <input
                    type="text"
                    value={footerConfig.connectTitle?.bn || ''}
                    onChange={(e) => updateFooterConfigField('connectTitle', 'bn', e.target.value)}
                    placeholder="সোশ্যাল মিডিয়ায় যুক্ত হোন"
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                  />
                  <input
                    type="text"
                    dir="rtl"
                    value={footerConfig.connectTitle?.ar || ''}
                    onChange={(e) => updateFooterConfigField('connectTitle', 'ar', e.target.value)}
                    placeholder="تواصل عبر المنصات"
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 uppercase mb-1">
                  Copyright Rights Notice (appended after © 2026 MD JABER HOSAIN.)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={footerConfig.copyrightText?.en || ''}
                    onChange={(e) => updateFooterConfigField('copyrightText', 'en', e.target.value)}
                    placeholder="All rights reserved."
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                  />
                  <input
                    type="text"
                    value={footerConfig.copyrightText?.bn || ''}
                    onChange={(e) => updateFooterConfigField('copyrightText', 'bn', e.target.value)}
                    placeholder="সর্বস্বত্ব সংরক্ষিত।"
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                  />
                  <input
                    type="text"
                    dir="rtl"
                    value={footerConfig.copyrightText?.ar || ''}
                    onChange={(e) => updateFooterConfigField('copyrightText', 'ar', e.target.value)}
                    placeholder="جميع الحقوق محفوظة."
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 uppercase mb-1">
                  Back to Top Button Label
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={footerConfig.backToTopText?.en || ''}
                    onChange={(e) => updateFooterConfigField('backToTopText', 'en', e.target.value)}
                    placeholder="Back to top"
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                  />
                  <input
                    type="text"
                    value={footerConfig.backToTopText?.bn || ''}
                    onChange={(e) => updateFooterConfigField('backToTopText', 'bn', e.target.value)}
                    placeholder="উপরে ফিরে যান"
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                  />
                  <input
                    type="text"
                    dir="rtl"
                    value={footerConfig.backToTopText?.ar || ''}
                    onChange={(e) => updateFooterConfigField('backToTopText', 'ar', e.target.value)}
                    placeholder="العودة للأعلى"
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] focus:border-[#E4583B] text-xs text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
