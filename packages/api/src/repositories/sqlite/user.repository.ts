import type { Database } from '../../db/database';
import type { IUserRepository } from '../../interfaces';
import type { NewUser, UserRecord } from '../../types';
import { fromIso, fromIsoOrNull, newId, toIso } from '../../utils';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  email_verified_at: string | null;
  created_at: string;
}

const toRecord = (row: UserRow): UserRecord => ({
  id: row.id,
  email: row.email,
  passwordHash: row.password_hash,
  emailVerifiedAt: fromIsoOrNull(row.email_verified_at),
  createdAt: fromIso(row.created_at),
});

export class SqliteUserRepository implements IUserRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<UserRecord | null> {
    const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
    return row ? toRecord(row) : null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const row = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;
    return row ? toRecord(row) : null;
  }

  async create(user: NewUser): Promise<UserRecord> {
    const record: UserRecord = {
      id: newId(),
      email: user.email,
      passwordHash: user.passwordHash,
      emailVerifiedAt: null,
      createdAt: user.createdAt,
    };
    this.db
      .prepare('INSERT INTO users (id, email, password_hash, email_verified_at, created_at) VALUES (?, ?, ?, NULL, ?)')
      .run(record.id, record.email, record.passwordHash, toIso(record.createdAt));
    return record;
  }

  async markEmailVerified(id: string, at: Date): Promise<void> {
    this.db
      .prepare('UPDATE users SET email_verified_at = ? WHERE id = ? AND email_verified_at IS NULL')
      .run(toIso(at), id);
  }
}
