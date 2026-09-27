import type { TextStyle } from 'react-native';

/** Outfit stands in for Eina (licensed), which padosipro.com uses for headings. Body text uses the system font. */
export const fontFamily = {
  heading: 'Outfit_600SemiBold',
  headingBold: 'Outfit_700Bold',
  headingMedium: 'Outfit_500Medium',
} as const;

export const typography = {
  display: { fontFamily: fontFamily.heading, fontSize: 30, lineHeight: 38 },
  title: { fontFamily: fontFamily.heading, fontSize: 22, lineHeight: 28 },
  heading: { fontFamily: fontFamily.heading, fontSize: 18, lineHeight: 24 },
  body: { fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  small: { fontSize: 14, lineHeight: 20 },
  smallStrong: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  caption: { fontSize: 12, lineHeight: 16 },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 0.4 },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
