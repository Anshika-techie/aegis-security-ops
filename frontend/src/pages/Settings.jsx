import { useState } from 'react';
import { Save, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RANGES, RANGE_MAP, TEAM_MEMBERS } from '../data/mock';
import { initials } from '../lib/format';
import {
  Badge,
  Button,
  ChartCard,
  PageHeader,
  SelectField,
  Toggle,
} from '../components/ui/Primitives';

const SECTIONS = [
  { id: 'notifications', label: 'Notifications' },
  { id: 'detection', label: 'Detection' },
  { id: 'defaults', label: 'Workspace defaults' },
  { id: 'team', label: 'Team access' },
];

export default function Settings() {
  const { user, isAdmin, range, setRange, pushToast } = useApp();
  const [section, setSection] = useState('notifications');
  const [notifications, setNotifications] = useState({
    critical: true,
    dailyDigest: true,
    weeklyReport: true,
    productUpdates: false,
  });
  const [detection, setDetection] = useState({
    autoBlock: true,
    stepUp: true,
    botMitigation: true,
    retainPayloads: false,
  });
  const [defaults, setDefaults] = useState({ range, timezone: 'UTC', density: 'comfortable', timeout: '30' });

  return (
    <>
      <PageHeader
        eyebrow={isAdmin ? 'Administrator' : 'Workspace'}
        title="Settings"
        description="Notification routing, detection behaviour and workspace defaults for this demonstration environment."
        actions={
          <Button
            variant="primary"
            icon={Save}
            onClick={() => {
              setRange(defaults.range);
              pushToast('Workspace preferences saved for this session.');
            }}
          >
            Save changes
          </Button>
        }
      />

      <nav className="inline" aria-label="Settings sections" style={{ gap: 4 }}>
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`btn btn--sm ${section === item.id ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => setSection(item.id)}
            aria-pressed={section === item.id}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {section === 'notifications' ? (
        <ChartCard title="Notification preferences" subtitle="Choose which alerts reach your inbox and device">
          <Toggle
            label="Critical threat alerts"
            description="Immediate notification when a critical detection is blocked or escalated."
            checked={notifications.critical}
            onChange={(value) => setNotifications((current) => ({ ...current, critical: value }))}
          />
          <Toggle
            label="Daily detection digest"
            description="A single summary of detections and containment actions each morning."
            checked={notifications.dailyDigest}
            onChange={(value) => setNotifications((current) => ({ ...current, dailyDigest: value }))}
          />
          <Toggle
            label="Weekly report delivery"
            description="Receive the generated weekly security report by email."
            checked={notifications.weeklyReport}
            onChange={(value) => setNotifications((current) => ({ ...current, weeklyReport: value }))}
          />
          <Toggle
            label="Product and rule updates"
            description="Changes to detection rules, signatures and platform releases."
            checked={notifications.productUpdates}
            onChange={(value) => setNotifications((current) => ({ ...current, productUpdates: value }))}
          />
        </ChartCard>
      ) : null}

      {section === 'detection' ? (
        <ChartCard title="Detection behaviour" subtitle="Inline controls applied to inspected traffic">
          <Toggle
            label="Automatic blocking"
            description="Deny requests that match a critical signature without waiting for analyst review."
            checked={detection.autoBlock}
            onChange={(value) => setDetection((current) => ({ ...current, autoBlock: value }))}
          />
          <Toggle
            label="Step-up authentication"
            description="Challenge suspicious sessions with an additional verification factor."
            checked={detection.stepUp}
            onChange={(value) => setDetection((current) => ({ ...current, stepUp: value }))}
          />
          <Toggle
            label="Bot mitigation"
            description="Apply behavioural scoring to automated clients on public endpoints."
            checked={detection.botMitigation}
            onChange={(value) => setDetection((current) => ({ ...current, botMitigation: value }))}
          />
          <Toggle
            label="Retain request payloads"
            description="Store offending payload snapshots for forensic review. Increases storage use."
            checked={detection.retainPayloads}
            onChange={(value) => setDetection((current) => ({ ...current, retainPayloads: value }))}
          />
          <div className="notice" style={{ marginTop: 14 }}>
            <ShieldCheck size={15} style={{ flex: '0 0 auto', color: 'var(--teal)' }} />
            <span>Changes here apply to the demonstration workspace only and are not sent anywhere.</span>
          </div>
        </ChartCard>
      ) : null}

      {section === 'defaults' ? (
        <ChartCard title="Workspace defaults" subtitle="Applied when you sign in on a new device">
          <div className="grid grid--2">
            <SelectField
              label="Default date range"
              value={defaults.range}
              onChange={(event) => setDefaults((current) => ({ ...current, range: event.target.value }))}
              options={RANGES.map((item) => ({ value: item.id, label: item.label }))}
              hint={`Currently viewing ${RANGE_MAP[range]?.label?.toLowerCase()}.`}
            />
            <SelectField
              label="Reporting timezone"
              value={defaults.timezone}
              onChange={(event) => setDefaults((current) => ({ ...current, timezone: event.target.value }))}
              options={[
                { value: 'UTC', label: 'UTC' },
                { value: 'Europe/London', label: 'Europe/London' },
                { value: 'Europe/Berlin', label: 'Europe/Berlin' },
                { value: 'America/New_York', label: 'America/New_York' },
              ]}
            />
            <SelectField
              label="Table density"
              value={defaults.density}
              onChange={(event) => setDefaults((current) => ({ ...current, density: event.target.value }))}
              options={[
                { value: 'comfortable', label: 'Comfortable' },
                { value: 'compact', label: 'Compact' },
              ]}
            />
            <SelectField
              label="Session timeout"
              value={defaults.timeout}
              onChange={(event) => setDefaults((current) => ({ ...current, timeout: event.target.value }))}
              options={[
                { value: '15', label: '15 minutes' },
                { value: '30', label: '30 minutes' },
                { value: '60', label: '60 minutes' },
              ]}
              hint="Frontend demonstration — the timeout is not enforced."
            />
          </div>
        </ChartCard>
      ) : null}

      {section === 'team' ? (
        <ChartCard
          title="Team access"
          subtitle="Analysts and administrators in this workspace"
          actions={<Badge tone={isAdmin ? 'teal' : 'neutral'}>{isAdmin ? 'Admin controls' : 'View only'}</Badge>}
        >
          <div className="list-rows">
            {TEAM_MEMBERS.map((member) => (
              <div key={member.id} className="list-row">
                <span className="avatar avatar--sm">{initials(member.name)}</span>
                <div className="list-row__main">
                  <p className="list-row__title">
                    {member.name}
                    {member.email === user?.email ? <span className="record-sub"> · you</span> : null}
                  </p>
                  <p className="list-row__sub">
                    {member.email} · {member.role}
                  </p>
                </div>
                <Badge tone={member.status === 'Active' ? 'teal' : 'neutral'}>{member.status}</Badge>
                <span className="record-sub mono">{member.lastActive}</span>
              </div>
            ))}
          </div>
          {isAdmin ? (
            <div className="notice" style={{ marginTop: 14 }}>
              Invitations and role changes are disabled in this frontend demonstration.
            </div>
          ) : null}
        </ChartCard>
      ) : null}
    </>
  );
}
