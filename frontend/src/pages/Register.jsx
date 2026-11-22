import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Eye, EyeOff, Lock, Mail, Shield, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Checkbox, Field, TextField } from '../components/ui/Primitives';
import { Modal } from '../components/ui/Overlays';
import { clamp } from '../lib/format';

function scorePassword(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return clamp(score, 0, 4);
}

const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

export default function Register() {
  const { user, register } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [termsOpen, setTermsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => scorePassword(form.password), [form.password]);

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  const setField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = 'Enter your full name.';
    else if (form.name.trim().length < 2) next.name = 'Name must be at least 2 characters.';
    if (!form.email.trim()) next.email = 'Enter your work email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (!form.password) next.password = 'Choose a password.';
    else if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    if (form.password !== form.confirm) next.confirm = 'Passwords do not match.';
    if (!terms) next.terms = 'Accept the terms to create an account.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    if (!validate()) return;
    setSubmitting(true);
    window.setTimeout(() => {
      const result = register(form);
      setSubmitting(false);
      if (!result.ok) {
        setFormError(result.message);
        return;
      }
      navigate('/dashboard', { replace: true });
    }, 420);
  }

  return (
    <div className="auth-shell auth-shell--register">
      <section className="auth-brand" aria-label="About Aegis">
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
            <p className="auth-eyebrow">Request an analyst workspace</p>
            <h1>Build your security operations baseline in minutes.</h1>
            <p className="auth-hero__text">
              Create an analyst account to review detection coverage, investigate events and monitor
              protection performance across your environment.
            </p>
            <ul className="auth-steps">
              <li>
                <span>01</span>
                <div>
                  <strong>Create your account</strong>
                  <p>Register with your work email and a strong password.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>Review your posture</strong>
                  <p>Start from a pre-populated demonstration workspace.</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>Investigate and report</strong>
                  <p>Use events, intelligence and reporting together.</p>
                </div>
              </li>
            </ul>
          </div>

          <p className="auth-legal">Aegis demo environment · No production data is stored or transmitted.</p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-card__head">
            <h2>Set up your workspace</h2>
          </div>

          {formError ? (
            <div className="form-banner form-banner--error" role="alert">
              {formError}
            </div>
          ) : null}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Full name"
              name="name"
              autoComplete="name"
              placeholder="Jordan Blake"
              icon={User}
              value={form.name}
              onChange={setField('name')}
              error={errors.name}
            />

            <TextField
              label="Work email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@company.com"
              icon={Mail}
              value={form.email}
              onChange={setField('email')}
              error={errors.email}
            />

            <Field label="Password" htmlFor="register-password" error={errors.password} hint={!form.password ? 'At least 8 characters, including a number and a symbol.' : undefined}>
              <div className="input-wrap input-wrap--icon">
                <Lock className="input-wrap__icon" size={15} aria-hidden="true" />
                <input
                  id="register-password"
                  className={`input input--password ${errors.password ? 'input--invalid' : ''}`.trim()}
                  type={showPassword ? 'text' : 'password'}
                  name="new-password"
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={setField('password')}
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
              {form.password ? (
                <div className="strength">
                  <div className="strength__bars" aria-hidden="true">
                    {[0, 1, 2, 3].map((index) => (
                      <span
                        key={index}
                        className={`strength__bar ${index < strength ? `strength__bar--${strength}` : ''}`.trim()}
                      />
                    ))}
                  </div>
                  <span className={`strength__label strength__label--${strength}`}>
                    Strength: {STRENGTH_LABELS[strength]}
                  </span>
                </div>
              ) : null}
            </Field>

            <Field label="Confirm password" htmlFor="register-confirm" error={errors.confirm}>
              <div className="input-wrap input-wrap--icon">
                <Lock className="input-wrap__icon" size={15} aria-hidden="true" />
                <input
                  id="register-confirm"
                  className={`input input--password ${errors.confirm ? 'input--invalid' : ''}`.trim()}
                  type={showConfirm ? 'text' : 'password'}
                  name="confirm-password"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={form.confirm}
                  onChange={setField('confirm')}
                />
                <button
                  type="button"
                  className="input-action"
                  onClick={() => setShowConfirm((current) => !current)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>

            <div className="terms-row">
              <Checkbox
                label=""
                checked={terms}
                onChange={(event) => {
                  setTerms(event.target.checked);
                  setErrors((current) => ({ ...current, terms: undefined }));
                }}
                aria-label="Accept terms of service"
              />
              <p>
                I agree to the{' '}
                <button type="button" className="link-btn" onClick={() => setTermsOpen(true)}>
                  terms of service
                </button>{' '}
                and acceptable use policy.
              </p>
            </div>
            {errors.terms ? <p className="field__error">{errors.terms}</p> : null}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              block
              disabled={submitting}
              trailingIcon={submitting ? null : ArrowRight}
            >
              {submitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/">Sign in</Link>
          </p>
        </div>
      </section>

      <Modal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        title="Terms of service"
        subtitle="Demonstration environment"
        footer={
          <>
            <Button onClick={() => setTermsOpen(false)}>Close</Button>
            <Button
              variant="primary"
              onClick={() => {
                setTerms(true);
                setErrors((current) => ({ ...current, terms: undefined }));
                setTermsOpen(false);
              }}
            >
              <Check size={14} /> Accept terms
            </Button>
          </>
        }
      >
        <p className="modal-copy">
          Aegis is a frontend demonstration. Accounts and preferences are stored only in this browser's
          local storage and are not transmitted to a server.
        </p>
        <ul className="terms-list">
          <li>Use the workspace only for evaluation and demonstration.</li>
          <li>Do not enter real credentials, personal data or production telemetry.</li>
          <li>Mock security data is generated deterministically for illustration.</li>
          <li>Clearing browser storage removes locally created demo accounts.</li>
        </ul>
      </Modal>
    </div>
  );
}
