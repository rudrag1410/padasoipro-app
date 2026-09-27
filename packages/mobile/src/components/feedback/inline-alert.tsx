import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import type { IconName } from '@/utils';
import { AppText } from '../ui/app-text';

type Tone = 'error' | 'info' | 'success' | 'warning';

const TONES: Record<Tone, { bg: string; border: string; fg: keyof typeof colors; icon: IconName }> = {
  error: { bg: colors.dangerSoft, border: colors.dangerBorder, fg: 'danger', icon: 'alert-circle' },
  info: { bg: colors.primarySoft, border: colors.primarySoft, fg: 'primary', icon: 'info' },
  success: { bg: colors.successSoft, border: colors.successSoft, fg: 'success', icon: 'check-circle' },
  warning: { bg: colors.warningSoft, border: colors.warningSoft, fg: 'warning', icon: 'clock' },
};

export function InlineAlert({ message, tone = 'error' }: { message: string; tone?: Tone }) {
  const look = TONES[tone];
  return (
    <View
      style={[styles.box, { backgroundColor: look.bg, borderColor: look.border }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Feather name={look.icon} size={18} color={colors[look.fg]} style={styles.icon} />
      <AppText variant="small" color={look.fg} style={styles.text}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1 },
  icon: { marginTop: 1 },
  text: { flex: 1 },
});
