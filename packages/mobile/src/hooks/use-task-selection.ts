import { useContext } from 'react';
import { TaskSelectionContext } from '@/providers/task-selection.provider';

export function useTaskSelection() {
  const context = useContext(TaskSelectionContext);
  if (!context) throw new Error('useTaskSelection must be used inside <TaskSelectionProvider>');
  return context;
}
