import { StyleSheet, View } from 'react-native';
import { COPY } from '@/constants';
import { spacing } from '@/theme';
import { AppText } from '../ui/app-text';
import { LogoMark } from './logo-mark';

interface BrandHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
}

/** Logo, "PadosiPro" overline, big title and a muted subtitle, as on app.padosipro.com. */
export function BrandHeader({ title, subtitle, showLogo = true }: BrandHeaderProps) {
  return (
    <View style={styles.wrap}>
      {showLogo && (
        <View style={styles.brand}>
          <LogoMark />
          <AppText variant="overline" color="textMuted">
            {COPY.BRAND}
          </AppText>
        </View>
      )}
      <AppText variant="display" accessibilityRole="header">
        {title}
      </AppText>
      {subtitle && (
        <AppText variant="body" color="textMuted">
          {subtitle}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginBottom: spacing.xxl },
  brand: { gap: spacing.sm, marginBottom: spacing.lg },
});
