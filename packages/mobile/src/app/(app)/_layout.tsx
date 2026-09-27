import { Stack } from 'expo-router';
import { TaskSelectionProvider } from '@/providers/task-selection.provider';
import { colors } from '@/theme';

export default function AppLayout() {
  return (
    <TaskSelectionProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
    </TaskSelectionProvider>
  );
}
