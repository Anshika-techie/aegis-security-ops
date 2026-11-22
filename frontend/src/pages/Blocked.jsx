import { useMemo, useState } from 'react';
import { Ban, Download, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BLOCKED_REQUESTS, RANGE_MAP, getTrafficSeries } from '../data/mock';
import { downloadCsv } from '../lib/csv';
import { formatDateTime, formatNumber } from '../lib/format';
import {
  Badge,
  Button,
  ChartCard,
  PageHeader,
  SeverityBadge,
} from '../components/ui/Primitives';
import { HBarList } from '../components/ui/Charts';
import DataTable from '../components/ui/DataTable';
import { Modal } from '../components/ui/Overlays';
import { ThreatAreaChart } from '../components/ui/Viz';
import { SERIES_COLORS } from '../lib/colors';

const RANGE_DAYS = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 };

export default function Blocked() {
  const { range, pushToast } = useApp();
  const [selected, setSelected] = useState(null);
  const [reviewed, setReviewed] = useState({});
  const traffic = useMemo(() => getTrafficSeries(range), [range]);

  const rows = useMemo(() => {
    const days = RANGE_DAYS[range] ?? 30;
    const cutoff = Date.now() - days * 86400000;
    return BLOCKED_REQUESTS.filter((row) => new Date(row.timestamp).getTime() >= cutoff);
  }, [range]);

  const byLayer = useMemo(() => {
    const counts = {};
    rows.forEach((row) => {
      counts[row.layer] = (counts[row.layer] ?? 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [rows]);

  const byReason = useMemo(() => {
    const counts = {};
    rows.forEach((row) => {
      counts[row.reason] = (counts[row.reason] ?? 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [rows]);

  const columns = [
    {
      key: 'id',
      header: 'Request',
      render: (row) => <span className="mono" style={{ color: 'var(--text)' }}>{row.id}</span>,
    },
    {
      key: 'sourceIp',
      header: 'Source',
      render: (row) => (
        <div className="cell-stack">
          <span className="mono" style={{ color: 'var(--text)' }}>{row.sourceIp}</span>
          <span className="record-sub">{row.country}</span>
        </div>
      ),
    },
    {
      key: 'endpoint',
      header: 'Endpoint',
      render: (row) => <span className="mono" style={{ fontSize: 11.5 }}>{row.endpoint}</span>,
    },
    { key: 'attackName', header: 'Signature' },
    { key: 'severity', header: 'Severity', render: (row) => <SeverityBadge severity={row.severity} /> },
    { key: 'layer', header: 'Blocked at', render: (row) => <Badge tone="neutral">{row.layer}</Badge> },
    {
      key: 'responseCode',
      header: 'Response',
      align: 'right',
      render: (row) => <span className="mono">{row.responseCode}</span>,
    },
    {
      key: 'timestamp',
      header: 'Blocked at',
      align: 'right',
      render: (row) => <span className="mono" style={{ fontSize: 11.5 }}>{formatDateTime(row.timestamp)}</span>,
      sortValue: (row) => new Date(row.timestamp).getTime(),
    },
    {
      key: 'review',
      header: '',
      sortable: false,
      align: 'right',
      render: (row) => (
        <Button
          size="sm"
          variant={reviewed[row.id] ? 'ghost' : 'secondary'}
          icon={reviewed[row.id] ? undefined : Eye}
          onClick={(event) => {
            event.stopPropagation();
            setSelected(row);
          }}
        >
          {reviewed[row.id] ? 'Reviewed' : 'Review'}
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Security monitoring"
        title="Blocked requests"
        description={`${formatNumber(rows.length)} requests denied in ${RANGE_MAP[range]?.label?.toLowerCase() ?? 'the selected window'} before reaching an application.`}
        actions={
          <Button
            icon={Download}
            onClick={() => {
              downloadCsv(
                `aegis-blocked-requests-${range}`,
                [
                  { key: 'id', label: 'Request ID' },
                  { key: 'timestamp', label: 'Blocked at' },
                  { key: 'sourceIp', label: 'Source IP' },
                  { key: 'country', label: 'Country' },
                  { key: 'endpoint', label: 'Endpoint' },
                  { key: 'attackName', label: 'Signature' },
                  { key: 'severity', label: 'Severity' },
                  { key: 'layer', label: 'Layer' },
                  { key: 'reason', label: 'Reason' },
                ],
                rows,
              );
              pushToast(`Exported ${rows.length} blocked requests.`);
            }}
          >
            Export all
          </Button>
        }
      />

      <div className="grid grid--3">
        <div className="card">
          <div className="card__body stack stack--sm">
            <p className="section-title">Requests blocked</p>
            <p style={{ fontSize: 22, fontWeight: 600, color: 'var(--teal)' }}>{formatNumber(rows.length)}</p>
            <p className="record-sub">Denied by inline protection controls.</p>
          </div>
        </div>
        <div className="card">
          <div className="card__body stack stack--sm">
            <p className="section-title">Critical signatures</p>
            <p style={{ fontSize: 22, fontWeight: 600, color: 'var(--red)' }}>
              {rows.filter((row) => row.severity === 'Critical').length}
            </p>
            <p className="record-sub">Blocks matched to critical WAF signatures.</p>
          </div>
        </div>
        <div className="card">
          <div className="card__body stack stack--sm">
            <p className="section-title">Primary layer</p>
            <p style={{ fontSize: 22, fontWeight: 600 }}>{byLayer[0]?.label ?? '—'}</p>
            <p className="record-sub">{byLayer[0] ? `${formatNumber(byLayer[0].value)} blocks` : 'No blocks in range'}</p>
          </div>
        </div>
      </div>

      <ChartCard title="Blocked requests over time">
        <ThreatAreaChart
          data={traffic}
          height={190}
          series={[{ key: 'blocked', label: 'Blocked requests', color: SERIES_COLORS.blocked }]}
        />
      </ChartCard>

      <div className="grid grid--2">
        <ChartCard title="Blocks by protection layer" subtitle="Where requests were stopped">
          <HBarList items={byLayer.map((item, index) => ({ ...item, tone: index === 0 ? 'red' : 'teal' }))} />
        </ChartCard>
        <ChartCard title="Top blocking reasons" subtitle="Dominant signatures in range">
          <HBarList items={byReason.map((item, index) => ({ ...item, tone: index === 0 ? 'amber' : 'blue' }))} />
        </ChartCard>
      </div>

      <ChartCard flush>
        <DataTable
          rows={rows}
          columns={columns}
          pageSize={10}
          initialSort={{ key: 'timestamp', direction: 'desc' }}
          searchPlaceholder="Search request ID, IP, endpoint or signature…"
          getSearchText={(row) =>
            [row.id, row.sourceIp, row.country, row.endpoint, row.attackName, row.layer, row.reason]
              .join(' ')
              .toLowerCase()
          }
          filters={[
            {
              key: 'layer',
              label: 'Layer',
              options: ['Edge WAF', 'API gateway', 'Auth service', 'Rate governor'].map((value) => ({
                value,
                label: value,
              })),
            },
            {
              key: 'severity',
              label: 'Severity',
              options: ['Critical', 'High', 'Medium', 'Low'].map((value) => ({ value, label: value })),
            },
          ]}
          onRowClick={(row) => setSelected(row)}
          onExport={(filtered) => {
            downloadCsv(
              `aegis-blocked-requests-filtered-${range}`,
              [
                { key: 'id', label: 'Request ID' },
                { key: 'timestamp', label: 'Blocked at' },
                { key: 'sourceIp', label: 'Source IP' },
                { key: 'endpoint', label: 'Endpoint' },
                { key: 'attackName', label: 'Signature' },
                { key: 'layer', label: 'Layer' },
              ],
              filtered,
            );
            pushToast(`Exported ${filtered.length} rows.`);
          }}
          emptyTitle="No blocked requests in this view"
          emptyText="All matching requests were allowed, or your filters exclude them."
          emptyIcon={Ban}
        />
      </ChartCard>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Blocked request"
        subtitle={selected ? `${selected.id} · ${formatDateTime(selected.timestamp)}` : undefined}
        footer={
          <>
            <Button onClick={() => setSelected(null)}>Close</Button>
            <Button
              variant="primary"
              icon={Ban}
              onClick={() => {
                if (!selected) return;
                setReviewed((current) => ({ ...current, [selected.id]: !current[selected.id] }));
                pushToast(
                  reviewed[selected.id]
                    ? 'Request removed from the review queue.'
                    : 'Request marked for analyst review.',
                  'info',
                );
                setSelected(null);
              }}
            >
              {selected && reviewed[selected.id] ? 'Remove from review' : 'Mark for review'}
            </Button>
          </>
        }
      >
        {selected ? (
          <>
            <div className="inline">
              <SeverityBadge severity={selected.severity} />
              <Badge tone="teal">{selected.responseCode}</Badge>
              <Badge tone="neutral">{selected.layer}</Badge>
              {reviewed[selected.id] ? <Badge tone="medium">Marked for review</Badge> : null}
            </div>
            <div className="meta-list">
              <div className="meta-row">
                <span>Source address</span>
                <span className="mono">
                  {selected.sourceIp} · {selected.country}
                </span>
              </div>
              <div className="meta-row">
                <span>Endpoint</span>
                <span className="mono">{selected.endpoint}</span>
              </div>
              <div className="meta-row">
                <span>Attack category</span>
                <span>{selected.attackName}</span>
              </div>
              <div className="meta-row">
                <span>Blocking reason</span>
                <span style={{ textAlign: 'right', maxWidth: 260 }}>{selected.reason}</span>
              </div>
              <div className="meta-row">
                <span>Matched rule</span>
                <span className="mono">{selected.rule}</span>
              </div>
              <div className="meta-row">
                <span>Timestamp</span>
                <span className="mono">{formatDateTime(selected.timestamp)}</span>
              </div>
            </div>
            <div className="notice">
              <Ban size={15} style={{ flex: '0 0 auto', color: 'var(--teal)' }} />
              <span>
                The request was denied before reaching the application. Mark it for review to attach it to an
                analyst's follow-up queue.
              </span>
            </div>
          </>
        ) : null}
      </Modal>
    </>
  );
}
