export interface Task {
  id: string;
  categoryId: string;
  name: string;
  description: string;
}

export interface TaskCategory {
  id: string;
  name: string;
  description: string;
  /** Feather icon name, rendered by the app. */
  icon: string;
}

export interface CategoryWithTasks extends TaskCategory {
  tasks: Task[];
}
