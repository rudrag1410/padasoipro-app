import type { DatabaseSync } from 'node:sqlite';

/** Ordered, append-only list of schema changes. Never edit a shipped migration; add a new one. */
const MIGRATIONS: { id: number; name: string; sql: string }[] = [
  {
    id: 1,
    name: 'initial_schema',
    sql: `
      CREATE TABLE users (
        id                TEXT PRIMARY KEY,
        email             TEXT NOT NULL UNIQUE,
        password_hash     TEXT NOT NULL,
        email_verified_at TEXT,
        created_at        TEXT NOT NULL
      );

      CREATE TABLE profiles (
        user_id       TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        name          TEXT NOT NULL,
        mobile        TEXT NOT NULL,
        address       TEXT NOT NULL,
        business_name TEXT,
        updated_at    TEXT NOT NULL
      );

      CREATE TABLE email_otps (
        id          TEXT PRIMARY KEY,
        user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code_hash   TEXT NOT NULL,
        attempts    INTEGER NOT NULL DEFAULT 0,
        expires_at  TEXT NOT NULL,
        consumed_at TEXT,
        created_at  TEXT NOT NULL
      );
      CREATE INDEX idx_email_otps_user ON email_otps(user_id, created_at);

      CREATE TABLE task_categories (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        description TEXT NOT NULL,
        icon        TEXT NOT NULL,
        sort_order  INTEGER NOT NULL
      );

      CREATE TABLE tasks (
        id          TEXT PRIMARY KEY,
        category_id TEXT NOT NULL REFERENCES task_categories(id),
        name        TEXT NOT NULL,
        description TEXT NOT NULL,
        sort_order  INTEGER NOT NULL
      );
      CREATE INDEX idx_tasks_category ON tasks(category_id, sort_order);

      CREATE TABLE user_tasks (
        user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        task_id     TEXT NOT NULL REFERENCES tasks(id),
        selected_at TEXT NOT NULL,
        PRIMARY KEY (user_id, task_id)
      );
    `,
  },
];

export function runMigrations(db: DatabaseSync): void {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (id INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL)`);
  const applied = new Set(
    (db.prepare('SELECT id FROM schema_migrations').all() as { id: number }[]).map((row) => row.id),
  );

  for (const migration of MIGRATIONS) {
    if (applied.has(migration.id)) continue;
    db.exec('BEGIN');
    try {
      db.exec(migration.sql);
      db.prepare('INSERT INTO schema_migrations (id, name, applied_at) VALUES (?, ?, ?)').run(
        migration.id,
        migration.name,
        new Date().toISOString(),
      );
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
}
