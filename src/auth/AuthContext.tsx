import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { SessionUser } from '../../shared/domain';
import {
  apiRequest,
  setUnauthorizedHandler,
  TOKEN_KEY,
  USER_KEY,
} from '../api/client';
import { AuthContext, type AuthContextValue } from './authContextValue';

interface LoginResponse {
  token: string;
  user: SessionUser;
}

interface AuthSession {
  token: string;
  user: SessionUser;
}

function clearStoredSession() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

function isSessionUser(value: unknown): value is SessionUser {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<SessionUser>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string' &&
    (candidate.role === 'admin' || candidate.role === 'technician') &&
    (candidate.role === 'admin' ||
      typeof candidate.technicianId === 'string')
  );
}

function readStoredSession(): AuthSession | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const value = localStorage.getItem(USER_KEY);
  if (!token || !value) {
    clearStoredSession();
    return null;
  }
  try {
    const user: unknown = JSON.parse(value);
    if (!isSessionUser(user)) throw new Error('Invalid stored user');
    const expectedToken =
      user.role === 'admin'
        ? 'mock-token-admin'
        : 'mock-token-technician';
    if (token !== expectedToken) throw new Error('Mismatched session');
    return { token, user };
  } catch {
    clearStoredSession();
    return null;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(readStoredSession);

  const logout = useCallback(() => {
    clearStoredSession();
    setSession(null);
  }, []);

  useEffect(() => setUnauthorizedHandler(logout), [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      async login(email, password) {
        const result = await apiRequest<LoginResponse>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        localStorage.setItem(TOKEN_KEY, result.token);
        localStorage.setItem(USER_KEY, JSON.stringify(result.user));
        setSession(result);
        return result.user;
      },
      logout,
    }),
    [logout, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
