import { useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Menu,
  PanelLeft,
  Search,
  Settings,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Dropdown, DropdownItem, DropdownLabel, DropdownSeparator } from '../ui/Overlays';
import { IconButton } from '../ui/Primitives';
import { EVENTS, RANGES } from '../../data/mock';
import { initials, relativeTime } from '../../lib/format';
import { useClickOutside, useDebounced } from '../../lib/hooks';

const PAGE_TITLES = {
  '/dashboard': 'Security overview',
  '/admin': 'Operations overview',
  '/events': 'Security events',
  '/attacks': 'Detected attacks',
  '/blocked': 'Blocked requests',
  '/intelligence': 'Threat intelligence',
  '/analytics': 'Attack analytics',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/profile': 'Profile & account',
  '/admin/events': 'Security events',
  '/admin/attacks': 'Detected attacks',
  '/admin/blocked': 'Blocked requests',
  '/admin/intelligence': 'Threat intelligence',
  '/admin/analytics': 'Attack analytics',
  '/admin/reports': 'Reports',
  '/admin/settings': 'Settings',
};

const QUICK_PAGES = [
  { to: '/events', label: 'Security events' },
  { to: '/attacks', label: 'Detected attacks' },
  { to: '/blocked', label: 'Blocked requests' },
  { to: '/intelligence', label: 'Threat intelligence' },
  { to: '/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' },
];

function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const debounced = useDebounced(query.trim().toLowerCase(), 140);
  const wrapRef = useClickOutside(() => setOpen(false), open);
  const inputRef = useRef(null);

  const results = useMemo(() => {
    if (!debounced) return { pages: [], events: [] };
    return {
      pages: QUICK_PAGES.filter((page) => page.label.toLowerCase().includes(debounced)),
      events: EVENTS.filter((event) =>
        [event.id, event.sourceIp, event.attackName, event.sourceCountry, event.endpoint]
          .join(' ')
          .toLowerCase()
          .includes(debounced),
      ).slice(0, 5),
    };
  }, [debounced]);

  const total = results.pages.length + results.events.length;

  const goTo = (to, state) => {
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
    navigate(to, { state });
  };

  return (
    <div className="global-search" ref={wrapRef}>
      <Search size={14} className="global-search__icon" aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        placeholder="Search events, IPs, pages…"
        aria-label="Global search"
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
          if (event.key === 'Enter' && results.events[0]) {
            goTo('/events', { search: results.events[0].id });
          }
        }}
      />
      <kbd className="global-search__kbd">/</kbd>
      {open && debounced ? (
        <div className="search-results">
          {total === 0 ? (
            <p className="search-results__empty">No matches for “{debounced}”.</p>
          ) : (
            <>
              {results.pages.length ? (
                <>
                  <p className="search-results__label">Pages</p>
                  {results.pages.map((page) => (
                    <button key={page.to} type="button" className="search-result" onClick={() => goTo(page.to)}>
                      <span className="search-result__icon">
                        <Activity size={13} />
                      </span>
                      <span>
                        <strong>{page.label}</strong>
                        <span>{page.to}</span>
                      </span>
                      <ChevronRight size={13} className="search-result__chevron" />
                    </button>
                  ))}
                </>
              ) : null}
              {results.events.length ? (
                <>
                  <p className="search-results__label">Security events</p>
                  {results.events.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      className="search-result"
                      onClick={() => goTo('/events', { search: event.id })}
                    >
                      <span className="search-result__icon">
                        <Search size={13} />
                      </span>
                      <span>
                        <strong>
                          {event.id} · {event.attackName}
                        </strong>
                        <span>
                          {event.sourceIp} — {event.sourceCountry}
                        </span>
                      </span>
                      <ChevronRight size={13} className="search-result__chevron" />
                    </button>
                  ))}
                </>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function Topbar() {
  const {
    user,
    isAdmin,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    range,
    setRange,
    setSidebarCollapsed,
    sidebarCollapsed,
    setMobileNavOpen,
    logout,
  } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const title = PAGE_TITLES[location.pathname] ?? 'Aegis';
  const parent = isAdmin ? 'Operations' : 'Workspace';

  const openNotification = (item) => {
    markNotificationRead(item.id);
    setNotifOpen(false);
    let to = item.to;
    if (!isAdmin && to.startsWith('/admin')) to = to.replace('/admin', '') || '/admin';
    navigate(to);
  };

  return (
    <header className="topbar">
      <div className="topbar__left">
        <IconButton label="Open navigation" className="topbar__mobile-menu" onClick={() => setMobileNavOpen(true)}>
          <Menu size={18} />
        </IconButton>
        {sidebarCollapsed ? (
          <IconButton label="Expand sidebar" className="topbar__desktop-toggle" onClick={() => setSidebarCollapsed(false)}>
            <PanelLeft size={17} />
          </IconButton>
        ) : null}
        <div className="breadcrumb" aria-label="Breadcrumb">
          <span className="breadcrumb__root">{parent}</span>
          <ChevronRight size={12} aria-hidden="true" />
          <span className="breadcrumb__current">{title}</span>
        </div>
      </div>

      <div className="topbar__search">
        <GlobalSearch />
      </div>

      <div className="topbar__actions">
        <span className="system-status" title="All protection layers reporting normally">
          <span className="system-status__dot" aria-hidden="true" />
          <span className="system-status__text">Systems nominal</span>
        </span>

        <label className="range-select">
          <span className="sr-only">Date range</span>
          <select value={range} onChange={(event) => setRange(event.target.value)}>
            {RANGES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <ChevronDown size={12} aria-hidden="true" />
        </label>

        <div className="topbar__menu">
          <IconButton
            label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
            onClick={() => {
              setNotifOpen((current) => !current);
              setProfileOpen(false);
            }}
            className={`topbar__bell ${notifOpen ? 'is-active' : ''}`.trim()}
          >
            <Bell size={17} />
            {unreadCount ? <span className="topbar__badge">{unreadCount}</span> : null}
          </IconButton>
          <Dropdown open={notifOpen} onClose={() => setNotifOpen(false)} className="notification-panel">
            <div className="notification-panel__head">
              <div>
                <h2>Notifications</h2>
                <p>{unreadCount ? `${unreadCount} unread alerts` : 'All caught up'}</p>
              </div>
              <button type="button" className="link-btn" onClick={markAllNotificationsRead}>
                <Check size={12} /> Mark all read
              </button>
            </div>
            <div className="notification-panel__list">
              {notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`notification ${item.read ? '' : 'notification--unread'} ${item.severity === 'Critical' ? 'notification--critical' : ''}`.trim()}
                  onClick={() => openNotification(item)}
                >
                  <span className="notification__dot" aria-hidden="true" />
                  <span className="notification__content">
                    <span className="notification__title">{item.title}</span>
                    <span className="notification__body">{item.body}</span>
                    <span className="notification__time">{relativeTime(item.time)}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="notification-panel__foot">
              <button type="button" className="link-btn" onClick={() => { setNotifOpen(false); navigate('/events'); }}>
                Open security events <ChevronRight size={12} />
              </button>
            </div>
          </Dropdown>
        </div>

        <div className="topbar__menu">
          <button
            type="button"
            className={`profile-trigger ${profileOpen ? 'is-active' : ''}`.trim()}
            onClick={() => {
              setProfileOpen((current) => !current);
              setNotifOpen(false);
            }}
            aria-haspopup="menu"
            aria-expanded={profileOpen}
          >
            <span className="avatar avatar--sm">{initials(user?.name)}</span>
            <ChevronDown size={13} aria-hidden="true" />
          </button>
          <Dropdown open={profileOpen} onClose={() => setProfileOpen(false)} className="profile-menu">
            <div className="profile-menu__head">
              <span className="avatar">{initials(user?.name)}</span>
              <div>
                <strong>{user?.name}</strong>
                <span>{user?.email}</span>
                <span className="role-chip">{isAdmin ? 'Administrator' : 'Security analyst'}</span>
              </div>
            </div>
            <DropdownSeparator />
            <DropdownLabel>Account</DropdownLabel>
            <DropdownItem icon={User} onClick={() => { setProfileOpen(false); navigate('/profile'); }}>
              Profile & account
            </DropdownItem>
            <DropdownItem icon={Settings} onClick={() => { setProfileOpen(false); navigate('/settings'); }}>
              Preferences
            </DropdownItem>
            <DropdownItem icon={ShieldCheck} onClick={() => { setProfileOpen(false); navigate('/dashboard'); }}>
              Security overview
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem
              danger
              onClick={() => {
                setProfileOpen(false);
                logout();
                navigate('/', { replace: true });
              }}
            >
              Sign out
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
