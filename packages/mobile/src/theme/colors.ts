/**
 * Palette taken from app.padosipro.com (computed styles) and padosipro.com (CSS custom properties).
 */
export const colors = {
  // Brand
  primary: '#155C49', // app.padosipro.com primary button
  primaryPressed: '#0F4637',
  primarySoft: '#E8F1EE',
  accent: '#42B267', // padosipro.com --accent
  accentSoft: 'rgba(66, 178, 103, 0.12)',

  // Surfaces
  background: '#FAFAF7', // app.padosipro.com page background
  surface: '#FFFFFF',
  surfaceMuted: '#F7F7F5', // padosipro.com --surface
  overlay: 'rgba(16, 24, 40, 0.4)',

  // Text
  text: '#101828',
  textMuted: '#667085',
  textSubtle: '#98A2B3',
  textOnPrimary: '#FFFFFF',

  // Lines
  border: '#D0D5DD', // input border
  borderSoft: '#EAECF0',

  // Status
  danger: '#D92D20',
  dangerSoft: '#FEF3F2',
  dangerBorder: '#FECDCA',
  success: '#079455',
  successSoft: '#ECFDF3',
  warning: '#B54708',
  warningSoft: '#FFFAEB',
} as const;

export type ColorToken = keyof typeof colors;
