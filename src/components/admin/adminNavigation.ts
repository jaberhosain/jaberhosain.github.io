import React from 'react';
import {
  User as UserIcon,
  GraduationCap,
  Wrench,
  Film,
  Mail,
  Inbox,
  Palette,
  Sliders
} from 'lucide-react';

export type AdminGroupId =
  | 'profile'
  | 'education'
  | 'skills-services'
  | 'media'
  | 'contact-links'
  | 'feedback-leads'
  | 'theme'
  | 'settings';

export interface AdminSubSectionDef {
  id: string;
  label: string;
  desc?: string;
}

export interface AdminGroupDef {
  id: AdminGroupId;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  subSections: AdminSubSectionDef[];
}

export const ADMIN_GROUPS: AdminGroupDef[] = [
  {
    id: 'profile',
    label: 'Profile',
    desc: 'Hero identity, About bio & profile photo',
    icon: UserIcon,
    subSections: [
      { id: 'hero', label: 'Hero & Identity', desc: 'Avatar, badge, headlines & CTA buttons' },
      { id: 'about', label: 'About', desc: 'Multilingual biography in English and Bangla' },
      { id: 'photo', label: 'Profile Photo', desc: 'Upload or link about portrait image' }
    ]
  },
  {
    id: 'education',
    label: 'Education',
    desc: 'Academic background & professional training',
    icon: GraduationCap,
    subSections: [
      { id: 'academic', label: 'Academic Background', desc: 'Degrees, examinations and passing years' },
      { id: 'professional', label: 'Professional Training', desc: 'Institutes, certifications and competencies' }
    ]
  },
  {
    id: 'skills-services',
    label: 'Skills & Services',
    desc: 'Skills, services & creative workflow',
    icon: Wrench,
    subSections: [
      { id: 'skills', label: 'Skills', desc: 'Design & video software stacks and proficiency' },
      { id: 'services', label: 'Services', desc: 'Offered services in 3 languages' },
      { id: 'workflow', label: 'Creative Workflow', desc: 'Production roadmap steps and titles' }
    ]
  },
  {
    id: 'media',
    label: 'Media',
    desc: 'Graphic design projects & video showcase',
    icon: Film,
    subSections: [
      { id: 'graphic-design', label: 'Graphic Design', desc: 'Graphic design projects, artwork & Behance' },
      { id: 'graphic-best', label: 'Graphic Design - Best Work', desc: 'Curated graphic design highlights' },
      { id: 'video-editing', label: 'Video Editing', desc: 'Video showcase with YouTube & Facebook embeds' },
      { id: 'video-best', label: 'Video Editing - Best Work', desc: 'Curated video editing highlights' }
    ]
  },
  {
    id: 'contact-links',
    label: 'Contact & Links',
    desc: 'Direct info, channel links & social icons',
    icon: Mail,
    subSections: [
      { id: 'contact-info', label: 'Contact Info', desc: 'Email address, Telegram & social links' },
      { id: 'channel-links', label: 'Channel Links', desc: 'YouTube, Behance, and portfolio channels' },
      { id: 'social-icons', label: 'Social Icons', desc: 'Connect With Me social icons and links' }
    ]
  },
  {
    id: 'feedback-leads',
    label: 'Feedback & Leads',
    desc: 'Inquiries, Google Sheet sync & advice form text',
    icon: Inbox,
    subSections: [
      { id: 'leads', label: 'Leads List', desc: 'Private messages from the advice/contact form' },
      { id: 'sheets', label: 'Google Sheets', desc: 'Google Apps Script Web App sync webhook' },
      { id: 'advice-form-text', label: 'Advice Form Text', desc: 'Advice form headings, placeholders & messages' }
    ]
  },
  {
    id: 'theme',
    label: 'Theme',
    desc: 'Theme colors, typography & visitor themes',
    icon: Palette,
    subSections: [
      { id: 'theme-settings', label: 'Theme Settings', desc: 'Colors, fonts and theme options' }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    desc: 'Site title, footer text, backup & controls',
    icon: Sliders,
    subSections: [
      { id: 'general-branding', label: 'Site Title & Monogram', desc: 'Browser title and navbar brand monogram' },
      { id: 'footer-text', label: 'Footer Text', desc: 'Footer copyright rights notice and labels' },
      { id: 'controls-backup', label: 'Backup & Controls', desc: 'JSON backup export, draft/live status & logout' }
    ]
  }
];
