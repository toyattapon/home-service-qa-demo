import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

const adminLinks = [
  ['/admin/dashboard', 'Overview'],
  ['/admin/customers', 'Customers'],
  ['/admin/jobs', 'Jobs'],
  ['/admin/dispatch', 'Dispatch'],
  ['/admin/inventory', 'Inventory'],
  ['/admin/invoices', 'Invoices'],
] as const;

const technicianLinks = [['/tech/jobs', 'My jobs']] as const;

export function Sidebar() {
  const { user, logout } = useAuth();
  const links = user?.role === 'admin' ? adminLinks : technicianLinks;

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">HS</span>
        <span>
          <strong>Home Service</strong>
          <small>QA Demo</small>
        </span>
      </div>
      <nav aria-label="Primary navigation">
        {links.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-user">
        <div className="avatar">{user?.name.slice(0, 1)}</div>
        <div>
          <strong>{user?.name}</strong>
          <small>{user?.role}</small>
        </div>
        <button className="link-button" onClick={logout} type="button">
          Logout
        </button>
      </div>
    </aside>
  );
}
