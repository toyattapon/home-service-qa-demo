import { useState } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const links = user?.role === 'admin' ? adminLinks : technicianLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand">
          <span className="brand-mark">HS</span>
          <span>
            <strong>Home Service</strong>
            <small>QA Demo</small>
          </span>
        </div>
        <button
          type="button"
          className="sidebar-menu-toggle"
          data-testid="sidebar-menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((current) => !current)}
        >
          Menu
        </button>
      </div>
      <nav
        id="primary-navigation"
        aria-label="Primary navigation"
        className={menuOpen ? 'open' : undefined}
      >
        {links.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
            onClick={() => setMenuOpen(false)}
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
