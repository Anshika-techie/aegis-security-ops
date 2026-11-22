import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { NOTIFICATIONS } from '../data/mock';

const SESSION_KEY = 'aegis.session';
const USERS_KEY = 'aegis.users';
const PREFS_KEY = 'aegis.prefs';

const DEMO_ACCOUNTS = [
  {
    id: 'u-admin',
    name: 'Avery Lane',
    email: 'admin@aegis.example',
    password: 'demo1234',
    role: 'admin',
    title: 'Security Operations Lead',
    department: 'Security Operations',
    location: 'London, United Kingdom',
    phone: '+44 20 7946 0132',
    joined: '2023-02-14',
  },
  {
    id: 'u-analyst',
    name: 'Mara Okafor',
    email: 'analyst@aegis.example',
    password: 'demo1234',
    role: 'analyst',
    title: 'Threat Analyst',
    department: 'Security Operations',
    location: 'Manchester, United Kingdom',
    phone: '+44 161 496 0188',
    joined: '2024-06-03',
  },
];

const AppContext = createContext(null);

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage can be unavailable in private mode; demo state simply resets */
  }
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => readJson(SESSION_KEY, null));
  const [range, setRange] = useState('30d');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => readJson(PREFS_KEY, {}).sidebarCollapsed ?? false,
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [toasts, setToasts] = useState([]);
  const [reviews, setReviews] = useState({});
  const toastId = useRef(0);

  useEffect(() => {
    writeJson(PREFS_KEY, { sidebarCollapsed });
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (user) writeJson(SESSION_KEY, user);
    else window.localStorage.removeItem(SESSION_KEY);
  }, [user]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (message, tone = 'success') => {
      toastId.current += 1;
      const id = toastId.current;
      setToasts((current) => [...current.slice(-2), { id, message, tone }]);
      window.setTimeout(() => dismissToast(id), 4200);
    },
    [dismissToast],
  );

  const login = useCallback((email, password) => {
    const normalized = email.trim().toLowerCase();
    const stored = readJson(USERS_KEY, []);
    const match = [...DEMO_ACCOUNTS, ...stored].find(
      (account) => account.email.toLowerCase() === normalized,
    );

    if (!match) {
      return { ok: false, message: 'No account found for that email address.' };
    }
    if (match.password !== password) {
      return { ok: false, message: 'Incorrect password. Try demo1234 for the demo accounts.' };
    }

    const { password: _omit, ...safeUser } = match;
    setUser(safeUser);
    return { ok: true, user: safeUser };
  }, []);

  const register = useCallback(({ name, email, password }) => {
    const normalized = email.trim().toLowerCase();
    const stored = readJson(USERS_KEY, []);
    const exists = [...DEMO_ACCOUNTS, ...stored].some(
      (account) => account.email.toLowerCase() === normalized,
    );

    if (exists) {
      return { ok: false, message: 'An account with this email already exists. Sign in instead.' };
    }

    const account = {
      id: `u-${Date.now()}`,
      name: name.trim(),
      email: normalized,
      password,
      role: 'analyst',
      title: 'Security Analyst',
      department: 'Security Operations',
      location: 'United Kingdom',
      phone: '',
      joined: new Date().toISOString().slice(0, 10),
    };

    writeJson(USERS_KEY, [...stored, account]);
    const { password: _omit, ...safeUser } = account;
    setUser(safeUser);
    return { ok: true, user: safeUser };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setMobileNavOpen(false);
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      const stored = readJson(USERS_KEY, []);
      const index = stored.findIndex((account) => account.id === current.id);
      if (index >= 0) {
        stored[index] = { ...stored[index], ...patch };
        writeJson(USERS_KEY, stored);
      }
      return next;
    });
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  }, []);

  const toggleReview = useCallback((id, reviewed = true) => {
    setReviews((current) => ({ ...current, [id]: reviewed }));
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAdmin: user?.role === 'admin',
      range,
      setRange,
      sidebarCollapsed,
      setSidebarCollapsed,
      mobileNavOpen,
      setMobileNavOpen,
      notifications,
      unreadCount: notifications.filter((item) => !item.read).length,
      markNotificationRead,
      markAllNotificationsRead,
      toasts,
      pushToast,
      dismissToast,
      reviews,
      toggleReview,
      login,
      register,
      logout,
      updateUser,
    }),
    [
      user,
      range,
      sidebarCollapsed,
      mobileNavOpen,
      notifications,
      toasts,
      reviews,
      login,
      register,
      logout,
      updateUser,
      markNotificationRead,
      markAllNotificationsRead,
      pushToast,
      dismissToast,
      toggleReview,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
