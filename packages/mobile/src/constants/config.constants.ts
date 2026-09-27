import { API_PREFIX } from '@padosipro/shared';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 4000;

/**
 * Picks the API origin:
 * 1. EXPO_PUBLIC_API_URL if set (required for release/APK builds).
 * 2. Web: the host serving the page.
 * 3. Dev on device/emulator: the machine running the Expo dev server.
 * 4. Android emulator fallback: 10.0.2.2 is the host machine.
 */
function resolveApiOrigin(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit.replace(/\/+$/, '');

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:${API_PORT}`;
  }

  const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (devHost) return `http://${devHost}:${API_PORT}`;

  return Platform.OS === 'android' ? `http://10.0.2.2:${API_PORT}` : `http://localhost:${API_PORT}`;
}

export const API_BASE_URL = `${resolveApiOrigin()}${API_PREFIX}`;

export const REQUEST_TIMEOUT_MS = 15_000;
