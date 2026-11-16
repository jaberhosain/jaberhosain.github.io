import React, { useState, useRef } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  Box,
  User,
  Video,
  Palette,
  Layers,
  Youtube,
  ExternalLink,
  Play
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useNavigation } from '../context/NavigationContext';
import { ProjectItem, StudioFocusMode, VideoShowcaseItem } from '../types/portfolio';
import { resolveAssetUrl } from '../utils/assetUrl';
import { normalizeDirectImageUrl } from '../lib/imageUrlResolver';
import { EditableElement } from './common/EditableElement';
import { StudioSectionShell } from './common/StudioSectionShell';
import { HeroSpatialSculpture } from './three/HeroSpatialSculpture';
import { HeroBackdropName } from './common/HeroBackdropName';

interface HeroProps {
  onOpenLightbox?: (project: ProjectItem, initialIndex?: number) => void;
  onOpenVideo?: (video: VideoShowcaseItem) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenLightbox, onOpenVideo }) => {
  const { portfolio, ui, loc, language } = usePortfolio();
  const { navigateTo, isMultiPageEnabled, focusMode, setFocusMode } = useNavigation();
  const { hero } = portfolio;

  const [stageMode, setStageMode] = useState<'deck' | 'portrait' | 'sculpture'>('deck');

  // 3D Interactive Stage Tilt & Specular Light State
  const stageRef = useRef<HTMLDivElement>(null);
  const [cardTransform, setCardTransform] = useState({
    rotX: 0,
    rotY: 0,
    glareX: 50,
    glareY: 50,
    isHovered: false
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;

    const maxTilt = 12;
    setCardTransform({
      rotX: -normY * maxTilt,
      rotY: normX * maxTilt,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
      isHovered: true
    });
  };

  const handleMouseLeave = () => {
    setCardTransform({
      rotX: 0,
      rotY: 0,
      glareX: 50,
      glareY: 50,
      isHovered: false
    });
  };

  const rawName = (loc(hero.name) || 'MD. JABER HOSAIN').trim();
  const nameParts = rawName.split(/\s+/);
  const line1Name =
    language === 'en' && nameParts.length >= 2
      ? rawName.toUpperCase().startsWith('MD')
        ? nameParts.slice(0, 2).join(' ').replace(/^MD\b/i, 'MD.')
        : nameParts.slice(0, -1).join(' ')
      : rawName;
  const line2Name =
    language === 'en' && nameParts.length >= 2 ? nameParts[nameParts.length - 1] : '';

  const youtubeChannelUrl =
    portfolio.contact?.youtubeUrl ||
    portfolio.channelLinks?.find((c) => c.id === 'ch-youtube')?.url;
  const behanceChannelUrl =
    portfolio.contact?.behanceUrl ||
    portfolio.channelLinks?.find((c) => c.id === 'ch-behance')?.url;

  // Dynamic real portfolio assets for the stacked 3D showreel card deck
  const featuredVideo = portfolio.videos?.[0] || null;
  const featuredProject = portfolio.projects?.[0] || null;

  const portraitSrc = resolveAssetUrl(
    normalizeDirectImageUrl(hero.avatarUrl) || '/assets/jabir_profile.png'
  );
  const videoThumbSrc = resolveAssetUrl(
    normalizeDirectImageUrl(
      featuredVideo?.customThumbnailUrl || featuredVideo?.thumbnailUrl
    ) || '/assets/jaber_hero.png'
  );
  const graphicThumbSrc = resolveAssetUrl(
    normalizeDirectImageUrl(
      featuredProject?.coverImage || featuredProject?.galleryImages?.[0]
    ) || '/assets/jaber_about.png'
  );

  // Focal card switches visually with focusMode or defaults to Portrait/Showreel showcase
  const primaryCardImage =
    focusMode === 'video'
      ? videoThumbSrc
      : focusMode === 'graphic'
      ? graphicThumbSrc
      : portraitSrc;

  const handleFocalCardAction = () => {
    if (focusMode === 'graphic' && featuredProject) {
      if (onOpenLightbox) {
        onOpenLightbox(featuredProject, 0);
      } else {
        navigateTo('design');
      }
      return;
    }
    if (featuredVideo) {
      if (onOpenVideo) {
        onOpenVideo(featuredVideo);
      } else {
        navigateTo('videos');
      }
      return;
    }
    const el = document.getElementById('case-studies');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <StudioSectionShell
      id="home"
      sectionBgKey="hero"
      customLayerTarget="hero"
      className="relative min-h-[100svh] flex flex-col justify-center pt-24 pb-10 bg-transparent overflow-x-clip"
    >
      {/* Calibrated Studio Scrim between WebGL canvas and foreground typography */}
      <div
        className="hero-contrast-scrim absolute inset-0 z-[1] pointer-events-none"
        aria-hidden="true"
      />

      {/* Subtle Cinema Viewfinder Corner Brackets (Pure geometric framing) */}
      <div
        aria-hidden="true"
        className="hidden sm:block pointer-events-none absolute inset-x-5 lg:inset-x-10 top-22 bottom-8 z-[2]"
      >
        <span className="hero-viewfinder-corner absolute top-0 left-0 w-5 h-5 border-t border-l border-white/[0.16]" />
        <span className="hero-viewfinder-corner absolute top-0 right-0 w-5 h-5 border-t border-r border-white/[0.16]" />
        <span className="hero-viewfinder-corner absolute bottom-0 left-0 w-5 h-5 border-b border-l border-white/[0.16]" />
        <span className="hero-viewfinder-corner absolute bottom-0 right-0 w-5 h-5 border-b border-r border-white/[0.16]" />
      </div>

      {/* Interactive Cursor-Lit Architectural Outline Name Backdrop */}
      <HeroBackdropName />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,490px)] gap-10 lg:gap-12 items-center">
          {/* LEFT COLUMN: Cinema Director Identity & Editorial Hierarchy */}
          <div className="relative z-25 min-w-0 flex flex-col items-center text-center lg:items-start lg:text-left rtl:lg:items-start rtl:lg:text-right">
            {/* Unboxed Tracked Studio Discipline Kicker */}
            <EditableElement
              id="hero.badge"
              label="Hero Studio Kicker"
              as="div"
              className="mb-4"
            >
              <div className="text-[11px] font-mono uppercase tracking-[0.26em] text-[#9A958C]">
                {loc(hero.badge) ||
                  (language === 'bn'
                    ? 'ভিডিও এডিটিং · মোশন গ্রাফিক্স · ভিজ্যুয়াল ডিজাইন'
                    : language === 'ar'
                    ? 'مونتاج الفيديو · موشن جرافيك · تصميم بصري'
                    : 'VIDEO EDITING · MOTION DESIGN · VISUAL CRAFT')}
              </div>
            </EditableElement>

            {/* Primary Two-Line Sculptural 3D Metallic Serif Name + Playhead Reveal */}
            <EditableElement id="hero.name" label="Hero Headline Name" as="div" className="w-full">
              <div className="relative inline-block max-w-full">
                {/* Back 3D Extruded Relief Depth Layer */}
                <div
                  aria-hidden="true"
                  className="hero-display-name hero-metallic-depth select-none pointer-events-none absolute inset-0 translate-y-[3px] translate-x-[1px] opacity-90"
                >
                  <span className="block">{line1Name}</span>
                  {line2Name && <span className="block">{line2Name}</span>}
                </div>

                {/* Front Brushed Metallic Chrome/Ivory Face with Timeline Playhead Wipe */}
                <h1
                  className="hero-display-name hero-metallic-text hero-clip-reveal relative z-10 select-text"
                  aria-label={`${line1Name}${line2Name ? ` ${line2Name}` : ''}`}
                >
                  <span className="sr-only">
                    {line1Name} {line2Name}
                  </span>
                  <span className="block">{line1Name}</span>
                  {line2Name && <span className="block">{line2Name}</span>}
                </h1>

                {/* Subtle Red Vertical Playhead Beam */}
                <span
                  aria-hidden="true"
                  className="hero-playhead-beam pointer-events-none absolute -top-2 -bottom-1 w-[2px] bg-[#FF4B5C] shadow-[0_0_12px_rgba(255,75,92,0.85)] z-20"
                >
                  <span className="absolute -top-1 -left-[3px] w-2 h-2 bg-[#FF4B5C]" />
                </span>
              </div>
            </EditableElement>

            {/* Flowing Editorial Italic Role Statement */}
            <EditableElement
              id="hero.tagline"
              label="Hero Role & Branding"
              as="div"
              className="mt-4 max-w-xl"
            >
              {language === 'bn' ? (
                <p className="font-editorial italic font-normal text-[1.45rem] sm:text-[1.85rem] lg:text-[2.15rem] leading-[1.18] text-[#F4F0E8]">
                  {loc(hero.tagline) || 'ভিডিও এডিটর ও গ্রাফিক ডিজাইনার।'}
                </p>
              ) : language === 'ar' ? (
                <p className="font-editorial italic font-normal text-[1.45rem] sm:text-[1.85rem] lg:text-[2.15rem] leading-[1.18] text-[#F4F0E8]">
                  {loc(hero.tagline) || 'مونتير فيديو ومصمم جرافيك.'}
                </p>
              ) : (
                <p className="font-editorial italic font-normal text-[1.55rem] sm:text-[1.95rem] lg:text-[2.25rem] leading-[1.15] text-[#F4F0E8]">
                  {loc(hero.tagline) || 'Video Editor & Graphic Designer.'}
                </p>
              )}
            </EditableElement>

            {/* Concise Director Value Statement */}
            <EditableElement
              id="hero.subtitle"
              label="Hero Supporting Copy"
              as="div"
              className="mt-3 mb-7 max-w-md"
            >
              <p className="hero-subtitle-font text-xs sm:text-[14px] leading-relaxed text-[#9A958C]">
                {loc(hero.subtitle) ||
                  (language === 'bn'
                    ? 'ব্র্যান্ড ও ক্রিয়েটরদের জন্য সিনেমাটিক ভিডিও এডিটিং, মোশন গ্রাফিক্স এবং স্বতন্ত্র ভিজ্যুয়াল ডিজাইন—কোনো রেডিমেড টেমপ্লেট নয়।'
                    : language === 'ar'
                    ? 'مونتاج سينمائي وموشن جرافيك وهوية بصرية مخصصة للعلامات التجارية وصناع المحتوى بدون قوالب جاهزة.'
                    : 'Editing, motion, and visual craft for brands that demand cinema-grade presence. No templates, no generic shortcuts.')}
              </p>
            </EditableElement>

            {/* Primary CTA Buttons + Signature Calligraphic Mark */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 w-full">
              {hero.showCtaWork !== false && (
                <a
                  href="#case-studies"
                  onClick={(e) => {
                    const el = document.getElementById('case-studies');
                    if (el) {
                      e.preventDefault();
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else if (isMultiPageEnabled) {
                      e.preventDefault();
                      navigateTo(hero.ctaWorkUrl || 'videos');
                    }
                  }}
                  className="glass-pill-cta inline-flex items-center justify-center space-x-2 rtl:space-x-reverse px-6 py-3 rounded-full text-xs sm:text-[13px] font-semibold shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF4B5C]"
                >
                  <EditableElement id="hero.ctaWork" label="Work Button Text" as="span">
                    {loc(hero.ctaWork) || 'See the work'}
                  </EditableElement>
                  <ArrowUpRight className="w-4 h-4" strokeWidth={1.75} />
                </a>
              )}

              {hero.showCtaContact !== false && (
                <a
                  href="#contact-cta"
                  onClick={(e) => {
                    const el = document.getElementById('contact-cta');
                    if (el) {
                      e.preventDefault();
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else if (isMultiPageEnabled) {
                      e.preventDefault();
                      navigateTo('contact');
                    }
                  }}
                  className="glass-pill-ghost inline-flex items-center justify-center space-x-2 rtl:space-x-reverse px-6 py-3 rounded-full text-xs sm:text-[13px] font-semibold transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF4B5C]"
                >
                  <EditableElement id="hero.ctaContact" label="Contact Button Text" as="span">
                    {loc(hero.ctaContact) ||
                      (language === 'bn'
                        ? 'হায়ার করুন'
                        : language === 'ar'
                        ? 'وظفني الآن'
                        : "Let's work together")}
                  </EditableElement>
                </a>
              )}

              {/* Subtle Calligraphic Director Signature */}
              <div
                aria-hidden="true"
                className="hidden sm:flex items-center pl-2 text-[#A7A298] select-none pointer-events-none"
              >
                <svg
                  viewBox="0 0 132 42"
                  className="w-24 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 10c-2 11-5 21-10 25-3 2-6 0-5-3 1-3 7-6 15-7 7-1 10-7 13-13-3 7-5 13-3 14 2 1 6-5 10-10-2 5-3 9-1 10 3 1 8-6 13-14 0 0-3 10-1 11 3 1 9-5 14-9-2 4-2 8 1 8 4 0 10-5 16-8 14-6 28-8 38-7" />
                </svg>
              </div>
            </div>

            {/* Interactive Discipline Focus Switcher (All Portfolio | Video & Motion | Graphic Design) */}
            {portfolio.showFocusSwitcher !== false && (
              <EditableElement
                id="hero.focusSwitcher"
                label="Discipline Switcher"
                as="div"
                className="mt-6 flex flex-col items-center lg:items-start gap-2.5 w-full"
              >
                <div className="studio-pill-rail inline-flex flex-wrap items-center gap-1 p-1 rounded-full bg-[#14161C]/90 border border-white/[0.1] backdrop-blur-md">
                  {(
                    [
                      {
                        id: 'all' as StudioFocusMode,
                        label: language === 'bn' ? 'সব পোর্টফোলিও' : 'All Portfolio',
                        icon: Layers
                      },
                      {
                        id: 'video' as StudioFocusMode,
                        label: language === 'bn' ? 'ভিডিও ও মোশন' : 'Video & Motion',
                        icon: Video
                      },
                      {
                        id: 'graphic' as StudioFocusMode,
                        label: language === 'bn' ? 'গ্রাফিক ডিজাইন' : 'Graphic Design',
                        icon: Palette
                      }
                    ]
                  ).map((item) => {
                    const ModeIcon = item.icon;
                    const active = focusMode === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFocusMode(item.id)}
                        className={`inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-[#E4583B] text-white shadow-[0_6px_18px_-4px_rgba(228,88,59,0.55)]'
                            : 'text-[#A7A298] hover:text-[#F4F0E8] hover:bg-white/[0.04]'
                        }`}
                      >
                        <ModeIcon className="w-3.5 h-3.5" strokeWidth={1.6} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Contextual Quick Links Strip when Video or Graphic focus is active */}
                {focusMode === 'video' && (
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-[11px] text-[#A7A298] pl-1">
                    <span className="text-[#E4583B] font-medium">
                      {language === 'bn' ? 'ভিডিও মোড সক্রিয়' : 'Video & Motion Active'}
                    </span>
                    <span aria-hidden="true">·</span>
                    {youtubeChannelUrl && (
                      <>
                        <a
                          href={youtubeChannelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-[#F4F0E8] hover:text-[#E4583B] transition-colors"
                        >
                          <Youtube className="w-3.5 h-3.5 text-[#FF4B5C]" />
                          <span>YouTube</span>
                          <ExternalLink className="w-2.5 h-2.5 text-[#8E8A82]" />
                        </a>
                        <span aria-hidden="true">·</span>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => navigateTo('videos')}
                      className="inline-flex items-center space-x-1 text-[#DDD1BE] hover:text-white cursor-pointer"
                    >
                      <span>{language === 'bn' ? 'ভিডিও গ্যালারি পেজ' : 'All Video Reels'}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {focusMode === 'graphic' && (
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-[11px] text-[#A7A298] pl-1">
                    <span className="text-[#E4583B] font-medium">
                      {language === 'bn' ? 'গ্রাফিক মোড সক্রিয়' : 'Graphic & Brand Active'}
                    </span>
                    <span aria-hidden="true">·</span>
                    {behanceChannelUrl && (
                      <>
                        <a
                          href={behanceChannelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-[#F4F0E8] hover:text-[#E4583B] transition-colors"
                        >
                          <span className="font-bold text-[#38BDF8]">Bē</span>
                          <span>Behance</span>
                          <ExternalLink className="w-2.5 h-2.5 text-[#8E8A82]" />
                        </a>
                        <span aria-hidden="true">·</span>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => navigateTo('design')}
                      className="inline-flex items-center space-x-1 text-[#DDD1BE] hover:text-white cursor-pointer"
                    >
                      <span>{language === 'bn' ? 'গ্রাফিক ও পোস্টার পেজ' : 'Open Poster Archive'}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </EditableElement>
            )}

            {/* Unboxed Architectural Metrics Row */}
            {hero.showCounters && hero.counters && hero.counters.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-3 gap-6 w-full max-w-lg">
                {hero.counters.map((c) => (
                  <div key={c.id}>
                    <div className="text-2xl sm:text-3xl font-bold text-[#F4F0E8] font-display tabular-nums">
                      {c.value}
                    </div>
                    <div className="text-[11px] text-[#9A958C] tracking-wider uppercase mt-1">
                      {loc(c.label)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Stacked 3D Perspective Showreel Card Fan + Interactive Sculpture */}
          <div className="relative z-10 flex flex-col items-center">
            <EditableElement
              id="hero.portrait"
              label="Hero 3D Showreel & Portrait Stage"
              as="div"
              className="w-full flex justify-center"
            >
              <div
                ref={stageRef}
                data-cursor="drag"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative w-full max-w-[470px] h-[360px] sm:h-[420px] flex items-center justify-center perspective-1200 select-none"
              >
                {/* Ambient Three.js Interactive 3D Cinema Optics Sculpture */}
                <div
                  className={`absolute inset-0 transition-all duration-500 ${
                    stageMode === 'sculpture'
                      ? 'z-30 opacity-100 scale-100'
                      : 'z-0 opacity-75 scale-95 pointer-events-none lg:pointer-events-auto'
                  }`}
                >
                  <HeroSpatialSculpture className="w-full h-full" />
                </div>

                {/* FANNED 3D SHOWREEL CARD DECK (Signature Stacked Cinema Frame) */}
                {stageMode === 'deck' && (
                  <div
                    className="relative w-full h-full flex items-center justify-center preserve-3d transition-transform duration-300 ease-out"
                    style={{
                      transform: `perspective(1200px) rotateX(${cardTransform.rotX * 0.65}deg) rotateY(${cardTransform.rotY * 0.85}deg)`
                    }}
                  >
                    {/* Back Left Fanned Card (Graphic Poster / Design Preview) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (featuredProject && onOpenLightbox) {
                          onOpenLightbox(featuredProject, 0);
                        } else {
                          navigateTo('design');
                        }
                      }}
                      aria-label="Open graphic design archive"
                      className="group/back1 absolute w-[195px] sm:w-[265px] aspect-[16/10] rounded-2xl overflow-hidden border border-white/[0.14] bg-[#161922] shadow-[0_24px_50px_-14px_rgba(0,0,0,0.85)] transition-all duration-500 cursor-pointer hover:border-[#E4583B]/60 z-10"
                      style={{
                        transform: `translate3d(${cardTransform.isHovered ? -68 : -44}px, ${
                          cardTransform.isHovered ? 34 : 26
                        }px, -60px) rotateZ(-9deg)`
                      }}
                    >
                      <img
                        src={graphicThumbSrc}
                        alt="Curated graphic poster preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-75 group-hover/back1:opacity-95 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#E4583B]/15 via-transparent to-transparent pointer-events-none" />
                    </button>

                    {/* Back Right Fanned Card (Motion / Editing Frame Preview) */}
                    <button
                      type="button"
                      onClick={() => navigateTo('videos')}
                      aria-label="Open video editing showcase"
                      className="group/back2 absolute w-[195px] sm:w-[265px] aspect-[16/10] rounded-2xl overflow-hidden border border-white/[0.12] bg-[#14161D] shadow-[0_24px_50px_-14px_rgba(0,0,0,0.85)] transition-all duration-500 cursor-pointer hover:border-white/30 z-10"
                      style={{
                        transform: `translate3d(${cardTransform.isHovered ? 68 : 44}px, ${
                          cardTransform.isHovered ? -26 : -20
                        }px, -45px) rotateZ(7deg)`
                      }}
                    >
                      <img
                        src={videoThumbSrc}
                        alt="Video editing reel preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-70 group-hover/back2:opacity-95 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    </button>

                    {/* Primary Front Center Showcase Card */}
                    <div
                      onClick={handleFocalCardAction}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleFocalCardAction();
                        }
                      }}
                      className="group relative w-[275px] sm:w-[345px] aspect-[16/10] rounded-2xl overflow-hidden glass-showcase-card p-1.5 z-20 cursor-pointer"
                      style={{
                        transform: `translate3d(0, 0, 32px) rotateZ(${
                          cardTransform.isHovered ? -1 : -3
                        }deg) scale(${cardTransform.isHovered ? 1.03 : 1})`,
                        transition: cardTransform.isHovered
                          ? 'transform 0.12s ease-out'
                          : 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    >
                      <div className="relative w-full h-full rounded-[12px] overflow-hidden bg-[#0E1015]">
                        <img
                          src={primaryCardImage}
                          alt={loc(hero.name) || 'Featured Showreel'}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          loading="eager"
                          onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            const fallback = resolveAssetUrl('/assets/jaber_hero.png');
                            if (img.dataset.fallbackStage === '1') return;
                            img.dataset.fallbackStage = '1';
                            img.src = fallback;
                          }}
                        />

                        {/* Contrast Scrim */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10]/75 via-[#0B0C10]/20 to-[#0B0C10]/20" />

                        {/* Calibrated Specular Reflection */}
                        <div
                          className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-200"
                          style={{
                            background: `radial-gradient(circle 280px at ${cardTransform.glareX}% ${cardTransform.glareY}%, rgba(255, 255, 255, 0.36) 0%, rgba(228, 88, 59, 0.14) 45%, transparent 80%)`,
                            opacity: cardTransform.isHovered ? 1 : 0
                          }}
                        />

                        {/* Centered Smoked Glass Action Pill (Inspired by screenshot's central glass pill) */}
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                          <span className="inline-flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-full bg-black/50 group-hover:bg-[#E4583B] text-[#F4F0E8] border border-white/25 group-hover:border-[#E4583B] backdrop-blur-md text-xs font-medium tracking-wide shadow-2xl transition-all duration-200">
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>
                              {focusMode === 'graphic'
                                ? language === 'bn'
                                  ? 'ডিজাইন দেখুন'
                                  : 'Explore Posters'
                                : language === 'bn'
                                ? 'শোরিল দেখুন'
                                : 'Watch Showreel'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* DEDICATED 3D PORTRAIT MONOLITH VIEW */}
                {stageMode === 'portrait' && (
                  <div
                    className="relative w-[245px] sm:w-[290px] aspect-[3/4] z-20 cursor-grab active:cursor-grabbing"
                    style={{
                      transform: `perspective(1000px) rotateX(${cardTransform.rotX}deg) rotateY(${cardTransform.rotY}deg) scale3d(${
                        cardTransform.isHovered ? 1.025 : 1
                      }, ${cardTransform.isHovered ? 1.025 : 1}, 1)`,
                      transition: cardTransform.isHovered
                        ? 'transform 0.08s ease-out'
                        : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <div className="relative w-full h-full rounded-[24px] overflow-hidden glass-showcase-card p-2">
                      <div className="relative w-full h-full rounded-[18px] overflow-hidden bg-[#0E1015]">
                        <img
                          src={portraitSrc}
                          alt={loc(hero.name)}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-top pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0E12]/80 via-transparent to-transparent pointer-events-none" />
                        {hero.showFloatingBadge !== false && (
                          <div className="absolute bottom-3 left-3 right-3 px-4 py-2.5 rounded-2xl glass-showcase-inner flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-[11px] font-medium tracking-wider uppercase text-[#F4F0E8] truncate">
                                {loc(hero.floatingBadgeText) || loc(hero.name) || 'MD JABER HOSAIN'}
                              </div>
                              <div className="font-editorial italic text-sm text-[#DDD1BE] truncate">
                                {language === 'bn'
                                  ? 'ভিডিও ও গ্রাফিক ডিজাইনার'
                                  : 'Motion & Visual Direction'}
                              </div>
                            </div>
                            <span className="text-[10px] text-[#8E8A82] tabular-nums shrink-0">
                              01
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </EditableElement>

            {/* Interactive 3D Stage Mode Switcher (Showreel Deck | Portrait | 3D Rig) */}
            <div className="studio-pill-rail mt-3 inline-flex items-center p-1 rounded-full bg-[#14161C]/90 border border-white/[0.1] backdrop-blur-md z-30">
              <button
                type="button"
                onClick={() => setStageMode('deck')}
                className={`inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  stageMode === 'deck'
                    ? 'bg-[#E4583B] text-white'
                    : 'text-[#A7A298] hover:text-[#F4F0E8]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{language === 'bn' ? '৩D ডেক' : 'Showreel Deck'}</span>
              </button>
              <button
                type="button"
                onClick={() => setStageMode('portrait')}
                className={`inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  stageMode === 'portrait'
                    ? 'bg-[#E4583B] text-white'
                    : 'text-[#A7A298] hover:text-[#F4F0E8]'
                }`}
              >
                <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{language === 'bn' ? 'পোর্ট্রেট' : 'Portrait'}</span>
              </button>
              <button
                type="button"
                onClick={() => setStageMode('sculpture')}
                className={`inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  stageMode === 'sculpture'
                    ? 'bg-[#E4583B] text-white'
                    : 'text-[#A7A298] hover:text-[#F4F0E8]'
                }`}
              >
                <Box className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{language === 'bn' ? '৩D অপটিক্স' : '3D Optics'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Clean Scroll Anchor Row + Studio Craft Strip */}
        <div className="mt-10 pt-5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-xs text-[#9A958C]">
          <span>
            {language === 'bn'
              ? 'থ্রিডি স্পেস সক্রিয় · মাউস বা স্ক্রল করে গভীরতা অনুভব করুন'
              : 'Interactive 3D Spatial Portfolio · Frame by Frame'}
          </span>

          <button
            type="button"
            onClick={() => {
              const target = document.getElementById('case-studies');
              if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center space-x-2 rtl:space-x-reverse text-xs tracking-wide text-[#DDD1BE] hover:text-white transition-colors cursor-pointer"
            aria-label={ui.hero.scrollDown}
          >
            <span>{ui.hero.scrollDown}</span>
            <ArrowDown className="w-3.5 h-3.5" strokeWidth={1.4} />
          </button>
        </div>

        {/* Continuous Studio Discipline Ribbon */}
        <div className="studio-marquee-bar mt-5 overflow-hidden border-y border-[#2B303D]/70 bg-[#14171E]/85 py-2.5 select-none">
          <div className="animate-marquee flex items-center whitespace-nowrap">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex items-center">
                {(language === 'bn'
                  ? [
                      'ভিডিও এডিটিং ও স্টোরিটেলিং',
                      'সিনেমাটিক কালার গ্রেডিং',
                      'কাইনেটিক মোশন গ্রাফিক্স',
                      'গ্রাফিক ও ব্র্যান্ড পোস্টার',
                      'বিহ্যান্স ভিজ্যুয়াল সিরিজ',
                      'সাউন্ড ডিজাইন ও পেসিং'
                    ]
                  : language === 'ar'
                  ? [
                      'مونتاج الفيديو والسرد البصري',
                      'تصحيح الألوان السينمائي',
                      'موشن جرافيك وتايبوغرافي',
                      'تصميم الهويات والبوسترات',
                      'مشاريع بيهانس المصنفة',
                      'هندسة الصوت والإيقاع'
                    ]
                  : [
                      'Video Editing & Pacing',
                      'Cinematic Color Grading',
                      'Kinetic Motion Graphics',
                      'Graphic & Poster Systems',
                      'Behance Curated Series',
                      'Sound Design & Foley'
                    ]
                ).map((label, idx) => (
                  <span
                    key={`${dup}-${idx}`}
                    className="inline-flex items-center text-[11px] font-mono uppercase tracking-[0.22em] text-[#DDD1BE]"
                  >
                    <span className="px-6">{label}</span>
                    <span className="text-[#E4583B]" aria-hidden="true">
                      ·
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </StudioSectionShell>
  );
};
