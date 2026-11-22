import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, Shield } from 'lucide-react';
import { Button } from '../components/ui/Primitives';
import { useApp } from '../context/AppContext';

export default function NotFound() {
  const { user } = useApp();
  const navigate = useNavigate();
  const home = user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/';

  return (
    <div className="notfound">
      <div className="notfound__inner">
        <span className="brand-mark brand-mark--lg" aria-hidden="true">
          <Shield size={20} strokeWidth={2} />
        </span>
        <p className="notfound__code">404</p>
        <h1 className="notfound__title">This surface is not monitored</h1>
        <p className="notfound__text">
          The page you requested does not exist in this workspace. It may have been moved, or the link may be
          incomplete.
        </p>
        <div className="notfound__actions">
          <Button icon={ArrowLeft} onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Link to={home} className="btn btn--primary">
            <LayoutDashboard size={14} strokeWidth={1.9} aria-hidden="true" />
            <span>{user ? 'Return to dashboard' : 'Return to sign in'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
