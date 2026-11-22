import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/** Client-side demonstration guard. Not a security boundary. */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useApp();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children ?? null;
}
