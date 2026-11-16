/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ElementMotionMode =
  | 'default'
  | 'none'
  | 'slide-up'
  | 'slide-left'
  | 'slide-right'
  | 'float';

export interface ElementStyleOverride {
  color?: string;
  fontSize?: number; // in pixels
  fontFamily?: string;
  /** Inline live text replacement per language code ('en' | 'bn' | 'ar' | 'default') */
  textOverride?: Record<string, string>;
  /** Delete / hide element from site */
  hidden?: boolean;
  /** Free drag positioning offset in pixels */
  offsetX?: number;
  offsetY?: number;
  zIndex?: number;
  /** Frame sizing */
  width?: number | string;
  height?: number | string;
  padding?: number;
  borderRadius?: number;
  /** Zoom / scale and rotation */
  scale?: number;
  rotate?: number;
  /** Opacity, blur & shadow */
  opacity?: number;
  blur?: number;
  shadowIntensity?: number;
  shadowColor?: string;
  /** Glassmorphism / Background surface controls */
  bgColor?: string;
  glassBlur?: number;
  glassOpacity?: number;
  glassBorderOpacity?: number;
  /** Alignment */
  textAlign?: 'left' | 'center' | 'right';
  /** Per-element slide/motion toggle */
  motionMode?: ElementMotionMode;
  // Responsive structure prepared for subsequent steps
  responsive?: {
    desktop?: { color?: string; fontSize?: number; fontFamily?: string };
    tablet?: { color?: string; fontSize?: number; fontFamily?: string };
    mobile?: { color?: string; fontSize?: number; fontFamily?: string };
  };
}

export type Studio3DPreset =
  | 'liquid-wave'
  | 'cyber-grid'
  | 'orbital-rings'
  | 'starfield-nebula'
  | 'minimal-void';

export interface Studio3DBackgroundConfig {
  preset: Studio3DPreset;
  customBgUrl?: string;
  customBgMode?: '3d-plane' | 'backdrop-parallax';
  customBgOpacity?: number;
  customBgBlur?: number;
  customBgScale?: number;
  waveIntensity?: number;
  motionSpeed?: number;
  bokehDensity?: number;
  accentColor?: string;
}

export interface SectionBackgroundConfig {
  imageUrl?: string;
  bgColor?: string;
  opacity?: number;
  blur?: number;
  overlayOpacity?: number;
  scale?: number;
  visible?: boolean;
}

export type CustomLayerSectionTarget =
  | 'hero'
  | 'case-studies'
  | 'about-preview'
  | 'trust-testimonials'
  | 'global';

export interface CustomCanvasLayer {
  id: string;
  name: string;
  type: 'rectangle' | 'text' | 'icon' | 'image';
  sectionTarget: CustomLayerSectionTarget;
  /** Percentage horizontally (0 - 95) inside section */
  x: number;
  /** Pixel offset from section top */
  y: number;
  width: number;
  height: number;
  text?: string;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'center' | 'bottom';
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  bgColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  opacity?: number;
  blur?: number;
  glassBlur?: number;
  glassOpacity?: number;
  shadowIntensity?: number;
  shadowColor?: string;
  scale?: number;
  rotate?: number;
  zIndex?: number;
  iconName?: string;
  customIconUrl?: string;
  iconSize?: number;
  iconColor?: string;
  iconPosition?: 'top' | 'left' | 'right';
  slideAnimation?: 'none' | 'slide-up' | 'slide-left' | 'slide-right' | 'float';
  visible?: boolean;
}

export interface DesignOverridesDoc {
  updatedAt?: string;
  elements: Record<string, ElementStyleOverride>;
  studio3D?: Studio3DBackgroundConfig;
  sectionBackgrounds?: Record<string, SectionBackgroundConfig>;
  customLayers?: CustomCanvasLayer[];
  sectionOrder?: string[];
}

export const DEFAULT_STUDIO_3D: Studio3DBackgroundConfig = {
  preset: 'liquid-wave',
  customBgUrl: '',
  customBgMode: '3d-plane',
  customBgOpacity: 0.55,
  customBgBlur: 0,
  customBgScale: 1,
  waveIntensity: 1,
  motionSpeed: 1,
  bokehDensity: 1,
  accentColor: ''
};

export interface FontOption {
  id: string;
  label: string;
  fontFamily: string;
  languageSupport: 'English' | 'Bangla' | 'Arabic' | 'Universal';
}

export const LIVE_EDIT_FONT_OPTIONS: FontOption[] = [
  { id: 'playfair', label: 'Playfair Display (Serif)', fontFamily: 'Playfair Display', languageSupport: 'English' },
  { id: 'instrument-serif', label: 'Instrument Serif (Italic)', fontFamily: 'Instrument Serif', languageSupport: 'English' },
  { id: 'cormorant', label: 'Cormorant Garamond', fontFamily: 'Cormorant Garamond', languageSupport: 'English' },
  { id: 'plus-jakarta', label: 'Plus Jakarta Sans', fontFamily: 'Plus Jakarta Sans', languageSupport: 'English' },
  { id: 'syne', label: 'Syne Display', fontFamily: 'Syne', languageSupport: 'English' },
  { id: 'space-grotesk', label: 'Space Grotesk', fontFamily: 'Space Grotesk', languageSupport: 'English' },
  { id: 'li-ador', label: 'Li Ador Noirrit', fontFamily: 'Li Ador Noirrit', languageSupport: 'Bangla' },
  { id: 'hind-siliguri', label: 'Hind Siliguri', fontFamily: 'Hind Siliguri', languageSupport: 'Bangla' },
  { id: 'cairo', label: 'Cairo', fontFamily: 'Cairo', languageSupport: 'Arabic' },
  { id: 'amiri', label: 'Amiri', fontFamily: 'Amiri', languageSupport: 'Arabic' },
  { id: 'inter', label: 'Inter', fontFamily: 'Inter', languageSupport: 'Universal' },
  { id: 'outfit', label: 'Outfit', fontFamily: 'Outfit', languageSupport: 'Universal' }
];
