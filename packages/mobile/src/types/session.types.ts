import type { User } from '@padosipro/shared';

export interface Session {
  token: string;
  expiresAt: string;
  user: User;
}

export type AuthStatus = 'restoring' | 'signedOut' | 'signedIn';

export interface ISessionStorage {
  load(): Promise<Session | null>;
  save(session: Session): Promise<void>;
  clear(): Promise<void>;
}
