import { StyleSheet, Text, type TextProps } from 'react-native';
import { colors, typography, type ColorToken, type TypographyVariant } from '@/theme';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: ColorToken;
  align?: 'left' | 'center' | 'right';
}

export function AppText({ variant = 'body', color = 'text', align, style, ...rest }: AppTextProps) {
  return <Text {...rest} style={[typography[variant], { color: colors[color] }, align && { textAlign: align }, styles.base, style]} />;
}

const styles = StyleSheet.create({
  base: { includeFontPadding: false },
});
