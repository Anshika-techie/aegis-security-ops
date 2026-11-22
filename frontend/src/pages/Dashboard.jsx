import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  Ban,
  HeartPulse,
  Radar,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  LAST_SYNC,
  PERFORMANCE_INDICATORS,
  SECURITY_POSTURE,
  getAttackSeries,
  getKpis,
  getRecentEvents,
  getSeverityDistribution,
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
import { PostureRadar, SeverityDonut, ThreatAreaChart } from '../components/ui/Viz';
import { COLORS, SEVERITY_COLORS, SERIES_COLORS } from '../lib/colors';

const KPI_ICONS = { activity: Activity, 'shield-alert': ShieldAlert, ban: Ban, radar: Radar, 'heart-pulse': HeartPulse };
const KPI_TONES = { requests: 'blue', threats: 'red', blocked: 'teal', active: 'amber', health: 'teal' };

export default function Dashboard() {
  const { range, user, reviews, toggleReview, pushToast } = useApp();
  const navigate = useNavigate();

  const kpis = getKpis(range);
  const series = useMemo(() => getAttackSeries(range), [range]);
  const recent = useMemo(() => getRecentEvents(6, range), [range]);
  const severity = useMemo(() => {
    const distribution = getSeverityDistribution(range);
    return Object.entries(distribution).map(([label, value]) => ({
      label,
      value,
      color: SEVERITY_COLORS[label],
    }));
  }, [range]);

  const totalThreats = severity.reduce((sum, item) => sum + item.value, 0);
  const reviewedCount = Object.values(reviews).filter(Boolean).length;

  return (
    <>
      <PageHeader
        eyebrow="Workspace overview"
        title={`Good to see you, ${user?.name?.split(' ')[0] ?? 'analyst'}`}
        description="Live protection posture across edge traffic, API activity and identity telemetry."
        actions={
          <>
            <span className="inline muted" style={{ fontSize: 11.5 }}>
              Synced {relativeTime(LAST_SYNC)}
            </span>
            <Button icon={ShieldCheck} onClick={() => navigate('/events')}>
              Review events
            </Button>
          </>
        }
      />

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
          title="Detections and blocks"
          subtitle={`Daily volume across the selected window`}
          footer={`${formatNumber(totalThreats)} classified threats · ${reviewedCount} marked reviewed in this session`}
        >
          <ThreatAreaChart
            data={series}
            height={224}
            series={[
              { key: 'detected', label: 'Detected', color: SERIES_COLORS.attacks },
              { key: 'blocked', label: 'Blocked', color: SERIES_COLORS.blocked },
              { key: 'attacks', label: 'Incoming attacks', color: SERIES_COLORS.detected, fillOpacity: 0.06 },
            ]}
          />
        </ChartCard>

        <ChartCard title="Severity distribution" subtitle="All classified threats in range">
          <SeverityDonut data={severity} height={190} />
          <div className="stat-line" style={{ marginTop: 10 }}>
            <span className="muted" style={{ fontSize: 12 }}>
              Critical share
            </span>
            <strong style={{ color: COLORS.red }}>
              {Math.round((severity[0].value / totalThreats) * 100)}%
            </strong>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid--1-2">
        <ChartCard title="Protection posture" subtitle="Control coverage by domain">
          <PostureRadar data={SECURITY_POSTURE} height={230} />
          <div className="stat-line" style={{ marginTop: 4 }}>
            <span className="muted" style={{ fontSize: 12 }}>
              Overall posture
            </span>
            <strong style={{ color: COLORS.teal }}>
              {Math.round(SECURITY_POSTURE.reduce((sum, item) => sum + item.score, 0) / SECURITY_POSTURE.length)}%
            </strong>
          </div>
        </ChartCard>

        <ChartCard
          title="Recent security events"
          subtitle="Latest detections requiring analyst attention"
          flush
          actions={
            <Button size="sm" variant="ghost" onClick={() => navigate('/events')}>
              View all <ArrowUpRight size={13} />
            </Button>
          }
        >
          <ul className="list-rows" style={{ padding: '0 18px' }}>
            {recent.map((event) => (
              <li key={event.id} className="list-row">
                <div className="list-row__main">
                  <p className="list-row__title">
                    {event.attackName} <span className="mono muted">· {event.id}</span>
                  </p>
                  <p className="list-row__sub">
                    {event.sourceIp} · {event.sourceCountry} · {relativeTime(event.timestamp)}
                  </p>
                </div>
                <SeverityBadge severity={event.severity} />
                <StatusBadge status={event.status} />
                <Button
                  size="sm"
                  variant={reviews[event.id] ? 'ghost' : 'secondary'}
                  onClick={() => {
                    toggleReview(event.id, !reviews[event.id]);
                    pushToast(reviews[event.id] ? 'Event returned to queue.' : 'Event marked reviewed.', 'info');
                  }}
                >
                  {reviews[event.id] ? 'Reviewed' : 'Review'}
                </Button>
              </li>
            ))}
          </ul>
        </ChartCard>
      </div>

      <ChartCard
        title="Detection performance"
        subtitle="Model and control effectiveness, trailing 30 days"
        footer="Metrics are simulated for this demonstration workspace."
      >
        <div className="grid grid--2">
          {PERFORMANCE_INDICATORS.map((indicator) => (
            <div key={indicator.id} className="inline" style={{ gap: 14, alignItems: 'center' }}>
              <Ring
                value={indicator.value}
                label={`${indicator.value}%`}
                size={68}
                stroke={5}
                color={indicator.status === 'healthy' ? COLORS.teal : COLORS.amber}
              />
              <div className="stack stack--sm" style={{ gap: 3 }}>
                <span style={{ fontSize: 12.5 }}>{indicator.label}</span>
                <p className="record-sub" style={{ margin: 0 }}>
                  {indicator.note}
                </p>
                <Badge
                  tone={indicator.status === 'healthy' ? 'teal' : 'high'}
                  className="badge--start"
                >
                  {indicator.status === 'healthy' ? 'Healthy' : 'Watch'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      <div className="grid grid--3">
        <div className="card">
          <div className="card__body stack stack--sm">
            <p className="section-title">Monitored today</p>
            <p style={{ fontSize: 22, fontWeight: 600 }}>
              {formatCompact(kpis.find((k) => k.id === 'requests').value)}
            </p>
            <p className="record-sub">Requests evaluated across all protected endpoints.</p>
          </div>
        </div>
        <div className="card">
          <div className="card__body stack stack--sm">
            <p className="section-title">Active defence layers</p>
            <p style={{ fontSize: 22, fontWeight: 600 }}>4 / 4</p>
            <p className="record-sub">Edge WAF, API gateway, identity and rate governor online.</p>
          </div>
        </div>
        <div className="card">
          <div className="card__body stack stack--sm">
            <p className="section-title">Analyst queue</p>
            <p style={{ fontSize: 22, fontWeight: 600 }}>{recent.filter((e) => !reviews[e.id]).length}</p>
            <p className="record-sub">Recent events still awaiting review in this session.</p>
          </div>
        </div>
      </div>
    </>
  );
}
