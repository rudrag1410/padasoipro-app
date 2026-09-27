import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface IKeyValueStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

/** Keychain (iOS) / Keystore-backed storage (Android). */
class SecureKeyValueStore implements IKeyValueStore {
  get(key: string) {
    return SecureStore.getItemAsync(key);
  }
  set(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  }
  remove(key: string) {
    return SecureStore.deleteItemAsync(key);
  }
}

/** SecureStore has no web implementation; the web build is for development preview only. */
class WebKeyValueStore implements IKeyValueStore {
  async get(key: string) {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }
  async set(key: string, value: string) {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // Storage unavailable (private mode): the session just won't survive a reload.
    }
  }
  async remove(key: string) {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      // Nothing to remove.
    }
  }
}

export const keyValueStore: IKeyValueStore = Platform.OS === 'web' ? new WebKeyValueStore() : new SecureKeyValueStore();
