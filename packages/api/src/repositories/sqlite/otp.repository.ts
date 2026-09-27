import type { Database } from '../../db/database';
import { inTransaction } from '../../db/database';
import type { IOtpRepository } from '../../interfaces';
import type { NewOtp, OtpRecord } from '../../types';
import { fromIso, fromIsoOrNull, newId, toIso } from '../../utils';

interface OtpRow {
  id: string;
  user_id: string;
  code_hash: string;
  attempts: number;
  expires_at: string;
  consumed_at: string | null;
  created_at: string;
}

const toRecord = (row: OtpRow): OtpRecord => ({
  id: row.id,
  userId: row.user_id,
  codeHash: row.code_hash,
  attempts: row.attempts,
  expiresAt: fromIso(row.expires_at),
  consumedAt: fromIsoOrNull(row.consumed_at),
  createdAt: fromIso(row.created_at),
});

export class SqliteOtpRepository implements IOtpRepository {
  constructor(private readonly db: Database) {}

  async findLatestForUser(userId: string): Promise<OtpRecord | null> {
    const row = this.db
      .prepare('SELECT * FROM email_otps WHERE user_id = ? ORDER BY created_at DESC LIMIT 1')
      .get(userId) as OtpRow | undefined;
    return row ? toRecord(row) : null;
  }

  async replaceForUser(otp: NewOtp): Promise<OtpRecord> {
    const record: OtpRecord = { id: newId(), attempts: 0, consumedAt: null, ...otp };
    inTransaction(this.db, () => {
      this.db.prepare('DELETE FROM email_otps WHERE user_id = ?').run(otp.userId);
      this.db
        .prepare(
          'INSERT INTO email_otps (id, user_id, code_hash, attempts, expires_at, consumed_at, created_at) VALUES (?, ?, ?, 0, ?, NULL, ?)',
        )
        .run(record.id, record.userId, record.codeHash, toIso(record.expiresAt), toIso(record.createdAt));
    });
    return record;
  }

  async incrementAttempts(id: string): Promise<number> {
    const row = this.db
      .prepare('UPDATE email_otps SET attempts = attempts + 1 WHERE id = ? RETURNING attempts')
      .get(id) as { attempts: number } | undefined;
    return row?.attempts ?? 0;
  }

  async consume(id: string, at: Date): Promise<boolean> {
    const result = this.db
      .prepare('UPDATE email_otps SET consumed_at = ? WHERE id = ? AND consumed_at IS NULL')
      .run(toIso(at), id);
    return Number(result.changes) === 1;
  }

  async deleteById(id: string): Promise<void> {
    this.db.prepare('DELETE FROM email_otps WHERE id = ?').run(id);
  }
}
