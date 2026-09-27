import type { CategoryWithTasks } from '@padosipro/shared';
import { StyleSheet } from 'react-native';
import { pluralize } from '@/helpers';
import { spacing } from '@/theme';
import { Card } from '../ui/card';
import { CategoryHeader } from './category-header';
import { SelectedTaskItem } from './selected-task-item';

interface SelectedCategoryCardProps {
  category: CategoryWithTasks;
  onRemove?: (id: string) => void;
}

/** A category with its chosen tasks, used on the confirm step and the home screen. */
export function SelectedCategoryCard({ category, onRemove }: SelectedCategoryCardProps) {
  return (
    <Card style={styles.card}>
      <CategoryHeader category={category} meta={pluralize(category.tasks.length, 'task')} />
      {category.tasks.map((task, index) => (
        <SelectedTaskItem key={task.id} task={task} onRemove={onRemove} isLast={index === category.tasks.length - 1} />
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { paddingTop: 0, paddingBottom: spacing.xs, marginBottom: spacing.md },
});
