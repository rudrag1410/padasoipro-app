import type { CategoryWithTasks, Task } from '@padosipro/shared';
import type { Database } from '../../db/database';
import { inTransaction } from '../../db/database';
import type { ITaskRepository } from '../../interfaces';
import { toIso } from '../../utils';

interface CategoryRow {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface TaskRow {
  id: string;
  category_id: string;
  name: string;
  description: string;
}

const toTask = (row: TaskRow): Task => ({
  id: row.id,
  categoryId: row.category_id,
  name: row.name,
  description: row.description,
});

export class SqliteTaskRepository implements ITaskRepository {
  constructor(private readonly db: Database) {}

  async getCatalogue(): Promise<CategoryWithTasks[]> {
    const categories = this.db
      .prepare('SELECT id, name, description, icon FROM task_categories ORDER BY sort_order')
      .all() as unknown as CategoryRow[];
    const tasks = this.db
      .prepare('SELECT id, category_id, name, description FROM tasks ORDER BY sort_order')
      .all() as unknown as TaskRow[];

    const byCategory = new Map<string, Task[]>();
    for (const row of tasks) {
      const list = byCategory.get(row.category_id) ?? [];
      list.push(toTask(row));
      byCategory.set(row.category_id, list);
    }
    return categories.map((category) => ({ ...category, tasks: byCategory.get(category.id) ?? [] }));
  }

  async findExistingIds(ids: string[]): Promise<string[]> {
    if (ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(', ');
    const rows = this.db.prepare(`SELECT id FROM tasks WHERE id IN (${placeholders})`).all(...ids) as { id: string }[];
    return rows.map((row) => row.id);
  }

  async getSelectedTasks(userId: string): Promise<Task[]> {
    const rows = this.db
      .prepare(
        `SELECT t.id, t.category_id, t.name, t.description
         FROM user_tasks ut
         JOIN tasks t ON t.id = ut.task_id
         JOIN task_categories c ON c.id = t.category_id
         WHERE ut.user_id = ?
         ORDER BY c.sort_order, t.sort_order`,
      )
      .all(userId) as unknown as TaskRow[];
    return rows.map(toTask);
  }

  async hasSelection(userId: string): Promise<boolean> {
    return this.db.prepare('SELECT 1 FROM user_tasks WHERE user_id = ? LIMIT 1').get(userId) !== undefined;
  }

  async replaceSelection(userId: string, taskIds: string[], at: Date): Promise<void> {
    const insert = this.db.prepare('INSERT INTO user_tasks (user_id, task_id, selected_at) VALUES (?, ?, ?)');
    inTransaction(this.db, () => {
      this.db.prepare('DELETE FROM user_tasks WHERE user_id = ?').run(userId);
      for (const taskId of taskIds) insert.run(userId, taskId, toIso(at));
    });
  }
}
