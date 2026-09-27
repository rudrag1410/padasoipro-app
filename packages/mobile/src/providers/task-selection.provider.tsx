import { createContext, useCallback, useMemo, useState, type PropsWithChildren } from 'react';

export interface TaskSelectionContextValue {
  selectedIds: ReadonlySet<string>;
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  replace: (ids: Iterable<string>) => void;
  clear: () => void;
}

export const TaskSelectionContext = createContext<TaskSelectionContextValue | null>(null);

/** The in-progress selection, shared by the task picker and the confirm step. */
export function TaskSelectionProvider({ children }: PropsWithChildren) {
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  }, []);

  const replace = useCallback((ids: Iterable<string>) => setSelectedIds(new Set(ids)), []);
  const clear = useCallback(() => setSelectedIds(new Set()), []);

  const value = useMemo<TaskSelectionContextValue>(
    () => ({ selectedIds, isSelected: (id) => selectedIds.has(id), toggle, remove, replace, clear }),
    [selectedIds, toggle, remove, replace, clear],
  );

  return <TaskSelectionContext.Provider value={value}>{children}</TaskSelectionContext.Provider>;
}
