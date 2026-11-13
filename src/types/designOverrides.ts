/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ElementStyleOverride {
  color?: string;
  fontSize?: number; // in pixels
  fontFamily?: string;
  // Responsive structure prepared for subsequent steps
  responsive?: {
    desktop?: { color?: string; fontSize?: number; fontFamily?: string };
    tablet?: { color?: string; fontSize?: number; fontFamily?: string };
    mobile?: { color?: string; fontSize?: number; fontFamily?: string };
  };
}

export interface DesignOverridesDoc {
  updatedAt?: string;
  elements: Record<string, ElementStyleOverride>;
}

export interface FontOption {
  id: string;
  label: string;
  fontFamily: string;
  languageSupport: 'English' | 'Bangla' | 'Arabic' | 'Universal';
}

export const LIVE_EDIT_FONT_OPTIONS: FontOption[] = [
  { id: 'plus-jakarta', label: 'Plus Jakarta Sans', fontFamily: 'Plus Jakarta Sans', languageSupport: 'English' },
  { id: 'li-ador', label: 'Li Ador Noirrit', fontFamily: 'Li Ador Noirrit', languageSupport: 'Bangla' },
  { id: 'cairo', label: 'Cairo', fontFamily: 'Cairo', languageSupport: 'Arabic' },
  { id: 'inter', label: 'Inter', fontFamily: 'Inter', languageSupport: 'Universal' },
  { id: 'poppins', label: 'Poppins', fontFamily: 'Poppins', languageSupport: 'Universal' },
  { id: 'space-grotesk', label: 'Space Grotesk', fontFamily: 'Space Grotesk', languageSupport: 'English' },
  { id: 'amiri', label: 'Amiri', fontFamily: 'Amiri', languageSupport: 'Arabic' },
];
