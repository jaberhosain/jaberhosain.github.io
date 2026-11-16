export type Language = 'en' | 'bn' | 'ar';

export interface LocalizedText {
  en: string;
  bn: string;
  ar: string;
}

export interface OverviewCardItem {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  linkText: LocalizedText;
  linkTarget: string;
  icon: string;
}

export interface AcademicRecord {
  id: string;
  title: LocalizedText;
  year: string;
  description: LocalizedText;
  status: LocalizedText;
}

export interface InstituteCompetency {
  id?: string;
  category: LocalizedText;
  tools: string;
}

export interface ProfessionalInstitute {
  id: string;
  institution: LocalizedText;
  course: LocalizedText;
  batch: string;
  competencies: InstituteCompetency[];
  footerTag1: LocalizedText;
  footerTag2: LocalizedText;
  order?: number;
}

export interface SkillCategory {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  tools: string[];
  icon: string;
}

export interface ServiceItem {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  icon: string;
}

export type MediaCategory = 'graphic' | 'graphic_best' | 'video' | 'video_best';

export interface ProjectItem {
  id: string;
  title: LocalizedText;
  groupName?: LocalizedText;
  category: MediaCategory | string;
  description: LocalizedText;
  coverImage?: string;
  galleryImages?: string[];
  galleryCaptions?: string[];
  behanceUrl?: string;
  externalUrl?: string;
  videoUrl?: string;
  videoType?: 'youtube' | 'vimeo' | 'facebook' | 'direct';
  tags?: string[];
  client?: string;
  year?: string;
  order?: number;
  visible?: boolean;
  hidden?: boolean;
  isPlaceholder?: boolean;
}

export type VideoSectionFormat =
  | 'reels'
  | 'long_video'
  | 'motion_graphics'
  | 'documentary'
  | 'full_production'
  | 'saas'
  | 'cgi';

export type VideoSubSectionTier = 'premium' | 'standard' | 'storytelling' | 'commercial';

export interface VideoShowcaseItem {
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
  videoType: 'youtube' | 'vimeo' | 'facebook' | 'direct';
  videoUrl: string;
  videoId?: string;
  videoHash?: string;
  thumbnailUrl?: string;
  customThumbnailUrl?: string;
  duration?: string;
  views?: string;
  category?: 'video_best' | 'video';
  videoSection?: VideoSectionFormat;
  subSection?: VideoSubSectionTier;
  clientName?: string;
  order?: number;
  visible?: boolean;
  hidden?: boolean;
  isPlaceholder?: boolean;
}

export interface BestWorkGraphicItem {
  id: string;
  title: LocalizedText;
  imageUrl: string;
  behanceUrl?: string;
  order?: number;
  visible?: boolean;
}

export interface BestWorkVideoItem {
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
  videoUrl: string;
  videoType: 'vimeo' | 'youtube' | 'facebook' | 'direct';
  videoId?: string;
  videoHash?: string;
  thumbnailUrl?: string;
  customThumbnailUrl?: string;
  duration?: string;
  videoSection?: VideoSectionFormat;
  subSection?: VideoSubSectionTier;
  clientName?: string;
  order?: number;
  visible?: boolean;
}

export interface BestWorkSectionConfig {
  title: LocalizedText;
  subtitle: LocalizedText;
  sectionTag?: LocalizedText;
}

export interface ChannelLinkItem {
  id: string;
  platform: string;
  badge: LocalizedText;
  description: LocalizedText;
  status: 'LINKED' | 'UNLINKED';
  url?: string;
  icon: string;
}

export interface WorkflowStep {
  id?: string;
  step: string;
  title: LocalizedText;
  description?: LocalizedText;
  order?: number;
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  clientRole: LocalizedText;
  clientCompany?: string;
  clientAvatar?: string;
  rating: number;
  quote: LocalizedText;
  visible?: boolean;
  order?: number;
}

export type CaseStudyCategory = 'video' | 'graphic' | 'motion';

export interface CaseStudyItem {
  id: string;
  category: CaseStudyCategory;
  categoryLabel?: LocalizedText;
  title: LocalizedText;
  thumbnail: string;
  problem: LocalizedText;
  process: LocalizedText;
  result: LocalizedText;
  videoUrl?: string;
  videoType?: 'youtube' | 'vimeo' | 'facebook' | 'direct';
  behanceUrl?: string;
  galleryImages?: string[];
  visible?: boolean;
  order?: number;
}

export interface CaseStudiesSectionConfig {
  tag: LocalizedText;
  titlePrefix: LocalizedText;
  titleItalic: LocalizedText;
  visible?: boolean;
}

export interface TestimonialsSectionConfig {
  tag: LocalizedText;
  title: LocalizedText;
  visible?: boolean;
}

export type HomeSectionId =
  | 'caseStudies'
  | 'videoShowcase'
  | 'graphicShowcase'
  | 'aboutPreview'
  | 'trustTestimonials'
  | 'overviewDirectory';

export type StudioFocusMode = 'all' | 'video' | 'graphic';

export interface HeroCounterItem {
  id: string;
  value: string;
  label: LocalizedText;
  order?: number;
}

export interface HeroData {
  name: LocalizedText;
  badge: LocalizedText;
  showBadge?: boolean;
  tagline: LocalizedText;
  subtitle?: LocalizedText;
  avatarUrl: string;
  ctaWork: LocalizedText;
  ctaWorkUrl?: string;
  showCtaWork?: boolean;
  ctaContact: LocalizedText;
  ctaContactUrl?: string;
  showCtaContact?: boolean;
  floatingBadgeText?: LocalizedText;
  showFloatingBadge?: boolean;
  counters?: HeroCounterItem[];
  showCounters?: boolean;
}

export interface AboutData {
  bio: LocalizedText;
  avatarUrl: string;
}

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textMuted: string;
  border: string;
}

export interface ThemeFonts {
  bangla: string;
  english: string;
  arabic: string;
}

export type ThemeId = 'dark' | 'light' | 'blue' | 'green' | 'purple' | 'warm' | 'custom';

export interface ThemeConfig {
  colors: ThemeColors;
  fonts: ThemeFonts;
  availableThemes?: ThemeId[];
}

export interface SiteBranding {
  title?: string;
  logoText?: string;
  logoInitials?: string;
}

export interface ContactInfo {
  email?: string;
  facebookUrl?: string;
  telegramUrl?: string;
  behanceUrl?: string;
  youtubeUrl?: string;
}

export interface SocialLinkItem {
  id: string;
  platform: string;
  name: string;
  url: string;
  icon: string;
  enabled: boolean;
  order?: number;
}

export interface ContactFormConfig {
  title: LocalizedText;
  subtitle: LocalizedText;
  nameLabel?: LocalizedText;
  namePlaceholder?: LocalizedText;
  emailLabel?: LocalizedText;
  emailPlaceholder?: LocalizedText;
  messageLabel?: LocalizedText;
  messagePlaceholder?: LocalizedText;
  submitButtonText: LocalizedText;
  submittingText?: LocalizedText;
  successMessage: LocalizedText;
  errorMessage: LocalizedText;
  projectPitchTitle?: LocalizedText;
  projectPitchSubtitle?: LocalizedText;
  projectPitchCta?: LocalizedText;
  getInTouchTitle?: LocalizedText;
  getInTouchSubtitle?: LocalizedText;
}

export interface FooterConfig {
  connectTitle?: LocalizedText;
  copyrightText: LocalizedText;
  backToTopText?: LocalizedText;
}

export interface PortfolioConfig {
  id?: string;
  status: 'draft' | 'published';
  defaultFocusMode?: StudioFocusMode;
  showFocusSwitcher?: boolean;
  hero: HeroData;
  about: AboutData;
  caseStudiesSection?: CaseStudiesSectionConfig;
  caseStudies?: CaseStudyItem[];
  homeStats?: HeroCounterItem[];
  showHomeStats?: boolean;
  homeTools?: string[];
  testimonialsSection?: TestimonialsSectionConfig;
  homeSectionOrder?: HomeSectionId[];
  homeSectionVisibility?: Partial<Record<HomeSectionId, boolean>>;
  overviewCards: OverviewCardItem[];
  academicRecords: AcademicRecord[];
  professionalInstitute?: ProfessionalInstitute;
  professionalInstitutes?: ProfessionalInstitute[];
  services: ServiceItem[];
  skills: SkillCategory[];
  workflow: WorkflowStep[];
  showWorkflow?: boolean;
  projects: ProjectItem[];
  videos: VideoShowcaseItem[];
  bestGraphicWorks?: BestWorkGraphicItem[];
  bestVideoWorks?: BestWorkVideoItem[];
  bestGraphicSection?: BestWorkSectionConfig;
  bestVideoSection?: BestWorkSectionConfig;
  channelLinks: ChannelLinkItem[];
  socialLinks?: SocialLinkItem[];
  testimonials: TestimonialItem[];
  contactForm?: ContactFormConfig;
  footerConfig?: FooterConfig;
  googleSheetWebhookUrl?: string;
  theme?: ThemeConfig;
  branding?: SiteBranding;
  contact?: ContactInfo;
  updatedAt: string;
  publishedAt?: string;
}

export interface Lead {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  projectType?: string;
  message: string;
  honeypot?: string;
  status: 'new' | 'contacted' | 'completed';
  createdAt: string;
  syncedToSheet?: boolean;
}
