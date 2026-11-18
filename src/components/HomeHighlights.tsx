import React, { useState, useEffect } from 'react';
import {
  Video,
  Palette,
  Eye,
  GraduationCap,
  Award,
  Wrench,
  ExternalLink,
  ArrowUpRight
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useNavigation } from '../context/NavigationContext';
import { ProjectItem, VideoShowcaseItem, CaseStudyItem } from '../types/portfolio';
import { resolveAssetUrl } from '../utils/assetUrl';
import { normalizeDirectImageUrl } from '../lib/imageUrlResolver';
import { Reveal3D } from './common/Reveal3D';
import { StudioArrowRight, StudioGlassIcon } from './common/StudioIcon';
import { EditableElement } from './common/EditableElement';
import { StudioSectionShell } from './common/StudioSectionShell';
import { detectVideoType } from '../lib/videoUtils';
import { FeaturedShowcaseStage } from './home/FeaturedShowcaseStage';
import { CreativityTipsSection } from './home/CreativityTipsSection';
import { ReelsAndTrustSections } from './home/ReelsAndTrustSections';
import { AIAutomationRoadmapSection } from './home/AIAutomationRoadmapSection';
import { CreativeGameArena } from './games/CreativeGameArena';

interface HomeHighlightsProps {
  onOpenLightbox?: (project: ProjectItem, initialIndex?: number) => void;
  onOpenVideo?: (video: VideoShowcaseItem) => void;
}

const iconMap: Record<string, React.ElementType> = {
  GraduationCap,
  Award,
  Video,
  Palette,
  Wrench
};

export const HomeHighlights: React.FC<HomeHighlightsProps> = ({
  onOpenLightbox,
  onOpenVideo
}) => {
  const { portfolio, loc, language } = usePortfolio();
  const { navigateTo, focusMode } = useNavigation();

  const visibleVideos = [...(portfolio.videos || [])]
    .filter((v: any) => v.visible !== false && !v.hidden)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const visibleBestVideos = [...(portfolio.bestVideoWorks || [])]
    .filter((v: any) => v.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const visibleGraphicProjects = [...(portfolio.projects || [])]
    .filter((p: any) => p.category === 'graphic' && p.visible !== false && !p.hidden)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const overviewCards = portfolio.overviewCards || [];

  // Case study local tab follows global focusMode when changed
  const [caseCategory, setCaseCategory] = useState<'all' | 'video' | 'graphic' | 'motion'>('all');

  useEffect(() => {
    if (focusMode === 'video') {
      setCaseCategory('video');
    } else if (focusMode === 'graphic') {
      setCaseCategory('graphic');
    } else {
      setCaseCategory('all');
    }
  }, [focusMode]);

  const rawCaseStudies: CaseStudyItem[] = [...(portfolio.caseStudies || [])]
    .filter((cs) => cs.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const filteredCaseStudies = rawCaseStudies.filter((item) => {
    if (caseCategory === 'all') {
      if (focusMode === 'video') return item.category === 'video' || item.category === 'motion';
      if (focusMode === 'graphic') return item.category === 'graphic';
      return true;
    }
    if (caseCategory === 'video') {
      return item.category === 'video' || item.category === 'motion';
    }
    return item.category === caseCategory;
  });

  const visibleStats = [...(portfolio.homeStats || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const homeTools =
    portfolio.homeTools && portfolio.homeTools.length > 0
      ? portfolio.homeTools
      : [
          'Adobe Premiere Pro',
          'Adobe After Effects',
          'Adobe Photoshop',
          'Adobe Illustrator',
          'AI Tools & Workflows',
          'Computer & IT Operations'
        ];

  const handleOpenCaseStudy = (cs: CaseStudyItem) => {
    const isVideoWork = cs.category === 'video' || cs.category === 'motion';
    if (isVideoWork) {
      if (cs.videoUrl) {
        const videoPayload: VideoShowcaseItem = {
          id: cs.id,
          title: cs.title,
          description: cs.result,
          videoUrl: cs.videoUrl,
          videoType: cs.videoType || detectVideoType(cs.videoUrl),
          thumbnailUrl: cs.thumbnail
        };
        onOpenVideo?.(videoPayload);
        return;
      }
      const fallbackVideo = visibleVideos[0] || visibleBestVideos[0];
      if (fallbackVideo) {
        onOpenVideo?.(fallbackVideo as VideoShowcaseItem);
      } else {
        navigateTo('videos');
      }
    } else {
      const images =
        cs.galleryImages && cs.galleryImages.length > 0
          ? cs.galleryImages
          : cs.thumbnail
          ? [cs.thumbnail]
          : [];
      const fallbackProj = visibleGraphicProjects[0];
      const projectPayload: ProjectItem = {
        id: cs.id,
        title: cs.title,
        groupName: cs.categoryLabel,
        category: 'graphic',
        description: cs.result,
        coverImage: cs.thumbnail || fallbackProj?.coverImage || '/assets/jabir_profile.png',
        galleryImages: images.length > 0 ? images : fallbackProj?.galleryImages || [],
        behanceUrl: cs.behanceUrl || fallbackProj?.behanceUrl || portfolio.contact?.behanceUrl
      };
      onOpenLightbox?.(projectPayload, 0);
    }
  };

  const filteredOverviewCards = overviewCards.filter((card) => {
    if (focusMode === 'video' && (card.icon === 'Palette' || card.id === 'ov-4')) {
      return false;
    }
    if (focusMode === 'graphic' && (card.icon === 'Video' || card.id === 'ov-3')) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-transparent">
      {/* 1. LARGE SCREEN BEST VIDEO SHOWCASE (TOP) + GROUPED GRAPHICS FULL PREVIEW (BELOW) */}
      <FeaturedShowcaseStage onOpenVideo={onOpenVideo} onOpenLightbox={onOpenLightbox} />

      {/* 2. ABOUT ME 2-COLUMN EDITORIAL SHOWCASE (Modeled on Screenshot Layout) */}
      {portfolio.homeSectionVisibility?.aboutPreview !== false && (
        <StudioSectionShell
          id="about-preview"
          sectionBgKey="about-preview"
          customLayerTarget="about-preview"
          className="py-16 sm:py-24 editorial-sand-band border-y"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Portrait Card */}
              <Reveal3D direction="left" className="lg:col-span-5 flex justify-center">
                <EditableElement id="aboutPreview.portrait" label="About Preview Portrait" as="div" className="w-full max-w-[380px]">
                  <div className="relative aspect-[4/5] rounded-[26px] editorial-card-surface p-2.5 overflow-hidden shadow-[0_24px_54px_-18px_rgba(0,0,0,0.22)]">
                    <img
                      src={resolveAssetUrl(
                        normalizeDirectImageUrl(portfolio.about?.avatarUrl) ||
                          '/assets/jabir_profile.png'
                      )}
                      alt="Md. Jaber Hosain — Creative Director, Video Editor & IT Specialist"
                      loading="lazy"
                      className="w-full h-full object-cover object-top rounded-[18px]"
                    />
                  </div>
                </EditableElement>
              </Reveal3D>

              {/* Right Narrative, Quote & Metrics Column */}
              <Reveal3D direction="right" delay={80} className="lg:col-span-7 space-y-5">
                <div>
                  <EditableElement
                    id="aboutPreview.tag"
                    label="About Tag"
                    as="span"
                    className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#E4583B] block mb-1.5"
                  >
                    {language === 'bn' ? 'আমার সম্পর্কে · ABOUT ME' : 'ABOUT ME'}
                  </EditableElement>
                  <EditableElement
                    id="aboutPreview.heading"
                    label="About Headline"
                    as="h2"
                    className="font-display text-3xl sm:text-4xl font-bold text-[#F4F0E8] tracking-tight"
                  >
                    {language === 'bn' ? 'মোঃ জাবের হোসাইন' : 'Md. Jaber Hosain'}
                  </EditableElement>
                  <p className="text-xs sm:text-sm font-medium text-[#9A958C] mt-1">
                    {language === 'bn'
                      ? 'ভিডিও এডিটর · গ্রাফিক ডিজাইনার · AI ওয়ার্কফ্লো · সোশ্যাল মিডিয়া · কম্পিউটার অপারেটর ও আইটি'
                      : 'Video Editor · Graphic Designer · AI Workflows · Social Media · Computer & IT Operations'}
                  </p>
                </div>

                {/* Editorial Pull-Quote matching screenshot */}
                <blockquote className="border-l-2 border-[#E4583B] pl-4 py-1 text-base sm:text-lg font-editorial italic text-[#F4F0E8]/90 leading-snug">
                  {language === 'bn'
                    ? '“ভালো ভিজ্যুয়াল শুধু সফটওয়্যার নয়—এটি সঠিক গল্প, দ্রুত AI ওয়ার্কফ্লো এবং সুশৃঙ্খল IT দক্ষতার সম্মিলিত ফল।”'
                    : '“Compelling visuals are built on disciplined pacing, thoughtful design systems, and clean technical execution.”'}
                </blockquote>

                <EditableElement
                  id="aboutPreview.bio"
                  label="About Biography"
                  as="p"
                  className="text-xs sm:text-[15px] text-[#DDD1BE] leading-relaxed"
                >
                  {loc(portfolio.about?.bio)}
                </EditableElement>

                {/* Core Skills & Software Strip */}
                <div className="flex flex-wrap gap-2">
                  {homeTools.map((tool, idx) => (
                    <EditableElement
                      key={`${tool}-${idx}`}
                      id={`homeTools.${idx}`}
                      label={`Tool Pill: ${tool}`}
                      as="span"
                      className="px-3 py-1 rounded-full editorial-card-surface text-[11px] font-semibold text-[#F4F0E8]"
                    >
                      {tool}
                    </EditableElement>
                  ))}
                </div>

                {/* 3 Crisp Editorial Counters matching Screenshot */}
                {portfolio.showHomeStats !== false && visibleStats.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 pt-3 border-t border-white/[0.08]">
                    {visibleStats.map((stat, idx) => (
                      <div key={stat.id || idx}>
                        <EditableElement
                          id={`homeStat.${stat.id}.value`}
                          label={`Stat Value: ${stat.value}`}
                          as="div"
                          className="font-display text-2xl sm:text-3xl font-extrabold text-[#F4F0E8] tabular-nums"
                        >
                          {stat.value}
                        </EditableElement>
                        <EditableElement
                          id={`homeStat.${stat.id}.label`}
                          label={`Stat Label: ${loc(stat.label)}`}
                          as="div"
                          className="text-[11px] text-[#9A958C] mt-0.5 leading-snug"
                        >
                          {loc(stat.label)}
                        </EditableElement>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigateTo('about')}
                    className="inline-flex items-center space-x-2 rtl:space-x-reverse px-5 py-2.5 rounded-full glass-pill-cta text-xs font-semibold cursor-pointer"
                  >
                    <span>
                      {language === 'bn' ? 'বিস্তারিত প্রোফাইল ও সিভি' : 'More About Jaber'}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href="#contact-cta"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('contact-cta')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center space-x-2 rtl:space-x-reverse px-5 py-2.5 rounded-full glass-pill-ghost text-xs font-semibold cursor-pointer"
                  >
                    <span>{language === 'bn' ? 'যোগাযোগ ও পরামর্শ' : 'Book a Discussion'}</span>
                  </a>
                </div>
              </Reveal3D>
            </div>
          </div>
        </StudioSectionShell>
      )}

      {/* 3. VIDEO EDITING CREATIVITY TIPS & WORKFLOW BLUEPRINTS (No Courses) */}
      <CreativityTipsSection />

      {/* 4. SELECTED CASE STUDIES (Kept editable in Admin Dashboard with filter pills) */}
      {portfolio.homeSectionVisibility?.caseStudies !== false &&
        portfolio.caseStudiesSection?.visible !== false && (
          <StudioSectionShell
            id="case-studies"
            sectionBgKey="case-studies"
            customLayerTarget="case-studies"
            className="py-16 sm:py-20 bg-[#121419]/85 border-t border-white/[0.07]"
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <Reveal3D direction="left">
                  <EditableElement
                    id="caseStudies.tag"
                    label="Case Studies Tag"
                    as="span"
                    className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#E4583B] block mb-1.5"
                  >
                    {loc(portfolio.caseStudiesSection?.tag) ||
                      (language === 'bn' ? 'নির্বাচিত কেস স্টাডি' : 'Selected Case Studies')}
                  </EditableElement>
                  <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#F4F0E8] tracking-tight leading-[1.1]">
                    <EditableElement
                      id="caseStudies.titlePrefix"
                      label="Case Studies Title"
                      as="span"
                    >
                      {loc(portfolio.caseStudiesSection?.titlePrefix) ||
                        (language === 'bn' ? 'প্রজেক্ট ও ফলাফল' : 'Work That Delivers')}
                    </EditableElement>{' '}
                    <EditableElement
                      id="caseStudies.titleItalic"
                      label="Case Studies Accent Title"
                      as="span"
                      className="font-editorial italic font-normal text-[#DDD1BE]"
                    >
                      {loc(portfolio.caseStudiesSection?.titleItalic) ||
                        (language === 'bn' ? 'কেস স্টাডি' : 'real results.')}
                    </EditableElement>
                  </h2>
                </Reveal3D>

                <Reveal3D direction="right" delay={80} className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'all', label: language === 'bn' ? 'সব কাজ' : 'All Works' },
                    { id: 'video', label: language === 'bn' ? 'ভিডিও এডিটিং' : 'Video Editing' },
                    { id: 'graphic', label: language === 'bn' ? 'গ্রাফিক ডিজাইন' : 'Graphic Design' },
                    { id: 'motion', label: language === 'bn' ? 'মোশন গ্রাফিক্স' : 'Motion Graphics' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setCaseCategory(tab.id as any)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        caseCategory === tab.id ? 'glass-pill-cta' : 'glass-pill-ghost'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </Reveal3D>
              </div>

              {filteredCaseStudies.length === 0 ? (
                <div className="p-10 rounded-[24px] editorial-card-surface text-center text-sm text-[#9A958C]">
                  {language === 'bn'
                    ? 'এই ক্যাটাগরিতে এখনো কোনো কেস স্টাডি যুক্ত করা হয়নি।'
                    : 'No case studies found in this category yet.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {filteredCaseStudies.map((cs, idx) => {
                    const isVideoWork = cs.category === 'video' || cs.category === 'motion';
                    const catText =
                      loc(cs.categoryLabel) ||
                      (cs.category === 'video'
                        ? language === 'bn'
                          ? 'ভিডিও এডিটিং'
                          : 'Video Editing'
                        : cs.category === 'motion'
                        ? language === 'bn'
                          ? 'মোশন গ্রাফিক্স'
                          : 'Motion Graphics'
                        : language === 'bn'
                        ? 'গ্রাফিক ডিজাইন'
                        : 'Graphic Design');

                    return (
                      <Reveal3D key={cs.id} direction={idx % 2 === 0 ? 'left' : 'right'} delay={idx * 75}>
                        <article
                          onClick={() => handleOpenCaseStudy(cs)}
                          className="h-full group rounded-[24px] editorial-card-surface overflow-hidden flex flex-col justify-between cursor-pointer hover:-translate-y-1 transition-all duration-300"
                        >
                          <div className="p-2.5 border-b border-white/[0.07]">
                            <div className="relative aspect-[16/9] w-full rounded-[16px] overflow-hidden bg-[#0D0F14]">
                              <img
                                src={resolveAssetUrl(
                                  normalizeDirectImageUrl(cs.thumbnail) || '/assets/jaber_hero.png'
                                )}
                                alt={loc(cs.title)}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 border border-white/15 text-[11px] font-medium text-white">
                                {catText}
                              </div>
                              <div className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-full bg-white text-[#14161A] text-xs font-semibold inline-flex items-center gap-1.5 shadow-md">
                                <Eye className="w-3.5 h-3.5" strokeWidth={1.6} />
                                <span>
                                  {isVideoWork
                                    ? language === 'bn'
                                      ? 'ভিডিও দেখুন'
                                      : 'Watch Reel'
                                    : language === 'bn'
                                    ? 'ভিজ্যুয়াল দেখুন'
                                    : 'Inspect Visuals'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                            <div>
                              <EditableElement
                                id={`caseStudy.${cs.id}.title`}
                                label={`Case Study: ${loc(cs.title)}`}
                                as="h3"
                                className="text-lg font-bold text-[#F4F0E8] mb-3"
                              >
                                {loc(cs.title)}
                              </EditableElement>

                              <div className="space-y-2.5 text-xs sm:text-sm">
                                <div className="p-3 rounded-xl editorial-sand-band border">
                                  <span className="font-semibold text-[#E4583B] uppercase tracking-wider text-[10px] block mb-0.5">
                                    {language === 'bn' ? 'সমস্যা (Problem)' : 'Problem'}
                                  </span>
                                  <EditableElement
                                    id={`caseStudy.${cs.id}.problem`}
                                    label={`${loc(cs.title)} Problem`}
                                    as="p"
                                    className="text-[#DDD1BE] leading-relaxed"
                                  >
                                    {loc(cs.problem)}
                                  </EditableElement>
                                </div>

                                <div className="p-3 rounded-xl editorial-sand-band border">
                                  <span className="font-semibold text-[#F4F0E8] uppercase tracking-wider text-[10px] block mb-0.5">
                                    {language === 'bn' ? 'প্রক্রিয়া (Process)' : 'My Process'}
                                  </span>
                                  <EditableElement
                                    id={`caseStudy.${cs.id}.process`}
                                    label={`${loc(cs.title)} Process`}
                                    as="p"
                                    className="text-[#9A958C] leading-relaxed"
                                  >
                                    {loc(cs.process)}
                                  </EditableElement>
                                </div>

                                <div className="p-3 rounded-xl editorial-sand-band border">
                                  <span className="font-semibold text-emerald-500 uppercase tracking-wider text-[10px] block mb-0.5">
                                    {language === 'bn' ? 'ফলাফল (Result)' : 'Result'}
                                  </span>
                                  <EditableElement
                                    id={`caseStudy.${cs.id}.result`}
                                    label={`${loc(cs.title)} Result`}
                                    as="p"
                                    className="text-[#F4F0E8] leading-relaxed"
                                  >
                                    {loc(cs.result)}
                                  </EditableElement>
                                </div>
                              </div>
                            </div>

                            {((isVideoWork && cs.videoUrl) || (!isVideoWork && cs.behanceUrl)) && (
                              <div className="pt-1 flex items-center justify-between text-xs">
                                <a
                                  href={isVideoWork ? cs.videoUrl : cs.behanceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center space-x-1.5 text-[#E4583B] hover:underline font-medium"
                                >
                                  <span>
                                    {isVideoWork
                                      ? language === 'bn'
                                        ? 'অরিজিনাল ভিডিও লিংক'
                                        : 'Open Source Video'
                                      : language === 'bn'
                                      ? 'Behance-এ দেখুন'
                                      : 'View on Behance'}
                                  </span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        </article>
                      </Reveal3D>
                    );
                  })}
                </div>
              )}
            </div>
          </StudioSectionShell>
        )}

      {/* 5. SLIDING REELS, CLIENT REVIEWS, VIVA FAQ, CONVERSION CTA & AS-SUNNAH LOGOS */}
      <ReelsAndTrustSections onOpenVideo={onOpenVideo} />

      {/* 6. AI, AI AUTOMATION & AI OPERATIONS RESEARCH ROADMAP */}
      <AIAutomationRoadmapSection />

      {/* 7. PLAYABLE VIDEO EDITING, VISUAL & SOUND MCQ GAME ZONE */}
      <CreativeGameArena variant="section" />

      {/* 8. STUDIO DIRECTORY NAVIGATION CARDS */}
      {portfolio.homeSectionVisibility?.overviewDirectory !== false &&
        filteredOverviewCards.length > 0 && (
          <StudioSectionShell
            sectionBgKey="overview-directory"
            className="py-16 bg-[#121419]/80 border-t border-white/[0.07]"
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <Reveal3D direction="left">
                  <EditableElement
                    id="directory.tag"
                    label="Directory Tag"
                    as="span"
                    className="text-[11px] font-mono text-[#E4583B] uppercase tracking-[0.22em] block mb-1.5"
                  >
                    {language === 'bn' ? 'পোর্টফোলিও ডিরেক্টরি' : 'EXPLORE STUDIO'}
                  </EditableElement>
                  <EditableElement
                    id="directory.heading"
                    label="Directory Heading"
                    as="h2"
                    className="font-display text-2xl sm:text-3xl font-bold text-[#F4F0E8] tracking-tight"
                  >
                    {language === 'bn'
                      ? 'ওয়েবসাইটের প্রতিটি পেজ ভিজিট করুন'
                      : 'Navigate Dedicated Archive Pages'}
                  </EditableElement>
                </Reveal3D>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {filteredOverviewCards.map((card, idx) => {
                  const Icon = iconMap[card.icon] || Award;
                  const handleCardClick = (e: React.MouseEvent) => {
                    e.preventDefault();
                    if (card.icon === 'Palette' || card.id === 'ov-4') {
                      navigateTo('design');
                    } else if (card.icon === 'Video' || card.id === 'ov-3') {
                      navigateTo('videos');
                    } else {
                      navigateTo(card.linkTarget);
                    }
                  };

                  return (
                    <Reveal3D key={card.id} direction="up" delay={(idx % 3) * 70}>
                      <a
                        href={card.linkTarget}
                        onClick={handleCardClick}
                        className="h-full group p-6 rounded-[22px] editorial-card-surface hover:-translate-y-1 flex flex-col justify-between transition-all duration-300"
                      >
                        <div>
                          <StudioGlassIcon size="md" className="mb-4">
                            <Icon className="w-4 h-4" strokeWidth={1.4} />
                          </StudioGlassIcon>
                          <EditableElement
                            id={`overviewCard.${card.id}.title`}
                            label={`Directory Card: ${loc(card.title)}`}
                            as="h3"
                            className="text-base sm:text-lg font-bold text-[#F4F0E8] mb-2"
                          >
                            {loc(card.title)}
                          </EditableElement>
                          <EditableElement
                            id={`overviewCard.${card.id}.desc`}
                            label="Directory Description"
                            as="p"
                            className="text-xs sm:text-sm text-[#9A958C] mb-5 leading-relaxed"
                          >
                            {loc(card.description)}
                          </EditableElement>
                        </div>
                        <span className="inline-flex items-center space-x-2 rtl:space-x-reverse text-xs font-semibold text-[#E4583B]">
                          <span>{loc(card.linkText)}</span>
                          <StudioArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </a>
                    </Reveal3D>
                  );
                })}
              </div>
            </div>
          </StudioSectionShell>
        )}
    </div>
  );
};
