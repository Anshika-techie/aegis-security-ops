import { useState } from 'react';
import { KeyRound, LogOut, Save, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SESSIONS } from '../data/mock';
import { formatDate, formatDateTime, initials, relativeTime } from '../lib/format';
import {
  Badge,
  Button,
  ChartCard,
  PageHeader,
  ProgressBar,
  TextField,
  Toggle,
} from '../components/ui/Primitives';

export default function Profile() {
  const { user, isAdmin, updateUser, logout, pushToast } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    title: user?.title ?? '',
    phone: user?.phone ?? '',
    location: user?.location ?? '',
  });
  const [security, setSecurity] = useState({ mfa: true, alerts: true, sso: false });
  const [sessions, setSessions] = useState(SESSIONS);

  const dirty = Object.entries(form).some(([key, value]) => value !== (user?.[key] ?? ''));

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile & account"
        description="Identity, role and session details for your Aegis analyst account."
        actions={
          <Button
            variant="primary"
            icon={Save}
            disabled={!dirty}
            onClick={() => {
              updateUser(form);
              pushToast('Profile updated.');
            }}
          >
            Save profile
          </Button>
        }
      />

      <div className="grid grid--2-1">
        <ChartCard title="Profile information" subtitle="Shown to other analysts in this workspace">
          <div className="profile-head" style={{ marginBottom: 18 }}>
            <span className="avatar">{initials(user?.name)}</span>
            <div className="profile-head__meta">
              <h2>{user?.name}</h2>
              <p>{user?.title}</p>
              <div className="inline" style={{ gap: 6 }}>
                <Badge tone={isAdmin ? 'teal' : 'neutral'} dot>
                  {isAdmin ? 'Administrator' : 'Security analyst'}
                </Badge>
                <Badge tone="neutral">{user?.department}</Badge>
              </div>
            </div>
          </div>

          <form
            className="grid grid--2"
            onSubmit={(event) => {
              event.preventDefault();
              updateUser(form);
              pushToast('Profile updated.');
            }}
          >
            <TextField
              label="Full name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            <TextField
              label="Work email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
            <TextField
              label="Job title"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            />
            <TextField
              label="Phone"
              value={form.phone}
              placeholder="+44 20 0000 0000"
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            />
            <TextField
              label="Location"
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
            />
            <div className="field">
              <span className="field__label">Account ID</span>
              <input className="input mono" value={user?.id ?? ''} readOnly aria-readonly="true" />
            </div>
          </form>
        </ChartCard>

        <div className="stack">
          <ChartCard title="Account details">
            <div className="meta-list">
              <div className="meta-row">
                <span>Member since</span>
                <span className="mono">{formatDate(user?.joined ?? new Date())}</span>
              </div>
              <div className="meta-row">
                <span>Role</span>
                <span>{isAdmin ? 'Administrator' : 'Security analyst'}</span>
              </div>
              <div className="meta-row">
                <span>Department</span>
                <span>{user?.department}</span>
              </div>
              <div className="meta-row">
                <span>Workspace</span>
                <span className="mono">aegis-eu-01</span>
              </div>
              <div className="meta-row">
                <span>Authentication</span>
                <span>{security.mfa ? 'Password + MFA' : 'Password'}</span>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Security preferences" subtitle="Controls for your own account">
            <Toggle
              label="Multi-factor authentication"
              description="Require a verification code at sign in."
              checked={security.mfa}
              onChange={(value) => setSecurity((current) => ({ ...current, mfa: value }))}
            />
            <Toggle
              label="Sign-in alerts"
              description="Notify me about new devices and locations."
              checked={security.alerts}
              onChange={(value) => setSecurity((current) => ({ ...current, alerts: value }))}
            />
            <Toggle
              label="Single sign-on enforcement"
              description="Available for administrator accounts in production."
              checked={security.sso}
              onChange={(value) => setSecurity((current) => ({ ...current, sso: value }))}
            />
            <div className="inline" style={{ marginTop: 14, gap: 8 }}>
              <Button size="sm" icon={KeyRound} onClick={() => pushToast('Password reset is a demo action.', 'info')}>
                Change password
              </Button>
              <Button
                size="sm"
                variant="ghost"
                icon={ShieldCheck}
                onClick={() => pushToast('Security review has no outstanding findings.')}
              >
                Review security
              </Button>
            </div>
          </ChartCard>
        </div>
      </div>

      <ChartCard
        title="Active sessions"
        subtitle="Devices currently signed in to this account"
        footer="Sessions are simulated; signing out clears the local demonstration session."
      >
        <div className="list-rows">
          {sessions.map((session) => (
            <div key={session.id} className="list-row">
              <div className="list-row__main">
                <p className="list-row__title">{session.device}</p>
                <p className="list-row__sub">
                  {session.location} · {session.ip} · active {relativeTime(session.lastActive)}
                </p>
              </div>
              <span className="record-sub mono" style={{ fontSize: 10.5 }}>
                {formatDateTime(session.lastActive)}
              </span>
              {session.current ? (
                <Badge tone="teal">Current</Badge>
              ) : (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    setSessions((current) => current.filter((item) => item.id !== session.id));
                    pushToast('Session revoked.', 'info');
                  }}
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </ChartCard>

      <div className="grid grid--2">
        <ChartCard title="Account security score" subtitle="Based on configured controls">
          <div className="stack stack--sm">
            <div className="stat-line">
              <span className="muted" style={{ fontSize: 12 }}>
                Overall
              </span>
              <strong className="mono">82%</strong>
            </div>
            <ProgressBar value={82} tone="teal" label="Account security score" />
            <p className="record-sub">
              Enable single sign-on enforcement to reach the recommended baseline for administrator accounts.
            </p>
          </div>
        </ChartCard>

        <ChartCard title="Session actions" subtitle="Sign out of this demonstration workspace">
          <p className="record-sub" style={{ lineHeight: 1.6 }}>
            Signing out clears the locally stored session. Demo accounts and any accounts you created remain in
            browser storage until cleared.
          </p>
          <Button
            variant="danger"
            icon={LogOut}
            style={{ marginTop: 14 }}
            onClick={() => {
              logout();
              navigate('/', { replace: true });
            }}
          >
            Sign out
          </Button>
        </ChartCard>
      </div>
    </>
  );
}
