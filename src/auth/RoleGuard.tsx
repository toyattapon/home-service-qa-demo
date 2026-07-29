import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '../../shared/domain';
import { useAuth } from './useAuth';

export function RoleGuard({ role }: { role: UserRole }) {
  const { token, user } = useAuth();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return (
      <Navigate
        to={user.role === 'admin' ? '/admin/dashboard' : '/tech/jobs'}
        replace
      />
    );
  }
  return <Outlet />;
}
