import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getAttackSeries, getAttackSummary, getSeverityDistribution } from '../data/mock';
import { formatDateTime, formatDelta, formatNumber } from '../lib/format';
import { Badge, Button, ChartCard, PageHeader, ProgressBar, SeverityBadge } from '../components/ui/Primitives';
import { BarSeries, SeverityStrip } from '../components/ui/Charts';
import DataTable from '../components/ui/DataTable';
import { Modal } from '../components/ui/Overlays';
import { SEVERITY_COLORS, SERIES_COLORS } from '../lib/colors';

export default function Attacks() {
  const { range } = useApp();
  const attacks = useMemo(() => getAttackSummary(), []);
  const series = useMemo(() => getAttackSeries(range), [range]);
  const [active, setActive] = useState(null);

  const severity = useMemo(() => {
    const distribution = getSeverityDistribution(range);
    return Object.entries(distribution).map(([label, value]) => ({
      label,
      value,
      color: SEVERITY_COLORS[label],
    }));
  }, [range]);

  const total = attacks.reduce((sum, attack) => sum + attack.occurrences, 0);

  const columns = [
    {
      key: 'name',
      header: 'Attack type',
      render: (row) => (
        <div className="cell-stack">
          <span className="record-title">{row.name}</span>
          <span className="record-sub mono">{row.mitre}</span>
        </div>
      ),
    },
    { key: 'severity', header: 'Typical severity', render: (row) => <SeverityBadge severity={row.severity} /> },
    {
      key: 'occurrences',
      header: 'Occurrences',
      align: 'right',
      render: (row) => <span className="mono">{formatNumber(row.occurrences)}</span>,
    },
    {
      key: 'trend',
      header: 'Trend',
      align: 'right',
      render: (row) => (
        <span
          className="mono"
          style={{ color: row.trend > 0 ? 'var(--red)' : 'var(--teal)', fontSize: 11.5 }}
          title="Change versus the prior 30 days"
        >
          {formatDelta(row.trend)}
        </span>
      ),
      sortValue: (row) => row.trend,
    },
    {
      key: 'critical',
      header: 'Critical',
      align: 'right',
      render: (row) => <span className="mono" style={{ color: 'var(--red)' }}>{row.critical}</span>,
    },
    {
      key: 'topEndpoint',
      header: 'Most targeted endpoint',
      render: (row) => <span className="mono" style={{ fontSize: 11.5 }}>{row.topEndpoint}</span>,
    },
    {
      key: 'latest',
      header: 'Last observed',
      align: 'right',
      render: (row) => <span className="mono" style={{ fontSize: 11.5 }}>{formatDateTime(row.latest)}</span>,
      sortValue: (row) => new Date(row.latest).getTime(),
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      align: 'right',
      render: (row) => (
        <Button size="sm" variant="ghost" onClick={() => setActive(row)}>
          Inspect
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Security monitoring"
        title="Detected attacks"
        description="Attack families observed against protected endpoints, with volume, severity profile and current mitigation."
        actions={
          <span className="inline">
            <Badge tone="critical" dot>
              {attacks.filter((attack) => attack.severity === 'Critical').length} critical families
            </Badge>
            <Badge tone="neutral" dot>
              {formatNumber(total)} total occurrences
            </Badge>
          </span>
        }
      />

      <div className="grid grid--2">
        <div className="card">
          <div className="card__body">
            <BarSeries
              data={series.slice(-14)}
              height={200}
              series={[
                { key: 'attacks', label: 'Attempts', color: SERIES_COLORS.attacks },
                { key: 'blocked', label: 'Blocked', color: SERIES_COLORS.blocked },
              ]}
            />
          </div>
        </div>
        <ChartCard title="Severity profile" subtitle="All detected threats in range">
          <SeverityStrip data={severity} />
        </ChartCard>
      </div>

      <div className="grid grid--3">
        {attacks.slice(0, 3).map((attack) => (
          <div key={attack.id} className="card">
            <div className="card__body stack stack--sm">
              <div className="inline" style={{ justifyContent: 'space-between' }}>
                <p className="section-title">{attack.short}</p>
                <SeverityBadge severity={attack.severity} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 600 }}>{attack.name}</p>
              <p className="record-sub">
                {formatNumber(attack.occurrences)} occurrences · {attack.critical} critical
              </p>
              <ProgressBar
                value={(attack.occurrences / attacks[0].occurrences) * 100}
                tone={attack.severity === 'Critical' ? 'red' : attack.severity === 'High' ? 'amber' : 'blue'}
                label={attack.name}
              />
              <p className="record-sub mono">{attack.topEndpoint}</p>
            </div>
          </div>
        ))}
      </div>

      <ChartCard flush title="Attack catalogue" subtitle="Detection coverage per attack family">
        <DataTable
          rows={attacks}
          columns={columns}
          pageSize={8}
          searchPlaceholder="Search attack family, MITRE technique or endpoint…"
          getSearchText={(row) =>
            [row.name, row.short, row.mitre, row.topEndpoint, row.description].join(' ').toLowerCase()
          }
          filters={[
            {
              key: 'severity',
              label: 'Typical severity',
              options: ['Critical', 'High', 'Medium', 'Low'].map((value) => ({ value, label: value })),
            },
          ]}
        />
      </ChartCard>

      <Modal
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={active?.name ?? 'Attack'}
        subtitle={active ? `MITRE ${active.mitre} · ${formatNumber(active.occurrences)} observed events` : undefined}
        footer={<Button onClick={() => setActive(null)}>Close</Button>}
      >
        {active ? (
          <>
            <div className="inline">
              <SeverityBadge severity={active.severity} />
              <Badge tone="neutral">{active.id.toUpperCase()}</Badge>
            </div>
            <p className="modal-copy">{active.description}</p>
            <div className="meta-list">
              <div className="meta-row">
                <span>Primary endpoint</span>
                <span className="mono">{active.endpoint}</span>
              </div>
              <div className="meta-row">
                <span>Most targeted</span>
                <span className="mono">{active.topEndpoint}</span>
              </div>
              <div className="meta-row">
                <span>Last observed</span>
                <span className="mono">{formatDateTime(active.latest)}</span>
              </div>
              <div className="meta-row">
                <span>Critical events</span>
                <span className="mono">{active.critical}</span>
              </div>
            </div>
            <div className="notice">{active.mitigation}</div>
            <div className="stack stack--sm">
              <p className="section-title">Severity breakdown</p>
              {active.severityCounts.map((item) => (
                <div key={item.severity} className="stack stack--sm" style={{ gap: 5 }}>
                  <div className="stat-line">
                    <span style={{ fontSize: 12 }}>{item.severity}</span>
                    <strong>{item.count}</strong>
                  </div>
                  <ProgressBar
                    value={active.occurrences ? (item.count / active.occurrences) * 100 : 0}
                    tone={item.severity === 'Critical' ? 'red' : item.severity === 'High' ? 'amber' : 'blue'}
                    label={`${active.name} ${item.severity}`}
                  />
                </div>
              ))}
            </div>
          </>
        ) : null}
      </Modal>
    </>
  );
}
