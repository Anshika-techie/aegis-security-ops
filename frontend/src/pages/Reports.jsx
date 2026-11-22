import { useMemo, useState } from 'react';
import { CalendarClock, Check, Download, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  BLOCKED_REQUESTS,
  EVENTS,
  RANGES,
  RANGE_MAP,
  REPORT_CATALOG,
  getAnalyticsMetrics,
  getAttackSummary,
  getKpis,
  getSeverityDistribution,
} from '../data/mock';
import { downloadCsv } from '../lib/csv';
import { formatDate, formatNumber } from '../lib/format';
import {
  Badge,
  Button,
  ChartCard,
  PageHeader,
  SelectField,
} from '../components/ui/Primitives';

const RANGE_DAYS = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 };

function inRange(timestamp, rangeId) {
  const days = RANGE_DAYS[rangeId] ?? 30;
  return new Date(timestamp).getTime() >= Date.now() - days * 86400000;
}

export default function Reports() {
  const { range, pushToast } = useApp();
  const [selectedId, setSelectedId] = useState(REPORT_CATALOG[0].id);
  const [reportRange, setReportRange] = useState(range);

  const selected = REPORT_CATALOG.find((report) => report.id === selectedId) ?? REPORT_CATALOG[0];

  const preview = useMemo(() => {
    if (selected.id === 'overview') {
      const kpis = getKpis(reportRange);
      const severity = getSeverityDistribution(reportRange);
      return kpis.map((kpi) => ({
        metric: kpi.label,
        value: kpi.suffix ? `${kpi.value}${kpi.suffix}` : formatNumber(kpi.value),
      })).concat(Object.entries(severity).map(([severityLabel, count]) => ({
        metric: `${severityLabel} threats`,
        value: formatNumber(count),
      })));
    }
    if (selected.id === 'attacks') {
      return getAttackSummary().slice(0, 5).map((attack) => ({
        metric: attack.name,
        value: `${formatNumber(attack.occurrences)} occurrences`,
      }));
    }
    if (selected.id === 'blocked') {
      const rows = BLOCKED_REQUESTS.filter((row) => inRange(row.timestamp, reportRange));
      return [
        { metric: 'Blocked requests', value: formatNumber(rows.length) },
        { metric: 'Critical signatures', value: formatNumber(rows.filter((r) => r.severity === 'Critical').length) },
        { metric: 'Edge WAF blocks', value: formatNumber(rows.filter((r) => r.layer === 'Edge WAF').length) },
        { metric: 'Distinct source addresses', value: formatNumber(new Set(rows.map((r) => r.sourceIp)).size) },
      ];
    }
    const metrics = getAnalyticsMetrics(reportRange);
    return [
      { metric: 'Detection accuracy', value: `${metrics.detectionAccuracy}%` },
      { metric: 'False-positive rate', value: `${metrics.falsePositiveRate}%` },
      { metric: 'False-negative rate', value: `${metrics.falseNegativeRate}%` },
      { metric: 'Detection latency', value: `${metrics.detectionLatency} ms` },
    ];
  }, [selected, reportRange]);

  const exportReport = () => {
    const date = new Date().toISOString().slice(0, 10);
    const filename = `aegis-${selected.id}-report-${reportRange}-${date}`;

    if (selected.id === 'attacks') {
      downloadCsv(
        filename,
        [
          { key: 'name', label: 'Attack category' },
          { key: 'mitre', label: 'MITRE' },
          { key: 'severity', label: 'Severity' },
          { key: 'occurrences', label: 'Occurrences' },
          { key: 'critical', label: 'Critical events' },
          { key: 'topEndpoint', label: 'Most affected endpoint' },
          { key: 'latest', label: 'Latest occurrence' },
          { key: 'trend', label: 'Trend vs prior period (%)' },
        ],
        getAttackSummary(),
      );
    } else if (selected.id === 'blocked') {
      downloadCsv(
        filename,
        [
          { key: 'id', label: 'Request ID' },
          { key: 'timestamp', label: 'Blocked at' },
          { key: 'sourceIp', label: 'Source IP' },
          { key: 'country', label: 'Country' },
          { key: 'endpoint', label: 'Endpoint' },
          { key: 'attackName', label: 'Attack category' },
          { key: 'reason', label: 'Blocking reason' },
          { key: 'layer', label: 'Layer' },
          { key: 'severity', label: 'Severity' },
        ],
        BLOCKED_REQUESTS.filter((row) => inRange(row.timestamp, reportRange)),
      );
    } else if (selected.id === 'performance') {
      const metrics = getAnalyticsMetrics(reportRange);
      downloadCsv(
        filename,
        [
          { key: 'metric', label: 'Metric' },
          { key: 'value', label: 'Value' },
        ],
        [
          { metric: 'Detection accuracy', value: `${metrics.detectionAccuracy}%` },
          { metric: 'False-positive rate', value: `${metrics.falsePositiveRate}%` },
          { metric: 'False-negative rate', value: `${metrics.falseNegativeRate}%` },
          { metric: 'Detection latency', value: `${metrics.detectionLatency} ms` },
          { metric: 'Requests evaluated', value: metrics.requests },
          { metric: 'Requests blocked', value: metrics.blocked },
        ],
      );
    } else {
      downloadCsv(
        filename,
        [
          { key: 'metric', label: 'Metric' },
          { key: 'value', label: 'Value' },
        ],
        preview,
      );
    }
    pushToast(`“${selected.name}” exported as CSV.`);
  };

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Reports"
        description="Audit-ready exports and scheduled summaries for security operations and compliance review."
        actions={
          <Button variant="primary" icon={Download} onClick={exportReport}>
            Export report
          </Button>
        }
      />

      <div className="grid grid--1-2">
        <ChartCard title="Report library" subtitle="Select a report to inspect and export" flush className="card--start">
          <ul className="list-rows" style={{ padding: '0 10px' }}>
            {REPORT_CATALOG.map((report) => (
              <li key={report.id} className="list-row" style={{ padding: '12px 8px' }}>
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => setSelectedId(report.id)}
                  style={{ textAlign: 'left', flex: 1, color: report.id === selected.id ? 'var(--text)' : 'var(--text-2)' }}
                  aria-pressed={report.id === selected.id}
                >
                  <span className="inline" style={{ gap: 8 }}>
                    <FileText size={14} strokeWidth={1.8} aria-hidden="true" />
                    <span style={{ fontWeight: report.id === selected.id ? 550 : 400 }}>{report.name}</span>
                  </span>
                </button>
                {report.id === selected.id ? <Check size={14} style={{ color: 'var(--teal)' }} aria-hidden="true" /> : null}
              </li>
            ))}
          </ul>
        </ChartCard>

        <div className="stack">
          <ChartCard
            title={selected.name}
            subtitle={selected.description}
            actions={<Badge tone="teal">{selected.format}</Badge>}
          >
            <div className="grid grid--2">
              <SelectField
                label="Report range"
                value={reportRange}
                onChange={(event) => setReportRange(event.target.value)}
                options={RANGES.map((item) => ({ value: item.id, label: item.label }))}
              />
              <div className="stack stack--sm" style={{ gap: 6 }}>
                <span className="field__label">Schedule</span>
                <span className="inline record-sub" style={{ gap: 6 }}>
                  <CalendarClock size={13} aria-hidden="true" />
                  {selected.cadence}
                </span>
                <span className="record-sub">Owner {selected.owner}</span>
              </div>
            </div>

            <div className="stack stack--sm" style={{ marginTop: 16 }}>
              <p className="section-title">Included sections</p>
              <div className="tag-row">
                {selected.includes.map((item) => (
                  <Badge key={item} tone="neutral">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="stack stack--sm" style={{ marginTop: 16 }}>
              <p className="section-title">Report preview · {RANGE_MAP[reportRange]?.label}</p>
              <div className="meta-list">
                {preview.map((row) => (
                  <div key={row.metric} className="meta-row">
                    <span>{row.metric}</span>
                    <span className="mono">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="inline" style={{ marginTop: 16, gap: 8 }}>
              <Button variant="primary" icon={Download} onClick={exportReport}>
                Export CSV
              </Button>
              <Button
                variant="ghost"
                onClick={() => pushToast(`“${selected.name}” will be delivered to your inbox.`, 'info')}
              >
                Email summary
              </Button>
            </div>
          </ChartCard>

          <ChartCard title="Reporting coverage" subtitle="Data available for export">
            <div className="grid grid--3">
              <div className="stack stack--sm">
                <p className="section-title">Events available</p>
                <p style={{ fontSize: 20, fontWeight: 600 }}>{formatNumber(EVENTS.length)}</p>
                <p className="record-sub">Full detection history retained for 90 days.</p>
              </div>
              <div className="stack stack--sm">
                <p className="section-title">Retention window</p>
                <p style={{ fontSize: 20, fontWeight: 600 }}>90 days</p>
                <p className="record-sub">Extended retention available in settings.</p>
              </div>
              <div className="stack stack--sm">
                <p className="section-title">Last export</p>
                <p style={{ fontSize: 20, fontWeight: 600 }}>{formatDate(new Date())}</p>
                <p className="record-sub">Generated from the demonstration dataset.</p>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </>
  );
}
