import { inTransaction, type Database } from '../database';
import { CATALOGUE } from './catalogue.data';

/** Idempotent: inserts new rows and updates changed ones, so it is safe to run on every start. */
export function seedCatalogue(db: Database): { categories: number; tasks: number } {
  const upsertCategory = db.prepare(`
    INSERT INTO task_categories (id, name, description, icon, sort_order)
    VALUES (:id, :name, :description, :icon, :sortOrder)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name, description = excluded.description,
      icon = excluded.icon, sort_order = excluded.sort_order
  `);
  const upsertTask = db.prepare(`
    INSERT INTO tasks (id, category_id, name, description, sort_order)
    VALUES (:id, :categoryId, :name, :description, :sortOrder)
    ON CONFLICT(id) DO UPDATE SET category_id = excluded.category_id, name = excluded.name,
      description = excluded.description, sort_order = excluded.sort_order
  `);

  let tasks = 0;
  inTransaction(db, () => {
    CATALOGUE.forEach((category, categoryIndex) => {
      upsertCategory.run({
        id: category.id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        sortOrder: categoryIndex,
      });
      category.tasks.forEach((task, taskIndex) => {
        upsertTask.run({ ...task, categoryId: category.id, sortOrder: taskIndex });
        tasks += 1;
      });
    });
  });
  return { categories: CATALOGUE.length, tasks };
}
