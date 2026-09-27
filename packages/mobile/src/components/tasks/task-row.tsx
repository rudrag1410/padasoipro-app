import type { Task } from '@padosipro/shared';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { AppText } from '../ui/app-text';
import { Checkbox } from '../ui/checkbox';

interface TaskRowProps {
  task: Task;
  selected: boolean;
  onToggle: (id: string) => void;
}

export const TaskRow = memo(function TaskRow({ task, selected, onToggle }: TaskRowProps) {
  return (
    <Pressable
      onPress={() => onToggle(task.id)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={task.name}
      accessibilityHint={task.description}
      style={({ pressed }) => [styles.row, selected && styles.selected, pressed && styles.pressed]}
    >
      <View style={styles.text}>
        <AppText variant="bodyStrong">{task.name}</AppText>
        <AppText variant="small" color="textMuted">
          {task.description}
        </AppText>
      </View>
      <Checkbox checked={selected} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  pressed: { opacity: 0.85 },
  text: { flex: 1, gap: 2 },
});
