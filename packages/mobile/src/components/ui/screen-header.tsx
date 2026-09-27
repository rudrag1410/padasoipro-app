import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, sizes, spacing } from '@/theme';
import { AppText } from './app-text';

interface ScreenHeaderProps {
  onBack?: () => void;
  right?: ReactNode;
  title?: string;
}

export function ScreenHeader({ onBack, right, title }: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {onBack && (
          <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Go back" style={styles.back}>
            <Feather name="arrow-left" size={sizes.iconLg} color={colors.text} />
          </Pressable>
        )}
      </View>
      {title ? (
        <AppText variant="bodyStrong" numberOfLines={1} style={styles.title}>
          {title}
        </AppText>
      ) : (
        <View style={styles.title} />
      )}
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 44, marginBottom: spacing.lg },
  side: { minWidth: 44 },
  right: { alignItems: 'flex-end' },
  back: { width: 40, height: 40, justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center' },
});
