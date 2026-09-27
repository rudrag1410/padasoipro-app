import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, sizes, spacing } from '@/theme';
import type { IconName } from '@/utils';
import { AppText } from './app-text';

type Variant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  title: string;
  variant?: Variant;
  loading?: boolean;
  icon?: IconName;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

const VARIANTS: Record<Variant, { bg: string; bgPressed: string; fg: keyof typeof colors; border?: string }> = {
  primary: { bg: colors.primary, bgPressed: colors.primaryPressed, fg: 'textOnPrimary' },
  secondary: { bg: colors.surface, bgPressed: colors.surfaceMuted, fg: 'text', border: colors.border },
  ghost: { bg: 'transparent', bgPressed: colors.primarySoft, fg: 'primary' },
};

export function Button({ title, variant = 'primary', loading = false, disabled, icon, compact, style, ...rest }: ButtonProps) {
  const look = VARIANTS[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: loading }}
      disabled={inactive}
      {...rest}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        { backgroundColor: pressed ? look.bgPressed : look.bg },
        look.border && { borderColor: look.border, borderWidth: sizes.borderWidth },
        inactive && styles.inactive,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors[look.fg]} />
      ) : (
        <View style={styles.content}>
          {icon && <Feather name={icon} size={sizes.iconMd} color={colors[look.fg]} />}
          <AppText variant="bodyStrong" color={look.fg}>
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: sizes.buttonHeight,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  compact: { height: 44, paddingHorizontal: spacing.lg },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  inactive: { opacity: 0.45 },
});
