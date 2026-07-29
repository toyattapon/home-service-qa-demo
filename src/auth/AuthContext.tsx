import {
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { SessionUser } from '../../shared/domain';
import {
  apiRequest,
  TOKEN_KEY,
  USER_KEY,
} from '../api/client';
import { AuthContext, type AuthContextValue } from './authContextValue';

interface LoginResponse {
  token: string;
  user: SessionUser;
}

function readStoredUser(): SessionUser | null {
  const value = localStorage.getItem(USER_KEY);
  if (!value) return null;
  try {
    return JSON.parse(value) as SessionUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SessionUser | null>(readStoredUser);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      async login(email, password) {
        const result = await apiRequest<LoginResponse>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        localStorage.setItem(TOKEN_KEY, result.token);
        localStorage.setItem(USER_KEY, JSON.stringify(result.user));
        setToken(result.token);
        setUser(result.user);
        return result.user;
      },
      logout() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
      },
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
