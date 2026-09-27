import { Feather } from '@expo/vector-icons';
import type { TaskCategory } from '@padosipro/shared';
import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { toIconName } from '@/utils';
import { AppText } from '../ui/app-text';

interface CategoryHeaderProps {
  category: TaskCategory;
  /** e.g. "2 selected" */
  meta?: string;
}

export function CategoryHeader({ category, meta }: CategoryHeaderProps) {
  return (
    <View style={styles.row} accessibilityRole="header">
      <View style={styles.icon}>
        <Feather name={toIconName(category.icon)} size={18} color={colors.primary} />
      </View>
      <View style={styles.text}>
        <AppText variant="heading">{category.name}</AppText>
      </View>
      {meta && (
        <View style={styles.badge}>
          <AppText variant="caption" color="primary" style={styles.badgeText}>
            {meta}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingTop: spacing.xl, paddingBottom: spacing.md },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm + 2,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  badge: { backgroundColor: colors.accentSoft, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  badgeText: { fontWeight: '600' },
});
