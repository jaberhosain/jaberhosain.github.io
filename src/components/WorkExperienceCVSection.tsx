import React from 'react';
import { Briefcase, FileText, MapPin, Globe, Monitor, CheckCircle2, ExternalLink } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { JABER_CV_DATA } from '../data/jaberCvData';
import { resolveAssetUrl } from '../utils/assetUrl';
import { Reveal3D } from './common/Reveal3D';

export const WorkExperienceCVSection: React.FC = () => {
  const { language } = usePortfolio();
  const isBn = language === 'bn';
  const isAr = language === 'ar';

  const cvUrl = resolveAssetUrl(JABER_CV_DATA.pdfPath);

  return (
    <section className="py-24 bg-[#121419]/85 border-t border-[#2B303D] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header + Direct Official CV Link */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <Reveal3D direction="left">
            <p className="text-[11px] font-mono tracking-[0.22em] uppercase text-[#E4583B] mb-2.5">
              {isBn
                ? 'অভিজ্ঞতা ও সিভি ডসিয়ার'
                : isAr
                ? 'الخبرة العملية والسيرة الذاتية'
                : 'Experience & CV Dossier'}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F4F0E8] tracking-tight">
              {isBn
                ? 'পেশাদার অভিজ্ঞতা ও যোগ্যতা'
                : isAr
                ? 'الخبرة العملية والمؤهلات'
                : 'Practical Experience & Career Readiness'}
            </h2>
            <p className="mt-2.5 text-xs sm:text-sm text-[#A7A298] max-w-2xl leading-relaxed">
              {isBn
                ? `মোট ${JABER_CV_DATA.totalExperience} কর্মঅভিজ্ঞতা — ভিডিও এডিটিং, গ্রাফিক ডিজাইন, মেটা মার্কেটিং ও অফিস ম্যানেজমেন্ট।`
                : isAr
                ? 'خبرة عملية لمدة 1.1 سنة في مونتاج الفيديو والتصميم الجرافيكي وإدارة المكاتب والبيانات.'
                : `${JABER_CV_DATA.totalExperience} of practical hands-on experience across Video Editing, Graphic Design, Meta Marketing, Office Management, and Data Operations.`}
            </p>
          </Reveal3D>

          <Reveal3D direction="right" delay={80} className="shrink-0">
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2.5 rtl:space-x-reverse px-6 py-3 rounded-lg bg-[#E4583B] hover:bg-[#D0492D] text-white font-mono text-xs font-bold uppercase tracking-wider glow-orange-sm transition-colors whitespace-nowrap"
            >
              <FileText className="w-4 h-4" />
              <span>
                {isBn
                  ? 'অফিশিয়াল সিভি দেখুন (PDF)'
                  : isAr
                  ? 'عرض السيرة الذاتية (PDF)'
                  : 'View Official CV (PDF)'}
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Reveal3D>
        </div>

        {/* 2-Column Practical Work Experience Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-14">
          {JABER_CV_DATA.experiences.map((exp, idx) => (
            <Reveal3D key={exp.organization} direction={idx % 2 === 0 ? 'left' : 'right'} delay={idx * 90}>
              <div className="h-full p-7 rounded-2xl studio-card flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-4 border-b border-[#2B303D]">
                    <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                      <div className="w-9 h-9 rounded-lg bg-[#20242E] border border-[#2B303D] flex items-center justify-center text-[#E4583B] shrink-0">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono text-[#E4583B] font-semibold">
                        {isBn ? exp.durationBn : exp.duration}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-[#F4F0E8] mb-1">
                    {isBn ? exp.organizationBn : exp.organization}
                  </h3>
                  <p className="text-xs font-mono text-[#DDD1BE] mb-5">
                    {isBn ? exp.roleBn : exp.role}
                  </p>

                  <ul className="space-y-2.5 mb-6">
                    {(isBn ? exp.dutiesBn : exp.duties).map((duty, dIdx) => (
                      <li key={dIdx} className="flex items-start space-x-2.5 rtl:space-x-reverse text-xs sm:text-sm text-[#A7A298] leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-[#E4583B] shrink-0 mt-0.5" />
                        <span>{duty}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Unboxed Metadata Line */}
                <div className="pt-4 border-t border-[#2B303D] text-[11px] font-mono text-[#A7A298]">
                  {exp.expertise.join(' · ')}
                </div>
              </div>
            </Reveal3D>
          ))}
        </div>

        {/* Career Preferences, Languages & Technical Environment Row */}
        <Reveal3D direction="depth" delay={100}>
          <div className="p-7 rounded-2xl studio-card grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono text-[#E4583B] uppercase tracking-wider font-semibold">
                <MapPin className="w-4 h-4" />
                <span>{isBn ? 'অবস্থান ও পছন্দের কর্মস্থল' : isAr ? 'الموقع والمناطق المفضلة' : 'Location & Preferred Districts'}</span>
              </div>
              <p className="text-sm font-semibold text-[#F4F0E8]">
                {isBn ? JABER_CV_DATA.contact.currentAddressBn : JABER_CV_DATA.contact.currentAddress}
              </p>
              <p className="text-xs text-[#A7A298]">
                {isBn
                  ? `পছন্দের জেলা: ${JABER_CV_DATA.careerApplication.preferredDistrictsBn.join(', ')}`
                  : `Preferred: ${JABER_CV_DATA.careerApplication.preferredDistricts.join(', ')}`}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono text-[#E4583B] uppercase tracking-wider font-semibold">
                <Monitor className="w-4 h-4" />
                <span>{isBn ? 'অপারেটিং সিস্টেম ও অফিস' : isAr ? 'الأنظمة والمكتب' : 'OS & Computer Readiness'}</span>
              </div>
              <p className="text-sm font-semibold text-[#F4F0E8]">
                {JABER_CV_DATA.skills.operatingSystems.join(' · ')}
              </p>
              <p className="text-xs text-[#A7A298]">
                {isBn
                  ? 'MS Word, Excel, PowerPoint, Google Sheets ও দৈনিক অফিস ডেটা এন্ট্রি'
                  : 'MS Office Suite, Google Workspace, Documentation & Basic Accounts'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono text-[#E4583B] uppercase tracking-wider font-semibold">
                <Globe className="w-4 h-4" />
                <span>{isBn ? 'ভাষাগত দক্ষতা ও ক্যারিয়ার লক্ষ্য' : isAr ? 'اللغات والأهداف' : 'Languages & Career Target'}</span>
              </div>
              <p className="text-sm font-semibold text-[#F4F0E8]">
                {isBn
                  ? 'বাংলা (উচ্চ দক্ষতা) · ইংরেজি (মধ্যম)'
                  : 'Bangla (High) · English (Medium)'}
              </p>
              <p className="text-xs text-[#A7A298] tabular-nums">
                {isBn
                  ? `লক্ষ্য: Entry-Level জব · প্রত্যাশিত বেতন: ${JABER_CV_DATA.careerApplication.expectedSalaryBn}`
                  : `Target: Entry-Level Role · Expected: ${JABER_CV_DATA.careerApplication.expectedSalary}`}
              </p>
            </div>
          </div>
        </Reveal3D>

      </div>
    </section>
  );
};
