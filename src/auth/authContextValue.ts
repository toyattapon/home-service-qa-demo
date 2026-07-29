import { createContext } from 'react';
import type { SessionUser } from '../../shared/domain';

export interface AuthContextValue {
  user: SessionUser | null;
  token: string | null;
  login(email: string, password: string): Promise<SessionUser>;
  logout(): void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
