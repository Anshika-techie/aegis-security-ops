import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Ban, CheckCheck, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EVENTS, RANGE_MAP } from '../data/mock';
import { downloadCsv } from '../lib/csv';
import { formatDateTime, formatNumber } from '../lib/format';
import {
  Badge,
  Button,
  ChartCard,
  PageHeader,
  SeverityBadge,
  StatusBadge,
  Toggle,
} from '../components/ui/Primitives';
import { Drawer, Modal } from '../components/ui/Overlays';
import DataTable from '../components/ui/DataTable';

const RANGE_DAYS = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 };

export default function Events() {
  const { range, reviews, toggleReview, pushToast } = useApp();
  const location = useLocation();
  const [selected, setSelected] = useState(null);
  const [streamOpen, setStreamOpen] = useState(false);
  const [stream, setStream] = useState({ live: true, autoBlock: true, criticalAlerts: true });

  const rows = useMemo(() => {
    const days = RANGE_DAYS[range] ?? 30;
    const cutoff = Date.now() - days * 86400000;
    return EVENTS.filter((event) => new Date(event.timestamp).getTime() >= cutoff);
  }, [range]);

  useEffect(() => {
    const id = location.state?.search;
    if (!id) return;
    const match = EVENTS.find((event) => event.id === id);
    if (match) setSelected(match);
  }, [location.state]);

  const columns = [
    {
      key: 'id',
      header: 'Event',
      render: (row) => <span className="mono" style={{ color: 'var(--text)' }}>{row.id}</span>,
    },
    { key: 'attackName', header: 'Attack' },
    {
      key: 'sourceIp',
      header: 'Source',
      render: (row) => (
        <div className="cell-stack">
          <span className="mono" style={{ color: 'var(--text)' }}>{row.sourceIp}</span>
          <span className="record-sub">{row.sourceCountry}</span>
        </div>
      ),
    },
    {
      key: 'endpoint',
      header: 'Endpoint',
      render: (row) => <span className="mono" style={{ fontSize: 11.5 }}>{row.endpoint}</span>,
    },
    { key: 'severity', header: 'Severity', render: (row) => <SeverityBadge severity={row.severity} /> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'action',
      header: 'Action',
      render: (row) => <span className="record-sub" style={{ whiteSpace: 'nowrap' }}>{row.action}</span>,
    },
    {
      key: 'timestamp',
      header: 'Detected',
      align: 'right',
      render: (row) => <span className="mono" style={{ fontSize: 11.5 }}>{formatDateTime(row.timestamp)}</span>,
      sortValue: (row) => new Date(row.timestamp).getTime(),
    },
  ];

  const critical = rows.filter((event) => event.severity === 'Critical').length;
  const blocked = rows.filter((event) => event.status === 'Blocked').length;
  const open = rows.filter((event) => event.status === 'Detected' || event.status === 'Investigating').length;

  return (
    <>
      <PageHeader
        eyebrow="Security monitoring"
        title="Security events"
        description={`${formatNumber(rows.length)} events in ${RANGE_MAP[range]?.label?.toLowerCase() ?? 'the selected window'} across edge, API and identity layers.`}
        actions={
          <Button icon={ShieldAlert} onClick={() => setStreamOpen(true)}>
            Stream settings
          </Button>
        }
      />

      <div className="grid grid--3">
        <div className="card">
          <div className="card__body stack stack--sm">
            <p className="section-title">Critical in range</p>
            <p style={{ fontSize: 22, fontWeight: 600, color: 'var(--red)' }}>{critical}</p>
            <p className="record-sub">Requires triage before the current shift ends.</p>
          </div>
        </div>
        <div className="card">
          <div className="card__body stack stack--sm">
            <p className="section-title">Open investigations</p>
            <p style={{ fontSize: 22, fontWeight: 600 }}>{open}</p>
            <p className="record-sub">Detected or actively investigated events.</p>
          </div>
        </div>
        <div className="card">
          <div className="card__body stack stack--sm">
            <p className="section-title">Auto-contained</p>
            <p style={{ fontSize: 22, fontWeight: 600, color: 'var(--teal)' }}>{blocked}</p>
            <p className="record-sub">Blocked at the edge without analyst action.</p>
          </div>
        </div>
      </div>

      <ChartCard flush>
        <DataTable
          rows={rows}
          columns={columns}
          pageSize={10}
          initialSort={{ key: 'timestamp', direction: 'desc' }}
          searchPlaceholder="Search event ID, IP, country or endpoint…"
          getSearchText={(row) =>
            [row.id, row.attackName, row.sourceIp, row.sourceCountry, row.endpoint, row.detector]
              .join(' ')
              .toLowerCase()
          }
          filters={[
            {
              key: 'severity',
              label: 'Severity',
              options: ['Critical', 'High', 'Medium', 'Low'].map((value) => ({ value, label: value })),
            },
            {
              key: 'status',
              label: 'Status',
              options: ['Detected', 'Investigating', 'Blocked', 'Resolved'].map((value) => ({ value, label: value })),
            },
            {
              key: 'attackName',
              label: 'Attack',
              options: Array.from(new Set(EVENTS.map((event) => event.attackName))).map((value) => ({
                value,
                label: value,
              })),
            },
          ]}
          onRowClick={(row) => setSelected(row)}
          onExport={(filtered) => {
            downloadCsv(
              `aegis-security-events-${range}`,
              [
                { key: 'id', label: 'Event ID' },
                { key: 'timestamp', label: 'Detected' },
                { key: 'attackName', label: 'Attack' },
                { key: 'severity', label: 'Severity' },
                { key: 'status', label: 'Status' },
                { key: 'sourceIp', label: 'Source IP' },
                { key: 'sourceCountry', label: 'Country' },
                { key: 'endpoint', label: 'Endpoint' },
                { key: 'detector', label: 'Detector' },
              ],
              filtered,
            );
            pushToast(`Exported ${filtered.length} events to CSV.`);
          }}
          emptyTitle="No events match those filters"
          emptyText="Widen the selected range or clear the severity and status filters."
        />
      </ChartCard>

      <Modal
        open={streamOpen}
        onClose={() => setStreamOpen(false)}
        title="Event stream settings"
        subtitle="Controls apply to this demonstration session only."
        footer={
          <>
            <Button onClick={() => setStreamOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                setStreamOpen(false);
                pushToast('Event stream settings saved for this session.');
              }}
            >
              Save settings
            </Button>
          </>
        }
      >
        <Toggle
          label="Live event ingestion"
          description="Continue streaming detections into this queue as they are observed."
          checked={stream.live}
          onChange={(value) => setStream((current) => ({ ...current, live: value }))}
        />
        <Toggle
          label="Auto-block critical events"
          description="Deny critical detections at the edge without waiting for analyst review."
          checked={stream.autoBlock}
          onChange={(value) => setStream((current) => ({ ...current, autoBlock: value }))}
        />
        <Toggle
          label="Notify on critical detections"
          description="Raise an in-app notification whenever a critical event enters the queue."
          checked={stream.criticalAlerts}
          onChange={(value) => setStream((current) => ({ ...current, criticalAlerts: value }))}
        />
      </Modal>

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        subtitle={selected ? `${selected.id} · ${selected.mitre}` : ''}
        title={selected?.attackName ?? 'Event'}
        width="md"
        footer={
          <>
            <Button onClick={() => setSelected(null)}>Close</Button>
            <Button
              variant="primary"
              icon={CheckCheck}
              onClick={() => {
                if (!selected) return;
                toggleReview(selected.id, !reviews[selected.id]);
                pushToast(reviews[selected.id] ? 'Event returned to queue.' : 'Event marked reviewed and closed out.');
                setSelected(null);
              }}
            >
              {reviews[selected?.id] ? 'Reopen event' : 'Mark reviewed'}
            </Button>
          </>
        }
      >
        {selected ? (
          <>
            <div className="inline" style={{ gap: 8 }}>
              <SeverityBadge severity={selected.severity} />
              <StatusBadge status={selected.status} />
              <Badge tone="neutral">{selected.detector}</Badge>
              {reviews[selected.id] ? <Badge tone="teal">Reviewed</Badge> : null}
            </div>

            <div className="meta-list">
              <div className="meta-row">
                <span>Detected at</span>
                <span className="mono">{formatDateTime(selected.timestamp)}</span>
              </div>
              <div className="meta-row">
                <span>Source address</span>
                <span className="mono">
                  {selected.sourceIp} · {selected.sourceCountry}
                </span>
              </div>
              <div className="meta-row">
                <span>Target endpoint</span>
                <span className="mono">
                  {selected.method} {selected.endpoint}
                </span>
              </div>
              <div className="meta-row">
                <span>Matched rule</span>
                <span className="mono">{selected.rule}</span>
              </div>
              <div className="meta-row">
                <span>Confidence</span>
                <span className="mono">{selected.confidence}%</span>
              </div>
              <div className="meta-row">
                <span>Response</span>
                <span className="mono">
                  HTTP {selected.responseCode} · {formatNumber(selected.bytes)} bytes
                </span>
              </div>
              <div className="meta-row">
                <span>User agent</span>
                <span className="mono" style={{ fontSize: 11 }}>
                  {selected.userAgent}
                </span>
              </div>
            </div>

            <div className="stack stack--sm">
              <p className="section-title">Analysis</p>
              <p style={{ fontSize: 12.5, lineHeight: 1.65, color: 'var(--text-2)' }}>{selected.description}</p>
            </div>

            <div className="notice">
              <Ban size={15} style={{ flex: '0 0 auto', color: 'var(--teal)' }} />
              <span>{selected.mitigation}</span>
            </div>
          </>
        ) : null}
      </Drawer>
    </>
  );
}
