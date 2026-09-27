import type { CategoryWithTasks, Task } from '@padosipro/shared';

/** Case-insensitive search over task name, description and category name. Empty categories are dropped. */
export function filterCatalogue(categories: CategoryWithTasks[], query: string): CategoryWithTasks[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return categories;

  return categories
    .map((category) => {
      const categoryMatches = category.name.toLowerCase().includes(needle);
      const tasks = categoryMatches
        ? category.tasks
        : category.tasks.filter(
            (task) => task.name.toLowerCase().includes(needle) || task.description.toLowerCase().includes(needle),
          );
      return { ...category, tasks };
    })
    .filter((category) => category.tasks.length > 0);
}

/** Keeps catalogue order and category grouping for a set of chosen ids. */
export function groupSelected(categories: CategoryWithTasks[], selectedIds: ReadonlySet<string>): CategoryWithTasks[] {
  return categories
    .map((category) => ({ ...category, tasks: category.tasks.filter((task) => selectedIds.has(task.id)) }))
    .filter((category) => category.tasks.length > 0);
}

/** Groups a flat task list (e.g. the saved selection) under their categories. */
export function groupTasksByCategory(categories: CategoryWithTasks[], tasks: Task[]): CategoryWithTasks[] {
  return groupSelected(categories, new Set(tasks.map((task) => task.id)));
}
