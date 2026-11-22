import { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Activity,
  Ban,
  Crosshair,
  FileText,
  Globe2,
  HeartPulse,
  Radar,
  Settings,
  ShieldAlert,
  Siren,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  EVENTS,
  LAST_SYNC,
  PERFORMANCE_INDICATORS,
  SECURITY_POSTURE,
  TEAM_MEMBERS,
  getAttackSeries,
  getCategoryCounts,
  getGeoOrigins,
  getKpis,
  getSeverityDistribution,
  getTrafficSeries,
} from '../data/mock';
import { formatCompact, formatNumber, relativeTime } from '../lib/format';
import {
  Badge,
  Button,
  ChartCard,
  PageHeader,
  SeverityBadge,
  StatCard,
  StatusBadge,
} from '../components/ui/Primitives';
import { Ring } from '../components/ui/Charts';
import {
  CategoryBarChart,
  PostureRadar,
  SeverityDonut,
  ThreatAreaChart,
} from '../components/ui/Viz';
import WorldMap from '../components/ui/WorldMap';
import { COLORS, SEVERITY_COLORS, SERIES_COLORS } from '../lib/colors';

const KPI_ICONS = { activity: Activity, 'shield-alert': ShieldAlert, ban: Ban, radar: Radar, 'heart-pulse': HeartPulse };
const KPI_TONES = { requests: 'blue', threats: 'red', blocked: 'teal', active: 'amber', health: 'teal' };

const SUB_PAGES = [
  { to: '/admin', label: 'Overview', icon: Activity, end: true },
  { to: '/admin/events', label: 'Security events', icon: Siren },
  { to: '/admin/attacks', label: 'Detected attacks', icon: Crosshair },
  { to: '/admin/blocked', label: 'Blocked requests', icon: Ban },
  { to: '/admin/intelligence', label: 'Threat intelligence', icon: Globe2 },
  { to: '/admin/analytics', label: 'Analytics', icon: Radar },
  { to: '/admin/reports', label: 'Reports', icon: FileText },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminOverview() {
  const { range, user } = useApp();
  const navigate = useNavigate();

  const kpis = getKpis(range);
  const attackSeries = useMemo(() => getAttackSeries(range), [range]);
  const traffic = useMemo(() => getTrafficSeries(range), [range]);
  const categories = useMemo(() => getCategoryCounts(range), [range]);
  const origins = useMemo(() => getGeoOrigins(range), [range]);
  const severity = useMemo(() => {
    const distribution = getSeverityDistribution(range);
    return Object.entries(distribution).map(([label, value]) => ({
      label,
      value,
      color: SEVERITY_COLORS[label],
    }));
  }, [range]);

  const openEvents = EVENTS.filter((event) => event.status === 'Detected' || event.status === 'Investigating');
  const criticalOpen = openEvents.filter((event) => event.severity === 'Critical');
  const totalRequests = traffic.reduce((sum, point) => sum + point.requests, 0);
  const totalBlocked = traffic.reduce((sum, point) => sum + point.blocked, 0);
  const blockRate = (totalBlocked / totalRequests) * 100;

  return (
    <>
      <PageHeader
        eyebrow="Administrator · Operations"
        title="Operations overview"
        description={`Full-fidelity monitoring for ${user?.name ?? 'the security team'}. Detection, containment and reporting in one operational picture.`}
        actions={
          <>
            <span className="inline muted" style={{ fontSize: 11.5 }}>
              Synced {relativeTime(LAST_SYNC)}
            </span>
            <Button variant="primary" icon={Siren} onClick={() => navigate('/admin/events')}>
              Open event queue
            </Button>
          </>
        }
      />

      <nav className="inline" aria-label="Administrator sections" style={{ gap: 4, flexWrap: 'wrap' }}>
        {SUB_PAGES.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `btn btn--sm ${isActive ? 'btn--primary' : 'btn--ghost'}`}
          >
            <Icon size={13} strokeWidth={1.9} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="grid grid--kpis">
        {kpis.map((kpi) => (
          <StatCard
            key={kpi.id}
            icon={KPI_ICONS[kpi.icon]}
            tone={KPI_TONES[kpi.id]}
            label={kpi.label}
            value={kpi.suffix ? kpi.value : formatNumber(kpi.value)}
            suffix={kpi.suffix}
            delta={kpi.delta}
            goodWhen={kpi.goodWhen}
          />
        ))}
      </div>

      <div className="grid grid--2-1">
        <ChartCard
          title="Attack and containment volume"
          subtitle="Detected, blocked and investigated across the selected window"
          footer={`Block rate ${blockRate.toFixed(2)}% · ${formatNumber(totalBlocked)} requests stopped at the edge`}
        >
          <ThreatAreaChart
            data={attackSeries}
            height={230}
            series={[
              { key: 'attacks', label: 'Incoming attacks', color: SERIES_COLORS.detected, fillOpacity: 0.06 },
              { key: 'detected', label: 'Detected threats', color: SERIES_COLORS.attacks },
              { key: 'blocked', label: 'Blocked', color: SERIES_COLORS.blocked },
            ]}
          />
        </ChartCard>

        <ChartCard title="Threat distribution" subtitle="Classified threats by severity">
          <SeverityDonut data={severity} height={186} />
          <div className="stack stack--sm" style={{ marginTop: 10 }}>
            <div className="stat-line">
              <span className="muted" style={{ fontSize: 12 }}>
                Open critical events
              </span>
              <Badge tone="critical" dot>
                {criticalOpen.length}
              </Badge>
            </div>
            <div className="stat-line">
              <span className="muted" style={{ fontSize: 12 }}>
                Mean time to contain
              </span>
              <strong>1m 46s</strong>
            </div>
          </div>
        </ChartCard>
      </div>

      <ChartCard
        title="Global threat distribution"
        subtitle="Geographic origin of detected attacks in the selected window"
        actions={
          <Button size="sm" variant="ghost" onClick={() => navigate('/admin/analytics')}>
            Open analytics
          </Button>
        }
        footer={`${origins.length} source countries observed · ${formatNumber(origins.reduce((sum, origin) => sum + origin.count, 0))} attacks attributed`}
      >
        <WorldMap origins={origins} />
      </ChartCard>

      <div className="grid grid--2">
        <ChartCard title="Security posture" subtitle="Control coverage across protected domains">
          <PostureRadar data={SECURITY_POSTURE} height={252} />
        </ChartCard>

        <ChartCard
          title="Attack category distribution"
          subtitle="Detected and blocked events by category"
          actions={
            <Button size="sm" variant="ghost" onClick={() => navigate('/admin/attacks')}>
              Details
            </Button>
          }
        >
          <CategoryBarChart
            data={categories.map((category) => ({
              label: category.short,
              detected: category.count,
              blocked: category.blocked,
            }))}
            height={212}
            series={[
              { key: 'detected', label: 'Detected', color: SERIES_COLORS.attacks },
              { key: 'blocked', label: 'Blocked', color: SERIES_COLORS.blocked },
            ]}
          />
        </ChartCard>
      </div>

      <ChartCard
        title="Open event queue"
        subtitle="Highest-priority detections awaiting containment or closure"
        flush
        actions={
          <Button size="sm" onClick={() => navigate('/admin/events')}>
            Full queue
          </Button>
        }
      >
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Event</th>
                <th scope="col">Attack</th>
                <th scope="col">Source</th>
                <th scope="col">Endpoint</th>
                <th scope="col">Severity</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
                <th scope="col" className="align-right">
                  Detected
                </th>
              </tr>
            </thead>
            <tbody>
              {openEvents.slice(0, 7).map((event) => (
                <tr
                  key={event.id}
                  className="row--interactive"
                  onClick={() => navigate('/admin/events', { state: { search: event.id } })}
                >
                  <td className="mono" style={{ color: 'var(--text)' }}>
                    {event.id}
                  </td>
                  <td>{event.attackName}</td>
                  <td>
                    <div className="cell-stack">
                      <span className="mono" style={{ color: 'var(--text)' }}>
                        {event.sourceIp}
                      </span>
                      <span className="record-sub">{event.sourceCountry}</span>
                    </div>
                  </td>
                  <td className="mono" style={{ fontSize: 11.5 }}>
                    {event.endpoint}
                  </td>
                  <td>
                    <SeverityBadge severity={event.severity} />
                  </td>
                  <td>
                    <StatusBadge status={event.status} />
                  </td>
                  <td className="record-sub" style={{ whiteSpace: 'nowrap' }}>
                    {event.action}
                  </td>
                  <td className="align-right muted" style={{ fontSize: 11.5 }}>
                    {relativeTime(event.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      <div className="grid grid--3">
        <ChartCard title="Security performance" subtitle="Trailing 30 days" className="card--perf">
          <div className="grid grid--2" style={{ gap: 14 }}>
            {PERFORMANCE_INDICATORS.map((indicator) => (
              <div key={indicator.id} className="inline" style={{ gap: 10, alignItems: 'center' }}>
                <Ring
                  value={indicator.value}
                  label={`${indicator.value}%`}
                  size={54}
                  stroke={4}
                  color={indicator.status === 'healthy' ? COLORS.teal : COLORS.amber}
                />
                <div className="stack stack--sm" style={{ gap: 2 }}>
                  <span style={{ fontSize: 11.5 }}>{indicator.label}</span>
                  <span className="record-sub" style={{ fontSize: 10 }}>
                    {indicator.status === 'healthy' ? 'Healthy' : 'Watch'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Coverage" subtitle="Protected surfaces reporting">
          <div className="inline" style={{ justifyContent: 'space-between', gap: 18 }}>
            <Ring value={99.2} label="99.2%" size={92} stroke={7} />
            <div className="stack stack--sm" style={{ flex: 1 }}>
              <div className="stat-line">
                <span className="muted" style={{ fontSize: 12 }}>
                  Endpoints
                </span>
                <strong>{formatCompact(totalRequests)}</strong>
              </div>
              <div className="stat-line">
                <span className="muted" style={{ fontSize: 12 }}>
                  Inline rules
                </span>
                <strong>1,284</strong>
              </div>
              <div className="stat-line">
                <span className="muted" style={{ fontSize: 12 }}>
                  Threat feeds
                </span>
                <strong>6</strong>
              </div>
            </div>
          </div>
          <div className="notice" style={{ marginTop: 16 }}>
            All four protection layers report nominal operation. Last configuration change 2 days ago.
          </div>
        </ChartCard>

        <ChartCard title="Analyst coverage" subtitle="Shift roster and responsiveness">
          <div className="list-rows">
            {TEAM_MEMBERS.map((member) => (
              <div key={member.id} className="list-row">
                <div className="list-row__main">
                  <p className="list-row__title">{member.name}</p>
                  <p className="list-row__sub">
                    {member.role} · {member.lastActive}
                  </p>
                </div>
                <Badge tone={member.status === 'Active' ? 'teal' : 'neutral'}>{member.status}</Badge>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </>
  );
}
