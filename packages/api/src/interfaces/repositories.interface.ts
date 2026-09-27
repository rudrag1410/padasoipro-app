import type { CategoryWithTasks, Task } from '@padosipro/shared';
import type { NewOtp, NewUser, OtpRecord, ProfileRecord, UserRecord } from '../types';

// Async on purpose: the SQLite implementations are synchronous, but a Postgres one would not be.

export interface IUserRepository {
  findById(id: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  create(user: NewUser): Promise<UserRecord>;
  markEmailVerified(id: string, at: Date): Promise<void>;
}

export interface IProfileRepository {
  findByUserId(userId: string): Promise<ProfileRecord | null>;
  upsert(profile: Omit<ProfileRecord, 'updatedAt'>, at: Date): Promise<ProfileRecord>;
}

export interface IOtpRepository {
  /** Most recently issued code for the user, consumed or not. */
  findLatestForUser(userId: string): Promise<OtpRecord | null>;
  /** Removes every earlier code for the user and stores the new one, so only one code is ever live. */
  replaceForUser(otp: NewOtp): Promise<OtpRecord>;
  /** Atomically bumps the attempt counter. Returns the new count. */
  incrementAttempts(id: string): Promise<number>;
  /** Marks the code used. Returns false if it was already used (lost a race). */
  consume(id: string, at: Date): Promise<boolean>;
  deleteById(id: string): Promise<void>;
}

export interface ITaskRepository {
  getCatalogue(): Promise<CategoryWithTasks[]>;
  findExistingIds(ids: string[]): Promise<string[]>;
  getSelectedTasks(userId: string): Promise<Task[]>;
  hasSelection(userId: string): Promise<boolean>;
  replaceSelection(userId: string, taskIds: string[], at: Date): Promise<void>;
}
