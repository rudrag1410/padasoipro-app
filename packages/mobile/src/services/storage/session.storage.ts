import { STORAGE_KEYS } from '@/constants';
import type { ISessionStorage, Session } from '@/types';
import { keyValueStore, type IKeyValueStore } from './key-value-store';

export class SessionStorage implements ISessionStorage {
  constructor(private readonly store: IKeyValueStore) {}

  async load(): Promise<Session | null> {
    const raw = await this.store.get(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    try {
      const session = JSON.parse(raw) as Session;
      if (!session.token || !session.user || new Date(session.expiresAt) <= new Date()) return null;
      return session;
    } catch {
      return null;
    }
  }

  save(session: Session): Promise<void> {
    return this.store.set(STORAGE_KEYS.SESSION, JSON.stringify(session));
  }

  clear(): Promise<void> {
    return this.store.remove(STORAGE_KEYS.SESSION);
  }
}

export const sessionStorage = new SessionStorage(keyValueStore);
