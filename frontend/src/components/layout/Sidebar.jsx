import { NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Ban,
  Crosshair,
  FileText,
  Globe2,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  Settings,
  Shield,
  Siren,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { initials } from '../../lib/format';

function NavItem({ to, label, icon: Icon, end, collapsed, badge, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
      title={collapsed ? label : undefined}
      onClick={onNavigate}
    >
      <Icon size={16} strokeWidth={1.9} className="nav-item__icon" aria-hidden="true" />
      <span className="nav-item__label">{label}</span>
      {badge ? <span className="nav-item__badge">{badge}</span> : null}
    </NavLink>
  );
}

export default function Sidebar() {
  const {
    user,
    isAdmin,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileNavOpen,
    setMobileNavOpen,
    logout,
  } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const closeMobile = () => setMobileNavOpen(false);

  return (
    <>
      <div
        className={`sidebar-scrim ${mobileNavOpen ? 'sidebar-scrim--visible' : ''}`.trim()}
        onClick={closeMobile}
        aria-hidden="true"
      />
      <aside
        className={`sidebar ${sidebarCollapsed ? 'sidebar--collapsed' : ''} ${mobileNavOpen ? 'sidebar--open' : ''}`.trim()}
        aria-label="Primary navigation"
      >
        <div className="sidebar__brand">
          <span className="brand-mark" aria-hidden="true">
            <Shield size={17} strokeWidth={2} />
          </span>
          <span className="brand-text">
            <strong>AEGIS</strong>
            <span>Security Operations</span>
          </span>
          <button
            type="button"
            className="icon-btn sidebar__collapse"
            onClick={() => setSidebarCollapsed(true)}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <PanelLeftClose size={15} />
          </button>
        </div>

        <nav className="sidebar__nav">
          <div className="nav-group">
            <p className="nav-group__label">Overview</p>
            {isAdmin ? (
              <>
                <NavItem to="/admin" end label="Operations overview" icon={LayoutDashboard} collapsed={sidebarCollapsed} onNavigate={closeMobile} />
                <NavItem to="/dashboard" label="My dashboard" icon={Shield} collapsed={sidebarCollapsed} onNavigate={closeMobile} />
              </>
            ) : (
              <NavItem to="/dashboard" end label="Overview" icon={LayoutDashboard} collapsed={sidebarCollapsed} onNavigate={closeMobile} />
            )}
          </div>

          <div className="nav-group">
            <p className="nav-group__label">Security monitoring</p>
            <NavItem to="/events" label="Security events" icon={Siren} collapsed={sidebarCollapsed} onNavigate={closeMobile} />
            <NavItem to="/attacks" label="Detected attacks" icon={Crosshair} collapsed={sidebarCollapsed} onNavigate={closeMobile} />
            <NavItem to="/blocked" label="Blocked requests" icon={Ban} collapsed={sidebarCollapsed} onNavigate={closeMobile} />
          </div>

          <div className="nav-group">
            <p className="nav-group__label">Intelligence</p>
            <NavItem to="/intelligence" label="Threat intelligence" icon={Globe2} collapsed={sidebarCollapsed} onNavigate={closeMobile} />
            <NavItem to="/analytics" label="Attack analytics" icon={BarChart3} collapsed={sidebarCollapsed} onNavigate={closeMobile} />
          </div>

          <div className="nav-group">
            <p className="nav-group__label">Operations</p>
            <NavItem to="/reports" label="Reports" icon={FileText} collapsed={sidebarCollapsed} onNavigate={closeMobile} />
            <NavItem to="/settings" label="Settings" icon={Settings} collapsed={sidebarCollapsed} onNavigate={closeMobile} />
          </div>
        </nav>

        <div className="sidebar__footer">
          <button type="button" className="sidebar-user" onClick={() => { navigate('/profile'); closeMobile(); }}>
            <span className="avatar avatar--sm">{initials(user?.name)}</span>
            <span className="sidebar-user__meta">
              <strong>{user?.name}</strong>
              <span>{user?.role === 'admin' ? 'Administrator' : 'Security analyst'}</span>
            </span>
            <span
              className="icon-btn sidebar-user__logout"
              role="button"
              tabIndex={0}
              aria-label="Sign out"
              title="Sign out"
              onClick={(event) => {
                event.stopPropagation();
                handleLogout();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.stopPropagation();
                  handleLogout();
                }
              }}
            >
              <LogOut size={15} />
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
