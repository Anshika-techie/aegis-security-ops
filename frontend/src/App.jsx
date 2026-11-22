import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminOverview from './pages/AdminOverview';
import Events from './pages/Events';
import Attacks from './pages/Attacks';
import Blocked from './pages/Blocked';
import Intelligence from './pages/Intelligence';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function AdminGuard() {
  return (
    <ProtectedRoute adminOnly>
      <Outlet />
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/attacks" element={<Attacks />} />
            <Route path="/blocked" element={<Blocked />} />
            <Route path="/intelligence" element={<Intelligence />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />

            <Route path="/admin" element={<AdminGuard />}>
              <Route index element={<AdminOverview />} />
              <Route path="events" element={<Events />} />
              <Route path="attacks" element={<Attacks />} />
              <Route path="blocked" element={<Blocked />} />
              <Route path="intelligence" element={<Intelligence />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
