import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { ToastStack } from '../ui/Overlays';
import { useApp } from '../../context/AppContext';

export default function AppLayout() {
  const { sidebarCollapsed, mobileNavOpen, setMobileNavOpen, toasts, dismissToast } = useApp();
  const location = useLocation();

  useEffect(() => {
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [location.pathname, setMobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setMobileNavOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileNavOpen, setMobileNavOpen]);

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'app-shell--collapsed' : ''} ${mobileNavOpen ? 'app-shell--nav-open' : ''}`.trim()}>
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <main className="page" id="main-content">
          <Outlet />
        </main>
      </div>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
