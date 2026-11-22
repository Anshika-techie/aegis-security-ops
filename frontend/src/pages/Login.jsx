import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Checkbox, Field, TextField } from '../components/ui/Primitives';
import { Modal } from '../components/ui/Overlays';

const REMEMBER_KEY = 'aegis.rememberedEmail';

export default function Login() {
  const { user, login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(() => window.localStorage.getItem(REMEMBER_KEY) ?? '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(() => Boolean(window.localStorage.getItem(REMEMBER_KEY)));
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    if (!forgotOpen) {
      setForgotSent(false);
      setForgotEmail('');
    }
  }, [forgotOpen]);

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  function validate() {
    const next = {};
    if (!email.trim()) next.email = 'Enter your work email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    if (!validate()) return;

    setSubmitting(true);
    window.setTimeout(() => {
      const result = login(email, password);
      setSubmitting(false);
      if (!result.ok) {
        setFormError(result.message);
        return;
      }
      if (remember) window.localStorage.setItem(REMEMBER_KEY, email.trim());
      else window.localStorage.removeItem(REMEMBER_KEY);
      const fallback = result.user.role === 'admin' ? '/admin' : '/dashboard';
      navigate(location.state?.from ?? fallback, { replace: true });
    }, 420);
  }

  function useDemo(demoEmail) {
    setEmail(demoEmail);
    setPassword('demo1234');
    setErrors({});
    setFormError('');
    setSubmitting(true);
    window.setTimeout(() => {
      const result = login(demoEmail, 'demo1234');
      setSubmitting(false);
      if (!result.ok) {
        setFormError(result.message);
        return;
      }
      const fallback = result.user.role === 'admin' ? '/admin' : '/dashboard';
      navigate(location.state?.from ?? fallback, { replace: true });
    }, 240);
  }

  return (
    <div className="auth-shell">
      <section className="auth-brand" aria-label="Aegis Security Operations">
        <div className="auth-brand__inner">
          <div className="auth-logo">
            <span className="brand-mark brand-mark--lg" aria-hidden="true">
              <Shield size={22} strokeWidth={2} />
            </span>
            <span className="brand-text">
              <strong>AEGIS</strong>
              <span>Security Operations</span>
            </span>
          </div>

          <div className="auth-hero">
            <p className="auth-eyebrow">Unified detection &amp; response</p>
            <h1>Every request watched. Every threat accounted for.</h1>
            <p className="auth-hero__text">
              Aegis correlates edge traffic, API activity and authentication telemetry into a single
              operational picture for security teams.
            </p>
            <ul className="auth-features">
              <li>
                <ShieldCheck size={15} aria-hidden="true" />
                Real-time protection across edge, API and identity layers
              </li>
              <li>
                <ShieldCheck size={15} aria-hidden="true" />
                Curated threat intelligence with IOC correlation
              </li>
              <li>
                <ShieldCheck size={15} aria-hidden="true" />
                Audit-ready reporting for security operations
              </li>
            </ul>
          </div>

          <div className="auth-status">
            <span className="auth-status__dot" aria-hidden="true" />
            <div>
              <strong>All protection layers operational</strong>
              <span>Edge WAF · API gateway · Identity · Rate governor</span>
            </div>
            <span className="auth-status__metric">99.98% uptime</span>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-card__head">
            <p className="auth-eyebrow">Secure sign in</p>
            <h2>Welcome back</h2>
            <p>Sign in to your Aegis workspace to continue monitoring.</p>
          </div>

          {formError ? (
            <div className="form-banner form-banner--error" role="alert">
              {formError}
            </div>
          ) : null}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Work email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@company.com"
              icon={Mail}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email) setErrors((current) => ({ ...current, email: undefined }));
              }}
              error={errors.email}
            />

            <Field label="Password" htmlFor="login-password" error={errors.password}>
              <div className="input-wrap input-wrap--icon">
                <Lock className="input-wrap__icon" size={15} aria-hidden="true" />
                <input
                  id="login-password"
                  className={`input input--password ${errors.password ? 'input--invalid' : ''}`.trim()}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (errors.password) setErrors((current) => ({ ...current, password: undefined }));
                  }}
                />
                <button
                  type="button"
                  className="input-action"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>

            <div className="auth-form__row">
              <Checkbox label="Remember me" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
              <button type="button" className="link-btn" onClick={() => setForgotOpen(true)}>
                Forgot password?
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg" block disabled={submitting}>
              {submitting ? 'Verifying credentials…' : 'Sign in'}
              {!submitting ? <ArrowRight size={15} style={{ marginLeft: 6 }} /> : null}
            </Button>
          </form>

          <div className="demo-box">
            <div className="demo-box__head">
              <span>Demo access</span>
              <span className="demo-box__hint">Click an account to sign in</span>
            </div>
            <div className="demo-box__options">
              <button type="button" disabled={submitting} onClick={() => useDemo('admin@aegis.example')}>
                <strong>Administrator</strong>
                <span>admin@aegis.example</span>
              </button>
              <button type="button" disabled={submitting} onClick={() => useDemo('analyst@aegis.example')}>
                <strong>Security analyst</strong>
                <span>analyst@aegis.example</span>
              </button>
            </div>
          </div>

          <p className="auth-switch">
            Need an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </section>

      <Modal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Reset your password"
        subtitle="Frontend demonstration — no email is actually sent."
        size="sm"
        footer={
          <>
            <Button onClick={() => setForgotOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!forgotEmail.trim()}
              onClick={() => {
                if (forgotEmail.trim()) setForgotSent(true);
              }}
            >
              Send reset link
            </Button>
          </>
        }
      >
        {forgotSent ? (
          <div className="form-banner form-banner--success" role="status">
            <Check size={15} aria-hidden="true" />
            If an account exists for {forgotEmail}, a reset link would be sent. For this demo, sign in with
            the credentials shown on the login screen.
          </div>
        ) : (
          <>
            <p className="modal-copy">
              Enter the email associated with your workspace and we will send instructions to reset your
              password.
            </p>
            <TextField
              label="Work email"
              type="email"
              icon={Mail}
              placeholder="you@company.com"
              value={forgotEmail}
              onChange={(event) => setForgotEmail(event.target.value)}
            />
          </>
        )}
      </Modal>
    </div>
  );
}
