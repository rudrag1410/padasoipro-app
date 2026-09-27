import type { AuthResponse, User } from '@padosipro/shared';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { meApi, sessionBridge } from '@/services/api';
import { sessionStorage } from '@/services/storage/session.storage';
import type { AuthStatus, Session } from '@/types';

export interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  signIn: (auth: AuthResponse) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Owns the session: restores it on launch (so a restart keeps the user logged in),
 * persists it on change, and signs out when the server rejects the token.
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>('restoring');
  const [session, setSession] = useState<Session | null>(null);
  const sessionRef = useRef<Session | null>(null);

  const applySession = useCallback(async (next: Session | null) => {
    sessionRef.current = next;
    sessionBridge.setToken(next?.token ?? null);
    setSession(next);
    setStatus(next ? 'signedIn' : 'signedOut');
    if (next) await sessionStorage.save(next);
    else await sessionStorage.clear();
  }, []);

  const signOut = useCallback(async () => {
    await applySession(null);
    queryClient.clear();
  }, [applySession, queryClient]);

  const signIn = useCallback(
    (auth: AuthResponse) => applySession({ token: auth.token, expiresAt: auth.expiresAt, user: auth.user }),
    [applySession],
  );

  const updateUser = useCallback(
    async (user: User) => {
      const current = sessionRef.current;
      if (current) await applySession({ ...current, user });
    },
    [applySession],
  );

  useEffect(() => {
    sessionBridge.onUnauthorized(() => void signOut());
    return () => sessionBridge.onUnauthorized(null);
  }, [signOut]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await sessionStorage.load();
      if (cancelled) return;
      // Trust the stored session straight away so the app opens instantly (and offline)...
      await applySession(stored);
      if (!stored) return;
      // ...then refresh the user. A 401 signs out via the bridge; network errors keep the cached user.
      try {
        const { user } = await meApi.getMe();
        if (!cancelled && sessionRef.current) await applySession({ ...sessionRef.current, user });
      } catch {
        // Offline or server down: stay signed in with cached data.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applySession]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user: session?.user ?? null, signIn, updateUser, signOut }),
    [status, session, signIn, updateUser, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
