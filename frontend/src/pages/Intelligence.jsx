import { useMemo, useState } from 'react';
import { Globe2, Link2 } from 'lucide-react';
import { IOCS, INTEL_FEED } from '../data/mock';
import { formatDateTime, formatNumber, relativeTime } from '../lib/format';
import {
  Badge,
  Button,
  ChartCard,
  PageHeader,
  SeverityBadge,
} from '../components/ui/Primitives';
import { Drawer } from '../components/ui/Overlays';
import DataTable from '../components/ui/DataTable';

export default function Intelligence() {
  const [selected, setSelected] = useState(null);

  const exploited = INTEL_FEED.filter((item) => item.status === 'Actively exploited').length;
  const hits = useMemo(() => IOCS.reduce((sum, ioc) => sum + ioc.hits, 0), []);

  const iocColumns = [
    {
      key: 'value',
      header: 'Indicator',
      render: (row) => (
        <div className="cell-stack">
          <span className="mono" style={{ color: 'var(--text)' }}>{row.value}</span>
          <span className="record-sub">{row.type}</span>
        </div>
      ),
    },
    { key: 'type', header: 'Type' },
    { key: 'source', header: 'Source' },
    {
      key: 'tags',
      header: 'Tags',
      sortable: false,
      render: (row) => (
        <div className="tag-row">
          {row.tags.map((tag) => (
            <Badge key={tag} tone="neutral">
              {tag}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'confidence',
      header: 'Confidence',
      align: 'right',
      render: (row) => <span className="mono">{row.confidence}%</span>,
    },
    {
      key: 'hits',
      header: 'Matches',
      align: 'right',
      render: (row) => <span className="mono">{row.hits}</span>,
    },
    {
      key: 'firstSeen',
      header: 'First seen',
      align: 'right',
      render: (row) => <span className="mono" style={{ fontSize: 11.5 }}>{formatDateTime(row.firstSeen)}</span>,
      sortValue: (row) => new Date(row.firstSeen).getTime(),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Intelligence"
        title="Threat intelligence"
        description="Curated advisories and indicator matches correlated against traffic observed by Aegis."
        actions={
          <span className="inline">
            <Badge tone="critical" dot>
              {exploited} actively exploited
            </Badge>
            <Badge tone="teal" dot>
              {formatNumber(hits)} IOC matches
            </Badge>
          </span>
        }
      />

      <div className="grid grid--2-1">
        <ChartCard title="Advisory feed" subtitle="Latest intelligence affecting protected surfaces" flush>
          <ul className="list-rows" style={{ padding: '0 18px' }}>
            {INTEL_FEED.map((item) => (
              <li key={item.id} className="list-row">
                <div className="list-row__main" style={{ whiteSpace: 'normal' }}>
                  <div className="inline" style={{ gap: 7 }}>
                    <span className="mono record-sub">{item.id}</span>
                    <SeverityBadge severity={item.severity} />
                    <Badge tone={item.status === 'Actively exploited' ? 'critical' : 'neutral'}>{item.status}</Badge>
                  </div>
                  <p className="list-row__title" style={{ whiteSpace: 'normal' }}>
                    {item.title}
                  </p>
                  <p className="list-row__sub" style={{ whiteSpace: 'normal' }}>
                    {item.source} · {item.actor} · published {relativeTime(item.published)}
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelected(item)}>
                  Open
                </Button>
              </li>
            ))}
          </ul>
        </ChartCard>

        <div className="stack">
          <ChartCard title="Feed coverage" subtitle="Sources reporting into correlation">
            <div className="meta-list">
              {[
                ['Aegis Research', 'Primary adversary tracking'],
                ['Partner feed', 'Cross-vendor indicator exchange'],
                ['Vendor advisory', 'Patch and exposure notices'],
                ['Sandbox', 'Detonated payload artefacts'],
                ['DNS telemetry', 'Beacon and resolution anomalies'],
                ['Detection', 'First-party event correlation'],
              ].map(([name, description]) => (
                <div key={name} className="meta-row">
                  <span>{name}</span>
                  <span className="record-sub" style={{ textAlign: 'right' }}>
                    {description}
                  </span>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Correlation status" subtitle="Indicator matching health">
            <div className="stack stack--sm">
              <div className="stat-line">
                <span className="muted" style={{ fontSize: 12 }}>
                  Indicators tracked
                </span>
                <strong>{formatNumber(IOCS.length)}</strong>
              </div>
              <div className="stat-line">
                <span className="muted" style={{ fontSize: 12 }}>
                  Average confidence
                </span>
                <strong>{Math.round(IOCS.reduce((sum, ioc) => sum + ioc.confidence, 0) / IOCS.length)}%</strong>
              </div>
              <div className="stat-line">
                <span className="muted" style={{ fontSize: 12 }}>
                  Matched this period
                </span>
                <strong>{formatNumber(hits)}</strong>
              </div>
            </div>
            <div className="notice" style={{ marginTop: 14 }}>
              <Link2 size={15} style={{ flex: '0 0 auto', color: 'var(--teal)' }} />
              <span>Indicators are correlated on every request at the edge with sub-10ms overhead.</span>
            </div>
          </ChartCard>
        </div>
      </div>

      <ChartCard
        flush
        title="Indicators of compromise"
        subtitle="Correlated and scored against live traffic"
        actions={<Badge tone="neutral">{IOCS.length} active</Badge>}
      >
        <DataTable
          rows={IOCS}
          columns={iocColumns}
          pageSize={8}
          initialSort={{ key: 'confidence', direction: 'desc' }}
          searchPlaceholder="Search indicator, tag or source…"
          getSearchText={(row) => [row.value, row.type, row.source, ...row.tags].join(' ').toLowerCase()}
          filters={[
            {
              key: 'type',
              label: 'Type',
              options: ['IPv4', 'Domain', 'SHA-256'].map((value) => ({ value, label: value })),
            },
          ]}
          emptyTitle="No indicators match"
          emptyText="Try a broader search or clear the type filter."
          emptyIcon={Globe2}
        />
      </ChartCard>

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        subtitle={selected?.id}
        title={selected?.title ?? 'Advisory'}
        footer={
          <>
            <Button onClick={() => setSelected(null)}>Close</Button>
            <Button variant="primary" onClick={() => setSelected(null)}>
              Acknowledge advisory
            </Button>
          </>
        }
      >
        {selected ? (
          <>
            <div className="inline">
              <SeverityBadge severity={selected.severity} />
              <Badge tone="neutral">{selected.status}</Badge>
              <Badge tone="teal">{selected.source}</Badge>
            </div>
            <p style={{ fontSize: 12.5, lineHeight: 1.7, color: 'var(--text-2)' }}>{selected.summary}</p>
            <div className="meta-list">
              <div className="meta-row">
                <span>Threat actor</span>
                <span>{selected.actor}</span>
              </div>
              <div className="meta-row">
                <span>Affected</span>
                <span className="mono">{selected.affected}</span>
              </div>
              <div className="meta-row">
                <span>Published</span>
                <span className="mono">{formatDateTime(selected.published)}</span>
              </div>
            </div>
            <div className="stack stack--sm">
              <p className="section-title">Indicators</p>
              <div className="tag-row">
                {selected.indicators.map((indicator) => (
                  <span key={indicator} className="badge badge--neutral mono">
                    {indicator}
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </Drawer>
    </>
  );
}
