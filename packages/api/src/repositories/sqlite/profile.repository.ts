import type { Database } from '../../db/database';
import type { IProfileRepository } from '../../interfaces';
import type { ProfileRecord } from '../../types';
import { fromIso, toIso } from '../../utils';

interface ProfileRow {
  user_id: string;
  name: string;
  mobile: string;
  address: string;
  business_name: string | null;
  updated_at: string;
}

const toRecord = (row: ProfileRow): ProfileRecord => ({
  userId: row.user_id,
  name: row.name,
  mobile: row.mobile,
  address: row.address,
  businessName: row.business_name,
  updatedAt: fromIso(row.updated_at),
});

export class SqliteProfileRepository implements IProfileRepository {
  constructor(private readonly db: Database) {}

  async findByUserId(userId: string): Promise<ProfileRecord | null> {
    const row = this.db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId) as ProfileRow | undefined;
    return row ? toRecord(row) : null;
  }

  async upsert(profile: Omit<ProfileRecord, 'updatedAt'>, at: Date): Promise<ProfileRecord> {
    this.db
      .prepare(
        `INSERT INTO profiles (user_id, name, mobile, address, business_name, updated_at)
         VALUES (:userId, :name, :mobile, :address, :businessName, :updatedAt)
         ON CONFLICT(user_id) DO UPDATE SET name = excluded.name, mobile = excluded.mobile,
           address = excluded.address, business_name = excluded.business_name, updated_at = excluded.updated_at`,
      )
      .run({ ...profile, updatedAt: toIso(at) });
    return { ...profile, updatedAt: at };
  }
}
