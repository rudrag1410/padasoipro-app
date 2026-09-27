import { Feather } from '@expo/vector-icons';
import type { Task } from '@padosipro/shared';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/theme';
import { AppText } from '../ui/app-text';

interface SelectedTaskItemProps {
  task: Task;
  /** Shows a remove button when provided. */
  onRemove?: (id: string) => void;
  isLast?: boolean;
}

export function SelectedTaskItem({ task, onRemove, isLast }: SelectedTaskItemProps) {
  return (
    <View style={[styles.row, !isLast && styles.divider]}>
      <Feather name="check-circle" size={18} color={colors.accent} style={styles.icon} />
      <View style={styles.text}>
        <AppText variant="bodyStrong">{task.name}</AppText>
        <AppText variant="small" color="textMuted">
          {task.description}
        </AppText>
      </View>
      {onRemove && (
        <Pressable
          onPress={() => onRemove(task.id)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${task.name}`}
        >
          <Feather name="x" size={20} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.md },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  icon: { marginTop: 3 },
  text: { flex: 1, gap: 2 },
});
